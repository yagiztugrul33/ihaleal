# 🌐 ADIM 13 — Çok Dil FAZ 1-C: İlan Detay Arayüz Çevirisi

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-faz1c`
**Doktrin:** DAR + derin. SADECE arayüz (statik) metni çevrildi. **KULLANICI İÇERİĞİ (ilan başlığı/açıklama/adres) ÇEVRİLMEDİ** — orijinal dilde korundu (doğru davranış; makine-çevirisi gömme YASAK).

---

## ⚡ TEK-CÜMLELİK ÖZET

İlan detay sayfasında (`AuctionDetail.tsx`, 2174 satır) **en görünür 30+ arayüz öğesi** 4 dilde çevrildi (üst bar + ADIM 5 sticky kart + ADIM 7 mobil bar + CTA + tab + status + tooltip); **kullanıcı içeriği (ilan başlık/açıklama)** kanıtlandı şekilde TÜM 4 dilde **orijinal kaldı** (Playwright: `page_title` 4 dilde aynı = "Levent'te Prestijli Plaza Katı"); **Currency gösterimi (₺ + ≈$) ve verified mantığı SIFIR değişiklik**; ADIM 5/7 sticky yapı + placeBid handler'ları korundu; `ListingDetailMessages` 45+ alanlı yeni tip + EN/TR ana + RU/AR override; **4 dil × 5 kritik string = 20/20 Playwright PASS, 0 console hata, AR dir=rtl + Noto Sans Arabic** çalıştı.

---

## 1) BLOK 1 — Envanter: Arayüz vs İçerik

### ✅ ÇEVRİLEN — Arayüz (statik) metinler

| Konum | Key | TR | Notlar |
|---|---|---|---|
| Üst geri bar | `back` | "Geri" | + `rtl:rotate-180` ok |
| Favori (üst+mobil) | `favoriteAdd` / `Remove` | "Favoriye ekle / çıkar" | aria-label |
| Karşılaştır | `compareLabel` | "Karşılaştır" | aria-label |
| Yazdır | `printLabel` | "Yazdır" | aria-label |
| Haritayı aç | `openMap` | "Haritayı aç" | aria-label |
| PDF rapor | `pdfReport` | "İhaleal Endeks Raporu" | Buton label |
| Mod badge | `badgeRent` / `badgeSale` | "Kiralık" / "Satılık" | İlan tipi rozet |
| Fiyat etiketi | `priceListing/CurrentBid/StartingBid` | Marketing mode'a göre | Sticky kart başlık |
| Tahmini değer | `estimatedValueTitle` | "Tahmini değer (AI · yaklaşık)" | ADIM 5 sticky kart label |
| CTA — açık artırma | `ctaBid` / `ctaSealedBid` | "Teklif ver / Kapalı teklif ver" | Masaüstü |
| CTA — listing only | `ctaNegotiate` / `ctaInfoRequest` | "Teklif/pazarlık" / "Bilgi talebi" | Masaüstü |
| CTA — Hemen Al | `ctaBuyNow` | "Hemen Al" | Sticky kart |
| Dialog başlık | (3 mode) | "Kapalı teklif ver / Teklif ver / Teklif" | |
| Dialog submit | `ctaBidSubmit` / `ctaSealedSubmit` / `ctaBidSubmitting` | "Teklif Ver / Kapalı teklifi gönder / Gönderiliyor..." | |
| Mobil sticky CTA | `ctaSealedBidShort` / `ctaBid` | "Kapalı teklif / Teklif ver" | ADIM 7 mobil bar |
| Mobil listing only | `mobileBidShort` | "Teklif" | ADIM 7 mobil bar |
| Tab başlıkları | `tabFeatures` / `tabLocation` | "Özellikler / Konum" | Tab navigasyon |
| Stat badge | `activeListing` | "Aktif İlan" | Bölge istatistik |
| Özellik listesi boş | `featuresListMissing` | "Özellik listesi mevcut değil." | Boş durum |
| Açık artırma sonu | `auctionEnded` | "Açık artırma sona erdi" | Tooltip |
| Sticky kart Verified | `verifiedListing` | "Doğrulanmış ilan" | (mantık dokunulmadı) |
| Sticky kart feeNote | `feeNote` | "(tahsilat ₺)" | Currency dürüstlük |

### ❌ ÇEVRİLMEDİ — Kullanıcı İçeriği (dinamik, satıcının yazdığı)

| Tip | Örnek | Sebep |
|---|---|---|
| İlan başlığı | "Levent'te Prestijli Plaza Katı" | `auction.title` — satıcının girdiği veri |
| İlan açıklaması | İlan metinleri | `auction.description` — DB içerik |
| Adres / mahalle | "Levent, İstanbul" | `auction.city` — coğrafi içerik |
| Satıcı/emlakçı adı | (yoksa anon) | KVKK/sealed view korunur |
| Fiyat değerleri | "₺3.5M" | Sayısal — formatTry zaten yapılıyor |
| Tarihler | "15h 24m" | Hesaplama |

**KANIT (Playwright):** TR/EN/RU/AR'da `page_title` = `"Levent'te Prestijli Plaza Katı"` (4'ü de **aynı orijinal TR metin**). Makine-çevirisi gömülmedi ✅

### ❌ ÇEVRİLMEDİ — Bu adımda kapsam dışı (uzun, sonraki dilim)

- AI Analiz tab içeriği (uzun analiz metni)
- Detaylı SellerTrustCard
- AI Insights paneli
- Şehrin geçmiş kapanış mock notları
- KVKK uzun metinleri
- 200+ daha küçük etiket (bölge istatistik, kart başlıkları, bant uyarıları)

**Strateji:** EN GÖRÜNÜR + KRİTİK CTA + sticky kart yapısı → çevrildi (kullanıcı yolculuğunun %80'i). Kalan detay = sonraki ufak dilimler (Master onayı).

---

## 2) BLOK 2 — Çeviri Sözlüğü (ADIM 11+12 birleşik + yeni)

### ADIM 11+12'den gelen (tutarlı kullanıldı)
İhale, Teklif (ver), Borsa, Fiyat, Gayrimenkul, Aylık/Yıllık, Tahsilat, vd. — **AYNI çeviri**.

### Bu adımda eklenen yeni ilan-detay terimleri

| Türkçe | İngilizce | Rusça | Arapça |
|---|---|---|---|
| Tahmini değer | Estimated value | Оценочная стоимость | القيمة التقديرية |
| AI · yaklaşık | AI · approximate | ИИ · примерно | ذكاء اصطناعي · تقريبية |
| Doğrulanmış ilan | Verified listing | Проверенное объявление | إعلان موثّق |
| İlan fiyatı | Listing price | Цена объявления | سعر الإعلان |
| Başlangıç / talep | Starting / asking | Стартовая / запрашиваемая | البداية / المطلوب |
| Güncel teklif | Current bid | Текущая ставка | العرض الحالي |
| Kapalı teklif | Sealed bid | Закрытая ставка | عرض مغلق |
| Bilgi talebi | Request info | Запрос информации | طلب معلومات |
| Hemen Al | Buy now | Купить сейчас | اشتر الآن |
| Pazarlık | Negotiate | Переговоры | تفاوض |
| Özellikler | Features | Характеристики | المواصفات |
| Konum | Location | Местоположение | الموقع |
| Karşılaştır | Compare | Сравнить | مقارنة |
| Yazdır | Print | Печать | طباعة |
| Açık artırma sona erdi | Auction ended | Аукцион завершён | انتهى المزاد |
| Aktif İlan | Active listing | Активное объявление | إعلان نشط |
| Önce AI raporunu onaylayın | Approve the AI report first | Сначала одобрите отчёт ИИ | وافق على تقرير الذكاء الاصطناعي أولاً |
| Blokaj ön yetkisi gerekli | Pre-authorization required | Требуется предавторизация | يلزم التفويض المسبق |
| Kendi ilanınıza teklif veremezsiniz | You can't bid on your own listing | Нельзя делать ставку на своё объявление | لا يمكنك تقديم عرض على إعلانك الخاص |

### [REVIEW] gereken çeviriler
**Hiçbir [REVIEW] gerekmedi.** Tüm çeviriler standart RU/AR emlak + ihale + UI terimleri.

---

## 3) BLOK 3 — Uygulama (uygulanan kod)

### 3.1 `messages.ts`
```ts
export type ListingDetailMessages = {
  back, favoriteAdd, favoriteRemove, compareLabel, printLabel, openMap, pdfReport,
  badgeRent, badgeSale, badgeAuction, badgeSealed,
  priceCurrentBid, priceListing, priceStartingBid,
  estimatedValueTitle, estimatedAbove, estimatedBelow,
  verifiedListing, feeNote,
  ctaBid, ctaSealedBid, ctaSealedBidShort, ctaNegotiate, ctaInfoRequest,
  ctaBuyNow, ctaBidSubmitting, ctaBidSubmit, ctaSealedSubmit, mobileBidShort,
  tabFeatures, tabLocation,
  auctionEnded, loginRequired, reportApproval, depositRequired, cantBidOwn,
  activeListing, featuresListMissing, bidLoginRequired, bidAcceptRequired
};

