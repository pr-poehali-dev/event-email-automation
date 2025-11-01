'''
Business: API для управления событиями и их данными
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с событиями или результатом операции
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('pathParams', {})
            event_id = params.get('id')
            
            if event_id:
                cur.execute("""
                    SELECT id, name, description, status, next_send_date, 
                           subscribers_count, open_rate, click_rate,
                           google_sheets_url, google_docs_url,
                           created_at, updated_at
                    FROM events WHERE id = %s
                """, (event_id,))
                result = cur.fetchone()
                
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Event not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(result), default=str),
                    'isBase64Encoded': False
                }
            else:
                cur.execute("""
                    SELECT id, name, description, status, next_send_date, 
                           subscribers_count, open_rate, click_rate,
                           google_sheets_url, google_docs_url,
                           created_at, updated_at
                    FROM events ORDER BY created_at DESC
                """)
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
                INSERT INTO events 
                (name, description, status, next_send_date, subscribers_count, 
                 google_sheets_url, google_docs_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, name, description, status, next_send_date, 
                          subscribers_count, open_rate, click_rate, created_at
            """, (
                body_data.get('name'),
                body_data.get('description'),
                body_data.get('status', 'draft'),
                body_data.get('next_send_date'),
                body_data.get('subscribers_count', 0),
                body_data.get('google_sheets_url'),
                body_data.get('google_docs_url')
            ))
            
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(result), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            params = event.get('pathParams', {})
            event_id = params.get('id')
            body_data = json.loads(event.get('body', '{}'))
            
            if not event_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Event ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                UPDATE events 
                SET name = COALESCE(%s, name),
                    description = COALESCE(%s, description),
                    status = COALESCE(%s, status),
                    next_send_date = COALESCE(%s, next_send_date),
                    subscribers_count = COALESCE(%s, subscribers_count),
                    google_sheets_url = COALESCE(%s, google_sheets_url),
                    google_docs_url = COALESCE(%s, google_docs_url),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, name, description, status, next_send_date, 
                          subscribers_count, open_rate, click_rate, updated_at
            """, (
                body_data.get('name'),
                body_data.get('description'),
                body_data.get('status'),
                body_data.get('next_send_date'),
                body_data.get('subscribers_count'),
                body_data.get('google_sheets_url'),
                body_data.get('google_docs_url'),
                event_id
            ))
            
            result = cur.fetchone()
            conn.commit()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Event not found'}),
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
