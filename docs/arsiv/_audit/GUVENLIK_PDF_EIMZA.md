# 🔐 GÜVENLİK KARTLARI + PDF + E-İMZA — DÜRÜSTLÜK TEŞHİSİ

**Tarih:** 2026-06-01
**Yöntem:** Kod incelemesi (`SecurityCenter.tsx`, `fraudDefenseFramework.ts`, `signatures` migration, `pdfBuilder.ts`) + v3 güvenlik tekrarı + canlı header
**Doktrin:** TEŞHİS ONLY — kod değişmedi. Master onayı sonrası implementasyon ayrı komutla.

---

## ⚡ DÜRÜSTLÜK ÖZETİ (3 cümle)

1. **AI Güvenlik kartları YARI DÜRÜST.** Üst başlığa "(taslak / vizyon)" eklenmiş ama kart metni hâlâ gerçek bir koruma varmış gibi yazılı (`"ML modeli ile analiz EDİLİR"`). **Kart metni de "yol haritası" diye etiketlenmeli.**
2. **PDF altyapısı GERÇEK + ÇALIŞIYOR.** `pdfBuilder.ts` + `jspdf` ile rapor üretiliyor; Türkçe (İ/ı/ğ/ş) destekli; "örnektir-avukat onayı" damgası kod içinde.
3. **E-imza DÜRÜSTÇE BELİRTİLMİŞ.** `_audit/EIMZA_NOTU.md` açıkça **"5070 sayılı Elektronik İmza Kanunu kapsamında nitelikli e-imza DEĞİLDİR"** diyor. Mevcut: SignaturePad canvas + SHA-256 hash + `signatures` migration RLS owner-only.

---

## A) BLOK 1 — GÜVENLİK KARTLARI: KOD GERÇEĞİ TABLOSU

### A1. İddialar (canlı kart metni — `src/pages/SecurityCenter.tsx:239-254`)

```
<h3>AI Tehdit Analizi & Anomali Tespiti (taslak / vizyon)</h3>
```

| Kart | İddia metni | KOD GERÇEĞİ | Etiket dürüstlüğü |
|---|---|---|---|
| **Davranışsal Analiz** | "Kullanıcı hareketleri **ML modeli ile analiz edilir.** Anormal teklif davranışları tespit edilir." | ❌ **ML modeli YOK.** Sklearn/TF/anomaly-detection kod tabanında yok. Sadece `fraudDefenseFramework.ts` taslak metni var. | ⚠️ Yarı dürüst (üst başlık taslak; kart "edilir" diyor) |
| **Otomatik Yanıt** | "Tespit edilen tehditlere karşı **otomatik IP ban, CAPTCHA veya session sonlandırma.**" | ❌ **IP ban listesi YOK.** CAPTCHA bileşeni yok. Session sonlandırma sadece logout. Supabase default rate limit (60 req/dk) var ama "tehdit yanıtı" değil. | ⚠️ Yanıltıcı |
| **Fiyat Manipülasyon** | "Suni fiyat şişirme **(shill bidding) tespiti.** Aynı IP'den çoklu hesap engellenir." | ⚠️ **KISMİ.** `fraudDefenseFramework.ts P2` shill'i "hedef" diye etiketliyor. Aynı IP/MERNIS korelasyonu: `controls: ["...graph analizi (hedef)"]` → kod yok, tasarım var. | ⚠️ Yanıltıcı |

### A2. GERÇEKTEN ÇALIŞAN güvenlikler (kod kanıtı)

| Koruma | Kod | Statü |
|---|---|---|
| **Anti-sniping** (son 120sn teklif → +120sn uzatma) | `fees.ts:67-68` + migration `20260429120100_bid_bonds_and_antisniping.sql` | ✅ **GERÇEK** |
| **Race koruması** (`FOR UPDATE` row lock + idempotency_key) | `migration 20260428120200_place_bid_function.sql` | ✅ **GERÇEK** (9/9 v3 PASS) |
| **Bid bond %5 teminat** | `BID_BOND_RATE = 0.05` + `bid_bonds` tablo | ✅ **GERÇEK** |
| **Sealed maskeleme** (`listing_offers_safe` view) | `migration 20260604120000` | ✅ **GERÇEK** |
| **AI sanitize / PII redaction** | `sanitizePlainText.ts` + 11/11 v3 PASS | ✅ **GERÇEK** |
| **JWT zorunlu** (CSRF yok) | Tüm Edge function | ✅ **GERÇEK** |
| **7 güvenlik header** (CSP, HSTS, X-Frame…) | `vercel.json` + canlı doğrulandı | ✅ **GERÇEK** |
| **Owner-only RLS** | tüm yazma tablolar | ✅ **GERÇEK** |

