# 🌐 ADIM 11-P — Lib Sabitleri i18n (izole tur, currency/çekirdek-domain hassas)

**Tarih:** 2026-06-03
**Tag baseline:** `safe-before-dil-11p` (09ee274)
**Doktrin:** ÇEKİRDEK MANTIK DOKUNMA — sadece saf görünür string render katmanında i18n'e bağlanır. Riskli/belirsiz → [REVIEW] + atla. **Lib dosyalarına SIFIR dokunuş.**

---

## ⚡ TEK-CÜMLELİK ÖZET

11-G/11-G-2 raporlarındaki 4 [REVIEW] lib sabiti sınıflandırıldı; **saf görünür etiketler** (MARKETING_MODE_LABELS badge + WEEKLY_AUCTION_SLOT/POLICY + FxRef note="işlem ₺") **render katmanında (AuctionDetail) 6 yeni anahtarla 4 dilde** çevrildi — **lib dosyaları (fees.ts/listingPolicy/listingNumber/FxRef/CurrencyContext) SIFIR diff**; SERVICE_FEE_LABELS render yerleri (HizmetBedelleri/CommissionCalculator) henüz i18n'siz olduğundan **[REVIEW] → ayrı hizmet-sayfası adımına ertelendi**; **ÇEKİRDEK HESAP korundu kanıtı: ana ₺ fiyat 4 dilde AYNI (₺28.5M)** (fees.ts/FX calc currency-agnostic, dokunulmadı); satış-modu rozeti 11-G leak'ini kapattı; **4 dil RENDER ✅ + AR dir=rtl + 0 pageerror**.

---

## 1) BLOK 1 — Envanter + SINIFLANDIRMA (bu turun kalbi)