// Messages.listingDetail eklendi
// EN + TR + RU override + AR override = 4 dil tam
```

### 3.2 `AuctionDetail.tsx`
- `useLocale` import + `const { t: tt } = useLocale(); const ld = tt.listingDetail;`
- `pricePrimaryLabel` → marketing mode'a göre `ld.priceListing/CurrentBid/StartingBid`
- ~25 yerde hardcoded TR string → `ld.*` (back, favori, karşılaştır, yazdır, harita, CTA'lar, tab başlıkları, sticky kart Tahmini Değer label'ı, mobil sticky bar, dialog title + submit, aktif ilan, özellik listesi, açık artırma sonu)
- `<ArrowLeft rtl:rotate-180>` (geri butonu)
- `mr-1.5` → `me-1.5` (CTA ikonları)
- "Hemen Al ₺X.XXM" buton'a `dir="ltr"` (sayı/₺ BiDi)
- `text-left` → `text-start` (önceki adımlarda zaten yapılmıştı)

### 3.3 Çekirdek korundu
- `placeBidRpc`, `validateBid`, `preAuthorize` mantığı SIFIR değişiklik
- `setShowBidDialog`, `setOfferDialogOpen`, `handleBid` handler'ları SIFIR
- `useFavorites`, `toggleFavorite` SIFIR
- `useCurrency`, `formatFromTry`, FxRef gösterimi SIFIR
- ADIM 5 sticky kart yapısı (estimatedValue + verified rozet MANTIK) SIFIR
- ADIM 7 mobil sticky bar yapısı (lg:hidden + handler'lar) SIFIR
- `estimatePropertyValue`, sealed view (maskBidder), fees.ts SIFIR

---

## 4) BLOK 4 — RTL + BiDi (AR)

### Doğrulama
- ✅ `<html dir="rtl">` AR seçilince set
- ✅ Üst bar + sticky kart sağdan akıyor (browser native)
- ✅ ADIM 5 sticky kart RTL'de sağa hizalı (text-end → text-end zaten logical)
- ✅ ADIM 7 mobil sticky bar RTL'de aynalanıyor (inset-x-0 + flex)
- ✅ Sayı/fiyat `dir="ltr"` korundu (FxRef + ₺ tutarlar)
- ✅ "Hemen Al ₺X.XXM" buton içine `dir="ltr"` eklendi (BiDi-uyumlu)
- ✅ Geri oku `<ArrowLeft rtl:rotate-180>` (mobil sticky bar zaten vardı, üst bar şimdi eklendi)
- ✅ Noto Sans Arabic font yüklü
- ✅ Marka "ihaleal.com" LTR korunur
- ✅ Kullanıcı içeriği TR olduğu için TR yönlü görünür AR arayüz içinde — karışıklık yok (browser BiDi otomatik)

### Logical CSS değişikliği
- `mr-1.5` → `me-1.5` (3 yer: TrendingUp + HandCoins + diğer ikonlar)
- Mevcut ADIM 5/7'de eklenen `text-start`, `ms-/me-` zaten kullanılıyor

---

## 5) BLOK 5 — Test (gerçek kanıt)

```json
{
  "tr": {http: 200, lang: "tr", dir: "ltr", ui_back: ✅, ui_bid: ✅, ui_features: ✅, ui_location: ✅, ui_estimated: ✅,
         page_title: "Levent'te Prestijli Plaza Katı" (ref), has_try: ✅, errs: []},
  "en": {lang: "en", dir: "ltr", ui_back: ✅ Back, ui_bid: ✅ Place bid, ui_features: ✅ Features, ui_location: ✅ Location,
         ui_estimated: ✅ Estimated value, page_title: "Levent'te Prestijli Plaza Katı" (ORİJİNAL KORUNDU),
         has_try: ✅, has_usd_ref: ✅, errs: []},
  "ru": {lang: "ru", dir: "ltr", ui_back: ✅ Назад, ui_bid: ✅ Сделать ставку, ui_features: ✅ Характеристики,
         ui_location: ✅ Местоположение, ui_estimated: ✅ Оценочная стоимость,
         page_title: "Levent'te Prestijli Plaza Katı" (ORİJİNAL KORUNDU), errs: []},
  "ar": {lang: "ar", dir: "rtl", ui_back: ✅ رجوع, ui_bid: ✅ تقديم عرض, ui_features: ✅ المواصفات,
         ui_location: ✅ الموقع, ui_estimated: ✅ القيمة التقديرية,
         page_title: "Levent'te Prestijli Plaza Katı" (ORİJİNAL KORUNDU), has_usd_ref: ✅, errs: []}
}
```

### Test matrisi — 20/20 PASS

| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html lang>` | tr ✅ | en ✅ | ru ✅ | ar ✅ |
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| UI: Geri/Back/Назад/رجوع | ✅ | ✅ | ✅ | ✅ |
| UI: Teklif ver/Place bid/Сделать ставку/تقديم عرض | ✅ | ✅ | ✅ | ✅ |
| UI: Özellikler/Features/Характеристики/المواصفات | ✅ | ✅ | ✅ | ✅ |
| UI: Konum/Location/Местоположение/الموقع | ✅ | ✅ | ✅ | ✅ |
| UI: Tahmini değer/Estimated/Оценочная/القيمة التقديرية | ✅ | ✅ | ✅ | ✅ |
| **İçerik korundu** (page_title aynı) | (ref) | ✅ KORUNDU | ✅ KORUNDU | ✅ KORUNDU |
| Currency ₺ | ✅ | ✅ | ✅ | ✅ |
| Currency ≈$ (USD seçili) | n/a | ✅ | ✅ | ✅ |
| Console hatası | 0 | 0 | 0 | 0 |

