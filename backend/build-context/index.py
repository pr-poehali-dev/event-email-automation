'''
Business: Build complete context for email rendering from Knowledge Base
Args: event with httpMethod, body containing event_id, template_type, overrides
Returns: HTTP response with merged context (brand + defaults + event + content + speakers + program)
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, Optional
from urllib.parse import urlencode, urlparse, parse_qs, urlunparse

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not set')
    return psycopg2.connect(dsn)

def add_utm_to_url(url: str, utm_params: Dict[str, str], utm_content: str = '') -> str:
    if not url or url == '#':
        return url
    
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)
    
    for key, value in utm_params.items():
        if key not in query_params:
            query_params[key] = [value]
    
    if utm_content and 'utm_content' not in query_params:
        query_params['utm_content'] = [utm_content]
    
    new_query = urlencode(query_params, doseq=True)
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))

def build_context(conn, event_id: str, template_type: str, overrides: Optional[Dict] = None) -> Dict[str, Any]:
    cur = conn.cursor(cursor_factory=RealDictCursor)
    overrides = overrides or {}
    
    cur.execute("SELECT * FROM kb_brand LIMIT 1")
    brand = dict(cur.fetchone() or {})
    
    cur.execute("SELECT * FROM kb_defaults LIMIT 1")
    defaults = dict(cur.fetchone() or {})
    
    cur.execute("SELECT * FROM kb_events WHERE event_id = %s", (event_id,))
    event = dict(cur.fetchone() or {})
    
    if not event:
        raise ValueError(f'Event {event_id} not found')
    
    cur.execute("SELECT * FROM kb_content WHERE event_id = %s LIMIT 1", (event_id,))
    content = dict(cur.fetchone() or {})
    
    cur.execute("SELECT * FROM kb_speakers WHERE event_id = %s", (event_id,))
    speakers_rows = cur.fetchall()
    speakers = [dict(row) for row in speakers_rows]
    
    cur.execute("SELECT * FROM kb_program WHERE event_id = %s LIMIT 1", (event_id,))
    program_row = cur.fetchone()
    program = dict(program_row) if program_row else {}
    
    cur.execute("SELECT * FROM kb_sections WHERE event_id = %s", (event_id,))
    sections_rows = cur.fetchall()
    sections = [dict(row) for row in sections_rows]
    
    cur.execute("SELECT * FROM kb_talks WHERE event_id = %s", (event_id,))
    talks_rows = cur.fetchall()
    talks = [dict(row) for row in talks_rows]
    
    cur.execute("SELECT * FROM kb_tickets WHERE event_id = %s LIMIT 1", (event_id,))
    tickets_row = cur.fetchone()
    tickets = dict(tickets_row) if tickets_row else {}
    
    cur.execute("SELECT * FROM kb_assets WHERE event_id = %s LIMIT 1", (event_id,))
    assets_row = cur.fetchone()
    assets = dict(assets_row) if assets_row else {}
    
    cur.execute("SELECT * FROM kb_campaigns WHERE event_id = %s AND campaign_type = %s LIMIT 1", 
                (event_id, template_type))
    campaign_row = cur.fetchone()
    campaign = dict(campaign_row) if campaign_row else {}
    
    cur.close()
    
    utm_params = defaults.get('utm', {})
    if isinstance(utm_params, str):
        utm_params = json.loads(utm_params)
    
    cta_url = overrides.get('ctaUrl') or event.get('landing') or event.get('site') or '#'
    cta_top_url = add_utm_to_url(cta_url, utm_params, 'cta_top')
    cta_bottom_url = add_utm_to_url(cta_url, utm_params, 'cta_bottom')
    
    content_cta_texts = content.get('cta_texts', {})
    if isinstance(content_cta_texts, str):
        content_cta_texts = json.loads(content_cta_texts)
    
    defaults_cta_texts = defaults.get('cta_texts', {})
    if isinstance(defaults_cta_texts, str):
        defaults_cta_texts = json.loads(defaults_cta_texts)
    
    template_cta = content_cta_texts.get(template_type, {})
    
    cta_top_text = (overrides.get('ctaTopText') or 
                    template_cta.get('top') or 
                    defaults_cta_texts.get('defaultTop', 'Подробнее'))
    
    cta_bottom_text = (overrides.get('ctaBottomText') or 
                       template_cta.get('bottom') or 
                       defaults_cta_texts.get('defaultBottom', 'Посмотреть программу'))
    
    subjects = content.get('subjects', {})
    if isinstance(subjects, str):
        subjects = json.loads(subjects)
    
    preheaders = content.get('preheaders', [])
    if isinstance(preheaders, str):
        preheaders = json.loads(preheaders)
    
    subject_a = (overrides.get('subjectA') or 
                 campaign.get('subject_a') or 
                 subjects.get('A', event.get('name', '')))
    
    subject_b = (overrides.get('subjectB') or 
                 campaign.get('subject_b') or 
                 subjects.get('B', event.get('name', '')))
    
    preheader = (overrides.get('preheader') or 
                 campaign.get('preheader') or 
                 (preheaders[0] if preheaders else defaults.get('preheader', '')))
    
    context = {
        'brand': brand,
        'defaults': defaults,
        'event': event,
        'content': content,
        'speakers': speakers,
        'program': program,
        'sections': sections,
        'talks': talks,
        'tickets': tickets,
        'assets': assets,
        'campaign': campaign,
        'meta': {
            'subjectA': subject_a,
            'subjectB': subject_b,
            'preheader': preheader,
            'cta_top_url': cta_top_url,
            'cta_top_text': cta_top_text,
            'cta_bottom_url': cta_bottom_url,
            'cta_bottom_text': cta_bottom_text
        },
        'overrides': overrides
    }
    
    return context

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
        template_type = body_data.get('template_type', 'sales_via_pain')
        overrides = body_data.get('overrides', {})
        
        if not event_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'event_id is required'}),
                'isBase64Encoded': False
            }
        
        result_context = build_context(conn, event_id, template_type, overrides)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result_context, default=str),
            'isBase64Encoded': False
        }
        
    except ValueError as e:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
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
        conn.close()
