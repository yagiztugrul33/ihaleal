# Fizibilite Analizi — 2026-05-30

**Tarih:** 2026-05-30 gece · **Doğrulayan:** Claude (salt-okuma + curl)
**HEAD:** `7bd0945` (R14 P0 fix + RLS INSERT migration push edildi)
**Canlı bundle:** `index-z6JoDqv8.js` (R14 deploy)
**Supabase proje:** `wsjifesrdaeorrdzbvmk.supabase.co`

> Bu rapor **salt okunur analiz**. Cursor lane dosyalarına (`DERIN_ANALIZ_2026_05_30.md`, `R14_FIX_DOGRULAMA_*.md`) **dokunulmadı**. Her bulgu dosya:satır kanıtı veya gerçek HTTP/grep çıktısıyla destekli — tahminle bulgu YOK.

---

## A) AKTİF HATALAR (canlı kanıt)

### A1. Mobil "500" — CLIENT-CRASH (kök neden henüz kanıtlanmadı)
**Severity:** P0 (production-critical)
**Kanıt:**
```
DESK=200  MOB=200  /
DESK=200  MOB=200  /muteahhit/panel
DESK=200  MOB=200  /giris
DESK=200  MOB=200  /ilan/8d9bb650-fbef-44df-b5b2-cd5c92b9c5f4
Desktop HTML bytes: 8544    Mobile HTML bytes: 8544 (identical)
```
- **Server 500 DEĞİL.** SPA shell HTTP 200, HTML payload mobile UA ile birebir aynı.
- **Client-side JS crash.** Browser console stack lazım.
- **R14 yeni 5 dosyada görünür undefined-access YOK** (hepsinde `?.` + null check + guard tam):
  - `AuctionDetail.tsx:609` lansman badge → `{isLansman && lansmanProjectId && (...)}` guard tam
  - `MuteahhitPanelPage.tsx:80,84-87` org fetch → maybeSingle + cancelled flag
  - `useDeveloperProjects.ts:90,115,210` getActiveOrgId await + `?? null`
  - `useActiveOrg.ts:25` optional chain üzerinde cast
- **Tek browser-API risk:** `src/lib/contractorOrgSlug.ts:11` `crypto.randomUUID()` — iOS Safari **< 15.4 desteksiz**. Ama yalnızca `/kayit?profil=muteahhit` form submit'te tetiklenir, "her sayfa crash" hipotezini açıklamaz.
- **Kök neden saptama yöntemi:** Mobile Safari Web Inspector veya Chrome Android remote debug ile console stack çıkarımı; veya hangi route'ta çöktüğünün belirlenmesi.
- **Fix tahmin saati (kanıt sonrası):** 0.5-1 saat (büyük olasılıkla 1-2 satır guard veya polyfill).
- **DURUM:** Fix-yok, kanıt bekleniyor.

