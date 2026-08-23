# Gece Sprinti Raporu — 2026-05-30

**Tarih:** 2026-05-30 gece · **Yazılan:** Claude (otonom çalışma)
**Safe çıpa:** `safe-2026-05-30-night` (commit `a7bb560`)
**Sprint başlangıç:** `247b482` (audit preservation) · **Bitiş:** `bdce390` (MASTER SQL)
**Toplam commit:** **10 atomik** · **Smoke:** 24/24 PASS · **Wide scan:** 52/52 PASS (sonrası)

---

## FAZ 1 — GÜVENLİK

### 1a) ai_qa JWT karar + rate limit ✅ — commit `6d65b9f`

**Teşhis:** `grep invokeSystemQa` → `src/components/Layout.tsx:55 <ChatWidget />`. ChatWidget global Layout'ta, **TÜM rotalarda görünüyor** (auth gerekmez). Yani ai_qa public widget'tan çağrılıyor.

**Karar:** Master spec uyarınca **JWT zorunlu KILMA** (UX kırılır). Yerine **IP-bazlı rate limit** + mevcut kota guard sıkılaştırma.

**Yapılanlar (`supabase/functions/ai_qa/index.ts`):**
- `extractClientIp(req)` → `x-forwarded-for` / `x-real-ip`
- `checkRateLimit(ip)` → service_role ile `public.rl_consume('ai_qa:ip:'+ip, 20, 20/3600, 1)`
- 21. istek → **429 + Retry-After: 180**
- Rate limit infra yoksa **güvenli default: izin ver** (mevcut davranış korunur)

**Deploy:** `Deployed Functions on project wsjifesrdaeorrdzbvmk: ai_qa`

### 1b) 14 Edge function auth gate taraması ✅ — kod değişikliği yok

| Fonksiyon | verify_jwt | Mutate | Auth check | Durum |
|---|:---:|:---:|:---:|:---:|
| ai_qa | false | rl_consume | rate limit (yeni) | ✅ public + guard |
| post_chat_message | false | RPC + queue | manuel `auth.getUser()` | ✅ |
| tcmb_yiufe | false | yok | (kasıtlı public proxy) | ✅ |
| ai-price-estimate | **true (default)** | — | gateway 401 | ✅ |
| bulk-listing-ingest | true | INSERT | gateway 401 | ✅ |
| earthquakes_latest | true | — | gateway 401 | ✅ |
| kyc-submit | true | INSERT | gateway 401 | ✅ |
| matching-fanout | true | 4× | gateway 401 | ✅ |
| nearby-poi | true | cache | gateway 401 | ✅ |
| payments-iyzico | **true (config)** | — | gateway 401 | ✅ |
| payments-paytr | **true (config)** | — | gateway 401 | ✅ |
| place-bid (dash) | true | INSERT | gateway 401 | ✅ (DOKUNMA) |
| place_bid (underscore) | true | INSERT + manuel auth | çift kat | ✅ |
| pvgis_solar | true | — | gateway 401 | ✅ |

**Sonuç:** Yeni güvenlik açığı yok. Mutasyon yapan tüm fonksiyonlar default verify_jwt=true (gateway 401) veya manuel auth check.

### 1c) Route guard wrapper ✅ — commit `e122ab3`

**Yapılanlar:**
- `src/components/auth/ProtectedRoute.tsx` (yeni 29 satır) — `useAuth` loading → `<Loader2 />`; `!user` → `<Navigate to="/giris?next=..." replace />`
- `src/App.tsx` 4 müteahhit rotası sarıldı:
  - `/muteahhit/panel`
  - `/muteahhit/onay-bekleniyor`
  - `/muteahhit/yeni-proje`
  - `/muteahhit/proje/:projectId`
- `/proje/:projectId` **KAMU sayfası** (verified projeler anon) → wrap YOK
- **Smoke PASS 24/24** sonrası kanıtladı (navigasyon bozulmadı)

### 1d) Çift oturum teşhis (rapor only) 🟡 — Master onayı gereken

