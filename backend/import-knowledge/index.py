'''
Business: Массовый импорт базы знаний из Google Sheets и Google Docs
Args: event - dict с httpMethod, body (url, event_id, content_type)
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с результатом импорта
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
    """Извлекает ID из ссылки Google Sheets"""
    match = re.search(r'/spreadsheets/d/([a-zA-Z0-9-_]+)', url)
    if match:
        return match.group(1)
    return url

def extract_doc_id(url: str) -> str:
    """Извлекает ID из ссылки Google Docs"""
    match = re.search(r'/document/d/([a-zA-Z0-9-_]+)', url)
    if match:
        return match.group(1)
    return url

def parse_google_sheet(sheet_id: str, gid: str = '0') -> List[Dict[str, str]]:
    """Парсит Google Sheets через CSV export"""
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
    """Парсит Google Docs через text export"""
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
    
    body_str = event.get('body', '{}')
    if not body_str or body_str.strip() == '':
        body_str = '{}'
    
    body_data = json.loads(body_str)
    url = body_data.get('url', '').strip()
    event_id = body_data.get('event_id')
    content_type = body_data.get('content_type', 'general')
    
    if not url or not event_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'url and event_id required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    imported_count = 0
    
    try:
        if 'spreadsheets' in url:
            sheet_id = extract_sheet_id(url)
            
            gid_match = re.search(r'gid=(\d+)', url)
            gid = gid_match.group(1) if gid_match else '0'
            
            rows = parse_google_sheet(sheet_id, gid)
            
            for row in rows:
                title = row.get('title', row.get('Title', row.get('Заголовок', '')))
                content = row.get('content', row.get('Content', row.get('Контент', '')))
                source = row.get('source', row.get('Source', row.get('Источник', url)))
                row_content_type = row.get('content_type', row.get('type', row.get('Тип', content_type)))
                
                if not title and not content:
                    first_key = list(row.keys())[0] if row else None
                    second_key = list(row.keys())[1] if len(row.keys()) > 1 else None
                    
                    if first_key:
                        title = row[first_key]
                    if second_key:
                        content = row[second_key]
                
                if title or content:
                    cur.execute("""
                        INSERT INTO knowledge_base 
                        (event_id, content_type, title, content, source, tags)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (
                        event_id,
                        row_content_type,
                        title or 'Без заголовка',
                        content or title,
                        source,
                        []
                    ))
                    imported_count += 1
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'imported': imported_count,
                    'type': 'spreadsheet'
                }),
                'isBase64Encoded': False
            }
        
        elif 'document' in url:
            doc_id = extract_doc_id(url)
            text = parse_google_doc(doc_id)
            
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
                    event_id,
                    content_type,
                    title,
                    content,
                    url,
                    []
                ))
                imported_count += 1
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'imported': imported_count,
                    'type': 'document'
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unsupported URL format. Use Google Sheets or Google Docs links'}),
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