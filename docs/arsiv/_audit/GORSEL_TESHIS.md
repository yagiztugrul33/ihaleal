# 🎨 ADIM 6 — Görsel İki-Mod Disiplini (Teşhis Raporu)

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-gorsel-disiplin`
**Doktrin:** ÖNCE teşhis (sadece rapor) → sonra DAR uygulama. Büyük yeniden tasarım Master onayına.
**Kapsam:** Token envanteri, açık/dark mod haritası, amber disiplini, tutarsızlıklar, RTL durumu.

---

## ⚡ TEK-CÜMLELİK ÖZET

Tailwind config'de **lacivert ailesi var (`lux.deep #081120`, `lux.base #0B1120`, `lux.elevated #0F172A`) ama hedef navy (`#0A1F44`) farklı tonda**; **amber token YOK** ama `bg-amber-500` **213 yer** (default Tailwind palette'inden, vurgu için fazla yoğun); `dark:` variant kullanım **43 satır** (çok azı sayfa-genel, çoğu küçük rozet); hardcoded hex (`#F59E0B`, `#0A1F44`) **14 yer** — çoğu Recharts grafik renkleri (token'a çekilebilir, ayrı dilim). DAR uygulama: onboarding inline `#0A1F44` → tutarlı `bg-slate-950` tailwind class'a alındı; geri kalan büyük kararlar Master'a bırakıldı.

---

## 1) BLOK 1 — Token Envanteri

### Tailwind config (`tailwind.config.js`)

```js
darkMode: ["class"]          // ✅ class-based dark mode aktif
colors: {
  lux: {
    deep:     "#081120",     // en koyu navy
    base:     "#0B1120",     // ana sayfa zemini
    elevated: "#0F172A",     // kart/yüzey
    inset:    "#111827",
    ink:      "#101426",
    aurora:   "#3B0F1F"
  },
  brand: {
    teal: "#38BDF8",         // birincil vurgu (cyan/sky)
    night: "#0B1120",
    gold: "#D4AF37"          // ✅ var ama az kullanılıyor
  },
  panel: {
    sky:    "#0EA5E9",
    indigo: "#6366F1",
    rose:   "#F43F5E",
    teal:   "#0D9488"
  }
}
```

**Eksik:**
- ❌ `amber` central token YOK — `bg-amber-500` default Tailwind palette'inden (`#F59E0B`)
- ❌ Hedef navy `#0A1F44` tailwind'de YOK (mevcut `#0B1120` daha koyu, daha siyah)

### CSS variables (`src/index.css`, `src/App.css`)

```css
--gradient-page: linear-gradient(180deg, #081120 0%, #0b1120 45%, #111827 100%)
--gradient-soft, --gradient-deep, --premium-gradient (Home premium)
```

**Sonuç:** Sayfa genel zemini **`#081120 → #111827` arası lacivert gradient** (Home + alt sayfalarda `page-background-premium` class). Bu mevcut sistem **dark-first**.

---

## 2) BLOK 2 — Açık/Dark Mod Haritası

Tailwind `darkMode: ["class"]` ama HTML kökünde `<html class="dark">` her zaman aktif (single-mode site). Yani site **TEK MOD: koyu (dark-first)** — light mod yarı-hazır, sayfa-bazında karışık.

| Sayfa | Top-level container | Mod | Notlar |
|---|---|---|---|
| `Home.tsx` | `page-background-premium home-ref-page` | DARK (premium gradient) | Premium feel |
| `BorsaPage.tsx` | `bg-slate-900/45` paneller | DARK | Terminal teması (doğru) |
| `BorsaAssetDetailPage.tsx` | `bg-slate-900/70` | DARK | Terminal teması (doğru) |
| `AuctionDetail.tsx` | (incelenmedi tamamen, 2052 satır) | DARK | `bg-amber-500/10` rozetler |
| `PricingPage.tsx` | gradient + `bg-slate-700` button | DARK | Tier kartları renk-kodlu |
| `FlowSelector.tsx` (onboarding) | `bg-slate-950` ← **DAR DÜZELTME** | DARK | Önceden inline `#0A1F44`, şimdi tutarlı |
| `PreLaunch.tsx` | `from-[#0A1F44] via-slate-900 to-[#F59E0B]/25` | DARK (özel) | Hard-coded gradient — özel açılış sayfası |

