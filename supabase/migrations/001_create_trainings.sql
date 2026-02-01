-- Create trainings table
CREATE TABLE trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comments TEXT
);

-- Create exercises table
CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rounds table
CREATE TABLE rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  weight DECIMAL(10,2) NOT NULL,
  reps INTEGER NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_trainings_user_id ON trainings(user_id);
CREATE INDEX idx_trainings_created_at ON trainings(created_at DESC);
CREATE INDEX idx_exercises_training_id ON exercises(training_id);
CREATE INDEX idx_rounds_exercise_id ON rounds(exercise_id);

-- Enable RLS (Row Level Security)
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trainings
CREATE POLICY "Users can view own trainings" ON trainings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trainings" ON trainings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trainings" ON trainings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trainings" ON trainings
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for exercises (through trainings)
CREATE POLICY "Users can view own exercises" ON exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trainings 
      WHERE trainings.id = exercises.training_id 
      AND trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercises" ON exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trainings 
      WHERE trainings.id = exercises.training_id 
      AND trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercises" ON exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM trainings 
      WHERE trainings.id = exercises.training_id 
      AND trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercises" ON exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM trainings 
      WHERE trainings.id = exercises.training_id 
      AND trainings.user_id = auth.uid()
    )
  );

-- Create RLS policies for rounds (through exercises and trainings)
CREATE POLICY "Users can view own rounds" ON rounds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN trainings ON trainings.id = exercises.training_id
      WHERE exercises.id = rounds.exercise_id 
      AND trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own rounds" ON rounds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN trainings ON trainings.id = exercises.training_id
      WHERE exercises.id = rounds.exercise_id 
      AND trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own rounds" ON rounds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN trainings ON trainings.id = exercises.training_id
      WHERE exercises.id = rounds.exercise_id 
      AND trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own rounds" ON rounds
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN trainings ON trainings.id = exercises.training_id
      WHERE exercises.id = rounds.exercise_id 
      AND trainings.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON trainings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