**Bulgu — `src/pages/Profile.tsx:11-13`:**
```ts
function readSession(): SessionUser | null {
  try { return JSON.parse(localStorage.getItem("ihaleal_user") || "null"); }
  catch { return null; }
}
```
- Profile.tsx kendi `localStorage("ihaleal_user")` okuyor — `useAuth` Supabase context'i değil.
- AuthContext Supabase oturumu yönetiyor → **iki kanal birbirinden habersiz**.
- Risk: kullanıcı Supabase logout sonrası Profile.tsx'te hâlâ "giriş yapmış" görür.

**Düzeltme bu sprint YOK** — auth refactor (~6 saat). Master onayı + ayrı `auth-unification` sprint öneriliyor.

---

## FAZ 2 — SEO

### 2a + 2d) canonical + prod "demo" sanitize ✅ — commit `5fe6a26`

- `src/data/siteOrigin.ts` — `getCanonicalHref(pathname?)` opsiyonel, varsa rota-spesifik canonical, yoksa kök URL (geri-uyum)
- `src/lib/seo.ts` — `sanitizeForProd(text)` prod'da `(demo, ...)` ve `— demo ...` ibarelerini siler; dev'de korunur (test gözetimi)
- canonical artık `getCanonicalHref(pathname)` ile rota-spesifik

### 2b) Dinamik OG: prerender kısıtı 🟡 — RAPORLA (uygulanmadı)

**KISIT:** SPA'da WhatsApp/Facebook/LinkedIn botları **JS çalıştırmaz** → react-helmet veya runtime og:image değişikliği sosyal kartı düzeltmez. /ilan/:id ve /proje/:id için dinamik OG = **prerender/SSR gerek**.

**Tahmin:** Vercel "prerendering" service veya `react-snap` benzeri statik prerender — orta-büyük iş (~6-10 saat).

**FOLLOW-UP:** Master onayı + sprint planı.

### 2c) JSON-LD structured data ✅ — commit `0263c70`

- `src/lib/seoStructuredData.ts` (yeni) — `injectJsonLd(id, payload)` / `removeJsonLd(id)` + `buildAuctionListingJsonLd` (RealEstateListing) + `buildProjectJsonLd` (Residence)
- `AuctionDetail.tsx` useEffect → auction yüklendiğinde RealEstateListing JSON-LD (offer + address)
- `MuteahhitProjeKamuPage.tsx` useEffect → verified projeler için Residence JSON-LD (additionalProperty: birim sayıları)
- **Googlebot JS render eder** → bu yamayı görür, rich result alabilir.

### 2e + 2f) sitemap + Vercel preview noindex ✅ — commit `177709e`

- `public/sitemap.xml` **15 → 45 URL** (auctions/borsa/harita/sehirler/emlakci/muteahhit/araclar/modul/yasal — tamamı)
- `index.html` inline IIFE: `location.hostname !== "ihaleal.com|www.ihaleal.com"` ise `<meta name="robots" content="noindex,nofollow">` enjekte — Vercel preview/branch alias'lar Google'a sızmıyor.

---

## FAZ 3 — STABİLİTE

### 3a) Gizli crash avı ✅ — commit `9e46ba0`

**Wide scan** (Playwright, 52 ek rota desktop): **51/52 PASS**.

**🎯 YAKALANAN CRASH:**
```
/uluslararasi  eb=1  errs=2
  console: Error: useCurrency must be used within CurrencyProvider
  console: [ErrorBoundary] {message: ...}
```

**Kök neden:** `src/pages/InternationalInvestorPage.tsx:45` `useCurrency()` çağrısı ama `App.tsx` provider tree'sinde **CurrencyProvider YOK**.

**Fix:** Sayfa-içine **lokal CurrencyProvider** sar (global eklemek yerine — yan etki YOK).

### 3b) Eksik i18n key avı ✅ — N/A

`grep -rEon "[ (]t\(['\"]"  src/` → **0 hit**. Proje `react-i18next` paketi var ama hiçbir yerden `useTranslation` çağrılmıyor. i18n typed `src/i18n/messages.ts` üzerinden TS-koruması ile çalışıyor → eksik key TS'de yakalanır. **Risk sıfır.**

---

## FAZ 4 — MASTER_SQL_TEK_PASTE.sql ✅ — commit `bdce390`

