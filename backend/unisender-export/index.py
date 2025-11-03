'''
Business: Export email campaign to UniSender as draft
Args: event - dict with campaign_name, subject, html, event_id
Returns: HTTP response with UniSender campaign_id
'''
import json
import os
from typing import Dict, Any
import requests

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
    campaign_name: str = body_data.get('campaign_name')
    subject: str = body_data.get('subject')
    html_body: str = body_data.get('html')
    sender_name: str = body_data.get('sender_name', 'EmailGen AI')
    sender_email: str = body_data.get('sender_email', 'noreply@example.com')
    
    if not all([campaign_name, subject, html_body]):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'campaign_name, subject, and html required'})
        }
    
    api_key = os.environ.get('UNISENDER_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'UNISENDER_API_KEY not configured'})
        }
    
    # Step 1: Create email message
    message_data = {
        'api_key': api_key,
        'sender_name': sender_name,
        'sender_email': sender_email,
        'subject': subject,
        'body': html_body,
        'list_id': body_data.get('list_id', ''),
        'lang': 'ru'
    }
    
    create_response = requests.post(
        'https://api.unisender.com/ru/api/createEmailMessage',
        params={'format': 'json'},
        data=message_data
    )
    
    if create_response.status_code != 200:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Failed to create campaign',
                'details': create_response.text
            })
        }
    
    create_data = create_response.json()
    
    if 'error' in create_data:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'UniSender API error',
                'details': create_data.get('error')
            })
        }
    
    message_id = create_data.get('result', {}).get('message_id')
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'status': 'success',
            'message_id': message_id,
            'campaign_name': campaign_name,
            'message': 'Email message created in UniSender. You can now create a campaign in UniSender dashboard.'
        })
    }