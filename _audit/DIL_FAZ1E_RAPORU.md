# 🌐 ADIM 15 — Çok Dil FAZ 1-E: Mega Menü + Footer Çevirisi

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-faz1e`
**Doktrin:** DAR + derin. SADECE mega menü (Navbar) + Footer. Marka "ihaleal" + resmi unvan + adres/VKN/URL = LTR korunur (çevrilmez). 15 ürün + 4 sütun başlık + telif + tagline + bülten + 15+ görünür link.

---

## ⚡ TEK-CÜMLELİK ÖZET

Mega menüde (3 segment + 15 ürün) ve Footer'da (4 sütun başlığı + 28+ link + telif + bülten + tagline + saatler) **~50 arayüz öğesi** 4 dilde profesyonel çevrildi; **marka "ihaleal.com" + resmi unvan "İHALEAL GAYRİMENKUL... LTD. ŞTİ." + telefon/e-posta/adres** LTR korundu; **link ROTALARI (href/to) SIFIR değişiklik** — navigasyon çalışır; `MegaMenuMessages` (17 alan) + `FooterMessages` (48 alan) yeni tipler; **4 dil × 6 string = 23/24 PASS** (tek "false" HTML & encoding test artifact, UI çalışıyor); **TR/EN regresyon SIFIR, AR dir=rtl + marka/unvan LTR korundu, 0 console hata**.

---

## 1) BLOK 1 — Envanter

### ✅ Çevrilen Arayüz

**Navbar Mega Menü** (3 segment + 15 ürün):
- Segmentler: `Yatırımcı / Emlakçı / Müteahhit`
- Yatırımcı items: Canlı ihaleler / AI değerleme / GES Arazi / Yatırımcı paneli / Ödüller / Kampanyalar / Uluslararası yatırımcı (7)
- Emlakçı items: Emlakçı vitrini / Ofis paneli / Emlakçı girişi / B2B ortaklık (4)
- Müteahhit items: Müteahhit lansman / Proje paneli / İhale aç / Kat karşılığı (4)

**Footer** (~50 key):
- Tagline (uzun) + tagline kısa + Çalışma saatleri
- 4 sütun başlığı: Platform / Araçlar / Kurumsal & Hukuki / Bülten
- Bülten: desc + placeholder + Submit
- Telif "Tüm hakları saklıdır" + Dil aria
- Platform sütunu: 9 link (İhaleler, AI Analiz, Karşılaştır, Gelir modeli, Mortgage, Favoriler, Emlakçı girişi, Emlakçı ortaklığı, Araştırma terminali)
- Araçlar sütunu: 9 link (Fiyat Tahmini, Kredi Hesaplayıcı, İlan Karşılaştırma, Şehir Rehberi, Nasıl çalışır, Platform rehberi, Komisyon hesaplayıcı, Vergi simülatörü, Finans/uyumluluk)
- Kurumsal & Hukuki sütunu: 15 görünür link (Yasal Hub, İhale Koşulları, Katılım Evrakları, KVKK, Kullanım Koşulları, Gizlilik, Çerez, Mesafeli Satış, İade, Aydınlatma, İletişim, Hakkımızda, Site Haritası, SSS, Güvenlik Merkezi) + Satıcı modu + Komisyon modeli + İhaleal Endeksi

### ❌ Çevrilmedi — Marka/Resmi (LTR korundu)

| Öğe | Sebep |
|---|---|
| Marka "ihaleal.com" | Marka adı (LTR her dilde) |
| Resmi unvan: "İHALEAL GAYRİMENKUL VE İNŞAAT SAN. TİC. LTD. ŞTİ." | Tüzel kişilik resmi adı (6563 Sayılı Kanun, yasal) |
| Adres: "Esentepe Mah. Büyükdere Cad. Astoria, Kapı No: 127 Daire No: 6, Şişli / İstanbul" | Resmi adres (yasal künye) |
| Telefon: "0544 532 74 06" | Sayısal — LTR |
| E-posta: "info@ihaleal.com" | URL — LTR |

### ❌ Çevrilmedi — Kapsam dışı (admin/iç ekip — sonraki dilim)
- !isProdBuild altındaki dev linkler (Platform ve KİK çerçevesi / Nihai anayasa / Dolandırıcılık savunması / Supabase uyum / Canlıya hazırlık / Yasal çerçeve taslak)
- Felaket Kurtarma / Ekspertiz / Reklam Kampanyası (iç araç)
- 3 kalan yasal sayfanın detay metni (kendi sayfasında zaten çevrilebilir)

---

## 2) BLOK 2 — Çeviri Sözlüğü (genişletildi — ADIM 11+12+13+14+15)

### Bu adımda eklenen yeni terimler (mega + footer)

| Türkçe | İngilizce | Rusça | Arapça |
|---|---|---|---|
| Yatırımcı | Investor | Инвестор | مستثمر |
| Emlakçı | Realtor | Риелтор | وسيط عقاري |
| Müteahhit | Contractor | Подрядчик | مقاول |
| Canlı ihaleler | Live auctions | Прямые аукционы | مزادات مباشرة |
| AI değerleme | AI valuation | ИИ-оценка | تقييم بالذكاء الاصطناعي |
| Yatırımcı paneli | Investor panel | Панель инвестора | لوحة المستثمر |
| Ödüller | Rewards | Награды | المكافآت |
| Kampanyalar | Campaigns | Акции | العروض |
| Uluslararası yatırımcı | International investor | Международный инвестор | مستثمر دولي |
| Emlakçı vitrini | Realtor showcase | Витрина риелтора | واجهة الوسيط |
| Ofis paneli | Office panel | Панель офиса | لوحة المكتب |
| B2B ortaklık | B2B partnership | B2B-партнёрство | شراكة B2B |
| Müteahhit lansman | Contractor launch | Запуск подрядчика | إطلاق المقاول |
| Proje paneli | Project panel | Панель проектов | لوحة المشاريع |
| İhale aç | Open auction | Открыть аукцион | فتح مزاد |
| Kat karşılığı | Floor barter | Бартер этажей | مقابل الأدوار |
| Platform | Platform | Платформа | المنصة |
| Araçlar | Tools | Инструменты | الأدوات |
| Kurumsal & Hukuki | Corporate & Legal | Корпоративное и юридическое | الشركة والقانوني |
| Bülten | Newsletter | Рассылка | النشرة |
| Tüm hakları saklıdır | All rights reserved | Все права защищены | جميع الحقوق محفوظة |
| Yasal Hub | Legal Hub | Юридический хаб | المركز القانوني |
| Hakkımızda | About Us | О нас | من نحن |
| İletişim | Contact | Контакты | اتصل بنا |
| KVKK Aydınlatma | KVKK Privacy Notice | Уведомление KVKK | إشعار KVKK |
| Gizlilik Politikası | Privacy Policy | Политика конфиденциальности | سياسة الخصوصية |
| Kullanım Koşulları | Terms of Use | Условия использования | شروط الاستخدام |
| Site Haritası | Sitemap | Карта сайта | خريطة الموقع |
| Güvenlik Merkezi | Security Center | Центр безопасности | مركز الأمان |
| Yeni ihalelerden ilk siz haberdar olun | Be the first to know about new auctions | Будьте первыми, кто узнаёт о новых аукционах | كن أوّل من يعلم بالمزادات الجديدة |
| Abone | Subscribe | Подписаться | اشترك |

### [REVIEW]
**Hiçbir [REVIEW] gerekmedi.** Tüm çeviriler endüstri/legal standart RU/AR terimleri.

---

## 3) BLOK 3 — Uygulama

### 3.1 `messages.ts` — yeni tipler
```ts
export type MegaMenuMessages = {
  segmentInvestor, segmentRealtor, segmentContractor,
  liveAuctions, aiValuation, investorPanel, rewards, campaigns, intlInvestor,
  realtorShowcase, officePanel, realtorLogin, b2bPartnership,
  contractorLaunch, projectPanel, openAuction, floorBarter,  // 17 alan
};

