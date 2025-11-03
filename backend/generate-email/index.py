'''
Business: Генерация email-контента с маппингами и трансформациями данных
Args: event - dict с httpMethod, body (template_id, content_type_id, event_id, content_plan)
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с сгенерированным HTML и темой письма
'''
import json
import os
import re
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import openai
import httpx

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

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
                    <div style="font-weight: bold; margin: 4px 0 4px 0;">{speaker.get('topic', speaker.get('name', ''))}</div>
                    {speaker.get('description', '')}
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

def apply_mappings(
    mappings: List[Dict],
    event: Dict,
    content_plan: Dict,
    knowledge: List[Dict]
) -> Dict[str, str]:
    result = {}
    
    for mapping in mappings:
        var_name = mapping.get('variable')
        source = mapping.get('source')
        
        if source == 'static':
            result[var_name] = mapping.get('value', '')
        elif source.startswith('Event.'):
            path = source.replace('Event.', '')
            value = get_nested_value(event, path)
            
            if 'transform' in mapping:
                value = apply_transform(mapping['transform'], value, event, content_plan, knowledge)
            
            result[var_name] = str(value) if value is not None else ''
        elif source.startswith('ContentPlan.'):
            path = source.replace('ContentPlan.', '')
            value = get_nested_value(content_plan, path)
            
            if 'transform' in mapping:
                value = apply_transform(mapping['transform'], value, event, content_plan, knowledge)
            
            result[var_name] = str(value) if value is not None else ''
    
    return result

def generate_missing_variables(
    unfilled_vars: List[str],
    knowledge: List[Dict],
    recipe: Dict,
    event_name: str
) -> Dict[str, str]:
    if not unfilled_vars:
        return {}
    
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
    
    tone = recipe.get('tone', 'нейтральный')
    focus = recipe.get('focus', 'общая информация')
    
    system_prompt = f"""Ты — копирайтер email-маркетинга.

СОБЫТИЕ: {event_name}

РЕЦЕПТ:
- Тон: {tone}
- Фокус: {focus}

БАЗА ЗНАНИЙ:
{knowledge_text}

Заполни только эти переменные: {', '.join(unfilled_vars)}

Правила:
1. Используй ТОЛЬКО информацию из базы знаний
2. Соблюдай тон и фокус
3. Пиши коротко, ёмко
4. Возвращай ТОЛЬКО JSON

Формат ответа:
{{
  "subject": "тема письма (до 55 символов)",
  "preheader": "прехедер (35-70 символов)",
  "variables": {{
    "var_name": "значение"
  }}
}}"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Создай контент для переменных: {', '.join(unfilled_vars)}"}
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

def validate_email(html: str, subject: str, preheader: str) -> Dict[str, Any]:
    validation = {
        'is_valid': True,
        'warnings': [],
        'errors': []
    }
    
    if len(subject) < 10:
        validation['warnings'].append('Тема письма слишком короткая (менее 10 символов)')
    if len(subject) > 70:
        validation['warnings'].append('Тема письма слишком длинная (более 70 символов)')
    
    if preheader:
        if len(preheader) < 35:
            validation['warnings'].append('Прехедер короткий (менее 35 символов)')
        if len(preheader) > 90:
            validation['warnings'].append('Прехедер длинный (более 90 символов)')
    
    if '{{' in html:
        unfilled_vars = re.findall(r'\{\{([^}]+)\}\}', html)
        validation['errors'].append(f'Незаполненные переменные: {", ".join(unfilled_vars)}')
        validation['is_valid'] = False
    
    cta_patterns = [r'<a[^>]+href', r'<button']
    has_cta = any(re.search(pattern, html, re.IGNORECASE) for pattern in cta_patterns)
    if not has_cta:
        validation['warnings'].append('В письме не найден CTA (кнопка или ссылка)')
    
    if len(html) < 100:
        validation['errors'].append('Слишком короткий контент письма')
        validation['is_valid'] = False
    
    return validation

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
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        template_id = body_data.get('template_id')
        content_type_id = body_data.get('content_type_id')
        event_id = body_data.get('event_id')
        content_plan = body_data.get('content_plan', {})
        mappings = body_data.get('mappings', [])
        
        if not all([template_id, content_type_id, event_id]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'template_id, content_type_id, event_id are required'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT * FROM email_templates WHERE id = %s", (template_id,))
        template = cur.fetchone()
        
        if not template:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Template not found'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT * FROM content_types WHERE id = %s", (content_type_id,))
        content_type = cur.fetchone()
        
        if not content_type:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Content type not found'}),
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
        recipe_raw = content_type.get('recipe', '{}')
        recipe = recipe_raw if isinstance(recipe_raw, dict) else json.loads(recipe_raw) if recipe_raw else {}
        
        event_dict = dict(event_row)
        
        filled_vars = apply_mappings(mappings, event_dict, content_plan, knowledge)
        
        partial_html = fill_template(template_html, filled_vars)
        
        unfilled_vars = get_unfilled_variables(partial_html)
        
        generated = {}
        if unfilled_vars:
            generated = generate_missing_variables(
                unfilled_vars,
                knowledge,
                recipe,
                event_dict.get('name', 'Событие')
            )
        
        final_vars = {**filled_vars, **generated.get('variables', {})}
        final_html = fill_template(template_html, final_vars)
        
        subject = generated.get('subject', content_plan.get('topic', 'Новое письмо'))
        preheader = generated.get('preheader', '')
        
        validation = validate_email(final_html, subject, preheader)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'subject': subject,
                'preheader': preheader,
                'html_content': final_html,
                'variables_from_mappings': filled_vars,
                'variables_from_gpt': generated.get('variables', {}),
                'validation': validation
            }),
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
        cur.close()
        conn.close()
