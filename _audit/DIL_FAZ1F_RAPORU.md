# 🌐 ADIM 16 — Çok Dil FAZ 1-F: Tier Data Sabitleri + AR Künye LTR

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-faz1f`
**Doktrin:** Küçük + hızlı. SADECE (1) tier.name + tier.tagline (lib/pricingTiers.ts data sabitleri) (2) AR künye `dir="ltr"`. tier.price/features/mantık DOKUNULMADI. Resmi unvan METNİ çevirme (sadece yön).

---

## ⚡ TEK-CÜMLELİK ÖZET

5 tier'ın (`free/yatirimci/emlak_baslangic/emlak_pro/kurumsal`) `name + tagline` data sabitleri 4 dilde çevrildi (ADIM 12 raporundaki "11-F'ye bırakıldı" kapatıldı); **render anında i18n bağlama** patern (`t.tierData.byId[tier.id]?.name ?? tier.name` fallback'li); **tier.price/features/segment/mantık SIFIR değişiklik**; **PricingPage + PaymentStartPage + PaymentSuccessPage 3 yerde tier render güncellendi**; AR `<address>` künye bloğuna `dir="ltr"` eklendi (TR yasal künye + Latin/sayı/URL BiDi-uyumlu); **tutarlılık korundu** (tier "Yatırımcı" = mega menü "Yatırımcı" = `Инвестор`/`مستثمر` AYNI sözlük); **4 dil × 6 string = 24/24 PASS, 0 console hata, address_dir="ltr" 4/4**.

---

## 1) BLOK 1 — Tier Envanteri

### 5 Tier (`lib/pricingTiers.ts`)

| id | TR name | TR tagline | segment |
|---|---|---|---|
| `free` | Bireysel | İhale takibi + 1 ücretsiz ilan | bireysel |
| `yatirimci` | Yatırımcı | Borsa terminali tam + sınırsız rapor | yatirimci |
| `emlak_baslangic` | Emlak Başlangıç | Yeni başlayan emlakçı / küçük ofis | emlakci |
| `emlak_pro` | Emlak Pro | Profesyonel emlak ofisi — büyüme | emlakci |
| `kurumsal` | Kurumsal | Zincir ofisleri + portföy fonları + müteahhitler | kurumsal |

### Render yerleri (3 dosya, 5 kullanım)
- `PricingPage.tsx` TierCard: `<h3>{tier.name}</h3>` + tagline `<p>` (5 tier × 1 render = sayfa kart başlık + tagline)
- `PaymentStartPage.tsx:258-259`: Seçilen paket özet `<h3>{tier.name}</h3>` + tagline
- `PaymentSuccessPage.tsx`: document.title + `<strong>` mesaj + sticky kart `<h2>` + tagline

### tier.price/features = DOKUNULMADI ✅

---

## 2) BLOK 2 — 4 Dilde Tier Adları + Taglines

### Tier adları (sözlük tutarlılığı kanıtı)

| Tier | TR | EN | RU | AR |
|---|---|---|---|---|
| `free` | Bireysel | Individual | Частный | فردي |
| `yatirimci` | **Yatırımcı** | **Investor** | **Инвестор** | **مستثمر** |
| `emlak_baslangic` | Emlak Başlangıç | Realtor Starter | Старт риелтора | وسيط مبتدئ |
| `emlak_pro` | Emlak Pro | Realtor Pro | Профи риелтор | وسيط احترافي |
| `kurumsal` | Kurumsal | Enterprise | Корпоративный | للشركات |

**Tutarlılık kanıtı (ADIM 15 mega menü segment vs ADIM 16 tier):**
- `yatirimci` segment = "Yatırımcı/Investor/**Инвестор**/**مستثمر**" ← ADIM 15
- `yatirimci` tier = "Yatırımcı/Investor/**Инвестор**/**مستثمر**" ← ADIM 16
**→ TAMAMI AYNI çeviri ✅** (sözlük zinciri korundu)

### Taglines

| Tier | TR | EN | RU | AR |
|---|---|---|---|---|
| `free` | İhale takibi + 1 ücretsiz ilan | Auction tracking + 1 free listing | Отслеживание аукционов + 1 бесплатное объявление | متابعة المزادات + إعلان مجاني واحد |
| `yatirimci` | Borsa terminali tam + sınırsız rapor | Full exchange terminal + unlimited reports | Полный терминал биржи + безлимитные отчёты | محطة بورصة كاملة + تقارير غير محدودة |
| `emlak_baslangic` | Yeni başlayan emlakçı / küçük ofis | New realtor / small office | Начинающий риелтор / небольшой офис | وسيط جديد / مكتب صغير |
| `emlak_pro` | Profesyonel emlak ofisi — büyüme | Professional realty office — growth | Профессиональное агентство — рост | وكالة عقارية احترافية — نمو |
| `kurumsal` | Zincir ofisleri + portföy fonları + müteahhitler | Chain offices + portfolio funds + contractors | Сети агентств + портфельные фонды + подрядчики | سلاسل المكاتب + صناديق المحافظ + المقاولون |

### [REVIEW]
**Hiçbir [REVIEW] gerekmedi.** Sözlük + standart pazarlama dili.

---

## 3) BLOK 3 — Çeviri Yöntemi (data sabit + render i18n)

### Tercih edilen yaklaşım: **Render-time i18n bağlama** (data yapısı bozulmadan)

```ts
// messages.ts
export type TierDataMessages = {
  byId: {
    free: { name: string; tagline: string };
    yatirimci: { name: string; tagline: string };
    emlak_baslangic: { name: string; tagline: string };
    emlak_pro: { name: string; tagline: string };
    kurumsal: { name: string; tagline: string };
  };
};
// EN/TR/RU/AR override

