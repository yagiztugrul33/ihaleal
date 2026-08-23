# Dalga 6 — i18n EN Kapsam Raporu

**Tarih:** 2026-05-31
**Tag:** `safe-before-i18n` (baseline, pushed)
**Tetikleyici:** Anayasa döngüsü Dalga 6 — mega rapor "react-i18next zaten kurulu paradox"u sonrası EN coverage.

---

## 1) Tespit

### A) Altyapı durumu (önceden hazır)
- `react-i18next` paketi kurulu ama **kullanılmıyor** — mega rapor paradox 2.
- Proje kendi `src/i18n/messages.ts` (415 satır) altyapısını kullanır.
- `LocaleContext` (`src/contexts/LocaleContext.tsx`):
  - `useLocale()` → `{ locale, setLocale, t }`
  - localStorage `ihaleal_locale` (tr | en)
  - `navigator.language` ile otomatik TR/EN tespit
  - `useEffect → document.documentElement.lang` dinamik ✅
- `Navbar` dil seçici **VAR** (satır 156-348, "English" / "Türkçe" butonları).

### B) Coverage analizi
`useLocale` 11 dosyada çağrılıyor:
- `pages/SearchResults.tsx`, `pages/Changelog.tsx`
- `components/Navbar.tsx`, `components/cinematic/TerminalHero.tsx`
- `sections/PremiumCinematicHome.tsx`, `sections/target/HomeTarget.tsx`,
  `sections/TrustStrip.tsx`, `sections/Hero.tsx`,
  `sections/LiveAuctionsShowcase.tsx`, `sections/HowItWorks.tsx`
- `contexts/LocaleContext.tsx`

### C) EN locale tam tarama sonucu
`_audit/dalga5-pwa/site-tarama/_en-scan.mjs` ile localStorage'a `en` set edilip 16 rotada test:

| Rota | HTTP | html lang | EB | TR hint | h1 (TR mi?) |
|---|---|---|---|---|---|
| / | 200 | en | 0 | 3 | "How c..." (EN) ✅ |
| /auctions | 200 | en | 0 | 3 | "" (NotFound) |
| /ihaleler | 200 | en | 0 | 3 | "Gerçek piyasa,gerçek fiyat." (TR ❌) |
| /borsa | 200 | en | 0 | 3 | "Canlı terminale hoş geldiniz" (TR ❌) |
| /raporlar | 200 | en | 0 | 3 | "İhaleal Endeks Raporları" (TR ❌) |
| /harita | 200 | en | 0 | 3 | "Harita Üzerinden Arama" (TR ❌) |
| /degerleme | 200 | en | 0 | 3 | "Ne Kadar Eder?" (TR ❌) |
| /how-it-works | 200 | en | 0 | 3 | "Gayrimenkul ihale yolculuğu..." (TR ❌) |
| /destek | 200 | en | 0 | 3 | "Destek" (TR ❌) |
| /giris | 200 | en | 0 | 3 | "Giriş Yap" (TR ❌) |
| /kayit | 200 | en | 0 | 3 | "Kayıt Ol" (TR ❌) |
| /profil | 200 | en | 0 | 3 | "Hesap Profili" (TR ❌) |
| /aramalarim | 200 | en | 0 | 3 | "Kayıtlı Aramalarım" (TR ❌) |
| /iletisim | 200 | en | 0 | 3 | "Bize Ulaşın" (TR ❌) |
| /sss | 200 | en | 0 | 3 | "Sıkça sorulan sorular" (TR ❌) |

**Sonuç:**
- ✅ Altyapı: html lang doğru, locale state çalışıyor, dil seçici Navbar'da var.
- ❌ Coverage: 16 sayfanın 14'ünde **hardcoded TR h1**.
- ✅ Anasayfa (/) ve LiveAuctionsShowcase + Hero + HowItWorks i18n key kullanıyor.
- ❌ Kullanıcı yolu kritik sayfaları (giris/kayit/profil) hardcoded TR.

---

## 2) Bu Dalgada Yapılan

