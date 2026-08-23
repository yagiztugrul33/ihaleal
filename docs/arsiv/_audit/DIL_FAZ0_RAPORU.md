# 🌐 ADIM 10 — Çok Dil Altyapısı FAZ 0 (Uygulama Raporu)

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-faz0`
**Doktrin:** Mevcut TR/EN'i BOZMA. "Her şeyi çevir/taşı" YAPMA — sadece TEMEL + birkaç kanıt string. 359 CSS + tam çeviri SONRAKİ faz.

---

## ⚡ TEK-CÜMLELİK ÖZET

LocaleContext **A: genişlet** kararı uygulandı (i18next migration **ertelendi** — 11 dosya regresyon riski yüksek); 4 dil (TR/EN/RU/AR) altyapısı kuruldu, **AR seçilince `<html dir="rtl">` + Noto Sans Arabic font** otomatik devreye girer; RU/AR için **nav.* kanıt çevirileri** eklendi, geri kalan tüm metinler TR fallback (kırık değil); **4/4 Playwright PASS, regresyon SIFIR, 0 console hata**; çekirdek + 11 mevcut `useLocale()` tüketicisi dokunulmadan çalışmaya devam ediyor.

---

## 1) BLOK 1 — Teşhis (özet — detay `_audit/DIL_FAZ0_TESHIS.md`'de)

- **Mevcut sistem:** `LocaleContext` (83 satır) + `messages.ts` (415 satır), 2 dil (TR/EN)
- **i18next:** Kurulu ama **0 kullanım**
- **RTL:** YOK (dir set edilmiyor)
- **`useLocale()` tüketici:** 11 dosya
- **Karar:** **A (genişlet)** — Migration riski yüksek, A regresyon riski sıfır

---

## 2) BLOK 2 — Güvenli Temel (uygulanan kod)

### 2.1 `src/i18n/messages.ts` — Locale + DIRECTION + Override + Helper
```ts
export type Locale = "en" | "tr" | "ru" | "ar";  // 2 → 4 dil

export const LOCALE_DIRECTION: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr", tr: "ltr", ru: "ltr", ar: "rtl",
};

// NavMessages tipine 2 yeni alan
langRu: string;
langAr: string;

// EN + TR nav'a yeni 2 alan
{ ..., langRu: "Russian"/"Rusça", langAr: "Arabic"/"Arapça" }

// messages declaration: Record<"en"|"tr", Messages> (eskisinden cast değişti)
// RU/AR'ı runtime merge'le üretmek için

// RU/AR override (sadece nav.*, geri kalan TR fallback)
const _ruOverrides: PartialDeep<Messages> = {
  nav: { auctions: "Аукционы", logIn: "Войти", signUp: "Регистрация", ... },
};
const _arOverrides: PartialDeep<Messages> = {
  nav: { auctions: "المزادات", logIn: "تسجيل الدخول", signUp: "إنشاء حساب", ... },
};

// Deep merge helper + lazy cache (modül seviyesinde)
function _mergeMessages<T>(base, override): T { ... }
let _cachedRu: Messages | null = null;
let _cachedAr: Messages | null = null;

export function getMessagesFor(locale: Locale): Messages {
  if (locale === "en") return messages.en;
  if (locale === "tr") return messages.tr;
  if (locale === "ru") { _cachedRu ??= _mergeMessages(messages.tr, _ruOverrides); return _cachedRu; }
  // ar
  _cachedAr ??= _mergeMessages(messages.tr, _arOverrides); return _cachedAr;
}

