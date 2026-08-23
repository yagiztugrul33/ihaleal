# ⚖️📱 Hukuki Altyapı + Mobil Uygulama — Final Rapor

> ## ⚠️ Master — DİKKAT
> **localhost'a DEĞİL, canlı `ihaleal.com`'a bak.** Hard refresh `Ctrl+Shift+R`.
> Tüm değişiklikler `origin/main`'e push edildi — Vercel auto-deploy.
>
> ### 🔴 KRİTİK SABAH AKSIYON
> 1. **Hukuki metin/şablon AVUKAT gözden geçirmeli** — bunların hepsi TASLAKtır (Avukatlık Kanunu 1136 m. 35).
> 2. **Mobil store için:**
>    - Apple Developer hesap **$99/yıl** + D-U-N-S no (4-6 hafta beklenir)
>    - Google Play Developer **$25 tek seferlik**
>    - Demo hesap: `review@ihaleal.com` / `Demo!2026`
>    - iyzico/PayTR (web ödeme) — hesap + API key gerek
>    - **IAP kararı:** Master + avukat (`docs/mobile/IAP_STRATEJISI.md` — Strateji A/B/C)

**Tarih:** 2026-06-01
**Tag zinciri:** `safe-before-hukuk-mobil` → `safe-before-mobil-b{1,2,3,4}` → `safe-after-hukuk-mobil` (bu commit)
**Final scan:** ✅ Desktop **143/143** + Mobile 320px **143/143** + Akış **8/8** + Console **0 hata**

---

## 📊 Bir Bakışta — Bu Komutta Yapılanlar

| Blok | Konu | Commit | Sonuç |
|------|------|--------|-------|
| A1e | Gizlilik mobil-uyum + App Privacy envanter | `a18f646` | ✅ |
| B1 | Capacitor compliance docs (iOS+Android) | `c7a1d4c` | ✅ |
| B2 | Mobil UX 12 rota × 3 viewport | `266953e` | ✅ 36/36 |
| B3 | IAP stratejisi + Apple auto-renewal | `6ee24fe` | ✅ |
| B4 | Final 143/143 + bu rapor | (bu commit) | ✅ |

**Not:** A1a-d ve A2/A3/A4 önceki oturumda zaten tamamlandı (commit `0fbfd62`, `5946a84`, `4d63de6`, `380ba8d`). Detay için `_audit/HUKUK_ALTYAPI_RAPORU.md`'ye bak.

---

## 🔹 A1e — Gizlilik Politikası Mobil-Uyum (commit `a18f646`)

**`src/pages/LegalPrivacy.tsx` tamamen yeniden** (117 → 320 satır):

### 9 madde tam yapı
1. **Gizlilik Taahhüdü** — AES-256 + TLS 1.3 + Reklam tanımlayıcı YOK
2. **VERİ ENVANTERİ** — Apple App Privacy + Google Play Data Safety tablosu (KRİTİK)
3. **Teknik Güvenlik** — 8 madde (TLS+AES+2FA+reCAPTCHA+pentest+72sa+RLS+sealed)
4. **Çerez** — 3 kategori (Zorunlu/Analitik anonim/Reklam YOK)
5. **Veri Silme** — KVKK 7 + web /uyelik + mobil Ayarlar→Hesap→Sil
6. **Çocuk verisi** — 18 yaş altı YOK (COPPA + KVKK + TMK 10)
7. **MOBİL UYGULAMA** — Konum/Bildirim/Kamera rıza ile + Apple ATT İSTEMEZ + Google AAID kullanılmaz
8. **Yurt dışı aktarım** — Supabase EU + Vercel + iyzico/PayTR + Apple/Google
9. **Politika değişikliği** — 30 gün önce bildirim

### Veri Envanteri Tablosu (App Store/Play Data Safety birebir aynı)

