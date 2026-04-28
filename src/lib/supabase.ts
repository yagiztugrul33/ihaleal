import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase istemcisi. Ortam doluysa Navbar + giriş/kayıt/profil Supabase Auth kullanır.
 * Ortam değişkenleri boşsa `null` — yerel demo oturum (localStorage) devam eder.
 */
export const supabase: SupabaseClient | null =
  url && anon && url.length > 0 && anon.length > 0
    ? createClient(url, anon, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;
