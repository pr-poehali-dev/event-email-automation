'''
Business: Import program from Google Sheets to Knowledge Base
Args: event with httpMethod, body containing event_id, sheets_url
Returns: HTTP response with import result (speakers, talks, sections count)
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, List
import re

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not set')
    return psycopg2.connect(dsn)

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text

def import_speakers(conn, event_id: str, speakers_data: List[Dict[str, Any]]) -> int:
    cur = conn.cursor()
    count = 0
    
    for speaker in speakers_data:
        speaker_id = slugify(speaker.get('name', ''))
        
        cur.execute(
            """INSERT INTO kb_speakers 
            (event_id, speaker_id, name, title, company, topic, bio, photo, links)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (event_id, speaker_id) DO UPDATE SET
            name = EXCLUDED.name,
            title = EXCLUDED.title,
            company = EXCLUDED.company,
            topic = EXCLUDED.topic,
            bio = EXCLUDED.bio,
            photo = EXCLUDED.photo,
            links = EXCLUDED.links""",
            (
                event_id,
                speaker_id,
                speaker.get('name', ''),
                speaker.get('title', ''),
                speaker.get('company', ''),
                speaker.get('topic', ''),
                speaker.get('bio', ''),
                speaker.get('photo', ''),
                json.dumps(speaker.get('links', {}))
            )
        )
        count += 1
    
    cur.close()
    conn.commit()
    return count

def import_sections(conn, event_id: str, sections_data: List[Dict[str, Any]]) -> int:
    cur = conn.cursor()
    count = 0
    
    for section in sections_data:
        section_id = slugify(section.get('title', ''))
        
        cur.execute(
            """INSERT INTO kb_sections 
            (event_id, section_id, title, description, tags, day_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (event_id, section_id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            tags = EXCLUDED.tags,
            day_id = EXCLUDED.day_id""",
            (
                event_id,
                section_id,
                section.get('title', ''),
                section.get('description', ''),
                json.dumps(section.get('tags', [])),
                section.get('day_id', 'day1')
            )
        )
        count += 1
    
    cur.close()
    conn.commit()
    return count

def import_talks(conn, event_id: str, talks_data: List[Dict[str, Any]]) -> int:
    cur = conn.cursor()
    count = 0
    
    for talk in talks_data:
        talk_id = slugify(talk.get('title', ''))
        speaker_id = slugify(talk.get('speaker_name', ''))
        section_id = slugify(talk.get('section_title', ''))
        
        cur.execute(
            """INSERT INTO kb_talks 
            (event_id, talk_id, title, speaker_id, start_time, end_time, abstract, keywords, section_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (event_id, talk_id) DO UPDATE SET
            title = EXCLUDED.title,
            speaker_id = EXCLUDED.speaker_id,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            abstract = EXCLUDED.abstract,
            keywords = EXCLUDED.keywords,
            section_id = EXCLUDED.section_id""",
            (
                event_id,
                talk_id,
                talk.get('title', ''),
                speaker_id,
                talk.get('start_time', ''),
                talk.get('end_time', ''),
                talk.get('abstract', ''),
                json.dumps(talk.get('keywords', [])),
                section_id
            )
        )
        count += 1
    
    cur.close()
    conn.commit()
    return count

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
    
    conn = get_db_connection()
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        event_id = body_data.get('event_id')
        sheets_url = body_data.get('sheets_url')
        
        speakers_data = body_data.get('speakers', [])
        sections_data = body_data.get('sections', [])
        talks_data = body_data.get('talks', [])
        
        if not event_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'event_id is required'}),
                'isBase64Encoded': False
            }
        
        speakers_count = 0
        sections_count = 0
        talks_count = 0
        
        if speakers_data:
            speakers_count = import_speakers(conn, event_id, speakers_data)
        
        if sections_data:
            sections_count = import_sections(conn, event_id, sections_data)
        
        if talks_data:
            talks_count = import_talks(conn, event_id, talks_data)
        
        days = []
        if talks_data:
            unique_days = set()
            for talk in talks_data:
                day_id = talk.get('day_id', 'day1')
                unique_days.add(day_id)
            days = [{'id': day_id, 'label': f'День {i+1}'} for i, day_id in enumerate(sorted(unique_days))]
        
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO kb_program (event_id, days, sections, talks)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (event_id) DO UPDATE SET
            days = EXCLUDED.days,
            sections = EXCLUDED.sections,
            talks = EXCLUDED.talks,
            updated_at = CURRENT_TIMESTAMP""",
            (
                event_id,
                json.dumps(days),
                json.dumps([]),
                json.dumps([])
            )
        )
        cur.close()
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'imported': {
                    'speakers': speakers_count,
                    'sections': sections_count,
                    'talks': talks_count
                },
                'sheets_url': sheets_url
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Import failed',
                'details': str(e)
            }),
            'isBase64Encoded': False
        }
    finally:
        conn.close()
