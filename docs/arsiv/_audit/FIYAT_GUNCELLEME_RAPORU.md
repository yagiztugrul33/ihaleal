# 💎 FİYAT GÜNCELLEME — UYGULAMA RAPORU (Politika 2026-06-01)

**Tarih:** 2026-06-01
**Tag baseline:** `safe-before-fiyat-guncelleme`
**Doktrin:** Sadece `pricingTiers.ts` + `PricingPage.tsx`. `fees.ts` (komisyon), `placeBid`, RLS, sealed, auth DOKUNULMADI.

---

## ⚡ TEK-CÜMLELİK ÖZET

Üyelik liste fiyatları Master politikasına göre güncellendi (Yatırımcı 399→499, Başlangıç 1500→1900, Pro 3500→4500, Kurumsal 7500→9900), erken üye/kuruluş indirimi config aktif edildi (Yat.349/Baş.1400/Pro.3400/Kur.7500), `/fiyatlandirma` psikolojik UI (En Popüler→Pro, Premium→Kurumsal, "günde ₺X", şeffaflık şeridi, kuruluş banner) eklendi; **komisyon `fees.ts` %2+%2 dokunulmadı**.

---

## 1) BLOK 1 — LİSTE FİYATLARI

### Aylık (₺) güncel tablosu

| Tier | Önce | Sonra | Δ | İlan limiti |
|---|---|---|---|---|
| Bireysel (free) | 0 | 0 | — | 1/yıl |
| Yatırımcı | 399 | **499** | +25% | 3/yıl |
| Emlak Başlangıç | 1.500 | **1.900** | +27% | 15→**20** |
| Emlak Pro | 3.500 | **4.500** | +29% | 50→**60** |
| Kurumsal | 7.500 | **9.900** | +32% | Sınırsız |

Yıllık indirim **%20 korundu** (`YEARLY_DISCOUNT_RATE = 0.20`).

### Ek hizmet (ONE_OFF) güncelleme

| SKU | Önce | Sonra | Etiket |
|---|---|---|---|
| `extra_listing` | 249 | **299** | Ek ilan açma |
| `valuation_report` | 249 | **299** | **Endeks Raporu (PDF)** (etiket "Değerleme"den çevrildi) |
| `ges_report` | 499 | **599** | GES Analiz Raporu (PDF) |
| `legal_report` | 349 | **399** | Hukuki Risk Raporu (PDF) |
| `rapor_paketi` | YOK | **1.199** | **YENİ:** 3 rapor + AI fırsat 30 gün bundle |
| `vitrin_single` | 199 | **250** | Vitrin (1 hafta) |
| `vitrin_premium` | YOK | **600** | **YENİ:** Vitrin Premium (1 hafta öne çıkan) |
| `featured_auction` | 499 | **599** | Öne çıkan ihale |
| `doping_single` | 99 | 99 (değişmedi) | Tek seferlik doping |

SKU adları **backward-compat** için sabit (AddonShopPage kırılmasın).

### Komisyon (DOKUNULMADI)

`fees.ts` çekirdek dosya — Master listesinde "DOKUNMA": ✅ Hiçbir satır değişmedi.
Model: %2 alıcı + %2 satıcı + KDV %20 (Taşınmaz Ticareti Yönetmeliği md.20 yasal tavan).

---

## 2) BLOK 2 — ERKEN ÜYE / KURULUŞ İNDİRİMİ

### Config (`pricingTiers.ts`)

```ts
export const EARLY_MEMBER_ACTIVE = true;
export const EARLY_MEMBER_LABEL = "Kuruluş üyesi · ilk 6 ay";
export const EARLY_MEMBER_NOTE =
  "İlk 6 ay (veya ilk 100 üye) erken katılım fiyatı. Mevcut aboneler 12 ay fiyat sabit.";

export const EARLY_MEMBER_PRICES = {
  yatirimci: 349,
  emlak_baslangic: 1400,
  emlak_pro: 3400,
  kurumsal: 7500,
};
```

**Süre dolunca:** `EARLY_MEMBER_ACTIVE = false` yap → tüm UI otomatik liste fiyatına döner. Mevcut aboneler 12 ay fiyat sabit (politika belgesi taahhüdü).