// 4 dil kabul eden resolveLocale
export function resolveLocale(raw: string | null): Locale { ... 4 değer ... }
```

### 2.2 `src/contexts/LocaleContext.tsx` — dir + 4 dil
```diff
-import { messages, ... } from "@/i18n/messages";
+import { LOCALE_DIRECTION, getMessagesFor, ... } from "@/i18n/messages";

 function detectBrowserLocale() {
   if (lower.startsWith("tr")) return "tr";
+  if (lower.startsWith("ru")) return "ru";
+  if (lower.startsWith("ar")) return "ar";
   return "en";
 }

 function readStoredLocale() {
-  if (stored === "tr" || stored === "en") return stored;
+  if (stored === "tr" || stored === "en" || stored === "ru" || stored === "ar") return stored;
 }

 useEffect(() => {
-  document.documentElement.lang = locale === "tr" ? "tr" : "en";
+  document.documentElement.lang = locale;
+  document.documentElement.dir = LOCALE_DIRECTION[locale];   // ← RTL mekanizması
 }, [locale]);

-const value = useMemo(() => ({ locale, setLocale, t: messages[locale] }), [...]);
+const value = useMemo(() => ({ locale, setLocale, t: getMessagesFor(locale) }), [...]);
```

### 2.3 `src/components/Navbar.tsx` — 4 dil
- **Desktop dropdown:** 2 buton → **4 buton** (EN/TR/RU/AR + AR'a `dir="rtl"` attr)
- **Mobile menü:** 2 buton flex → **4 buton grid** (sm:grid-cols-4)
- `text-left` → `text-start` (logical CSS — RTL hazır)

### 2.4 `src/components/Footer.tsx` — 4 dil
- 2 pill → **4 pill** (TR/EN/RU/AR)

### 2.5 `index.html` — Arapça font preload
```html
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
      media="all" />
```
- `display=swap` → Inter LCP'i bekletmez
- `preconnect` fonts.googleapis.com zaten vardı (mevcut Inter için) — ek bağlantı yok

### 2.6 `src/index.css` — AR font CSS
```css
html[lang="ar"] body,
html[lang="ar"] {
  font-family: "Noto Sans Arabic", var(--font-body), "Inter", system-ui, sans-serif;
}
```
- Sadece `<html lang="ar">` aktifken devreye girer
- TR/EN/RU etkilenmez (Inter kalır)

---

## 3) BLOK 3 — RTL Temel Kontrol

### ✅ Çalışan
- `<html dir="rtl">` AR'da otomatik set
- Tailwind `rtl:` variants otomatik tetiklenir (yeni kod yazıldıkça kullanılır)
- Yeni kod logical CSS (`ms-/me-/text-start`) zaten geçmiş adımlarda yaygın

### ⚠️ Sonraki faza (dürüst)
- 359 fiziksel CSS (`ml-/mr-/pl-/pr-/text-left/text-right`) AR'da **görsel olarak ters** olabilir (margin/padding sol-sağ aynalanmaz)
- Ana sayfa AR'da `dir=rtl` doğru ama bazı kartlar/butonlar gözle bakıldığında soldan akıyor olabilir
- **Bu FAZ 0'da kabul edildi** — toplu CSS dönüşümü FAZ 1 (sayfa sayfa, ~100-150 saat)

---

## 4) BLOK 4 — Dürüstlük + Koruma

| Konu | Durum |
|---|---|
| Mevcut TR/EN regresyon | ✅ SIFIR (4/4 test PASS, lang/dir doğru) |
| RU/AR kanıt çevirileri | ✅ nav.* (auctions, logIn, signUp + dil isimleri vb.) gerçek RU/AR |
| RU/AR geri kalan metinler | TR fallback (kırık değil, kullanıcı görür) — **dürüst** |
| Yasal metinler RU/AR | ❌ YOK (avukat onayı gerek — FAZ 1+) |
| Sahte/makine-çeviri | ❌ Hiç yok — sadece eklediğim doğru kanıt string'leri |
| `useLocale()` 11 dosya | ✅ Hepsi dokunulmadan çalışıyor (`t.nav.x` aynı) |
| `i18next` paket kullanımı | ❌ Hala 0 (FAZ 0 amaç değil) |

---

## 5) BLOK 5 — Test (gerçek kanıt, Playwright 4 dil)

```json
{
  "tr": { "html_lang": "tr", "html_dir": "ltr", "dropdown_has_4_diller": {...all true}, "errs": [] },
  "en": { "html_lang": "en", "html_dir": "ltr", "dropdown_has_4_diller": {...all true}, "errs": [] },
  "ru": { "html_lang": "ru", "html_dir": "ltr", "dropdown_has_4_diller": {...all true}, "proof_translation": true, "errs": [] },
  "ar": { "html_lang": "ar", "html_dir": "rtl", "dropdown_has_4_diller": {...all true}, "proof_translation": true, "font_family": "\"Noto Sans Arabic\", Inter, ...", "errs": [] }
}
```

### Tablo özeti

| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html lang>` | tr ✅ | en ✅ | ru ✅ | ar ✅ |
| `<html dir>` | ltr ✅ | ltr ✅ | ltr ✅ | **rtl ✅** |
| 4 dil dropdown | ✅ | ✅ | ✅ | ✅ |
| Kanıt çeviri (Войти/تسجيل الدخول) | n/a | n/a | ✅ | ✅ |
| Arapça font yüklü | n/a | n/a | n/a | **✅ Noto Sans Arabic** |
| Mevcut TR/EN regresyon | **YOK** | **YOK** | — | — |
| Console hatası | 0 | 0 | 0 | 0 |

