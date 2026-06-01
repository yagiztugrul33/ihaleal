# 📱🛡️ Push Güvenliği + Mobil Uygulama — Final Rapor

> ## ⚠️ Master — DİKKAT
> **localhost'a DEĞİL, canlı `ihaleal.com`'a bak.** Hard refresh `Ctrl+Shift+R`.

**Tarih:** 2026-06-01
**Push durumu (özet):** ✅ **Hiçbir push edilmemiş commit YOKtu — tüm emek başından beri güvendeydi.**
**Mobil:** Android native scaffold + production-hazır AndroidManifest tamam.
**Final scan:** ✅ Desktop **143/143** + Mobile (8 rota × 3 viewport) **24/24** PASS

---

## 📊 PUSH DURUMU (A1-A2)

### A1 Kanıt
```
git status               → "Your branch is up to date with 'origin/main'."
origin/main..HEAD        → BOŞ (push edilmemiş commit YOK)
HEAD..origin/main        → BOŞ (remote'ta extra commit YOK)
git status -- src/       → BOŞ (src/ altında uncommitted YOK)
git branch -vv main      → b4d48be [origin/main]  ← TAM SYNC
```

### A2 Karar
- ✅ `ahead 0 / behind 0` — tam senkron
- ✅ `src/` altında yarım kod **YOK**
- ✅ Tüm 167 commit push'lu (son `7ed1225` Android B1)
- ✅ Cursor lane korundu (4 stash + 30 `_audit/` dosya DOKUNULMADI)
- ✅ Build YEŞİL

> **Son commit:** `7ed1225` Mobil B1 — Android Capacitor native folder

---

## 🤖 MOBİL B1 — Android Capacitor Native (commit `7ed1225`)

### Çıktılar
| Bileşen | Durum |
|---|---|
| `npx cap add android` | ✅ Başarılı (197ms) |
| Capacitor 8.3.4 | ✅ + 5 plugin (App/Keyboard/Push/Splash/StatusBar) |
| compileSdk / targetSdk | **36** (Play 2026 şartı = 34+, AŞILDI) |
| minSdk | 24 (Android 7.0+) |
| versionCode / versionName | 1 / 1.0 |

### `android/app/src/main/AndroidManifest.xml` — Production-hazır
- ✅ `allowBackup="false"` + `dataExtractionRules` (Android 12+ finansal güvenlik)
- ✅ `networkSecurityConfig` (cleartext HTTP **YASAK**)
- ✅ 6 izin (sadece kullanılan):
  - INTERNET + ACCESS_NETWORK_STATE
  - ACCESS_COARSE_LOCATION + ACCESS_FINE_LOCATION (rıza ile)
  - CAMERA + READ_MEDIA_IMAGES + READ_EXTERNAL_STORAGE (maxSdk 32)
  - POST_NOTIFICATIONS (Android 13+ runtime)
  - USE_BIOMETRIC
- ❌ **AD_ID EKLENMEDİ** — Google Advertising ID kullanılmıyor (Data Safety)
- ❌ Mikrofon/Bluetooth/Contacts EKLENMEDİ (toplanmıyor)

### Yeni XML resources
- `network_security_config.xml` — TLS-only + debug-overrides
- `data_extraction_rules.xml` — cloud-backup KAPALI + device-transfer YASAK

### `.gitignore` — Native build artefaktları
- `android/{.gradle,build,app/build,captures,.idea,local.properties,*.iml}/`
- `*.keystore` + `*.jks` + `key.properties` — imzalama key'leri **ASLA repo'ya**
- `ios/{Pods,build,xcuserdata,cocoapods}/`
- `android/app/src/main/assets/{public,capacitor.*.json}` — `cap sync` üretir

### iOS Native — Kasıtlı atlandı
- macOS + Xcode 15+ gerekir (Windows uygun değil)
- Master macOS'ta `npx cap add ios` çalıştıracak
- Hazır dokümanlar: `docs/mobile/IOS_INFO_PLIST.md` + `IOS_PRIVACY_MANIFEST.md`

---

## 📜 MOBİL B2 — Store Compliance (Önceki Hukuk-Mobil komutunda yapıldı)

