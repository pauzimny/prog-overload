ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Allow admins to manage roles" ON user_roles;
DROP POLICY IF EXISTS "Allow users to insert their own role" ON user_roles;

DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

CREATE POLICY "Users can read own role" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);


CREATE POLICY "Admins can read all roles" ON user_roles
  FOR SELECT
  USING (public.is_admin_user());


CREATE POLICY "Admins can insert roles" ON user_roles
  FOR INSERT
  WITH CHECK (public.is_admin_user());


CREATE POLICY "Admins can update roles" ON user_roles
  FOR UPDATE
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can delete roles" ON user_roles
  FOR DELETE
  USING (public.is_admin_user());
