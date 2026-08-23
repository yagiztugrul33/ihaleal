# Final Detaylı Durum Analizi (N19)

**Tarih:** 2026-05-30  
**Yöntem:** Salt okunur — repo grep, migration statik analiz, canlı HTTP/curl, Playwright render testleri, Supabase REST probe (anon key, production bundle).  
**Repo HEAD:** `d33069b` (N12–N18 push edildi)  
**Canlı BASE:** `https://www.ihaleal.com`  
**Canlı bundle (kanıt):** `index-CdLH5OgU.js` — `node -e "fetch('https://www.ihaleal.com/').then(r=>r.text()).then(h=>console.log(h.match(/index-[\\w-]+\\.js/)[0]))"` → 2026-05-30  
**Önceki audit bundle:** `index-z6JoDqv8.js` (`_audit/CANLI_DOGRULAMA_2026_05_30.md:77`) — **deploy değişmiş**

---

## Executive özet

| Alan | Sonuç |
|------|--------|
| **Teknik SPA + smoke** | ✅ 36/36 PASS (2026-05-30) |
| **Müteahhit kayıt funnel (kısmi E2E)** | ✅ 4/4 PASS (`smoke:r14`) |
| **Tam funnel (panel→proje→lansman→badge)** | 🟡 Otomasyon yok; manuel/CC |
| **6 yeni tablo özelliği (şema)** | ✅ Canlı tablolar mevcut (REST probe) |
| **6 özellik (DB trigger / seed)** | 🟡 Trigger’lar CC doğrulama; `price_index` boş |
| **SEO 600+** | ✅ 6633 URL sitemap; 5/5 Playwright render PASS |
| **Pantsir tam paket** | ❌ R13.1/3/5 yok; R13.2/4 kısmi-canlı |
| **Güvenlik statik (N12)** | ✅ Kod düzeltmesi; crafted-test CC’de |
| **Lansman GO (tam ürün)** | 🟡 NO-GO — ödeme/hukuk/EİDS + CC trigger seed |
| **Lansman GO (soft/demo)** | ✅ GO — smoke + funnel kayıt PASS |

---

## A) Özellik gerçeklik matrisi

**Route envanteri (kanıt):**

| Kaynak | Sayı | Kanıt |
|--------|------|-------|
| `App.tsx` `<Route path=` | **148** | `Select-String src/App.tsx -Pattern '<Route path=' \| Measure` → 148 |
| `SEO_LANDING_PAGES` | **6** | `src/data/seoLandings.ts` |
| Programatik SEO sitemap | **6633** | `Select-String public/sitemap-programmatic.xml -Pattern '<loc>' \| Measure` → 6633 |
| Ana sitemap | **46** | `public/sitemap.xml` |
| ENDPOINT_SWEEP (kritik HTTP) | **73/73** 200 | `_audit/ENDPOINT_SWEEP.md:21-24` (2026-05-30; bundle eski — HTTP katmanı hâlâ geçerli) |

**Durum sembolleri:** ✅ çalışıyor (canlı test PASS) · 🟡 kısmi · ❌ kırık/yok

### A.1 — N kuyruğu özellik paketleri (N1–N18)

