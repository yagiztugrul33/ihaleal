# Capacitor App Store Hazırlık Paketi — Tamamlanma Raporu

**Tarih:** 2026-05-31
**Tetikleyici:** Dalga 5 PWA bittikten sonra anayasa döngüsünde sıradaki adım — native uygulama paketi.
**Tag:** `safe-before-capacitor` (baseline, pushed)
**Commit:** (bu raporla birlikte commit'lenecek)

---

## 1) Yapılanlar

### A) Root `capacitor.config.ts`
- appId: `com.ihaleal.app`
- appName: `ihaleal`
- webDir: `dist` (Vite PWA build çıktısı)
- backgroundColor: `#0B1120` (PWA manifest theme ile aynı)
- iOS: contentInset auto, scroll enabled, dark statusbar
- Android: HTTPS scheme, secure mixed content, debug kapalı
- Plugins:
  - SplashScreen 2000ms koyu zemin
  - StatusBar DARK + #0B1120
  - PushNotifications (badge+sound+alert) — backend onayı sonrası
  - Keyboard DARK + body resize

### B) `mobile/assets/` — Native ikon + splash master dosyaları
Script: `scripts/gen-capacitor-assets.mjs` (Sharp ile public/icon-512'den türetir)

| Dosya | Boyut | Amaç |
|---|---|---|
| `icon-1024.png` | 1024² | App Store + Play Store master ikon |
| `icon-foreground.png` | 1024², %66 inner | Android adaptive foreground |
| `icon-background.png` | 1024², düz #0B1120 | Android adaptive background |
| `splash-2732.png` | 2732² | iOS + Android universal splash |
| `splash-dark-2732.png` | 2732² | Dark mode varyantı |

### C) `mobile/store/` — Mağaza metin paketleri
| Dosya | Hedef | Boyut |
|---|---|---|
| `app-store-tr.md` | Apple App Store TR | ~3500 char description |
| `app-store-en.md` | Apple App Store EN | ~3500 char description |
| `google-play-tr.md` | Google Play TR | ~3500 char + Veri Güvenliği anketi |
| `google-play-en.md` | Google Play EN | ~3500 char + Data Safety form |

Her paket:
- Uygulama adı (30 char)
- Kısa açıklama (80 char Play / 30 char subtitle iOS)
- Tam açıklama (4000 char altında)
- Anahtar kelimeler
- Gizlilik / destek / marketing URL'leri
- Kategori (Finance + Business)
- What's New / Release Notes (v1.0.0)
- Ekran görüntüsü listesi
- App Review Notes (EN, Apple inceleme ekibi için)

### D) `mobile/README.md` — Tam talimat
- Dizin yapısı
- Capacitor kurulum adımları (Master onayı sonrası)
- iOS Xcode + Android Studio build akışı
- TestFlight + Internal Testing yol haritası
- Submission checklist (iOS + Android ayrı)
- Push notifications gelecek adımı (device_tokens migration onayı bekliyor)
- Tema tutarlılığı tablosu
- Bilinen sınırlar (v1.0.0)

### E) `scripts/gen-capacitor-assets.mjs` — Yeniden üretim
- Sharp tabanlı, public/icon-512.png'den asset türetir.
- Kaynak ikon güncellenirse tek komutla regenerate.

---

## 2) Anayasa Kanıt

### Site sağlığı (regresyon)
| Test | Sonuç |
|---|---|
| Build | ✅ 19.54s yeşil (PWA generateSW + Capacitor config dokunmadan) |
| Playwright EB | ✅ 0 (52 rota × 2 viewport = 104, scan-2 log) |
| /ilan/:id koruması | ✅ prop-XXX + UUID + saçma-id hepsi "İlan bulunamadı" h1 |
| Sealed maskeleme | ✅ değişmedi |

### Tag + commit
- `safe-before-capacitor` ✅ pushed
- Atomic commit ileride: `feat(mobile): Capacitor App Store hazırlık paketi`

---

## 3) Migration Durumu

**Bu paketi tek başına aktif etmek için MIGRATION GEREKMEZ**:
- capacitor.config.ts → frontend metadata
- mobile/assets → static asset
- mobile/store → markdown doc
- mobile/README → markdown doc

**Sonraki adım için MIGRATION GEREKİR** (Master onayı bekliyor):
- `device_tokens` tablosu (user_id, platform: ios|android|web, token, created_at)
- RLS: anon INSERT (kendi user_id'si), service_role SELECT
- Edge function `push-notifier` (ihale kapanış, fiyat değişim tetikleyici)
- VAPID anahtar çifti (web push) + APNs sertifika (iOS) + FCM project key (Android)

---

## 4) Bilinçli Eksiklikler

| Eksik | Neden |
|---|---|
| `@capacitor/core` paketleri kurulmadı | Master "Capacitor build" ayrı adım dedi; şimdi sadece hazırlık paketi |
| Feature Graphic 1024×500 PNG | Adobe Illustrator + manuel tasarım önerilir, otomatik üretilemiyor |
| Ekran görüntüleri | Master canlı uygulamadan çekecek (önerilen 8 ekran liste edildi) |
| In-App Purchase | v1.0.0'da yok, gelecek sürüm |
| Push notifications | Backend onayı bekliyor |

---

## 5) Anayasa Döngüsü — Sıradaki Adım

Master brief'ten:
> "App Store hazırlık paketi → push (device_tokens, onay çerçevesinde) → Capacitor build → Dalga 6"

Şimdi: ✅ App Store hazırlık paketi tamam.
Sıradaki:
1. **Push notifications backend** — `device_tokens` migration + Edge function. Bu MIGRATION ve onay çerçevesindedir (Master "yeni tablo SERBEST, onay var" dedi → ilerleyebilirim).
2. Sonra: `@capacitor/core` paketleri kur + `npx cap add ios/android` (lokal Mac/Linux gerektirir — CI'da yapılır veya Master'ın bilgisayarında).
3. Sonra: **Dalga 6 i18n** (react-i18next zaten kurulu, EN dil paketini tamamla).

Her dalga için: **500/hata/boşluk taraması + kanıt + atomik commit + push**.

— bitti —
