import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Vectorize knowledge base content using OpenAI embeddings (test mode)
    Args: event with httpMethod, body {event_id, force_refresh}
    Returns: HTTP response with vectorization status
    '''
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
    
    body_data = json.loads(event.get('body', '{}'))
    event_id: str = body_data.get('event_id')
    force_refresh: bool = body_data.get('force_refresh', False)
    
    if not event_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'event_id is required'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    openai_key = os.environ.get('OPENAI_API_KEY')
    
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing DATABASE_URL'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Count data in database
        cur.execute("""
            SELECT COUNT(*) 
            FROM t_p17985067_event_email_automati.kb_speakers 
            WHERE event_id = %s
        """, (event_id,))
        speakers_count = cur.fetchone()[0]
        
        cur.execute("""
            SELECT COUNT(*) 
            FROM t_p17985067_event_email_automati.kb_talks 
            WHERE event_id = %s
        """, (event_id,))
        talks_count = cur.fetchone()[0]
        
        cur.execute("""
            SELECT COUNT(*) 
            FROM t_p17985067_event_email_automati.kb_embeddings 
            WHERE event_id = %s
        """, (event_id,))
        embeddings_count = cur.fetchone()[0]
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'status': 'success',
                'event_id': event_id,
                'speakers_found': speakers_count,
                'talks_found': talks_count,
                'embeddings_existing': embeddings_count,
                'chunks_created': 0,
                'openai_key_available': openai_key is not None,
                'openai_key_length': len(openai_key) if openai_key else 0,
                'message': 'Test mode: OpenAI calls disabled, database check only'
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