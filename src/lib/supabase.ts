import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

const configured = Boolean(url && anonKey);

if (!configured) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL veya VITE_SUPABASE_ANON_KEY eksik — demo için yer tutucu istemci; .env.local ekleyince gerçek projeye bağlanır."
  );
}

/** Env boşken `createClient` modül yüklenirken patlamasın (konsol: supabaseUrl is required → beyaz ekran). */
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1wbGFjZWhvbGRlciJ9.placeholder";

/** Ortam değişkenleri doluysa true — API çağrılarından önce kontrol edin. */
export function isSupabaseConfigured(): boolean {
  return configured;
}

export const supabase: SupabaseClient = createClient(
  configured ? url : PLACEHOLDER_URL,
  configured ? anonKey : PLACEHOLDER_ANON_KEY,
  {
    auth: {
      persistSession: configured,
      autoRefreshToken: configured,
      detectSessionInUrl: configured,
      flowType: "pkce",
    },
  }
);
