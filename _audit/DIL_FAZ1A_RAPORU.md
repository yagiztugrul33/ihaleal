# 🌐 ADIM 11 — Çok Dil FAZ 1-A: Navbar + Onboarding + Hero (Çekirdek UI Çevirisi)

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-faz1a`
**Doktrin:** DAR + derin. Sadece 3 alan, doğru/doğal/profesyonel RU/AR. Birebir değil, anlam çevirisi. Emin değilsen [REVIEW] işaretle. Çekirdeğe dokunma. Mevcut TR/EN bozma.

---

## ⚡ TEK-CÜMLELİK ÖZET

3 kritik alanda (Navbar + Onboarding + Ana Sayfa Hero) **4 dilde gerçek çeviri** + **terim sözlüğü** + **RTL bu 3 alanda düzgün** uygulandı; ADIM 10'da kurulan altyapı (`getMessagesFor` + `_mergeMessages`) **mekanizması değiştirilmeden** kullanıldı; `nav.borsaCta` + `onboarding.*` yeni key'leri tipli olarak `Messages`'a eklendi; `_ruOverrides` ve `_arOverrides` nav + home.terminal + onboarding tam çevirileriyle **zenginleştirildi**; **4 dil × 7 string = 28/28 Playwright PASS, 0 console hata her dilde, TR/EN regresyon SIFIR, AR dir=rtl + Noto Sans Arabic + ok aynalama** çalışıyor.

---

## 1) BLOK 1 — String Envanteri (3 alan)

### Navbar (`src/components/Navbar.tsx`)
| Key (öneri) | TR mevcut | EN mevcut | Konum | Hardcoded? |
|---|---|---|---|---|
| `nav.auctions` | "İhaleler" | "Auctions" | messages.ts | ❌ var |
| `nav.howItWorks` | "Nasıl Çalışır" | "How It Works" | messages.ts | ❌ var |
| `nav.services` | "Hizmetler" | "Services" | messages.ts | ❌ var |
| `nav.resources` | "Kaynaklar" | "Resources" | messages.ts | ❌ var |
| `nav.company` | "Kurumsal" | "Company" | messages.ts | ❌ var |
| `nav.gesLand` | "GES Arazi" | "GES Land" | messages.ts | ❌ var |
| `nav.valuation` | "Değerleme" | "Valuation" | messages.ts | ❌ var |
| `nav.researchHub` | "Araştırma Merkezi" | "Research Hub" | messages.ts | ❌ var |
| `nav.corporate` | "Kurumsal" | "Corporate" | messages.ts | ❌ var |
| `nav.faq` | "SSS" | "FAQ" | messages.ts | ❌ var |
| `nav.search` | "İhale ve mülk ara…" | "Search auctions, properties…" | messages.ts | ❌ var |
| `nav.logIn` | "Giriş" | "Log In" | messages.ts | ❌ var |
| `nav.signUp` | "Kayıt Ol" | "Sign Up" | messages.ts | ❌ var |
| `nav.openMenu` / `closeMenu` | "Menüyü aç" / "kapat" | "Open/Close menu" | messages.ts | ❌ var |
| `nav.langEn/Tr/Ru/Ar` | dil isimleri | dil isimleri | messages.ts | ❌ var |
| **`nav.borsaCta`** | "Borsaya Gir" | (yok → eklendi "Go to Exchange") | **Navbar:379, 421** | ✅ **HARDCODED** |

**Mega menü 3 kolon başlığı + 18 item** (Yatırımcı/Emlakçı/Müteahhit + alt link'ler) — bu adımda kapsam dışı (sonraki adım 11-B'de değerlendirilecek; çeviri için ürün ekibi katılımı gerekiyor).

### Onboarding (`src/pages/onboarding/FlowSelector.tsx`)
| Key (öneri) | TR mevcut | Konum | Hardcoded? |
|---|---|---|---|
| `onboarding.title` | "Hoş geldin!" | FlowSelector:106 | ✅ |
| `onboarding.subtitle` | "Nereden başlamak istersin?" | FlowSelector:109 | ✅ |
| `onboarding.back` | "Geri" | FlowSelector:97, 100 | ✅ |
| `onboarding.skip` | "Şimdilik geç →" | FlowSelector:152 | ✅ |
| `onboarding.skipNote` | "Bunu istediğin zaman değiştirebilirsin." | FlowSelector:154-156 | ✅ |
| `onboarding.discover.title/subtitle/cta` | "Keşfet" / ... | CHOICES[0] | ✅ |
| `onboarding.sell.title/subtitle/cta` | "Sat / İlan ver" / ... | CHOICES[1] | ✅ |
| `onboarding.buy.title/subtitle/cta` | "Al / Teklif ver" / ... | CHOICES[2] | ✅ |

**Sonuç:** Tüm onboarding metni TR hardcoded → key'lere taşındı + 4 dilde çevrildi.

### Ana Sayfa Hero (`src/components/cinematic/TerminalHero.tsx`)
Mevcut durum: zaten `useLocale().t.home.terminal.*` kullanıyor — **i18n tam bağlı**. Sadece RU/AR çevirisi ekleme gerekti.

| Key | TR mevcut | Konum | Hardcoded? |
|---|---|---|---|
| `home.terminal.eyebrow` | "İhaleal Terminal" | TerminalHero:45 → messages.ts:410 | ❌ var |
| `home.terminal.prompt` | "Size nasıl yardımcı olabiliriz?" | TerminalHero:46-49 | ❌ var |
| `home.terminal.askPlaceholder` | "Her şeyi sorun…" | TerminalHero:73 | ❌ var |
| `home.terminal.askSubmit` | "Sor" | TerminalHero:78 | ❌ var |
| `home.terminal.options.rent/sale/auction/launch` | "KİRALIK"/... | TerminalHero:21-24 | ❌ var |
| `home.terminal.borsaCta` | "Borsa terminaline geç →" | TerminalHero:97 | ❌ var |
| `home.terminal.aiUnavailable` | "AI asistanı şu an..." | TerminalHero:38 | ❌ var |
| `home.terminal.hints` (3 element) | TR hints | TerminalHero:87-89 | ❌ var |

**Sonuç:** TerminalHero zaten i18n entegre — yalnız RU/AR çevirileri eklendi.

---

## 2) BLOK 2 — Çeviri Sözlüğü (Terminoloji Tutarlılığı)

Sonraki FAZ 1 adımlarında (11-B/C/D/E) **MUTLAKA bu sözlüğe uy** — terim tutarlılığı = profesyonellik.

| Türkçe | İngilizce | Rusça | Arapça | Not |
|---|---|---|---|---|
| **İhale** | Auction | аукцион | مزاد | Çekirdek terim |
| **İhaleler** | Auctions | аукционы | المزادات | Çoğul |
| **Açık artırma** | Open auction | аукцион (открытые торги) | مزاد علني | İhale ile değişebilir |
| **Müzayede** | Live auction | прямые торги / аукцион | مزاد مباشر | İhale eşanlamlı |
| **Teklif** | Bid / Offer | ставка | عرض | Ortam bağlamlı |
| **Teklif ver** | Place bid | сделать ставку | تقديم عرض | Buton |
| **İlan** | Listing | объявление | إعلان | Çekirdek |
| **İlanlar** | Listings | объявления | إعلانات | Çoğul |
| **Keşfet** | Explore | исследовать | استكشاف | Onboarding CTA |
| **Sat / İlan ver** | Sell / List | Продать / разместить | بيع / نشر إعلان | Onboarding |
| **Al / Satın al** | Buy | купить | شراء | Onboarding |
| **Gayrimenkul** | Real estate | недвижимость | عقارات | Genel |
| **Fiyatlandırma** | Pricing | тарифы | الأسعار | (Sonraki adım) |
| **Giriş yap** | Log In | войти | تسجيل الدخول | Button |
| **Kayıt ol** | Sign Up | регистрация | إنشاء حساب | Butotn |
| **Borsa** | Exchange | биржа | البورصة | Marka konseptli |
| **Borsaya Gir** | Go to Exchange | Перейти на биржу | الذهاب إلى البورصة | Birincil CTA |
| **Borsa terminali** | Exchange terminal | терминал биржи | محطة البورصة | Hero CTA |
| **Değerleme** | Valuation | оценка | تقييم | Ürün |
| **Hoş geldin** | Welcome | Добро пожаловать | مرحباً | Onboarding |
| **Nereden başlamak istersin?** | Where to start? | С чего хотите начать? | من أين تريد أن تبدأ؟ | Onboarding |
| **Nasıl Çalışır** | How It Works | Как это работает | كيف يعمل | Sayfa |
| **Hizmetler** | Services | Услуги | الخدمات | Menü |
| **Kaynaklar** | Resources | Ресурсы | الموارد | Menü |
| **Şirket / Kurumsal** | Company / Corporate | Компания / Корпоративный | الشركة / قسم الشركات | Menü |
| **GES Arazi** | GES Land | Земля для СЭС | أراضي الطاقة الشمسية | Niş — GES = Güneş Enerji Santrali, RU=СЭС, AR=الطاقة الشمسية |
| **Araştırma Merkezi** | Research Hub | Центр исследований | مركز الأبحاث | Ürün |
| **SSS / FAQ** | FAQ | Частые вопросы (ЧаВо) | الأسئلة الشائعة | Sayfa |
| **Ara / Arama** | Search | Поиск | بحث | Placeholder |
| **Sor (AI)** | Ask | Спросить | اسأل | Buton |
| **Kiralık** | Rent | Аренда | للإيجار | Tip |
| **Satılık** | Sale | Продажа | للبيع | Tip |
| **Lansman** | Launch | Запуск | إطلاق | Tip |
| **Menüyü aç/kapat** | Open/Close menu | Открыть/Закрыть меню | فتح/إغلاق القائمة | A11y |
| **Geri** | Back | Назад | رجوع | Buton |
| **Şimdilik geç** | Skip for now | Пропустить | تخطّي الآن | Onboarding |

### [REVIEW] gereken çeviriler
Hiçbir [REVIEW] işareti gerekmedi — tüm çeviriler standart emlak/teknoloji terimleri. Native review sonradan kalite artırmak için yapılabilir (özellikle pazarlama tonu).

**Native review için öneriler (zorunlu değil):**
- RU: "ЧаВо" gayri resmi — "Частые вопросы" daha kurumsal (kullanılan budur)
- AR: "أراضي الطاقة الشمسية" "GES Arazi" için — TR pazarı "GES" kısaltmasını kullanır, AR'da "أراضي الطاقة الشمسية" (Güneş Enerjisi Arazileri) daha açıklayıcı
- AR onboarding tonu: "مرحباً بك" gayri resmi sıcaklık (TR "Hoş geldin" sıcaklığını koruyor — doğru)

---

## 3) BLOK 3 — Çeviriyi Uygula (uygulanan kod)

### 3.1 `messages.ts` — yeni tip + EN/TR + RU/AR override

```ts
// Yeni: NavMessages tipine borsaCta
borsaCta: string;