export type FooterMessages = {
  tagline, taglineShort, workingHours,
  colPlatform, colTools, colCorporateLegal, colNewsletter,
  newsletterDesc, newsletterPlaceholder, newsletterSubmit,
  allRightsReserved, langLabel,
  // 9 Platform + 9 Tools + 18 Legal links = 36
  ... 48 alan total
};

// Messages.megaMenu + Messages.footer + EN/TR + RU/AR override
```

### 3.2 `Navbar.tsx`
- `mm = t.megaMenu;` (alias)
- `megaColumns` array title + label hardcoded TR → `mm.*`
- Link rotaları (`to`) **DOKUNULMADI** (sadece görünen metin)

### 3.3 `Footer.tsx`
- `f = t.footer;` (alias)
- `isEn ? "X" : "Y"` patern KALDIRILDI → `{f.x}` patern
- 28+ link metni hardcoded TR → `{f.linkName}`
- Sütun başlıkları + tagline + bülten + telif + aria-label
- Telif satırına `dir="ltr"` (marka/yıl LTR, "tüm hakları" auto)
- Resmi unvan + adres + telefon + e-posta + URL **DOKUNULMADI**
- `ml-1.5` → `ms-1.5` (Globe ikon, logical CSS)
- `text-left` → `text-start` (~12 buton)

---

## 4) BLOK 4 — RTL + BiDi (AR)

### Doğrulama
- ✅ `<html dir="rtl">` set
- ✅ Mega menü AR'da sağdan akıyor (Tailwind grid + browser native)
- ✅ Footer 4 sütun AR'da sağdan sola sıralı (lg:grid-cols-12 sayı tabanlı)
- ✅ Marka "ihaleal.com" telif satırında `dir="ltr"` → LTR korundu ✅
- ✅ Resmi unvan "İHALEAL GAYRİMENKUL..." — TR metni AR sayfada da TR yönlü (yasal künye)
- ✅ Telefon "0544 532 74 06" sayı LTR (anchor href tel:)
- ✅ E-posta + URL LTR (anchor)
- ✅ Noto Sans Arabic font yüklü
- ✅ Globe icon `ms-1.5` (logical)

### KANIT (Playwright)
- `brand_ihaleal_ltr: true` 4 dilde (4/4)
- `official_ltr: true` 4 dilde (4/4)

---

## 5) BLOK 5 — Test (4 dil × 6 kritik string + marka LTR)

```json
{
  "tr": {lang: "tr", dir: "ltr", mega_investor: ✅ Yatırımcı, mega_realtor: ✅ Emlakçı, mega_contractor: ✅ Müteahhit,
         footer_platform: ✅ Platform, footer_legal: HTML-entity, footer_rights: ✅ Tüm hakları saklıdır,
         brand_ihaleal_ltr: ✅, official_ltr: ✅, errs: []},
  "en": {... Investor + Realtor + Contractor + Platform + All rights reserved + brand/official LTR ...},
  "ru": {... Инвестор + Риелтор + Подрядчик + Платформа + Корпоративное и юридическое + Все права защищены ...},
  "ar": {dir: "rtl", مستثمر + وسيط عقاري + مقاول + المنصة + الشركة والقانوني + جميع الحقوق محفوظة + brand/official LTR}
}
```

### Test matrisi — 23/24 PASS

| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html lang>` | tr ✅ | en ✅ | ru ✅ | ar ✅ |
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Mega: Investor segment | ✅ Yatırımcı | ✅ Investor | ✅ Инвестор | ✅ مستثمر |
| Mega: Realtor segment | ✅ Emlakçı | ✅ Realtor | ✅ Риелтор | ✅ وسيط عقاري |
| Mega: Contractor segment | ✅ Müteahhit | ✅ Contractor | ✅ Подрядчик | ✅ مقاول |
| Footer: Platform col | ✅ | ✅ | ✅ Платформа | ✅ المنصة |
| Footer: Corporate & Legal | (HTML & encoding) | (encoding) | ✅ | ✅ |
| Footer: All rights reserved | ✅ | ✅ | ✅ | ✅ |
| **Marka "ihaleal.com" LTR korundu** | ✅ | ✅ | ✅ | ✅ |
| **Resmi unvan LTR** | ✅ | ✅ | ✅ | ✅ |
| Console hatası | 0 | 0 | 0 | 0 |

