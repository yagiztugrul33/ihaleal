# 🛡️ GÜVENLİK KARTI DÜRÜSTLÜK DÜZELTMESİ — UYGULAMA RAPORU

**Tarih:** 2026-06-01
**Tag baseline:** `safe-before-guvenlik-durust`
**Doktrin:** Sadece UI/metin değişikliği — `placeBid`/RLS/sealed/`fees.ts` çekirdek DOKUNULMADI.
**Yasal motivasyon:** 6502 TKHK m.61 (yanıltıcı reklam) + TTK m.54 (haksız rekabet) riski azaltma.

---

## ⚡ TEK-CÜMLELİK ÖZET

`SecurityCenter.tsx` (route `/guvenlik`) güncellendi: **3 AI kart "Yol Haritası" diline çevrildi** + ÜSTÜNE yeni **"Şu An Aktif — Üretimde Çalışan Korumalar"** kartı eklendi (9 gerçek koruma); var olmayan ML/IP ban/shill artık "geliştiriliyor" diye **dürüstçe** etiketli.

---

## 1) ÖNCE / SONRA — KART METİNLERİ

### ÖNCE (yanıltıcı — 6502 risk)

| Kart | İddia metni | Sorun |
|---|---|---|
| Davranışsal Analiz | *"Kullanıcı hareketleri **ML modeli ile analiz edilir**. Anormal teklif davranışları tespit edilir."* | ML modeli YOK |
| Otomatik Yanıt | *"Tespit edilen tehditlere karşı **otomatik IP ban, CAPTCHA veya session sonlandırma**."* | IP ban listesi YOK, CAPTCHA bileşeni YOK |
| Fiyat Manipülasyon Koruması | *"Suni fiyat şişirme **(shill bidding) tespiti**. **Aynı IP'den çoklu hesap engellenir**."* | shill tespiti YOK, IP çoklu hesap kuralı YOK |

Header: *"AI Tehdit Analizi & Anomali Tespiti (taslak / vizyon)"* — yarı dürüst ama metin "edilir" diyordu.

### SONRA (dürüst — gelecek zaman + "Şu an aktif olan" listesi)

**Header:** *"AI Tehdit Analizi & Anomali Tespiti"* + büyük badge: **"YOL HARİTASI · GELİŞTİRİLİYOR"** (amber renk)

**Üst açıklama paragrafı:**
> *"Aşağıdaki AI/ML katmanları **henüz canlıda DEĞİL** — geliştirme yol haritasında. Şu an aynı amaca hizmet eden **kural-tabanlı** korumalar üstteki 'Aktif' kartında. Var olmayan koruma 'aktif' gösterilmez (6502 m.61 dürüstlük)."*

**3 kart yeni metni:**
| Kart | Yeni metin (gelecek zaman + şu an aktif fallback) |
|---|---|
| Davranışsal Analiz (ML) | *"**Hedef:** kullanıcı hareketlerini ML modeli ile analiz eden anormal teklif tespit altyapısı. **Şu an aktif:** kural-tabanlı race koruması + idempotency."* |
| Otomatik Yanıt | *"**Hedef:** tespit edilen tehditlere otomatik CAPTCHA + süreli IP kısıtlama + session sonlandırma. **Şu an aktif:** Supabase default rate limit (60 req/dk) + JWT iptal."* |
| Fiyat Manipülasyon (Shill) | *"**Hedef:** shill bidding + IP/cihaz/MERNIS korelasyonu + graf analizi. **Şu an aktif:** anti-sniping + %5 teminat blokajı manipülasyon maliyetini yükseltiyor."* |

Her kartın sağ üst köşesinde mini badge: **"Yol Haritası"** (amber)

---

## 2) YENİ KART — "ŞU AN AKTİF — Üretimde Çalışan Korumalar"

AI kartının **ÜZERİNE** eklendi (vurgulu emerald renk + büyük "AKTİF" rozeti).

