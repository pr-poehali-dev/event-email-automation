'''
Business: Generate email content using RAG (semantic search) and GPT-4
Args: event - dict with event_id, prompt, content_type, max_length
Returns: HTTP response with generated text using relevant knowledge base chunks
'''
import json
import os
from typing import Dict, Any, List
import psycopg2
import psycopg2.extras
from openai import OpenAI
import numpy as np
import httpx

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    a = np.array(vec1)
    b = np.array(vec2)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
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
    prompt: str = body_data.get('prompt')
    content_types: List[str] = body_data.get('content_types', [])
    max_length: int = body_data.get('max_length', 500)
    top_k: int = body_data.get('top_k', 5)
    
    if not event_id or not prompt:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'event_id and prompt required'})
        }
    
    # Initialize OpenAI client with proxy support
    api_key = os.environ.get('OPENAI_API_KEY')
    proxy_url = os.environ.get('OPENAI_PROXY_URL', '').strip()
    
    if proxy_url:
        http_client = httpx.Client(proxies=proxy_url)
        client = OpenAI(api_key=api_key, http_client=http_client)
    else:
        client = OpenAI(api_key=api_key)
    
    # Generate embedding for search query
    query_response = client.embeddings.create(
        model='text-embedding-3-small',
        input=[prompt]
    )
    query_embedding = query_response.data[0].embedding
    
    # Search in vector database
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    sql = '''
        SELECT id, content_type, content_id, chunk_text, chunk_metadata, embedding_vector
        FROM t_p17985067_event_email_automati.kb_embeddings
        WHERE event_id = %s AND embedding_vector IS NOT NULL
    '''
    params = [event_id]
    
    if content_types:
        placeholders = ','.join(['%s'] * len(content_types))
        sql += f' AND content_type IN ({placeholders})'
        params.extend(content_types)
    
    cur.execute(sql, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    if not rows:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No embeddings found. Run vectorization first.'})
        }
    
    # Calculate similarities and get top-k
    results = []
    for row in rows:
        doc_embedding = json.loads(row['embedding_vector'])
        similarity = cosine_similarity(query_embedding, doc_embedding)
        results.append({
            'text': row['chunk_text'],
            'similarity': similarity,
            'metadata': row['chunk_metadata']
        })
    
    results.sort(key=lambda x: x['similarity'], reverse=True)
    top_chunks = results[:top_k]
    
    # Build context from top chunks
    context = '\n\n'.join([f"[{i+1}] {chunk['text']}" for i, chunk in enumerate(top_chunks)])
    
    # Generate content using GPT-4 with RAG context
    system_prompt = f'''Ты — опытный email-копирайтер для ивент-маркетинга.

ВАЖНО:
1. Используй ТОЛЬКО информацию из предоставленного контекста
2. НЕ придумывай факты, цифры или детали
3. Финальный текст должен быть ≤ {max_length} символов
4. Пиши в стиле: дружелюбный, мотивирующий, конкретный
5. Избегай клише типа "не упустите шанс", "уникальная возможность"

Контекст из базы знаний:
{context}'''
    
    completion = client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': prompt}
        ],
        temperature=0.7,
        max_tokens=800
    )
    
    generated_text = completion.choices[0].message.content.strip()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'generated_text': generated_text,
            'sources_used': len(top_chunks),
            'sources': [
                {
                    'text': chunk['text'][:150] + '...',
                    'similarity': chunk['similarity']
                }
                for chunk in top_chunks[:3]
            ]
        })
    }