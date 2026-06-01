/**
 * Capacitor 7 konfigürasyonu — ihaleal mobil sarmalama.
 *
 * Bu dosya, `npx cap add ios` / `npx cap add android` ile native projeyi
 * oluştururken Capacitor CLI tarafından okunur. Henüz Capacitor paketleri
 * kurulu olmasa da config geçerli; ileride `npm i @capacitor/core @capacitor/cli
 * @capacitor/ios @capacitor/android` ile entegre edilebilir.
 *
 * Dalga 5 — App Store hazırlık paketi.
 */

import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ihaleal.app",
  appName: "ihaleal",
  // Vite build çıktısı — `npm run build` sonrası dist/ klasörünü sarmalar.
  webDir: "dist",
  // Marka koyu lacivert teması — PWA manifest theme_color ile aynı.
  backgroundColor: "#0B1120",
  // Hem PWA hem native: HTTPS şemaları + canlı domain'e cors izin verir.
  server: {
    androidScheme: "https",
    iosScheme: "https",
    // Production'da boş bırakılır → bundled web (dist/) çalışır. Dev/QA için
    // canlı URL'i geçici dene: server.url = "https://ihaleal.com".
    cleartext: false,
  },
  ios: {
    // status bar koyu zemin üstünde açık ikon
    contentInset: "automatic",
    backgroundColor: "#0B1120",
    // Safe area otomatik
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    backgroundColor: "#0B1120",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0B1120",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      iosSpinnerStyle: "small",
      spinnerColor: "#22D3EE",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0B1120",
      overlaysWebView: false,
    },
    // Push notifications altyapısı — backend onayı sonrası aktif edilir.
    // (Push için ileride device_tokens tablosu + Edge function gerek.)
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    },
    App: {
      // Deep link şemaları — ileride paylaşılan ilan linkleri ihaleal://ilan/<id>
      // veya https://ihaleal.com/ilan/<id> ile açılabilir.
    },
  },
  // ---- COMPLIANCE NOTLARI ----
  // iOS Info.plist + PrivacyInfo.xcprivacy: docs/mobile/IOS_INFO_PLIST.md +
  //                                          docs/mobile/IOS_PRIVACY_MANIFEST.md
  // Android target API 34 + Data Safety: docs/mobile/ANDROID_COMPLIANCE.md
  // Demo hesap: review@ihaleal.com / Demo!2026
  // Bundle ID: com.ihaleal.app (Apple + Google aynı)
  // Apple Developer $99/yıl + D-U-N-S no (4-6 hafta)
  // Google Play $25 tek seferlik (D-U-N-S no opsiyonel)
};

export default config;
