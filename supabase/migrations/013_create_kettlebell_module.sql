-- Create kettlebell trainings table
CREATE TABLE kettlebell_trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  links TEXT[] NOT NULL DEFAULT '{}',
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create kettlebell exercises table
CREATE TABLE kettlebell_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID NOT NULL REFERENCES kettlebell_trainings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create kettlebell rounds table
CREATE TABLE kettlebell_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES kettlebell_exercises(id) ON DELETE CASCADE,
  weight DECIMAL(10,2) NOT NULL CHECK (weight >= 0),
  reps INTEGER CHECK (reps > 0),
  time_minutes INTEGER CHECK (time_minutes > 0),
  comments TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT kettlebell_rounds_reps_or_time_required
    CHECK (((reps IS NOT NULL)::INT + (time_minutes IS NOT NULL)::INT) = 1)
);

-- Create indexes for performance
CREATE INDEX idx_kettlebell_trainings_user_id
  ON kettlebell_trainings(user_id);

CREATE INDEX idx_kettlebell_trainings_created_at
  ON kettlebell_trainings(created_at DESC);

CREATE INDEX idx_kettlebell_exercises_training_id
  ON kettlebell_exercises(training_id);

CREATE INDEX idx_kettlebell_rounds_exercise_id
  ON kettlebell_rounds(exercise_id);

-- Enable RLS
ALTER TABLE kettlebell_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kettlebell_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE kettlebell_rounds ENABLE ROW LEVEL SECURITY;

-- RLS for kettlebell_trainings
CREATE POLICY "Users can view own kettlebell trainings" ON kettlebell_trainings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kettlebell trainings" ON kettlebell_trainings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kettlebell trainings" ON kettlebell_trainings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own kettlebell trainings" ON kettlebell_trainings
  FOR DELETE USING (auth.uid() = user_id);

-- RLS for kettlebell_exercises (through kettlebell_trainings)
CREATE POLICY "Users can view own kettlebell exercises" ON kettlebell_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM kettlebell_trainings
      WHERE kettlebell_trainings.id = kettlebell_exercises.training_id
        AND kettlebell_trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own kettlebell exercises" ON kettlebell_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM kettlebell_trainings
      WHERE kettlebell_trainings.id = kettlebell_exercises.training_id
        AND kettlebell_trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own kettlebell exercises" ON kettlebell_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM kettlebell_trainings
      WHERE kettlebell_trainings.id = kettlebell_exercises.training_id
        AND kettlebell_trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own kettlebell exercises" ON kettlebell_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM kettlebell_trainings
      WHERE kettlebell_trainings.id = kettlebell_exercises.training_id
        AND kettlebell_trainings.user_id = auth.uid()
    )
  );

-- RLS for kettlebell_rounds (through kettlebell_exercises and kettlebell_trainings)
CREATE POLICY "Users can view own kettlebell rounds" ON kettlebell_rounds
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM kettlebell_exercises
      JOIN kettlebell_trainings
        ON kettlebell_trainings.id = kettlebell_exercises.training_id
      WHERE kettlebell_exercises.id = kettlebell_rounds.exercise_id
        AND kettlebell_trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own kettlebell rounds" ON kettlebell_rounds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM kettlebell_exercises
      JOIN kettlebell_trainings
        ON kettlebell_trainings.id = kettlebell_exercises.training_id
      WHERE kettlebell_exercises.id = kettlebell_rounds.exercise_id
        AND kettlebell_trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own kettlebell rounds" ON kettlebell_rounds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM kettlebell_exercises
      JOIN kettlebell_trainings
        ON kettlebell_trainings.id = kettlebell_exercises.training_id
      WHERE kettlebell_exercises.id = kettlebell_rounds.exercise_id
        AND kettlebell_trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own kettlebell rounds" ON kettlebell_rounds
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM kettlebell_exercises
      JOIN kettlebell_trainings
        ON kettlebell_trainings.id = kettlebell_exercises.training_id
      WHERE kettlebell_exercises.id = kettlebell_rounds.exercise_id
        AND kettlebell_trainings.user_id = auth.uid()
    )
  );

-- Keep kettlebell_exercises.updated_at in sync
CREATE TRIGGER update_kettlebell_exercises_updated_at
  BEFORE UPDATE ON kettlebell_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();