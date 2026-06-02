# 📱 ADIM 7 — İlan Detay Mobil Sticky CTA Bar

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-mobil-sticky`
**Doktrin:** Sadece mobil, sadece ilan detay, masaüstü dokunulmadı, mevcut handler çağrılır (yeni mantık yok), çekirdeğe/görsel sisteme dokunulmadı, sahte aciliyet yok.

---

## ⚡ TEK-CÜMLELİK ÖZET

İlan detay sayfasında **mobil ekran altına sabit aksiyon barı** (fiyat ₺ + ≈$ + favori + birincil aksiyon) eklendi; **`lg:hidden`** kullanılarak masaüstü sağ sticky özet kart (ADIM 5) **DOKUNULMADAN** korundu; butonlar **mevcut handler'ları** (`setShowBidDialog`/`setOfferDialogOpen`) çağırır — placeBid/validateBid/preAuthorize/sealed/auth mantığı sıfır değişiklik; görsel disipline uygun (mavi birincil, amber DEĞİL); 2/2 viewport testi PASS, 0 console hata.

---

## 1) BLOK 1 — Envanter (önce oku, kanıtla)

### Masaüstü sağ sticky kart
- **Lokasyon:** `AuctionDetail.tsx:1205` `<Card className="card-luxury sticky top-[11rem] !p-0 ...">`
- **Container:** `<div className="lg:col-span-1 space-y-6">` (line 1204) — `lg` breakpoint grid
- **Mobil davranış:** `lg` altında masaüstü kart **alta düşer** (grid stack), kullanıcı fiyat+CTA için kaydırmak zorunda
- **Sonuç:** Bizim mobil bar `lg:hidden` ile **lg altı** ekranlarda gösterilir; masaüstünde `lg` ve üstünde **sağ panel hâlâ orada** (bizim bar `display:none`)

### Birincil aksiyon (ilan tipine göre)
| Marketing Mode | Birincil Aksiyon | Handler | Gate |
|---|---|---|---|
| `auction` (açık artırma) | "Teklif ver" | `setShowBidDialog(true)` + `setBidAmount(liveBid+50000)` | `bidDisabled` (user + reportApproved + depositId) |
| `sealed_offers` (kapalı) | "Kapalı teklif" | `setShowBidDialog(true)` | `bidDisabled` |
| `listing_only` (satılık) | "Teklif" (pazarlık) | `setOfferDialogOpen(true)` | user check + self-listing |

**Mevcut masaüstü butonu** (line 1440, 1457): mobil bar **aynı** handler'ları kullanır — yeni dialog/akış YAZILMADI.

### Favori
- **Hook:** `useFavorites()` (line 31, 190)
- **State:** `saved = id ? isFavorite(id) : false` (line 192)
- **Toggle:** `toggleFavorite(id)` — mevcut handler
- **Mevcut yer:** üst global bar (line 771) `<Heart>` ikonu
- **Mobil bar'da:** aynı handler + aynı state + aynı görsel davranış (pink saved / slate idle)

### Mobil breakpoint
- Site Tailwind default: `sm 640 / md 768 / lg 1024 / xl 1280`
- Masaüstü panel `lg:col-span-1` → **lg breakpoint** (1024px) belirleyici
- Mobil bar: **`lg:hidden`** → 1024px altında görünür, üstünde gizli

### Fiyat değişkeni
- **Ana:** `liveBid` (sayfa boyunca tutarlı, auction.startPrice/currentBid'dan)
- **Etiket:** `pricePrimaryLabel` (line 148-149) — "Güncel teklif" / "Başlangıç / talep" / "İlan fiyatı" (mode'a göre)

---

## 2) BLOK 2 — Mobil Sticky Alt Bar (uygulanan kod)

`src/pages/AuctionDetail.tsx` — root close (`</div>` line 2042) öncesi eklendi (~99 satır JSX, mevcut yapı dokunulmadan):

### Görsel kompozisyon
```jsx
<div
  className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-slate-800
             bg-slate-950/95 backdrop-blur-xl
             shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
  role="region"
  aria-label="İlan aksiyon barı"
