'''
Business: Управление переменными шаблонов с описаниями для AI генерации
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с переменными
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
            params = event.get('queryStringParameters', {})
            content_type_id = params.get('content_type_id')
            
            if content_type_id:
                cur.execute("""
                    SELECT tv.*, ct.name as content_type_name
                    FROM template_variables tv
                    JOIN content_types ct ON ct.id = tv.content_type_id
                    WHERE tv.content_type_id = %s
                    ORDER BY tv.display_order, tv.variable_name
                """, (content_type_id,))
            else:
                cur.execute("""
                    SELECT tv.*, ct.name as content_type_name
                    FROM template_variables tv
                    JOIN content_types ct ON ct.id = tv.content_type_id
                    ORDER BY ct.name, tv.display_order, tv.variable_name
                """)
            
            variables = [dict(row) for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'variables': variables}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            required_fields = ['content_type_id', 'variable_name', 'variable_description']
            for field in required_fields:
                if field not in body_data:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Missing required field: {field}'}),
                        'isBase64Encoded': False
                    }
            
            cur.execute("""
                INSERT INTO template_variables 
                (content_type_id, variable_name, variable_description, default_value, is_required, display_order)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, content_type_id, variable_name, variable_description, default_value, is_required, display_order, created_at
            """, (
                body_data['content_type_id'],
                body_data['variable_name'],
                body_data['variable_description'],
                body_data.get('default_value'),
                body_data.get('is_required', True),
                body_data.get('display_order', 0)
            ))
            
            new_variable = dict(cur.fetchone())
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'variable': new_variable}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            variable_id = body_data.get('id')
            
            if not variable_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing variable id'}),
                    'isBase64Encoded': False
                }
            
            update_fields = []
            values = []
            
            for field in ['variable_name', 'variable_description', 'default_value', 'is_required', 'display_order']:
                if field in body_data:
                    update_fields.append(f"{field} = %s")
                    values.append(body_data[field])
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            values.append(variable_id)
            
            cur.execute(f"""
                UPDATE template_variables 
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id, content_type_id, variable_name, variable_description, default_value, is_required, display_order, created_at
            """, values)
            
            updated_variable = cur.fetchone()
            
            if not updated_variable:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Variable not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'variable': dict(updated_variable)}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            variable_id = params.get('id')
            
            if not variable_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing variable id'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("DELETE FROM template_variables WHERE id = %s RETURNING id", (variable_id,))
            deleted = cur.fetchone()
            
            if not deleted:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Variable not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Variable deleted successfully'}),
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