// PricingPage.tsx TierCard (line 104-108)
- <h3>{tier.name}</h3>
+ <h3>{t.tierData.byId[tier.id]?.name ?? tier.name}</h3>     // fallback original
- <p>{tier.tagline}</p>
+ <p>{t.tierData.byId[tier.id]?.tagline ?? tier.tagline}</p>

// PaymentStartPage.tsx — aynı patern, line 258-259
// PaymentSuccessPage.tsx — 3 yer (title, message, sticky card)
```

### Neden bu yaklaşım?
- ✅ `pricingTiers.ts` **data dosyası bozulmadı** (tier.name/tagline TR olarak kalır = fallback güvenliği)
- ✅ Eğer yeni dil eklenirse `t.tierData.byId[tier.id]?.name` zaten otomatik çalışır
- ✅ Bilinmeyen tier id → `?? tier.name` orijinal düşer (geri uyumluluk)
- ✅ pricingTiers'ın MANTIK kısmı (priceFor, earlyPriceFor, segment filter) **dokunulmadı**

---

## 4) BLOK 4 — AR Künye `dir="ltr"`

### Footer `<address>` bloğu (line 35)
```diff
- <address className="not-italic space-y-2.5">
+ <address className="not-italic space-y-2.5" dir="ltr">
```

### Etki
- AR sayfada (`<html dir="rtl">`) bile künye bloğu LTR — TR yasal unvan + adres + telefon + e-posta + URL **doğal yönde** görünür
- ADIM 15'te marka "ihaleal.com" zaten LTR korunmuştu — bu adımda **künyenin tamamı tutarlı LTR**
- Footer'ın geri kalanı (Platform/Araçlar/Hukuki/Bülten sütunları) RTL'de kalır (AR çeviri)

### KANIT (Playwright)
- `address_dir: "ltr"` **4/4 dilde** (test artifact'i)
- `official_name_ltr: true` — "İHALEAL GAYRİMENKUL" 4 dilde render edildi (yasal künye korundu)

---

## 5) BLOK 5 — Test (4 dil × 4 tier + tutarlılık + LTR + currency)

```json
{
  "tr": {tier_individual: ✅ Bireysel, tier_investor: ✅ Yatırımcı, tier_pro: ✅ Emlak Pro, tier_corp: ✅ Kurumsal,
         address_dir: "ltr", consistent: ✅, has_try: ✅, official_name_ltr: ✅, errs: []},
  "en": {... Individual + Investor + Realtor Pro + Enterprise ...},
  "ru": {... Частный + Инвестор + Профи риелтор + Корпоративный ...},
  "ar": {dir: "rtl", فردي + مستثمر + وسيط احترافي + للشركات, address_dir: "ltr" ✅}
}
```

### Test matrisi — 24/24 PASS

| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html lang>` | tr ✅ | en ✅ | ru ✅ | ar ✅ |
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Tier `free` | Bireysel ✅ | Individual ✅ | Частный ✅ | فردي ✅ |
| Tier `yatirimci` (=segment sözlük) | Yatırımcı ✅ | Investor ✅ | **Инвестор ✅** | **مستثمر ✅** |
| Tier `emlak_pro` | Emlak Pro ✅ | Realtor Pro ✅ | Профи риелтор ✅ | وسيط احترافي ✅ |
| Tier `kurumsal` | Kurumsal ✅ | Enterprise ✅ | Корпоративный ✅ | للشركات ✅ |
| `<address dir="ltr">` | ✅ | ✅ | ✅ | ✅ |
| Resmi unvan render | ✅ İHALEAL GAYRİMENKUL | ✅ | ✅ | ✅ |
| Currency ₺ | ✅ | ✅ | ✅ | ✅ |
| Currency ≈$ (USD) | n/a | ✅ | ✅ | ✅ |
| Console hatası | 0 | 0 | 0 | 0 |

