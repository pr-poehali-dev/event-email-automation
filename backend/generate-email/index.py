'''
Business: Strict JSON I/O contract для детерминированной генерации email
Args: event - dict с httpMethod, body (валидируется против JSON Schema)
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с типизированным выходом + mapping_log
'''
import json
import os
import re
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import openai
import httpx
from jsonschema import validate, ValidationError as JSONValidationError

RECIPE_VERSION = "1.0.0"
TRANSFORM_VERSION = "1.0.0"

INPUT_SCHEMA = {
    "$id": "generate-email-input",
    "type": "object",
    "required": ["template_id", "event_id", "content_type_code", "mappings"],
    "properties": {
        "template_id": {"type": "integer"},
        "event_id": {"type": "integer"},
        "content_type_code": {"type": "string", "enum": ["announce", "sale", "pain_sale"]},
        "content_plan": {
            "type": "object",
            "required": ["topic"],
            "properties": {"topic": {"type": "string"}}
        },
        "pain": {
            "type": "object",
            "properties": {
                "segment": {"type": "string"},
                "pains": {"type": "array", "items": {"type": "string"}},
                "triggers": {"type": "array", "items": {"type": "string"}}
            }
        },
        "mappings": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["variable", "source"],
                "properties": {
                    "variable": {"type": "string"},
                    "source": {"type": "string"},
                    "transform": {"type": "string"},
                    "value": {"type": ["string", "object", "array", "null"]}
                }
            }
        },
        "recipe_version": {"type": "string"},
        "transform_version": {"type": "string"}
    },
    "additionalProperties": False
}

OUTPUT_SCHEMA = {
    "$id": "generate-email-output",
    "type": "object",
    "required": ["subject", "preheader", "html_content", "content_validation", "html_validation", "recipe_used"],
    "properties": {
        "subject": {"type": "string", "maxLength": 55},
        "preheader": {"type": "string", "minLength": 35, "maxLength": 70},
        "fields": {
            "type": "object",
            "properties": {
                "headline": {"type": "string"},
                "intro": {"type": "string"},
                "offer": {"type": "string"},
                "speakers_block": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "role": {"type": "string"},
                            "thesis": {"type": "string"}
                        }
                    }
                },
                "cta_text": {"type": "string"},
                "cta_url": {"type": "string"},
                "cta_text_2": {"type": "string"},
                "cta_url_2": {"type": "string"}
            },
            "additionalProperties": True
        },
        "html_content": {"type": "string"},
        "content_validation": {
            "type": "object",
            "required": ["status", "errors"],
            "properties": {
                "status": {"type": "string", "enum": ["OK", "ERROR"]},
                "errors": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "field": {"type": "string"},
                            "issue": {"type": "string"}
                        }
                    }
                }
            }
        },
        "html_validation": {
            "type": "object",
            "required": ["is_valid", "warnings"],
            "properties": {
                "is_valid": {"type": "boolean"},
                "warnings": {"type": "array", "items": {"type": "string"}}
            }
        },
        "mapping_log": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "variable": {"type": "string"},
                    "source": {"type": "string"},
                    "transform": {"type": "string"},
                    "result_preview": {"type": "string"}
                }
            }
        },
        "recipe_used": {"type": "string"}
    },
    "additionalProperties": False
}

RECIPES = {
    "announce": {
        "tone": "информативный, лаконичный, без давления",
        "limits": {"subjectMax": 55, "preheaderMin": 35, "preheaderMax": 70},
        "must": ["чёткая выгода", "дата/место или формат", "1 CTA"],
        "min_fields": ["headline", "intro", "cta_text", "cta_url"]
    },
    "sale": {
        "tone": "деловой, ориентированный на выгоду",
        "limits": {"subjectMax": 55, "preheaderMin": 35, "preheaderMax": 70},
        "must": ["оффер с дедлайном", "соцдоказательство", "1 CTA"],
        "min_fields": ["headline", "intro", "offer", "cta_text", "cta_url"]
    },
    "pain_sale": {
        "tone": "эмпатичный, конкретный, без перегиба",
        "limits": {"subjectMax": 55, "preheaderMin": 35, "preheaderMax": 70},
        "must": ["одна ключевая боль", "решение через ивент", "дедлайн", "1 CTA"],
        "min_fields": ["headline", "intro", "offer", "cta_text", "cta_url"]
    }
}

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def compute_inputs_hash(data: Dict) -> str:
    content = json.dumps(data, sort_keys=True)
    return hashlib.sha256(content.encode()).hexdigest()[:16]

def preview_value(value: Any, max_len: int = 80) -> str:
    str_val = str(value)
    if len(str_val) > max_len:
        return str_val[:max_len] + '...'
    return str_val

