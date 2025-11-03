'''
Business: Генерация email-контента по рецептам контент-типов на основе базы знаний
Args: event - dict с httpMethod, body (template_id, content_type_id, event_id)
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с сгенерированным HTML и темой письма
'''
import json
import os
import re
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
import openai
import httpx

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def generate_content_by_recipe(
    template_html: str,
    variables: List[Dict],
    knowledge: List[Dict],
    recipe: Dict,
    event_name: str
) -> Dict[str, str]:
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
        f"[{item['title']}]\n{item['content']}"
        for item in knowledge
    ])
    
    variables_list = '\n'.join([
        f"- {var['name']}: {var.get('type', 'text')}"
        for var in variables
    ])
    
    tone = recipe.get('tone', 'нейтральный')
    focus = recipe.get('focus', 'общая информация')
    cta = recipe.get('cta', 'узнать больше')
    
    system_prompt = f"""Ты — копирайтер email-маркетинга. Создай контент для письма по заданному рецепту.

СОБЫТИЕ: {event_name}

РЕЦЕПТ КОНТЕНТА:
- Тон: {tone}
- Фокус: {focus}
- CTA: {cta}

БАЗА ЗНАНИЙ:
{knowledge_text}

ПЕРЕМЕННЫЕ ДЛЯ ЗАПОЛНЕНИЯ:
{variables_list}

ПРАВИЛА:
1. Используй ТОЛЬКО информацию из базы знаний
2. Соблюдай заданный тон и фокус
3. Пиши коротко, ёмко, без воды
4. CTA должен быть чётким и конкретным
5. Заполни ВСЕ переменные релевантным контентом
6. Возвращай ТОЛЬКО JSON с переменными и темой письма

Пример ответа:
{{
  "subject": "Увеличьте продажи на 40% — вебинар 15 мая",
  "variables": {{
    "headline": "Вебинар: Как увеличить продажи в 2 раза",
    "speaker_name": "Иван Петров",
    "cta_button": "Зарегистрироваться сейчас"
  }}
}}
"""

    variable_names = [v['name'] for v in variables]
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Создай контент с фокусом на: {focus}"}
        ],
        temperature=0.7,
        response_format={"type": "json_object"}
    )
    
    result = json.loads(response.choices[0].message.content)
    
    return {
        'subject': result.get('subject', 'Новое письмо'),
        'variables': result.get('variables', {})
    }

def fill_template(template: str, variables_data: Dict[str, str]) -> str:
    result = template
    for key, value in variables_data.items():
        pattern = r'\{\{' + key + r'\}\}'
        result = re.sub(pattern, str(value), result)
    return result

def validate_email(html: str, subject: str) -> Dict[str, Any]:
    validation = {
        'is_valid': True,
        'warnings': [],
        'errors': []
    }
    
    if len(subject) < 10:
        validation['warnings'].append('Тема письма слишком короткая (менее 10 символов)')
    if len(subject) > 70:
        validation['warnings'].append('Тема письма слишком длинная (более 70 символов)')
    
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
        variables = template.get('variables') if template.get('variables') else []
        recipe_raw = content_type.get('recipe', '{}')
        recipe = recipe_raw if isinstance(recipe_raw, dict) else json.loads(recipe_raw) if recipe_raw else {}
        
        generated = generate_content_by_recipe(
            template_html,
            variables,
            knowledge,
            recipe,
            event_row['name']
        )
        
        filled_html = fill_template(template_html, generated['variables'])
        
        validation = validate_email(filled_html, generated['subject'])
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'subject': generated['subject'],
                'html_content': filled_html,
                'variables_used': generated['variables'],
                'validation': validation
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Internal server error',
                'details': str(e)
            }),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()