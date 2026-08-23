# 🌐 FAZ 2 — DALGA 4: CSS Logical/RTL — kalan TÜM sayfalar (🎯 FAZ 2 KAPANIŞ)

**Tarih:** 2026-06-03 · **Tag:** `safe-before-faz2-d4` (523a6be) → `safe-after-faz2-d4`
**Doktrin:** Sadece YÖN; className-only. fees/motor MANTIK SIFIR. TAM-SİTE süpürme.

## ⚡ ÖZET
Kalan TÜM site (pages/sections/non-ui components) **619 fiziksel→logical** (113 dosya) — fraction-safe + responsive-prefix-aware precise sed; **TAM-SİTE SÜPÜRME: non-ui kalan = 0** 🎯; centering/arbitrary (12 dosya: left-1/2, left-[%]) + ui/* primitive (20 dosya, animasyon-eşleşmeli) → **[REVIEW]**; **className-only (string/comment/data mangle YOK, doğrulandı)**; **FEES korundu (bid-bond ₺250.000 4 dilde aynı)**; build YEŞİL + 4 dil 0 pageerror + AR dir=rtl. **FAZ 2 TAM KAPANDI — site RTL-hazır.**

## 1) DÖNÜŞÜM (619, 113 dosya)
| Token | → | ≈ |
|---|---|---|
| text-right | text-end | 151 |
| text-left | text-start | 72 |
| pl/pr-X | ps/pe-X | ~130 |
| ml/mr-X | ms/me-X | ~120 |
| left/right-N | start/end-N | ~140 |
| border-l/r | border-s/e | 2 |
> En büyük: ValuationTool(43), LandEquityPage(31), IBuyerPage(31), WarRoomPage(30), BorsaPage(29), Analytics(28), CommissionPage(27), EmlakciGiris(26)...
> Yöntem: 2 aşamalı precise sed — (1) sınır `(^|[ "`>])`, (2) responsive-prefix `:` + border. Fraction `left-1/2` (sonrası `/`) ve arbitrary `left-[` OTOMATİK hariç.

## 2) [REVIEW] — BIRAKILDI (ZORLANMADI)
| Grup | Adet | Sebep |
|---|---|---|
| **ui/* primitive** | 20 dosya (~115 token) | shadcn side-variant'ları slide-animasyonuyla EŞLEŞMİŞ (sheet/drawer/sidebar/menubar/dropdown/context-menu/navigation-menu/calendar/carousel/select) → eşgüdümlü rtl: animasyon ayrı tur (D1 doktrini) |
| **centering/arbitrary** | 12 dosya | left-1/2 (centering idiom), left-[20%]/left-[50%] (arbitrary) → mantıksal karşılık yok / -translate eşleşmeli |
| **yönlü ikon rotasyonu** | toplu | 50+ dosyada ok/chevron rtl:rotate-180 — ayrı odaklı ikon-yön turu (galeri D2'de yapıldı) |

## 3) ÇEKİRDEK SIFIR (className-only — DOĞRULANDI)
- fees.ts/komisyon-engine/rentalCommission/masterFinancial · kredi/değerleme motorları · Currency/FxRef/taxConfig · placeBid/sealed/auth/RLS → DOKUNULMADI
- Doğrulama: diff'te tüm `text-start/end` `className=` içinde; textAnchor/textAlign/data/string/comment mangle = 0
- JSX/mantık/recharts-data AYNEN

## 4) TEST (KANIT + TAM-SİTE SÜPÜRME)
- **TAM-SİTE SÜPÜRME 🎯:** non-ui pages/sections/components kalan fiziksel yön = **0** (ui+centering+arbitrary [REVIEW] hariç)
- **FEES TEST:** /komisyon-hesaplayici bid-bond (5M×%5) 4 dilde **AYNI ₺250.000** → hesap CSS sonrası bozulmadı
- **COMPUTED-STYLE:** text-start/end LTR→fiziksel (eski ile AYNI) / AR→aynalandı (D2/D3 kanıt deseni + CSS spec)
- **D1 byte-method** (animasyon-dondurulmuş byte-identical) + CSS spec garantisi
- **REGRESYON:** 4 dil × (/degerleme + /borsa + /hizmet-bedelleri) = 12/12 http 200 + dir doğru + **0 pageerror**; AR dir=rtl
- **className-only:** string/comment/data mangle YOK (doğrulandı)
- Build YEŞİL — 299 entries · Lint 0

## 5) 🎯 FAZ 2 TAM KAPANDI — site RTL-hazır
| Dalga | Kapsam | Durum |
|---|---|---|
| D1 | global/layout (Navbar/Footer/dialog/Toast) | ✅ (3-kanıt byte-identical) |
| D2 | ilan/borsa (+galeri rtl:rotate-180, sealed korundu) | ✅ |
| D3 | dashboard üçlüsü+GES+profil (GES motoru korundu) | ✅ |
| **D4** | **kalan TÜM site (619/113 dosya)** | ✅ |
> Non-ui sayfalarda fiziksel yön-sınıfı = **0**. Site 4 dilde (TR/EN/RU/AR) RTL-hazır.

## 6) KALAN TÜM [REVIEW] (toplu liste — FAZ 2 dışı, ayrı turlar)
1. **ui/* primitive RTL** (20 dosya): side-variant + animasyon eşgüdümlü rtl: → odaklı ui-primitive turu
2. **centering/arbitrary** (12 dosya): left-1/2 / left-[%] → -translate eşleşmeli, manuel
3. **yönlü ikon rotasyonu**: 50+ dosya ok/chevron rtl:rotate-180 → ikon-yön turu
4. **Toast slide-yönü** (D1): rtl:animate-slide-in-left keyframe (additive)

## 7) SONRAKİ
CreateAuction/ChatWidget/report-viewer i18n → SEO meta/hreflang (11-S) → [MAĞAZA kilit] → 11-O panel → FAZ 3 yasal toplu (11-R-2 + Madde 41-46 + KVKK/Cayma/BID_GATE) → ui-primitive RTL turu → ikon-yön turu.
BACKLOG: Supabase staging E2E · AI çok-dilli yanıt.

## 8) Master 3 KARAR
1. **🎯 FAZ 2 KAPANDI** (site RTL-hazır, non-ui yön=0) — sıra CreateAuction/ChatWidget i18n mi, SEO (11-S) mi, MAĞAZA mı?
2. **ui-primitive RTL [REVIEW]** (20 dosya, animasyon-eşgüdümlü): odaklı tur ne zaman?
3. **ikon-yön [REVIEW]** (50+ dosya rtl:rotate-180): toplu ikon turu açılsın mı?

— **619 fiziksel→logical (113 dosya) · TAM-SİTE non-ui yön=0 🎯 · ui/centering/arbitrary/ikon → [REVIEW] · className-only (mangle yok doğrulandı) · FEES korundu (₺250.000) · D1 byte-method+CSS spec · build YEŞİL · 4 dil 0 pageerror · AR dir=rtl · FAZ 2 TAM KAPANDI, site RTL-hazır.**
🌐🧭🎯✅
