-- Таблица контент-блоков (JSON структуры)
CREATE TABLE IF NOT EXISTS content_blocks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    json_schema JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сегментов аудитории
CREATE TABLE IF NOT EXISTS audience_segments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    pain_points JSONB,
    value_props JSONB,
    copy_pattern VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица маппинга: сегмент → блоки
CREATE TABLE IF NOT EXISTS segment_block_mapping (
    id SERIAL PRIMARY KEY,
    segment_id INTEGER REFERENCES audience_segments(id),
    block_type VARCHAR(50) NOT NULL,
    priority INTEGER DEFAULT 0,
    conditions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица шаблонов с Nunjucks
CREATE TABLE IF NOT EXISTS email_templates_v2 (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    html_template TEXT NOT NULL,
    base_styles TEXT,
    placeholders JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем базовые блоки контента
INSERT INTO content_blocks (name, type, json_schema) VALUES
('Hero', 'hero', '{"title": "string", "subtitle": "string", "preheader": "string"}'),
('Agenda', 'agenda', '{"has_agenda": "boolean", "items": [{"time": "string", "topic": "string", "speaker": "string"}]}'),
('Speaker Card', 'speaker', '{"name": "string", "title": "string", "bio": "string", "photo_url": "string"}'),
('Social Proof', 'social_proof', '{"testimonial": "string", "author": "string", "company": "string", "stats": [{"label": "string", "value": "string"}]}'),
('CTA', 'cta', '{"text": "string", "url": "string", "style": "string"}'),
('Pain Point', 'pain', '{"problem": "string", "solution": "string", "benefit": "string"}');

-- Вставляем базовые сегменты
INSERT INTO audience_segments (name, description, pain_points, value_props, copy_pattern) VALUES
('Новые пользователи', 'Первое касание с брендом', 
 '["Не знают о продукте", "Сомневаются в ценности", "Нужно социальное доказательство"]',
 '["Бесплатная регистрация", "Реальные кейсы", "Гарантия результата"]',
 'problem_solution_social_cta'),
 
('Зарегистрированные не подтвердившие', 'Начали регистрацию, не завершили',
 '["Забыли подтвердить", "Не видят срочности", "Технические проблемы"]',
 '["Быстрое подтверждение", "Ограничение мест", "Помощь в регистрации"]',
 'urgency_benefit_cta'),
 
('Активные участники', 'Посещали мероприятия ранее',
 '["Хотят больше пользы", "Ищут нетворкинг", "Нужны конкретные знания"]',
 '["Эксклюзивный контент", "VIP-зона", "Персональные встречи"]',
 'exclusive_value_cta');

-- Маппинг блоков для сегментов
INSERT INTO segment_block_mapping (segment_id, block_type, priority) VALUES
(1, 'social_proof', 1),
(1, 'hero', 2),
(1, 'pain', 3),
(1, 'agenda', 4),
(1, 'cta', 5),

(2, 'hero', 1),
(2, 'pain', 2),
(2, 'cta', 3),

(3, 'hero', 1),
(3, 'agenda', 2),
(3, 'speaker', 3),
(3, 'cta', 4);