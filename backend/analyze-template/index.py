'''
Business: Анализирует HTML шаблон и автоматически находит места для переменных
Args: event - dict с httpMethod, body (html_content)
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с предложенными переменными и новым шаблоном
'''
import json
import os
import re
from typing import Dict, Any, List, Tuple
from html.parser import HTMLParser

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text_blocks = []
        self.current_tag = None
        self.tag_path = []
        
    def handle_starttag(self, tag, attrs):
        self.tag_path.append(tag)
        self.current_tag = tag
        
    def handle_endtag(self, tag):
        if self.tag_path and self.tag_path[-1] == tag:
            self.tag_path.pop()
        
    def handle_data(self, data):
        stripped = data.strip()
        if stripped and len(stripped) > 3:
            if self.current_tag not in ['script', 'style']:
                self.text_blocks.append({
                    'text': stripped,
                    'tag': self.current_tag,
                    'length': len(stripped)
                })

def suggest_variable_name(text: str, index: int) -> str:
    text_lower = text.lower()
    
    keywords = {
        'название': 'event_name',
        'имя': 'name',
        'дата': 'event_date',
        'время': 'event_time',
        'описание': 'description',
        'спикер': 'speaker_name',
        'тема': 'topic',
        'программа': 'program',
        'место': 'location',
        'ссылка': 'link',
        'цена': 'price',
        'преимущества': 'benefits',
        'выгоды': 'benefits',
    }
    
    for keyword, var_name in keywords.items():
        if keyword in text_lower:
            return var_name
    
    if len(text) > 100:
        return f'content_block_{index + 1}'
    elif len(text) > 50:
        return f'description_{index + 1}'
    else:
        return f'text_{index + 1}'

def convert_to_template(html: str) -> Tuple[str, List[Dict]]:
    parser = TextExtractor()
    parser.feed(html)
    
    result_html = html
    variables = []
    
    for idx, block in enumerate(parser.text_blocks):
        text = block['text']
        
        if len(text) < 5 or text in ['&nbsp;', '\n', '\t']:
            continue
        
        var_name = suggest_variable_name(text, idx)
        
        if var_name in [v['name'] for v in variables]:
            counter = 2
            while f"{var_name}_{counter}" in [v['name'] for v in variables]:
                counter += 1
            var_name = f"{var_name}_{counter}"
        
        variable_placeholder = '{{' + var_name + '}}'
        
        result_html = result_html.replace(text, variable_placeholder, 1)
        
        variables.append({
            'name': var_name,
            'original_text': text,
            'suggested_type': 'text' if len(text) < 100 else 'long_text',
            'tag': block['tag']
        })
    
    return result_html, variables

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
        
        template_html, variables = convert_to_template(html_content)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'original_html': html_content,
                'template_html': template_html,
                'variables': variables,
                'variables_count': len(variables)
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
