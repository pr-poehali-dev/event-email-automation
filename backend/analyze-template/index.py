'''
Business: Анализ HTML-шаблонов с автодетекцией блоков (headline, preheader, CTA, agenda, speakers)
Args: event - dict с httpMethod, body (html_content)
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с обнаруженными блоками и переменными
'''
import json
import os
import re
from typing import Dict, Any, List
from html.parser import HTMLParser
import openai
import httpx

class TemplateAnalyzer(HTMLParser):
    def __init__(self):
        super().__init__()
        self.blocks = []
        self.current_text = ''
        self.current_tag = None
        self.tag_stack = []
        self.current_attrs = {}
        
    def handle_starttag(self, tag, attrs):
        self.tag_stack.append(tag)
        self.current_tag = tag
        self.current_attrs = dict(attrs)
        
    def handle_endtag(self, tag):
        if self.tag_stack and self.tag_stack[-1] == tag:
            self.tag_stack.pop()
        
    def handle_data(self, data):
        stripped = data.strip()
        if stripped and len(stripped) > 3:
            if self.current_tag not in ['script', 'style']:
                self.blocks.append({
                    'text': stripped,
                    'tag': self.current_tag,
                    'length': len(stripped),
                    'attrs': self.current_attrs.copy()
                })

def detect_repeatable_blocks(html: str) -> List[Dict]:
    conditions = []
    
    speaker_pattern = r'<!--\s*BEGIN:SPEAKER\s*-->(.*?)<!--\s*END:SPEAKER\s*-->'
    agenda_pattern = r'<!--\s*BEGIN:AGENDA\s*-->(.*?)<!--\s*END:AGENDA\s*-->'
    
    speaker_matches = re.findall(speaker_pattern, html, re.DOTALL)
    if speaker_matches:
        conditions.append({
            'type': 'repeatable',
            'block_name': 'speakers',
            'template_fragment': speaker_matches[0][:200],
            'variables': ['speaker_name', 'speaker_role', 'speaker_bio']
        })
    
    agenda_matches = re.findall(agenda_pattern, html, re.DOTALL)
    if agenda_matches:
        conditions.append({
            'type': 'repeatable',
            'block_name': 'agenda',
            'template_fragment': agenda_matches[0][:200],
            'variables': ['agenda_time', 'agenda_title']
        })
    
    return conditions

def detect_block_type_ai(blocks: List[Dict], html_content: str) -> List[Dict]:
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
    
    blocks_text = '\n\n'.join([f"{i+1}. [{block['tag']}] {block['text'][:100]}" for i, block in enumerate(blocks)])
    
    system_prompt = f"""Ты — эксперт по email-маркетингу. Проанализируй HTML-шаблон письма и определи тип каждого блока.

ДОСТУПНЫЕ ТИПЫ БЛОКОВ:
- preheader: Короткий текст-превью (обычно в начале, 50-100 символов) [REQUIRED]
- headline: Главный заголовок письма (h1, h2, крупный текст) [REQUIRED]
- subheadline: Подзаголовок, уточнение
- body: Основной текст, описание
- cta: Призыв к действию, кнопка (ссылки типа "Зарегистрироваться", "Купить") [REQUIRED]
- agenda: Программа события, расписание
- speaker: Информация о спикере (имя, должность, фото)
- benefits: Список преимуществ, выгод
- social_proof: Отзывы, кейсы, результаты
- deadline: Информация о сроках, дедлайнах
- footer: Подвал письма, контакты, отписка
- other: Другое

АНАЛИЗИРУЕМЫЕ БЛОКИ:
{blocks_text}

Верни JSON массив объектов с полями:
- block_index: номер блока (1-N)
- type: тип блока из списка выше
- variable_name: предложенное имя переменной (например: event_name, speaker_bio, cta_button)
- confidence: уверенность в определении типа (0.0-1.0)
- is_required: true если тип помечен [REQUIRED] (preheader, headline, cta), иначе false

Ответь ТОЛЬКО JSON массивом, без пояснений."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Проанализируй {len(blocks)} блоков"}
        ],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    
    result = json.loads(response.choices[0].message.content)
    detections = result.get('blocks', [])
    
    for i, block in enumerate(blocks):
        detection = next((d for d in detections if d.get('block_index') == i+1), None)
        if detection:
            block['block_type'] = detection.get('type', 'other')
            block['variable_name'] = detection.get('variable_name', f'block_{i+1}')
            block['confidence'] = detection.get('confidence', 0.5)
            block['is_required'] = detection.get('is_required', False)
        else:
            block['block_type'] = 'other'
            block['variable_name'] = f'block_{i+1}'
            block['confidence'] = 0.3
            block['is_required'] = False
    
    return blocks

def create_template_with_variables(html: str, blocks: List[Dict]) -> str:
    result_html = html
    
    for block in sorted(blocks, key=lambda x: len(x['text']), reverse=True):
        text = block['text']
        var_name = block['variable_name']
        placeholder = '{{' + var_name + '}}'
        
        result_html = result_html.replace(text, placeholder, 1)
    
    return result_html

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
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        html_content = body_data.get('html_content')
        
        if not html_content:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'html_content is required'}),
                'isBase64Encoded': False
            }
        
        parser = TemplateAnalyzer()
        parser.feed(html_content)
        
        blocks_with_types = detect_block_type_ai(parser.blocks, html_content)
        
        template_html = create_template_with_variables(html_content, blocks_with_types)
        
        conditions = detect_repeatable_blocks(html_content)
        
        variables = [
            {
                'name': block['variable_name'],
                'type': block['block_type'],
                'original_text': block['text'][:200],
                'confidence': block['confidence'],
                'is_required': block.get('is_required', False)
            }
            for block in blocks_with_types
        ]
        
        required_variables = [
            var['name'] for var in variables if var.get('is_required', False)
        ]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'original_html': html_content,
                'template_html': template_html,
                'blocks': blocks_with_types,
                'variables': variables,
                'required_variables': required_variables,
                'conditions': conditions,
                'blocks_count': len(blocks_with_types)
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