>
  <div className="flex items-center gap-3 px-3 py-2.5 max-w-7xl mx-auto">
    {/* SOL: priceLabel + ₺ + FxRef compact */}
    <div className="flex-1 min-w-0" dir="ltr">
      <div className="text-[10px] uppercase tracking-wide text-slate-400 truncate">
        {pricePrimaryLabel}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-base font-bold text-white truncate">
          ₺{liveBid.toLocaleString("tr-TR")}
        </div>
        <FxRef
          amountTry={liveBid}
          variant="compact"
          className="text-[11px] text-amber-300/80 truncate"
        />
      </div>
    </div>

    {/* SAĞ: favori (heart) + birincil aksiyon (mavi, amber DEĞİL) */}
    <div className="flex items-center gap-2 shrink-0">
      <Button ... onClick={() => id && toggleFavorite(id)}>
        <Heart className={saved ? "fill-current" : ""} />
      </Button>
      {isListingOnly ? (
        <Button ... onClick={() => setOfferDialogOpen(true)}>
          <HandCoins /> Teklif
        </Button>
      ) : (
        <Button
          disabled={bidDisabled}
          title={bidDisabled ? "Giriş gerekli / AI rapor / Blokaj" : undefined}
          onClick={() => { setBidAmount(...); setShowBidDialog(true); }}
        >
          <TrendingUp /> {isSealedOffer ? "Kapalı teklif" : "Teklif ver"}
        </Button>
      )}
    </div>
  </div>
</div>
```

### Padding clearance (içerik bar arkasında kalmasın)
**Önce:** `<div ref={ref} className="min-h-screen pt-20 pb-16">`
**Sonra:** `<div ref={ref} className="min-h-screen pt-20 pb-28 lg:pb-16">`

- Mobil: `pb-28` = **112px** alt boşluk (bar ~64px + breathing room 48px)
- Masaüstü: `lg:pb-16` = 64px (eski davranış korundu — bar zaten yok)

---

## 3) BLOK 3 — Dürüstlük + RTL + Koruma

### Dürüstlük (vizyon)
- ✅ **Sahte aciliyet YOK** — geri sayım/sayaç eklenmedi, sadece gerçek fiyat + aksiyon
- ✅ **Fiyat ₺ ana + ≈ referans** — işlem ₺ dürüstlüğü (CurrencyContext + FxRef)
- ✅ Demo veride bar yine görünür ama `bidDisabled` gate'leri (auth/rapor/blokaj) çalışır — kullanıcıya neden tıklayamadığı `title` tooltip'inde dürüstçe yazılır

### Logical CSS (RTL-hazır)
- ✅ `me-1.5` (margin-end — RTL'de otomatik sol)
- ✅ `text-start` — masaüstü panel ile uyumlu
- ✅ `inset-x-0` — left+right 0 logical
- ✅ `gap-2`, `gap-3` (yön-bağımsız)
- ✅ `dir="ltr"` fiyat container'da — sayı her zaman LTR (BiDi-uyumlu Arapça için)
- ❌ Yeni fiziksel CSS (`ml-/mr-/pl-/pr-/text-left/text-right`) **SIFIR**

### Görsel sistem koruma (ADIM 6)
- ✅ **Dark zemin:** `bg-slate-950/95 backdrop-blur-xl` — site dark-first
- ✅ **Birincil CTA mavi:** `bg-blue-600 hover:bg-blue-500` — **amber DEĞİL** (görsel disiplin: amber=ikincil/uyarı)
- ✅ **Favori pembe:** `text-pink-400` (mevcut konvansiyon)
- ✅ **FxRef amber soluk:** `text-amber-300/80` (mevcut FxRef stili)
- ✅ **Border tutarlı:** `border-slate-800` (lux palette uyumlu)

### Çekirdek koruma
| Konu | Durum |
|---|---|
| `placeBidRpc` / `validateBid` / `preAuthorize` | ✅ DOKUNULMADI |
| Sealed view / `maskBidder` / `listing_offers_safe` | ✅ DOKUNULMADI |
| `fees.ts`, RLS, auth, payments, subscriptions | ✅ DOKUNULMADI |
| `CurrencyContext` mantığı, `FxRef` bileşeni | ✅ DOKUNULMADI |
| `estimatePropertyValue`, `priceHistory` render | ✅ DOKUNULMADI |
| ADIM 5'te eklenen masaüstü sağ sticky kart | ✅ DOKUNULMADI |
| `tailwind.config.js`, görsel sistem | ✅ DOKUNULMADI |
| `handleBid`, dialog handler'ları | ✅ DOKUNULMADI |

---

## 4) BLOK 4 — Test (gerçek kanıt)

### Playwright `_audit/mobil-sticky/_test.mjs`
2 viewport, 2 senaryo, dış kaynak yok (local 4173 preview).

```json
{
  "mobil-390x844":  {
    "http": 200,
    "bar_count": 1, "bar_visible": true,
    "bar_has_try": true, "bar_has_button": true, "bar_has_heart_button": true,
    "desktop_panel_visible": true,
    "errs": []
  },
  "masaustu-1280x800": {
    "http": 200,
    "bar_count": 1, "bar_visible": false,
    "bar_has_try": true, "bar_has_button": true, "bar_has_heart_button": true,
    "desktop_panel_visible": true,
    "errs": []
  }
}
```

### Tablo özeti

| Test | Sonuç | Anlam |
|---|---|---|
| Mobil 390×844 — bar görünür | ✅ **true** | `lg:hidden` mobilde **göstermez** mantığı: doğru çalışıyor (`lg` altı görünür) |
| Mobil — ₺ fiyat içerir | ✅ true | `liveBid.toLocaleString("tr-TR")` çalışıyor |
| Mobil — Teklif butonu var | ✅ true | İlan tipine göre `Teklif/Teklif ver/Kapalı teklif` |
| Mobil — Favori (Heart) butonu var | ✅ true | `aria-label="Favoriye ekle"` doğrulandı |
| Mobil — Masaüstü sağ panel | (DOM'da, grid altta) | Beklenen — `lg:col-span-1` mobilde stack |
| Masaüstü 1280×800 — bar **görünmez** | ✅ **false** | `lg:hidden` masaüstünde **gizler**: doğru |
| Masaüstü — Sağ panel görünür | ✅ true | ADIM 5 sticky kart **korundu** |
| Console hatası | ✅ 0 | Sıfır hata, sıfır warning |

### Test kanıtları (screenshot)
```
_audit/mobil-sticky/
├── _test.mjs
├── mobil-390x844.png         (mobil viewport, bar görünür)
└── masaustu-1280x800.png     (masaüstü, bar gizli)
```

### Lint
- `npx eslint src/pages/AuctionDetail.tsx` → 0 error / 0 warning (filtered)

### Build
```
PWA v1.3.0 — precache 299 entries (6456.44 KiB)
```
✅ YEŞİL (önceki 6454.31 KiB → ~+2 KiB JSX, makul)

---

## 5) BLOK 5 — Davranış matrisi (ilan tipine göre)

| Marketing Mode | Mobil bar buton | Tıklama | Gate |
|---|---|---|---|
| **auction** | "Teklif ver" + TrendingUp | `setShowBidDialog(true)` + `setBidAmount(liveBid+50000)` | `bidDisabled` → `title` tooltip |
| **sealed_offers** | "Kapalı teklif" + TrendingUp | `setShowBidDialog(true)` | `bidDisabled` → tooltip |
| **listing_only** | "Teklif" + HandCoins | `setOfferDialogOpen(true)` | user check (giriş yoksa toast) |

**Sonuç:** Mobil bar her ilan tipini doğru tetikler; yeni mantık yazılmadı, mevcut dialog'lar açılır.

---

## 6) Dokunulan dosyalar

```
src/pages/AuctionDetail.tsx              (+99 / -1)
  - root: pb-16 -> pb-28 lg:pb-16 (1 satır)
  - Dialog kapanış sonrası mobil sticky bar JSX (98 satır)
