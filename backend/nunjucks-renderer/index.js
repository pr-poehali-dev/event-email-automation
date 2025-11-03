/**
 * Business: Render HTML email from Nunjucks template + JSON content
 * Args: event with httpMethod, body containing template_html, content (JSON)
 * Returns: HTTP response with rendered HTML
 */

const nunjucks = require('nunjucks');

exports.handler = async (event, context) => {
    const { httpMethod, body } = event;
    
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            body: '',
            isBase64Encoded: false
        };
    }
    
    if (httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Method not allowed' }),
            isBase64Encoded: false
        };
    }
    
    try {
        const bodyData = JSON.parse(body || '{}');
        const { template_html, content } = bodyData;
        
        if (!template_html || !content) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'template_html and content are required' }),
                isBase64Encoded: false
            };
        }
        
        nunjucks.configure({ autoescape: true });
        
        const renderedHtml = nunjucks.renderString(template_html, content);
        
        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                html: renderedHtml,
                content_keys: Object.keys(content),
                rendered_at: new Date().toISOString()
            }),
            isBase64Encoded: false
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                error: 'Rendering failed',
                details: error.message
            }),
            isBase64Encoded: false
        };
    }
};
