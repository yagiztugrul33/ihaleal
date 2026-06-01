# iOS Info.plist — Permission Açıklamaları (ihaleal)

Bu dosya `ios/App/App/Info.plist` üretildiğinde **otomatik olarak değil — manuel** eklenmesi gereken
Apple App Store şartlarını listeler. Apple iOS 17+ için açıklama zorunlu.

## 1. Permission Strings (NSXxxxUsageDescription)

```xml
<!-- Konum (harita + bölge) -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>İhaleal harita ve bölgesel ilan görüntülemek için konumunuza erişir. Konum verisi cihazınızdan çıkmaz, sunucuya gönderilmez. Bu izin tamamen isteğe bağlıdır.</string>

<!-- Konum (her zaman — KULLANILMIYOR, ileride kalkacak) -->
<!-- <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>—</string> -->

<!-- Kamera (ilan fotoğraf) -->
<key>NSCameraUsageDescription</key>
<string>İlan oluştururken mülk fotoğrafı çekmek için kamerayı kullanırız. Fotoğraflar yalnızca ilan ile birlikte saklanır, başka amaçla kullanılmaz.</string>

<!-- Fotoğraf galeri (ilan görseli seçim) -->
<key>NSPhotoLibraryUsageDescription</key>
<string>İlana fotoğraf eklemek için galeriden seçim yapmanız gerekir. Yalnızca seçtiğiniz fotoğraflara erişilir.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>İhaleal ekspertiz raporu PDF'lerini galerinize kaydedebilmek için yazma izni isteyebilir.</string>

<!-- Bildirimler — Apple ayrı APN izni zaten alıyor (UNUserNotificationCenter) -->
<!-- Push token sadece teklif/ihale uyarısı için kullanılır -->

<!-- Face ID / Touch ID -->
<key>NSFaceIDUsageDescription</key>
<string>Hesabınıza güvenli giriş için Face ID/Touch ID kullanmanıza izin verebilirsiniz. Biyometrik veri cihazınızda kalır, ihaleal bu veriye erişemez.</string>

<!-- Mikrofon — KULLANILMIYOR; Apple Review'de "uygulamada mikrofon erişimi yok" beyan edilir -->
<!-- Bluetooth — KULLANILMIYOR -->
<!-- HealthKit/Motion — KULLANILMIYOR -->
<!-- Tracking (IDFA) — KULLANILMIYOR — App Tracking Transparency İSTENMEZ -->
```

## 2. App Transport Security (ATS)

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
  <key>NSExceptionDomains</key>
  <dict>
    <!-- OpenStreetMap tile sunucuları HTTP fallback gerekirse -->
    <key>tile.openstreetmap.org</key>
    <dict>
      <key>NSIncludesSubdomains</key>
      <true/>
      <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
      <false/>
    </dict>
  </dict>
</dict>
```

## 3. URL Scheme (deep link)

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>ihaleal</string>
    </array>
  </dict>
</array>

<!-- Universal Links için Apple App Site Association — apple-app-site-association
     dosyası ihaleal.com/.well-known/ altında host edilmeli -->
```

## 4. Background Modes (sadece kullanılan)

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

## 5. Privacy — Tracking (ATT)

`NSUserTrackingUsageDescription` **EKLENMEYECEK** — ihaleal kullanıcı çapraz-uygulama
izlemesi yapmaz. App Review'da "tracking permission" sorusuna "No" denecek.

## 6. App Store Review Notes (rapora yaz)

- Demo hesap: review@ihaleal.com / Demo!2026 (gerçek hesap değil, MASAK uyumlu KYC sahte)
- Konum izni İHALE seçimi sırasında kullanıcı izin verirse açılır; reddederse uygulama
  her özellik dahil çalışır (sadece "yakındaki ilanlar" gizlenir).
- Push notification cihaz kayıtsız olduğu sürece istemeyiz.
- "Çocuklara uygun" değil — 17+ derecelendirme (finansal işlem).

## 7. Apple App Privacy Form Eşleme

`/gizlilik` sayfasındaki **Veri Envanteri** tablosu Apple App Privacy formuyla
**birebir aynı** doldurulmalı:

| Apple Kategori | Bizdeki Karşılığı |
|---|---|
| Contact Info → Email | İletişim → E-posta |
| Contact Info → Phone | İletişim → Telefon |
| Identifiers → User ID | Kimlik → T.C. (hashlenmiş) |
| Financial Info → Payment Info | Finansal → Ödeme kaydı |
| Location → Coarse | Konum → IP bazlı il |
| Location → Precise | TOPLANMIYOR (rıza ile) |
| Usage Data → Product Interaction | Kullanım → İhale teklif |
| Diagnostics → Crash | Cihaz → Sentry-eşdeğeri (varsa) |
| **Identifiers → IDFA** | **TOPLANMIYOR** |
| **Browsing History (cross-app)** | **TOPLANMIYOR** |

## 8. Master Yapılacaklar (macOS gerekli)

1. `npx cap add ios` (macOS + Xcode 15+ üzerinde)
2. `ios/App/App/Info.plist` dosyasına yukarıdaki anahtarları ekle
3. `ios/App/App/PrivacyInfo.xcprivacy` üret (bkz. `IOS_PRIVACY_MANIFEST.md`)
4. Bundle ID: `com.ihaleal.app` (capacitor.config.ts ile aynı)
5. Apple Developer hesabı $99/yıl
6. App Store Connect → app oluştur → metadata + ekran görüntüleri
7. Demo hesap + review notes
8. TestFlight beta → production submit

— ihaleal mobile compliance, 2026-06-01
