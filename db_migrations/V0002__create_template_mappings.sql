CREATE TABLE IF NOT EXISTS template_mappings (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES email_templates(id),
    content_type_id INTEGER REFERENCES content_types(id),
    variable VARCHAR(100) NOT NULL,
    source VARCHAR(255) NOT NULL,
    transform VARCHAR(100),
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_id, content_type_id, variable)
);

CREATE INDEX idx_template_mappings_template ON template_mappings(template_id);
CREATE INDEX idx_template_mappings_content_type ON template_mappings(content_type_id);

COMMENT ON TABLE template_mappings IS 'Маппинг переменных шаблонов на источники данных';
COMMENT ON COLUMN template_mappings.source IS 'Источник данных: static, Event.field, ContentPlan.field';
COMMENT ON COLUMN template_mappings.transform IS 'Функция трансформации: render_speakers_cards, render_agenda_ul, short_intro';
COMMENT ON COLUMN template_mappings.value IS 'Значение для source=static';