**Topladığımız (16 satır):**
- İletişim: E-posta + Telefon
- Kimlik: Ad-soyad + T.C. + Profil foto (isteğe bağlı)
- Finansal: IBAN + Ödeme + Findeks (talep üzerine)
- Konum: IP bazlı yaklaşık (cihazdan çıkmaz)
- Kullanım: İhale teklif + Favori + Sayfa analitik (anonim Vercel)
- Cihaz: IP + tarayıcı + Çerez + Push token

**TOPLAMADIĞIMIZ (3 satır — üstü çizili rose):**
- ❌ Hassas GPS konum
- ❌ Reklam tanımlayıcı (IDFA/AAID)
- ❌ Özel nitelikli veri (sağlık/biyometrik/ceza)

### LegalCitationStrip 8 referans
KVKK + GDPR + MASAK + VUK + 5651 + App Store Review 5.1 + Google Play Data Safety + Apple ATT

---

## 🔹 B1 — Capacitor Compliance Docs (commit `c7a1d4c`)

### YENİ DOKÜMAN 1: `docs/mobile/IOS_INFO_PLIST.md` (250 satır)
- 6 permission string (Location/Camera/Photo/Face ID) + Türkçe açıklama
- App Transport Security (HTTPS-only + OSM exception)
- URL Scheme deep link (`ihaleal://`)
- Background Modes (sadece `remote-notification`)
- `NSUserTrackingUsageDescription` EKLENMEYECEK — tracking yapmıyoruz
- Apple App Privacy Form eşleme tablosu (App Store ↔ /gizlilik)
- Master 8 yapılacak

### YENİ DOKÜMAN 2: `docs/mobile/IOS_PRIVACY_MANIFEST.md` (200 satır)
- `PrivacyInfo.xcprivacy` tam şablon (iOS 17.2+ ZORUNLU, 2024 Mayıs Apple kuralı)
- `NSPrivacyTracking: false` + boş tracking domains
- 8 `NSPrivacyCollectedDataType` (Email/Name/Phone/Payment/CoarseLoc/UserID/ProductInteraction/Crash)
  — hepsi `Linked=true`, `Tracking=false`
- 4 `NSPrivacyAccessedAPIType` reason kodu:
  - UserDefaults `CA92.1`
  - FileTimestamp `C617.1`
  - SystemBootTime `35F9.1`
  - DiskSpace `E174.1`
- 3. parti SDK manifest kontrolü (Capacitor 8.x)

### YENİ DOKÜMAN 3: `docs/mobile/ANDROID_COMPLIANCE.md` (200 satır)
- `build.gradle`: `compileSdk 34` + `minSdk 23` + `targetSdk 34` (2026 Play şartı)
- `AndroidManifest` permissions (Internet/Location/Camera/ReadMediaImages/PostNotifications/Biometric)
- `AD_ID` permission YOK (Google Advertising ID kullanılmıyor)
- `network_security_config`: `cleartextTrafficPermitted=false`
- Google Play Data Safety form tablosu (9 satır toplanan + 9 toplanmayan)
- İçerik derecelendirmesi 17+ (finansal işlem)
- `.aab` build (gradle bundleRelease)
- Keystore + D-U-N-S no (Apple için zorunlu, Google için opsiyonel)

### capacitor.config.ts
Compliance referans yorum eklendi (`docs/mobile/` dosyalarına yön).

`cap sync` sonuç: ✅ copy web 59ms + update web 55ms

**ÖNEMLİ:** Windows ortamında `ios/` ve `android/` native folder OLUŞTURULAMAZ.
- iOS: macOS + Xcode 15+ gerekli
- Android: Android Studio + JDK 17+
- Master macOS'ta `npx cap add ios` çalıştırdığında docs hazır

---

## 🔹 B2 — Mobil UX 12 Rota × 3 Viewport (commit `266953e`)

**Playwright iPhone UA + 3 viewport:**
- 320×568 iPhone SE
- 375×667 iPhone 8/SE2
- 430×932 iPhone 14/15 Pro Max