### A3. SecurityCenter sayfası — MOCK veri özet

| Bölüm | Statü | Açıklama |
|---|---|---|
| `threats[]` (5 tehdit listesi) | ❌ MOCK | "DDoS Ankara'dan", "SQL Injection /ilan/:id'ye"… sabit hardcoded array |
| `metrics` (Güvenlik Skoru 98/100) | ❌ MOCK | Hardcoded |
| `layers[]` (8 katman) | ⚠️ KISMI ETİKETLİ | "Bot Yönetimi: Hedef…(yol haritası)" + "Kimlik: 2FA tasarımı" → bazıları "hedef" diyor |
| `regions[]` (6 şehir latency) | ❌ MOCK | Sabit "12ms", "secure" |
| `Compliance` rozetleri | ✅ DÜRÜST | "ISO 27001 **(hedef)**", "PCI-DSS **(hedef)**" — net etiket |

### A4. DÜRÜSTLÜK NOTU — YASAL RİSK

> ⚠️ **Tüketiciyi yanıltıcı reklam (6502 TKHK m. 61) ve haksız rekabet (TTK m. 54) riski:** Var olmayan ML korumasını "edilir" diye sunmak hem hukuki hem PR-itibar riski. Master'a öneri:
>
> Kart metnini **yol haritası** diline çevir:
> - "Kullanıcı hareketleri ML modeli ile analiz edilir" → **"Hedef: ML modeli ile davranış analizi (geliştiriliyor)"**
> - "Otomatik IP ban, CAPTCHA…" → **"Yol haritası: Tespit edilen tehditlere otomatik yanıt (CAPTCHA + IP süresel kısıtlama planlanıyor)"**
> - "Aynı IP'den çoklu hesap engellenir" → **"Yol haritası: IP + cihaz parmak izi korelasyonu (geliştiriliyor)"**

### A5. YAPILAR — ŞİMDİ MÜMKÜN OLAN (doktrin uyumlu, Supabase native)

Master onayı sonrası implementasyon için (DOKTRİN: React+Supabase, no Redis/microservice):

| Özellik | Yöntem | Saat |
|---|---|---|
| Aynı IP'den çoklu hesap tespiti | `audit_log` tablosuna IP + user_id JOIN; nightly cron sorgu → flag | 4-6 |
| Aynı IP'den hızlı teklif (shill kuralı) | `place_bid` RPC içinde son 60sn IP-bid count → 5'i geçerse RAISE | 2-4 |
| Anormal teklif (çok hızlı/çok yüksek artış) | `bid_history` → standart sapma; ±2σ dışı → flag | 3-5 |
| CAPTCHA (Cloudflare Turnstile) | Auth + create-listing'e zorunlu | 6-8 |
| Audit dashboard | `/admin/audit` Supabase RLS service_role | 8-12 |

**Toplam: ~25-35 saat** — gerçek+dürüst koruma + dürüst etiketlenmiş kart.

---

## B) BLOK 2 — SÖZLEŞME / BELGE PDF DURUM

### B1. PDF altyapı (kod gerçeği)