### A2. RLS INSERT — Register 403 bloklayıcı
**Severity:** P0 (önceki sprint'in fix'ini görünmez kılıyor)
**Kanıt:**
- `supabase/migrations/20260516120100_v2_multi_tenant.sql:68-76` yalnız SELECT policy bıraktı; INSERT policy YOK.
- Register.tsx Cursor lane'i organizations INSERT'i doğru ama policy yokken RLS reddediyor.
**Çözüm:** `supabase/migrations/20260530160000_rls_org_insert.sql` yazıldı + push edildi (commit `7bd0945`).
- organizations: `FOR INSERT TO authenticated WITH CHECK (true)`
- organization_members: WITH CHECK (boş org'a owner ekleme VEYA mevcut owner/admin tarafından üye ekleme)
- `GRANT INSERT ... TO authenticated` (politika + grant ikili kapı)
**Kalan:** Master `supabase db push --linked` ile uygulamalı (yerel ortamda Docker yok + `.supabase/` link metadata yok).
**Kanıt sınama:**
```sql
-- 1) Dashboard SQL Editor (authenticated bağlam): 201 olmalı
INSERT INTO organizations (slug, legal_name, display_name, org_type)
  VALUES ('rls-test-' || gen_random_uuid()::text, 'X', 'X', 'contractor') RETURNING id;
-- 2) Anon REST (anahtar = anon key): 401/403 olmalı
curl -X POST "$SU/rest/v1/organizations" -H "apikey: $ANON" -d '{"slug":"x","org_type":"contractor"}'
```
**DURUM:** Migration push edildi, db apply master tarafında bekliyor.

### A3. Edge `ai_qa` — fetch try/catch eksik (502 ihtimali)
**Severity:** P1
**Kanıt — `supabase/functions/ai_qa/index.ts:86-101`:**
```ts
const r = await fetch("https://api.openai.com/v1/chat/completions", { ... });
if (!r.ok) {
  return new Response(JSON.stringify({ error: "openai_http", ... }), { status: 502, ... });
}
```
- OpenAI **non-2xx** durumu (4xx/5xx, kota, rate limit) ✅ ele alınıyor.
- **fetch network exception** (DNS, timeout, abort, TLS) ❌ try/catch DIŞINDA. Throw → Deno.serve handler unhandled → Edge fonksiyonu default 500.
**Fix:** ~5 satır try/catch sarmalama (~10 dk).
**HTTP test (anon JWT):** `400 ai_qa` (boş messages — beklenen davranış); 502 üretmek için OpenAI down olmalı.

### A4. Edge `pvgis_solar` — 405 anon JWT ile bile
**Severity:** P2
**Kanıt — `supabase/functions/pvgis_solar/index.ts:35-40`:**
```ts
if (req.method !== "GET") {
  return new Response(..., { status: 405, ... });
}
```
HTTP test: `405 pvgis_solar` (POST gönderdik, GET bekliyor). Eğer client `supabase.functions.invoke()` default POST gönderiyorsa 405 olur.
**Çözüm seçenekleri:**
- Edge'i POST'a da açmak (body'den parametre okumak) — 15 dk.
- Client tarafını `invoke()` yerine `fetch GET` ile çağırmak — 10 dk.

### A5. Edge `post_chat_message` — 404 deploy yok
**Severity:** P2
**Kanıt:** `404 post_chat_message` (anon JWT ile bile).
Dosya `supabase/functions/post_chat_message/index.ts` var ama deploy edilmemiş.
**Çözüm:** `supabase functions deploy post_chat_message` (~5 dk).

### A6. `earthquakes_latest` — 405 anon JWT ile
**Severity:** P2 (deprem widget zaten Borsa/Pantsir'da kullanılıyor)
**Kanıt:** `405 earthquakes_latest`.
**Çözüm:** A4 ile aynı pattern, ya GET'e çevir ya client POST gönder.

---

## B) EKSİK ÖZELLİKLER (RICE = R×I×Conf / Effort)

> R: Reach (kullanıcı oranı 0–1), I: Impact (1–5), Conf: Confidence (0–1), Effort: saat.

| Özellik | R | I | Conf | Saat | RICE | Bağımlılık |
|---|---:|---:|---:|---:|---:|---|
| **Foto upload (Supabase Storage)** | 0.95 | 5 | 0.9 | 6 | 0.71 | bucket + RLS |
| **Resend e-posta** (kayıt, teklif, kazanan) | 0.95 | 4 | 0.9 | 5 | 0.68 | RESEND_API_KEY secret |
| **KYC verify UI** (KycSimulation real verify) | 0.7 | 5 | 0.85 | 4 | 0.74 | kyc-submit edge ✅ var |
| **Ruhsat dosya storage + admin onay UI** | 0.05 | 5 | 0.9 | 8 | 0.028 | Storage + admin layout |
| **Iyzico/PayTR canlı entegrasyon** | 0.95 | 5 | 0.7 | 12 | 0.28 | merchant key + sözleşme |
| **Birim CSV/Excel bulk import** (müteahhit) | 0.05 | 4 | 0.95 | 3 | 0.063 | UI; helper hazır |
| **R13.1 geofence web** | 0.7 | 3 | 0.6 | 14 | 0.09 | leaflet draw + DB |
| **K-M6 mobile** (4 auth-bound ekran) | 0.2 | 4 | 0.7 | 14 | 0.04 | RN Expo + Supabase |
| **R13.3 Sosyo ETL (TÜİK/MEB)** | 0.4 | 3 | 0.5 | 16 | 0.038 | open-data ingest |
| **R13.5 Mobile geofence** | 0.15 | 3 | 0.5 | 12 | 0.019 | RN background loc |

> **Reach 0.05** olan kalemler müteahhit lane'ine özel; canlı dönüşüm baz alındı.

**Kanıt (grep):**
- Resend: `grep -rEn "resend\|RESEND_\|sendEmail" src/ supabase/functions/` → **0 hit** (sıfır kod).
- Storage upload: `grep -rEn "Storage\.from\|uploadFiles\|file.*upload" src/components/ src/pages/CreateAuction*.tsx` → **0 hit**.
- R13.1 geofence: `grep -rln "geofence" src/` → **0 hit**.
- KYC verify UI: `src/pages/mega/KycSimulation.tsx` yalnız demo simülasyonu; `kycVerify` UI yok.

---

## C) GELİŞTİRİLEBİLİR (UI-only guard'lar, surface, debt)

| Konu | Severity | Kanıt | Çözüm saati |
|---|---|---|---:|
| `console.log/error/warn` sayısı | düşük | `grep -rn` → **6 hit** (R12 sonrası temiz) | 0.5 |
| `TODO/FIXME` | orta | **24 hit** | 4 (triaj) |
| Bundle: `vendor-charts` 455.89 kB | orta | `dist/assets/vendor-charts-*.js` | 2 (recharts → lazy import) |
| `jspdf` 390 kB lazy chunk değil | orta | `dist/assets/jspdf.es.min-*.js` | 1 (PDF üretim dynamic import) |
| Anon SELECT yüzeyi (verified projeler) | düşük | `developer_projects` policy doğru | 0 |
| i18n key kullanımı | düşük | 93 unique `t('...')` çağrısı; tanımlı sözlük denetlenmemiş | 3 |
| `crypto.randomUUID()` iOS Safari < 15.4 | orta | `contractorOrgSlug.ts:11` | 0.25 (polyfill) |

---

## D) ÖZET — ÖNCELİK SIRASI (yüksek RICE + bloklayıcı önce)

### Hafta 1 (sprint başı — bloklayıcılar)
1. **A1 mobil crash** → kanıt sonrası guard/polyfill (~1 saat). **Gerekçe:** prod düşük → en yüksek iş etkisi.
2. **A2 RLS INSERT** → master `supabase db push --linked` (~5 dk). **Gerekçe:** Register 403 → R14 funnel'i kapalı.
3. **A3 ai_qa try/catch** (~10 dk). **Gerekçe:** AI sayfaları erişen kullanıcı 502 görüyor.
4. **A5 post_chat_message deploy** (~5 dk). **Gerekçe:** mesajlaşma akışı bloke.
5. **A4 + A6 method 405** (~25 dk). **Gerekçe:** ısı haritası + deprem widget.

**Hafta 1 toplam: ~3 saat (master "5 küçük fix").**

### Hafta 2-3 (kullanıcı kazanımı — yüksek RICE)
6. **Foto upload Storage** (~6 saat). **Gerekçe:** ilan ekleyen her satıcı için zorunlu; mock URL hâlâ kullanılıyor.
7. **KYC verify UI** (~4 saat). **Gerekçe:** teklif vermek için zorunlu; edge mevcut.
8. **Resend e-posta** (~5 saat). **Gerekçe:** kayıt onay + teklif bildirimi; secret eklenmeli.

**Hafta 2-3 toplam: ~15 saat.**

### Hafta 4+ (uzun vade — komite kararı)
9. **Iyzico/PayTR canlı** (~12 saat) — merchant kontratı bekliyor.
10. **R13.1 geofence web** (~14 saat).
11. **Ruhsat storage + admin onay UI** (~8 saat) — müteahhit follow-up.
12. **K-M6 mobile + R13.3 + R13.5** (~42 saat).

**Hafta 4+ toplam: ~76 saat.**

---

## E) TOPLAM SAAT + AYLIK API MALİYETİ

| Bölüm | Saat aralığı |
|---|---|
| Hafta 1 bloklayıcılar | 2.5 – 3.5 saat |
| Hafta 2-3 yüksek RICE | 14 – 18 saat |
| Hafta 4+ uzun vade | 70 – 90 saat |
| **TOPLAM** | **~85 – 110 saat** |

**Aylık API maliyet tahmini (yeni servisler) — tüm tier varsayımları en yakın açık fiyat:**

| Servis | Tier | Aylık | Not |
|---|---|---:|---|
| Supabase (mevcut) | Pro | $25 | RLS + Edge + Storage + Realtime |
| OpenAI (ai_qa + ai-price-estimate) | gpt-4o-mini | $15-40 | düşük volüm; max_tokens 900 |
| Resend (transactional) | Free → Pro | $0-20 | 3k mail/ay Free; üstü Pro $20 |
| Iyzico / PayTR komisyon | yüzde | — | %2-3 işlem (gelir paylaşım) |
| OSM Overpass | Free public | $0 | R13.2 cache var |
| PVGIS | Free public | $0 | rate limit yok |
| AFAD | Free public | $0 | API doğal |
| Vercel | Hobby/Pro | $0-20 | bandwidth bağımlı |
| Mapbox / Maptiler (alternatif harita) | Free → $99 | $0-99 | leaflet OSM tile bedava |

**Toplam mevcut sabit aylık: ~$25 (Supabase tek ücretli).**
**R14+ sonrası tahmini: ~$50-100/ay** (OpenAI volüm + Resend Pro + Vercel Pro).

---

## F) EN KRİTİK 5 BULGU (yönetici özeti)

1. **Mobil "500" → CLIENT-CRASH** (kesin). Server sağlam. Kök neden için browser console stack şart. Tahminle yama yok.
2. **RLS INSERT migration push edildi (`7bd0945`)** — master `supabase db push --linked` ile uygulamalı; yoksa Register 403 devam eder.
3. **ai_qa fetch try/catch dışında (satır 86-93)** — network exception 500'e dönüşür; ~10 dk fix.
4. **post_chat_message 404 (deploy yok)** — mesajlaşma kapalı; ~5 dk deploy.
5. **Foto upload + Resend + KYC verify UI sıfırdan eksik** (`grep` 0 hit) — sırasıyla en yüksek RICE (~15 saat toplam) müteahhit-dışı tüm kullanıcıları etkiliyor.

---

**Yöntem:** salt-okuma (Read + Grep + curl + git log). Hiçbir kod değişikliği yapılmadı; bu dosya dışında dosya yazılmadı. Cursor lane (`_audit/DERIN_ANALIZ_*.md`, `R14_FIX_DOGRULAMA_*.md`) tertemiz bırakıldı.
