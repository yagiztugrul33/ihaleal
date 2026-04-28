import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Ortam değişkenleri doluysa true — API çağrılarından önce kontrol edin. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey && url.length > 0 && anonKey.length > 0);
}

if (!isSupabaseConfigured()) {
  console.error("Supabase env eksik");
}

export const supabase = createClient(url ?? "", anonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