def get_nested_value(obj: Dict, path: str) -> Any:
    keys = path.split('.')
    value = obj
    for key in keys:
        if isinstance(value, dict):
            value = value.get(key)
        else:
            return None
        if value is None:
            return None
    return value

def render_speakers_cards(speakers: List[Dict]) -> str:
    if not speakers:
        return ''
    
    cards = []
    for i, speaker in enumerate(speakers):
        bgcolor = ' bgcolor="#FFF9F2"' if i % 2 == 0 else ''
        thesis = speaker.get('thesis', speaker.get('description', ''))
        card_html = f'''
          <tr{bgcolor}>
            <td style="padding: 20px 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="top" width="60">
                    <img src="{speaker.get('photo', 'https://via.placeholder.com/48')}" alt="{speaker.get('name', 'Спикер')}" width="48" style="border-radius: 100%;">
                  </td>
                  <td style="padding-left: 15px; font-size: 16px; color: #333333;">
                    <div style="font-size: 14px; color: #999999;">{speaker.get('role', 'Спикер')}</div>
                    <div style="font-weight: bold; margin: 4px 0 4px 0;">{speaker.get('topic', thesis)}</div>
                    {thesis}
                  </td>
                </tr>
              </table>
            </td>
          </tr>'''
        cards.append(card_html)
    
    return '\n'.join(cards)

def render_agenda_ul(agenda: List[Dict]) -> str:
    if not agenda:
        return ''
    
    items = []
    for item in agenda:
        time = item.get('time', '')
        title = item.get('title', '')
        items.append(f'<li><strong>{time}</strong> — {title}</li>')
    
    return f'<ul style="line-height: 1.8;">{"".join(items)}</ul>'