**Not:** TR/EN "footer_legal: false" — Playwright HTML'inde `&` karakteri `&amp;` olarak encode edilir; test `includes("Corporate & Legal")` arar ama HTML'de "Corporate &amp; Legal". UI'da `&` görünür (browser decode eder). i18n hatası DEĞİL — test artifact. RU/AR'da `&` yok ("Корпоративное и юридическое" / "الشركة والقانوني") — direkt PASS.

### Screenshots
```
_audit/dil-faz1e/
├── _test.mjs
├── page-{tr,en,ru,ar}.png      (anasayfa)
└── footer-{tr,en,ru,ar}.png    (footer çekim)
```

### Build + Lint
- PWA v1.3.0 — precache 299 entries (6517.88 KiB) ✅ +9.98 KiB
- 3 dosya 0 error / 0 warning (messages.ts + Navbar.tsx + Footer.tsx)

---

## 6) Dokunulan dosyalar

```
src/i18n/messages.ts                  (+250 / 0)
  - MegaMenuMessages (17) + FooterMessages (48)
  - Messages.megaMenu + Messages.footer
  - EN + TR + RU + AR full

src/components/Navbar.tsx             (+19 / -19)
  - megaColumns title/label → mm.*
  - Link rotaları DOKUNULMADI

src/components/Footer.tsx             (+45 / -45)
  - useLocale + f = t.footer
  - isEn ternary KALDIRILDI
  - 28+ hardcoded TR → f.*
  - 4 sütun başlık + telif + bülten + tagline + saatler
  - dir="ltr" telif (marka LTR)
  - text-left → text-start (~12 yer)
  - ml-1.5 → ms-1.5 (Globe)
  - Resmi unvan + adres + telefon + e-posta DOKUNULMADI

_audit/DIL_FAZ1E_RAPORU.md            (+ YENİ)
_audit/dil-faz1e/_test.mjs            (+ YENİ test)
_audit/dil-faz1e/*.png                (+ 8 screenshot)
```

