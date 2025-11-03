'''
Business: Generate JSON content blocks for email based on event data and audience segment
Args: event with httpMethod, body containing event_id, segment_id, content_type
Returns: HTTP response with JSON content structure
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not set')
    return psycopg2.connect(dsn)

def generate_content_blocks(event_data: Dict[str, Any], segment_data: Dict[str, Any], block_types: list) -> Dict[str, Any]:
    content = {}
    
    for block_type in block_types:
        if block_type == 'hero':
            content['hero'] = {
                'title': event_data.get('name', 'Мероприятие'),
                'subtitle': event_data.get('tagline', ''),
                'preheader': f"Приглашаем на {event_data.get('name', 'мероприятие')}"
            }
        
        elif block_type == 'agenda':
            agenda_items = event_data.get('agenda', [])
            content['agenda'] = {
                'has_agenda': len(agenda_items) > 0,
                'items': agenda_items
            }
        
        elif block_type == 'speaker':
            speakers = event_data.get('speakers', [])
            content['speakers'] = [
                {
                    'name': s.get('name', ''),
                    'title': s.get('title', ''),
                    'bio': s.get('bio', ''),
                    'photo_url': s.get('photo_url', '')
                }
                for s in speakers
            ]
        
        elif block_type == 'social_proof':
            content['social_proof'] = {
                'testimonial': 'Отличное мероприятие! Получил ценные знания и контакты.',
                'author': 'Иван Петров',
                'company': 'Tech Corp',
                'stats': [
                    {'label': 'Участников в прошлом году', 'value': '500+'},
                    {'label': 'Средняя оценка', 'value': '4.8/5'}
                ]
            }
        
        elif block_type == 'pain':
            pain_points = segment_data.get('pain_points', [])
            value_props = segment_data.get('value_props', [])
            
            if pain_points and value_props:
                content['pain'] = {
                    'problem': pain_points[0] if pain_points else 'Задача',
                    'solution': value_props[0] if value_props else 'Решение',
                    'benefit': 'Экономия времени и ресурсов'
                }
        
        elif block_type == 'cta':
            content['cta'] = {
                'text': 'Зарегистрироваться',
                'url': event_data.get('registration_url', '#'),
                'style': 'primary'
            }
    
    return content

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
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
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        event_id = body_data.get('event_id')
        segment_id = body_data.get('segment_id', 1)
        
        if not event_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'event_id is required'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT * FROM events WHERE id = %s", (event_id,))
        event_row = cur.fetchone()
        
        if not event_row:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Event not found'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT * FROM audience_segments WHERE id = %s", (segment_id,))
        segment_row = cur.fetchone()
        
        if not segment_row:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Segment not found'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "SELECT block_type FROM segment_block_mapping WHERE segment_id = %s ORDER BY priority",
            (segment_id,)
        )
        block_mappings = cur.fetchall()
        block_types = [b['block_type'] for b in block_mappings]
        
        event_data = dict(event_row)
        segment_data = dict(segment_row)
        
        content_blocks = generate_content_blocks(event_data, segment_data, block_types)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'content': content_blocks,
                'segment': segment_data.get('name'),
                'copy_pattern': segment_data.get('copy_pattern'),
                'block_order': block_types
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
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