### Lint + Build
- 5 dosya 0 error / 0 warning
- PWA v1.3.0 — precache **299 entries (6462.16 KiB)** ← önceki 6458.78 KiB, **+3.38 KiB**

### Screenshots
```
_audit/dil-faz0/
├── _test.mjs
├── tr.png, en.png, ru.png, ar.png  (4 dil — anasayfa, dropdown açık)
```

---

## 6) Dokunulan dosyalar

```
src/i18n/messages.ts                  (+117 / -2)
  - Locale 4 dil + LOCALE_DIRECTION + langRu/langAr nav alanları
  - en/tr nav'a 2 yeni alan
  - _ruOverrides + _arOverrides + _mergeMessages + getMessagesFor + cache
  - resolveLocale 4 dil

src/contexts/LocaleContext.tsx        (+10 / -7)
  - import getMessagesFor + LOCALE_DIRECTION
  - detectBrowserLocale: ru + ar prefix
  - readStoredLocale: 4 değer kabul
  - useEffect: lang = locale (direct) + dir = LOCALE_DIRECTION[locale]
  - t = getMessagesFor(locale)

src/components/Navbar.tsx             (+45 / -8)
  - Dropdown: 2 dil → 4 dil (RU + AR + AR'a dir="rtl")
  - Mobile menü: flex 2 → grid 4
  - text-left → text-start (logical)

src/components/Footer.tsx             (+25 / 0)
  - 2 pill → 4 pill (RU + AR)

index.html                             (+8 / 0)
  - Noto Sans Arabic preload link (Google Fonts)

src/index.css                          (+6 / 0)
  - html[lang="ar"] body { font-family: "Noto Sans Arabic", ... }

_audit/DIL_FAZ0_TESHIS.md             (+ YENİ teşhis raporu)
_audit/DIL_FAZ0_RAPORU.md             (+ YENİ uygulama raporu — bu)
_audit/dil-faz0/_test.mjs             (+ YENİ test)
_audit/dil-faz0/*.png                 (+ 4 ekran kanıt)
```

