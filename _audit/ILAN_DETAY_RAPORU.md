# 🏠 ADIM 5 — İlan Detay (Currency + Vizyon Kozları, veri-dürüst)

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-ilan-detay`
**Doktrin:** placeBidRpc / sealed view / maskBidder / fees.ts / RLS / auth / payments / subscriptions / CurrencyContext mantığı DOKUNULMADI. Çekirdek tüm RPC'ler korundu. **UYDURMA VERİ YASAĞI** uygulandı — sadece `Auction` modelinde GERÇEKten VAR olan alanlar gösterildi.

---

## ⚡ TEK-CÜMLELİK ÖZET

`/ilan/:id` (AuctionDetail, 2052 satır) — sağ yan sticky özet kartına: ana ₺ fiyat altı `FxRef block` referans (≈ $X) + m² birim fiyatı FxRef + **estimatedValue VAR olduğu için** "Tahmini değer" + ₺ - tahmini fark yüzdesi + **verified alanı varsa rozet** (İlan #1 verified=false → rozet GÖRÜNMEZ ✅ dürüst); fiyat geçmişi grafiği ZATEN var (priceHistory dokunulmadı); sealed maskeleme + placeBidRpc tam korundu.

---

## 1) BLOK 1 — VERİ ENVANTERİ (kritik)

`src/types/auction.ts` — `Auction` interface'i:

| Veri alanı | Statü | Kullanım |
|---|---|---|
| `price`, `currentBid`, `startingBid` | ✅ VAR | Hero fiyat |
| `pricePerSqm` | ✅ VAR | m² birim fiyat (sticky kart) |
| **`estimatedValue`** (AI tahmini) | ✅ VAR | **Yeni "Tahmini değer" bölümü** + fark % |
| **`priceHistory: PricePoint[]`** | ✅ VAR | ZATEN render ediliyor — satır 1099-1114 AreaChart |
| **`verified: boolean`** | ✅ VAR | **Yeni Doğrulanmış rozeti** (SADECE true ise) |
| `priceChangeMonthly`, `priceChangeYearly` | ✅ VAR | (Bu turda yeni gösterim eklenmedi) |
| `aiPredictedPrice` | ✅ VAR | AI Teklif Önerisi'nde kullanılıyor |
| `areaStats.avgPricePerSqm` | ✅ VAR | Bölge ortalama (mevcut) |
| Gerçek bölgesel kapanış verisi (closing) | ❌ YOK | Bu bölüm **EKLENMEDİ** (uydurma yasak) |
| EİDS doğrulama detayı (sadece bool yok, ek alan yok) | ❌ YOK | Sadece `verified` bool kullanıldı |

→ **3 vizyon kozu eklendi** (estimatedValue + verified + priceHistory zaten vardı); **kapanış/EİDS detay** eklenmedi (veri yok).

---

## 2) BLOK 2 — Currency Bağlantısı

Sticky özet kartı (`AuctionDetail.tsx:1206-...`) güncellendi:

### Önce
```tsx
<div className="text-3xl font-bold text-blue-400">₺{liveBid.toLocaleString("tr-TR")}</div>
<div className="text-xs">₺{auction.pricePerSqm.toLocaleString("tr-TR")} / m²</div>
```

### Şimdi
```tsx
<div className="text-3xl font-bold text-blue-400">₺{liveBid.toLocaleString("tr-TR")}</div>
<FxRef amountTry={liveBid} variant="block" note="işlem ₺" />
<div className="text-xs">
  ₺{auction.pricePerSqm.toLocaleString("tr-TR")} / m²
  <FxRef amountTry={auction.pricePerSqm} variant="compact" />
</div>

{/* Tahmini değer (estimatedValue VAR) */}
{auction.estimatedValue > 0 && (
  <div className="mt-2 pt-2 border-t">
    <div className="text-[11px]">Tahmini değer (AI · yaklaşık)</div>
    <div className="text-sm font-semibold text-emerald-400">
      ₺{auction.estimatedValue.toLocaleString("tr-TR")}
      <FxRef amountTry={auction.estimatedValue} variant="compact" />
    </div>
    {liveBid > 0 && (
      <div className={`text-[11px] ${liveBid < auction.estimatedValue ? "text-emerald-500" : "text-amber-500"}`}>
        {liveBid < auction.estimatedValue
          ? `Tahmini değerin %${...} altında`
          : `Tahmini değerin %${...} üzerinde`}
      </div>
    )}
  </div>
)}

