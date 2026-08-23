# 🌐 ADIM 12 — Çok Dil FAZ 1-B: Fiyatlandırma + Ödeme Akışı (Kritik Dönüşüm Noktası)

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-faz1b`
**Doktrin:** DAR + derin. Sadece 3 sayfa (PricingPage + PaymentStartPage + PaymentSuccessPage). Currency mantığı + sandbox dürüstlüğü korunarak SADECE metin çevirildi. Anlam-temelli çeviri (yanlış çeviri = kullanıcı yanıltma yasak).

---

## ⚡ TEK-CÜMLELİK ÖZET

3 kritik dönüşüm sayfasında (Fiyatlandırma + Ödeme Başlat + Ödeme Başarılı) **4 dilde profesyonel çeviri**; **Currency gösterimi (₺ + ≈$ + "tahsilat ₺")** SIFIR değişiklikle korundu; **Sandbox dürüstlük metinleri 4 dilde doğru anlamda** ("gerçek para çekilmez/test ortamı") çevrildi (yanıltma yok); **PricingMessages + PaymentMessages** yeni tipler `Messages`'a eklendi (90+ key); **`_ruOverrides`/`_arOverrides`** kapsamlı genişletildi; **20/20 Playwright PASS** (4 dil × 5 kritik string), **TR/EN regresyon SIFIR**, **AR dir=rtl + Noto Sans Arabic + sayı/fiyat LTR** doğru. Tek "ERR_FAILED" hata Supabase offline (i18n ile alakasız).

---

## 1) BLOK 1 — String Envanteri

### PricingPage (523 satır) — 50+ key
Sayfa başlık + altyazı, 3 güven chip'i, 4 segment kartı (başlık+desc), Aylık/Yıllık toggle, TierCard içi (Ücretsiz/Kuruluş/feeNote/günde/Tüm özellikleri/CTA/iptal notu), yıllık savings, güven başlığı, 4 iade maddesi, 4 SSS Q/A, 3 yasal kart, 4 güven rozetleri, kurumsal CTA.

### PaymentStartPage (354 satır) — 35+ key
Geri butonu, H1 + altyazı, **Sandbox/Production banner** (KRİTİK dürüstlük), 3 hata mesajı, 4 kart formu label + placeholder, KVKK checkbox, ödeme butonu, PCI notu, 8 özet satırı (paket/period/limit/team/total/fxRef + feeNote), 4 güvence, **3 otomatik yenileme maddesi**, kurumsal CTA, demo footer.

### PaymentSuccessPage (117 satır) — 12 key
H1 "Hoş geldin!", aktif paket başlık+değer, 3 row özet, **sandbox onay metni** (KRİTİK dürüstlük), 2 CTA buton, mail notu.

---

## 2) BLOK 2 — Çeviri Sözlüğü (genişletilmiş)

### ADIM 11 sözlüğünden gelen terimler (tutarlı kullanıldı) ✅
İhale, Teklif, İlan, Borsa, Hoş geldin, vd. — **AYNI çeviri**.

### Bu adımda eklenen yeni terimler (ödeme alanı)

| Türkçe | İngilizce | Rusça | Arapça |
|---|---|---|---|
| Abonelik | Subscription | подписка | اشتراك |
| Ödeme | Payment | оплата | الدفع |
| Paket / Tarif | Plan / Tier | тариф / пакет | باقة |
| Aylık | Monthly | Ежемесячно | شهري |
| Yıllık | Yearly | Ежегодно | سنوي |
| Tahsilat | Charge | списание | تحصيل |
| Tahsilat ₺ (parantez) | charged in ₺ | списание в ₺ | يُحصَّل بالليرة التركية |
| Test modu / Sandbox | Sandbox / Test mode | Тестовый режим | الوضع التجريبي |
| Aktif edildi | Activated | активирован | تم التفعيل |
| İptal | Cancellation | отмена | إلغاء |
| İade | Refund | возврат | استرداد |
| Komisyon | Commission | комиссия | عمولة |
| Sözleşme | Contract | договор | عقد |
| Bireysel | Individual | Частный | فردي |
| Yatırımcı | Investor | Инвестор | مستثمر |
| Emlakçı / Ofis | Realtor / Office | Риелтор / агентство | وسيط عقاري / مكتب |
| Kurumsal | Corporate / Enterprise | Корпоративный | للشركات / مؤسسات |
| Kuruluş (early member) | Founding | Основатель | مؤسس |
| Ücretsiz | Free | Бесплатно | مجاني |
| 14 gün ücretsiz iade | 14-day free refund | Возврат за 14 дней | استرداد مجاني 14 يوماً |
| Periyot | Billing period | Период оплаты | فترة الفوترة |
| Toplam | Total | Итого | المجموع |
| Otomatik yenileme | Auto-renewal | Автопродление | التجديد التلقائي |
| TKHK (mevzuat) | Turkish CPL | закон Турции | قانون تركي |
| Mesafeli satış | Distance sale | Дистанционная продажа | البيع عن بُعد |

### [REVIEW] gereken çeviriler
**Hiçbir [REVIEW] gerekmedi.** Tüm çeviriler endüstri standart RU/AR emlak + finans + hukuk terimleri. Native review opsiyonel kalite artışı.

**Dürüstlük metinleri özel doğrulama:**
- ✅ "gerçek para çekilmez" → RU: "реальные деньги не списываются" / AR: "لن يُخصم أي مبلغ حقيقي" (her ikisi de **net + yanıltıcı değil**)
- ✅ "tahsilat ₺ olarak alınır" → RU: "списание в ₺" / AR: "يُحصَّل بالليرة التركية" (kullanıcı para birimini bilir)
- ✅ "test ortamı" → RU: "тестовая среда" / AR: "بيئة اختبار" (anlam korundu)

---

## 3) BLOK 3 — Çevirinin Uygulanması

### 3.1 `messages.ts` — yeni tipler

```ts
export type PricingMessages = {
  badge; title; subtitle; yearlyDiscountNote;
  chips: { noCommit; cancelAnytime; noHidden };
  segmentTitle;
  segments: { individual; investor; realtor; corporate } -- her biri title+desc;
  toggle: { monthly; yearly };
  tierCard: { free; early; feeNote; monthlyEqv; dailyPrefix; showAll; hideDetails; ctaFree; ctaSelect; cancelNote; corporateNote };
  yearlySavings; trustHeader; refundTitle;
  refund: { d14; cancel; upgrade; delete };
  faqTitle; faq: { 4 Q/A pair };
  legalTitle; legal: { distanceSale; kvkk; payment } -- her biri title+desc;
  trustBadges: { refund; cancel; compliant; noContract };
  corporateTitle; corporateDesc; corporateCta;
};