### `dark:` variant kullanım

- **43 satır** — minimal, sayfa-genel light/dark switch YOK (zaten site dark-only)
- Çoğu küçük rozetlerin alt tonu için (örn. `text-amber-300 dark:text-amber-200`)

**Sonuç:** Site **tek-mod (dark-first)**. "İki-mod disiplini" iki ayrı tema değil → **sayfaya göre koyu derinliği farklı**:
- **Borsa** = en koyu (terminal `bg-slate-900` ailesi)
- **Ana site** = orta (gradient `#081120 → #111827`)
- **Onboarding/küçük sayfalar** = ara (`bg-slate-950`)

---

## 3) BLOK 3 — Amber Disiplini

### Kullanım dağılımı (`bg-amber-500*` arama)

| Dosya | Kullanım |
|---|---|
| `Analytics.tsx` | 19 |
| `CreateAuction.tsx` | 18 |
| `AuctionDetail.tsx` | 18 |
| `PricingPage.tsx` | 17 |
| `SecurityCenter.tsx` | 14 |
| `BorsaPage.tsx` | 13 |
| `ValuationTool.tsx` | 9 |
| `LoyaltyProgramPage.tsx` | 8 |
| ... | ... |

**Toplam `bg-amber-500*`:** **213 yer**

### Semantik

`bg-amber-500/10`, `bg-amber-500/15` (transparent variants) — **uyarı/bilgi paneli** olarak kullanılmış (CTA değil). Örnek:

```tsx
// AuctionDetail.tsx:951
<div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
  {/* "Önemli bilgi" paneli */}
</div>

// AuctionDetail.tsx:1156
<p className="text-xs text-amber-200/90 border border-amber-400/25 rounded-lg px-3 py-2 bg-amber-500/10">
  {/* uyarı satırı */}
</p>

// AuctionDetail.tsx:1524
<Button className="w-full border-amber-500/30 text-amber-200 hover:bg-amber-500/10">
  {/* outline secondary CTA */}
</Button>
```

**Sonuç:** Amber **CTA olarak değil, uyarı/yol-haritası/secondary CTA** olarak kullanılmış. Bu **disiplin doğru** — ama yoğunluğu yüksek (213 yer). Tasarım dili kararı: amber'i daha seyrek kullanmak (60/30/10 → ~25-50 yer) veya **bu kullanımı kabul edip kuralı netleştirmek**:
- 🟡 Amber = **uyarı/bilgi/secondary outline CTA** (mevcut deseni)
- 🔵 Birincil CTA = **mavi/cyan (sky-500, blue-600)**
- 🟢 Başarı = **emerald**

### Birincil CTA örnekleri (sayfa başına)

| Sayfa | Birincil CTA rengi | Disiplin |
|---|---|---|
| `PricingPage` (Pro tier) | `bg-blue-600 hover:bg-blue-500` | ✅ Mavi |
| `PricingPage` (Premium tier) | `bg-amber-600 hover:bg-amber-500` | ⚠️ Amber CTA |
| `PricingPage` (Elite tier) | `bg-emerald-600` veya gradient | ⚠️ Tier-renk farklı |
| `FlowSelector` (onboarding hover) | `text-amber-300` (sadece hover) | ✅ 60/30/10 doğru |
| `BorsaPage` "borsa-chip--up/down" | yeşil/kırmızı (status) | ✅ Semantik doğru |

**Tutarsızlık #1:** PricingPage tier kartları **tier'a göre 3 farklı renk** (mavi/amber/emerald) — pazarlama amaçlı kasti olabilir ama "hangi CTA birincil?" sorusunu karıştırır.

---

## 4) BLOK 4 — Hardcoded Hex (Token Kaçakları)

