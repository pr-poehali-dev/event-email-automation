-- Add embedding column as JSONB array (will store float array from OpenAI)
ALTER TABLE t_p17985067_event_email_automati.kb_embeddings 
ADD COLUMN IF NOT EXISTS embedding_vector jsonb;

-- Add index on event_id + content_type for fast filtering
CREATE INDEX IF NOT EXISTS kb_embeddings_event_type_idx 
ON t_p17985067_event_email_automati.kb_embeddings(event_id, content_type);

-- Add GIN index for metadata search
CREATE INDEX IF NOT EXISTS kb_embeddings_metadata_idx 
ON t_p17985067_event_email_automati.kb_embeddings 
USING GIN (chunk_metadata);