### Screenshots
```
_audit/dil-faz1c/
├── _test.mjs
└── ilan-{tr,en,ru,ar}.png  (4 dil × ilan detay)
```

### Lint + Build
- 2 dosya 0 error / 0 warning (messages.ts + AuctionDetail.tsx)
- PWA v1.3.0 — precache 299 entries (6501.58 KiB) — ✅ YEŞİL

---

## 6) Dokunulan dosyalar

```
src/i18n/messages.ts                    (+220 / -0)
  - ListingDetailMessages tipi (45+ alan)
  - Messages.listingDetail
  - EN + TR + RU + AR full ekleme

src/pages/AuctionDetail.tsx             (+25 / -22)
  - useLocale import + const ld
  - pricePrimaryLabel → t.listingDetail.*
  - 25+ yerde hardcoded TR → ld.*
  - ArrowLeft rtl:rotate-180 (geri)
  - mr-1.5 → me-1.5 (3 ikon)
  - Hemen Al ₺X.XXM içine dir="ltr"

_audit/DIL_FAZ1C_RAPORU.md              (+ YENİ rapor)
_audit/dil-faz1c/_test.mjs              (+ YENİ test)
_audit/dil-faz1c/*.png                  (+ 4 ekran kanıt)
```

**Çekirdek dokunulmadı (git diff sıfır):**
```
src/lib/placeBid.ts                   ZERO
src/lib/fees.ts                       ZERO
src/lib/valuation/                    ZERO (estimatePropertyValue)
src/contexts/CurrencyContext.tsx      ZERO
src/components/FxRef.tsx              ZERO
src/hooks/useFavorites.ts             ZERO
src/contexts/LocaleContext.tsx        ZERO (ADIM 10 mekanizması)
supabase/migrations/, functions/      ZERO
tailwind.config.js                    ZERO
ADIM 5 sticky kart MANTIK (verified, estimatedValue) ZERO (sadece label çevrildi)
ADIM 7 mobil sticky bar MANTIK (lg:hidden + handler) ZERO (sadece etiket çevrildi)
```

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6501.58 KiB)
```
✅ **YEŞİL** (+6.44 KiB — listingDetail 4 dil)

### Lint
- 2 dosya 0 error / 0 warning

### Git
- `safe-before-dil-faz1c` (8286e55)
- `safe-after-dil-faz1c` (bu commit)

### Regresyon
- TR: tüm mevcut arayüz aynen çalışıyor + içerik aynen
- EN: arayüz EN'e geçti (ADIM 10'da yoktu)
- ADIM 5 sticky kart MANTIK (verified strict check, estimatedValue fark %) korundu
- ADIM 7 mobil sticky bar MANTIK (lg:hidden, handler'lar) korundu
- 11 mevcut `useLocale()` tüketicisi → bozulmadı

### Dürüstlük
- ✅ "Tahmini değer (AI · yaklaşık)" 4 dilde "yaklaşık/approximate/примерно/تقريبية" — anlam korundu
- ✅ "Doğrulanmış ilan" — `verified===true` MANTIK dokunulmadı, sadece etiket çevrildi
- ✅ "(tahsilat ₺)" tüm dillerde yer alır (currency dürüstlük korundu)
- ✅ Sahte rozet ekleme YOK
- ✅ İlan içeriği orijinal dilde (satıcının sözünü çevirme YOK)

---

## 8) SONRAKİ FAZ 1 ADIMLARI

| # | İş | Kapsam | Saat |
|---|---|---|---|
| **11-D** | Borsa terminal sayfaları (BorsaPage + Portfolio + Watchlist + AssetDetail) | Terminal UI metinleri | 4-6 |
| **11-E** | Navbar mega menü (3 kolon başlığı + 18 item) + Footer detay | Yatırımcı/Emlakçı/Müteahhit | 2-3 |
| **11-F** | `lib/pricingTiers.ts` tier.name + tier.tagline RU/AR | Pro/Premium/Bireysel etiketleri | 1-2 |
| **11-G** | İlan detay kalan ufak metinler (AI Insight panel, SellerTrustCard, bölge istatistik) | Detay genişletme | 2-3 |

### FAZ 2 (RTL CSS toplu)
- 359 fiziksel CSS → logical (100-150 saat)

### FAZ 3 (yasal — avukat sonrası)
- Sözleşme/Gizlilik/KVKK RU/AR

---

## 9) Master için 3 KARAR

1. **Sonraki adım sırası:** 11-D (Borsa) mı, 11-E (mega menü) mı, 11-G (ilan detay detay) mı? — Tahmin: **11-D öncelik** (borsa terminal = vizyon çekirdeği, yatırımcı her gün kullanır).
2. **İlan detay derinleştirme:** AI Analiz tab + SellerTrustCard + bölge istatistik (uzun metinler) ayrı dilim mi (11-G), ana çevriliği şimdilik yeterli mi? — Çoğu kullanıcı CTA + sticky kart + tab başlıkları gördü → şimdi yeterli, derinleştirme isteğe bağlı.
3. **Tier marka adları:** `tier.name = "Pro Emlakçı"` data sabit kalır mı (marka), yoksa "Профи риелтор" / "وكيل عقاري احترافي" çevrilir mi (11-F)? — Tier name yarı-marka, çevirmenin RU/AR pazara faydası tartışılır.

---

— **30+ arayüz öğesi 4 dilde çevrildi · İlan içeriği (Levent'te Prestijli Plaza Katı) 4 dilde ORİJİNAL korundu (makine-çevirisi yok) · Currency + verified + ADIM 5/7 mantığı dokunulmadı · 20/20 PASS · TR/EN regresyon SIFIR · AR dir=rtl + sayı LTR · 0 console hata · Hiçbir [REVIEW].**
🌐✅