| # | Özellik | Durum | Kanıt |
|---|---------|-------|-------|
| N1 | Gerçek veri wiring (6 tablo) | 🟡 | Tablolar canlıda var; trigger/seed kısmi (A.2) |
| N2 | `view_count` artırma | ✅ | `listings.view_count` kolonu canlı: REST `206 range=0-0/2`; kod `listingViewCount.ts`, `AuctionDetail.tsx:182-185` |
| N3 | Rating ortalama | ✅ | `listing_reviews` anon SELECT `HTTP 200`; `RatingSummaryBadge.tsx` |
| N4 | Teklif bildirimi trigger | 🟡 | Migration `20260601200000_listing_offer_notifications.sql` — CC-apply etiketli; trigger varlığı canlıda **doğrulanamadı** (service_role yok) |
| N5 | Kayıtlı arama trigger | 🟡 | `20260601210000_saved_search_listing_trigger.sql` — aynı |
| N6 | N1–N5 rapor | ✅ | `_audit/N_KUYRUK_RAPOR.md` |
| N7 | Canlı sayaç (presence) | ✅ | Playwright `/` → body `"1 çevrimiçi"`; `useOnlinePresence.ts:31-44`; çift badge fix `Home.tsx` (N18 `d33069b`) |
| N8 | Pantsir POI hibrit | 🟡 | `_audit/PANTSIR_DURUM.md` — B bölümü |
| N9 | Programatik SEO | ✅ | 6633 URL; Playwright 5 URL PASS (D bölümü) |
| N10 | Buton zenginleştirme | ✅ | `ListingQuickActions.tsx`, `AuctionDetail.tsx:704-718` — smoke `/ilan/…` PASS |
| N11 | N7–N11 rapor | ✅ | `_audit/N7_N11_RAPOR.md` |
| N12 | Statik güvenlik + upload fix | ✅ | `_audit/STATIK_GUVENLIK_TARAMA.md`; `uploadFile.ts:29-40` |
| N13 | Rehber 8 sayfa | ✅ | Playwright `/rehber/kredi-rehberi` title PASS; `realEstateGuides.ts` |
| N14 | SEO genişletme + borsa il | ✅ | `/borsa/sehir/istanbul` Playwright PASS; sitemap 6633 |
| N15 | Panel canlı metrik | ✅ | `UserPanelOverview.tsx`; smoke `/muteahhit/panel` shell 200 |
| N16 | Bildirim prefs + trigger | 🟡 | `notification_preferences` tablo canlıda var (`HTTP 401` anon); trigger CC-apply; UI kod `NotificationsPage.tsx:76-99` |
| N17 | Arama autocomplete/poligon/sort | ✅ | Kod `SearchAutocomplete.tsx`, `MapPolygonSearchInner.tsx`, `SearchResults.tsx:104-105` — **canlı deploy** `index-CdLH5OgU.js` içinde chunk var |
| N18 | N12–N18 rapor | ✅ | `_audit/N12_N18_RAPOR.md` |

### A.2 — 6 yeni tablo özelliği (canlı REST probe)

**Yöntem:** Production bundle’dan anon JWT + `https://wsjifesrdaeorrdzbvmk.supabase.co` (kanıt: bundle grep 2026-05-30).

| Tablo / kolon | Canlı REST | Yorum | Frontend |
|---------------|------------|-------|----------|
| `listing_reviews` | `HTTP 200 []` | Tablo + SELECT grant var | `ListingReviewDialog.tsx:35` |
| `listing_offers` | `HTTP 401` (42501) | Tablo var; anon SELECT yok (beklenen) | `listingOffersClient.ts` |
| `saved_searches` | `HTTP 401` | Tablo var; RLS owner | `savedSearchesClient.ts` |
| `listings.is_featured`, `view_count` | `HTTP 206` 2 satır | Kolonlar canlı | `remoteAuctionsMapper.ts:108-110` |
| `notifications` | `HTTP 401` | Tablo var | `useNotifications.ts:47-52` |
| `notification_preferences` | `HTTP 401` (`select=user_id`) | Tablo var (N16 migration şema) | `notificationPreferencesClient.ts` |
| `price_index` | `HTTP 200 []` | Tablo var; **satır yok** | `useRegionPriceIndex.ts:49-55`, `useLiveMarket.ts:174-179` |

**Sonuç:** Şema canlıda uygulanmış görünüyor; **otomatik bildirim trigger’ları** ve **price_index seed** CC/Master doğrulaması bekliyor.

### A.3 — Özellikle doğrulanan canlı testler

#### Funnel (kayıt → panel → proje → lansman → ilan badge)

| Adım | Otomasyon | Sonuç | Kanıt |
|------|-----------|-------|-------|
| Kayıt formu render | `npm run smoke:r14` | ✅ | 2026-05-30 exit 0 — `kayıt formu render email=true org=true tax=true` |
| Signup → onay-bekleniyor (RPC) | smoke:r14 | ✅ | `url=…/muteahhit/onay-bekleniyor` |
| Anon panel → giriş | smoke:r14 | ✅ | `url=…/giris?next=%2Fmuteahhit%2Fpanel` |
| Panel → yeni proje → lansman → ilan badge | — | 🟡 | Otomasyon **yok**; kod yolu: `MuteahhitPanelPage.tsx`, `useDeveloperProjects.ts:204-227` (`is_lansman`, `hemen_al_lansman`) |

**Net:** Chicken-egg kayıt RPC **E2E PASS**; tam müteahhit lansman zinciri **manuel veya CC Playwright** gerekir.

#### Canlı sayaç (N7)

| Test | Sonuç | Kanıt |
|------|-------|-------|
| Playwright `/` body | ✅ `"1 çevrimiçi"` | 2026-05-30 node+playwright |
| smoke `/` desktop+mobile | ✅ 36/36 | `npm run smoke` 2026-05-30 — önceki presence hatası giderildi (deploy `index-CdLH5OgU.js`) |