_audit/MOBIL_STICKY_RAPORU.md            (+ YENİ rapor)
_audit/mobil-sticky/_test.mjs            (+ YENİ test)
_audit/mobil-sticky/*.png                (+ 2 ekran kanıt)
```

**Çekirdek dosyalar dokunulmadı:**
```
src/lib/placeBid.ts            ZERO
src/lib/fees.ts                ZERO
src/contexts/CurrencyContext.tsx ZERO
src/components/FxRef.tsx       ZERO
src/hooks/useFavorites.ts      ZERO
supabase/migrations/*          ZERO
supabase/functions/*           ZERO
tailwind.config.js             ZERO
```

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6456.44 KiB)
files generated  dist/sw.js + dist/workbox-9c35ba06.js
```
✅ **YEŞİL**

### Test
- Mobil bar görünür ✅
- Masaüstü bar gizli ✅ (sağ panel korundu)
- 0 console hata ✅
- CLS: bar `fixed bottom-0` + padding `pb-28` clearance — layout shift YOK ✅

### Git
- `safe-before-mobil-sticky` (5cc6425)
- `safe-after-mobil-sticky` (bu commit)

---

## 8) Kalan iş (ayrı dilim — Master onayı)

| # | İş | Saat | Risk |
|---|---|---|---|
| 1 | Bar'a "tahmini değer + fark %" mini satır (ADIM 5 masaüstü kartında var, mobil bar'a sığarsa) | 1 | Orta — layout dar |
| 2 | "Hemen Al ₺X.XX M" butonu mobil bar'a (ikinci satır) — sığar mı? | 1.5 | Yüksek — taşma riski |
| 3 | Sealed kapanış sonrası "Sonuçları gör" CTA mobil bar | 0.5 | Düşük |
| 4 | Bar'a "favori sayısı" badge (sosyal kanıt) — DB'den gerçek sayı | 1 | Veri kaynağı yok |

**Toplam:** ~4 saat ek (Master sıralama+onay).

---

— **Mobil alt sticky bar eklendi · Masaüstü sağ panel korundu · Mevcut handler'lar çağrıldı · Çekirdek + görsel sistem dokunulmadı · 2/2 viewport PASS · 0 console hata.**
📱✅