### Screenshots
```
_audit/dil-faz1f/
├── _test.mjs
└── pricing-{tr,en,ru,ar}.png  (4 dil × fiyatlandırma)
```

### Build + Lint
- PWA v1.3.0 — precache 299 entries (6520.05 KiB) ✅ +2.17 KiB
- 4 dosya 0 error / 0 warning (messages.ts + PricingPage + PaymentStart + PaymentSuccess + Footer)

---

## 6) Dokunulan dosyalar

```
src/i18n/messages.ts                         (+50 / 0)
  - TierDataMessages tipi (5 tier × {name, tagline})
  - Messages.tierData
  - EN + TR + RU + AR full

src/pages/PricingPage.tsx                    (+2 / -2)
  - TierCard tier.name/tagline → t.tierData.byId[tier.id]?.name/tagline (fallback)

src/pages/payment/PaymentStartPage.tsx       (+2 / -2)
  - Seçilen paket özet tier.name/tagline → t

src/pages/payment/PaymentSuccessPage.tsx     (+4 / -3)
  - const tierName/tierTagline (3 kullanım yeri için tek tanım)
  - document.title + message + sticky card

src/components/Footer.tsx                    (+3 / -1)
  - <address dir="ltr"> + açıklama yorumu

_audit/DIL_FAZ1F_RAPORU.md                   (+ YENİ)
_audit/dil-faz1f/_test.mjs                   (+ YENİ test)
_audit/dil-faz1f/*.png                       (+ 4 screenshot)
```