// Yeni: OnboardingMessages tipi (8 alan, 3 kart × 3 alt-alan)
export type OnboardingMessages = {
  title: string; subtitle: string; back: string; skip: string; skipNote: string;
  discover: { title; subtitle; cta };
  sell: { ... };
  buy: { ... };
};

// Messages tipine onboarding eklendi
export type Messages = { nav, home, common, onboarding };

// EN + TR'a nav.borsaCta + onboarding objesi (TR: "Hoş geldin!" / EN: "Welcome!" vb.)

// _ruOverrides ZENGİNLEŞTİRİLDİ:
//   - nav: gesLand/researchHub/corporate/borsaCta ek + tam çeviri
//   - home.terminal: eyebrow/prompt/options/borsaCta/aiUnavailable/hints
//   - onboarding: title/subtitle/back/skip + 3 kart

// _arOverrides aynı şekilde RU paralel
```

### 3.2 `Navbar.tsx` — 2 yerde hardcoded → t

```diff
-<Link to="/borsa">Borsaya Gir</Link>          (Desktop CTA, line 379)
+<Link to="/borsa">{n.borsaCta}</Link>

-<Link to="/borsa">Borsaya Gir</Link>          (Mobile CTA, line 421)
+<Link to="/borsa">{n.borsaCta}</Link>
```

### 3.3 `FlowSelector.tsx` — tüm metin t.onboarding'e bağlandı

- `useLocale()` import edildi
- `useMemo` ile CHOICES dizisini t.onboarding'den üret
- `<h1>{ob.title}</h1>`, `<p>{ob.subtitle}</p>`, `<span>{ob.back}</span>`, `<button>{ob.skip}</button>`, `<p>{ob.skipNote}</p>`
- `document.title` da `${ob.title} — ihaleal.com`
- **Mevcut logical CSS (text-start, ms-/me-, rtl:rotate-180) korundu** — bu sayfa zaten RTL hazır

### 3.4 TerminalHero — DOKUNULMADI
Hero bileşeni zaten `useLocale().t.home.terminal.*` kullanıyor. messages.ts'e RU/AR override ekleyince **otomatik** çalıştı. Kod değişmedi.

---

## 4) BLOK 4 — RTL Bu 3 Alanda (AR)

### Test sonucu (Playwright AR viewport)
- ✅ `<html dir="rtl">` set
- ✅ Navbar menü öğeleri sağdan akıyor (Tailwind logical: `gap-*`, `inline-flex`)
- ✅ Onboarding ok ikonu (→) AR'da ters dönüyor: `rtl:rotate-180` (line 138)
- ✅ Onboarding "geri" oku ters: `rtl:rotate-180` (line 99)
- ✅ Marka ismi `ihaleal.com` LTR olarak okunabiliyor (Latin marka aynalanmaz)
- ✅ Noto Sans Arabic yüklü: `html[lang="ar"] body { font-family: "Noto Sans Arabic", ... }`
- ✅ Onboarding kartlar grid: 1→2→3 kolon (sm→lg) — AR'da grid yönü doğru akıyor (browser native)

### Bu 3 alanda fiziksel CSS taraması
- **Navbar:** zaten çoğunlukla logical (`gap-*`, `inline-flex`, `justify-between`) — yeni eklenen `text-start` (ADIM 10'da değiştirildi)
- **Onboarding (FlowSelector):** zaten **tamamen logical** (`text-start`, `ms-2`, `gap-*`, `rtl:rotate-180`)
- **TerminalHero:** CSS class'lar `terminal-hero__*` ile özelleşmiş — bunlar `src/styles/` altında, çoğu kompozisyon (flex/grid) — AR'da büyük sorun yok (tam doğrulama için manuel görsel inceleme gerekir, sonraki FAZ 2)

### Dürüst not — sonraki faza
- 359 fiziksel CSS sitenin geri kalanında hâlâ var (bu 3 alan değil, ana içerik)
- AR seçilince site geri kalanı **bozulmaz** ama bazı kartlar/butonlar margin/padding sol-sağ ters görünebilir
- Bu **FAZ 2** kapsamı (toplu CSS dönüşümü, 100-150 saat)

---

## 5) BLOK 5 — Test (gerçek kanıt, Playwright 4 dil × 3 alan)

```json
{
  "tr": { "html_lang": "tr", "html_dir": "ltr", "nav_borsa_cta": true, "nav_login": true, "hero_borsa": true,
          "onboarding_title": true, "onboarding_discover": true, "onboarding_sell": true, "onboarding_buy": true, "errs": [] },
  "en": { "html_lang": "en", "html_dir": "ltr", ...7 string true..., "errs": [] },
  "ru": { "html_lang": "ru", "html_dir": "ltr", ...7 string true..., "errs": [] },
  "ar": { "html_lang": "ar", "html_dir": "rtl", ...7 string true..., "errs": [] }
}
```

### Test matrisi — 28/28 PASS

| Dil | lang | dir | Nav borsa CTA | Nav giriş | Hero borsa | Ob başlık | Ob 3 kart |
|---|---|---|---|---|---|---|---|
| TR | tr | ltr | ✅ Borsaya Gir | ✅ Giriş | ✅ Borsa terminaline geç | ✅ Hoş geldin | ✅ Keşfet/Sat/Al |
| EN | en | ltr | ✅ Go to Exchange | ✅ Log In | ✅ Go to exchange terminal | ✅ Welcome | ✅ Explore/Sell/Buy |
| RU | ru | ltr | ✅ Перейти на биржу | ✅ Войти | ✅ Перейти на терминал биржи | ✅ Добро пожаловать | ✅ Исследовать/Продать/Купить |
| AR | ar | **rtl** | ✅ الذهاب إلى البورصة | ✅ تسجيل الدخول | ✅ الانتقال إلى محطة البورصة | ✅ مرحباً | ✅ استكشاف/بيع/شراء |

**Console hataları:** 4 dil × 0 hata = **0 toplam** ✅
**Regresyon:** TR/EN aynı çevirler render ediliyor (eski mevcut çevirler korundu) ✅

### Screenshots
```
_audit/dil-faz1a/
├── _test.mjs
├── home-{tr,en,ru,ar}.png        (4 dil, anasayfa hero)
└── onboarding-{tr,en,ru,ar}.png  (4 dil, onboarding 3 kart)
```

### Build
```
PWA v1.3.0 — precache 299 entries (6466.32 KiB)  ← +4.16 KiB (overrides genişledi)
```
✅ **YEŞİL**

### Lint
- 3 dosya 0 error / 0 warning (messages.ts + Navbar.tsx + FlowSelector.tsx)

---

## 6) Dokunulan dosyalar

```
src/i18n/messages.ts                       (+97 / -5)
  - NavMessages tipine borsaCta
  - OnboardingMessages yeni tip (8 alan)
  - Messages.onboarding alanı
  - EN + TR onboarding objesi (24 string)
  - _ruOverrides + _arOverrides ZENGİN (nav 9 yeni + home.terminal komple + onboarding komple)

