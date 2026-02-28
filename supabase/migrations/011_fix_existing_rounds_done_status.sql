-- Update existing rounds to have done status set to false
-- This ensures all existing rounds have the done field properly set
UPDATE rounds SET done = false WHERE done IS NULL;

-- Verify the update
SELECT COUNT(*) as total_rounds, COUNT(CASE WHEN done = true THEN 1 END) as done_rounds, COUNT(CASE WHEN done = false THEN 1 END) as not_done_rounds FROM rounds;
