# ihaleal — Komple Eksik İş Analizi

**Tarih:** 2026-05-30 sabah (gece komut zinciri + R13 paketleri sonrası)  
**Hazırlayan:** Cursor — 10 kategori derin salt-okuma + grep + `_audit/` cross-ref  
**Operatör:** Master (yagiztugrul33)  
**HEAD:** `8a16731` · **Tag:** `v0.12.8` · **TS:** 0 (commit `45f9097` teyit)

> **Master yarın sabah:** Bu dosya + [`MASTER_YOL_HARITASI_2026_05_30.md`](./MASTER_YOL_HARITASI_2026_05_30.md) (~10 dk)

---

## YÖNETİCİ ÖZETİ (1 sayfa)

ihaleal **R12 resmi kapandı** (`v0.12.8`, TS sıfır, bundle budget altında). **R13 ilk paketler canlı:** Pantsir panel iskelet (`1b59932`) + OSM POI API (`4d21074`, `8a16731`). Site **~78 canlı özellik**, **73/73 HTTP 200** sweep.

**“Satışa hazır tam ürün” için tahmini ek iş:** **~140–220 saat** (3–4 hafta yoğun) + **~$1.700/ay** servis (premium API seçilirse).

| Band | Saat | Örnek |
|------|-----:|-------|
| 🔴 Kritik bloklayıcılar | 15–25 | ai_qa 502 debug, ödeme deploy, foto storage, e-posta, 3 KYC user |
| 🟡 Önemli | 40–60 | R13.1 geofence, R13.3 ETL, Pantsir→gerçek POI wire, K-M6 |
| 🟢 Roadmap | 60–100 | R13.5 mobile, TKGM, PSP prod, multilang, lansman polish |

**Dürüst sınır:** Demo/taslak akışlar (escrow, PSP, tapu garantisi) **ürün kararı + hukuk** olmadan prod iddiası yok.

---

## A) GÜVENLİK (~15–25 saat)

### A.1 Supabase RLS

**Kaynak:** `supabase/migrations/*` — audit migration `20260528170000_grants_restore_systemic.sql` notu:

- **47 tablo RLS ENABLED** (grant restore sonrası)
- **Sprint 3 çekirdek:** `listings`, `auctions`, `profiles`, `bids` — anon listings/auctions **200**, profiles **401** (sweep teyit)
- **RB1/RB2 sertleştirme** (`20260528150000`): `corporate_leads`, `organizations` admin-only; `bid_bonds` **3 orphan policy DROP** → tablo var, **client policy yok** (yalnızca service_role)

| Tablo / alan | Durum | Eksik / risk |
|--------------|--------|----------------|
| listings / auctions | ✅ Public browse + owner write | İlan moderasyon RLS ayrı test |
| profiles | ✅ Anon 401 | — |
| chat_* | ✅ Participant-based | Edge `post_chat_message` deploy yok |
| kyc_verifications | ✅ Submitter read | Otomatik verify yok |
| bid_bonds | 🟡 RLS ON, **0 policy** | Bilinçli orphan — prod kullanım yok |
| nearby_poi_cache | ✅ Anon read + service write | Yeni R13.2 |

**Eksik iş:** RLS regression test script (CI); `bid_bonds` ya policy ya DROP kararı; admin role matrisi dokümante.

### A.2 Auth + KYC

| Madde | Durum | Eksik |
|-------|--------|-------|
| Supabase Auth (email/pass) | ✅ | — |
| KYC Edge `kyc-submit` | ✅ Deployed | Otomatik doğrulama yok |
| 4 prod user `kyc_status=none` | 🟡 | Master **1 verify** etti → **3 kaldı** |
| Session refresh | ✅ Supabase client default | Timeout UX yok |
| Kurumsal profil tipleri | 🟡 UI kısmi | Emlakçı/banka ayrımı tam değil |

**Eksik iş:** 3 user SQL verify; KYC browser smoke; teklif gate E2E.

### A.3 Secrets + API keys

| Secret | Beklenen yer | Durum |
|--------|--------------|--------|
| `OPENAI_API_KEY` | Supabase Edge secrets | 🟡 `ai_qa` **502** raporu — master debug |
| `SUPABASE_SERVICE_ROLE` | Edge only | ✅ `_shared/supabase.ts` — **VITE_* yok** (kural uyum) |
| VAPID (Web Push) | R13.1 | 🔴 **Yok** |
| PSP keys (iyzico/paytr) | Edge | 🔴 Deploy + secret yok |

