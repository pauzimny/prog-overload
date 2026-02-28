-- Verify and ensure done column exists in rounds table
DO $$
BEGIN
    -- Check if done column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rounds' 
        AND column_name = 'done' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE rounds ADD COLUMN done BOOLEAN DEFAULT FALSE;
        
        -- Create index for done status
        CREATE INDEX IF NOT EXISTS idx_rounds_done ON rounds(done);
        
        RAISE NOTICE 'Added done column to rounds table';
    ELSE
        RAISE NOTICE 'Done column already exists in rounds table';
    END IF;
END $$;

-- Update any existing rows that might have NULL done values
UPDATE rounds SET done = false WHERE done IS NULL;

-- Show the current schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'rounds' AND table_schema = 'public'
ORDER BY ordinal_position;