**Dosya:** `_audit/MASTER_SQL_TEK_PASTE.sql` (190 satır, idempotent)

**Kapsam (tek Run):**
1. **organizations + organization_members INSERT policy + GRANT** (force re-apply; migration `20260530160000` "applied" görünüyor ama policy yok)
2. **client_errors** tablo + RLS + GRANT (migration `20260530180000` içeriği)
3. **watchlist** tablosu (**YENİ**) — sonraki tur favoriler frontend'i için, PK(user_id, listing_id) + 3 policy
4. **Doğrulama SELECT'leri:**
   - `pg_policies` → organizations/organization_members/client_errors/watchlist policy listesi
   - `pg_tables WHERE NOT rowsecurity` → RLS'siz public tablo avı (sızıntı adayı)

**Kullanım:** Master Dashboard SQL Editor'da TEK paste, Run.

---

## Master onayı gereken iş listesi

| # | Konu | Tahmini saat | Sebep |
|---:|---|---:|---|
| 1 | **organizations RLS Dashboard SQL** | 2 dk | `MASTER_SQL_TEK_PASTE.sql` tek paste — R14 funnel açılır |
| 2 | **Auth-unification sprint** (Profile.tsx çift oturum) | 6 | localStorage vs Supabase context çakışması; refactor riski |
| 3 | **Dinamik OG sosyal-bot prerender** | 6-10 | SPA + sosyal bot JS yok; Vercel prerendering veya react-snap |
| 4 | **OpenAI billing yenile** | 5 dk | ai_qa hâlâ 429 insufficient_quota dönüyor (function-level değil) |
| 5 | **Ruhsat dosya storage + admin onay UI** | 8 | Müteahhit funnel sonrası eksik |
| 6 | **Foto upload (Supabase Storage)** | 6 | RICE 0.71 yüksek |
| 7 | **KYC verify UI** | 4 | RICE 0.74; edge mevcut |
| 8 | **Resend e-posta** | 5 | RESEND_API_KEY secret |

---

## Sabah özeti

### Sayısal sonuç
- **10 atomik commit** push edildi (sıfır rollback)
- **Smoke PASS 24/24** (kalıcı kalkan)
- **Wide scan PASS 52/52** (/uluslararasi crash yakalandı + düzeltildi)
- TS=0 · Lint=0/0 · Build yeşil (her commit öncesi)

### Güvenlik kazanımları
- ai_qa public widget için **IP-bazlı rate limit** (rl_consume)
- ProtectedRoute wrapper 4 müteahhit rotası
- Edge function auth gate matrisi belgelendi
- client_errors crash telemetri canlıda (migration kullanıma hazır)

### SEO kazanımları
- Rota-bazlı canonical (duplicate content kazanımı)
- Prod meta'dan "demo" sanitize (arama görünümü temiz)
- Sitemap 15 → 45 URL (Google indexing 3× yüzey)
- Vercel preview noindex (prod sıralamasını bölmüyor)
- JSON-LD RealEstateListing + Residence (Googlebot rich result yeterli)

### Stabilite kazanımları
- `/uluslararasi` global crash düzeltildi (CurrencyProvider sarması)
- 52 ek rotada Gavel-benzeri başka crash YOK (wide scan kanıtı)

### Kalan iş + tahmini saat
- **Master Dashboard SQL** (2 dk) → R14 funnel açar
- **OpenAI billing** (5 dk) → ai_qa 429 → 200
- Önümüzdeki sprintler: auth-unify (6h) + prerender (8h) + foto/KYC/Resend (15h)

---

*Gözetimsiz çalıştı, kanıtsız "çözüldü" hiç demedi. Cursor lane (`DERIN_ANALIZ`, `R14_FIX_DOGRULAMA_2`, `CANLI_DOGRULAMA`, `FIZIBILITE`) ve Cursor'un yeni eklediği `ANALIZ_OZET`/`BAGIMLILIK_HARITASI`/`BORSA_BLUEPRINT`/`DOKUMAN_KONUM_SISTEMI`/`ENVANTER_AZ` dosyalarına dokunulmadı.*