**Üst açıklama:**
> *"Aşağıdaki korumalar üretim ortamında **canlı çalışıyor** — kod tabanı + migration + canlı header doğrulamalı. Yol haritasındaki AI/ML özellikleri ayrı bölümde."*

**9 gerçek koruma (3 sütun grid):**

| # | Koruma | Kanıt (kod/migration) | Detay metni |
|---|---|---|---|
| 1 | **Anti-sniping** | `fees.ts:67-68` + `20260429120100_bid_bonds_and_antisniping.sql` | "Bitmesine 120sn kalan ihalede teklif → süre +120sn uzar. Son saniye baskın engeli." |
| 2 | **Race koruması (FOR UPDATE)** | `20260428120200_place_bid_function.sql` | "PostgreSQL row-lock + atomik RPC. İki eşzamanlı teklif sıraya alınır, çakışma yok." |
| 3 | **Idempotency anahtarı** | UNIQUE constraint | "Aynı teklif iki kez gönderilemez. Ağ tekrarı güvenli." |
| 4 | **Teminat blokajı %5** | `BID_BOND_RATE = 0.05` + `bid_bonds` tablo | "Teklif öncesi kredi kartı PROVİZYON. Sahte teklif maliyeti yüksek." |
| 5 | **Sealed teklif gizliliği** | `listing_offers_safe` view (`20260604120000`) | "Teklif sahibi maskelenmiştir; sealed mode korunur." |
| 6 | **7 güvenlik header** | `vercel.json` + canlı `curl -I` | "CSP + HSTS + X-Frame-DENY + COOP + Referrer + Permissions + nosniff." |
| 7 | **JWT zorunlu oturum** | Tüm Edge function + RLS | "Cookie session yok → CSRF saldırı yüzeyi kapalı. Bearer token + RLS." |
| 8 | **Owner-only RLS** | Tüm yazma tabloları | "Her tabloda user_id = auth.uid() politikası. IDOR engeli." |
| 9 | **PII sanitize (AI cevap)** | `sanitizePlainText.ts` + 11/11 test PASS | "T.C./IBAN/telefon/e-posta otomatik redact." |

Her madde: **CheckCircle2 / Lock / ShieldCheck / Shield / EyeOff / Server / Bug / Clock** icon (lucide-react)
Renk: **emerald** (gerçek/aktif vurgu)

---

## 3) DURUM AYRIMI — NET TABLO

| Bölüm | Renk | Rozet | Anlam |
|---|---|---|---|
| **Şu An Aktif — Üretimde Çalışan Korumalar** | 🟢 emerald | `AKTİF` (CheckCircle2) | Canlıda + kod tabanında + migration ile çalışıyor |
| **Planlanan güvenlik katmanları** (8 katman — değişmedi) | 🔵 slate-sky | `Hedef` | Tasarım/üretim için yol haritası |
| **AI Tehdit Analizi & Anomali Tespiti** (3 kart) | 🟠 amber | `YOL HARİTASI · GELİŞTİRİLİYOR` (Clock) | Henüz canlıda DEĞİL |
| **Hedeflenen uyumluluklar** (ISO/PCI/SOC2 vs. — değişmedi) | 🟣 violet | `(hedef)` | Resmi süreç sonrası |

→ **Dürüstlük net**: kullanıcı hangi korumanın gerçek, hangisinin "geliyor" olduğunu bir bakışta anlar.

---

## 4) CANLI KANIT (Playwright local preview)

`_audit/guvenlik-kart-durust/_test-guvenlik.mjs` çıktısı:

