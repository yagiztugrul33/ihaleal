# ihaleal.com — Sprint final raporu (güncel)

Tarih: 2026-04-28  
Önceki sprint tag: v1.0.0-rc1  

## Bu turda tamamlanan işler

- [x] **FAZ A — `precheck:supabase`:** `select=count` PostgREST uyumsuzluğu giderildi (`select=id&limit=1` + `Prefer: count=exact`). Hata gövdeleri ilk 500 karakter stdout’ta; `jwt_anon_role` / `jwt_service_role` satırları eklendi. `memberships` / `bid_bonds` için 403 olası nedenleri script sonunda tek paragraf not olarak yazılıyor.
- [x] **FAZ B — Error UX:** `ErrorBoundary` artık `ErrorPage` bileşenini kullanıyor; sınır `HashRouter` içinde (`App.tsx`) böylece `Link` ile ana sayfa çalışır. “Tekrar Dene” `resetError` ile state sıfırlar.
- [x] **FAZ C — Yasal tek kaynak:** `/kvkk` ve `/cerez-politikasi` rotaları `LegalKVKK` ve `LegalCookies` üzerinden (site temasıyla uyumlu). Taslak `src/pages/legal/KvkkPage.tsx` ve `CerezPolitikasi.tsx` kaldırıldı (çift içerik yok).
- [x] **FAZ D:** `README.md` ve `DEPLOY.md` içine yerel LAN önizleme + WhatsApp/dış ağ için Vercel/ngrok notları eklendi.
- [x] **FAZ E:** Bu dosya güncellendi.

## Build / doğrulama

Yerelde çalıştırın: `npm run verify` (typecheck + test + build).

`npm run precheck:supabase` çıktısı ortama bağlıdır; `.env.local` gerekir. **`profiles_anon` için beklenen:** genelde **HTTP 200** (içerik boş veya count 0) veya **401**. Yerel örnekte görülen **42P17 infinite recursion** kök nedeni: `profiles_select_admin` politikası `profiles` üzerinde tekrar `profiles` SELECT etmesi. Çözüm: `supabase/migrations/20260502120000_profiles_rls_recursion_service_grants.sql` (SECURITY DEFINER `is_profile_admin` + aynı dosyada `memberships`/`bid_bonds` için `service_role` SELECT GRANT). Uzak projeye **`supabase db push`** veya SQL Editor ile uygulanmalıdır.

**service_role JWT decode `(geçersiz-jwt)`** çıkıyorsa `.env.local` içinde anahtarda satır sonu/tırnak/jwt formatı kontrol edilmelidir; REST yine de bazı rollerle yanıt dönebilir.

## Bilinen dış bağımlılıklar

- **`ihaleal.com` TLS / host uyumsuzluğu:** Alan adı bazen Vercel dışı bir sunucuya veya yanlış sertifikaya işaret edebilir; canlı demo için Vercel verilen URL veya doğru DNS kayıtları kullanılmalıdır (kullanıcı DNS ayarı).

## Önemli dosya referansları

- `scripts/precheck-supabase.mjs`
- `src/components/ErrorBoundary.tsx`, `src/pages/ErrorPage.tsx`, `src/App.tsx`, `src/main.tsx`
- `README.md`, `DEPLOY.md`
