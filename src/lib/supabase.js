import { createClient } from "@supabase/supabase-js";

export const supabaseBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "lekha-library-files";

export const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null;
