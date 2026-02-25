-- Migration 008: Add Full-Text Search Index
-- Adds GIN index for PostgreSQL full-text search on task title and description

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_tasks_search ON tasks 
USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- Add comment for documentation
COMMENT ON INDEX idx_tasks_search IS 'Full-text search index for task title and description';

-- Note: Search queries should use:
-- WHERE to_tsvector('english', title || ' ' || description) @@ to_tsquery('english', search_query)
-- ORDER BY ts_rank(to_tsvector(...), query) DESC