#### 600+ SEO sayfa render

| URL | Playwright title/body | Sonuç |
|-----|----------------------|-------|
| `/satilik/istanbul` | title `Satılık Istanbul gayrimenkul ilanları…` | ✅ PASS |
| `/kiralik/ankara/konut` | title `Kiralık Konut — Ankara…` | ✅ PASS |
| `/kiralik/izmir/konak/daire` | title `Kiralık Daire — Konak, Izmir…` | ✅ PASS |
| `/borsa/sehir/istanbul` | title `…fiyat endeksi…`; body `henüz endeks` | ✅ PASS (render); endeks verisi 🟡 boş |
| `/rehber/kredi-rehberi` | title `Kredi rehberi…` | ✅ PASS |

curl yalnızca SPA shell (`len=8987` tüm URL’lerde aynı) — **hydration kanıtı Playwright ile**.

#### Borsa gerçek veri

| Sayfa | Veri kaynağı | Canlı durum | Kanıt |
|-------|--------------|-------------|-------|
| `/borsa` | `useLiveMarket.ts:156-230` | 🟡 | Canlı `listings` **2 satır** → `listingRows.length` düşükse `INITIAL_MARKET_ASSETS` fallback `:213-217`; sayfada `DEMO MODU` bandı |
| `/borsa/sehir/:il` | `useRegionPriceIndex` → `price_index` | 🟡 | Playwright: `henüz endeks kaydı yok`; REST `price_index` → `[]` |
| `price_index` tablo | migration `20260601150000_borsa_index.sql` | ✅ tablo / ❌ veri | REST 200 boş dizi |

### A.4 — Kritik rota grupları (smoke 18 × 2 viewport = 36)

**Kaynak:** `scripts/smoke.mjs` — **2026-05-30: 36/36 PASS**

Tüm smoke rotaları: `/`, `/borsa`, `/komisyon-hesaplayici`, `/konut-kredisi-hesaplayici`, `/hizmet-bedelleri`, 4× `/modul/*`, `/ilan/{uuid}`, `/giris`, `/kayit?profil=muteahhit`, `/muteahhit/panel`, `/proje/{uuid}`, `/uluslararasi`, `/kampanyalar`, `/mesajlar`, `/kyc`.

| Grup | Durum | Not |
|------|-------|-----|
| Ana + borsa + araçlar | ✅ | HTTP 200, console error yok |
| Modüller (deprem/GES) | ✅ | |
| İlan detay (canlı UUID) | ✅ | Gerçek listing id smoke config’de |
| Auth + müteahhit | ✅ | Shell; funnel ayrı test |
| Mesajlar / KYC | ✅ | Shell 200 |

---

## B) Pantsir tam durum (N8 sonrası kesin)

**Kaynak:** `_audit/PANTSIR_DURUM.md` + dosya grep 2026-05-30

| Kod | Konu | Durum | Kanıt |
|-----|------|-------|-------|
| R13.1 | Geofence | ❌ | `grep geofence src/` → 0; migration yok |
| R13.2 | nearby-poi edge | ✅ | `useNearbyPOI.ts:73-80`; `AuctionDetail.tsx` konum sekmesi |
| R13.3 | TÜİK/MEB ETL | ❌ | Pipeline yok |
| R13.4 | Pantsir UI | 🟡→✅ hibrit | `PantsirPanel.tsx` + `useNearbyPOI`; koordinat yoksa önizleme mock |
| R13.5 | Mobil geofence | ❌ | Ayrı mobile repo |

**“Tüm özellikleriyle çalışıyor mu?” → HAYIR.**

Çalışan: yakın POI edge + ilan detayda hibrit Pantsir skor. Eksik: geofence, resmi sosyo-ekonomik veri, mobil. Plan: `_audit/R13_PANTSIR_PLAN.md`.

---

## C) Güvenlik durumu (N12 sonrası)

### C.1 — RLS’siz tablo (repo migration)

| Kontrol | Sonuç | Kanıt |
|---------|-------|-------|
| Migration’da `create table` | 57 tablo | node script 2026-05-30 |
| RLS `enable` eksik | **0** | Aynı script: `rls_missing_in_migrations 0` |
| RLS contract test | **8/8 PASS** | `npm run test:rls` 2026-05-30 |

**Canlı DB `pg_policies`:** `.env.local` yok → `precheck-supabase.mjs` çalıştırılamadı; canlı policy gerçeği **Master SQL Editor** gerekir (`_audit/CANLI_DOGRULAMA_2026_05_30.md:102-117`).

### C.2 — Statik tarama bulguları

