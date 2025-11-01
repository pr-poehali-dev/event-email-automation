CREATE TABLE content_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE email_templates 
ADD COLUMN content_type_id INTEGER REFERENCES content_types(id);

CREATE INDEX idx_templates_content_type ON email_templates(content_type_id);

INSERT INTO content_types (name, description, icon) VALUES
('invitation', 'Приглашение на событие', 'Mail'),
('reminder', 'Напоминание участникам', 'Bell'),
('announcement', 'Анонс и новости', 'Megaphone'),
('followup', 'Дополнительная информация', 'MessageSquare'),
('confirmation', 'Подтверждение регистрации', 'CheckCircle'),
('thankyou', 'Благодарность за участие', 'Heart');