**12 rota tarandı:**
- `/fiyatlandirma`, `/uyelik` (premium)
- `/arastirma/{ges, war-room, hukuki-cozucu}` (4 katman + tablo)
- `/ihaleler` (Bloomberg terminal — yatay scroll riski)
- `/raporlar`, `/yasal` hub, `/yasal/sablonlar`, `/yasal/risk-uyarilari`
- `/gizlilik`, `/mesafeli-satis-sozlesmesi`

**Sonuçlar: 36/36 PASS**
- HTTP 200: 36/36 ✅
- 0 horizontal overflow: 36/36 ✅
- 0 chunk error: 36/36 ✅

**Tablo→kart kontrol:**
- Veri envanteri tablosu (`/gizlilik` 320px): `overflow-x-auto` scrollable ✅
- 4 bölge tabloları (WarRoom/KKA/GES/Değerleme): `min-w-[480px]` + overflow ✅
- Bloomberg ticker chips: dekoratif `h-6`, küçük target intentional

**Dokunma 44px:** GECE-BATCH BLOK A2 global CSS rule devam ediyor.

**36 screenshot kanıt:** `_audit/hukuk-mobil-b2/` — `{viewport}-{route}.png`

---

## 🔹 B3 — IAP Stratejisi + Apple 5.1.1 (commit `6ee24fe`)

### YENİ DOKÜMAN: `docs/mobile/IAP_STRATEJISI.md` (250 satır)

**3 STRATEJİ (Master karar bekliyor):**

| Strateji | Tanım | Komisyon | Risk |
|----------|-------|----------|------|
| **A: Hibrit** | Dijital IAP + Fiziksel web | %15-30 dijitalde, %0 fiziksel | Orta (Apple denetimi sıkı) |
| **B: Hep IAP** | Tüm dijital satış IAP | %26-30 her şeyde | Düşük (review garantili) |
| **C: Sadece web** | Mobil view-only, web ödeme | %0 ek | Orta (Apple "anti-steering" YASAĞI) |

### ihaleal Mapping
| Ne satıyoruz? | IAP gerekli? | Neden |
|---|---|---|
| Emlak komisyon (%2-3) | **HAYIR** | Fiziksel mülk hizmeti — Apple muaf |
| iBuyer nakit teklif | **HAYIR** | Fiziksel mülk alım |
| Kat karşılığı | **HAYIR** | Fiziksel inşaat hizmeti |
| Premium üyelik (₺399) | **EVET** | Dijital özellik |
| PDF rapor (₺249-499) | **EVET** | Dijital içerik |
| Doping/Vitrin | **TARTIŞMALI** | Reklam mı dijital özellik mi? |

### PaymentStartPage — Auto-Renewal Disclosure

Apple App Store Review 5.1.1 + Google Play uyumlu yeni panel eklendi:

**3 madde tek ekran (link YOK, inline TEXT):**
1. **Yenileme:** dönem sonu otomatik + 7 gün önce e-posta
2. **İptal:**
   - Web: Üyeliğim → "Aboneliği iptal et"
   - iOS: Ayarlar → Apple ID → Abonelikler
   - Android: Google Play → Profil → Abonelikler
3. **İade:** 14 gün TKHK m. 48

`data-testid="auto-renewal-disclosure"` — Apple review için işaretleyici.

---

## 🔹 B4 — Final Tarama (bu rapor)

### 📈 Sonuçlar

**PHASE 1 — Desktop Scan (1280×900):**
```
✅ PASS: 143 / 143 routes
❌ FAIL: 0
```

**PHASE 2 — Mobile Scan (iPhone SE 320px):**
```
✅ PASS: 143 / 143 routes
❌ FAIL: 0 horizontal overflow
```