**Grep `sk-` / hard-coded secrets:** `src/` ve `supabase/functions/` — **üretim anahtarı yok** (iyi).

**Eksik iş:** Supabase Dashboard secret envanter checklist; ai_qa 502 kök neden; VAPID üretim R13.1 öncesi.

### A.4 CORS + Headers

| Katman | Durum |
|--------|--------|
| `vercel.json` | ✅ CSP, HSTS, X-Frame DENY, COOP |
| `public/_headers` | ✅ CSP (connect-src Supabase) |
| Edge CORS | 🟡 `ai_qa` `Access-Control-Allow-Origin: *` — prod sıkılaştırma önerilir |

**Eksik:** CSP `connect-src` — OSM Overpass + AFAD URL’leri prod CSP’de explicit mi (R13.2 sonrası kontrol).

### A.5 Dependency vulnerabilities

```
npm audit → 2 moderate (ws paketi, GHSA-58qx-3vcg-4xpx)
```

**Eksik:** `npm audit fix` + CI gate.

### A.6 Frontend güvenlik

| Konu | Bulgu |
|------|--------|
| `dangerouslySetInnerHTML` | **1** — `chart.tsx` (Recharts theme CSS; düşük risk) |
| localStorage | Tema, borsa demo, recent viewed, **legacy `ihaleal_user`** bridge — JWT Supabase session ayrı |
| PII in localStorage | 🟡 E-posta newsletter listesi local — prod için sunucu |

**Eksik:** Legacy `ihaleal_user` kaldırma; hassas veri audit.

### A.7 GDPR / KVKK

| Madde | Durum |
|-------|--------|
| CookieConsent | ✅ `CookieConsent.tsx` |
| KVKK / Gizlilik / Çerez sayfaları | ✅ Route’lar var |
| Hesap silme (right to erasure) | 🔴 **Akış yok** |
| Veri export | 🔴 Yok |

**Eksik iş:** KVKK hesap silme + export (~4–6s); çerez tercih granular (analytics opt-out).

---

## B) ÖZELLİKLER — FEATURE EKSİKLERİ (~40–60 saat)

### B.1 İlan akışı (Sprint 3)

| Özellik | Durum | Eksik |
|---------|--------|-------|
| İlan oluşturma form | ✅ `CreateAuction.tsx` | — |
| Zorunlu alanlar | ✅ | — |
| **Fotoğraf upload** | 🔴 | UI var; **Storage’a yükleme yok** — yalnızca `images_count` JSON |
| İlan onay | 🟡 | Admin `status=review` listesi var |
| İlan düzenleme / silme | 🔴 | Satıcı edit flow eksik |
| Favoriler | ✅ `/favoriler` | DB `watchlist` — web OK |
| Paylaşma | 🟡 | `ShareButton` kısmi | 

### B.2 İhale akışı

| Özellik | Durum | Eksik |
|---------|--------|-------|
| Teklif verme | ✅ `place-bid` Edge + deposit | KYC gate |
| Canlı teklif listesi | 🟡 | UI kısmi |
| Otomatik teklif | 🟡 | Borsa localStorage demo only |
| Anti-sniping | ✅ `fees.ts` | — |
| Winner notification | 🔴 | E-posta/push yok |
| Escrow | 🔴 | Taslak UX; **gerçek PSP yok** |
| Komisyon tahsilat | 🟡 | `fees.ts` hesap; **tahsilat yok** |

### B.3 Ödeme

| Özellik | Durum |
|---------|--------|
| `payments-iyzico` / `payments-paytr` | 🔴 Kod var, **deploy yok** |
| Stripe | 🔴 Yok |
| Fatura KDV | 🔴 Yok |
| Refund/iade | 🔴 Yok |

**Master karar zorunlu** — workspace kuralı: PSP prod entegrasyonu ürün onayı olmadan.

### B.4 Bildirim

| Kanal | Durum |
|-------|--------|
| E-posta transactional | 🔴 Yalnızca Supabase auth mail |
| SMS | 🔴 Yok |
| Web Push | 🔴 R13.1 plan |
| In-app | 🟡 `notifications` tablo; merkez K-M6 |

### B.5 Arama + filtreleme