| Bulgu | Durum | Kanıt |
|-------|-------|-------|
| Storage path traversal | ✅ Kapatıldı | `uploadFile.ts:29-40` commit `45aa3e8` |
| npm audit moderate ×2 | 🟡 Açık | `_audit/STATIK_GUVENLIK_TARAMA.md:58-65` |
| Hardcoded secret `src/` | ✅ 0 | grep `service_role\|sk-` → 0 |
| IDOR (offers/listing) | 🟡 RLS’e güven | Crafted-test gerekli |

### C.3 — Claude Code crafted-pentest listesi (Cursor yapamaz)

`_audit/STATIK_GUVENLIK_TARAMA.md:87-96`:

1. `listing_offers` IDOR — `updateOfferStatus` başka teklif (`listingOffersClient.ts:40`)
2. Sealed teklif sızıntısı — `fetchOffersForListing` (`:113-119`)
3. `watchlist` / `saved_searches` cross-user
4. `notifications` insert başka `user_id`
5. Storage bucket cross-owner path
6. `place-bid` / auction manipülasyonu (core RLS)
7. Rate limit / brute force (login, teklif, mesaj)
8. XSS reflected — arama `q` parametresi

**Ek (organizasyon RLS):** `organizations` / `organization_members` INSERT policy — `_audit/R14_FIX_DOGRULAMA_2_2026_05_30.md:46-57` migration grep **INSERT policy yok**; buna rağmen `smoke:r14` signup **PASS** (muhtemelen RPC/SECURITY DEFINER yolu — CC doğrulamalı).

---

## D) Sayfa sayısı kanıtı

| Dosya | `<loc>` sayısı | Komut kanıtı |
|-------|----------------|--------------|
| `public/sitemap-programmatic.xml` | **6633** | PowerShell `Select-String '<loc>'` → 6633 |
| `public/sitemap.xml` | **46** | aynı → 46 |
| `public/sitemap-index.xml` | 2 sitemap referansı | satır 3-4 |

**600 hedefi:** ✅ **6633 ≥ 600** (programatik tek dosyada).

**Render kanıtı (5 örnek):** A.3 tablosu — Playwright PASS 2026-05-30.

**Generator:** `scripts/generate-programmatic-sitemap.mjs` — `node scripts/…` → `Wrote 6633 URLs`.

---

## E) CC-apply / deploy bekleyen tam liste

Claude Code **tek tur sıra** (dosya yolu kanıtı):

| Sıra | Dosya | İçerik | Canlı şema probe |
|------|--------|--------|------------------|
| 1 | `supabase/migrations/20260601140000_storage_buckets.sql` | Storage bucket RLS | Doğrulanamadı (storage API ayrı) |
| 2 | `supabase/migrations/20260601150000_borsa_index.sql` | `price_index`, `transaction_stats` | ✅ tablo; ❌ veri boş |
| 3 | `supabase/migrations/20260601160000_listing_reviews.sql` | Rating | ✅ REST 200 |
| 4 | `supabase/migrations/20260601170000_listing_doping_analytics.sql` | `view_count`, RPC | ✅ kolonlar canlı |
| 5 | `supabase/migrations/20260601180000_listing_offers.sql` | Teklif tablosu | ✅ tablo (401 anon) |
| 6 | `supabase/migrations/20260601190000_saved_searches.sql` | Kayıtlı arama | ✅ tablo (401 anon) |
| 7 | `supabase/migrations/20260601200000_listing_offer_notifications.sql` | **Trigger** teklif bildirimi | 🟡 CC — trigger doğrula |
| 8 | `supabase/migrations/20260601210000_saved_search_listing_trigger.sql` | **Trigger** arama eşleşme | 🟡 CC |
| 9 | `supabase/migrations/20260602100000_notification_triggers_prefs.sql` | **Trigger** mesaj/favori + `notif_owner_update` + prefs | 🟡 tablo var; trigger CC |

**Henüz yazılmayan (Pantsir):**

- `*_user_geofences.sql` — `_audit/PANTSIR_DURUM.md:27`
- TÜİK/MEB ETL tabloları — `:47`

**Edge deploy (`_audit/EDGE_BAGLANTI_DURUMU.md`):**

| Edge | Durum |
|------|-------|
| `post_chat_message`, `kyc-submit`, `nearby-poi`, `place-bid`, `tcmb_yiufe`, `earthquakes_latest` | ✅ bağlı |
| `ai_qa`, `pvgis_solar` | 🟡 kod hazır; deploy doğrula |
| `payments-iyzico`, `payments-paytr` | ⏸ ürün kararı |
| `matching-fanout`, `bulk-listing-ingest`, `ai-price-estimate` | 📋 sonra |

