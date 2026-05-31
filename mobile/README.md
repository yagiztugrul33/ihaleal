# ihaleal Mobile — Capacitor Wrap Paketi

> Native iOS + Android paketleme için hazırlık dizini. Capacitor 7 ile mevcut Vite PWA build'i sarmalanır.

## Dizin yapısı

```
mobile/
├── README.md                         ← bu dosya
├── assets/                           ← Native ikon + splash kaynakları (1024² master)
│   ├── icon-1024.png                 ← App Store + Play Store master ikon
│   ├── icon-foreground.png           ← Android adaptive foreground (1024², %66 safe area)
│   ├── icon-background.png           ← Android adaptive background (düz #0B1120)
│   ├── splash-2732.png               ← iOS + Android universal splash (2732²)
│   └── splash-dark-2732.png          ← Dark mode splash
└── store/                            ← Mağaza başvuru metinleri (TR + EN)
    ├── app-store-tr.md               ← Apple App Store TR
    ├── app-store-en.md               ← Apple App Store EN
    ├── google-play-tr.md             ← Google Play TR
    └── google-play-en.md             ← Google Play EN
```

Root'taki `capacitor.config.ts` Capacitor CLI tarafından okunur (appId, splash, statusbar, plugin ayarları).

---

## Capacitor kurulum

### 1. Bağımlılıklar ✅ KURULU (Capacitor 8.3.4)
Aşağıdaki paketler `package.json`'a eklendi (bu repo'da hazır):
- `@capacitor/core` 8.3.4
- `@capacitor/cli` 8.3.4 (devDep)
- `@capacitor/assets` (devDep — ikon/splash otomatik üretim)
- `@capacitor/ios` 8.3.4
- `@capacitor/android` 8.3.4
- `@capacitor/splash-screen`
- `@capacitor/status-bar`
- `@capacitor/keyboard`
- `@capacitor/app`
- `@capacitor/push-notifications`

`npx cap doctor` doğrulaması:
```
Latest Dependencies: 8.3.4
Installed Dependencies: 8.3.4
```

### 2. Native projeleri oluştur (Mac veya Linux önerilir)
```bash
npx cap init                       # capacitor.config.ts zaten var, sadece doğrular
npx cap add ios                    # macOS gerek (Xcode + CocoaPods)
npx cap add android                # Android Studio + JDK 17 gerek
```

### 3. Web build sarmala
```bash
npm run build                      # Vite + vite-plugin-pwa generateSW
npx cap sync                       # dist/ → iOS + Android assets'e kopyalar
```

### 4. Asset paste

iOS:
```bash
# Capacitor assets plugin önerilen yol:
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --iconBackgroundColor "#0B1120" \
                              --splashBackgroundColor "#0B1120" \
                              --assetPath mobile/assets
```

Manuel alternatif:
- `mobile/assets/icon-1024.png` → `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- `mobile/assets/splash-2732.png` → `ios/App/App/Assets.xcassets/Splash.imageset/`
- `mobile/assets/icon-foreground.png` + `icon-background.png` →
  `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml` referansları

### 5. iOS Xcode build
```bash
npx cap open ios
# Xcode → Signing & Capabilities → Team seç
# Product → Archive → App Store Connect → upload
```

### 6. Android Studio build
```bash
npx cap open android
# Build → Generate Signed Bundle → Android App Bundle (.aab)
# Play Console → Production track upload
```

---

## TestFlight + Internal Testing (önerilen yol)

| Aşama | iOS | Android |
|---|---|---|
| 1. İlk test | TestFlight Internal | Internal Testing track |
| 2. Beta | TestFlight External (100 kişi) | Closed Testing track |
| 3. Açık beta | TestFlight Public Link | Open Testing track |
| 4. Yayın | App Store Review (~24-48 sa) | Production rollout (kademeli) |

---

## Submission Checklist

### App Store (iOS)
- [ ] Apple Developer hesabı ($99/yıl)
- [ ] App Store Connect → ihaleal app kaydı (Bundle ID: `com.ihaleal.app`)
- [ ] `mobile/store/app-store-tr.md` + `app-store-en.md` metinleri yapıştırıldı
- [ ] Ekran görüntüleri (6.7" iPhone — 8 adet)
- [ ] Gizlilik politikası URL'i: `https://ihaleal.com/gizlilik`
- [ ] Destek URL'i: `https://ihaleal.com/destek`
- [ ] App Review Notes (EN) → test login (test@ihaleal.com / testpass123)
- [ ] In-App Purchase: YOK (v1.0.0 ödeme dışı)
- [ ] Push notification: pending — backend onayı sonrası (device_tokens migration)

### Google Play (Android)
- [ ] Google Play Console hesabı ($25 tek seferlik)
- [ ] App tanımlama: `com.ihaleal.app`
- [ ] `mobile/store/google-play-tr.md` + `google-play-en.md` metinleri yapıştırıldı
- [ ] Feature Graphic 1024×500 (üretilecek)
- [ ] Ekran görüntüleri (1080×1920 — 8 adet)
- [ ] Veri Güvenliği anketi tamamlandı (markdown'daki tabloya göre)
- [ ] Hedef SDK 34+ (Android 14)
- [ ] App Signing: Google Play Signing (önerilen)
- [ ] İçerik sınıflandırması: Everyone / 18+ hedef kitle

---

## Push Notifications (sonraki adım — Master onayı bekliyor)

PWA tarafında: Web Push API + service-worker subscribe altyapısı (Dalga 5 sonrası).
Native tarafında: Capacitor `@capacitor/push-notifications` + Firebase Cloud Messaging (Android) + APNs (iOS).

Backend gereksinim:
- Yeni tablo `device_tokens (user_id, platform, token, created_at)`
- RLS: anon INSERT (kendi token'i), service_role SELECT
- Edge function `push-notifier`: ihale kapanış / fiyat değişimi tetikleyici
- VAPID anahtar çifti + APNs sertifika + FCM project key

Master onay verirse migration + edge function ayrı bir dalga olarak hazırlanır.

---

## Tema Tutarlılığı

| Yer | Renk |
|---|---|
| PWA manifest theme_color | `#0B1120` |
| Capacitor backgroundColor | `#0B1120` |
| iOS launch screen | `#0B1120` |
| Android adaptive icon BG | `#0B1120` |
| StatusBar style | DARK (içerik açık) |
| SplashScreen launchShowDuration | 2000ms |

Marka birliği: tek koyu lacivert ton tüm yüzeylerde.

---

## Bilinen Sınırlar (v1.0.0)

| Konu | Durum |
|---|---|
| In-App Purchase | YOK (gelecek sürüm) |
| Native ödeme | YOK (mobile web → Stripe/Iyzico) |
| Push notif | Pending backend onayı |
| Apple Sign-In | İleride |
| Google Sign-In | İleride |
| Deep link şeması | `ihaleal://ilan/<id>` hazır, runtime register edilecek |

---

## Asset üretimi yeniden çalıştırma

`mobile/assets/` boşalır veya `public/icon-512.png` güncellenirse:
```bash
node scripts/gen-capacitor-assets.mjs
```
Sharp ile 1024 master + adaptive + splash otomatik üretir.