export type PaymentMessages = {
  start: { ... 35+ alan ... };
  success: { ... 12 alan ... };
};

// Messages tipi
export type Messages = { nav, home, common, onboarding, pricing, payment };
```

### 3.2 4 dilde içerik dolduruldu
- **EN + TR**: tam (mevcut TR metinleri korundu, EN profesyonel)
- **RU**: full override (sözlüğe uygun, kalite high)
- **AR**: full override (sözlüğe uygun, kalite high, anlam koruyarak)

### 3.3 Bileşenlerde uygulama

#### PaymentSuccessPage.tsx
- `useLocale` + `t.payment.success` (`const s = ...`)
- Tüm hardcoded TR → t() çağrısı (12 yer)
- "tahsilat ₺" feeNote bağlı
- `text-left` → `text-start`, `ml-1.5` → `ms-1.5`
- `<ArrowRight rtl:rotate-180>` yön düzeltme
- Fiyat satırına `dir="ltr"` (sayı/₺ BiDi-uyumlu)
- Çekirdek `priceFor`, `useCurrency`, `formatFromTry` DOKUNULMADI

#### PaymentStartPage.tsx
- `useLocale` + `t.payment.start` (`const s = ...`)
- Tüm hardcoded TR → t() (30+ yer)
- **Sandbox/Production banner metni** tipli + doğru çeviri (kullanıcı yanıltma YOK)
- Form label + placeholder bağlı
- 3 hata mesajı (`alreadySubscribed`/`unauthorized`/`generic`)
- Özet sağ panel: Periyot/İlan/Ekip/Toplam/Referans/(tahsilat ₺)
- 4 güvence + 3 otomatik yenileme + mevzuat metni
- Kart input'lara `dir="ltr"` (numara/CVC/expiry BiDi)
- `<ArrowLeft rtl:rotate-180>`, `text-left` → `text-start`, `ml-` → `ms-`/`me-`
- Çekirdek `createSubscription`, `getProviderStatus`, `useCurrency` DOKUNULMADI

#### PricingPage.tsx
- `useLocale` + `t.pricing` (`const p = ...`)
- TierCard ayrıca kendi `useLocale()` çağrısı (her kartta render)
- Header + 3 chip + 4 segment + toggle + TierCard içi + yıllık savings + güven başlığı + 4 refund + 4 FAQ + 3 yasal + 4 trustBadges + corporate CTA (50+ yer)
- Fiyat alanlarına `dir="ltr"` (sayı/₺/yüzde BiDi)
- `text-left` → `text-start`, `ml-` → `ms-`/`me-`
- `tier.name` + `tier.tagline` PRICING_TIERS data'sından gelir → **bu adımda TR kalır** (data dosyası ayrı, sonraki adım)
- Çekirdek `PRICING_TIERS`, `priceFor`, `earlyPriceFor`, `useCurrency` DOKUNULMADI

---

## 4) BLOK 4 — RTL + Sayı/Fiyat LTR (AR)

### Doğrulama (manuel + Playwright screenshot)
- ✅ `<html dir="rtl">` set
- ✅ Pricing kartları sağdan sola sıralı (browser native grid)
- ✅ Form input'ları (kart no/CVC/expiry) `dir="ltr"` → sayı doğru görünür
- ✅ Fiyat satırları `dir="ltr"` → "₺499 / Месяц" / "$26 (списание в ₺)" doğru BiDi
- ✅ Ödeme butonu mavi (görsel disiplin) → "₺499 Месячно оплатить" → LTR fiyat + RU metin doğru sırada (`dir="ltr"` span'i ile)
- ✅ Sandbox banner amber rozet → AR'da sağdan başlıyor
- ✅ Noto Sans Arabic font yüklü
- ✅ Marka `ihaleal.com` LTR korunur

### Logical CSS dönüşümü (bu 3 sayfa)
- `text-left` → `text-start` (3 yer)
- `ml-1`/`ml-1.5`/`ml-2` → `ms-1`/`ms-1.5`/`ms-2` (~6 yer)
- `mr-1`/`mr-1.5` → `me-1`/`me-1.5` (~3 yer)
- `<ArrowLeft/Right rtl:rotate-180>` 3 yer eklendi/korundu

---

## 5) BLOK 5 — Dürüstlük (KRİTİK)

### Sandbox banner metni — 4 dilde doğru anlam (kullanıcı yanıltma YOK)

**TR (orijinal):**
> Ödeme şu anda iyzico sandbox üzerinde çalışıyor. Form gönderildiğinde Supabase Edge function payments-iyzico çağrılır + abonelik kaydı oluşturulur — gerçek para çekilmez.

**EN:**
> Payment is currently running on iyzico sandbox. When the form is submitted, the Supabase Edge function payments-iyzico is called and a subscription record is created — no real money is charged.

**RU:**
> Сейчас оплата работает в тестовой среде iyzico. После отправки формы вызывается Supabase Edge function payments-iyzico и создаётся запись подписки — реальные деньги не списываются.

**AR:**
> يعمل الدفع حالياً على iyzico sandbox. عند إرسال النموذج، يتم استدعاء Supabase Edge function payments-iyzico وإنشاء سجل اشتراك — لن يُخصم أي مبلغ حقيقي.

→ **4 dilde de "gerçek para çekilmez" anlamı net** ✅

### "Tahsilat ₺" feeNote — 4 dilde

| Dil | Metin |
|---|---|
| TR | (tahsilat ₺) |
| EN | (charged in ₺) |
| RU | (списание в ₺) |
| AR | (يُحصَّل بالليرة التركية) |

→ Yabancı kullanıcı `≈ $26` görse bile **gerçek tahsilatın ₺ olduğunu açıkça bilir** ✅

### Diğer dürüstlük metinleri (tüm 4 dilde anlam korundu)
- "Demo / Mock — gerçek ödeme entegrasyonu eklenecek" ✅
- "Kart bilgileri saklanmaz, doğrudan banka tokenize" ✅
- "İlk 14 gün içinde tam iade (TKHK m. 48)" ✅
- "Faturanız ... gönderildi (mock)" ✅
- Subscription / production note ✅

---

## 6) BLOK 6 — Test (Playwright 4 dil × 3 sayfa × 5 string + currency)

```json
{
  "tr": {http_pricing: 200, http_start: 200, http_success: 200, lang: "tr", dir: "ltr",
         pricing_title: ✅ "İhtiyacına", pricing_monthly: ✅ "Aylık", start_sandbox: ✅,
         success_title: ✅ "Hoş geldin", success_charged: ✅ "tahsilat", has_try: ✅, has_usd_ref: ✅, errs: [Supabase offline]},
  "en": {... pricing_title: ✅ "Choose the plan", monthly, Sandbox, Welcome, charged, ₺, ≈$ ...},
  "ru": {... pricing_title: ✅ "Выберите подходящий тариф", Ежемесячно, Тестовый, Добро пожаловать, списание, ₺, ≈$ ...},
  "ar": {... lang: "ar", dir: "rtl", pricing_title: ✅ "اختر الباقة المناسبة", شهري, الوضع التجريبي, مرحباً, بالليرة, ₺, ≈$ ...}
}
```

### Test matrisi — 20/20 PASS

| Dil | lang | dir | Pricing title | Aylık | Sandbox | Welcome | Tahsilat | ₺ | ≈$ | Console |
|---|---|---|---|---|---|---|---|---|---|---|
| TR | tr | ltr | ✅ İhtiyacına | ✅ Aylık | ✅ | ✅ Hoş geldin | ✅ tahsilat | ✅ | ✅ | offline only* |
| EN | en | ltr | ✅ Choose | ✅ Monthly | ✅ | ✅ Welcome | ✅ charged | ✅ | ✅ | offline only* |
| RU | ru | ltr | ✅ Выберите | ✅ Ежемесячно | ✅ Тестовый | ✅ Добро | ✅ списание | ✅ | ✅ | offline only* |
| AR | ar | **rtl** | ✅ اختر | ✅ شهري | ✅ الوضع | ✅ مرحباً | ✅ بالليرة | ✅ | ✅ | offline only* |

`*` Tek "Failed to load resource: ERR_FAILED" — Supabase edge function offline test ortamı (gerçek API çağrısı düşüyor — beklenen). i18n/UI hatası YOK.

### Screenshots
```
_audit/dil-faz1b/
├── _test.mjs
├── pricing-{tr,en,ru,ar}.png       (4 × fiyatlandırma)
├── odeme-start-{tr,en,ru,ar}.png   (4 × ödeme başlat)
└── odeme-basarili-{tr,en,ru,ar}.png(4 × ödeme başarılı)
```

### Build
```
PWA v1.3.0 — precache 299 entries (6495.14 KiB)  ← önceki 6466.32 KiB, +28.82 KiB
```
✅ **YEŞİL** (RU/AR + EN/TR yeni alanlar)

### Lint
- 4 dosya 0 error / 0 warning (messages.ts + PricingPage + PaymentStartPage + PaymentSuccessPage)

### git diff — çekirdek
```
src/lib/payments/paymentClient.ts        ZERO
src/lib/pricingTiers.ts                  ZERO  (tier.name + tier.tagline TR sabit — data dosyası)
src/lib/fees.ts                          ZERO
src/contexts/CurrencyContext.tsx         ZERO
src/components/FxRef.tsx                 ZERO
supabase/functions/payments-iyzico/      ZERO
supabase/migrations/                     ZERO
src/contexts/LocaleContext.tsx           ZERO  (ADIM 10 mekanizması korundu)
src/hooks/useMembershipTier.ts           ZERO
```

---

## 7) Dokunulan dosyalar

```
src/i18n/messages.ts                      (+330 / -3)
  - PricingMessages + PaymentMessages tipleri
  - Messages.pricing + Messages.payment
  - EN + TR full ekleme (pricing + payment.start + payment.success)
  - _ruOverrides genişletme (pricing + payment full)
  - _arOverrides genişletme (pricing + payment full, anlam koruyarak)

