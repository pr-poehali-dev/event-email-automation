ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS recipe_min_fields JSONB,
ADD COLUMN IF NOT EXISTS required_variables JSONB;

ALTER TABLE email_versions
ADD COLUMN IF NOT EXISTS recipe_version VARCHAR(20),
ADD COLUMN IF NOT EXISTS transform_version VARCHAR(20),
ADD COLUMN IF NOT EXISTS inputs_hash VARCHAR(32);

CREATE INDEX IF NOT EXISTS idx_email_versions_inputs_hash ON email_versions(inputs_hash);

COMMENT ON COLUMN templates.recipe_min_fields IS 'Минимальные обязательные поля для рецепта (JSON array)';
COMMENT ON COLUMN templates.required_variables IS 'Обязательные переменные шаблона (JSON array)';
COMMENT ON COLUMN email_versions.recipe_version IS 'Версия рецепта генерации';
COMMENT ON COLUMN email_versions.transform_version IS 'Версия функций трансформации';
COMMENT ON COLUMN email_versions.inputs_hash IS 'SHA256 хеш входных данных для воспроизводимости';