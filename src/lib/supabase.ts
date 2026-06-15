import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create a dummy client if not configured so the app doesn't crash on boot,
// but we'll show an error UI when appropriate.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key'
);

// Database Types structure placeholder based on our schema
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  language: string;
  code_content: string;
  preview_image_url: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string;
    email: string;
  };
}
