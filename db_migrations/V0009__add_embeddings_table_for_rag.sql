CREATE TABLE IF NOT EXISTS kb_embeddings (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(255),
    chunk_text TEXT NOT NULL,
    chunk_metadata JSONB,
    embedding_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES kb_events(event_id)
);

CREATE INDEX IF NOT EXISTS kb_embeddings_event_idx ON kb_embeddings(event_id);
CREATE INDEX IF NOT EXISTS kb_embeddings_type_idx ON kb_embeddings(content_type);