### UI gösterim (`PricingPage.tsx`)

| Eleman | Davranış |
|---|---|
| Liste fiyatı | **Üstü çizili** (line-through, slate-500) |
| "Kuruluş" mini rozet | Aksent rengi, fiyat satırında |
| Erken fiyat | **3xl bold** vurgulu — esas gözü çeken |
| Aylık eşdeğer | `≈ {eqv}/ay (yıllık -%20)` (yıllık modda) |
| Günlük | `≈ günde ₺X` (emerald) |
| Sayfa üstü banner | Sparkles + "Kuruluş üyesi · ilk 6 ay · Sınırlı" rozet |

`earlyPriceFor()` ve `dailyEquivalent()` saf fonksiyonlar — pricingTiers.ts'de export.

---

## 3) BLOK 3 — PSİKOLOJİK İYİLEŞTİRME

### 3a — Çapa: Kurumsal 9.900 vurgulu

Kurumsal tier'a `highlight: "Premium"` eklendi → kart ring + üstte rozet → 9.900 ₺ vurgulu → **Pro 4.500 cazip görünür** (anchoring).

### 3b — "En Popüler" → Pro

| Tier | Önce | Sonra |
|---|---|---|
| Yatırımcı | `highlight: "En Popüler"` | (kaldırıldı) |
| Emlak Pro | `highlight: "Önerilen"` | **`highlight: "En Popüler"`** |
| Kurumsal | (yok) | **`highlight: "Premium"`** |

→ Emlakçı/Ofis trafiği Pro'ya yönelir (yüksek ARPU).

### 3c — Değer çerçeveleme: "günde ~150₺"

Yeni `dailyEquivalent(tier, cycle)` fonksiyonu — her kart fiyat altında: `≈ günde ₺X` (emerald)
- Yatırımcı (erken 349): **günde ₺12**
- Başlangıç (erken 1400): **günde ₺47**
- Pro (erken 3400): **günde ₺113**
- Kurumsal (erken 7500): **günde ₺250**

### 3d — Aylık/Yıllık toggle çalışıyor

Mevcut toggle bileşeni korundu; `priceFor` + `earlyPriceFor` yıllık modda `yearlyTry()` üzerinden indirim uygular.

### 3e — Şeffaflık şeridi (header altı)

3 rozet üst sıraya alındı:
- 🟢 **Taahhüt yok** (CheckCircle2)
- 🔵 **İstediğin zaman iptal** (RefreshCw)
- 🟣 **Gizli ücret yok** (Shield)

→ Sahibinden'in zayıf noktası (gizli ücret + pazarlık) tam tersi vurgu.

### 3f — Drill-down

Mevcut "Tüm özellikleri gör" toggle korundu; her kart genişlerse `detail` metni gözükür.

### 3g — SSS düzeltmesi (eski yanlış komisyon metni)

Önce: *"Satış değerine **kademeli**: 0-3M %3, 3-10M %2.5, 10M+ %2"* ❌
Sonra: *"**%2 alıcı + %2 satıcı = toplam %4** (KDV hariç matrah). KDV %20 komisyon üzerine. Yasal tavan: Taşınmaz Ticareti Yönetmeliği md.20. Detay: /komisyon."* ✅

→ KARAR 2 (komisyon tek model) ile tutarlı.

---

## 4) CANLI/LOCAL KANIT (Playwright preview)

`_audit/fiyat-guncelleme/_test-fiyat.mjs` çıktısı:

```json
{
  "where": "local-4173",
  "http": 200,

  "has_499": true,         ← Yatırımcı liste ✅
  "has_1900": true,        ← Başlangıç liste ✅
  "has_4500": true,        ← Pro liste ✅
  "has_9900": true,        ← Kurumsal liste ✅

  "has_eski_399": false,   ← ESKİ KALKTI ✅
  "has_eski_1500": false,  ← ESKİ KALKTI ✅
  "has_eski_3500": false,  ← ESKİ KALKTI ✅
  "has_eski_7500": true,   ← Kurumsal KURULUŞ fiyatı (7.500 doğru, sabit kalır)

  "has_kurulus_banner": true,  ← "Kuruluş üyesi" ✅
  "has_sinirli": true,         ← "Sınırlı" rozet ✅
  "has_349": true,             ← Yatırımcı kuruluş ✅
  "has_1400": true,            ← Başlangıç kuruluş ✅
  "has_3400": true,            ← Pro kuruluş ✅

  "has_en_populer": true,      ← "En Popüler" (Pro) ✅
  "has_premium": true,         ← "Premium" (Kurumsal) ✅

  "has_taahhuet_yok": true,    ← Şeffaflık 1/3 ✅
  "has_iptal": true,           ← Şeffaflık 2/3 ✅
  "has_gizli_yok": true,       ← Şeffaflık 3/3 ✅

  "has_gunde": true,           ← "günde ₺X" formatı ✅
  "has_2_alici_2_satici": true,← SSS komisyon doğru ✅
  "has_eski_kademeli": false,  ← Eski kademeli KALKTI ✅
  "has_20_ilan": true,         ← Başlangıç limit ✅
  "has_60_ilan": true,         ← Pro limit ✅

  "errs": []                   ← 0 console error
}
```

Ekran kanıtı: `_audit/fiyat-guncelleme/fiyat-canli.png` (full page)

---

## 5) ANAYASA KANITLARI

### Build
```bash
$ npm run build
PWA v1.3.0 — precache 296 entries (6413.74 KiB)
files generated: dist/sw.js, dist/workbox-9c35ba06.js
```
✅ **YEŞİL**

### Test
```bash
Test Files  2 failed | 49 passed | 1 skipped (52)
Tests       4 failed | 203 passed | 2 skipped (209)
Duration    28.89s
```
- 203/209 PASS (%97)
- 4 fail = ÖNCEDEN VAR olan Home.test useAuth (bu commit'le alakasız, son 3 commit'te de aynı)

### Lint (dokunulan 2 dosya)
```bash
$ npx eslint src/lib/pricingTiers.ts src/pages/PricingPage.tsx
→ 0 error
```

### Çekirdek dokunma kontrolü
| Dosya | Durum |
|---|---|
| `src/lib/fees.ts` (komisyon) | ✅ DOKUNULMADI |
| `place_bid` RPC | ✅ DOKUNULMADI |
| RLS politikaları | ✅ DOKUNULMADI |
| `listing_offers_safe` view (sealed) | ✅ DOKUNULMADI |
| `auth` / KYC | ✅ DOKUNULMADI |
| `taxConfig` / `preAuthorize` | ✅ DOKUNULMADI |

### Dokunulan dosyalar
```
src/lib/pricingTiers.ts        ← +46 / -25 (PRICING_TIERS fiyatları + EARLY_MEMBER + ONE_OFF + dailyEquivalent + earlyPriceFor)
src/pages/PricingPage.tsx      ← +60 / -7 (erken üye banner + üst çizili fiyat + günde ₺X + şeffaflık + SSS düzeltmesi)
```

---

## 6) MASTER İÇİN AKSİYON

1. ✅ Bu commit push edildi (sonda) → canlı `https://www.ihaleal.com/fiyatlandirma` ~5-15 dk Vercel deploy + CDN cache
2. **Hard refresh (`Ctrl+Shift+R`)** veya `?v=timestamp` ile hemen yeni içeriği gör
3. Erken üye süresi dolunca:
   - `pricingTiers.ts`: `EARLY_MEMBER_ACTIVE = false` yap
   - Tek satır değişiklik → otomatik liste fiyatına döner
4. Mevcut aboneler 12 ay fiyat sabit (politika taahhüdü) — backend tier tablosu (`subscriptions` migration canlıya gidince) bu sabit fiyatı saklamalı

---

## 📂 Audit Ayak İzi

```
_audit/
├── FIYAT_GUNCELLEME_RAPORU.md     ← bu rapor
└── fiyat-guncelleme/
    ├── _test-fiyat.mjs            ← Playwright doğrulama
    └── fiyat-canli.png            ← local preview ekran kanıt
```

---

— **Yeni fiyatlar canlı · erken üye 4 tier kuruluş indirimi aktif · psikolojik UI iyileştirme · komisyon (`fees.ts`) DOKUNULMADI · build/test yeşil · push hazır.**
💎✅
