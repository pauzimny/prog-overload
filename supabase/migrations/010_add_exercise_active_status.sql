-- Add active column to exercises table
ALTER TABLE exercises ADD COLUMN active BOOLEAN DEFAULT FALSE;

-- Update RLS policies to handle active field (no changes needed as existing policies cover all fields)

-- Create index for active queries within trainings
CREATE INDEX idx_exercises_active ON exercises(active, training_id);