def short_intro(event: Dict, content_plan: Dict, knowledge: List[Dict]) -> str:
    proxy_url = os.environ.get('OPENAI_PROXY_URL', '').strip()
    
    if proxy_url:
        http_client = httpx.Client(
            proxies={
                'http://': proxy_url,
                'https://': proxy_url
            }
        )
        client = openai.OpenAI(
            api_key=os.environ['OPENAI_API_KEY'],
            http_client=http_client
        )
    else:
        client = openai.OpenAI(api_key=os.environ['OPENAI_API_KEY'])
    
    knowledge_text = '\n\n'.join([
        f"[{item.get('title', '')}]\n{item.get('content', '')}"
        for item in knowledge
    ])
    
    topic = content_plan.get('topic', '')
    event_name = event.get('name', '')
    
    prompt = f"""Событие: {event_name}
Тема письма: {topic}

База знаний:
{knowledge_text}

Напиши короткое вступление для email-письма (2-3 предложения). Вступление должно:
- Зацепить читателя проблемой или фактом
- Подвести к теме письма
- Быть живым и конкретным

Верни ТОЛЬКО текст вступления без дополнительных комментариев."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )
    
    return response.choices[0].message.content.strip()

def apply_transform(transform_name: str, value: Any, event: Dict, content_plan: Dict, knowledge: List[Dict]) -> Any:
    if transform_name == 'render_speakers_cards':
        return render_speakers_cards(value if isinstance(value, list) else [])
    elif transform_name == 'render_agenda_ul':
        return render_agenda_ul(value if isinstance(value, list) else [])
    elif transform_name.startswith('short_intro'):
        return short_intro(event, content_plan, knowledge)
    return str(value)

def source_router(source: str, event: Dict, content_plan: Dict, pain: Optional[Dict]) -> Any:
    if source == 'static':
        return None
    elif source.startswith('Event.'):
        path = source.replace('Event.', '')
        return get_nested_value(event, path)
    elif source.startswith('ContentPlan.'):
        path = source.replace('ContentPlan.', '')
        return get_nested_value(content_plan, path)
    elif source.startswith('Pain.') and pain:
        path = source.replace('Pain.', '')
        return get_nested_value(pain, path)
    return None

def apply_mappings(
    mappings: List[Dict],
    event: Dict,
    content_plan: Dict,
    pain: Optional[Dict],
    knowledge: List[Dict]
) -> tuple[Dict[str, str], List[Dict]]:
    result = {}
    mapping_log = []
    
    for mapping in mappings:
        var_name = mapping.get('variable')
        source = mapping.get('source')
        transform = mapping.get('transform')
        static_value = mapping.get('value')
        
        if source == 'static':
            value = static_value
        else:
            value = source_router(source, event, content_plan, pain)
        
        if transform:
            value = apply_transform(transform, value, event, content_plan, knowledge)
        
        result[var_name] = value if value is not None else ''
        
        mapping_log.append({
            'variable': var_name,
            'source': source,
            'transform': transform or '',
            'result_preview': preview_value(value)
        })
    
    return result, mapping_log

def validate_content(content: Dict[str, Any], recipe: Dict, required_vars: List[str]) -> Dict[str, Any]:
    errors = []
    limits = recipe.get('limits', {})
    
    subject = content.get('subject', '')
    if len(subject) > limits.get('subjectMax', 55):
        errors.append({"field": "subject", "issue": "too_long", "max": limits.get('subjectMax', 55), "current": len(subject)})
    if len(subject) < 10:
        errors.append({"field": "subject", "issue": "too_short", "min": 10, "current": len(subject)})
    
    preheader = content.get('preheader', '')
    if preheader:
        if len(preheader) < limits.get('preheaderMin', 35):
            errors.append({"field": "preheader", "issue": "too_short", "min": limits.get('preheaderMin', 35), "current": len(preheader)})
        if len(preheader) > limits.get('preheaderMax', 70):
            errors.append({"field": "preheader", "issue": "too_long", "max": limits.get('preheaderMax', 70), "current": len(preheader)})
    
    for field in recipe.get('min_fields', []):
        if not content.get(field):
            errors.append({"field": field, "issue": "missing"})
    
    for var in required_vars:
        if not content.get(var):
            errors.append({"field": var, "issue": "required_variable_not_filled"})
    
    cta_count = sum(1 for k in content.keys() if 'cta_url' in k and content[k])
    if cta_count == 0:
        errors.append({"field": "cta", "issue": "no_cta_found"})
    
    return {
        "status": "OK" if not errors else "ERROR",
        "errors": errors
    }

def validate_html(html: str) -> Dict[str, Any]:
    warnings = []
    
    unfilled = re.findall(r'\{\{([^}]+)\}\}', html)
    if unfilled:
        warnings.append(f'Незаполненные переменные: {", ".join(unfilled)}')
    
    empty_hrefs = re.findall(r'<a[^>]+href="#"[^>]*>(?!.*unsubscribe)', html, re.IGNORECASE)
    if empty_hrefs:
        warnings.append(f'Найдено {len(empty_hrefs)} пустых href="#" (не unsubscribe)')
    
    if len(html) < 100:
        warnings.append('HTML слишком короткий (менее 100 символов)')
    
    cta_patterns = [r'<a[^>]+href="http', r'<button']
    has_valid_cta = any(re.search(pattern, html, re.IGNORECASE) for pattern in cta_patterns)
    if not has_valid_cta:
        warnings.append('Не найдено валидных CTA (ссылки или кнопки)')
    
    return {
        "is_valid": len(warnings) == 0,
        "warnings": warnings
    }

def generate_missing_fields(
    missing_fields: List[str],
    knowledge: List[Dict],
    recipe: Dict,
    event: Dict,
    content_plan: Dict,
    pain: Optional[Dict] = None
) -> Dict[str, Any]:
    if not missing_fields:
        return {"subject": content_plan.get('topic', 'Новое письмо'), "preheader": "", "fields": {}}
    
    proxy_url = os.environ.get('OPENAI_PROXY_URL', '').strip()
    
    if proxy_url:
        http_client = httpx.Client(
            proxies={
                'http://': proxy_url,
                'https://': proxy_url
            }
        )
        client = openai.OpenAI(
            api_key=os.environ['OPENAI_API_KEY'],
            http_client=http_client
        )
    else:
        client = openai.OpenAI(api_key=os.environ['OPENAI_API_KEY'])
    
    knowledge_text = '\n\n'.join([
        f"[{item.get('title', '')}]\n{item.get('content', '')}"
        for item in knowledge
    ])
    
    event_name = event.get('name', 'Событие')
    topic = content_plan.get('topic', '')
    tone = recipe.get('tone', 'нейтральный')
    must_have = recipe.get('must', [])
    limits = recipe.get('limits', {})
    
    pain_context = ""
    if pain:
        segment = pain.get('segment', '')
        pains_list = pain.get('pains', [])
        triggers_list = pain.get('triggers', [])
        pain_context = f"""

БОЛИ СЕГМЕНТА "{segment}":
{chr(10).join([f'- {p}' for p in pains_list])}

ТРИГГЕРЫ:
{chr(10).join([f'- {t}' for t in triggers_list])}
"""
    
    system_prompt = f"""Ты — копирайтер email-маркетинга.

СОБЫТИЕ: {event_name}
ТЕМА ПИСЬМА: {topic}

