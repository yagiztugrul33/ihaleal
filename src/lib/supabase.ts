import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase istemcisi. Tur #5: hiçbir component import etmez (tur #6 auth bağlanacak).
 * Ortam değişkenleri boşsa `null` — yanlışlıkla ağ çağrısı yapılmaz.
 */
export const supabase: SupabaseClient | null =
  url && anon && url.length > 0 && anon.length > 0 ? createClient(url, anon) : null;