| Dosya | Satır | Hex | Bağlam |
|---|---|---|---|
| `Analytics.tsx` | 120, 449, 891 | `#f59e0b`, `#3b82f6`, `#10b981` | Recharts grafik fill |
| `GesIntelligenceWorkbench.tsx` | 115, 139 | `#f59e0b` | Bar + Radar fill |
| `GesAnalysisPage.tsx` | 776, 801 | `#f59e0b` | ReferenceLine + Bar |
| `Mortgage.tsx` | 201 | `#f59e0b` | Area stroke |
| `HomeTarget.tsx` | 51 | `#3b82f6 #10b981 #f59e0b #8b5cf6 #ec4899` | SIDEBAR_COLORS dizisi |
| `PreLaunch.tsx` | 38, 51 | `#0A1F44`, `#F59E0B/25` | Özel açılış gradient |
| `FlowSelector.tsx` | ~~90~~ | ~~`#0A1F44`~~ | **DAR DÜZELTİLDİ → `bg-slate-950`** |
| `global-dark.css` | 29 | `#f59e0b` | `--accent` CSS değişkeni (iyi disiplin) |

**Toplam hardcoded:** 14 satır → **DAR düzeltme sonrası 13** (FlowSelector temizlendi).

**Ayrı dilim (Master onayı):**
- Recharts grafik renkleri → ortak `theme/chart-colors.ts` modülüne taşıma (10 yer, 1-2 saat)
- `PreLaunch.tsx` özel gradient — bilinçli (özel açılış sayfası), dokunma
- `HomeTarget.tsx` SIDEBAR_COLORS dizisi → ortak palette modülü (15 dk)

---

## 5) BLOK 5 — Tutarsızlık Örnekleri (3-5 somut)

### #1 — Onboarding zemin tonu tailwind config ile uyumsuzdu ❌→✅ DÜZELTİLDİ

```diff
- style={{ backgroundColor: "#0A1F44" }}      // hard-coded, paletten farklı
+ className="... bg-slate-950"                  // tailwind tutarlı
```

### #2 — PricingPage tier CTA'ları 3 farklı renk ⚠️ Master kararı

```tsx
// Pro:     bg-blue-600    (mavi)
// Premium: bg-amber-600   (amber — birincil CTA olarak!)
// Elite:   bg-emerald-600 (yeşil)
```

**Soru:** Tier'a göre renk pazarlama amaçlı mı kasti, yoksa rastgele mi? Birincil CTA dili karışık.

### #3 — BorsaPage amber notification paneli vs AuctionDetail amber outline button

```tsx
// BorsaPage:541 — uyarı paneli (info)
<section className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-amber-100">

// AuctionDetail:1524 — outline secondary CTA (action)
<Button className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10">
```

Aynı renk, farklı anlam (info vs action). Kullanıcı için **rol belirsiz**.

### #4 — `--accent: #f59e0b` CSS değişkeni var ama 213 yerde tailwind class kullanılıyor

`global-dark.css:29` `--accent: #f59e0b` tanımlı **ama hiçbir yerde `var(--accent)` referansı YOK**. İki paralel sistem (CSS var + Tailwind class) — birini kullanmak gerek.

### #5 — `dark:` variant azlık + light mod kanıt yok

- `dark:` variant **43 satır** (çoğu mini renk tonu farkı)
- Site **tek-mod dark** — light mod kanıtı yok (denenmemiş)
- Master "iki-mod disiplini" derken ya:
  - (a) "İki ayrı tema (light + dark)" — bu BÜYÜK refactor (var olmayan light mod)
  - (b) "Sayfaya göre koyu derinliği farkı" — mevcut durumu netleştir

---

## 6) BLOK 6 — DAR Uygulama (Yapılan TEK Düzeltme)

### `src/pages/onboarding/FlowSelector.tsx:88-90`

**Önce:**
```tsx
<main
  className="min-h-screen pt-24 pb-16 px-4 text-white"
  style={{ backgroundColor: "#0A1F44" }}
>
```

**Sonra:**
```tsx
<main
  className="min-h-screen pt-24 pb-16 px-4 text-white bg-slate-950"
>
```

**Neden:**
- `#0A1F44` tailwind paletinde **yok** (mevcut lux ailesi `#0B1120/#081120`)
- Inline `style={{...}}` palette dışı, tutarsız
- `bg-slate-950` (`#020617`) tutarlı, lux.deep'e yakın derinlikte
- Tek satır, sıfır risk