**Çekirdek dokunulmadı (git diff sıfır):**
```
src/lib/placeBid.ts                   ZERO
src/lib/fees.ts                       ZERO
src/contexts/CurrencyContext.tsx      ZERO
src/components/FxRef.tsx              ZERO
src/borsa/, src/lib/borsa/            ZERO (borsa_index motoru)
supabase/migrations/*                 ZERO
supabase/functions/*                  ZERO
src/lib/valuation/, ges-land/         ZERO
tailwind.config.js                    ZERO
11 useLocale() tüketici dosya         ZERO (regresyon riski yok)
```

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6462.16 KiB)
files generated  dist/sw.js + dist/workbox-9c35ba06.js
```
✅ **YEŞİL** (+3.38 KiB — RU/AR override + helper + Navbar/Footer 4 dil)

### Lint
- 5 dosya 0 error / 0 warning

### Git
- `safe-before-dil-faz0` (97d4852)
- `safe-after-dil-faz0` (bu commit)

### CLS
- Dil değişiminde anlık `lang+dir` update — layout shift YOK (font swap `display=swap` ile Inter'den AR'a yumuşak geçiş)
- Sayfa boyutu değişmedi (etiket sayısı aynı, sadece dil dropdown 2 → 4 buton — ufak)

### Regresyon
- TR seç → eskisi gibi, lang=tr, dir=ltr, mevcut çevirler, font Inter ✅
- EN seç → eskisi gibi, lang=en, dir=ltr, mevcut çevirler, font Inter ✅

---

## 8) Sonraki Fazlar (Master onayı bekliyor)

### FAZ 1 — Genişletme (orta vade)
| # | İş | Saat | Bağımlılık |
|---|---|---|---|
| 1 | messages.ts RU/AR tam çeviri (home + common — 415 satır) | 40-60 | Çevirmen |
| 2 | Çoğul kuralları (RU 4 form özellikle) | 5-10 | i18next yardımcı veya custom |
| 3 | Tarih/sayı format (Intl.DateTimeFormat) RU/AR locale | 5-10 | — |
| 4 | 5-10 kritik sayfa için RU/AR tam çeviri (Home + Pricing + Auction listele) | 20-30 | — |

### FAZ 2 — RTL CSS dönüşümü (uzun vade)
| # | İş | Saat | Risk |
|---|---|---|---|
| 1 | 359 fiziksel CSS → logical (`ml-` → `ms-`, vb.) toplu refactor | 100-150 | Orta (görsel regresyon) |
| 2 | AR ekran-ekran görsel doğrulama (Playwright + screenshot diff) | 20-30 | — |

### FAZ 3 — Yasal & SEO (gerekirse)
| # | İş | Saat | Risk |
|---|---|---|---|
| 1 | RU/AR yasal metinler (Sözleşme/Gizlilik/KVKK) | 20-40 + avukat | Hukuki |
| 2 | RU/AR SEO meta (hreflang, og:locale, structured data) | 10-20 | — |
| 3 | i18next migrate (sayfalar büyürse, lazy load gerekirse) | 4-8 | Yüksek (migration) |

---

## 9) Master için 3 KARAR

1. **Sıralama:** FAZ 1 mi (çeviri yaygın), FAZ 2 mi (RTL CSS düzgün), FAZ 3 mi (yasal) öncelik? Pazar hedefine göre değişir (RU pazarı yakın hedef ise FAZ 1 çeviri öncelik; AR pazarı için FAZ 2 RTL kritik).
2. **Çevirmen:** RU/AR profesyonel çevirmen mi (kalite), yoksa AI + insan review mi (hızlı, daha ucuz)?
3. **Yasal metinler:** RU/AR'da yasal metin **YASAK** mı (avukat onayı gelene kadar TR fallback?), yoksa AI çevirisi + "resmi olmayan çeviri, TR esas" disclaimer mi?

---

— **4 dil altyapısı kuruldu (TR/EN/RU/AR) · AR otomatik RTL + Noto Sans Arabic · 11 useLocale() tüketici dokunulmadı · Mevcut TR/EN %100 korundu (regresyon sıfır) · 4/4 PASS · 0 console hata · Çekirdek + i18n çevirisi 11 dosya korundu · Tam çeviri/CSS sonraki fazlar.**
🌐✅
