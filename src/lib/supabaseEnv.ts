/**
 * Supabase ORTAM bilgisi — SDK'YI ICE AKTARMAZ.
 *
 * Neden ayri dosya: `@/lib/supabase` modulu `@supabase/supabase-js` paketini statik
 * ice aktarir; sadece "yapilandirma var mi?" sorusunu soran moduller o dosyadan
 * import ettiginde 204 KB'lik `vendor-supabase` chunk'i kritik giris yoluna
 * giriyordu (Lighthouse: unused-javascript, vendor-supabase %84 kullanilmiyor).
 * Konfigurasyon kontrolu buraya alinarak SDK bagimliligindan ayrildi.
 *
 * `@/lib/supabase` bu dosyadan yeniden disa aktarim yapar; mevcut cagri noktalari
 * (77 dosya) degismeden calisir.
 */

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

const configured = Boolean(url && anonKey);

if (!configured) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL veya VITE_SUPABASE_ANON_KEY eksik — demo için yer tutucu istemci; .env.local ekleyince gerçek projeye bağlanır."
  );
}

/** Env boşken `createClient` modül yüklenirken patlamasın (konsol: supabaseUrl is required → beyaz ekran). */
export const PLACEHOLDER_URL = "https://placeholder.supabase.co";
export const PLACEHOLDER_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1wbGFjZWhvbGRlciJ9.placeholder";

/** Ortam değişkenleri doluysa true — API çağrılarından önce kontrol edin. */
export function isSupabaseConfigured(): boolean {
  return configured;
}

/** İstemci kurulumu için ham değerler (yalnızca `@/lib/supabase` kullanır). */
export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = anonKey;