| Özellik | Durum |
|---------|--------|
| `/arama` sayfası | ✅ |
| Filtre (fiyat, oda, konum) | 🟡 Kısmi |
| Full-text / Algolia | 🔴 Yok |
| Haritada arama | 🟡 `/harita` |
| Kayıtlı arama | 🟡 `savedAuctionSearch.ts` localStorage |
| AI öneri | 🟡 `matching-fanout` şehir+fiyat |

### B.6 Kullanıcı profili

| Özellik | Durum |
|---------|--------|
| Profil düzenleme | 🟡 |
| Kurumsal profil | 🟡 Portal sayfaları |
| Public profil | 🟡 Emlakçı slug |
| Block/report | 🔴 Yok |

### B.7 Mesajlaşma

| Özellik | Durum |
|---------|--------|
| DB şema | ✅ chat_threads/messages |
| Edge post | 🔴 **404 deploy** |
| UI `/mesajlar` | 🟡 |

### B.8 Raporlama / moderasyon

| Özellik | Durum |
|---------|--------|
| Admin dashboard | ✅ Listing review, audit log |
| İlan ihlal raporu | 🔴 |
| Compliance queue | 🟡 Stub migration |

### B.9 R13 Pantsir (yeni)

| Özellik | Durum | Eksik |
|---------|--------|-------|
| PantsirPanel UI | ✅ `AuctionDetail` overview | **Mock skor** (`pantsir-mock.ts`) |
| useNearbyPOI + Edge | ✅ R13.2 | **Pantsir henüz mock POI kullanıyor** — hook wire |
| Suç/eğitim/sosyo gerçek | 🔴 | R13.3 ETL |

---

## C) LOGO + BRAND (~3–5 saat)

### C.1 Logo / asset envanteri

| Dosya | Durum | Aksiyon |
|-------|--------|---------|
| `public/logo.svg` | ✅ Primary (`Logo.tsx`) | — |
| `public/favicon.svg` | ✅ | — |
| `public/ihaleal_com_logo.png` | 🟡 Hâlâ repo’da | Temizlik / tek kaynak |
| `public/ihaleal-logo.png` | ❌ Yok (temiz) | — |
| `index.html` → `icon-192.png` | 🔴 **Dosya yok** public/ | PWA icon üret |
| `og-image` | 🟡 Placeholder inject | Gerçek OG PNG |
| `manifest.json` | 🔴 **Yok** | PWA için ekle |

### C.2 Brand tutarlılığı

- Renk: mavi-teal gradient — Premium home + logo uyumlu ✅
- Tipografi: Tailwind system — tutarlı 🟡
- SEO meta: `index.html` + `src/lib/seo.ts` — 🟡 dinamik ilan yok

### C.3 Error / loading

| Sayfa | Durum |
|-------|--------|
| 404 `NotFound` | ✅ |
| ErrorBoundary | ✅ (500 placeholder) |
| Loading skeleton | 🟡 Modül bazlı |

**Eksik:** icon-192/512 set; eski PNG kaldır; OG image final.

---

## D) MOBİL UYGULAMA (~28–37 saat)

### D.1 K-M6 (`ihaleal-mobile` ayrı worktree)

| Ekran | Durum |
|-------|--------|
| Mesajlar | 🔴 MOCK |
| Bildirimler | 🔴 MOCK |
| Favoriler | 🔴 MOCK |
| Belgeler | 🔴 MOCK |

**Tablolar hazır** — hook + mapping eksik ([`K_M6_KAPSAM.md`](./K_M6_KAPSAM.md)).

### D.2 Responsive web

| Alan | Durum |
|------|--------|
| Navbar hamburger | ✅ Hotfix sonrası |
| PantsirPanel mobile | 🟡 Grid 2+3+5 — canlı test önerilir |
| Footer | ✅ Ana sayfada |

### D.3 PWA

| Madde | Durum |
|-------|--------|
| `sw.js` | 🟡 Var |
| `sw-unregister.js` | 🟡 Legacy cleanup |
| manifest | 🔴 Yok |
| Offline | 🔴 Yok |

---

## E) EDGE + BACKEND (~10–15 saat)

### E.1 Edge deploy matrisi (güncel kod `8a16731`)