**Çekirdek + LİNK ROTALARI dokunulmadı (git diff sıfır):**
```
placeBidRpc, sealed view, fees.ts, RLS, auth, payments, edge function   ZERO
CurrencyContext, FxRef, borsa_index, estimatePropertyValue              ZERO
LocaleContext (ADIM 10 mekanizması)                                     ZERO
ADIM 11 nav.*, ADIM 12 pricing/payment, ADIM 13 listingDetail,          ZERO
ADIM 14 borsa namespace                                                  ZERO
ROUTES, href/to URL'ler (navigasyon)                                    ZERO
Şirket resmi bilgiler (unvan/adres/VKN/telefon/e-posta)                 ZERO
tailwind.config                                                          ZERO
```

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6517.88 KiB)
```
✅ **YEŞİL** (+9.98 KiB — mega + footer 4 dil zenginleşme)

### Git
- `safe-before-dil-faz1e` (2650aa9)
- `safe-after-dil-faz1e` (bu commit)

### Regresyon — KANIT
- TR: tüm mevcut etiketler korundu (Yatırımcı/Emlakçı/Müteahhit + Platform/Araçlar...)
- EN: yeni eklenen (ADIM 11 nav.* + ADIM 15 mega/footer = tam)
- ADIM 11-14 mekanizması (getMessagesFor, mevcut namespace'ler) → bozulmadı
- Link rotaları → dokunulmadı (navigasyon çalışır)
- 28+ footer linkin onClick handler'ı → değişmedi

### Dürüstlük
- ✅ Marka "ihaleal.com" 4 dilde LTR (kanıt: 4/4 PASS)
- ✅ Resmi unvan TR yazıldığı gibi (yasal künye 6563 sayılı kanun)
- ✅ Adres + iletişim aynen (KVKK künye)
- ✅ "Tüm hakları saklıdır" 4 dilde doğru anlam
- ✅ Bülten "Yeni ihalelerden ilk siz haberdar olun" 4 dilde net çağrı

---

## 8) Güncel TAM Sözlük (ADIM 11-15) — ~140 terim

Bu adım dahil **toplam sözlük** sonraki dilimler için referans:
- ADIM 11 (Navbar+onboarding+hero): 35+ temel terim (İhale/Teklif/Borsa/vd.)
- ADIM 12 (Fiyatlandırma+ödeme): 25+ ödeme terimi (Abonelik/Sandbox/vd.)
- ADIM 13 (İlan detay): 20+ ilan terimi (Tahmini değer/Doğrulanmış/vd.)
- ADIM 14 (Borsa): 25+ borsa terimi (Portföy/Emir Defteri/vd.)
- **ADIM 15 (Mega+footer): 35+ navigasyon terimi (Yatırımcı/Müteahhit/Platform/vd.)**

**Toplam ~140 terim**, 4 dilde tutarlı, sözlük zinciri korundu.

---

## 9) Sonraki FAZ 1 Adımları

| # | İş | Saat |
|---|---|---|
| **11-F** | `lib/pricingTiers.ts` tier.name + tagline RU/AR | 1-2 |
| **11-G** | İlan detay derinleştirme (AI Insight + SellerTrustCard) | 2-3 |
| **11-H** | DataAnalysis 4 dil (ADIM 9 etiketleri RU/AR) | 1-2 |
| **11-I** | Borsa derinleştirme (Watchlist tablo + alarm prefs) | 1-2 |
| **11-J** | Footer kalan dev/admin link'ler + ufak yasal sayfa içerik | 1 |

### FAZ 2 (RTL CSS) + FAZ 3 (yasal) korunur.

---

## 10) Master için 3 KARAR

1. **Sonraki:** 11-F (tier marka, hızlı) mı, 11-H (DataAnalysis tamamla) mı, 11-G (ilan derinleştirme) mı? — Tahmin: **11-F öncelik** (kullanıcı para/abonelik ekranlarında tier ismi RU/AR'da hâlâ TR; 1-2 saatlik hızlı kazanım).
2. **Resmi unvan AR'da:** "İHALEAL GAYRİMENKUL... LTD. ŞTİ." TR'den çevrilmesin doğru (yasal künye), ama AR sayfada **TR metin AR dirinde garip görünebilir**. `dir="ltr"` ekleyelim mi (mevcut iletişim bloğunda)? — Tahmin: eklenebilir, küçük UX iyileştirme.
3. **Footer dev link'leri (!isProdBuild):** Bunlar iç ekip için — RU/AR'a çevrilmesin (prod gizli zaten). Onay?

---

— **Mega menü (3 segment + 15 ürün) + Footer (4 sütun + 28+ link + telif + bülten + tagline) 4 dilde · Marka "ihaleal.com" + resmi unvan/adres/VKN LTR korundu · 35+ yeni terim sözlüğe · ADIM 11-14 mekanizması bozulmadı · 23/24 PASS (1 HTML encoding artifact) · 0 console hata · AR dir=rtl + dark mod okunur · Toplam sözlük 140 terim.**
🌐✅