| Lib sabiti | Kaynak | Sınıf | Render yeri | KARAR |
|---|---|---|---|---|
| `MARKETING_MODE_LABELS[mode].badge` | listingPolicy.ts | **SAF ETİKET** (mode KEY=mantık, badge=görünür) | AuctionDetail (i18n'lı) | ✅ `ld.marketingBadge[mode]` render'da |
| `MARKETING_MODE_LABELS[mode].headline/.hint` | listingPolicy.ts | saf etiket | CreateAuction (i18n'siz) | ⏭️ atla (sayfa kapsamda değil) |
| `WEEKLY_AUCTION_SLOT_TR` | listingNumber.ts | **SAF ETİKET** (ürün özeti, "yasal değil") | AuctionDetail | ✅ `ld.weeklySlot` render'da |
| `WEEKLY_AUCTION_POLICY_TR` | listingNumber.ts | **SAF ETİKET** (ürün özeti) | AuctionDetail | ✅ `ld.weeklyPolicy` render'da |
| `FxRef note="işlem ₺"` | AuctionDetail call site | **CURRENCY AÇIKLAMA** (FX calc ayrı) | AuctionDetail | ✅ `ld.fxNoteTransaction` çağrı yerinde |
| `SERVICE_FEE_LABELS` (8: "Ekspertiz Raporu" vb.) | fees.ts | **SAF ETİKET** ama render yerleri i18n'siz | HizmetBedelleri + CommissionCalculator + (report-viewer) | **[REVIEW]** → ayrı tur (aşağıda) |

### Bağlama yöntemi: **lib DOKUNULMADI** — hepsi AuctionDetail render katmanında çevrildi
- `MARKETING_MODE_LABELS` + `WEEKLY_*` import'ları AuctionDetail'den kaldırıldı (artık `ld.*` kullanılıyor); **lib dosyaları aynen duruyor** (başka tüketiciler için TR fallback).
- fees.ts'e **HİÇ dokunulmadı** (SERVICE_FEE_LABELS ertelendi).
- FxRef.tsx'e **HİÇ dokunulmadı** (note prop değeri call site'da değişti).

### ⏭️ SERVICE_FEE_LABELS neden ERTELENDİ ([REVIEW])
- Render yerleri: `HizmetBedelleri.tsx` (hizmet sayfası) + `CommissionCalculator.tsx` (mega) + olası report-viewer alt-bileşeni → **hiçbiri henüz i18n'lı değil.**
- İzole bağlama incoherent olur (etiket çevrili, çevre TR). fees.ts'i lib-seviyede i18n'e çevirmek (locale context lib'e sokmak) **invaziv + riskli** → doktrin "riskli olanı zorlama".
- **KARAR:** ayrı "hizmet/ücret sayfaları i18n" adımına (öneri: **11-Q**) ertelendi; o adımda HizmetBedelleri + CommissionCalculator + SERVICE_FEE_LABELS birlikte.

---

## 2) BLOK 2 — Sözlük Uyum
| Terim | Kaynak | Bu adım |
|---|---|---|
| İhale (satış-modu badge) | ld.badgeAuction (ADIM 13) | marketingBadge.auction = "İhale" **BİREBİR aynı** ✅ |
| ≈/yaklaşık + ₺ ibaresi | ADIM 8 currency | fxNoteTransaction (FX calc dokunulmadı) ✅ |
| TOPLAM ~543 terim |

### marketingBadge (4 dil) — 11-G [REVIEW] leak'ini kapatır
| mode | TR | EN | RU | AR |
|---|---|---|---|---|
| auction | İhale | Auction | Аукцион | مزاد |
| sealed_offers | Teklif al | Receive offers | Приём предложений | استقبال العروض |
| listing_only | Sadece ilan | Listing only | Только объявление | إعلان فقط |

---

## 3) BLOK 3 — Uygulama
### 3.1 `messages.ts` — `listingDetail` +6 anahtar (4 dil)
`marketingBadge{listing_only/sealed_offers/auction}` + `weeklySlot` + `weeklyPolicy` + `fxNoteTransaction`

### 3.2 `AuctionDetail.tsx` (render katmanı)
- `MARKETING_MODE_LABELS[marketingMode].badge` → `ld.marketingBadge[marketingMode]`
- `{WEEKLY_AUCTION_SLOT_TR}` → `{ld.weeklySlot}` ; `{WEEKLY_AUCTION_POLICY_TR}` → `{ld.weeklyPolicy}`
- `note="işlem ₺"` → `note={ld.fxNoteTransaction}`
- Kullanılmayan import temizliği: `MARKETING_MODE_LABELS` (listingPolicy bloğundan) + `WEEKLY_*` satırı kaldırıldı

### 3.3 ÇEKİRDEK MANTIK + LIB DOKUNULMADI (git diff = SIFIR)
```
fees.ts (SERVICE_FEES amount + komisyon/oran/hesap + SERVICE_FEE_LABELS)   ZERO
listingPolicy.ts (MARKETING_MODE_LABELS + resolveMarketingMode mantık)     ZERO
listingNumber.ts (WEEKLY_* + getListingNumber)                             ZERO
FxRef.tsx (FX calc + formatFromTry + currency referans)                    ZERO
CurrencyContext + placeBid + sealed + auth + namespaces                    ZERO
```
git status → sadece `messages.ts` + `AuctionDetail.tsx` ✅

---

## 4) BLOK 4 — RTL + BiDi (AR)
- ✅ `<html dir="rtl">` (test) + satış-modu rozeti / haftalık takvim AR'da hizalı
- ✅ FxRef note `dir="ltr"` blokta (₺ + ≈$ LTR — ADIM 8 korundu)
- ✅ Ana ₺ fiyat dir="ltr" (11-G'den)
- ✅ Yeni physical class YOK

---

## 5) BLOK 5 — Test (4 dil + ÇEKİRDEK HESAP sağlam)

### Matris
| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Satış-modu rozeti | İhale | Auction | Аукцион | مزاد |
| Haftalık slot | ✅ Her Çarşamba | ✅ Every Wednesday | ✅ Каждую среду | ✅ كل أربعاء |
| Haftalık politika | ✅ | ✅ per week | ✅ в неделю | ✅ أسبوعياً |
| FxRef note | n/a (TRY→null) | ✅ settled in ₺ | ✅ расчёт в ₺ | ✅ تتم بالليرة |
| TR sızıntısı (non-TR) | — | 0 ✅ | 0 ✅ | 0 ✅ |
| pageerror | 0 | 0 | 0 | 0 |

### ÇEKİRDEK HESAP korundu (bu turun kalbi — KANIT)
> **Ana ₺ fiyat 4 dilde AYNI: `₺28.5M`** → fees.ts komisyon hesabı + FX/FxRef referans değeri + listingPolicy/Number mantığı currency-agnostic ₺ üzerinde, **DEĞİŞMEDİ**. Currency gösterimi (≈$ non-TR) korundu (ADIM 8).
- git diff: fees.ts/listingPolicy/listingNumber/FxRef/CurrencyContext → **SIFIR diff**
- Satış-modu doğru çözüldü (auction "1" → "İhale"/"Auction"/...)

### REGRESYON (AR smoke 5 sayfa)
/ilan/1 + /ihaleler + /borsa + /panel + **/hizmet-bedelleri** → http 200 + rtl + 0 pageerror
> /hizmet-bedelleri (SERVICE_FEE_LABELS tüketicisi) çalışıyor — ertelendiği için TR kalıyor, kırılma yok.

### Build + Lint
- PWA v1.3.0 — 299 entries (**6619.50 KiB**, +2.24 KiB) ✅
- 2 dosya 0 error / 0 warning (kullanılmayan import temizlendi)

### Screenshots
`_audit/dil-11p/` → _test.mjs + lib-sabitleri-{tr,en,ru,ar}.png (AR-RTL)

---

## 6) GÜNCEL SÖZLÜK — ~543 terim
- 11-G-4 sonu = 537 + **11-P (6 yeni)** = ~543 terim, 4 dilde tutarlı

---

## 7) ANAYASA KANITLARI
- ✅ Build YEŞİL — 299 entries (6619.50 KiB)
- ✅ Lint 0 error
- ✅ Tag: `safe-before-dil-11p` (09ee274) → `safe-after-dil-11p`
- ✅ PUSH → `git log origin/main..HEAD` BOŞ
- ✅ **LIB SIFIR diff** · ÇEKİRDEK HESAP korundu (₺28.5M aynı) · FX/currency korundu

---

## 8) SONRAKİ
| # | İş |
|---|---|
| **[MAĞAZA]** | Mağaza modeli FİNAL kilit + yasal zemin (Master kararı bekliyor) |
| **11-Q** | Hizmet/ücret sayfaları i18n (HizmetBedelleri + CommissionCalculator + **SERVICE_FEE_LABELS** — ertelenen) |
| 11-O | Emlakçı + Müteahhit panel (mağaza sonrası) |
| FAZ 2 | 359 fiziksel CSS → logical RTL (toplu) |
| FAZ 3 | Yasal toplu: KVKK + Cayma + BID_GATE + Hemen Al/MODULE3/MESAFELİ + "ihale→Teklif Toplama Seansı" terim + escrow/onay-kapısı + tarih Intl + avukat |
| BACKLOG | Supabase staging E2E (auth-arkası + escrow) · AI çok-dilli yanıt (motor/prompt) · CreateAuction (headline/hint dahil) |

---

## 9) Master için 3 KARAR
1. **Lib turu bitti (güvenli kısım)** — SERVICE_FEE_LABELS hizmet sayfalarıyla birlikte 11-Q'da mı, yoksa şimdi mağaza/panel kararına mı geçilsin?
2. **MAĞAZA modeli:** FİNAL kilit + yasal zemin bekleniyor — i18n FAZ 1 ürün/ilan tarafını büyük ölçüde kapadı; mağaza kararı verilince panel (11-O) açılır mı?
3. **FAZ 3 yasal toplu:** ilan detay + bu turdan biriken legal/cayma metinleri avukat onaylı toplu çeviri planına hazır — ne zaman tetiklensin?

---

— **4 lib [REVIEW] sabiti sınıflandırıldı · 3 grup (marketing badge + weekly + FxRef note) render katmanında 6 anahtar 4 dilde çevrildi · LIB DOSYALARI SIFIR diff (fees/listingPolicy/listingNumber/FxRef/Currency) · SERVICE_FEE_LABELS riskli→[REVIEW] 11-Q'ya · ÇEKİRDEK HESAP korundu (₺28.5M 4 dilde aynı) · satış-modu 11-G leak kapandı · 4 dil RENDER ✅ · AR dir=rtl · TR sızıntısı 0 · 0 pageerror · regresyon temiz (5 sayfa) · ~543 terim.**
🌐🏛️🔒✅