| Function | Deploy | Anon test | Not |
|----------|--------|-----------|-----|
| `ai_qa` | ✅ | 401/502 | **502 debug açık** |
| `earthquakes_latest` | ✅ | 401 | AFAD feed |
| `pvgis_solar` | 🟡 | 405/401 | TS fix `a266a1b` |
| `nearby-poi` | ✅ | 200 (UA fix) | Cold start timeout risk |
| `post_chat_message` | 🔴 | 404 | Mesajlaşma |
| `tcmb_yiufe` | 🔴 | 404 | Vergi sim |
| `payments-*` | 🔴 | 404 | Ürün kararı |
| `place-bid` | ✅ | 401 | — |
| `kyc-submit` | ✅ | 401 | — |
| `matching-fanout` | ✅ | cron | — |

### E.2 Database

| Konu | Durum | Eksik |
|------|--------|-------|
| Index’ler | 🟡 Migration’larda var | Slow query profili yok |
| Cron | 🟡 `matching-fanout-every-minute` | pg_cron GUC prod teyit |
| **Backup** | 🔴 | Master “No backups” — **Supabase Pro + PITR** |

### E.3 Storage

| Kullanım | Durum |
|----------|--------|
| İlan foto | 🔴 **Yok** |
| Avatar | 🔴 |
| PDF rapor | 🟡 Metadata; bucket policy doğrula |
| CDN | Vercel static ✅ |

### E.4 Rate limiting

- Edge: 🟡 Internal cron secret var; public `ai_qa` rate limit zayıf
- Anon REST: Supabase default

---

## F) ENTEGRASYONLAR (~20–40 saat)

### F.1 Canlı

| Entegrasyon | Durum |
|-------------|--------|
| AFAD / deprem | ✅ `earthquakes_latest` |
| OSM Overpass | ✅ `nearby-poi` |
| PVGIS | 🟡 Edge deploy |
| OpenAI | 🟡 `ai_qa` 502 |

### F.2 R13 planlı

| Kaynak | Maliyet | Paket |
|--------|---------|-------|
| TÜİK / SEGE | ₺0 | R13.3 |
| MEB okul | ₺0 sınırlı | R13.3 |
| EGM / proxy | Sınırlı | R13.3 |
| Endeksa SES | ~$500/ay | Opsiyonel |
| Google Places | ~$850/ay | Premium POI |
| TCMB Yİ-ÜFE | ₺0 | Edge deploy |

### F.3 Diğer (yok)

TKGM tapu, belediye e-imar, banka kredi API, Twilio/Netgsm SMS, SendGrid/Resend e-posta, 3. taraf valuation API.

---

## G) PERFORMANS + OPTİMİZASYON (~8–12 saat)

### G.1 Bundle (post-R6)

| Chunk | ~KB | Not |
|-------|-----|-----|
| vendor-charts | 445 | Budget OK |
| index shell | 300 | OK |
| jspdf (lazy) | 390 | PDF tıklama |
| PremiumCinematicHome | sync | **N3** split opsiyonel (~60–80 KB) |

### G.2 Images

- Vercel Image Optimization: 🟡 Statik public JPG
- WebP/AVIF: 🔴
- Lazy load: 🟡 Kısmi

### G.3 SEO

| Madde | Durum |
|-------|--------|
| `sitemap.xml` | 🟡 Statik — **ilan URL yok** |
| `robots.txt` | ✅ |
| Schema.org Property | 🔴 |
| OG tags | 🟡 Template |

### G.4 Web Vitals

- Lighthouse: 🔴 Ölçülmedi (audit öneri)
- Playwright smoke: ✅ CI (`test:smoke`)

---

## H) TEST + KALİTE (~10–15 saat)

### H.1 Test envanteri

| Tür | Sayı / durum |
|-----|----------------|
| Vitest unit | **~30** dosya (`src/**/*.test.ts`) |
| Valuation | ✅ 4/4 PASS |
| E2E Playwright | 🟡 Smoke only — genişlet |
| Visual regression | 🔴 Yok |

### H.2 CI/CD

| Madde | Durum |
|-------|--------|
| GitHub Actions | ✅ verify + smoke |
| R6 bundle budget | ✅ |
| Vercel auto-deploy | ✅ |
| Branch protection | 🟡 Master teyit |

### H.3 Monitoring

| Araç | Durum |
|------|--------|
| Sentry | 🟡 Kod var; **DSN embed yok** |
| Vercel Analytics | 🟡 Plan bağlı |
| Supabase logs | ✅ Dashboard |

---

## I) DOKÜMANTASYON (~5–8 saat)

