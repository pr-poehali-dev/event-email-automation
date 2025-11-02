-- Таблица для переменных шаблонов с описаниями
CREATE TABLE template_variables (
    id SERIAL PRIMARY KEY,
    content_type_id INTEGER REFERENCES content_types(id),
    variable_name VARCHAR(100) NOT NULL,
    variable_description TEXT NOT NULL,
    default_value TEXT,
    is_required BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по типу контента
CREATE INDEX idx_template_variables_content_type ON template_variables(content_type_id);

-- Комментарий к таблице
COMMENT ON TABLE template_variables IS 'Переменные для шаблонов писем с описаниями для AI генерации';
COMMENT ON COLUMN template_variables.variable_name IS 'Имя переменной (без фигурных скобок, например: event_name)';
COMMENT ON COLUMN template_variables.variable_description IS 'Описание переменной для AI - что должно быть в этом поле';
COMMENT ON COLUMN template_variables.default_value IS 'Значение по умолчанию если AI не может заполнить';
COMMENT ON COLUMN template_variables.is_required IS 'Обязательная ли переменная';
COMMENT ON COLUMN template_variables.display_order IS 'Порядок отображения в UI';