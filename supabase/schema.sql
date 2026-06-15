-- Supabase Schema for DevNotes

-- 1. Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create the profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create the posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL,
  code_content TEXT NOT NULL,
  preview_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 5. Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users." ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own display_name." ON public.profiles;

-- Anyone can read all profiles
CREATE POLICY "Profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own display_name ONLY
CREATE POLICY "Users can update own display_name."
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Posts Policies
DROP POLICY IF EXISTS "Posts are viewable by authenticated users." ON public.posts;
DROP POLICY IF EXISTS "Posts are viewable by everyone." ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts." ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts; Admins can update any post." ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts; Admins can delete any post." ON public.posts;

-- Anyone can read all posts
CREATE POLICY "Posts are viewable by everyone."
  ON public.posts FOR SELECT
  USING (true);

-- Users can insert their own posts
CREATE POLICY "Users can insert own posts."
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update/delete their own posts, or Admins can update/delete any post
CREATE POLICY "Users can update own posts; Admins can update any post."
  ON public.posts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can delete own posts; Admins can delete any post."
  ON public.posts FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Drop trigger if it exists (for reruns)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 7. Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'user'::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Storage Setup: post-previews
-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-previews', 'post-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
DROP POLICY IF EXISTS "Preview images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Users can upload preview images to own folder." ON storage.objects;

-- Public read access
CREATE POLICY "Preview images are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-previews');

-- authenticated users can upload only to their own folder path '/{user_id}/...'
CREATE POLICY "Users can upload preview images to own folder."
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'post-previews' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 9. RPC Function for Super Admin to change roles
-- Using a database function because users cannot UPDATE roles directly via RLS
CREATE OR REPLACE FUNCTION change_user_role(target_user_id UUID, new_role TEXT, super_admin_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the caller has the super_admin_email
  IF (auth.jwt() ->> 'email') = super_admin_email THEN
    UPDATE public.profiles SET role = new_role::user_role WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Not authorized to change roles.';
  END IF;
END;
$$;
