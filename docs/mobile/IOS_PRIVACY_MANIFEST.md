# iOS Privacy Manifest (PrivacyInfo.xcprivacy) — ihaleal

Apple 2024 Mayıs'tan itibaren tüm uygulamalar ve 3. parti SDK'lar için **Privacy Manifest**
(`PrivacyInfo.xcprivacy`) zorunlu. iOS 17.2+ App Review'da kontrol edilir.

## Konum

`ios/App/App/PrivacyInfo.xcprivacy` — proje ana hedefe (App target) eklenir.

## Şablon — ihaleal.app için

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>

  <!-- 1. NSPrivacyTracking — KAPALI (cross-app tracking yok) -->
  <key>NSPrivacyTracking</key>
  <false/>

  <key>NSPrivacyTrackingDomains</key>
  <array>
    <!-- BOŞ — hiçbir domain tracking yapmıyor -->
  </array>

  <!-- 2. NSPrivacyCollectedDataTypes — TOPLADIĞIMIZ VERİ KATEGORİLERİ -->
  <key>NSPrivacyCollectedDataTypes</key>
  <array>

    <!-- E-posta -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeEmailAddress</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
        <string>NSPrivacyCollectedDataTypePurposeAnalytics</string>
      </array>
    </dict>

    <!-- Ad-soyad -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeName</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

    <!-- Telefon -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypePhoneNumber</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

    <!-- Ödeme bilgisi -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypePaymentInfo</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

    <!-- IP bazlı yaklaşık konum -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeCoarseLocation</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

    <!-- User ID (T.C. hashlenmiş, oturum ID) -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeUserID</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

    <!-- Product Interaction (ihale + teklif kaydı) -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeProductInteraction</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
        <string>NSPrivacyCollectedDataTypePurposeAnalytics</string>
      </array>
    </dict>

    <!-- Crash / Performance -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeCrashData</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <false/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

  </array>

  <!-- 3. NSPrivacyAccessedAPITypes — Apple required reason API kullanımı -->
  <key>NSPrivacyAccessedAPITypes</key>
  <array>

    <!-- UserDefaults (oturum/dil/tema yerel kayıt) -->
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>CA92.1</string>
      </array>
    </dict>

    <!-- File timestamp -->
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>C617.1</string>
      </array>
    </dict>

    <!-- System Boot Time (Capacitor framework için sık) -->
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategorySystemBootTime</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>35F9.1</string>
      </array>
    </dict>

    <!-- Disk Space -->
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryDiskSpace</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>E174.1</string>
      </array>
    </dict>

  </array>

</dict>
</plist>
```

## NOT KULLANILAN — Privacy Manifest'e YAZILMAZ

- IDFA (`NSPrivacyCollectedDataTypeAdvertisingData`) — toplanmıyor
- Cross-site tracking — yok
- Microphone audio — yok
- Health/Fitness data — yok
- Sensitive Info (biyometrik, sağlık) — yok

## 3. Parti SDK Privacy Manifest

Aşağıdaki SDK'lar kendi `PrivacyInfo.xcprivacy` dosyalarıyla gelir; eklerken kontrol et:

- `@capacitor/core` 8.x — kendi PrivacyInfo
- `@capacitor/ios` 8.x — kendi
- `@capacitor/push-notifications` 8.x — APN tracking yok
- `@capacitor/keyboard` — yerel, izleme yok
- `@capacitor/splash-screen` — yerel
- `@capacitor/status-bar` — yerel

App Review'de Apple her SDK için manifest kontrol eder; eksikse REDDEDİLİR.

## Master Yapılacaklar

1. macOS + Xcode 15+ üzerinde `npx cap add ios`
2. `ios/App/App/PrivacyInfo.xcprivacy` üret (yukarıdaki şablonu kullan)
3. Xcode'da target → Build Phases → Copy Bundle Resources içine `PrivacyInfo.xcprivacy` ekle
4. App Store Connect → App Privacy formu — yukarıdakiyle birebir aynı doldur
5. App Review submit

— ihaleal mobile compliance, 2026-06-01