| Alan | Durum | Eksik |
|------|--------|-------|
| README | 🟡 | Güncel deploy runbook |
| CONTRIBUTING | 🔴 | — |
| API (Supabase) | 🟡 Auto | Edge contract doc |
| SSS | ✅ R12.6 | Pantsir/R13 maddeleri |
| Yardım merkezi | 🔴 Article CMS |
| Deploy / rollback | 🟡 `_audit/` | Tek runbook |
| Master yol haritası | ✅ | Bu dosya ile birlikte |

---

## J) İŞ + RESMİ (Master + dış)

### J.1 Yasal sayfalar (UI)

✅ Kullanım koşulları, KVKK, gizlilik, çerez, mesafeli satış, aydınlatma — route’lar canlı.

**Eksik:** Hukuk review (Pantsir skor disclaimer); hesap silme metni.

### J.2 İş geliştirme

| Konu | Durum |
|------|--------|
| Komisyon %2+2 | ✅ `fees.ts` |
| Banka anlaşması | 🔴 Master |
| Avukat / şirket | 🔴 Master |
| Emlakçı portal sözleşme | 🟡 `public/legal/agency_contract.md` |

### J.3 Pazarlama

- Blog route ✅ — içerik az
- Referral / sadakat 🟡 sayfalar var
- SEO strateji 🟡 statik sitemap

---

## ÖNCELİK MATRİSİ (RICE — Cursor önerisi)

Reach/Impact 1–10, Confidence 0–1, Effort saat. **RICE = (R×I×C)/E**

| # | İş | R | I | C | E | RICE | Band |
|---|-----|--:|--:|--:|--:|-----:|------|
| 1 | ai_qa 502 + OPENAI secret | 8 | 8 | 0.8 | 4 | **12.8** | 🔴 |
| 2 | İlan foto Storage upload | 9 | 9 | 0.9 | 12 | **6.1** | 🔴 |
| 3 | 3 KYC user verify | 7 | 9 | 1.0 | 1 | **63** | 🔴 |
| 4 | Pantsir mock → useNearbyPOI wire | 8 | 7 | 0.9 | 6 | **8.4** | 🔴 |
| 5 | E-posta sağlayıcı (Resend) | 9 | 8 | 0.8 | 8 | **7.2** | 🔴 |
| 6 | post_chat_message deploy | 6 | 7 | 0.9 | 4 | **9.5** | 🔴 |
| 7 | KVKK hesap silme | 5 | 8 | 0.7 | 8 | **3.5** | 🔴 |
| 8 | R13.1 Geofence + VAPID | 7 | 9 | 0.7 | 10 | **4.4** | 🟡 |
| 9 | R13.3 TÜİK ETL MVP | 6 | 8 | 0.6 | 12 | **2.4** | 🟡 |
| 10 | K-M6 favorites ekran | 5 | 7 | 0.8 | 8 | **3.5** | 🟡 |
| 11 | payments-* deploy (PSP onay) | 8 | 10 | 0.5 | 20 | **2.0** | 🟡 |
| 12 | PWA manifest + icons | 6 | 5 | 0.9 | 3 | **9.0** | 🟡 |
| 13 | Sentry DSN prod | 5 | 6 | 0.9 | 2 | **13.5** | 🟡 |
| 14 | Dinamik sitemap (ilanlar) | 4 | 6 | 0.7 | 6 | **2.8** | 🟢 |
| 15 | Multilang R12.13 | 4 | 5 | 0.5 | 16 | **0.6** | 🟢 |
| 16 | R13.5 mobile geofence | 5 | 8 | 0.6 | 12 | **2.0** | 🟢 |
| 17 | Premium home lazy (N3) | 3 | 4 | 0.9 | 2 | **5.4** | 🟢 |
| 18 | npm audit fix (ws) | 4 | 4 | 0.95 | 1 | **15.2** | 🟢 |
| 19 | Supabase backup / Pro | 10 | 10 | 1.0 | 2 | **50** | 🔴 |
| 20 | Google Places premium | 6 | 7 | 0.5 | 8 | **2.6** | Master karar |

**Top 5 hemen:** KYC×3, Supabase backup, ai_qa fix, Sentry, npm audit → sonra foto storage + Pantsir POI wire.

---

## ÖNERİLEN 4 HAFTALIK ROADMAP

### Hafta 1 — Kritik bloklayıcılar (~25s)

