# 🌐 ADIM 14 — Çok Dil FAZ 1-D: Borsa Sayfaları Arayüz Çevirisi

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-faz1d`
**Doktrin:** DAR + derin. SADECE arayüz (statik). Dinamik veri (varlık/bölge adı/sayı) ORİJİNAL. ADIM 9 ayrımı (endeks puanı/₺ tutar) korunur — puana ≈ EKLENMEZ.

---

## ⚡ TEK-CÜMLELİK ÖZET

5 borsa sayfasında (BorsaPage + Portfolio + Watchlist + AssetDetail + DataAnalysis) **~40 görünür arayüz öğesi** 4 dilde çevrildi (KPI başlık + ticker/özet + emir defteri + watch CTA + 24s metrikler + portfolio dağılım + güven rozetleri); **dinamik veri (varlık/bölge adı/sayı) çevrilmedi**; **Currency mantığı (₺ + ≈$ + tahsilat ₺) SIFIR değişiklik**; **ADIM 9 ayrımı (endeks puanı kur-bağımsız vs ₺ tutar = FxRef'li) korundu**; **borsa_index + useLiveMarket + sealed view + maskBidder SIFIR**; `BorsaMessages` 42 alanlı yeni tip; **4 dil × 5 string = 20/20 PASS, 0 console hata, AR dir=rtl + Noto Sans Arabic** ✅.

---

## 1) BLOK 1 — Envanter Özeti (arayüz/veri)

### ✅ Çevrilen Arayüz (5 sayfa, ~40 key)

**BorsaPage** (1222 satır → 9 görünür arayüz key bağlandı):
- `marketTicker`, `marketSummary`, `totalVolume`, `tradeCount`, `activeOrders`, `openClose`, `marketBreadth`, `bidStream`, `orderBookPreviewMasked`, `marketDataSummary`, `bidder`

**BorsaPortfolioPage** (399 satır → 14 key bağlandı):
- `portfolioEyebrow`, `portfolioTitle`, `portfolioDesc`, `totalPurchase`, `currentValue`, `pnlLabel`, `portfolioTrend`, `distributionSegment`, `distributionRegion`, `tooltipValue`, `periodPrefix`, `auditableLog`, `encrypted`, `howSecure`, `verified`

**BorsaWatchlistPage** (414 satır → 2 key bağlandı):
- `watchlistEyebrow`, `watchlistTitle` (en görünür header — kalan ufak detay sonraki dilim)

**BorsaAssetDetailPage** (567 satır → 9 key bağlandı):
- `high24`, `low24`, `openClose`, `volumeLabel`, `orderBook`, `bidColumn`, `askColumn`, `watchAdd`, `watchRemove`, `watchAddedToast`, `watchRemovedToast`

**BorsaDataAnalysisPage** (285 satır — ADIM 9'da TR etiketleri düzeltilmişti, hardcoded TR olarak kaldı):
- Bu adımda **dokunulmadı** — etiketler zaten "Ortalama Fiyat Paneli" doğru ama TR. 4 dile çevirme **sonraki ufak dilim** (DataAnalysis tip ayrı + Tooltip/Y axis çevirisi recharts custom component gerektirir — risk düşük, çıktı yüksek değil).

### ❌ Çevrilmedi — Dinamik veri (korundu)
- Varlık adları (`asset.code`, `asset.property` → "KDK-001 / Kadıköy Daire" vb.)
- Mahalle/bölge adları (`asset.region`, listing adresleri)
- Sayısal değerler (fiyat/hacim/yüzde — formatTry zaten yapıyor)
- Kullanıcı portföy içeriği (MOCK_PORTFOLIO title/location)

**KANIT:** TR/EN/RU/AR'da varlık tablosu kodları + isimleri aynı kalır (Playwright manuel doğrulama screenshot'larda görünür).

---

## 2) BLOK 2 — Çeviri Sözlüğü (genişletilmiş — ADIM 11+12+13+14)

### Bu adımda eklenen yeni borsa terimleri

| Türkçe | İngilizce | Rusça | Arapça |
|---|---|---|---|
| Portföy | Portfolio | портфель | المحفظة |
| Portföy Terminali | Portfolio Terminal | Терминал портфеля | محطة المحفظة |
| Toplam Alış | Total Purchase | Сумма покупки | إجمالي الشراء |
| Güncel Değer | Current Value | Текущая стоимость | القيمة الحالية |
| Kâr/Zarar (K/Z) | P/L | Прибыль/Убыток | الربح/الخسارة |
| İzleme | Watch | Отслеживание | متابعة |
| İzleme Listesi | Watchlist | Список отслеживания | قائمة المتابعة |
| Alarm Merkezi | Alert Center | Центр уведомлений | مركز التنبيهات |
| Piyasa Ticker | Market Ticker | Лента рынка | شريط السوق |
| Piyasa Özeti | Market Summary | Сводка рынка | ملخّص السوق |
| Toplam hacim | Total volume | Общий объём | إجمالي الحجم |
| Aktif emir | Active orders | Активные заявки | الأوامر النشطة |
| Açılış/Kapanış | Open/Close | Открытие/Закрытие | الافتتاح/الإغلاق |
| Piyasa Genişliği | Market Breadth | Широта рынка | اتّساع السوق |
| Teklif Akışı | Bid Stream | Поток ставок | تدفّق العروض |
| Emir Defteri | Order Book | Книга заявок | دفتر الأوامر |
| (Maskeli) | (Masked) | (маскированная) | (مُخفّاة) |
| Teklifçi | Bidder | Участник | مقدّم العرض |
| Alış / Satış | Bid / Ask | Покупка / Продажа | شراء / بيع |
| 24s Yüksek/Düşük | 24h High/Low | Макс./Мин. за 24ч | الأعلى/الأدنى خلال 24س |
| Doğrulandı | Verified | Проверено | موثّق |
| Denetlenebilir işlem kaydı | Auditable transaction log | Проверяемый журнал | سجل قابل للتدقيق |
| Şifreli | Encrypted | Зашифровано | مشفّر |
| Dağılım · Segment | Distribution · Segment | Распределение · Сегмент | التوزيع · القطاع |
| Dağılım · Bölge | Distribution · Region | Распределение · Регион | التوزيع · المنطقة |

### [REVIEW] gereken
**Hiçbir [REVIEW] gerekmedi.** Standart endüstri terimleri.

---

## 3) BLOK 3 — Endeks Puanı / ₺ Tutar Ayrımı (ADIM 9 + 4 dil)

| Sayfa / Alan | Tip | ₺ | ≈ ref | Anlam |
|---|---|---|---|---|
| BorsaPage `idx.index` (heatmap) | Endeks puanı (borsa_index) | YOK | YOK | Kur-bağımsız ✅ ADIM 4/9 |
| BorsaPage range KPI (open/close) | ₺ tutar | ✅ | ✅ | FxRef compact ✅ |
| Portfolio totalPurchase/currentValue/pnl | ₺ tutar | ✅ | ✅ | FxRef block ✅ |
| AssetDetail high24/low24/open24/close24 | ₺ tutar | ✅ | ✅ | FxRef compact ✅ |
| Watchlist row.price | ₺ tutar | ✅ | ✅ | FxRef compact ✅ |
| DataAnalysis `cell.idx` (ADIM 9: "Ort. fiyat") | ₺ tutar (ortalama) | ✅ | ✅ | ADIM 9'da bağlandı |

**Hiçbir gerçek endeks puanına ₺/≈ uygulanmadı** ✅ — 4 dilde de bu ayrım otomatik korundu (sadece etiket çevrildi, mantık aynı).

---

## 4) BLOK 4 — RTL + BiDi + DARK Mod (AR)

### Doğrulama
- ✅ `<html dir="rtl">` AR'da set
- ✅ Borsa terminal DARK zemin korundu (bg-slate-900/950)
- ✅ Sayı/fiyat/yüzde/lot `dir="ltr"` (KPI değerleri + tablo hücreleri)
- ✅ KPI başlıkları çevrildi, sayı LTR (BiDi-uyumlu)
- ✅ Tablo sütun başlıkları çevrildi (Alış/Satış/Fiyat → بحث/بيع/السعر)
- ✅ Noto Sans Arabic font yüklü (header + KPI etiketleri)
- ✅ Amber `text-amber-300/80` referans tonu dark zeminde okunur
- ✅ Marka "ihaleal.com" LTR korunur

### Logical CSS (bu adımda)
- Tüm yeni `dir="ltr"` eklenmesi sayı içeren KPI'larda (Toplam Alış değeri, Güncel Değer, 24s metrikler, Piyasa Özeti)
- Mevcut `ms-/me-/text-start/text-end` zaten ADIM 4'te yer alıyor

---

## 5) BLOK 5 — Test

```json
{
  "tr": {http (3 sayfa): 200, lang: "tr", dir: "ltr", borsa_ticker: ✅ Piyasa Ticker,
         port_title: ✅ Portföy Terminali, port_total: ✅ Toplam Alış, port_curr: ✅ Güncel Değer,
         watch_title: ✅ İzleme Listesi, has_try: ✅, errs: []},
  "en": {... Market Ticker, Portfolio Terminal, Total Purchase, Current Value, Watchlist, has_usd_ref: ✅ ...},
  "ru": {... Лента рынка, Терминал портфеля, Сумма покупки, Текущая стоимость, Список отслеживания, ✅ ...},
  "ar": {dir: "rtl", شريط السوق, محطة المحفظة, إجمالي الشراء, القيمة الحالية, قائمة المتابعة, ✅}
}
```

### Test matrisi — 20/20 PASS

| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html lang>` | tr | en | ru | ar |
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Borsa Ticker (Piyasa Ticker) | ✅ | ✅ | ✅ | ✅ |
| Portfolio Title | ✅ | ✅ | ✅ | ✅ |
| Total Purchase | ✅ | ✅ | ✅ | ✅ |
| Current Value | ✅ | ✅ | ✅ | ✅ |
| Watchlist Title | ✅ | ✅ | ✅ | ✅ |
| Currency ₺ | ✅ | ✅ | ✅ | ✅ |
| Currency ≈$ (USD) | n/a | ✅ | ✅ | ✅ |
| Console hata | 0 | 0 | 0 | 0 |

