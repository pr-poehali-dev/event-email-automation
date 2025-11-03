import json
import os
import psycopg2
import openai
import httpx
from typing import Dict, Any, List
import numpy as np

def cosine_similarity(a: List[float], b: List[float]) -> float:
    '''Calculate cosine similarity between two vectors'''
    a_arr = np.array(a)
    b_arr = np.array(b)
    return np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr))

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Semantic search in knowledge base using RAG
    Args: event with httpMethod, queryStringParameters {event_id, query, limit}
    Returns: HTTP response with relevant knowledge base chunks
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters', {}) or {}
    event_id: str = params.get('event_id')
    query: str = params.get('query')
    limit: int = int(params.get('limit', '5'))
    
    if not event_id or not query:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'event_id and query are required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    openai_key = os.environ.get('OPENAI_API_KEY')
    proxy_url = os.environ.get('OPENAI_PROXY_URL', '').strip()
    
    if not dsn or not openai_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing DATABASE_URL or OPENAI_API_KEY'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    if proxy_url:
        http_client = httpx.Client(
            proxies={
                'http://': proxy_url,
                'https://': proxy_url
            }
        )
        client = openai.OpenAI(
            api_key=openai_key,
            http_client=http_client
        )
    else:
        client = openai.OpenAI(api_key=openai_key)
    
    try:
        response = client.embeddings.create(
            model="text-embedding-ada-002",
            input=query
        )
        query_embedding = response.data[0].embedding
        
        cur.execute("""
            SELECT id, content_type, content_id, chunk_text, chunk_metadata, embedding_text
            FROM kb_embeddings
            WHERE event_id = %s AND embedding_text IS NOT NULL
        """, (event_id,))
        
        rows = cur.fetchall()
        
        results = []
        for row in rows:
            chunk_id, content_type, content_id, chunk_text, chunk_metadata, embedding_str = row
            
            chunk_embedding = json.loads(embedding_str)
            similarity = cosine_similarity(query_embedding, chunk_embedding)
            
            results.append({
                'id': chunk_id,
                'content_type': content_type,
                'content_id': content_id,
                'text': chunk_text,
                'metadata': chunk_metadata,
                'similarity': float(similarity)
            })
        
        results.sort(key=lambda x: x['similarity'], reverse=True)
        top_results = results[:limit]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'status': 'success',
                'query': query,
                'results': top_results
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        cur.close()
        conn.close()