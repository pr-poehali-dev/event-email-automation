-- Кампании (контент-план)
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Письма в кампании
CREATE TABLE IF NOT EXISTS campaign_emails (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id),
    template_id INTEGER REFERENCES email_templates(id),
    content_type_id INTEGER REFERENCES content_types(id),
    subject VARCHAR(255),
    generated_html TEXT,
    unisender_draft_id VARCHAR(100),
    validation_status JSONB,
    send_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Версии писем (для истории изменений)
CREATE TABLE IF NOT EXISTS email_versions (
    id SERIAL PRIMARY KEY,
    campaign_email_id INTEGER REFERENCES campaign_emails(id),
    version_number INTEGER NOT NULL,
    html_content TEXT NOT NULL,
    subject VARCHAR(255),
    changes_log TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_campaign_event ON campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_campaign ON campaign_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_versions_email ON email_versions(campaign_email_id);
