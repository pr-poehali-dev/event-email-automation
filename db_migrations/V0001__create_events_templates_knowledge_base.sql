CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    next_send_date DATE,
    subscribers_count INTEGER DEFAULT 0,
    open_rate DECIMAL(5,2) DEFAULT 0,
    click_rate DECIMAL(5,2) DEFAULT 0,
    google_sheets_url TEXT,
    google_docs_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    html_content TEXT NOT NULL,
    subject_template TEXT,
    cta_text VARCHAR(255),
    cta_color VARCHAR(50) DEFAULT '#BB35E0',
    unisender_list_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content_slots (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES email_templates(id),
    slot_name VARCHAR(100) NOT NULL,
    slot_type VARCHAR(50) NOT NULL,
    default_content TEXT,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_base (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    content_type VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    source VARCHAR(255),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_campaigns (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    template_id INTEGER REFERENCES email_templates(id),
    subject VARCHAR(500),
    html_body TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_templates_event ON email_templates(event_id);
CREATE INDEX idx_templates_type ON email_templates(type);
CREATE INDEX idx_knowledge_event ON knowledge_base(event_id);
CREATE INDEX idx_knowledge_type ON knowledge_base(content_type);
CREATE INDEX idx_campaigns_event ON email_campaigns(event_id);
CREATE INDEX idx_campaigns_status ON email_campaigns(status);