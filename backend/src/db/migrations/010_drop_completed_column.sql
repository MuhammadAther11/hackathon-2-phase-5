-- Migration 010: Fix deprecated completed column
-- Add default value to existing completed column to prevent NOT NULL violations

DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tasks' AND column_name = 'completed') THEN
        -- Set default value for existing rows
        UPDATE tasks SET completed = FALSE WHERE completed IS NULL;
        -- Add default constraint
        ALTER TABLE tasks ALTER COLUMN completed SET DEFAULT FALSE;
        -- Make column nullable to prevent future issues
        ALTER TABLE tasks ALTER COLUMN completed DROP NOT NULL;
    END IF;
END $$;