РЕЦЕПТ:
- Тон: {tone}
- Обязательно: {', '.join(must_have)}
- Лимиты: subject ≤{limits.get('subjectMax', 55)}, preheader {limits.get('preheaderMin', 35)}-{limits.get('preheaderMax', 70)}
{pain_context}
БАЗА ЗНАНИЙ:
{knowledge_text}

Заполни ТОЛЬКО эти поля: {', '.join(missing_fields)}

Правила:
1. Используй ТОЛЬКО информацию из базы знаний
2. Соблюдай тон: {tone}
3. Включи всё из must: {', '.join(must_have)}
4. Строго соблюдай лимиты символов
5. Если есть боли — начни с них
6. Возвращай ТОЛЬКО валидный JSON

Формат:
{{
  "subject": "до {limits.get('subjectMax', 55)} символов",
  "preheader": "{limits.get('preheaderMin', 35)}-{limits.get('preheaderMax', 70)} символов",
  "fields": {{
    "headline": "...",
    "intro": "...",
    "speakers_block": [{{"name":"...","role":"...","thesis":"..."}}]
  }}
}}"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Создай контент для: {', '.join(missing_fields)}"}
        ],
        temperature=0.7,
        response_format={"type": "json_object"}
    )
    
    result = json.loads(response.choices[0].message.content)
    
    return result

def fill_template(template: str, variables_data: Dict[str, str]) -> str:
    result = template
    for key, value in variables_data.items():
        pattern = r'\{\{' + re.escape(key) + r'\}\}'
        result = re.sub(pattern, str(value), result)
    return result

def get_unfilled_variables(html: str) -> List[str]:
    return re.findall(r'\{\{([^}]+)\}\}', html)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        try:
            validate(instance=body_data, schema=INPUT_SCHEMA)
        except JSONValidationError as e:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Input validation failed: {e.message}'}),
                'isBase64Encoded': False
            }
        
        template_id = body_data.get('template_id')
        event_id = body_data.get('event_id')
        content_type_code = body_data.get('content_type_code', 'announce')
        content_plan = body_data.get('content_plan', {})
        pain = body_data.get('pain')
        mappings = body_data.get('mappings', [])
        
        recipe = RECIPES.get(content_type_code, RECIPES['announce'])
        inputs_hash = compute_inputs_hash(body_data)
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM email_templates WHERE id = %s", (template_id,))
        template = cur.fetchone()
        
        if not template:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Template not found'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT * FROM events WHERE id = %s", (event_id,))
        event_row = cur.fetchone()
        
        if not event_row:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Event not found'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT * FROM knowledge_base WHERE event_id = %s", (event_id,))
        knowledge = cur.fetchall()
        
        template_html = template['html_content']
        event_dict = dict(event_row)
        
        all_required_vars = get_unfilled_variables(template_html)
        
        filled_vars, mapping_log = apply_mappings(mappings, event_dict, content_plan, pain, knowledge)
        
        partial_html = fill_template(template_html, filled_vars)
        unfilled_vars = get_unfilled_variables(partial_html)
        
        missing_fields = [v for v in unfilled_vars if v not in filled_vars]
        
        generated = {}
        if missing_fields:
            generated = generate_missing_fields(
                missing_fields,
                knowledge,
                recipe,
                event_dict,
                content_plan,
                pain
            )
        
        all_fields = {**filled_vars, **generated.get('fields', {})}
        
        if 'speakers_block' in all_fields and isinstance(all_fields['speakers_block'], list):
            all_fields['speakers_block'] = render_speakers_cards(all_fields['speakers_block'])
        
        final_html = fill_template(template_html, all_fields)
        
        if not all_fields.get('speakers_block'):
            final_html = re.sub(
                r'<!-- Спикеры -->.*?<!-- CTA -->',
                '<!-- CTA -->',
                final_html,
                flags=re.DOTALL
            )
        
        subject = generated.get('subject', content_plan.get('topic', 'Новое письмо'))
        preheader = generated.get('preheader', '')
        
        all_content = {
            'subject': subject,
            'preheader': preheader,
            **all_fields
        }
        
        content_validation = validate_content(all_content, recipe, all_required_vars)
        html_validation = validate_html(final_html)
        
        output = {
            'subject': subject,
            'preheader': preheader,
            'fields': all_fields,
            'html_content': final_html,
            'content_validation': content_validation,
            'html_validation': html_validation,
            'mapping_log': mapping_log,
            'recipe_used': content_type_code,
            'recipe_version': RECIPE_VERSION,
            'transform_version': TRANSFORM_VERSION,
            'inputs_hash': inputs_hash
        }
        
        try:
            validate(instance=output, schema=OUTPUT_SCHEMA)
        except JSONValidationError as e:
            output['output_schema_warning'] = f'Output validation failed: {e.message}'
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(output),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
