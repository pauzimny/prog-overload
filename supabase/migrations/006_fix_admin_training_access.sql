-- Fix RLS policies to allow admins to manage trainings for all users

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own trainings" ON trainings;
DROP POLICY IF EXISTS "Admins can view all trainings" ON trainings;
DROP POLICY IF EXISTS "Users can insert own trainings" ON trainings;
DROP POLICY IF EXISTS "Admins can update all trainings" ON trainings;
DROP POLICY IF EXISTS "Admins can delete all trainings" ON trainings;

-- Create policies that allow admins to manage all trainings
CREATE POLICY "Users can view own trainings" ON trainings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all trainings" ON trainings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own trainings" ON trainings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all trainings" ON trainings
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all trainings" ON trainings
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Drop existing policies for exercises
DROP POLICY IF EXISTS "Users can view own exercises" ON exercises;
DROP POLICY IF EXISTS "Admins can view all exercises" ON exercises;
DROP POLICY IF EXISTS "Users can insert own exercises" ON exercises;
DROP POLICY IF EXISTS "Admins can update all exercises" ON exercises;
DROP POLICY IF EXISTS "Admins can delete all exercises" ON exercises;

-- Create policies that allow admins to manage all exercises
CREATE POLICY "Users can view own exercises" ON exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trainings 
      WHERE trainings.id = exercises.training_id 
      AND trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all exercises" ON exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own exercises" ON exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trainings 
      WHERE trainings.id = exercises.training_id 
      AND trainings.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all exercises" ON exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM trainings 
      WHERE trainings.id = exercises.training_id 
      AND trainings.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all exercises" ON exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM trainings 
      WHERE trainings.id = exercises.training_id 
      AND trainings.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Drop existing policies for rounds
DROP POLICY IF EXISTS "Users can view own rounds" ON rounds;
DROP POLICY IF EXISTS "Admins can view all rounds" ON rounds;
DROP POLICY IF EXISTS "Users can insert own rounds" ON rounds;
DROP POLICY IF EXISTS "Admins can update all rounds" ON rounds;
DROP POLICY IF EXISTS "Admins can delete all rounds" ON rounds;

-- Create policies that allow admins to manage all rounds
CREATE POLICY "Users can view own rounds" ON rounds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN trainings ON trainings.id = exercises.training_id
      WHERE exercises.id = rounds.exercise_id 
      AND trainings.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all rounds" ON rounds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own rounds" ON rounds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN trainings ON trainings.id = exercises.training_id
      WHERE exercises.id = rounds.exercise_id 
      AND trainings.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all rounds" ON rounds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN trainings ON trainings.id = exercises.training_id
      WHERE exercises.id = rounds.exercise_id 
      AND trainings.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all rounds" ON rounds
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN trainings ON trainings.id = exercises.training_id
      WHERE exercises.id = rounds.exercise_id 
      AND trainings.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
