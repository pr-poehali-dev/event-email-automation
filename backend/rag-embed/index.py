'''
Business: Generate embeddings for text chunks and store in database
Args: event - dict with httpMethod, body containing text chunks
Returns: HTTP response with generated embedding IDs
'''
import json
import os
from typing import Dict, Any, List
import psycopg2
import psycopg2.extras
from openai import OpenAI

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    # Handle CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    event_id: str = body_data.get('event_id')
    chunks: List[Dict[str, Any]] = body_data.get('chunks', [])
    
    if not event_id or not chunks:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'event_id and chunks required'})
        }
    
    # Initialize OpenAI client
    api_key = os.environ.get('OPENAI_API_KEY')
    proxy_url = os.environ.get('OPENAI_PROXY_URL', '').strip()
    if proxy_url:
        client = OpenAI(api_key=api_key, base_url=proxy_url)
    else:
        client = OpenAI(api_key=api_key)
    
    # Generate embeddings for all chunks
    texts = [chunk['text'] for chunk in chunks]
    response = client.embeddings.create(
        model='text-embedding-3-small',
        input=texts
    )
    
    embeddings = [item.embedding for item in response.data]
    
    # Connect to database
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    inserted_ids = []
    
    for chunk, embedding in zip(chunks, embeddings):
        cur.execute('''
            INSERT INTO t_p17985067_event_email_automati.kb_embeddings 
            (event_id, content_type, content_id, chunk_text, chunk_metadata, embedding_vector)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        ''', (
            event_id,
            chunk.get('content_type', 'text'),
            chunk.get('content_id'),
            chunk['text'],
            json.dumps(chunk.get('metadata', {})),
            json.dumps(embedding)
        ))
        inserted_ids.append(cur.fetchone()[0])
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'inserted_count': len(inserted_ids),
            'ids': inserted_ids
        })
    }