- ai_qa 502 + secrets envanter
- Supabase Pro + backup açık
- 3 KYC user verify + teklif smoke
- İlan foto → Storage pipeline
- E-posta sağlayıcı (auth + ihale bildirimi iskelet)
- PantsirPanel → `useNearbyPOI` wire (mock skor bandı kalabilir)
- post_chat_message deploy
- PWA icons + manifest

### Hafta 2 — R13 Pantsir devam (~15s)

- R13.1 Geofence web + VAPID + `/ayarlar/bildirimler`
- R13.3 TÜİK CSV ETL MVP → Pantsir skor bandı
- KVKK hesap silme taslağı
- Sentry prod

### Hafta 3 — Mobile + mesaj (~20s)

- K-M6: favorites → notifications → documents → messages
- R13.5 mobile geofence başlangıç
- Mesajlaşma UI prod test
- tcmb_yiufe + pvgis deploy

### Hafta 4 — Polish + lansman hazırlık (~15s)

- Performans (N3 optional, image opt)
- Dinamik sitemap + Schema.org
- Yasal final review
- PSP kararı → payments deploy (master onay)
- Soft launch checklist

---

## TOPLAM EFOR + MALİYET

| Kategori | Saat | Aylık servis |
|----------|-----:|---:|
| Güvenlik | 15–25 | $0 (+ Supabase Pro ~$25) |
| Özellikler | 40–60 | ~$200 e-posta/SMS |
| Logo/Brand | 3–5 | $0 |
| Mobile (K-M6+R13.5) | 28–37 | $99 Apple + $25 Google |
| Edge/Backend | 10–15 | Supabase usage |
| Entegrasyonlar | 20–40 | **$0–$1.350** (OSM vs Google+Endeksa) |
| Performans | 8–12 | $0 |
| Test/Kalite | 10–15 | Sentry ~$26 |
| Doküman | 5–8 | $0 |
| İş resmi | Master | Avukat + şirket |
| **TOPLAM** | **140–220** | **~$300–$1.700/ay** |

---

## MASTER KARAR MATRİSİ (yarın sabah)

| Soru | Seçenek A | Seçenek B |
|------|-----------|-----------|
| POI API | OSM ücretsiz (mevcut) | Google Places +$850 |
| SES / suç | TÜİK + proxy | +Endeksa $500 |
| Lansman tempo | 4 hafta yoğun | 2–3 ay normal |
| PSP | Bekle (demo) | iyzico deploy Hafta 4 |
| Mobile öncelik | Hafta 3 K-M6 | Web R13 önce |

---

## ÖNERİLER (sahiplenerek)

1. **Öncelik:** Hafta 1 bloklayıcılar → R13.1 → R13.3 → K-M6 (yol haritası ile uyumlu).
2. **Ekip:** Master + Cursor/Claude agent; yoğun 3–4 hafta veya 2–3 ay normal.
3. **Disiplin:** Her PR = tsc + build + 5 endpoint curl + audit 1 satır.
4. **Risk:** ai_qa 502 ve foto storage **lansman öncesi** zorunlu; App Store +2 hafta buffer.

---

## SON SÖZ

ihaleal **R12 resmi kapanış + v0.12.8** ile mühendislik baseline’ını sağlamlaştırdı. **Pantsir vizyonu başladı** (UI iskelet + OSM POI) ama **“tam donanımlı istihbarat + satışa hazır marketplace”** için ~**140–220 saat** ve **servis maliyeti kararı** var. Master yarın: **RICE top 5** + **Hafta 1** onayı → sprint başlat.

---

## Referans audit dosyaları

- [`MASTER_YOL_HARITASI_2026_05_30.md`](./MASTER_YOL_HARITASI_2026_05_30.md)
- [`FEATURE_INVENTORY.md`](./FEATURE_INVENTORY.md)
- [`KALAN_ISLER.md`](./KALAN_ISLER.md)
- [`R13_PANTSIR_PLAN.md`](./R13_PANTSIR_PLAN.md)
- [`EDGE_FUNCTIONS_DEPLOY_STATUS.md`](./EDGE_FUNCTIONS_DEPLOY_STATUS.md)
- [`K_M6_KAPSAM.md`](./K_M6_KAPSAM.md)
- [`ENDPOINT_SWEEP.md`](./ENDPOINT_SWEEP.md)
- [`BUNDLE_FINAL.md`](./BUNDLE_FINAL.md)

*Son güncelleme: HEAD `8a16731` — docs(audit) komut zinciri final*
