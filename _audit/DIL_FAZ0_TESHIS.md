# 🌐 ADIM 10 — Çok Dil Altyapısı FAZ 0 (Teşhis Raporu)

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-faz0`
**Doktrin:** Önce DERİN teşhis (sadece rapor), sonra A/B kararı + güvenli temel.

---

## 1) Mevcut Sistem (kanıt)

### `src/contexts/LocaleContext.tsx` (83 satır)
```ts
export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());
  const setLocale = useCallback((next) => { setLocaleState(next); localStorage.setItem(...); }, []);
  useEffect(() => { document.documentElement.lang = locale === "tr" ? "tr" : "en"; }, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t: messages[locale] }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): { locale, setLocale, t } { ... }
```

**Özellikler:**
- `Locale = "en" | "tr"` (2 dil)
- localStorage key: `ihaleal_locale`
- `document.documentElement.lang` set ediliyor
- **`document.documentElement.dir` SET EDİLMİYOR** — RTL mekanizması YOK
- `detectBrowserLocale()`: navigator.language → TR/EN

### `src/i18n/messages.ts` (415 satır)
```ts
export type Locale = "en" | "tr";
export type Messages = { nav, home, common };
export const messages: Record<Locale, Messages> = {
  en: { nav: {...}, home: {...}, common: {...} },
  tr: { nav: {...}, home: {...}, common: {...} },
};
```

**Yapı:** İç içe (nested) type-safe object. `t.nav.auctions`, `t.home.hero.titleLead` gibi tüketilir.

### Kullanım envanteri
- `useLocale()` kullanan dosya sayısı: **11 dosya**
- `useTranslation()` (i18next): **0 dosya**
- i18next paketi `package.json`: kurulu (^24.2.0 + react-i18next ^15.4.0) ama **HİÇ KULLANILMIYOR**

### Diller / Font
- Şu an: 2 dil (TR + EN)
- Font: `Inter` + `Plus Jakarta Sans` (Latin)
- Arapça font: YOK

---

## 2) Karar Noktası — A vs B

### Seçenek A — LocaleContext genişlet (RU/AR ekle)
**Artılar:**
- Mevcut 11 dosya (useLocale + t.x.y) **DOKUNULMADAN** çalışmaya devam eder
- 415 satır messages.ts korunur, sadece extend
- Migration riski sıfır
- ~1-2 saat iş

**Eksiler:**
- Çoğul kuralları (plurals) elle yönetilir
- Lazy load için manuel iş gerekir
- Sayfa-bazında namespace yok

### Seçenek B — i18next'e migrate et
**Artılar:**
- Endüstri standardı, çoğul kuralları, namespace, lazy load otomatik
- ICU MessageFormat desteği
- RTL hazır eklentiler

**Eksiler:**
- 11 dosya rewrite (`t.nav.x` → `t("nav.x")`)
- messages.ts yapısı flat key'lere dönüştürülür (iç içe → "nav.auctions": "Auctions")
- 415 satır iç içe yapı flat'lara açılır → manuel rewrite
- Test/regresyon **yüksek risk**
- 4-8 saat iş, hata yüzeyi büyük

### ✅ KARAR: A (Genişlet)
**Sebep:** Master kuralı "mevcut çalışan TR/EN'i BOZMA". A regresyon riskini ortadan kaldırır. Migration B sonraki faz olabilir (zaman + bant genişliği bol olduğunda). FAZ 0'ın amacı **temel + kanıt**, devrim değil.

---

## 3) RTL Mekanizması Önerisi

```ts
// LocaleContext useEffect içine:
document.documentElement.dir = LOCALE_DIRECTION[locale]; // "rtl" | "ltr"

// messages.ts:
export const LOCALE_DIRECTION: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr", tr: "ltr", ru: "ltr", ar: "rtl",
};
```

**Sonuç:** AR seçilince `<html dir="rtl">` set olur, Tailwind RTL variants (`rtl:` ön ek) otomatik tetiklenir.

### 359 fiziksel CSS sorunu — sonraki faza
- Mevcut kod tabanında `ml-/mr-/pl-/pr-/text-left/text-right` ~359 yer
- FAZ 0'da bu **dönüştürülmeyecek** (büyük iş, regresyon riski)
- Bunlar AR'da görsel olarak tam aynalanmaz (ana metin akışı doğru ama bazı margin/padding sol-sağ ters görünür)
- Dürüst not: "RTL **TEMEL** kuruldu, tam CSS dönüşümü FAZ 1'de (sayfa sayfa)"

---

## 4) Font Önerisi

**Seçilen:** `Noto Sans Arabic` (Google Fonts)
- Sebep: Türkiye'deki tüm Arapça konuşan kullanıcı için tutarlı, Latin Inter ile uyumlu, ücretsiz
- Alternatif: Cairo (daha modern), IBM Plex Arabic (daha kurumsal)
- Noto Sans daha geniş glyph coverage ve düşük dosya boyutu

**Yükleme:** `<link href="...Noto+Sans+Arabic...">` index.html + CSS `html[lang="ar"] body { font-family: "Noto Sans Arabic", ... }`

---

## 5) FAZ 0'da Güvenle Yapılacaklar

| # | İş | Dosya | Risk |
|---|---|---|---|
| 1 | `Locale` tipini 4 dile genişlet | `messages.ts` | Düşük |
| 2 | `NavMessages` tipine `langRu`, `langAr` ekle | `messages.ts` | Düşük |
| 3 | `LOCALE_DIRECTION` Record ekle | `messages.ts` | Düşük |
| 4 | RU/AR `PartialMessages` (sadece nav.*) | `messages.ts` | Düşük (TR fallback) |
| 5 | `getMessagesFor(locale)` helper (deepMerge cache'li) | `messages.ts` | Düşük |
| 6 | LocaleContext: dir set + 4 dil kabul | `LocaleContext.tsx` | Düşük |
| 7 | Navbar dropdown: 4 dil | `Navbar.tsx` | Düşük |
| 8 | Footer dil seçici: 4 dil | `Footer.tsx` | Düşük |
| 9 | `Noto Sans Arabic` Google Fonts link | `index.html` | Düşük |
| 10 | `html[lang="ar"] body { font-family: ... }` | `index.css` | Düşük |

## 6) FAZ 1+ (sonraki — Master onayı)

| # | İş | Saat | Risk |
|---|---|---|---|
| 1 | 359 fiziksel CSS → logical (`ml-` → `ms-`, vb.) toplu refactor | 100-150 | Orta |
| 2 | messages.ts'te RU/AR tam çeviri (415 satır iç içe) | 40-60 | Çeviri kalite |
| 3 | Yasal metinler RU/AR (Sözleşme/Gizlilik/KVKK) — **avukat onayı** | 20-40 + dış maliyet | Hukuki risk |
| 4 | Tarih/sayı format (Intl.DateTimeFormat, NumberFormat) RU/AR | 5-10 | Düşük |
| 5 | Çoğul kuralları (RU özellikle 4 form) | 5-10 | Orta |
| 6 | i18next'e migrate (gerçek scale gerekirse) | 4-8 | Yüksek |

---

— **Teşhis: KARAR A. LocaleContext genişletilecek. RTL dir + Arapça font + kanıt nav.* çevirileri. Tam çeviri/CSS sonraki fazda.**
🌐