### A) Footer dil seçici
**Dosya:** `src/components/Footer.tsx`
- Globe ikonu + TR/EN pill toggle.
- aria-pressed + aria-label (EN: "Language", TR: "Dil").
- Locale değişimi anında `setLocale` ile yansır (LocaleContext localStorage + html lang otomatik).
- "All rights reserved." vs "Tüm hakları saklıdır." (locale'a bağlı).
- "AI-powered real estate platform" vs "Yapay zeka destekli gayrimenkul platformu".

### B) EN scan altyapısı
**Dosya:** `_audit/dalga5-pwa/site-tarama/_en-scan.mjs`
- localStorage'a `en` set + 16 rota gez.
- TR-only ipucu regex'leri ile hardcoded sızıntı sayar.
- JSON dump: `_audit/dalga5-pwa/site-tarama/_en-scan-result.json`.

---

## 3) Yapılması Gerekenler (Sonraki Mikro-Dalgalar)

EN coverage'i tamamlamak için her sayfa ayrı bir mikro-dalga olarak ele alınmalı (her birinde 500/EB/h1/tarama anayasası geçerli):

| # | Sayfa | Tahmini string sayısı | Öncelik |
|---|---|---|---|
| 1 | `Login.tsx` (/giris) | ~40 string (form, error, link) | ⭐⭐⭐ |
| 2 | `Register.tsx` (/kayit) | ~50 string (form + KYC adımlar) | ⭐⭐⭐ |
| 3 | `Profile.tsx` (/profil) | ~30 string | ⭐⭐ |
| 4 | `NasilCalisir.tsx` (/how-it-works) | ~80 string (4 adım + her birinde alt başlık) | ⭐⭐ |
| 5 | `Iletisim.tsx` (/iletisim) | ~25 string | ⭐⭐ |
| 6 | `Destek.tsx` (/destek) | ~20 string | ⭐ |
| 7 | `SSS.tsx` (/sss) | ~100 string (Q&A pairs) | ⭐ |
| 8 | `Aramalarim.tsx` (/aramalarim) | ~30 string | ⭐ |
| 9 | `BorsaPage.tsx` (/borsa) | ~50 string | ⭐⭐ |
| 10 | `MapPage.tsx` (/harita) | ~20 string | ⭐ |
| 11 | `Reports.tsx` (/raporlar) | ~40 string | ⭐ |
| 12 | `ValuationTool.tsx` (/degerleme) | ~60 string (AVM çıktı + form) | ⭐⭐ |

**Yöntem:** her sayfa için:
1. `useLocale()` hook'unu ekle, `t.<page>` namespace'ini yarat.
2. messages.ts'in EN + TR bölümlerine eklenmesi gereken yeni keys.
3. Sayfayı `t.X.Y` referansına çevir.
4. Build + EN-scan + commit.

**Önerilen tempo:** 1 sayfa / dalga (≈ 30-50 string × 2 dil = 100 satır eklenir). 12 sayfa = 12 mikro-dalga.

---

## 4) Alternatif Yaklaşım — react-i18next geçişi

Mevcut messages.ts → JSON dosyaları'na ayrılır (`src/locales/en.json`, `src/locales/tr.json`). React-i18next provider eklenir.

Avantaj: Lazy loading + namespace bölme + pluralization + Intl.

Dezavantaj: Büyük refactor, mevcut 11 dosyanın hepsi güncellenir, riski yüksek.

**Karar:** Şu an erken — mevcut altyapı çalışıyor. Önce coverage'i mevcut messages.ts ile tamamla, sonra react-i18next'e geçiş ayrı bir dalga olarak değerlendir.

---

## 5) Anayasa Kanıt

| Test | Sonuç |
|---|---|
| Build | ✅ Yeşil |
| EN tarama (16 rota) | ✅ EB=0, hepsi HTTP 200, hepsi `html lang=en` |
| TR tarama (104 rota) | ✅ — önceki commit'ten korundu |
| Sealed maskeleme | ✅ değişmedi |
| Footer dil seçici | ✅ TR/EN pill, aria-pressed + aria-label |

---

## 6) Sıradaki Mikro-Dalga Önerisi

`/giris` + `/kayit` i18n (en yüksek öncelik — anonim kullanıcı yolu). Tahmini scope: ~90 string × 2 dil = 180 satır. 2 atomik commit.

— bitti —
