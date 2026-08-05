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
  // Açık zemin — tasarım sistemi --zemin (#ffffff). Marka lacivert (#1E40AF)
  // artık zemin değil, yalnızca vurgu rengidir: CTA · bildirim · aktif durum.
  backgroundColor: "#ffffff",
  // Hem PWA hem native: HTTPS şemaları + canlı domain'e cors izin verir.
  server: {
    androidScheme: "https",
    iosScheme: "https",
    // Production'da boş bırakılır → bundled web (dist/) çalışır. Dev/QA için
    // canlı URL'i geçici dene: server.url = "https://ihaleal.com".
    cleartext: false,
  },
  ios: {
    // açık zemin üstünde koyu status bar ikonları
    contentInset: "automatic",
    backgroundColor: "#ffffff",
    // Safe area otomatik
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    backgroundColor: "#ffffff",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      // Açılış ekranı bir bekleme duvarı değil; kısa tutulur.
      launchShowDuration: 900,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      // CENTER_INSIDE: marka işareti kırpılmaz (CENTER_CROP kenardan kesiyordu)
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false,
      // Açık zeminde tam ekran/immersive gereksiz agresif — sistem çubukları kalsın
      splashFullScreen: false,
      splashImmersive: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#1E40AF",
    },
    StatusBar: {
      // Capacitor'da Style.Light = "açık zemin için koyu metin". Açık temada doğrusu bu.
      style: "LIGHT",
      backgroundColor: "#ffffff",
      overlaysWebView: false,
    },
    // Push notifications altyapısı — backend onayı sonrası aktif edilir.
    // (Push için ileride device_tokens tablosu + Edge function gerek.)
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Keyboard: {
      resize: "body",
      // klavye de açık temada
      style: "LIGHT",
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