**Veri seed (CC/Master):**

- `price_index` + `transaction_stats` satır ekleme (borsa canlı mod için)
- Canlı ilan hacmi artışı (`listings` şu an 2 satır — borsa fallback tetikler)

---

## F) Lansman GO / NO-GO (güncel)

**Referans:** `docs/LAUNCH_CHECKLIST.md` (A teknik / B ürün-hukuk)

### A — Teknik teslim

| Madde | Durum | Kanıt |
|-------|-------|-------|
| `npm run verify:ci` | 🟡 | Bu tur çalıştırılmadı; N12–N18’de `typecheck`+`build`+`test:rls` PASS |
| `npm run smoke` 36/36 | ✅ | 2026-05-30 |
| Env / `precheck:supabase` | 🟡 | `.env.local` yok — CI/local Master |
| Supabase migration uzak | 🟡 | Şema kısmen canlı; trigger/seed CC |
| Vercel deploy | ✅ | Bundle hash değişti → `index-CdLH5OgU.js` |

### B — Ürün / hukuk / operasyon (Master manuel)

| Madde | Durum |
|-------|-------|
| Komisyon metinleri üretim onayı | 🟡 taslak (`fees.ts`) |
| TKHK / sözleşme avukat onayı | ❌ |
| Ödeme (iyzico vb.) | ❌ bilinçli yok — repo kuralı |
| EİDS entegrasyonu | 🟡 mock sayfa `/auth/edevis-mock` |
| Gerçek ihale / ödeme | ❌ site bandı: `DEMO MODU` (Playwright `/borsa` 2026-05-30) |

### Karar

| Lansman türü | Karar | Gerekçe |
|--------------|-------|---------|
| **Soft / demo vitrin** | **GO** | Smoke 36/36, funnel kayıt 4/4, SEO render, presence |
| **Tam ticari lansman** | **NO-GO** | Ödeme, hukuk onayı, EİDS, CC trigger+seed, crafted pentest |

---

## G) Kalan iş + öncelik (RICE kısa)

| # | İş | R | I | C | Efor | Engeller |
|---|-----|---|---|---|------|----------|
| 1 | CC-apply migration 7–9 (trigger) | 10 | 9 | 9 | 2–4 saat | Bildirim otomasyonu |
| 2 | `price_index` + ilan seed | 8 | 8 | 8 | 4–8 saat | Borsa canlı mod |
| 3 | Crafted pentest (CC) | 10 | 10 | 6 | 8–16 saat | Güvenlik sign-off |
| 4 | Tam funnel E2E (proje→lansman) | 7 | 7 | 7 | 4–6 saat | Regresyon güvencesi |
| 5 | R13.1 geofence web | 5 | 6 | 4 | ~14 saat | Pantsir tam |
| 6 | Ödeme PSP + avukat metinleri | 10 | 10 | 2 | Master | Ticari lansman |
| 7 | `npm audit fix` (moderate) | 4 | 4 | 10 | 1 saat | Supply chain |

**Lansmana teknik engel (soft):** Yok (smoke yeşil).  
**Lansmana ticari engel:** Ödeme, hukuk, veri seed, pentest, EİDS.

---

## Doğrulama komutları (tekrarlanabilir)

```bash
npm run smoke                    # 36/36 — 2026-05-30 PASS
npm run smoke:r14                # 4/4 funnel — 2026-05-30 PASS
npm run test:rls                 # 8/8 — 2026-05-30 PASS
node scripts/generate-programmatic-sitemap.mjs   # → 6633 URLs
```

Playwright SEO (repo kökünde):

```javascript
// 5 URL title PASS — bkz. A.3 (2026-05-30 transcript)
```

---

## İlgili audit dosyaları

| Dosya | İçerik |
|-------|--------|
| `_audit/N12_N18_RAPOR.md` | N12–N18 commit özeti |
| `_audit/STATIK_GUVENLIK_TARAMA.md` | N12 güvenlik |
| `_audit/PANTSIR_DURUM.md` | N8 Pantsir |
| `_audit/N_KUYRUK_RAPOR.md` | N1–N6 |
| `_audit/N7_N11_RAPOR.md` | N7–N11 |
| `_audit/CANLI_DOGRULAMA_2026_05_30.md` | Mobil/anon deny (önceki bundle) |
| `docs/LAUNCH_CHECKLIST.md` | Lansman checklist |

**N19 commit:** yalnızca bu belge (salt analiz, kod değişikliği yok).