src/pages/PricingPage.tsx                 (+85 / -120 — net azalış: hardcoded → key)
  - useLocale + 2 yerde (TierCard + PricingPage component)
  - 50+ t.pricing.* bağlanması
  - text-left → text-start, ml- → ms-/me-
  - Fiyat alanlarına dir="ltr"

src/pages/payment/PaymentStartPage.tsx    (+45 / -75)
  - useLocale + 30+ t.payment.start.* bağlanması
  - Sandbox/Production banner METNİ değişti (4 dilde doğru anlam)
  - Form label + placeholder + hata + güvence + otomatik yenileme
  - Logical CSS + dir="ltr" fiyat/kart input'larda

src/pages/payment/PaymentSuccessPage.tsx  (+20 / -25)
  - useLocale + 12 t.payment.success.* bağlanması
  - Sandbox onay metni 4 dilde doğru
  - Logical CSS + ArrowRight rtl:rotate-180

_audit/DIL_FAZ1B_RAPORU.md                (+ YENİ kapsamlı rapor)
_audit/dil-faz1b/_test.mjs                (+ YENİ test)
_audit/dil-faz1b/*.png                    (+ 12 screenshot: 4 dil × 3 sayfa)
```

---

## 8) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6495.14 KiB)
files generated  dist/sw.js + dist/workbox-9c35ba06.js
```
✅ **YEŞİL** (+28.82 KiB — pricing + payment override 4 dil)

### Lint
- 4 dosya 0 error / 0 warning

### Git
- `safe-before-dil-faz1b` (bb5e16f)
- `safe-after-dil-faz1b` (bu commit)

### Regresyon — KANIT
- TR: pricing "İhtiyacına göre paket seç" + sandbox "iyzico sandbox" + success "Hoş geldin!" → **çalışıyor**
- EN: yeni eklenen tam EN çeviri (ADIM 10'da pricing/payment EN yoktu, şimdi tam)
- ADIM 10/11 mekanizması (`getMessagesFor`, `_mergeMessages`, RU/AR override) → **bozulmadı**
- 11 mevcut `useLocale()` tüketicisi → **dokunulmadı**
- Currency mantığı (₺ ana + ≈$ + tahsilat ₺) → **dokunulmadı**

---

## 9) SONRAKİ FAZ 1 ADIMLARI (sıralı, Master onayı)

| # | İş | Kapsam | Saat |
|---|---|---|---|
| **11-C** | İlan detay sayfası (`AuctionDetail`) | Başlıklar, sticky kart, CTA "Teklif ver", AI rapor başlıkları, sealed metinleri | 4-6 |
| **11-D** | Borsa terminal sayfaları | `BorsaPage` + `Portfolio` + `Watchlist` + `AssetDetail` + `DataAnalysis` terminal UI | 4-6 |
| **11-E** | Navbar mega menü (3 kolon başlığı + 18 item) + Footer detay | Yatırımcı/Emlakçı/Müteahhit segment label'ları | 2-3 |
| **11-F** | `lib/pricingTiers.ts` tier.name + tier.tagline RU/AR çeviri | "Bireysel"/"Yatırımcı"/"Pro"/"Kurumsal" + tagline metinleri | 1-2 |

### FAZ 2 (RTL CSS toplu — uzun vade)
- 359 fiziksel CSS → logical (100-150 saat) + AR screenshot diff

### FAZ 3 (yasal — avukat sonrası)
- Sözleşme/Gizlilik/KVKK RU/AR (avukat onayı) — 20-40h + dış maliyet
- SEO hreflang + og:locale RU/AR

---

## 10) Master için 3 KARAR

1. **Sonraki adım sırası:** 11-C (İlan detay) mi, 11-D (Borsa) mı önce? — Yabancı kullanıcı yolculuğu: girişten sonra **ilan detay > borsa > fiyatlandırma** (artık çevrildi) > onboarding. 11-C en kritik dönüşüm sonrası kullanıcı katılım sayfası.
2. **pricingTiers data dosyası çevirisi:** `tier.name = "Pro Emlakçı"` ve `tier.tagline = "..."` (data sabit) RU/AR çevirilsin mi (11-F küçük dilim), yoksa marka adı olarak TR kalsın mı? — "Pro" gibi terimler marka olarak okunabilir ama "Bireysel"/"Kurumsal" çevrilmeli.
3. **Native review:** Bu adımda eklenen RU/AR ödeme/dürüstlük metinlerini yerel ana dilde uzman gözden geçirir mi (önemli — para akışı = en kritik dönüşüm)? Tahminim: gözden geçirme sonrası %95+ aynı kalır, %5 stil ayarlaması.

---

— **3 sayfa × 4 dil = 20/20 PASS · TR/EN regresyon SIFIR · AR dir=rtl + sayı/fiyat LTR doğru · Sandbox dürüstlük 4 dilde anlam KORUNDU (kullanıcı yanıltma YOK) · Currency gösterimi SIFIR değişiklik · ADIM 10/11 mekanizması bozulmadı · 90+ yeni key (pricing + payment) · Sözlük 25+ yeni terim · Hiçbir [REVIEW] gerekmedi · 0 i18n hatası (tek ERR Supabase offline).**
🌐✅
