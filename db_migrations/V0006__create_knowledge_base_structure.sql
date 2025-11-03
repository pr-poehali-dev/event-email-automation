-- Таблица для brand.json (общая инфо о бренде)
CREATE TABLE IF NOT EXISTS kb_brand (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    support_email VARCHAR(255),
    phone VARCHAR(50),
    site VARCHAR(255),
    legal JSONB,
    logos JSONB,
    social JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для defaults.json (дефолтные настройки)
CREATE TABLE IF NOT EXISTS kb_defaults (
    id SERIAL PRIMARY KEY,
    locale VARCHAR(10) DEFAULT 'ru-RU',
    utm JSONB,
    preheader TEXT,
    cta_texts JSONB,
    date_format VARCHAR(50) DEFAULT 'DD.MM.YYYY',
    time_format VARCHAR(50) DEFAULT 'HH:mm',
    currency VARCHAR(10) DEFAULT 'RUB',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для taxonomy.json (классификаторы)
CREATE TABLE IF NOT EXISTS kb_taxonomy (
    id SERIAL PRIMARY KEY,
    email_types JSONB,
    blocks JSONB,
    placeholders JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица событий (расширенная версия events)
CREATE TABLE IF NOT EXISTS kb_events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    site VARCHAR(255),
    landing VARCHAR(255),
    dates JSONB,
    location VARCHAR(255),
    venue VARCHAR(255),
    streams JSONB,
    contacts JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица спикеров события
CREATE TABLE IF NOT EXISTS kb_speakers (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) REFERENCES kb_events(event_id),
    speaker_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    company VARCHAR(255),
    topic TEXT,
    bio TEXT,
    photo VARCHAR(500),
    links JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, speaker_id)
);

-- Таблица программы (program/index.json)
CREATE TABLE IF NOT EXISTS kb_program (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) REFERENCES kb_events(event_id),
    days JSONB,
    sections JSONB,
    talks JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица секций программы
CREATE TABLE IF NOT EXISTS kb_sections (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) REFERENCES kb_events(event_id),
    section_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags JSONB,
    day_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, section_id)
);

-- Таблица докладов
CREATE TABLE IF NOT EXISTS kb_talks (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) REFERENCES kb_events(event_id),
    talk_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    speaker_id VARCHAR(100),
    start_time VARCHAR(10),
    end_time VARCHAR(10),
    abstract TEXT,
    keywords JSONB,
    section_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, talk_id)
);

-- Таблица билетов
CREATE TABLE IF NOT EXISTS kb_tickets (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) REFERENCES kb_events(event_id),
    plans JSONB,
    deadlines JSONB,
    promo JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица контента (content.json)
CREATE TABLE IF NOT EXISTS kb_content (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) REFERENCES kb_events(event_id),
    claims JSONB,
    subjects JSONB,
    preheaders JSONB,
    faq JSONB,
    cta_texts JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица ассетов
CREATE TABLE IF NOT EXISTS kb_assets (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) REFERENCES kb_events(event_id),
    images JSONB,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица кампаний (campaigns.json)
CREATE TABLE IF NOT EXISTS kb_campaigns (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) REFERENCES kb_events(event_id),
    campaign_type VARCHAR(100) NOT NULL,
    subject_a TEXT,
    subject_b TEXT,
    preheader TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, campaign_type)
);

-- Таблица источников данных
CREATE TABLE IF NOT EXISTS kb_data_sources (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) REFERENCES kb_events(event_id),
    source_type VARCHAR(50) NOT NULL,
    source_url TEXT,
    config JSONB,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем базовые данные
INSERT INTO kb_brand (name, support_email, phone, site, legal, logos, social) VALUES
('Конференция HUMAN', 'tickets@potokconf.ru', '+7 (495) 241-02-68', 'https://humanconf.ru',
 '{"unsubscribeText": "Вы получили это письмо, потому что зарегистрировались на нашем сайте", "address": "Москва", "senderName": "Команда HUMAN"}',
 '{"primary": "https://potokconf.ru/upload/email/human_logo.png", "dark": "https://potokconf.ru/upload/email/human_logo_dark.png"}',
 '{"tg": "https://t.me/humanconf", "vk": "https://vk.com/humanconf"}');

INSERT INTO kb_defaults (locale, utm, preheader, cta_texts, date_format, time_format, currency) VALUES
('ru-RU',
 '{"utm_source": "email", "utm_medium": "campaign", "utm_campaign": "event_generic"}',
 'Краткое интро к письму (40–90 символов).',
 '{"defaultTop": "Подробнее", "defaultBottom": "Посмотреть программу"}',
 'DD.MM.YYYY', 'HH:mm', 'RUB');

INSERT INTO kb_taxonomy (email_types, blocks, placeholders) VALUES
('["sales_via_pain", "reminder_d3", "last_call", "speakers_digest", "aftermovie"]',
 '["hero", "speakers", "agenda", "tickets", "sponsors", "faq"]',
 '{"title": "text", "preheader": "text", "cta_top_url": "url", "cta_top_text": "text", "cta_bottom_url": "url", "cta_bottom_text": "text"}');