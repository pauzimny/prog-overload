-- Fix RLS policies to allow admins to see all users in user_roles table

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;

-- Create simpler, more effective policies
CREATE POLICY "Allow read access to all authenticated users" ON user_roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Also allow users to insert their own role (for the trigger)
CREATE POLICY "Allow users to insert their own role" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