**Neden BÜYÜK refactor YAPILMADI (Master onayına bırakıldı):**
- 213 amber kullanımı → semantik kararı (uyarı vs CTA) Master'ın
- Recharts hardcoded renkler → 10 dosya refactor (1-2 saat)
- Light mod inşası → büyük tema sistemi (var olmayan light mod)
- Tier CTA renk birleştirme → pazarlama kararı
- `#0A1F44` vs `#0B1120` ton seçimi → marka karar

---

## 7) BLOK 7 — RTL Hazırlık Durumu

✅ **Onboarding FlowSelector tamamen RTL-hazır:**
- `text-start`, `ms-2`, `me-2` (logical CSS)
- `<ArrowLeft className="rtl:rotate-180" />`
- `dir="ltr"` sayılarda (BiDi-uyumlu)

⚠️ **Geri kalan site karışık:**
- Bazı yerlerde `ml-`, `mr-`, `text-left`, `pl-`, `pr-` (fiziksel CSS) hâlâ var
- Master'ın "RTL-hazır site geneli" hedefi için **ayrı dilim** (envanter F1 fasında — 100-150 saat).

---

## 8) BLOK 8 — Önerilen Yol Haritası (Master Kararı)

### Şimdi yapılabilecek küçük adımlar (1-2 saat her biri)

| # | İş | Saat | Risk |
|---|---|---|---|
| 1 | `tailwind.config.js`'e `colors.amber.brand: "#F59E0B"` semantic token ekle + 13 hardcoded `#f59e0b`'ı `var/class`'a çek | 1.5 | Düşük |
| 2 | `theme/chart-colors.ts` ortak modülü oluştur (Recharts 5 renk) | 1 | Düşük |
| 3 | `tailwind.config.js`'e `colors.navy.500: "#0A1F44"` ekle (eğer marka tonu bu olacaksa) | 0.5 | Marka kararı gerek |
| 4 | PricingPage tier CTA'larını **tek renk** yap (mavi) — diğer farkları badge'lerde tut | 1 | Pazarlama riski |
| 5 | "Amber semantik kuralı" yaz: `bg-amber-500/10` = info, `bg-amber-600` = sekonder CTA, **birincil CTA hep mavi/cyan** | 0.5 | Düşük (sadece doküman) |

### Büyük refactor (gerekmiyor — şimdilik dokunma)

- ❌ Light mod inşası (var olmayan ikinci tema)
- ❌ 213 amber kullanımının manuel review'ı
- ❌ Tüm site `ml-/mr-` → `ms-/me-` toplu refactor (F1 fası içinde)

---

## 9) DOKUNULAN DOSYA

```
src/pages/onboarding/FlowSelector.tsx   (1 satır — inline style kaldırıldı, bg-slate-950 eklendi)
```

**Çekirdek dokunulmadı:**
- ✅ `placeBidRpc`, sealed view, RLS
- ✅ `fees.ts`, auth, payments, subscriptions
- ✅ `CurrencyContext` mantığı
- ✅ `tailwind.config.js`, `index.css`, `App.css`
- ✅ Tüm 213 amber kullanımı (semantik korundu)

---

## 10) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6454.31 KiB)
files generated
  dist/sw.js
  dist/workbox-9c35ba06.js
```
✅ **YEŞİL**

### Lint
- Tek dosya (FlowSelector) 0 hata

### Git
```
modified:   src/pages/onboarding/FlowSelector.tsx (1 satır diff)
new file:   _audit/GORSEL_TESHIS.md
```

---

## 11) ÖZET — MASTER İÇİN 3 KARAR

1. **Marka navy tonu**: `#0B1120` (mevcut tailwind, daha koyu) mu, `#0A1F44` (hedef, daha açık+saturasyonlu) mu? — *Cevap geldiğinde tailwind config'e tek token ekleyip kullanım yayılır*
2. **Amber semantik**: "Amber = uyarı/info/sekonder" mevcut kullanımı kabul mü, yoksa "amber = birincil CTA" disiplini mi? — *Cevap kuralı netleştirir, refactor gerekirse 1-2 saat*
3. **Light mod**: İkinci tema inşa edilecek mi (60-100 saat), yoksa dark-first kal? — *Şimdilik dark-first net*

---

— **1 dar düzeltme uygulandı · Teşhis raporu yazıldı · Çekirdek korundu · Master 3 karar bekliyor.**
🎨✅