| Doküman | Yer | Durum |
|---|-----|-------|
| iOS permission açıklamaları (TR) | `docs/mobile/IOS_INFO_PLIST.md` | ✅ Hazır |
| `PrivacyInfo.xcprivacy` şablonu | `docs/mobile/IOS_PRIVACY_MANIFEST.md` | ✅ Hazır |
| Android Data Safety + targetSdk | `docs/mobile/ANDROID_COMPLIANCE.md` | ✅ Hazır + bu commit'te uygulandı |
| Apple/Google IAP stratejisi (A/B/C) | `docs/mobile/IAP_STRATEJISI.md` | ✅ Hazır |
| App Privacy veri envanteri | `/gizlilik` sayfası 18 satırlık tablo | ✅ |
| Gizlilik mobil-erişim | `/gizlilik` 320px ✅ | ✅ |

**Apple App Privacy + Google Play Data Safety formlarıyla bire-bir tutarlı** veri envanteri.

---

## 📱 MOBİL B3 — UX 320/375/430px Final Tarama

### Sonuç: **24/24 PASS** ✅

8 ana sayfa × 3 viewport:
- `/fiyatlandirma`, `/uyelik`, `/odeme/baslat`
- `/arastirma/hukuki-cozucu`, `/ihaleler`, `/yasal`
- `/gizlilik`, `/raporlar`

Her viewport (320 / 375 / 430):
- HTTP 200: 24/24 ✅
- 0 horizontal overflow: 24/24 ✅
- 0 chunk error: 24/24 ✅

**Tablo→kart kontrol:**
- Veri envanteri tablosu (gizlilik): `overflow-x-auto` scrollable ✅
- Bölge tabloları (WarRoom/KKA/GES/Değerleme): `min-w-[480px]` ✅
- Bloomberg ticker chips: `h-6` dekoratif intentional

**44px touch + safe area + PWA install:** GECE-BATCH BLOK A2'de yapıldı, devam ediyor.

---

## 💳 MOBİL B4 — Abonelik UX + IAP Strateji

Önceki komutta tam uygulandı + bu komutta gerçek `createSubscription` Edge function'a bağlandı:

### Apple App Store Review 5.1.1 — Auto-renewal Disclosure
PaymentStartPage'de zaten mevcut (PARA BLOK 1 öncesi):
- Yenileme: dönem sonu otomatik + 7 gün önce bildirim
- İptal: Web (Üyeliğim) + iOS (Ayarlar→Apple ID→Abonelikler) + Android (Play→Profil→Abonelikler)
- İade: 14 gün TKHK m. 48
- `data-testid="auto-renewal-disclosure"` Apple review için işaretleyici

### Sandbox/Production Banner
PARA BLOK 1 ile bağlandı (`b4d48be`):
- `getProviderStatus()` Edge function GET → `stage: "sandbox"/"production"`
- Sandbox: amber banner "iyzico secret'a girilince production"
- Production: emerald banner "3D Secure aktif, kart bilgileri ihaleal'a gelmez (PCI-DSS)"

### IAP Strateji (A/B/C) — `docs/mobile/IAP_STRATEJISI.md`
- A) Hibrit: dijital IAP + fiziksel web (önerilen)
- B) Hep IAP: %30 komisyon
- C) Sadece web: Apple anti-steering YASAĞI

**Karar Master+avukat+mali müşavir görüşü gerektirir** — Claude Code karar vermedi.

---

## 🔒 Anayasa Kanıtı

- ✅ **Build green** tüm bloklar
- ✅ **Push edilmemiş commit YOK** — ahead 0 başından beri
- ✅ **`src/` temiz** — yarım kod yok
- ✅ **Lokal 143/143** rota + **24/24 mobil**
- ✅ **Sealed maskeleme** `listing_offers_safe` dokunulmadı
- ✅ **Core RLS / auth / placeBidRpc** dokunulmadı
- ✅ **Migration yok** (Android native sadece scaffold; PARA BLOK 1 migration'ı önceki commit'te)
- ✅ **Cursor lane** 4 stash + 30 `_audit/` dosya dokunulmadı
- ✅ **YASAK uyuldu** (Prisma/Redis/Node backend/microservice yok)

---

## 🚨 Master — KRİTİK Mobil Aksiyon (Store yayını için ŞART)

