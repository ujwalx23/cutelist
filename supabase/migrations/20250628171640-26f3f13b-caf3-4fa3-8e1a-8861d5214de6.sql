
-- Enable Google OAuth provider and ensure profiles are created for Google users
-- The existing handle_new_user() function will automatically create profiles for Google users too

-- Update the handle_new_user function to handle Google OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      NEW.email
    ),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(EXCLUDED.username, profiles.username),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Add RLS policies for profiles table if they don't exist
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Create policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
      ON public.profiles 
      FOR SELECT 
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
      ON public.profiles 
      FOR UPDATE 
      USING (auth.uid() = id);
  END IF;
END $$;
