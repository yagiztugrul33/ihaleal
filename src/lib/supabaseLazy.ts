import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase istemcisini TEMBEL yukler (dinamik import).
 *
 * Neden: `@/lib/supabase` statik import edildiginde `vendor-supabase` chunk'i
 * uygulamanin giris chunk'ina baglaniyor ve ilk boyamadan (FCP) ONCE indirilmesi
 * gerekiyordu. Lighthouse olcumu: kritik yolda ~53 KB gzip, %84'u ilk ekranda
 * kullanilmiyor. `getSupabase()` ile SDK ancak gercekten auth/veri gerektiginde
 * (AuthProvider'in ilk effect'i, presence kanali, uzak katalog cagrisi) iner.
 *
 * `import type` satiri derleme sonrasi silinir — chunk bagi olusturmaz.
 *
 * Sozlesme: modul ONBELLEKLENIR. Ayni Promise tekrar dondurulur, boylece
 * `@/lib/supabase` bir kez degerlendirilir ve tek bir `createClient` ornegi
 * olusur (oturum sureklililigi ve `detectSessionInUrl` icin sart).
 */
let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import("@/lib/supabase").then((m) => m.supabase);
  }
  return clientPromise;
}
