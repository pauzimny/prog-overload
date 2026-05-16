# Supabase Table Creation Guidelines

## Context
As of May 2026, Supabase enforces explicit `GRANT` statements for new tables in the `public` schema to be accessible via the Data API (PostgREST, GraphQL, and `supabase-js`). Starting October 30, 2026, this applies to all existing projects.

## Template for New Table Migrations

Always follow this three-step pattern when creating new public tables:

### 1. Create Table
```sql
CREATE TABLE public.your_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- other columns
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_your_table_user_id ON your_table(user_id);
```

### 2. Grant Privileges (CRITICAL)
```sql
-- Grant to anon (unauthenticated users, if applicable)
GRANT SELECT ON public.your_table TO anon;

-- Grant to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.your_table TO authenticated;

-- Grant to service_role (admin operations from server)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.your_table TO service_role;
```

### 3. Enable RLS and Create Policies
```sql
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own records" ON your_table
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON your_table
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON your_table
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON your_table
  FOR DELETE USING (auth.uid() = user_id);
```

## Key Rules

- **Never skip `GRANT` statements.** Without them, the table will be unreachable via supabase-js after October 30, 2026.
- **Order matters:** Create table → Grant privileges → Enable RLS → Add policies.
- **Role-specific grants:** Grant only what each role needs:
  - `anon`: Usually `SELECT` only, and only for public data
  - `authenticated`: `SELECT, INSERT, UPDATE, DELETE` for user data
  - `service_role`: Full access `SELECT, INSERT, UPDATE, DELETE` for admin/server operations
- **Use RLS + Grants together:** Grants control *access*, RLS controls *visibility*. Both are required for security.

## Example: Complete Migration

```sql
-- 015_create_user_preferences.sql

CREATE TABLE public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Grant privileges (always before RLS)
GRANT SELECT ON public.user_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO service_role;

-- Enable RLS and add policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all preferences" ON user_preferences
  USING (auth.role() = 'service_role');
```

## Existing Tables (Already Compliant)

Your current tables (`trainings`, `exercises`, `rounds`, `kettlebell_trainings`, `kettlebell_exercises`, `kettlebell_rounds`, `user_roles`) already have RLS policies. Existing tables keep their current grants and remain accessible. They are not affected by the October 30 deadline.

## Testing Locally

If you opt in to the new behavior in `supabase/config.toml`, test new migrations with:
```bash
supabase db reset
```

If the app breaks on a new table, the PostgREST error will hint:
```
code: "42501", message: "permission denied for table your_table"
```

Add the `GRANT` statement and reset again.