**PHASE 3 — Hukuk + Ödeme Akış Smoke (8 sayfa):**
| Sayfa | Status | İçerik kontrol |
|-------|--------|----------------|
| `/ihaleler` (Bloomberg) | 200 | ✅ |
| `/yasal` | 200 | ✅ |
| `/arastirma/hukuki-cozucu` | 200 | ✅ |
| `/yasal/sablonlar` | 200 | ✅ |
| `/yasal/risk-uyarilari` | 200 | ✅ |
| `/gizlilik` (App Privacy) | 200 | ✅ |
| `/mesafeli-satis-sozlesmesi` | 200 | ✅ |
| `/odeme/baslat?paket=yatirimci` (auto-renewal) | 200 | ✅ |

**Console Error:**
```
Console-clean routes: 143/143
```

**Önceki tespit edilen "2 console error" tamamen TEMİZ.** ✅

---

## 🔒 Anayasa Kanıtı

- ✅ **Build green** her blok sonu
- ✅ **143/143 rota** desktop + mobile
- ✅ **8/8 hukuk+ödeme akış** sealed maskeleme + 4 katman + disclaimer + Apple uyumlu
- ✅ **143/143 console clean** (önceki 2 hata temiz)
- ✅ **Sealed maskeleme** `listing_offers_safe` dokunulmadı
- ✅ **Core RLS / auth / placeBidRpc** dokunulmadı
- ✅ **Migration yok** (frontend + docs)
- ✅ **Cursor lane** bozulmadı
- ✅ **CLS=0** korundu (tüm yeni paneller statik kart)

---

## 🌐 Master — Canlı Doğrulama (10 adım)

1. **Hard refresh:** `Ctrl+Shift+R`
2. **/gizlilik** — App Store/Play Data Safety formuyla birebir aynı veri envanteri tablosu; 18 satır (16 toplanan ✓ + 3 toplanmayan ✗ rose)
3. **/odeme/baslat?paket=yatirimci&periyot=monthly** — sağ panelde **"Otomatik Yenileme ve İptal"** sarı kart; iOS+Android+Web iptal talimatı
4. **/yasal** hub — 12 yasal metin + Mevzuat Haritası (6 kategori)
5. **/arastirma/hukuki-cozucu** — 10 senaryo, "Parayı Ebeveyn → Tapu Çocuk" seç → risk 70+
6. **/yasal/risk-uyarilari** — 5 detector + simülasyon paneli
7. **/yasal/sablonlar** — 7 şablon + önizle + .txt indir
8. **/mesafeli-satis-sozlesmesi** — 12 madde + 8 güvence rozeti
9. **/aydinlatma-metni** — 8 madde KVKK m. 5/8/9/11
10. **/fiyatlandirma** + **/uyelik** + **/magaza** + **/komisyon** — fiyat sistemi öncekiyle çalışıyor

**Mobil canlı:** `ihaleal.com` iPhone Safari'de aç — 320px overflow YOK, 4 katmanlar düzgün, Bloomberg terminali tablo scrollable.

---

## 🚨 Master Yapılacaklar — KRİTİK Aksiyon

### 🔴 1. AVUKAT ONAYI (hukuki yayın öncesi ŞART)
- 10 senaryo çözücü (vergi oranı + mevzuat madde no doğrulama)
- 7 şablon (taraf adı placeholder + cezai şart tutarları)
- Mesafeli Satış Sözleşmesi 12 madde
- Risk uyarıları checklist + mevzuat referansları
- Gizlilik Politikası 9 madde + Veri Envanteri

### 🔴 2. MOBİL STORE Hesaplar
- **Apple Developer:** $99/yıl + **D-U-N-S no** (4-6 hafta TR için)
  - https://www.dnb.com/duns-number/get-a-duns.html
- **Google Play Developer:** $25 tek seferlik
- **Demo hesap:** review@ihaleal.com / Demo!2026 (MASAK uyumlu sahte KYC)

### 🔴 3. ÖDEME ALTYAPISI (web — iyzico/PayTR)
- Önceden istendi (FIYAT_SISTEMI_RAPORU.md) — hala bekliyor
- Merchant Key + Secret Key + Webhook URL
- Webhook Edge function: `supabase/functions/payment-webhook/`

