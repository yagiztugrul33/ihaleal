# ihaleal.com — Cumartesi Yayın Sprinti Final Raporu

Tarih: 2026-04-30
Sprint Tag: v1.0.0-rc1 (push kullanıcı ortamına bağlı)

## Tamamlanan Görevler (repo işleri)

- [x] Görev 0: Doğru klasör + baseline (`debb382` öncesi toplu baseline commit taşıdığı için süreç içinde güncellendi)
- [x] Görev 1: Demo uyarı banner (`DemoUyarisi.tsx` + `Layout.tsx`)
- [x] Görev 2: Türkçe auth hata çevirisi (`authErrors.ts`, Login/Register)
- [x] Görev 3: Yasal sayfalar (`src/pages/legal/*`, `SSS.tsx`, `App.tsx` rotaları; `/kvkk` ve `/cerez-politikasi` mevcut `Legal*` sayfalarında kaldı)
- [x] Görev 4: Footer yasal linkler
- [x] Görev 5: `ErrorPage.tsx` eklendi; `NotFound.tsx` zaten vardı (üzerine yazılmadı); catch-all rota zaten vardı
- [x] Görev 6: `index.html` içine eksik Apple standalone meta eklendi (mevcut `<title>` / OG bloklarına dokunulmadı)
- [x] Görev 7: `vercel.json` genişletildi; `.env.production.example` eklendi (`.gitignore` istisnası ile)
- [x] Görev 8: README „Vercel Deploy“ + `DEPLOY.md`
- [x] Görev 9: Kaynakta `ihalevar` eşleşmesi yoktu (`grep` kanıtı boş)
- [ ] Görev 10–13: Aşağıda kanıt / kısıt notları
- [ ] Görev 14: Bu dosya

## Build Durumu

- `npm run typecheck`: SUCCESS
- `npm run build`: SUCCESS (`✓ built in 33.97s`, vite çıktısı oturumda)
- `npm run test:run`: **7 passed / 7** (3 test dosyası)

## Görev 10 — precheck:supabase (çıktı özeti)

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`: DOLU (maskeli çıktı)
- `profiles_anon`: **HTTP 500**
- `memberships_service_role` / `bid_bonds_service_role`: **HTTP 403**

Bloker değerlendirmesi: `profiles_anon` için **500** beklenen anon/401 yerine sunucu hatası; prod öncesi Supabase tarafı kontrol edilmeli.

## Görev 11–13 — Dev / Preview / Smoke

- Dev (`npm run dev`, tarayıcı, konsol) ve 20 maddelik smoke testleri **bu oturumda tarayıcı ile doğrulanmadı**; yerelde `npm run preview --port 4173` ile doğrulama önerilir.

## Eklenen / Güncellenen Önemli Dosyalar

- `src/components/DemoUyarisi.tsx`
- `src/lib/authErrors.ts`
- `src/pages/legal/*.tsx`, `src/pages/SSS.tsx`, `src/pages/ErrorPage.tsx`
- `src/App.tsx`, `src/components/Layout.tsx`, `src/components/Footer.tsx`
- `index.html`, `vercel.json`, `.env.production.example`, `.gitignore`
- `DEPLOY.md`, `README.md`

## Bilinen Notlar

- `KvkkPage.tsx` ve `CerezPolitikasi.tsx` dosyaları oluşturuldu; `/kvkk` ve `/cerez-politikasi` rotaları halihazırda `LegalKVKK` ve `LegalCookies` bileşenlerine bağlıdır (çift içerik bilinçli şekilde router’da kullanılmıyor).
- `ErrorPage.tsx` oluşturuldu; global `ErrorBoundary` ile otomatik bağlanmadı (isteğe bağlı takip).

## Yayın İçin Kullanıcı Adımları

1. `git push origin main` ve gerekirse `git push origin v1.0.0-rc1`
2. Vercel import + env değişkenleri (`.env.production.example`)
3. DNS / custom domain
