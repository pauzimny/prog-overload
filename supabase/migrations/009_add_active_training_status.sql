-- Add check constraint for training status values
ALTER TABLE trainings ADD CONSTRAINT training_status_check 
  CHECK (status IN ('plan', 'active', 'done'));

-- Update any existing records that might have invalid status (if any)
UPDATE trainings SET status = 'plan' WHERE status NOT IN ('plan', 'active', 'done');
