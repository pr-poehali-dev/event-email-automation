'''
Business: AI-генерация персонализированных email на основе шаблонов и базы знаний
Args: event - dict с httpMethod, body (template_id)
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с сгенерированным HTML контентом
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

def extract_variables(template: str) -> List[str]:
    pattern = r'\{\{([a-zA-Z0-9_]+)\}\}'
    variables = re.findall(pattern, template)
    return list(set(variables))

def generate_content_with_ai(variables: List[str], knowledge_data: List[Dict], event_name: str, subject_template: str) -> Dict[str, str]:
    knowledge_text = "\n\n".join([
        f"[{item['content_type']}] {item['title']}:\n{item['content']}"
        for item in knowledge_data
    ])
    
    system_prompt = f"""Ты — эксперт по email-маркетингу. Твоя задача заполнить переменные в шаблоне письма.

СОБЫТИЕ: {event_name}

БАЗА ЗНАНИЙ:
{knowledge_text}

ПЕРЕМЕННЫЕ для заполнения: {', '.join(variables)}

Тема письма: {subject_template}

ПРАВИЛА:
1. Используй ТОЛЬКО информацию из базы знаний выше
2. Пиши коротко, ёмко, по делу — email должен быть легко читаемым
3. Текст должен быть продающим и вовлекающим
4. Если в базе нет инфы для переменной — придумай логичное значение на основе контекста
5. Возвращай ТОЛЬКО JSON с переменными, без дополнительных объяснений

Пример ответа:
{{
  "event_name": "Вебинар по продажам",
  "event_date": "15 мая в 19:00",
  "speaker_name": "Иван Петров"
}}
"""

    proxy_url = os.environ.get('OPENAI_PROXY_URL', '').strip()
    
    if proxy_url:
        # Формат: http://user:pass@host:port или просто http://host:port
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
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Заполни эти переменные: {', '.join(variables)}"}
        ],
        temperature=0.7,
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)

def fill_template(template: str, variables_data: Dict[str, str]) -> str:
    result = template
    for key, value in variables_data.items():
        pattern = r'\{\{' + key + r'\}\}'
        result = re.sub(pattern, value, result)
    return result

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
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
        
        if not template_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'template_id is required'}),
                'isBase64Encoded': False
            }
        
        cur.execute("""
            SELECT t.*, e.name as event_name, e.id as event_id
            FROM email_templates t
            JOIN events e ON e.id = t.event_id
            WHERE t.id = %s
        """, (template_id,))
        
        template = cur.fetchone()
        
        if not template:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Template not found'}),
                'isBase64Encoded': False
            }
        
        html_template = template['html_content']
        subject_template = template['subject_template']
        event_id = template['event_id']
        event_name = template['event_name']
        
        variables_in_html = extract_variables(html_template)
        variables_in_subject = extract_variables(subject_template)
        all_variables = list(set(variables_in_html + variables_in_subject))
        
        cur.execute("""
            SELECT content_type, title, content, source
            FROM knowledge_base
            WHERE event_id = %s
            ORDER BY created_at DESC
        """, (event_id,))
        
        knowledge_data = [dict(row) for row in cur.fetchall()]
        
        if not knowledge_data:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'No knowledge base data found for this event',
                    'hint': 'Add content to knowledge base first'
                }),
                'isBase64Encoded': False
            }
        
        variables_data = generate_content_with_ai(
            all_variables, 
            knowledge_data, 
            event_name,
            subject_template
        )
        
        final_html = fill_template(html_template, variables_data)
        final_subject = fill_template(subject_template, variables_data)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'html_content': final_html,
                'subject': final_subject,
                'variables_used': variables_data,
                'template_id': template_id,
                'event_name': event_name
            }),
            'isBase64Encoded': False
        }
        
    except openai.APIError as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'OpenAI API error',
                'details': str(e)
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