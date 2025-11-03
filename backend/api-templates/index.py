'''
Business: API для управления HTML-шаблонов (создание, чтение, удаление)
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с шаблонами
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
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            template_id = params.get('id')
            
            if template_id:
                cur.execute("SELECT * FROM email_templates WHERE id = %s", (template_id,))
                template = cur.fetchone()
                
                if not template:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Template not found'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "SELECT variable, source, transform, value FROM template_mappings WHERE template_id = %s",
                    (template_id,)
                )
                mappings = cur.fetchall()
                
                result = dict(template)
                result['mappings'] = [dict(m) for m in mappings]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result, default=str),
                    'isBase64Encoded': False
                }
            else:
                cur.execute("SELECT * FROM email_templates ORDER BY created_at DESC")
                results = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(row) for row in results], default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name')
            html_content = body_data.get('html_content')
            analyzed_blocks = body_data.get('analyzed_blocks')
            required_variables = body_data.get('required_variables')
            template_with_variables = body_data.get('template_with_variables')
            conditions = body_data.get('conditions')
            mappings = body_data.get('mappings')
            
            if not all([name, html_content]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'name and html_content are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """INSERT INTO email_templates 
                (name, html_content, type, is_active, analyzed_blocks, required_variables, template_with_variables, conditions) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *""",
                (name, html_content, 'custom', True, 
                 json.dumps(analyzed_blocks) if analyzed_blocks else None,
                 json.dumps(required_variables) if required_variables else None,
                 template_with_variables,
                 json.dumps(conditions) if conditions else None)
            )
            result = cur.fetchone()
            template_id = result['id']
            
            if mappings:
                for mapping in mappings:
                    cur.execute(
                        """INSERT INTO template_mappings 
                        (template_id, variable, source, transform, value) 
                        VALUES (%s, %s, %s, %s, %s)""",
                        (template_id, mapping['variable'], mapping['source'], 
                         mapping.get('transform'), mapping.get('value'))
                    )
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(result), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {}) or {}
            template_id = params.get('id')
            
            if not template_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'id is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("DELETE FROM email_templates WHERE id = %s RETURNING id", (template_id,))
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
                'body': json.dumps({'message': 'Template deleted'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
            
    except Exception as e:
        conn.rollback()
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