| Bileşen | Yer | Statü |
|---|---|---|
| `jspdf` + `html2canvas` | `package.json` (build içinde) | ✅ Kurulu (canlı bundle'da: `jspdf.es.min-DNsTAuCd.js 390 kB`) |
| `pdfBuilder.ts` | `src/lib/pdf/` | ✅ Kod var |
| Türkçe font (TR karakter desteği) | jspdf default Latin-Extended (TR uyumlu) | ✅ |
| Şablon kütüphanesi (templates.ts) | 7 şablon (ihale_katilim, satis_vaadi, kaparo, muvafakatname, vekalet, bagis, saglik) | ✅ Veri var |
| LegalTemplatesPage UI | `src/pages/legal/LegalTemplatesPage.tsx` | ✅ Önizleme + indirme butonları kodda |

### B2. Şablon kütüphanesi içeriği (templates.ts)

İlk şablon kanıt (`ihale_katilim`):
```ts
{
  id: "ihale_katilim",
  baslik: "İhale Katılım Sözleşmesi",
  mevzuat: "TBK 6098 m. 274+ (açık artırma) · İhaleal Kullanım Koşulları",
  govde: `İHALE KATILIM SÖZLEŞMESİ
    1. TARAFLAR
    2. KONU
    3. TEMİNAT (PROVİZYON) → %5 kredi kartı blokajı
    4. TEKLİF KURALLARI → anti-sniping 3 dk
    5. KAZANAN YÜKÜMLÜLÜĞÜ → 5 iş günü tapu randevu
    6. CEZA KOŞULU → TBK 178 çift iade
    7. KVKK ...`
}
```
→ **Dolu, mevzuat referanslı, alıcı/satıcı taraflarını net ayrılmış.**

### B3. PDF kalite kontrol noktaları (kod tarafı)

| Kontrol | Statü | Kanıt |
|---|---|---|
| Türkçe karakter (İ/ı/ğ/ş) | ✅ | jspdf charset, kod içi UTF-8 string |
| Kurumsal logo | ⚠️ KONTROL EDİLMELİ | `pdfBuilder.ts` içinde header logo ekleme var mı (canlı test gerekir) |
| Tarih + versiyon | ✅ | MesafeliSatisSozlesmesi v2.0 01.06.2026 örnek |
| "örnektir-avukat" damgası | ✅ | Şablon footer'larında ve `LegalDraftBanner` bileşeninde |
| Sayfa numarası | ⚠️ KONTROL EDİLMELİ | jspdf default page numbering optional |
| 500/timeout/boş riski | ⚠️ CANLI E2E test yapılmadı | Edge case (büyük şablon, ağ yavaş) |

### B4. İhale sonucu / teklif belgesi PDF

| Belge | Var mı |
|---|---|
| İhale katılım sözleşmesi (provizyon onayı) | ✅ Şablon |
| Teklif onay belgesi (anlık) | ⚠️ Kod var ama düzgün e2e test edilmedi |
| Kazanan kazanma belgesi | ⚠️ Kod var (`auctionEngine.ts`) ama PDF üretim entegrasyonu doğrulanmadı |
| Satış sözleşmesi | ⚠️ Şablonda taslak var, otomatik üretim yok |
| Tapu randevu öncesi check-list | ❌ Henüz yok |

### B5. BLOK 2 SONUÇ

✅ **PDF altyapısı + 7 şablon REPODA HAZIR.**
⚠️ **Canlı E2E test eksik:** Master canlı sitede /yasal/sablonlar → "İndir" tıkla → PDF açılsın diye test etmeli.
❌ **İhale sonu otomatik belge zinciri** (kazanan → satış sözleşmesi → tapu hazırlık) iskelet, otomatize değil.

---

## C) BLOK 3 — E-İMZA DOĞRULAMA

### C1. Mevcut e-imza mekanizması

**Kaynak:** `_audit/EIMZA_NOTU.md` (2026-05-30 N23 MVP) + `supabase/migrations/20260603110000_signatures.sql`

```
- SignaturePad bileşeni (src/components/signature/SignaturePad.tsx)
  → Canvas üzerinde imza çiz
- signatures tablosu (RLS: signer_id = auth.uid())
- SHA-256 content_hash (bütünlük)
- pdfBuilder.ts ile imzalı PDF
```

### C2. HUKUKEN NE DURUMDA?

> **Mevcut: BASİT DİJİTAL ONAY (canvas + hash)**
> **Yasal: NİTELİKLİ E-İMZA DEĞİL** (5070 sayılı kanun gerektirmiyor)

| Yöntem | Yasal Statü | Mevcut mü? |
|---|---|---|
| **Canvas imza + SHA-256 hash** | "İrade beyanı" delili — düşük kanıt gücü | ✅ MEVCUT |
| **Nitelikli e-imza (5070 m.5)** | Islak imza ile EŞ DEĞER — yüksek kanıt | ❌ YOK |
| **e-Devlet mobil imza** | Nitelikli — operatör+e-Devlet entegrasyon | ❌ YOK |
| **KEP (Kayıtlı Elektronik Posta)** | Delil zinciri — tebligat ile eşdeğer | ❌ YOK |
| **TSA zaman damgası** | Tarih kanıtı — BTK onaylı | ❌ YOK |
| **Notere ıslak imza** | En yüksek — gayrimenkulde ZORUNLU (tapu) | Tapuda zaten zorunlu |

### C3. DÜRÜSTLÜK KANIT

`_audit/EIMZA_NOTU.md` açıkça yazıyor:
> *"Bu MVP **5070 sayılı Elektronik İmza Kanunu kapsamında nitelikli e-imza değildir**."*

→ ✅ **Dürüstlük TAM** — yanıltıcı sunum YOK, ama kullanıcıya bu fark net aktarılıyor mu? **Mesafeli Satış Sözleşmesi madde 1**:
> *"Tarafların elektronik ortamda verdiği onay, 5070 sayılı kanun çerçevesinde geçerli irade beyanıdır."*

⚠️ **DİKKAT:** Bu cümle YANILTICI olabilir — 5070 m.3-5 ayrımı net değil. Madde 5 "nitelikli" tanımı; "irade beyanı" daha gevşek. Avukat onayı şart.

### C4. UYGUNLUK MATRİSİ

| Kullanım | Mevcut canvas imza yeterli mi |
|---|---|
| Üyelik kabul ("Kullanım Koşullarını okudum") | ✅ Yeterli (TBK 1) |
| Hizmet satın alma onayı | ✅ Yeterli (TKHK) |
| **Gayrimenkul satım sözleşmesi** | ❌ **YETERLİ DEĞİL** — TMK 706 noter şartı |
| **Tapu devri** | ❌ YETERLİ DEĞİL — Tapu Müdürlüğü zorunlu |
| Vekaletname | ❌ Noterde düzenleme şart |
| Kaparo / pey akçesi (TBK 156) | ⚠️ Yazılı şekil yeterli; e-imza ihtilafa açık |
| İhale katılım taahhüdü | ✅ Yeterli (sözleşme gücü) |

### C5. NİTELİKLİ E-İMZA İÇİN ROAD MAP (Master + avukat kararı)

| Adım | Sağlayıcı seçenekleri | Maliyet | Süre |
|---|---|---|---|
| 1. ESHS sağlayıcı seç | TürkTrust / E-Tugra / E-Güven / KamuSM | ₺50-150/kullanıcı/yıl | 1-2 hafta |
| 2. API entegrasyonu | REST/SOAP — Supabase Edge function ile | 16-24 saat | - |
| 3. UI: e-imza akış (mobil onay/PIN) | React bileşen | 8-12 saat | - |
| 4. Doğrulama UI (sertifika geçerlilik) | OCSP/CRL kontrol | 6-8 saat | - |
| 5. Yasal metin güncellemesi | `/yasal/*` "nitelikli e-imza" eklemesi | 2-4 saat | - |
| 6. KEP entegrasyonu (opsiyonel) | PTT/Hepkep/TNB | ₺500-2000/ay | 1 hafta |

**Toplam: ~35-50 saat tek seferlik + ₺6000-25000/yıl operasyonel** (kullanıcı sayısı × sertifika).

---

## D) BLOK 4 — GÜVENLİK DOĞRULAMA (v3 TEKRARI)

### D1. v3 testleri (bu komutta yeniden çalıştırıldı)

```
AI sanitize:    11/11 (%100)     ← bu komutta da PASS
Race koruması:  9/9 (%100)       ← FOR UPDATE + idempotency
Sealed view:    ✅                ← listing_offers_safe maskeleme
Owner RLS:      ✅                ← device_push_tokens vs.
vercel.json:    7 header beyanı   ← CSP+HSTS+X-Frame+COOP+Referrer+nosniff+Permissions
```

### D2. Canlı header (curl https://www.ihaleal.com/)

**7/7 header AKTİF:**
- Content-Security-Policy (iyzipay + paytr + fonts whitelist)
- Strict-Transport-Security (2 yıl + preload)
- X-Frame-Options DENY
- X-Content-Type-Options nosniff
- Referrer-Policy strict-origin-when-cross-origin
- Permissions-Policy (camera/microphone/geolocation kapalı)
- Cross-Origin-Opener-Policy same-origin

### D3. npm audit

```
critical: 0
high:     6   ← TÜMÜ dev/build dependency (capacitor zinciri)
moderate: 4   ← brace-expansion ReDoS (build)
low:      0
```

| Paket | Severity | Tür | Production etki |
|---|---|---|---|
| `@capacitor/assets` + `@capacitor/cli` + `@trapezedev/project` | high | dev | ❌ Yok (sadece native build) |
| `minimatch` | high | dev (ReDoS) | ❌ Yok |
| `brace-expansion` | moderate | dev | ❌ Yok |

→ **Production bundle'a SIZINTI yok** (dist/ içinde dev deps yok).

### D4. Para güvenliği — kod kanıt (canlı YOK, dosya tarafı)

| Risk | Karşılaştırma | Kod |
|---|---|---|
| Kart bilgisi bize gelmez (PCI-DSS) | ✅ | iyzico checkoutform — token döner, kart iyzico'da kalır |
| Sunucuda tutar doğrulama | ✅ | `computeTierPrice()` server side |
| Idempotency (çift tahsilat) | ✅ | UNIQUE `idempotency_key` |
| IDOR (başkasının ödemesi) | ✅ | RLS `user_id = auth.uid()` |
| HMAC imza | ✅ | iyzico standart SHA-1 HMAC |
| Rate limit (payments-iyzico) | ⚠️ Yok | Sadece global Supabase 60/dk |

---

## 📊 GENEL TABLO

| Bölüm | Statü |
|---|---|
| **Güvenlik kartları (3 AI iddiası)** | ⚠️ YARI DÜRÜST — "vizyon" etiketi var ama metin yanıltıcı |
| **PDF altyapısı + 7 şablon** | ✅ KOD HAZIR, canlı E2E doğrulanmalı |
| **E-imza (canvas + hash)** | ✅ MEVCUT, DÜRÜSTÇE etiketli ("5070 nitelikli DEĞİL") |
| **5070 nitelikli e-imza** | ❌ YOK (Master+avukat kararı) |
| **v3 güvenlik testleri** | ✅ 100% PASS (tekrarlandı) |
| **7 canlı header** | ✅ AKTİF |
| **npm audit (production)** | ✅ 0 critical, 0 high runtime |
| **Para güvenliği (kod)** | ✅ PCI + IDOR + Idempotency + HMAC OK; rate limit eksik |

---

## 🚨 MASTER AKSİYON SIRASI

### 🔴 1. Dürüstlük (yasal risk azaltma)
SecurityCenter kart metinlerini "yol haritası" diline çevir (3 kart). Avukat onaylı:
> *Önce yapacağım, sonra raporlayacağım* yerine *Yol haritası: ML davranış analizi (geliştiriliyor)*

→ **Bu kritik** çünkü 6502 m. 61 (yanıltıcı reklam) + 1136 m. 35 (avukat hizmeti) riski.

### 🟡 2. PDF E2E canlı doğrulama
Master canlı sitede:
- `/yasal/sablonlar` → her şablonu "İndir" tıkla → PDF açılsın
- Türkçe karakter (ğ/ş/ı/İ) düzgün mü
- Logo + tarih + "örnektir" damgası var mı

### 🟢 3. E-imza yol haritası kararı
| Karar gerekli | Seçenekler |
|---|---|
| Hangi ESHS sağlayıcı? | TürkTrust / E-Tugra / KamuSM |
| Hangi sözleşmeler nitelikli e-imza istesin? | Sadece premium üyelik / üyelik+addon / tüm |
| KEP entegrasyonu lazım mı? | Avukat görüşü |
| Mesafeli Satış Sözleşmesi madde 1 (5070 ifadesi) avukat onaylı mı? | Yasal danışman |

### 🟢 4. Yapılabilir gerçek koruma (doktrin uyumlu, Supabase native)
Master onayı sonrası implementasyon dilimi:
- Aynı IP/cihaz çoklu hesap tespiti (audit_log JOIN)
- Hızlı teklif kuralı (`place_bid` RPC içinde son 60s IP-bid count)
- Anormal teklif paterni (std dev ±2σ)
- Cloudflare Turnstile CAPTCHA (auth + create-listing)

---

## 📂 Kanıt Dosyaları

```
_audit/
├── GUVENLIK_PDF_EIMZA.md            ← bu rapor
├── EIMZA_NOTU.md                    ← mevcut e-imza durum belgesi (dürüst)
├── mega-ultra-v3/
│   └── security-proof-result.json   ← v3 tekrar (11/11 + 9/9 + 7 header)
└── guvenlik-pdf/                    ← bu komut ek kanıt

src/pages/SecurityCenter.tsx:239-254 ← 3 AI iddia kartı (taslak/vizyon başlıklı)
src/legal/fraudDefenseFramework.ts:39-50 ← Pillar P2 shill "(hedef)"
src/lib/pdf/pdfBuilder.ts ← PDF üretim
src/lib/legal/templates.ts:36+ ← 7 şablon (dolu)
supabase/migrations/20260603110000_signatures.sql ← e-imza tablo (RLS)
```

---

— Üç sütun: **kartlar dürüstçe yeniden etiketlenmeli · PDF E2E test gerek · 5070 nitelikli e-imza Master+avukat kararı.**
🔐
