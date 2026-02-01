-- Add status column to trainings table
ALTER TABLE trainings ADD COLUMN status TEXT NOT NULL DEFAULT 'plan';

-- Create index for status queries
CREATE INDEX idx_trainings_status ON trainings(status);

-- Update RLS policies to handle status
DROP POLICY IF EXISTS "Users can view their own trainings" ON trainings;
DROP POLICY IF EXISTS "Users can insert their own trainings" ON trainings;
DROP POLICY IF EXISTS "Users can update their own trainings" ON trainings;
DROP POLICY IF EXISTS "Users can delete their own trainings" ON trainings;

-- Recreate policies with status considerations
CREATE POLICY "Users can view their own trainings" ON trainings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trainings" ON trainings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trainings" ON trainings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trainings" ON trainings
  FOR DELETE USING (auth.uid() = user_id);
