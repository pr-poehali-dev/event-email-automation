-- Добавляем уникальное ограничение на event_id для kb_program
ALTER TABLE kb_program ADD CONSTRAINT kb_program_event_id_unique UNIQUE (event_id);