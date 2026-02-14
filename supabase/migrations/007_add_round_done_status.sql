-- Add done status to rounds table
ALTER TABLE rounds ADD COLUMN done BOOLEAN DEFAULT FALSE;

-- Add updated_at column to rounds table for trigger
ALTER TABLE rounds ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for better performance on done status queries
CREATE INDEX idx_rounds_done ON rounds(done);

-- Update updated_at when done status changes
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

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_rounds_updated_at
  BEFORE UPDATE ON rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