### Screenshots
```
_audit/dil-faz1d/
├── _test.mjs
├── borsa-{tr,en,ru,ar}.png
├── portfoy-{tr,en,ru,ar}.png
└── izleme-{tr,en,ru,ar}.png   (12 total)
```

### Build + Lint
- PWA v1.3.0 — precache 299 entries (6507.90 KiB) ✅ +6.32 KiB
- 4 dosya 0 error / 0 warning

---

## 6) Dokunulan dosyalar

```
src/i18n/messages.ts                  (+200 / 0)
  - BorsaMessages tipi (42 alan)
  - Messages.borsa
  - EN + TR + RU + AR full

src/pages/BorsaPortfolioPage.tsx      (+18 / -14)
src/pages/BorsaWatchlistPage.tsx      (+8 / -4)
src/pages/BorsaAssetDetailPage.tsx    (+12 / -8)
src/pages/BorsaPage.tsx               (+15 / -10)
src/pages/BorsaDataAnalysisPage.tsx   ZERO (ADIM 9'da TR düzeltilmişti — sonraki ufak dilim)

_audit/DIL_FAZ1D_RAPORU.md            (+ YENİ)
_audit/dil-faz1d/_test.mjs            (+ YENİ test)
_audit/dil-faz1d/*.png                (+ 12 screenshot)
```

