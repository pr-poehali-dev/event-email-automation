'''
Business: API для управления базой знаний (контент-планы, боли аудитории, программы)
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с контентом базы знаний
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
            content_type = query_params.get('content_type')
            kb_id = event.get('pathParams', {}).get('id')
            
            if kb_id:
                cur.execute("""
                    SELECT * FROM knowledge_base WHERE id = %s
                """, (kb_id,))
                result = cur.fetchone()
                
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Knowledge base entry not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(result), default=str),
                    'isBase64Encoded': False
                }
            else:
                query = "SELECT * FROM knowledge_base WHERE 1=1"
                params = []
                
                if event_id:
                    query += " AND event_id = %s"
                    params.append(event_id)
                
                if content_type:
                    query += " AND content_type = %s"
                    params.append(content_type)
                
                query += " ORDER BY created_at DESC"
                
                cur.execute(query, params)
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
                INSERT INTO knowledge_base 
                (event_id, content_type, title, content, source, tags)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, event_id, content_type, title, source, created_at
            """, (
                body_data.get('event_id'),
                body_data.get('content_type'),
                body_data.get('title'),
                body_data.get('content'),
                body_data.get('source'),
                body_data.get('tags', [])
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
            kb_id = event.get('pathParams', {}).get('id')
            body_data = json.loads(event.get('body', '{}'))
            
            if not kb_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Knowledge base ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                UPDATE knowledge_base 
                SET content_type = COALESCE(%s, content_type),
                    title = COALESCE(%s, title),
                    content = COALESCE(%s, content),
                    source = COALESCE(%s, source),
                    tags = COALESCE(%s, tags),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, content_type, title, updated_at
            """, (
                body_data.get('content_type'),
                body_data.get('title'),
                body_data.get('content'),
                body_data.get('source'),
                body_data.get('tags'),
                kb_id
            ))
            
            result = cur.fetchone()
            conn.commit()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Knowledge base entry not found'}),
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
