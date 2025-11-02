'''
Business: Переиндексация существующих Google-ссылок в базе знаний
Args: event - dict с httpMethod, queryStringParameters (event_id опционально)
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с результатом переиндексации
'''
import json
import os
import re
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
import httpx

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def extract_sheet_id(url: str) -> str:
    match = re.search(r'/spreadsheets/d/([a-zA-Z0-9-_]+)', url)
    if match:
        return match.group(1)
    return url

def extract_doc_id(url: str) -> str:
    match = re.search(r'/document/d/([a-zA-Z0-9-_]+)', url)
    if match:
        return match.group(1)
    return url

def parse_google_sheet(sheet_id: str, gid: str = '0') -> List[Dict[str, str]]:
    csv_url = f'https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}'
    
    response = httpx.get(csv_url, follow_redirects=True, timeout=30.0)
    response.raise_for_status()
    
    lines = response.text.strip().split('\n')
    if len(lines) < 2:
        return []
    
    import csv
    from io import StringIO
    
    reader = csv.DictReader(StringIO(response.text))
    rows = list(reader)
    
    return rows

def parse_google_doc(doc_id: str) -> str:
    text_url = f'https://docs.google.com/document/d/{doc_id}/export?format=txt'
    
    response = httpx.get(text_url, follow_redirects=True, timeout=30.0)
    response.raise_for_status()
    
    return response.text.strip()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
    
    query_params = event.get('queryStringParameters', {}) or {}
    event_id = query_params.get('event_id')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    total_imported = 0
    processed_sources = []
    
    try:
        query = """
            SELECT DISTINCT source, event_id
            FROM knowledge_base 
            WHERE (source LIKE '%docs.google.com%' OR source LIKE '%spreadsheets%')
        """
        params = []
        
        if event_id:
            query += " AND event_id = %s"
            params.append(event_id)
        
        cur.execute(query, params)
        sources = cur.fetchall()
        
        for source_row in sources:
            url = source_row['source']
            evt_id = source_row['event_id']
            
            if 'spreadsheets' in url:
                sheet_id = extract_sheet_id(url)
                gid_match = re.search(r'gid=(\d+)', url)
                gid = gid_match.group(1) if gid_match else '0'
                
                rows = parse_google_sheet(sheet_id, gid)
                
                cur.execute("DELETE FROM knowledge_base WHERE source = %s AND event_id = %s", (url, evt_id))
                
                for row in rows:
                    title = row.get('title', row.get('Title', row.get('Заголовок', '')))
                    content = row.get('content', row.get('Content', row.get('Контент', '')))
                    row_source = row.get('source', row.get('Source', row.get('Источник', url)))
                    content_type = row.get('content_type', row.get('type', row.get('Тип', 'general')))
                    
                    if not title and not content and row:
                        keys = list(row.keys())
                        if len(keys) > 0:
                            title = row[keys[0]]
                        if len(keys) > 1:
                            content = row[keys[1]]
                    
                    if title or content:
                        cur.execute("""
                            INSERT INTO knowledge_base 
                            (event_id, content_type, title, content, source, tags)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (
                            evt_id,
                            content_type,
                            title or 'Без заголовка',
                            content or title,
                            row_source,
                            []
                        ))
                        total_imported += 1
                
                processed_sources.append({'url': url, 'type': 'spreadsheet', 'count': len(rows)})
            
            elif 'document' in url:
                doc_id = extract_doc_id(url)
                text = parse_google_doc(doc_id)
                
                cur.execute("DELETE FROM knowledge_base WHERE source = %s AND event_id = %s", (url, evt_id))
                
                paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
                
                for paragraph in paragraphs:
                    lines = paragraph.split('\n')
                    title = lines[0] if lines else 'Без заголовка'
                    content = '\n'.join(lines[1:]) if len(lines) > 1 else lines[0]
                    
                    cur.execute("""
                        INSERT INTO knowledge_base 
                        (event_id, content_type, title, content, source, tags)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (
                        evt_id,
                        'general',
                        title,
                        content,
                        url,
                        []
                    ))
                    total_imported += 1
                
                processed_sources.append({'url': url, 'type': 'document', 'count': len(paragraphs)})
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'total_imported': total_imported,
                'processed_sources': processed_sources
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()