### 🔴 4. IAP KARARI (mobil — Apple/Google)
- `docs/mobile/IAP_STRATEJISI.md` 3 strateji açıklamalı
- Avukat + mali müşavir görüşü gerekli
- Önerimiz: Aşama 1 = Strateji C (sadece web), Aşama 2 = Strateji A (hibrit)

### 📌 5. macOS'ta Native Build (Windows'tan yapılamıyor)
- `npx cap add ios` — Xcode 15+ üzerinde
- `npx cap add android` — Android Studio gerekli
- `docs/mobile/IOS_INFO_PLIST.md` + `IOS_PRIVACY_MANIFEST.md` + `ANDROID_COMPLIANCE.md` hazır

### 📌 6. İLERİDE (BLOK 5 önceki rapordan)
- Anlaşmalı avukat ağı (Avukatlık Kanunu uyumu hassas)
- Gerçek belge doğrulama API (NVI + TKGM + Noter Birliği)
- `RiskWarningPanel` `CreateAuction.tsx` içine entegre
- `scenario_templates` Supabase migration (Master onayı)
- PDF üretim (jspdf Roboto TR — altyapı var)

---

## 🏷️ Tag Zinciri

```
safe-after-hukuk-altyapi (önceki final)
   ↓
safe-before-hukuk-mobil (start)
   ↓
safe-before-mobil-b1  (A1e sonrası)
safe-before-mobil-b2  (B1 sonrası)
safe-before-mobil-b3  (B2 sonrası)
safe-before-mobil-b4  (B3 sonrası)
   ↓
safe-after-hukuk-mobil (bu commit)
```

**Rollback:** `git reset --hard safe-before-hukuk-mobil` veya ara tag'lerden biri.

---

## 📂 Audit + Docs Ayak İzi

```
_audit/
├── HUKUK_MOBIL_RAPORU.md         ← bu dosya
├── HUKUK_ALTYAPI_RAPORU.md       (önceki — A1a-d + A2/A3/A4)
├── FIYAT_SISTEMI_RAPORU.md
├── hukuk-mobil-a1e/              gizlilik desktop + mobile
├── hukuk-mobil-b2/               36 mobil screenshot (12 rota × 3 viewport)
├── hukuk-mobil-b3/               ödeme auto-renewal aylık+yıllık+mobile
└── hukuk-mobil-b4/               final 143 desktop+mobile+8 akış JSON

docs/mobile/                       ← YENİ
├── IOS_INFO_PLIST.md             permission açıklama + ATT yok
├── IOS_PRIVACY_MANIFEST.md       PrivacyInfo.xcprivacy şablon
├── ANDROID_COMPLIANCE.md         target 34 + Manifest + Data Safety
└── IAP_STRATEJISI.md             Apple/Google IAP 3 strateji
```

---

## 📊 Toplam Üretim (Bu Komut)

- **5 atomik commit** push edildi (Vercel canlı):
  - `a18f646` A1e: Gizlilik mobil-uyum
  - `c7a1d4c` B1: Capacitor docs
  - `266953e` B2: Mobil 36/36
  - `6ee24fe` B3: IAP + auto-renewal
  - bu commit: B4 final + rapor

- **1 sayfa derinleştirme** (LegalPrivacy 117→320 satır)
- **1 sayfa modify** (PaymentStartPage + auto-renewal disclosure)
- **1 config modify** (capacitor.config.ts compliance yorum)
- **4 yeni docs** (docs/mobile/ — Info.plist + Privacy Manifest + Android + IAP)
- **0 yeni route** (mevcut rotaları zenginleştirdi)
- **0 yeni component** (LegalDisclaimer bileşeni yeterliydi)

---

— Hukuki altyapı (A1e ek) + Mobil compliance (B1-B4) bitti.
**Final scan:** 143/143 desktop + 143/143 mobile + 8/8 akış + **0 console hata**.

**Master:** ⚠️ Avukat + Apple Developer + Google Play hesapları olmadan canlı yayına alma.
☕📱⚖️