{/* Doğrulama rozeti — SADECE auction.verified=true ise */}
{auction.verified === true && (
  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 ...">
    <CheckCircle2 className="w-3 h-3" />
    Doğrulanmış ilan
  </div>
)}
```

Sealed durum: `currentBid`/`liveBid` zaten **sealed view'den gelen** maskelenmiş bedel; kimlik gizliliği bozulmadı.

---

## 3) BLOK 3 — UX (mevcut yapı kontrol)

**Mevcut yapı kanıtı (`AuctionDetail.tsx` grep):**
- `galleryBadges` (line 725) + `badges` prop'u (line 819) — **galeri zaten var** (`GalleryDialog`/`AuctionImageGallery`)
- 3 yerde `sticky` kullanım (sat 766, 932, 1204) — masaüstü için sticky panel **zaten mevcut**
- AuctionDetail 2052 satır, çok kapsamlı sayfa

**Bu turun kapsamı:** UX değişikliği YAPILMADI (mevcut galeri/sticky bozulmasın). Sadece sticky özet kartına content eklendi (referans + tahmini değer + rozet). **Mevcut kullanıcı yolculuğu korundu**, sticky yapı sayfa açılışında `transition-all opacity-700` zaten var.

Mobil sticky CTA (yeni) **ayrı dilim**: AuctionDetail zaten dolu (2052 satır), mobil için ayrıca bir alt sticky bar Master onayıyla bir başka turda eklenebilir.

---

## 4) BLOK 4 — VİZYON KOZLARI (SADECE gerçek veriyle)

| Vizyon kozu | Veri durumu | Eklenen UI |
|---|---|---|
| **Tahmini değer karşılaştırma** | ✅ `auction.estimatedValue` VAR | "Tahmini değer (AI · yaklaşık)" satırı + ₺ + FxRef + fark % (altında/üzerinde) — SADECE `> 0` ise |
| **Doğrulama rozeti** | ✅ `auction.verified` boolean VAR | "✓ Doğrulanmış ilan" rozet — SADECE `=== true` ise |
| **Fiyat geçmişi** | ✅ `priceHistory: PricePoint[]` VAR | ZATEN sayfada **render ediliyor** (line 1099 sekme + line 1103 AreaChart) — yeniden ek yapılmadı |
| **Gerçek bölge kapanışı** | ❌ Veri alanı YOK | **EKLENMEDİ** (uydurma yasak) — Master onayı sonra `closing_history` migration ile veri eklendiğinde uygulanabilir |
| **EİDS doğrulama detay** | ⚠️ Sadece bool var | Sadece bool rozet (detay alan yok) — ek metin uydurma olur, eklenmedi |

### Dürüstlük kanıtı

`Auction #1` için canlı test:
```json
"has_tahmini": true,          ← estimatedValue > 0, gösteriliyor ✅
"has_dogrulanmis": false      ← verified=false, rozet GÖRÜNMEZ ✅ (sahte göstermedi)
```

Master kuralı: *"sadece gerçek doğrulama verisi varsa rozet"* — uygulandı. Veri `false` ise rozet hiç render olmuyor. Sahte güven sıfır.

---

## 5) BLOK 5 — Dürüstlük + RTL-hazır

| Eleman | Statü |
|---|---|
| "≈" işareti her FxRef'te | ✅ |
| "yaklaşık" ifadesi tahmini değerde | ✅ ("AI · yaklaşık" başlık) |
| Doğrulama sadece gerçekse | ✅ (`=== true` strict kontrol) |
| Logical CSS — `ms-1`, `gap-1`, `mt-2` | ✅ Yeni satırlar logical |
| FxRef'te `dir="ltr"` | ✅ (BiDi-uyumlu, Arapça için hazır) |
| Açık emlak sayfası mı (dark mı) | Sayfa zaten KARMA — sticky kart hafif dark zemin (.card-luxury); FxRef amber soluk uyumlu |
| Sealed/maskBidder | ✅ DOKUNULMADI |

---

