# Analyze-Template Backend Function Test Report

## Test Configuration

**Endpoint URL:** `https://functions.poehali.dev/45e6f3f6-377e-4e0d-9350-09aa87d3e584`

**Method:** POST

**Test Payload:**
```json
{
  "html_content": "<html><head><title>Вебинар</title></head><body><h1>Увеличьте продажи в 2 раза</h1><p>Приглашаем на вебинар по эффективным продажам</p><h2>Спикер: Иван Петров</h2><p>Эксперт с 10-летним опытом</p><a href='https://example.com/register'>Зарегистрироваться сейчас</a><p>До конца акции осталось 3 дня</p></body></html>"
}
```

## Function Analysis (Based on Source Code)

### What the Function Does

The `analyze-template` function is designed to:

1. **Parse HTML Content**: Takes an HTML email template as input
2. **Extract Text Blocks**: Identifies meaningful text blocks from the HTML
3. **AI-Powered Classification**: Uses GPT-4o-mini to classify each block into types:
   - `preheader` - Preview text (50-100 characters)
   - `headline` - Main heading (h1, h2, large text)
   - `subheadline` - Subheading or clarification
   - `body` - Main descriptive text
   - `cta` - Call-to-action buttons/links
   - `agenda` - Event schedule/program
   - `speaker` - Speaker information
   - `benefits` - List of advantages
   - `social_proof` - Testimonials, cases, results
   - `deadline` - Deadline information
   - `footer` - Email footer, contacts, unsubscribe
   - `other` - Other content

4. **Generate Variables**: Creates variable names for each block (e.g., `event_name`, `speaker_bio`, `cta_button`)
5. **Create Template**: Replaces original text with variable placeholders (`{{variable_name}}`)
6. **Return Confidence Scores**: Provides confidence levels (0.0-1.0) for each classification

### Expected Response Structure

```json
{
  "original_html": "string - the input HTML",
  "template_html": "string - HTML with {{variable}} placeholders",
  "blocks": [
    {
      "text": "string - original text content",
      "tag": "string - HTML tag (h1, p, a, etc.)",
      "length": "number - text length",
      "attrs": "object - HTML attributes",
      "block_type": "string - classified type",
      "variable_name": "string - suggested variable name",
      "confidence": "number - 0.0 to 1.0"
    }
  ],
  "variables": [
    {
      "name": "string - variable name",
      "type": "string - block type",
      "original_text": "string - first 200 chars of original",
      "confidence": "number - 0.0 to 1.0"
    }
  ],
  "blocks_count": "number - total blocks detected"
}
```

## Expected Test Results

### For the Provided Test HTML

The test HTML contains the following elements:
1. Title: "Вебинар"
2. H1: "Увеличьте продажи в 2 раза"
3. Paragraph: "Приглашаем на вебинар по эффективным продажам"
4. H2: "Спикер: Иван Петров"
5. Paragraph: "Эксперт с 10-летним опытом"
6. Link: "Зарегистрироваться сейчас"
7. Paragraph: "До конца акции осталось 3 дня"

### Expected Outcome

**1. HTTP Status Code:** `200 OK`

**2. Request Success:** `YES`

**3. Summary:**
- **Total Blocks Detected:** ~6-7 blocks
- **Block Types Breakdown (predicted):**
  - `headline`: 1 block (H1 - "Увеличьте продажи в 2 раза")
  - `body`: 1 block (invitation paragraph)
  - `speaker`: 2 blocks (H2 and bio)
  - `cta`: 1 block (registration link)
  - `deadline`: 1 block (3 days remaining)

- **Variables Detected:** 6-7 variables

**Sample Variable Details (predicted):**
1. `event_headline` (headline) - "Увеличьте продажи в 2 раза"
2. `event_description` (body) - "Приглашаем на вебинар..."
3. `speaker_name` (speaker) - "Спикер: Иван Петров"
4. `speaker_bio` (speaker) - "Эксперт с 10-летним опытом"
5. `cta_button` (cta) - "Зарегистрироваться сейчас"
6. `deadline_text` (deadline) - "До конца акции осталось 3 дня"

**4. Errors:** None expected (assuming OpenAI API is configured correctly)

## Potential Error Scenarios

### Possible HTTP Status Codes

- **200**: Success - HTML analyzed and blocks detected
- **400**: Bad Request - Missing or invalid `html_content` parameter
- **405**: Method Not Allowed - Using GET instead of POST
- **500**: Internal Server Error - Possible causes:
  - Missing `OPENAI_API_KEY` environment variable
  - OpenAI API errors
  - HTML parsing errors

### Error Response Format

```json
{
  "error": "error message",
  "details": "detailed error information (for 500 errors)"
}
```

## How to Test Manually

### Using curl:

```bash
curl -X POST https://functions.poehali.dev/45e6f3f6-377e-4e0d-9350-09aa87d3e584 \
  -H "Content-Type: application/json" \
  -d '{"html_content":"<html><head><title>Вебинар</title></head><body><h1>Увеличьте продажи в 2 раза</h1><p>Приглашаем на вебинар по эффективным продажам</p><h2>Спикер: Иван Петров</h2><p>Эксперт с 10-летним опытом</p><a href=\"https://example.com/register\">Зарегистрироваться сейчас</a><p>До конца акции осталось 3 дня</p></body></html>"}'
```

### Using JavaScript (fetch):

```javascript
fetch('https://functions.poehali.dev/45e6f3f6-377e-4e0d-9350-09aa87d3e584', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    html_content: "<html><head><title>Вебинар</title></head><body><h1>Увеличьте продажи в 2 раза</h1><p>Приглашаем на вебинар по эффективным продажам</p><h2>Спикер: Иван Петров</h2><p>Эксперт с 10-летним опытом</p><a href='https://example.com/register'>Зарегистрироваться сейчас</a><p>До конца акции осталось 3 дня</p></body></html>"
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Using Python:

```python
import requests
import json

url = 'https://functions.poehali.dev/45e6f3f6-377e-4e0d-9350-09aa87d3e584'
payload = {
    "html_content": "<html><head><title>Вебинар</title></head><body><h1>Увеличьте продажи в 2 раза</h1><p>Приглашаем на вебинар по эффективным продажам</p><h2>Спикер: Иван Петров</h2><p>Эксперт с 10-летним опытом</p><a href='https://example.com/register'>Зарегистрироваться сейчас</a><p>До конца акции осталось 3 дня</p></body></html>"
}

response = requests.post(url, json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
```

## Function Dependencies

- **OpenAI API** (GPT-4o-mini model) - Used for AI-powered block classification
- **Python Libraries:**
  - `json` - JSON parsing
  - `re` - Regular expressions (imported but not actively used)
  - `html.parser.HTMLParser` - HTML parsing
  - `openai` - OpenAI API client
  - `httpx` - HTTP client (for proxy support)

## Environment Variables Required

- `OPENAI_API_KEY` - Required for AI classification
- `OPENAI_PROXY_URL` - Optional proxy URL for OpenAI requests

## CORS Configuration

The function supports CORS with:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`
- Handles preflight OPTIONS requests

---

**Note:** This report is based on source code analysis. Actual API testing would require executing the POST request, which couldn't be completed due to tool limitations (web_fetch only supports GET requests).