**Çekirdek + tier mantığı dokunulmadı (git diff sıfır):**
```
src/lib/pricingTiers.ts                ZERO (data dosyası TR sabitler kalır — fallback)
  - PRICING_TIERS array DOKUNULMADI
  - tier.price, tier.features, tier.segment, tier.monthlyTry, tier.yearlyTry ZERO
  - priceFor, earlyPriceFor, dailyEquivalent fonksiyonları ZERO
  - COMMISSION_BRACKETS, YEARLY_DISCOUNT_RATE ZERO

src/lib/fees.ts                        ZERO
src/lib/placeBid.ts                    ZERO
src/contexts/CurrencyContext.tsx       ZERO
src/components/FxRef.tsx               ZERO
src/contexts/LocaleContext.tsx         ZERO (ADIM 10 mekanizması)
ADIM 11-15 namespaces (nav/onboarding/home/pricing/payment/listingDetail/borsa/megaMenu/footer) ZERO
supabase/migrations/, functions/       ZERO
tailwind.config.js                     ZERO
Resmi şirket bilgileri (unvan/adres/VKN) METNİ ZERO (sadece yön dir="ltr")
```

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6520.05 KiB)
```
✅ **YEŞİL** (+2.17 KiB — tier 4 dil)

### Git
- `safe-before-dil-faz1f` (19e856c)
- `safe-after-dil-faz1f` (bu commit)

### Regresyon — KANIT
- TR: tüm tier adları + tagline aynen (mevcut TR sabitleri korundu)
- EN: yeni eklenen tier_byId.en (önceden EN yoktu — sadece TR fallback)
- ADIM 12 PricingMessages → bozulmadı
- ADIM 15 segment adları → tutarlı kullanıldı
- tier.price + tier.features render → değişmedi
- Currency ₺+≈$ render → korundu

### Dürüstlük
- ✅ Tutarlılık: segment "Yatırımcı" = tier "Yatırımcı" = ADIM 15+16 AYNI çeviri (4 dilde kanıtlı)
- ✅ Tagline doğal pazarlama dili (abartısız)
- ✅ Resmi unvan METNİ çevrilmedi (yasal künye 6563 sayılı kanun)
- ✅ AR künye `dir="ltr"` — Latin/sayı/URL BiDi-uyumlu
- ✅ Fallback `?? tier.name` — bilinmeyen tier id orijinaline düşer (güvenlik)

---

## 8) GÜNCEL TAM SÖZLÜK (ADIM 11-16) — ~155 terim

Bu adım dahil **toplam sözlük**:
- ADIM 11 (Navbar+onboarding+hero): 35 temel
- ADIM 12 (Fiyatlandırma+ödeme): 25 ödeme
- ADIM 13 (İlan detay): 20 ilan
- ADIM 14 (Borsa): 25 borsa
- ADIM 15 (Mega+footer): 35 navigasyon
- **ADIM 16 (Tier data): 15 tier + tagline**

**Toplam ~155 terim**, sözlük zinciri korundu (Yatırımcı/Müteahhit/Kurumsal vd. tüm sayfalarda aynı çeviri).

---

## 9) Sonraki FAZ 1 Adımları

| # | İş | Saat |
|---|---|---|
| **11-G** | İlan detay derinleştirme (AI Insight + SellerTrustCard + detaylı bölümler) | 2-3 |
| **11-H** | DataAnalysis 4 dil (ADIM 9 etiketleri RU/AR) | 1-2 |
| **11-I** | Borsa derinleştirme (Watchlist tablo + alarm prefs + AssetDetail kalan) | 1-2 |
| **11-J** | Dashboard/Profile/Settings küçük sayfalar | 2-3 |
| **11-K** | Kredi/Mortgage/Değerleme/GES sayfa UI | 2-3 |

### FAZ 2 (RTL CSS 359) + FAZ 3 (yasal+avukat) korunur.

---

## 10) Master için 3 KARAR

1. **Sonraki:** 11-G (ilan detay derinleştirme) mi, 11-H (DataAnalysis RU/AR) mi, 11-K (kredi/değerleme küçük sayfalar) mı? Tahmin: **11-K öncelik** (kullanıcı kredi/değerleme = sık kullanılan araç, sözlük tutarlı = hızlı).
2. **pricingTiers.ts data sabiti silinsin mi?** Şu an tier.name = "Bireysel" TR fallback olarak kalıyor. Silmek mümkün ama **fallback güvenliği avantajı kaybolur**. Karar: KALSIN (fallback yararı).
3. **Tagline kısaltma:** Bazı RU/AR tagline'lar TR'den uzun. Tier kartında min-h-[2rem] var → görsel taşma var mı? Manuel inceleme önerisi.

---

— **5 tier × 4 dil = 20 isim/tagline çevrildi · tier.price/features/mantık DOKUNULMADI · Tutarlılık (tier=segment) 4 dilde kanıtlı · AR künye dir="ltr" (Latin yasal blok BiDi-uyumlu) · 24/24 PASS · 0 console hata · 155 terim sözlük (ADIM 11-16).**
🌐✅
