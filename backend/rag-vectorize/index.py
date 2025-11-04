'''
Business: Vectorize knowledge base content using OpenAI embeddings via HTTP
Args: event with httpMethod, body {event_id, force_refresh}
Returns: HTTP response with vectorization status
'''
import json
import os
import psycopg2
import urllib.request
import urllib.error
from typing import Dict, Any

def get_embedding(text: str, api_key: str) -> list:
    """Get embedding from OpenAI API using urllib"""
    url = "https://api.openai.com/v1/embeddings"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    data = {
        "model": "text-embedding-ada-002",
        "input": text
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    
    with urllib.request.urlopen(req, timeout=30) as response:
        result = json.loads(response.read().decode('utf-8'))
        return result['data'][0]['embedding']

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
    
    try:
        dsn = os.environ.get('DATABASE_URL')
    except Exception as env_error:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Failed to access DATABASE_URL: {str(env_error)}'}),
            'isBase64Encoded': False
        }
    
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL is empty or None'}),
            'isBase64Encoded': False
        }
    
    # Test without OpenAI key
    openai_key = 'test-key-placeholder'
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        chunks_created = 0
        
        if force_refresh:
            cur.execute("DELETE FROM t_p17985067_event_email_automati.kb_embeddings WHERE event_id = %s", (event_id,))
        
        # Векторизация спикеров
        cur.execute("""
            SELECT speaker_id, name, title, company, topic, bio 
            FROM t_p17985067_event_email_automati.kb_speakers 
            WHERE event_id = %s
        """, (event_id,))
        speakers = cur.fetchall()
        
        for speaker in speakers:
            speaker_id, name, title, company, topic, bio = speaker
            text = f"Спикер: {name}. {title or ''} в {company or ''}. Тема доклада: {topic or ''}. Био: {bio or ''}"
            
            cur.execute("""
                SELECT COUNT(*) FROM t_p17985067_event_email_automati.kb_embeddings 
                WHERE event_id = %s AND content_type = 'speaker' AND content_id = %s
            """, (event_id, speaker_id))
            
            if cur.fetchone()[0] == 0:
                embedding_values = get_embedding(text, openai_key)
                embedding_str = json.dumps(embedding_values)
                
                cur.execute("""
                    INSERT INTO t_p17985067_event_email_automati.kb_embeddings 
                    (event_id, content_type, content_id, chunk_text, chunk_metadata, embedding_vector)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    event_id, 
                    'speaker', 
                    speaker_id, 
                    text,
                    json.dumps({'name': name, 'company': company}),
                    embedding_str
                ))
                chunks_created += 1
        
        # Векторизация докладов
        cur.execute("""
            SELECT talk_id, title, description, speaker_id, section_id
            FROM t_p17985067_event_email_automati.kb_talks 
            WHERE event_id = %s
        """, (event_id,))
        talks = cur.fetchall()
        
        for talk in talks:
            talk_id, title, description, speaker_id, section_id = talk
            text = f"Доклад: {title or ''}. Описание: {description or ''}"
            
            cur.execute("""
                SELECT COUNT(*) FROM t_p17985067_event_email_automati.kb_embeddings 
                WHERE event_id = %s AND content_type = 'talk' AND content_id = %s
            """, (event_id, talk_id))
            
            if cur.fetchone()[0] == 0:
                embedding_values = get_embedding(text, openai_key)
                embedding_str = json.dumps(embedding_values)
                
                cur.execute("""
                    INSERT INTO t_p17985067_event_email_automati.kb_embeddings 
                    (event_id, content_type, content_id, chunk_text, chunk_metadata, embedding_vector)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    event_id, 
                    'talk', 
                    talk_id, 
                    text,
                    json.dumps({'title': title, 'speaker_id': speaker_id}),
                    embedding_str
                ))
                chunks_created += 1
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'status': 'success',
                'event_id': event_id,
                'chunks_created': chunks_created
            }),
            'isBase64Encoded': False
        }
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        conn.rollback() if 'conn' in locals() else None
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'OpenAI API error: {e.code} - {error_body}'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        conn.rollback() if 'conn' in locals() else None
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