## 6) BLOK 6 — Canlı Kanıt (Playwright local 4173, USD seçili)

```json
{
  "detailUrl": "http://localhost:4173/ilan/1",
  "has_try": true,                ← ₺ ana fiyat ✅
  "has_usd_ref": true,            ← ≈ $ referans ✅
  "has_tahmini": true,            ← "Tahmini değer (AI · yaklaşık)" ✅
  "has_dogrulanmis": false,       ← İlan #1 verified=false → rozet YOK (DÜRÜST ✅)
  "has_birim_fiyat": true,        ← "/ m²" ✅
  "has_priceHistory": true,       ← "Fiyat Geçmişi" sekme zaten ✅
  "errs": []                      ← 0 console error
}
```

**5/6 PASS, 1 dürüst NEG** (negatif = doğru davranış — sahte rozet göstermemek).

---

## 7) DOKUNULAN DOSYALAR (1 dosya + 0 yeni — minimal cerrahi)

```
src/pages/AuctionDetail.tsx     (+30 / -3 satır)
   - import { FxRef } eklendi
   - Sticky kart fiyat altına FxRef block
   - m² birim yanına FxRef compact
   - YENİ: Tahmini değer satırı (estimatedValue VAR ise)
   - YENİ: Doğrulanmış rozet (verified === true ise)
```

**Çekirdek korundu (git diff):**
- ✅ `placeBidRpc`, `validateBid`, `preAuthorize` — DOKUNULMADI
- ✅ Sealed view, `maskBidder`, `liveBid`/`currentBid` mantığı — DOKUNULMADI
- ✅ `fees.ts`, RLS, auth, payments-iyzico, subscriptions
- ✅ CurrencyContext mantığı
- ✅ `estimatePropertyValue` hesap motoru — DOKUNULMADI (sayfa zaten `auction.estimatedValue` alanını okuyor)
- ✅ `priceHistory` AreaChart render mantığı — DOKUNULMADI
- ✅ AI Teklif Önerisi (sat 1222-...) — DOKUNULMADI

---

## 8) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6454.33 KiB)
```
✅ **YEŞİL**

### Lint
- Dokunulan 1 dosya 0 hata

### CLS
Sticky kart yeni içerikleri **koşullu** — sayfa açılışında veri varsa görünür, yoksa hiç render olmaz. Sayfa açıldığında zaten `auction.estimatedValue` mevcuttur (data hydration). CLS minimal.

---

## 9) KALAN İŞ (ayrı dilim — Master onayı)

| # | İş | Saat | Önkoşul |
|---|---|---|---|
| 1 | **Mobil alt sticky CTA bar** — birincil aksiyon (teklif/iletişim) küçük ekranda alt sabit | 1-2 | — |
| 2 | **Gerçek bölge kapanış verisi** UI — `closing_history` veri alanı/tablo gerek | 2-3 | DB migration + veri |
| 3 | **EİDS doğrulama detayı** — bool yetmez, detay alan (`verification_method`, `verified_at`) | 1 | DB schema genişletme |
| 4 | **Favori/karşılaştırma** rozet konumlandırma (mevcut hooks: useFavorites, useCompareSelection — bağlı ama detay sayfada hero yakınında daha öne çıkabilir) | 1 | — |
| 5 | **Galeri lightbox iyileştirme** — mevcut GalleryDialog var, mobile swipe + tam ekran zaten desteklenebilir | 1-2 | Kontrol |
| 6 | **AI fiyat öneri/Tahmini değer** referans satırı tooltip — uzun açıklama (örnek: hangi emsal kullanıldı) | 1 | — |

**Toplam ayrı dilim:** ~7-10 saat (Master sıra+onay).

---

## 📂 Audit Ayak İzi

```
_audit/
├── ILAN_DETAY_RAPORU.md         ← bu rapor
└── ilan-detay/
    ├── _test.mjs                 (Playwright /ilan/1 senaryo)
    └── ilan-usd.png              (canlı kanıt)
```

---

— **Currency referansı + tahmini değer + verified rozet (SADECE gerçekse) · priceHistory zaten render · sealed + placeBid + maskBidder korundu · UYDURMA YOK · 5/6 PASS, 1 dürüst NEG · çekirdek sıfır değişiklik.**
🏠✅
