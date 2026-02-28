-- Check if done column exists in rounds table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'rounds' AND table_schema = 'public'
ORDER BY ordinal_position;
