# Android Compliance (Play Store) — ihaleal

Google Play 2026 kuralları: `targetSdkVersion = 34` (Android 14) zorunlu, Data Safety formu
+ İçerik derecelendirmesi şart.

## 1. `android/app/build.gradle`

`npx cap add android` çıktısı sonrası kontrol/güncelleme:

```gradle
android {
    compileSdkVersion 34          // Android 14
    defaultConfig {
        applicationId "com.ihaleal.app"
        minSdkVersion 23          // Android 6.0+ (~98% kapsama)
        targetSdkVersion 34       // 2026 Play Store şartı
        versionCode 1
        versionName "1.0.0"
        multiDexEnabled true
    }
    buildFeatures { viewBinding true }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}
```

## 2. `android/app/src/main/AndroidManifest.xml` — Permissions

```xml
<!-- Internet (zorunlu) -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Konum — runtime izin, kullanıcı reddederse harita feature gizlenir -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- Kamera + galeri (ilan fotoğraf) -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />  <!-- Android 13+ -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />

<!-- Bildirim (Android 13+) -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Biyometrik (Face/Touch Unlock) -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />

<!-- KULLANILMAYAN: -->
<!-- <uses-permission android:name="android.permission.RECORD_AUDIO" /> -->
<!-- <uses-permission android:name="android.permission.BLUETOOTH" /> -->
<!-- <uses-permission android:name="android.permission.READ_CONTACTS" /> -->
<!-- AD_ID izni TOPLANMIYOR (Google Advertising ID kullanılmıyor) -->
```

`<application>` içine:

```xml
<application
    android:allowBackup="false"
    android:dataExtractionRules="@xml/data_extraction_rules"
    android:fullBackupContent="false"
    android:networkSecurityConfig="@xml/network_security_config"
    android:requestLegacyExternalStorage="false"
    android:supportsRtl="false"
    ...>
```

## 3. Network Security Config

`android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <!-- Cleartext (HTTP) BLOK — tüm trafik HTTPS -->
</network-security-config>
```

## 4. Data Safety Form (Google Play Console)

`/gizlilik` sayfasındaki **Veri Envanteri** tablosu Google Play Data Safety formuyla
**birebir aynı** doldurulmalı.

### Toplanan Veri
| Kategori | Veri Türü | Amaç | Paylaşım |
|---|---|---|---|
| Personal Info | Name | App functionality | Yes — service provider |
| Personal Info | Email address | App + account mgmt | Yes — service provider |
| Personal Info | User ID | App functionality | No |
| Personal Info | Phone number | App + 2FA | No |
| Financial Info | Payment info | Payment processing | Yes — payment provider |
| Location | Approximate location | App functionality | No |
| App activity | App interactions | App + analytics | No |
| App activity | In-app search history | Personalization | No |
| Device IDs | Device or other IDs | Security + fraud prevention | No |

### TOPLANMAYAN
- Health & fitness — NO
- Audio files — NO
- Photos & videos — Camera/galeri RIZA, sunucuya gönderim sadece ilan ile
- Calendar — NO
- Contacts — NO
- Personal info: Race/ethnicity, Political/Religious, Sexual orientation — NO
- **Advertising ID** — NO (toplanmıyor)

### Encryption + Deletion
- ✅ All data is encrypted in transit (TLS 1.3)
- ✅ All data is encrypted at rest (AES-256)
- ✅ User can request data deletion (in-app: Settings → Account → Delete)

## 5. İçerik Derecelendirmesi

- **IARC kategorisi**: Finansal işlem içerir (real estate auction)
- **Yaş**: 17+ / Mature 17 / PEGI 12+ (finansal sorumluluk)
- Şiddet/Cinsellik/Uyuşturucu: YOK
- Kullanıcı içeriği: ilan açıklamaları + fotoğraflar (moderasyon var)

## 6. App Bundle (.aab) Build

```bash
# Windows / Mac / Linux (Android Studio + JDK 17+)
cd android
./gradlew bundleRelease

# Çıktı:
# android/app/build/outputs/bundle/release/app-release.aab
```

## 7. Master Yapılacaklar

1. Google Play Developer hesap $25 tek seferlik
2. `npx cap add android` (Windows/Mac OK, Android Studio gerek)
3. Yukarıdaki AndroidManifest + build.gradle ayarlarını uygula
4. App ikon + splash zaten Capacitor assets generate edildi
5. Keystore üret (release imzalama):
   ```bash
   keytool -genkey -v -keystore ihaleal-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ihaleal
   ```
6. Play Console → app oluştur → Data Safety + İçerik derecelendirmesi
7. .aab yükle → Internal testing → Production submit

## 8. D-U-N-S Numarası (Apple için zorunlu, Google için değil)

Google Play hesabı bireysel veya şirket olabilir; bireyselde D-U-N-S gerek yok.
Apple için ŞİRKET hesabı $99/yıl + D-U-N-S no zorunlu.

- D-U-N-S Türkiye için: https://www.dnb.com/duns-number/get-a-duns.html — ücretsiz başvuru, 4-6 hafta.

— ihaleal mobile compliance, 2026-06-01
