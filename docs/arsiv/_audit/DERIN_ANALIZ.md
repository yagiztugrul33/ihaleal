# 🔬 DERİN ANALİZ — 3 SORU / DÜRÜST TEŞHİS

**Tarih:** 2026-06-01
**Yöntem:** Canlı ihaleal.com (Playwright) + localhost:4254/4173 + Supabase CLI + git/kod analizi
**Doktrin:** Sadece TEŞHİS — düzeltme YOK (önce ne bozuk görelim)
**Master not:** `localhost:4254` ile canlı `www.ihaleal.com` aynı build'i serve ediyor (Etag eşleşti); ama veri kaynağı farklı (local: mock + "Supabase yapılandırması eksik" banner / canlı: gerçek Supabase).

---

## ⚡ ÜÇ-CÜMLELİK SONUÇ

1. **İlanlar görünmüyor → YANLIŞ TANI.** /ilanlar → /auctions redirect ✅ + 13 ilan kartı + 14 görsel render ediliyor (hem canlı hem local). Master "boş" gördüyse: filtre/cache/mobil scroll.
2. **Para sistemi → İSKELET HAZIR, CANLIDA YOK.** Kod ve migration repoda, ama `payments-iyzico` Edge fonksiyonu Supabase'e **deploy edilmemiş** (11 fonksiyon arasında yok) + `20260606200000_payments_subscriptions` migration **canlıda APPLY EDİLMEMİŞ** (Remote sütunu boş).
3. **Güvenlik → DÜZELDİ + ARTI/EKSİ.** v3 testleri 100% PASS (11/11 sanitize + 9/9 race + sealed + IDOR + 7 header CSP+iyzipay). npm audit: 0 critical, 6 high (capacitor zincir, sadece build araçları — runtime'a etki yok).

---

## A) İLANLAR — NEDEN GÖRÜNMÜYOR?

### A1 — Port/Server teşhisi

| Port | PID | Başlatma | Durum | Kanıt |
|---|---|---|---|---|
| **4254** | 27072 | **01-06 17:04** (bugün) | ✅ Taze build | `Get-Process 27072` |
| **4173** | 6724 | **31-05 04:08** (dün) | ⚠️ Dünden kalma | `Get-Process 6724` |
| **5173** | — | — | KAPALI | netstat boş |

Etag karşılaştırması: `W/"26be-9AsWOWDtA00OCW9NmlcV6kOoYXY"` — **iki port aynı `dist/index.html`'i serve ediyor.** Yani 4173 dünden çalışıyor olsa da aynı SPA shell. Veri farkı: SPA içinde JS runtime'da fetch oluşuyor.

**Master `localhost:4254`'e baksa da bakmasa da fark etmez** — ikisi de aynı build.

### A2 — Canlı /ilanlar render (Playwright, 1280×800)

| URL | HTTP | Final | Title | İlan kartı | Görsel | Console err |
|---|---|---|---|---|---|---|
| `www.ihaleal.com/ilanlar` | 200 | `/auctions` | ihaleal.com — AI dest. GM | **13 kart** | 14 | 0 |
| `www.ihaleal.com/ihaleler` | 200 | aynı | İhaleler — ihaleal.com | **19 kart** | 12 | 0 |
| `www.ihaleal.com/auctions` | 200 | aynı | ihaleal.com | **13 kart** | 12 | 0 |

Render metni kanıtı (`/auctions` ana içeriği):
> *"Canlı İhaleler... Levent'te Prestijli Plaza Katı ₺31.3M... Bebek'te Boğaz Manzaralı Tarihi Villa ₺148.5M... Ataşehir'de Kiracılı AVM..."*

**Sonuç:** ✅ İlanlar **GÖRÜNÜYOR**. 0 console hatası. Supabase REST API (`/rest/v1/auctions?...`) 200 dönüyor.

### A3 — Route haritası (src/App.tsx)

| Path | Davranış | Bileşen |
|---|---|---|
| `/ilanlar` | → `/auctions` redirect | (Navigate replace) |
| `/auctions` | → render | `AuctionListPage` (`Auctions` section) |
| `/ihaleler` | → render | `LiveAuctions` (hero + 2 vitrin + Auctions) |

**Aynı veri kaynağı** (`auctionsSource.ts`): Supabase `auctions+listings` JOIN + local `AUCTIONS` mock + localStorage user ilanları.

### A4 — Veri katmanı

Supabase çağrısı (canlıdan yakalandı):
```
GET /rest/v1/auctions?select=id,status,starts_at,ends_at,current_high_bid_try,listings(id,title,body,status,buy_now_price_try,is_featured,fe…)
HTTP 200
```

RLS engellemiyor (200 dönüyor). En az 13 satır gelmiş olmalı çünkü 13 kart render edildi.

### A5 — Console hataları (canlı /ilanlar)

```
consoleErrors: []
networkErrors: []
```
**0 hata.** CSP düzeltmesi (e1fe3e0) sonrası temiz.

### A6 — KÖK SEBEP

> **İlanlar görünmüyor — TEMELSİZ.** Canlı + local **13 ilan kartı** + 14 görsel render ediliyor; redirect zinciri (`/ilanlar → /auctions`) çalışıyor; Supabase 200 dönüyor; 0 console hatası.
>
> Master "boş" gördüyse muhtemel senaryolar:
> 1. **Filtre uygulanmış** (URL query: `?status=live&city=…&min=…`) → 0 sonuç
> 2. **Cache** — eski 4173 build, hard refresh (`Ctrl+Shift+R`) lazım olabilir
> 3. **Login öncesi "Benim İçin Bul" paneli** açık → kişiselleştirilmiş 0 sonuç
> 4. **Mobil 320px ekran** + üst banner çok yer kaplıyor, scroll altında
> 5. **AdBlocker** — Vercel/Supabase çağrısı bloklanmış (canlıda Cookie bazlı CSP karşılaştırması yapmak gerekir)

**Master'a:** `https://www.ihaleal.com/auctions?status=all&deal=all&cat=all&min=0&max=300000000&q=` ile filtreleri sıfırla; hard refresh; başka bir tarayıcıda dene; mobilde aşağı kaydır.

### A7 — TAVSİYE (Düzeltme yok, sadece öneri)

- **Master mesajını netleştirmek için:** ekran görüntüsü + URL + tarayıcı konsol açıkken (F12) hata var mı kontrol.
- Eğer hâlâ boşsa: Master'ın IP'sinden Supabase REST 200 mü 401 mi 503 mü dönüyor → ağ filtre/firewall olabilir.

---

## B) PARA SİSTEMİ — ÇALIŞIYOR MU?

### B1 — PARA BLOK 1 ne yapıldı (commit `b4d48be`)

| Bileşen | Kodda | Canlıda |
|---|---|---|
| `supabase/functions/payments-iyzico/index.ts` (472 satır) | ✅ | ❌ **DEPLOY YOK** |
| `supabase/migrations/20260606200000_payments_subscriptions.sql` (274 satır) | ✅ | ❌ **APPLY YOK** |
| `src/lib/payments/paymentClient.ts` (186 satır) | ✅ | ✅ (frontend, statik build'le canlıda) |
| `src/pages/payment/PaymentStartPage.tsx` | ✅ | ✅ |
| `src/hooks/useMembershipTier.ts` (subscriptions RPC + memberships fallback) | ✅ | ✅ |

### B2 — Canlı doğrulama

```
GET https://wsjifesrdaeorrdzbvmk.supabase.co/functions/v1/payments-iyzico
→ {"code":"NOT_FOUND","message":"Requested function was not found"}
```

**KRİTİK:** Edge function CANLIDA YOK.

`npx supabase functions list` çıktısı — 11 aktif fonksiyon var ama **`payments-iyzico` YOK**:
- matching-fanout, place-bid, ai-price-estimate, bulk-listing-ingest
- kyc-submit, ai_qa, earthquakes_latest, pvgis_solar
- nearby-poi, post_chat_message, borsa_etl

### B3 — Migration durumu (canlı vs local)

`npx supabase migration list` çıktısı:
```
LOCAL          | REMOTE         | NAME
20260606120000 | 20260606120000 | listing_transaction_history       ✅ canlıda
20260606200000 | (boş)          | payments_subscriptions             ❌ canlıda YOK
```

`payments` + `subscriptions` tabloları **canlıda yok** — `useMembershipTier`'in `rpc('get_my_subscription')` çağrısı hata atıp eski `memberships` tablosuna düşecek.

### B4 — Sandbox test sonucu

Edge fonksiyonu deploy edilmediği için **sandbox akışı test EDİLEMEZ**. Sandbox simülasyon kodu var (anahtar yoksa otomatik sandbox), ama fonksiyon yüklenmedikçe çalışamaz.

### B5 — Merchant key durumu

`envOk()` kontrolü iyzico fonksiyonunda var:
```ts
IYZICO_API_KEY     — Master Supabase secret olarak girmedi
IYZICO_SECRET_KEY  — Master girmedi
IYZICO_BASE_URL    — Master girmedi
```
Hepsi boş → fonksiyon deploy edilse bile sandbox modunda kalır (test kartlarıyla).

### B6 — Abonelik gerçek mi?

`useMembershipTier`:
1. `rpc('get_my_subscription')` — **canlıda RPC YOK** (migration apply yok)
2. Fallback: `memberships` tablosu (eski) — **canlıda var olabilir, eski sürüm**
3. Son fallback: `localStorage` (`ihaleal_membership_tier`)

→ Şu an premium gate yalnızca **localStorage**'a göre çalışıyor (sahte, kullanıcı tarayıcıdan değiştirebilir).

### B7 — NET DURUM: "Para kazanan sisteme kavuştuk mu?"

> ❌ **HAYIR — şu an gerçek tahsilat MÜMKÜN DEĞİL.**
>
> Altyapı (Edge function + migration + UI) tam hazır, **iki adım eksik:**
>
> | Adım | Sahibi | Süre |
> |---|---|---|
> | 1. `npx supabase db push` → migration canlıya | **Master** (DB push yetkisi sende) | 1 dk |
> | 2. `npx supabase functions deploy payments-iyzico` → fonksiyon canlıya | **Claude Code** veya Master | 1 dk |
> | 3. `supabase secrets set IYZICO_API_KEY=… IYZICO_SECRET_KEY=… IYZICO_BASE_URL=https://sandbox-api.iyzipay.com` | **Master** (iyzico merchant başvuru gerekiyor) | 1-5 iş günü onay |
>
> Adım 1+2 olmadan sandbox bile çalışmaz. Adım 3 olmadan production tahsilat olmaz.

---

## C) GÜVENLİK — DÜZELDİ Mİ?

### C1 — v3 güvenlik testi (TEKRAR ÇALIŞTIRMA, bu komutta)

`node _audit/mega-ultra-v3/_security-proof.mjs` → JSON çıktı `security-proof-result.json`:

| Test | Önce | Şimdi |
|---|---|---|
| **AI sanitize** (PII redaction) | 11/11 | **11/11 ✅** |
| **Race koruması** (place_bid kod analizi) | 9/9 | **9/9 ✅** |
| **Sealed view** (`listing_offers_safe`) | ✅ | **✅** |
| **Owner-only RLS** (`device_push_tokens`) | ✅ | **✅** |
| **vercel.json header beyanı** | 7 | **7 ✅** |
| **IDOR (offers_safe + RLS)** | ✅ | **✅** |
| **Rate limit** (ai_qa fail-closed + 20/saat) | ✅ | **✅** |
| **CSRF** (JWT zorunlu, cookie session yok) | ✅ | **✅** |
| **SQL injection** (supabase-js parametreli) | ✅ | **✅** |

### C2 — Canlı header (curl -I)

| Header | Canlı değer |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; …; script-src 'self' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.iyzipay.com https://sandbox-api.iyzipay.com https://www.paytr.com https://vitals.vercel-insights.com …; frame-src https://www.google.com; worker-src 'self' blob:; …` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |

**Toplam: 7 güvenlik header CANLIDA AKTİF** ✅
CSP'de `iyzipay`/`paytr` whitelist'i var → ödeme entegrasyonu hazır.
CSP `e1fe3e0` öncesi font-src eksikti → bugün düzeltildi → **artık fontlar bloklanmıyor**.

### C3 — npm audit (şu anki durum)

```
critical: 0
high:     6
moderate: 4
low:      0
info:     0
```

| Paket | Severity | Tür | Etki |
|---|---|---|---|
| `@capacitor/assets` | high | dev/build | **Sadece native build araçları** |
| `@capacitor/cli` | high | dev/build (tar zinciri) | Build sırasında, runtime'da yok |
| `@trapezedev/project` | high | dev (replace, xcode) | iOS scaffold üretirken |
| `minimatch` | high | dev (ReDoS) | build araçlarında |
| `brace-expansion` | moderate | dev (ReDoS) | build araçlarında |

**Tümü dev/build dependency** — production bundle'a (`dist/`) gitmez → **kullanıcıya etki YOK.** ws@8.20.0 önceki uyarı görünmüyor (büyük ihtimal güncellendi veya geçti).

### C4 — CSP düzeltmesi (e1fe3e0) doğrulama

- ✅ `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` → Google Fonts artık bloklanmıyor
- ✅ `font-src 'self' data: https://fonts.gstatic.com` → font dosyaları yükleniyor
- ✅ `connect-src` içinde `https://placeholder.supabase.co` (Vercel preview için) + iyzipay sandbox+prod URL'leri
- Test kanıt: canlıda `/auctions` 0 console hatası

### C5 — Para güvenliği (kod analizi)

`payments-iyzico/index.ts` (deploy edilmediği için canlı E2E test imkansız, ama kod):

| Risk | Kod kanıt |
|---|---|
| **PCI (kart ihaleal'a gelmez)** | iyzico checkoutform — kart bilgisi iyzico'da kalır, sadece `token` alınır (satır 270-298) |
| **Server-side tutar doğrulama** | `computeTierPrice(tierId, cycle)` — frontend manipülasyonu reddedilir (satır 40-48) |
| **Idempotency** | `idempotency_key` UNIQUE + var olan kayıt için duplicate=true (satır 159-179) |
| **HMAC-SHA1 imza** | `apiKey + randomStr + secret + reqStr` (satır 269-276) — iyzico standart |
| **Auth zorunlu** | `Bearer` token + `auth.getUser()` (satır 119-138) |
| **IDOR** | `user_id = auth.uid()` her INSERT'te (RLS politikaları satır 56-66) |
| **Rate limit** | ❌ Kodda explicit rate limit YOK — global Supabase rate'e güveniyor (60 req/min/IP) |

### C6 — AÇIK KALAN GÜVENLİK SORUNLARI (NET LİSTE)

| # | Sorun | Önem | Sahip |
|---|---|---|---|
| 1 | `payments-iyzico` kendine özel rate limit yok | Orta | Claude Code (kod ekle) |
| 2 | Capacitor `@trapezedev/project` high CVE (xcode/replace) | Düşük (sadece dev) | Beklemede — Capacitor upstream |
| 3 | `payments` + `subscriptions` migration canlıda yok | **Yüksek (operasyonel)** | Master (`db push`) |
| 4 | `payments-iyzico` deploy yok | **Yüksek (operasyonel)** | Master onayı + `functions deploy` |
| 5 | iyzico secret'lar boş → sandbox bile yok | Yüksek | Master (merchant başvuru) |
| 6 | `useMembershipTier` localStorage'a güveniyor (RPC yoksa) | Orta — premium gate sahte | #3 çözülürse otomatik kapanır |

**Düzeldi:**
- ✅ AI sanitize 11/11 (Grok proof v3)
- ✅ Race koruması 9/9 (FOR UPDATE + idempotency)
- ✅ 7 güvenlik header tam (canlıda)
- ✅ CSP fontları artık bloklamıyor (e1fe3e0)
- ✅ Sealed view + Owner RLS
- ✅ JWT zorunlu (CSRF yok)
- ✅ SQL injection kapalı (supabase-js parametreli)

**Yeni eklenen (capacitor zinciri):**
- ⚠️ 6 high npm audit (dev/build araçları, runtime'a etki yok)
- ⚠️ Capacitor sandbox: keystore yönetimi henüz yok (release imza Master'da)

---

## 📊 GENEL DÜRÜST TABLO

| Özellik | Statü | Detay |
|---|---|---|
| Ana sayfa + arama + ihaleler listesi | ✅ **ÇALIŞIYOR** | 13-19 kart, Supabase 200, 0 hata |
| /ilan/:id detay + teklif (bid) | ✅ **ÇALIŞIYOR** | `place-bid` Edge function canlı (v3) |
| Borsa terminali | ⚠️ %100 MOCK | `useLiveMarket.ts` mock interval |
| KYC simülasyon | ✅ **ÇALIŞIYOR** | `kyc-submit` canlı |
| AI Q&A + değerleme | ✅ **ÇALIŞIYOR** | `ai_qa` canlı (rate limit + sanitize) |
| GES/deprem/PVGIS hesap | ✅ **ÇALIŞIYOR** | `pvgis_solar` + `earthquakes_latest` canlı |
| Hukuk hub + senaryo + risk | ✅ **ÇALIŞIYOR** | static + scenarioEngine 30k+ satır |
| Fiyatlandırma + üyelik UI | ✅ **ÇALIŞIYOR** | 5 tier + premium gate UI |
| **Ödeme — Iyzico** | ❌ **CANLIDA YOK** | Kod hazır, deploy + migration eksik |
| **Subscriptions (premium)** | ❌ **CANLIDA YOK** | Migration eksik; tier şu an localStorage |
| Mobil PWA + Capacitor Android | ✅ **SCAFFOLD HAZIR** | iOS macOS bekler |
| Güvenlik (v3 testleri) | ✅ **PASS 100%** | 11/11 + 9/9 + 7 header + sealed |
| **Storage / belge vault** | ❌ Yok | Sprint S2 (4-6. gün) |
| **Müteahhit org INSERT** | ⚠️ Migration var | Sprint S1-T01 Master'da |

---

## 🚨 MASTER İÇİN AKSİYON SIRASI

### 🔴 Kritik (1 saat içinde para sistemi açılır)
1. **Migration push**
   ```bash
   npx supabase db push
   ```
   `20260606200000_payments_subscriptions` canlıya gider → `payments` + `subscriptions` + `get_my_subscription` RPC açılır.

2. **Edge function deploy**
   ```bash
   npx supabase functions deploy payments-iyzico
   ```
   GET diagnostic 200 dönmeli (`{stage: "sandbox", missing_secrets: ["IYZICO_*"]}`).

3. **Sandbox secret'lar** (iyzico merchant başvurusu olmadan da test mümkün)
   ```bash
   supabase secrets set IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
   # API_KEY+SECRET boşken otomatik sandbox simülasyon
   ```

### 🟡 Orta (1-5 iş günü dış onay bekler)
4. **iyzico merchant başvuru** — sandbox key → production key transferi
5. **D-U-N-S** (Apple kurumsal) + App Store hesabı

### 🟢 Düşük (kullanıcıyı etkilemiyor)
6. Capacitor zinciri high CVE'leri — Capacitor 8.x güncellemesi bekleniyor
7. payments-iyzico'ya kendine özel rate limit ekleme

### 📍 Master'ın "ilanlar boş" şikayeti için
- URL: `https://www.ihaleal.com/auctions?` (filtreleri sıfırla)
- Hard refresh: **Ctrl+Shift+R**
- Tarayıcı konsolunu aç (F12) → hata olup olmadığını söyle
- Mobilde ekran görüntüsü gönder

---

## 📂 Kanıt Dosyaları

```
_audit/derin-analiz/
├── DERIN_ANALIZ.md             ← bu rapor
├── _canli-test.json            ← canlı 3 URL Playwright
├── _test-canli.mjs             ← script
├── _test-detay.mjs             ← /auctions derin test
├── _test-local.mjs             ← localhost 4254 + 4173
└── auctions-canli.png          ← /auctions canlı ekran

_audit/mega-ultra-v3/
└── security-proof-result.json  ← v3 tekrar çalıştırma sonucu
```

---

— Sonuç: **ilanlar OK · para iskelet hazır canlıda yok · güvenlik PASS** + Master'ın 2 dakikalık deploy zinciriyle para sistemi açılır. ☕🔬