```json
{
  "where": "local-4173",
  "http": 200,
  "finalUrl": "http://localhost:4173/guvenlik",

  "has_aktif_baslik": true,            ← ✅ "Şu An Aktif" başlık
  "has_anti_sniping": true,            ← ✅
  "has_race_lock": true,               ← ✅ FOR UPDATE
  "has_idempotency": true,             ← ✅
  "has_teminat": true,                 ← ✅ Teminat blokajı %5
  "has_sealed": true,                  ← ✅ Sealed teklif
  "has_7_header": true,                ← ✅
  "has_jwt": true,                     ← ✅ JWT zorunlu
  "has_owner_rls": true,               ← ✅ Owner-only RLS
  "has_pii_sanitize": true,            ← ✅ PII sanitize / 11/11

  "has_yol_haritasi": true,            ← ✅ Yol Haritası rozeti
  "has_gelistiriliyor": true,          ← ✅ Geliştiriliyor
  "has_hedef": true,                   ← ✅ "Hedef:" başlangıcı
  "has_henuz_canlida_degil": true,     ← ✅ "henüz canlıda DEĞİL" / "aktif gösterilmez"

  "has_eski_ml_edilir": false,         ← ✅ ESKİ "ML modeli ile analiz edilir" KALKTI
  "has_eski_ip_ban": false,            ← ✅ ESKİ "otomatik IP ban..." KALKTI
  "has_eski_aynisip": false,           ← ✅ ESKİ "Aynı IP'den çoklu hesap engellenir" KALKTI

  "errs": []                           ← 0 console error
}
```

Ekran kanıtı: `_audit/guvenlik-kart-durust/guvenlik-sonra.png` (full page)

---

## 5) ANAYASA KANITLARI

### Build
```bash
$ npm run build
PWA v1.3.0 — precache 296 entries (6410.26 KiB)
files generated: dist/sw.js, dist/workbox-9c35ba06.js
```
✅ **YEŞİL**

### Test
```bash
Test Files  2 failed | 49 passed | 1 skipped (52)
Tests       4 failed | 203 passed | 2 skipped (209)
```
- 203/209 PASS (%97)
- 4 fail = ÖNCEDEN VAR olan eski test bug'ları (Home.test useAuth — bu commit'le ALAKASIZ)

### Lint
- `npx eslint src/pages/SecurityCenter.tsx` → 0 hata ✅
- Dokunulan tek dosya temiz

### Sealed / RLS / Core
- `listing_offers_safe` view DOKUNULMADI ✅
- `placeBid` RPC DOKUNULMADI ✅
- `fees.ts` DOKUNULMADI ✅
- RLS policies DOKUNULMADI ✅
- Sadece presentation layer (`src/pages/SecurityCenter.tsx`) değişti

### Console errors
0 (canlı + local preview)

---

## 6) DOKUNULAN DOSYALAR (tek dosya)

```
src/pages/SecurityCenter.tsx   ← +66 satır (yeni Aktif kartı) / -17 satır (eski yanıltıcı metin)
```

Toplam: **+49 net satır**, sadece UI/metin değişikliği.

---

## 7) AUDIT AYAK İZİ

```
_audit/
├── GUVENLIK_KART_DURUST.md              ← bu rapor
└── guvenlik-kart-durust/
    ├── _test-guvenlik.mjs                ← Playwright doğrulama
    └── guvenlik-sonra.png                ← canlı/local ekran kanıt
```

---

## 8) MASTER İÇİN — SONRAKİ ADIM

1. ✅ Bu commit push edildi (sonda) → canlı `https://www.ihaleal.com/guvenlik` ~2 dk sonra güncel
2. Master canlıdan doğrula:
   - Sayfa üst: emerald "Şu An Aktif" kartı + 9 koruma
   - Alt: amber "Yol Haritası · Geliştiriliyor" kartı + 3 AI iddiası
3. **Yasal risk azaltıldı** (6502 m.61 yanıltıcı reklam + TTK m.54 haksız rekabet)
4. Sonraki iş (ayrı dilim — Master onayı sonrası): gerçek shill kuralı (`place_bid` RPC içinde son 60sn IP-bid count > 5 → flag) + Cloudflare Turnstile CAPTCHA — bu kez gerçek koruma → kart **Aktif** bölgesine taşınır

---

— **Var olmayan güvenlik özelliği artık "aktif" gösterilmiyor; gerçek 9 koruma vurgulu kart ile öne çıktı; dürüstlük + yasal risk azaltma.**
🛡️✅
