'''
Business: Vectorize knowledge base content using OpenAI embeddings
Args: event with httpMethod, body {event_id, force_refresh}
Returns: HTTP response with vectorization status
'''
import json
import os
import psycopg2
import openai
import httpx
from typing import Dict, Any

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
    
    dsn = os.environ['DATABASE_URL']
    
    # Initialize OpenAI client (same way as generate-email)
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
                response = client.embeddings.create(
                    model="text-embedding-ada-002",
                    input=text
                )
                embedding_values = response.data[0].embedding
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
                response = client.embeddings.create(
                    model="text-embedding-ada-002",
                    input=text
                )
                embedding_values = response.data[0].embedding
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
        
        # Векторизация болей аудитории
        cur.execute("""
            SELECT pain_point FROM t_p17985067_event_email_automati.kb_content 
            WHERE event_id = %s AND pain_point IS NOT NULL
        """, (event_id,))
        pain_points = cur.fetchall()
        
        for idx, (pain_point,) in enumerate(pain_points):
            if pain_point and pain_point.strip():
                cur.execute("""
                    SELECT COUNT(*) FROM t_p17985067_event_email_automati.kb_embeddings 
                    WHERE event_id = %s AND content_type = 'pain_point' AND content_id = %s
                """, (event_id, f'pain_{idx}'))
                
                if cur.fetchone()[0] == 0:
                    response = client.embeddings.create(
                        model="text-embedding-ada-002",
                        input=pain_point
                    )
                    embedding_values = response.data[0].embedding
                    embedding_str = json.dumps(embedding_values)
                    
                    cur.execute("""
                        INSERT INTO t_p17985067_event_email_automati.kb_embeddings 
                        (event_id, content_type, content_id, chunk_text, chunk_metadata, embedding_vector)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (
                        event_id, 
                        'pain_point', 
                        f'pain_{idx}', 
                        pain_point,
                        json.dumps({}),
                        embedding_str
                    ))
                    chunks_created += 1
        
        # Векторизация выгод и ценности
        cur.execute("""
            SELECT benefit FROM t_p17985067_event_email_automati.kb_content 
            WHERE event_id = %s AND benefit IS NOT NULL
        """, (event_id,))
        benefits = cur.fetchall()
        
        for idx, (benefit,) in enumerate(benefits):
            if benefit and benefit.strip():
                cur.execute("""
                    SELECT COUNT(*) FROM t_p17985067_event_email_automati.kb_embeddings 
                    WHERE event_id = %s AND content_type = 'benefit' AND content_id = %s
                """, (event_id, f'benefit_{idx}'))
                
                if cur.fetchone()[0] == 0:
                    response = client.embeddings.create(
                        model="text-embedding-ada-002",
                        input=benefit
                    )
                    embedding_values = response.data[0].embedding
                    embedding_str = json.dumps(embedding_values)
                    
                    cur.execute("""
                        INSERT INTO t_p17985067_event_email_automati.kb_embeddings 
                        (event_id, content_type, content_id, chunk_text, chunk_metadata, embedding_vector)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (
                        event_id, 
                        'benefit', 
                        f'benefit_{idx}', 
                        benefit,
                        json.dumps({}),
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
