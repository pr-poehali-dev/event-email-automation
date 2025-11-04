import json
import os
from html.parser import HTMLParser
from typing import Dict, Any, List, Tuple
from openai import OpenAI
import httpx

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Analyze HTML email template and extract semantic blocks with AI classification
    Args: event - dict with httpMethod, body containing html_content
          context - object with request_id, function_name attributes
    Returns: HTTP response with analyzed blocks, variables, and template with placeholders
    '''
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
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    html_content = body_data.get('html_content', '')
    
    if not html_content:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'html_content is required'})
        }
    
    parser = EmailHTMLParser()
    parser.feed(html_content)
    blocks = parser.get_blocks()
    
    if not blocks:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'original_html': html_content,
                'template_html': html_content,
                'blocks': [],
                'variables': [],
                'blocks_count': 0
            })
        }
    
    openai_api_key = os.environ.get('OPENAI_API_KEY', '')
    proxy_url = os.environ.get('OPENAI_PROXY_URL')
    
    http_client = httpx.Client(proxies=proxy_url) if proxy_url else None
    client = OpenAI(api_key=openai_api_key, http_client=http_client)
    
    blocks_text = '\n'.join([
        f"{i+1}. Tag: {b['tag']}, Text: {b['text'][:100]}..." 
        for i, b in enumerate(blocks)
    ])
    
    prompt = f"""Analyze these HTML email blocks and classify each one.

Blocks:
{blocks_text}

For each block, return JSON array with:
- block_index (number, 1-based)
- block_type (one of: preheader, headline, subheadline, body, cta, agenda, speaker, benefits, social_proof, deadline, footer, other)
- variable_name (suggested variable name in snake_case)
- confidence (0.0 to 1.0)

Block types:
- preheader: preview text (50-100 chars)
- headline: main heading (h1, h2, large text)
- subheadline: secondary heading
- body: descriptive paragraph text
- cta: call-to-action button/link
- agenda: event schedule/program
- speaker: speaker information
- benefits: list of advantages
- social_proof: testimonials, cases, results
- deadline: deadline/urgency info
- footer: email footer, contacts, unsubscribe
- other: everything else

Return ONLY valid JSON array, no markdown formatting."""

    response = client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[
            {'role': 'system', 'content': 'You are an expert at analyzing email HTML structure. Return only valid JSON.'},
            {'role': 'user', 'content': prompt}
        ],
        temperature=0.3
    )
    
    ai_response = response.choices[0].message.content.strip()
    
    if ai_response.startswith('```json'):
        ai_response = ai_response[7:]
    if ai_response.startswith('```'):
        ai_response = ai_response[3:]
    if ai_response.endswith('```'):
        ai_response = ai_response[:-3]
    
    classifications = json.loads(ai_response.strip())
    
    for classification in classifications:
        idx = classification['block_index'] - 1
        if 0 <= idx < len(blocks):
            blocks[idx]['block_type'] = classification['block_type']
            blocks[idx]['variable_name'] = classification['variable_name']
            blocks[idx]['confidence'] = classification['confidence']
    
    variables = []
    for block in blocks:
        if 'variable_name' in block:
            variables.append({
                'name': block['variable_name'],
                'type': block.get('block_type', 'other'),
                'original_text': block['text'][:200],
                'confidence': block.get('confidence', 0.0)
            })
    
    template_html = html_content
    for block in blocks:
        if 'variable_name' in block and block['text']:
            placeholder = '{{' + block['variable_name'] + '}}'
            template_html = template_html.replace(block['text'], placeholder, 1)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'original_html': html_content,
            'template_html': template_html,
            'blocks': blocks,
            'variables': variables,
            'blocks_count': len(blocks)
        }, ensure_ascii=False)
    }


class EmailHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.blocks: List[Dict[str, Any]] = []
        self.current_tag: str = ''
        self.current_text: str = ''
        self.current_attrs: Dict[str, str] = {}
        self.ignore_tags = {'script', 'style', 'head', 'meta', 'link'}
    
    def handle_starttag(self, tag: str, attrs: List[Tuple[str, str]]):
        if tag not in self.ignore_tags:
            self.current_tag = tag
            self.current_attrs = dict(attrs)
    
    def handle_data(self, data: str):
        text = data.strip()
        if text and self.current_tag and self.current_tag not in self.ignore_tags:
            self.current_text = text
    
    def handle_endtag(self, tag: str):
        if tag not in self.ignore_tags and self.current_text:
            self.blocks.append({
                'text': self.current_text,
                'tag': self.current_tag,
                'length': len(self.current_text),
                'attrs': self.current_attrs.copy()
            })
            self.current_text = ''
            self.current_attrs = {}
    
    def get_blocks(self) -> List[Dict[str, Any]]:
        return self.blocks
