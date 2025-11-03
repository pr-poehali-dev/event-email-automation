-- Добавляем поля для хранения результатов анализа шаблона
ALTER TABLE email_templates 
ADD COLUMN IF NOT EXISTS analyzed_blocks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS required_variables JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS template_with_variables TEXT,
ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN email_templates.analyzed_blocks IS 'Результат analyze-template: массив блоков с типами и переменными';
COMMENT ON COLUMN email_templates.required_variables IS 'Массив имён обязательных переменных (preheader, headline, cta)';
COMMENT ON COLUMN email_templates.template_with_variables IS 'HTML с подставленными {{variable_name}}';
COMMENT ON COLUMN email_templates.conditions IS 'Повторяемые/условные блоки (speakers, agenda)';