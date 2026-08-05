import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createFetchWithTimeout } from "@/lib/security/fetchWithTimeout";
import {
  PLACEHOLDER_ANON_KEY,
  PLACEHOLDER_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabaseEnv";

/**
 * DIKKAT — bu modul `@supabase/supabase-js` (vendor-supabase, ~204 KB ham /
 * ~53 KB gzip) paketini STATIK ice aktarir. Buradan import eden her modul o
 * chunk'i kendi yukleme yoluna ceker.
 *
 * - Yalnizca "yapilandirma var mi?" bilgisi gerekiyorsa `@/lib/supabaseEnv` kullanin.
 * - Kritik giris yolundaki (eager) bir modulden istemciye erisiyorsaniz
 *   `@/lib/supabaseLazy` -> `getSupabase()` kullanin; SDK ilk auth/veri
 *   ihtiyacinda dinamik yuklenir.
 * - Tembel (lazy route) chunk'larindan dogrudan `supabase` import etmek serbesttir.
 */

const configured = isSupabaseConfigured();

/** Geriye uyum: mevcut cagri noktalari `isSupabaseConfigured`'i buradan da alabilir. */
export { isSupabaseConfigured };

const SUPABASE_FETCH_TIMEOUT_MS = 28_000;

export const supabase: SupabaseClient = createClient(
  configured ? SUPABASE_URL : PLACEHOLDER_URL,
  configured ? SUPABASE_ANON_KEY : PLACEHOLDER_ANON_KEY,
  {
    global: {
      fetch: createFetchWithTimeout(SUPABASE_FETCH_TIMEOUT_MS),
    },
    auth: {
      persistSession: configured,
      autoRefreshToken: configured,
      detectSessionInUrl: configured,
      flowType: "pkce",
    },
  }
);
