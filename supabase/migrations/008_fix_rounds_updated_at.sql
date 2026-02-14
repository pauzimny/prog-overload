-- Fix missing updated_at column in rounds table
-- This migration ensures the updated_at column exists and has proper triggers

-- Add updated_at column if it doesn't exist (DO NOTHING if it already exists)
DO $$
BEGIN
    ALTER TABLE rounds ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN NULL;
END;
$$;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_rounds_updated_at_on_done_change ON rounds;
DROP TRIGGER IF EXISTS update_rounds_updated_at ON rounds;

-- Recreate the function and trigger for done status changes
CREATE OR REPLACE FUNCTION update_round_updated_at_on_done_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.done IS DISTINCT FROM NEW.done THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for done status changes
CREATE TRIGGER update_rounds_updated_at_on_done_change
  BEFORE UPDATE ON rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_round_updated_at_on_done_change();

-- Create trigger to automatically update updated_at for any changes
CREATE TRIGGER update_rounds_updated_at
  BEFORE UPDATE ON rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