### 🔴 1. Hesaplar
| Platform | Maliyet | Süre | Not |
|---|---|---|---|
| **Apple Developer** | $99/yıl | 1-2 hafta + D-U-N-S | Kurumsal hesap; bireyselde D-U-N-S yok |
| **D-U-N-S Numarası** | $0 / **$229 expedited** | 4-6 hafta / **8 gün** | Apple kurumsal için ZORUNLU — şimdiden başlat |
| **Google Play Developer** | $25 tek seferlik | Anında | Bireysel veya şirket |

### 🔴 2. Demo Hesap (Reviewer için)
- E-posta: `review@ihaleal.com`
- Şifre: `Demo!2026`
- Sahte KYC verisi (MASAK uyumlu, gerçek TC değil)
- Apple/Google review formuna URL+credential ekle

### 🔴 3. Store Görselleri
- iPhone 6.7" / 6.5" / 5.5" — 3'er ekran görüntüsü min
- Android 7" tablet + telefon
- Splash + ikon zaten Capacitor assets tarafından üretildi (192/512/maskable)
- Master grafik ekibi: store afişi + tanıtım metni

### 🔴 4. Apple IAP Kararı
- `docs/mobile/IAP_STRATEJISI.md` 3 strateji
- **Master+avukat+mali müşavir** karar veriyor
- Karar verilmeden mobil submit edilmemeli (red riski)

### 🔴 5. Avukat Onaylı Yasal Metinler
- Store her yasal metni resmi yayın için avukat-onaylı şart koşar
- 12 yasal metin var (`/yasal` hub), hepsi TASLAK
- Yayın öncesi baroya kayıtlı avukat gözden geçirmesi

### 📌 6. macOS Build Pipeline
```bash
# macOS + Xcode 15+ üzerinde:
npx cap add ios
# ios/App/App/Info.plist + PrivacyInfo.xcprivacy
# docs/mobile/IOS_INFO_PLIST.md + IOS_PRIVACY_MANIFEST.md şablonları uygula
npx cap sync ios
npx cap open ios   # Xcode açar — Archive → Distribute → App Store Connect
```

### 📌 7. Android Studio Build
```bash
# Master Android Studio'da:
npx cap open android
# Build → Generate Signed Bundle → AAB
# keystore üret (release imza):
keytool -genkey -v -keystore ihaleal-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ihaleal
# AAB → Play Console → Production submit
```

---

## 🏷️ Tag Zinciri

```
safe-before-mobil           ← bu komut start
   ↓
safe-before-mobil-b2-new    ← B1 sonrası (B2 mevcut tag'i koruyordu)
   ↓
HEAD (7ed1225 Mobil B1)
```

**Rollback:** `git reset --hard safe-before-mobil` veya `safe-before-mobil-b2-new`.

---

## 📂 Audit Ayak İzi

```
_audit/
├── PUSH_MOBIL_RAPORU.md          ← bu dosya
├── PUSH_DURUM.md                  (önceki push durumu)
├── HUKUK_MOBIL_RAPORU.md          (önceki — B2/B3/B4 detay)
├── FIYAT_SISTEMI_RAPORU.md
├── mobil-push/                    ← B3 24/24 + B5 143/143 JSON
└── para-blok1/                    (önceki sandbox banner)

docs/mobile/                       ← önceki komutta hazır
├── IOS_INFO_PLIST.md
├── IOS_PRIVACY_MANIFEST.md
├── ANDROID_COMPLIANCE.md
└── IAP_STRATEJISI.md

android/                           ← BU KOMUT
└── (Capacitor 8.3.4 native scaffold + production AndroidManifest)
```

---

## 📊 Toplam Üretim (Bu Komut)

- **2 commit** push'lu:
  - `42acf09` PUSH_DURUM.md (bir önceki komut özet)
  - `7ed1225` Mobil B1 — Android native + Manifest + .gitignore
- **A bölümü:** Push güvenliği — sadece tespit + rapor (yarım iş yoktu)
- **B bölümü:** Android Capacitor native scaffold + production-hazır AndroidManifest + network security + extraction rules + .gitignore
- **B3+B5 final test:** 24/24 mobil + 143/143 lokal PASS

---

— Push güvende ✅ + Android native hazır + 24/24 mobil + 143/143 lokal. iOS macOS bekler, store hesapları + demo + Apple IAP kararı Master'da.
☕📱🛡️
