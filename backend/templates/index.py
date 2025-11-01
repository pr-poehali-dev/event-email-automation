'''
Business: API для управления email-шаблонами и типами контента
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с шаблонами или результатом операции
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {})
            event_id = query_params.get('event_id')
            template_id = event.get('pathParams', {}).get('id')
            
            if template_id:
                cur.execute("""
                    SELECT t.*, 
                           ct.name as content_type_name,
                           ct.description as content_type_description,
                           e.name as event_name,
                           COALESCE(json_agg(
                               json_build_object(
                                   'id', cs.id,
                                   'slot_name', cs.slot_name,
                                   'slot_type', cs.slot_type,
                                   'default_content', cs.default_content,
                                   'is_required', cs.is_required,
                                   'display_order', cs.display_order
                               ) ORDER BY cs.display_order
                           ) FILTER (WHERE cs.id IS NOT NULL), '[]') as slots
                    FROM email_templates t
                    LEFT JOIN content_slots cs ON cs.template_id = t.id
                    LEFT JOIN content_types ct ON ct.id = t.content_type_id
                    LEFT JOIN events e ON e.id = t.event_id
                    WHERE t.id = %s
                    GROUP BY t.id, ct.name, ct.description, e.name
                """, (template_id,))
                result = cur.fetchone()
                
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Template not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(result), default=str),
                    'isBase64Encoded': False
                }
            else:
                query = """
                    SELECT t.*,
                           ct.name as content_type_name,
                           e.name as event_name,
                           COALESCE(json_agg(
                               json_build_object(
                                   'id', cs.id,
                                   'slot_name', cs.slot_name,
                                   'slot_type', cs.slot_type,
                                   'is_required', cs.is_required
                               ) ORDER BY cs.display_order
                           ) FILTER (WHERE cs.id IS NOT NULL), '[]') as slots
                    FROM email_templates t
                    LEFT JOIN content_slots cs ON cs.template_id = t.id
                    LEFT JOIN content_types ct ON ct.id = t.content_type_id
                    LEFT JOIN events e ON e.id = t.event_id
                """
                
                if event_id:
                    query += " WHERE t.event_id = %s"
                    query += " GROUP BY t.id, ct.name, e.name ORDER BY t.created_at DESC"
                    cur.execute(query, (event_id,))
                else:
                    query += " GROUP BY t.id, ct.name, e.name ORDER BY t.created_at DESC"
                    cur.execute(query)
                
                results = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(row) for row in results], default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cur.execute("""
                INSERT INTO email_templates 
                (event_id, name, type, html_content, subject_template, 
                 cta_text, cta_color, unisender_list_id, content_type_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, event_id, name, type, subject_template, 
                          cta_text, cta_color, content_type_id, created_at
            """, (
                body_data.get('event_id'),
                body_data.get('name'),
                body_data.get('type'),
                body_data.get('html_content'),
                body_data.get('subject_template'),
                body_data.get('cta_text'),
                body_data.get('cta_color', '#BB35E0'),
                body_data.get('unisender_list_id'),
                body_data.get('content_type_id')
            ))
            
            result = cur.fetchone()
            template_id = result['id']
            
            slots = body_data.get('slots', [])
            for idx, slot in enumerate(slots):
                cur.execute("""
                    INSERT INTO content_slots 
                    (template_id, slot_name, slot_type, default_content, 
                     is_required, display_order)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    template_id,
                    slot.get('slot_name'),
                    slot.get('slot_type'),
                    slot.get('default_content'),
                    slot.get('is_required', False),
                    idx
                ))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(result), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            template_id = event.get('pathParams', {}).get('id')
            body_data = json.loads(event.get('body', '{}'))
            
            if not template_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Template ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                UPDATE email_templates 
                SET name = COALESCE(%s, name),
                    type = COALESCE(%s, type),
                    html_content = COALESCE(%s, html_content),
                    subject_template = COALESCE(%s, subject_template),
                    cta_text = COALESCE(%s, cta_text),
                    cta_color = COALESCE(%s, cta_color),
                    unisender_list_id = COALESCE(%s, unisender_list_id),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, name, type, updated_at
            """, (
                body_data.get('name'),
                body_data.get('type'),
                body_data.get('html_content'),
                body_data.get('subject_template'),
                body_data.get('cta_text'),
                body_data.get('cta_color'),
                body_data.get('unisender_list_id'),
                template_id
            ))
            
            result = cur.fetchone()
            conn.commit()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Template not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(result), default=str),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    finally:
        cur.close()
        conn.close()