src/components/Navbar.tsx                  (+2 / -2)
  - 2 yerde "Borsaya Gir" → {n.borsaCta}

src/pages/onboarding/FlowSelector.tsx      (+22 / -16)
  - useLocale + useMemo entegrasyonu
  - CHOICES dizisi t.onboarding'den üretiliyor
  - Tüm hardcoded TR metin t.onboarding.* bağlı
  - document.title locale-aware
  - JSX aynı yapı, sadece string'ler t() ile

_audit/DIL_FAZ1A_RAPORU.md                 (+ YENİ kapsamlı rapor)
_audit/dil-faz1a/_test.mjs                 (+ YENİ test)
_audit/dil-faz1a/*.png                     (+ 8 ekran kanıt: 4 dil × 2 sayfa)
```

**Çekirdek dokunulmadı (git diff sıfır):**
```
src/lib/placeBid.ts                   ZERO
src/lib/fees.ts                       ZERO
src/contexts/CurrencyContext.tsx      ZERO
src/components/FxRef.tsx              ZERO
src/borsa/, src/lib/borsa/            ZERO
src/lib/valuation/, ges-land/, lib/mortgageCalc.ts  ZERO
supabase/migrations/, functions/      ZERO
tailwind.config.js                    ZERO
src/contexts/LocaleContext.tsx        ZERO (ADIM 10 mekanizması değişmedi)
src/components/cinematic/TerminalHero.tsx   ZERO (zaten i18n bağlıydı, otomatik aldı)
```

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6466.32 KiB)
files generated  dist/sw.js + dist/workbox-9c35ba06.js
```
✅ **YEŞİL** (+4.16 KiB — RU/AR override genişlemesi + onboarding tipi)

### Lint
- 3 dosya 0 error / 0 warning

### Git
- `safe-before-dil-faz1a` (2eac281)
- `safe-after-dil-faz1a` (bu commit)

### Regresyon — KANIT
- TR: nav "Borsaya Gir" + onboarding "Hoş geldin!" + hero "Borsa terminaline geç →" → **çalışıyor**
- EN: nav "Go to Exchange" (yeni TR/EN aynı pencerede) + "Welcome!" + "Go to exchange terminal →" → **çalışıyor**
- ADIM 10 4 dil dropdown mekanizması (Globe ikon + 4 buton + AR dir attr) → **bozulmadı**
- 11 mevcut `useLocale()` tüketicisi → **dokunulmadı**

---

## 8) Sonraki FAZ 1 Adımları (sıralı plan, Master onayı bekliyor)

### Hemen sıradaki (her biri ~3-6 saat)

| # | İş | Kapsam | Sözlük kullanım |
|---|---|---|---|
| **11-B** | Fiyatlandırma + Ödeme metinleri | `/fiyatlandirma`, `/komisyon`, `/odeme/*` — tier kartları, CTA'lar, dürüstlük etiketleri | "Fiyatlandırma"=тарифы/الأسعار, "Komisyon"=комиссия/عمولة |
| **11-C** | İlan detay sayfası | `AuctionDetail.tsx` — başlıklar, sticky kart, CTA'lar (Teklif/İletişim), AI rapor başlıkları | "Teklif ver"=сделать ставку/تقديم عرض, "İlan"=объявление/إعلان |
| **11-D** | Borsa terminal sayfaları | `BorsaPage`/`Portfolio`/`Watchlist`/`AssetDetail`/`DataAnalysis` — terminal UI metinleri | "Borsa"=биржа/البورصة, "Endeks"=индекс/مؤشر |
| **11-E** | Navbar mega menü + Footer detay + diğer kalan | 3 kolon başlığı + 18 item + footer link'leri | (Ürün adları çoğul) |

### FAZ 2 (uzun vade — toplu)

| # | İş | Saat | Risk |
|---|---|---|---|
| 1 | 359 fiziksel CSS → logical (ml-/mr-/pl-/pr- → ms-/me-/ps-/pe-) | 100-150 | Orta — görsel regresyon riski |
| 2 | AR ekran-ekran görsel doğrulama (Playwright screenshot diff) | 20-30 | — |

### FAZ 3 (yasal — avukat + sonra)

| # | İş | Saat | Risk |
|---|---|---|---|
| 1 | RU/AR yasal metinler (Sözleşme/Gizlilik/KVKK) | 20-40 + avukat | Yüksek (hukuki) |
| 2 | SEO hreflang + og:locale RU/AR + structured data | 10-20 | — |

---

## 9) Master için 3 KARAR

1. **Sonraki adım sırası:** 11-B (Fiyatlandırma) mı, 11-C (İlan detay) mı, 11-D (Borsa) mı önce? — pazar hedefine bağlı (RU/AR kullanıcı en çok hangi sayfayı kullanır?)
2. **Mega menü çevirisi:** 3 kolon başlığı + 18 item ürün adları çoğul (Yatırımcı/Emlakçı/Müteahhit + alt link'ler). Çevrilmeli mi, kalmalı mı (TR pazara özgü)? — RU/AR pazarında bunlar farklı segmentler.
3. **Native review:** RU/AR çevirilerini yerel ana dilde uzman gözden geçirir mi (kalite artar, ~$50-100/dil)?

---

— **3 alan × 4 dil = 28/28 PASS · TR/EN regresyon SIFIR · AR dir=rtl + Noto Sans Arabic + ok aynalama düzgün · Çekirdek + LocaleContext mekanizması korundu · TerminalHero hiç dokunulmadan otomatik çevrildi · Çeviri sözlüğü oluşturuldu (sonraki adımların temeli) · 0 console hata · Hiç [REVIEW] gerekmedi.**
🌐✅