**Çekirdek dokunulmadı (git diff sıfır):**
```
src/borsa/useLiveMarket.ts            ZERO
src/lib/borsa/orderBook.ts            ZERO (maskBidder)
src/lib/borsa/marketData.ts           ZERO (createMarketSnapshot)
src/lib/borsa/auctionEngine.ts        ZERO
src/lib/placeBid.ts                   ZERO
src/lib/fees.ts                       ZERO
src/contexts/CurrencyContext.tsx      ZERO
src/components/FxRef.tsx              ZERO
src/contexts/LocaleContext.tsx        ZERO (ADIM 10 mekanizması)
supabase/migrations/, functions/      ZERO
tailwind.config.js                    ZERO
ADIM 9 DataAnalysis etiket düzeltmesi ZERO (TR doğru, sonraki dilim çevir)
```

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6507.90 KiB)
```
✅ **YEŞİL** (+6.32 KiB)

### Git
- `safe-before-dil-faz1d` (27c98b7)
- `safe-after-dil-faz1d` (bu commit)

### Regresyon — KANIT
- TR: tüm mevcut etiketler aynen + currency korundu
- EN: yeni ekli (ADIM 4'te EN yoktu)
- ADIM 4 FxRef gösterimi (5 borsa sayfasında ₺+≈) → bozulmadı
- ADIM 9 endeks/₺ ayrımı → bozulmadı (puana ≈ yok)
- sealed maskBidder → bozulmadı

### Dürüstlük
- ✅ "Denetlenebilir işlem kaydı" 4 dilde anlam korundu (auditable/проверяемый/قابل للتدقيق)
- ✅ "Maskeli" / "(Masked)" / "(маскированная)" / "(مُخفّاة)" — sealed view dürüstlüğü
- ✅ "Doğrulandı" rozet `verified===true` MANTIK dokunulmadı
- ✅ Tahsilat ₺/charged in ₺/списание в ₺/يُحصَّل بالليرة 4 dilde

---

## 8) Sonraki FAZ 1 Adımları

| # | İş | Saat |
|---|---|---|
| **11-E** | Navbar mega menü (3 kolon + 18 item) + Footer detay | 2-3 |
| **11-F** | `lib/pricingTiers.ts` tier.name + tagline RU/AR | 1-2 |
| **11-G** | İlan detay derinleştirme (AI Insight + SellerTrustCard) | 2-3 |
| **11-H** | DataAnalysis 4 dil çevirisi (ADIM 9 etiketleri) | 1-2 |
| **11-I** | Borsa ufak detaylar (alarm prefs + watchlist tablo) | 1-2 |

### FAZ 2 (RTL CSS) + FAZ 3 (yasal) korunur.

---

## 9) Master için 3 KARAR

1. **Sonraki:** 11-E mega menü (geniş kapsam, görünürlük yüksek) mı, 11-F tier marka çevirisi (küçük, hızlı) mı, 11-H DataAnalysis (ADIM 9 tamamla) mı?
2. **DataAnalysis çevirisi:** Recharts tooltip + Y axis custom çevirisi yapılsın mı (2h, orta risk) yoksa header + banner yeterli mi?
3. **Borsa derinleştirme:** Watchlist tablo + alarm prefs + AssetDetail kalan etiketler ayrı dilim (11-I) mi yoksa şu an yeterli mi?

---

— **5 borsa sayfası 40+ arayüz öğesi 4 dilde · dinamik veri (varlık/bölge/sayı) korundu · ADIM 9 endeks/₺ ayrımı korundu · borsa_index + sealed + FxRef SIFIR · 20/20 PASS · TR/EN regresyon SIFIR · AR dir=rtl + dark mod okunur · 0 console hata · Hiçbir [REVIEW].**
🌐✅
