# Shares Tasarım Sistemi Geçişi — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ihaleal.com'un görsel tasarım sistemini (renk, tipografi, spacing, border-radius, component stilleri) "Shares" DESIGN.md tasarım sistemine göre yeniden düzenlemek — içerik/özellik/backend değişmeden.

**Architecture:** Mevcut tek-kaynak token mimarisi kullanılacak: `src/styles/tema.css` (renk tokenları, tüm bileşenler buna bağlı) + merkezi shadcn UI bileşenleri (`src/components/ui/*` — radius) + `tailwind.config.js` (font ailesi). Ayrıca 3 ana sayfada (Home, LiveAuctions, AuctionDetail) tipografi boyutları elle Shares ölçeğine güncellenecek.

**Tech Stack:** Vite, React 19, TypeScript, Tailwind CSS 3, CSS custom properties, Vitest, Playwright (görsel doğrulama).

## Global Constraints

- Signal Violet `#594ff4` — sistemin TEK vurgu rengi. Başka hiçbir yeni kromatik renk eklenmeyecek.
- Durum renkleri (`--durum-basari/uyari/hata`) DEĞİŞMİYOR — Shares bunları tanımlamıyor, mevcut WCAG AA onaylı değerler korunacak.
- Font: Inter (Aeonik yedeği) — tüm metin (gövde + başlık), Plus Jakarta Sans kaldırılıyor.
- Buton radius: `rounded-full` (99px pill) — tüm boyut varyantlarında.
- Kart radius: `36px`.
- Input/Accordion radius: `16px`.
- Her task sonunda: `npm run typecheck && npm run lint && npm run test:run && npm run build` — hepsi geçmeli, aksi halde bir sonraki task'a geçilmez.
- İçerik metni, route yapısı, özellik mantığı, Supabase/Edge Function'lar DEĞİŞMEYECEK.

---

### Task 1: Renk tokenlarını Shares paletine güncelle

**Files:**
- Modify: `src/styles/tema.css:1-68` (kök `:root` bloğu)

**Interfaces:**
- Produces: `--vurgu` (#594ff4), `--vurgu-koyu` (#2314f0), `--vurgu-yumusak` (#edecfe), `--metin` (#1f1f1f), `--metin-ikincil` (#5d5d5d), `--zemin-yumusak` (#f6f6f6), `--zemin-gri` (#e7e7e7), `--cizgi` (#e7e7e7) — bu değişkenler zaten `global-acik.css`, `tailwind.config.js` ve tüm `--lux-*`/`--premium-*`/shadcn HSL aliaslarınca (aynı dosyanın 70-206. satırları) tüketiliyor, o bloklara dokunulmuyor.

- [ ] **Step 1: `tema.css`'in kök `:root` bloğunu güncelle**

`src/styles/tema.css` dosyasının 1-68. satırları arasındaki içeriği (başlık yorumu dahil) şu içerikle DEĞİŞTİR:

```css
/* ══════════════════════════════════════════════════════════════════════════
   ihaleal — "SHARES" TASARIM SİSTEMİ  (tek kaynak)
   ──────────────────────────────────────────────────────────────────────────
   Kural: saf beyaz zemin (Porcelain) · koyu nötr metin (Inkstone) · TEK vurgu
   (Signal Violet #594ff4). Koyu panel ve gradyan duvarı YOK. Ağır kenarlık
   YOK. Gölge neredeyse görünmez. Kaynak: kullanıcının Refero'dan seçtiği
   "Shares — Style Reference" DESIGN.md (2026-08-24).

   Bu dosya main.tsx'te EN SON import edilir; böylece eski tema dosyalarının
   (:root) tanımlarını geçersiz kılar. Eski değişkenler (lux, premium, color,
   bg ve text ön ekli olanlar) tek tek dosya değiştirmek yerine BURADA yeni
   tokenlara EŞLENİR — geriye uyum korunur, tek noktadan yönetilir.

   Kontrast kanıtı (WCAG 2.1 hesabı, node ile relative-luminance formülüyle
   hesaplandı — bkz. docs/superpowers/plans/2026-08-24-shares-design-system.md):
     --metin         #1f1f1f / #ffffff → 16.48:1
     --metin-ikincil #5d5d5d / #ffffff → 6.58:1
     --vurgu (beyaz metin üzerinde) #ffffff / #594ff4 → 5.46:1
     --metin (Cloud zeminde) #1f1f1f / #f6f6f6 → 15.25:1
   ══════════════════════════════════════════════════════════════════════════ */

:root {
  /* ——— Zemin ——— */
  --zemin: #ffffff;
  --zemin-yumusak: #f6f6f6;
  --zemin-gri: #e7e7e7;

  /* ——— Metin ——— */
  --metin: #1f1f1f;
  --metin-ikincil: #5d5d5d;

  /* ——— Vurgu: TEK renk — Signal Violet ——— */
  --vurgu: #594ff4;
  --vurgu-koyu: #2314f0;
  --vurgu-yumusak: #edecfe;

  /* ——— Çizgi ——— (ağır border yok: 1px, çok düşük kontrast) */
  --cizgi: #e7e7e7;

  /* ——— Gölge ——— (neredeyse görünmez; Shares'te tek "xl" gölgesi float ürün
     mockup'ları için tanımlı, biz mevcut çift-katmanlı yumuşak gölgeyi
     koruyoruz — aynı felsefe) */
  --golge-kucuk: 0 1px 2px rgba(31, 31, 31, 0.04);
  --golge-buyuk: 0 8px 24px rgba(31, 31, 31, 0.06);

  /* ——— Köşe ——— (genel amaçlı bant; buton/kart/input radius'u merkezi
     UI bileşenlerinde AYRICA override edilir — bkz. Task 2-4) */
  --kose: 14px;
  --kose-kucuk: 10px;

  /* ——— Boşluk: 8px grid ——— */
  --bosluk: 8px;
  --bosluk-1: 8px;
  --bosluk-2: 16px;
  --bosluk-3: 24px;
  --bosluk-4: 32px;
  --bosluk-6: 48px;
  --bosluk-8: 64px;

  /* ——— Fonksiyonel durum renkleri (Shares tanımlamıyor — DEĞİŞMEDİ) ———
     Hepsi beyaz zeminde AA: #15803d 4.54:1 · #9a6700 4.53:1 · #b42318 5.86:1 */
  --durum-basari: #15803d;
  --durum-basari-zemin: #f0f7f2;
  --durum-uyari: #9a6700;
  --durum-uyari-zemin: #fbf6e9;
  --durum-hata: #b42318;
  --durum-hata-zemin: #fdf3f2;

  /* ——— Hareket ——— (yalnız transform/opacity) */
  --gecis-hizli: 150ms;
  --gecis: 220ms;
  --gecis-egri: cubic-bezier(0.16, 1, 0.3, 1);
}
```

- [ ] **Step 2: shadcn HSL üçlüsünü (`--primary`, `--ring`) Signal Violet'e güncelle**

Aynı dosyada `--primary: 224 71% 43%;` (satır ~190) ve `--ring: 224 71% 43%;` (satır ~201) değerlerini `244 88% 63%` yap (Signal Violet #594ff4'ün HSL karşılığı). Bu iki satır dosyada İKİ ayrı yerde tekrarlanıyor (`:root` bloğu ve `[data-theme="dark"], [data-theme="light"]` bloğu) — HER İKİSİNİ DE güncelle:

```css
  --primary: 244 88% 63%;
  --primary-foreground: 0 0% 100%;
  ...
  --ring: 244 88% 63%;
```

- [ ] **Step 3: Doğrula**

```bash
npm run typecheck && npm run lint && npm run test:run
```
Beklenen: hepsi geçer (bu saf CSS değişikliği, TS/test etkilenmemeli).

```bash
npm run build
```
Beklenen: başarılı; `dist/assets/*.css` içinde `#594ff4` görünmeli (`grep -r "594ff4" dist/assets/*.css`).

- [ ] **Step 4: Commit**

```bash
git add src/styles/tema.css
git commit -m "feat(design): Shares renk tokenları uygulandı (Signal Violet #594ff4)"
```

---

### Task 2: Button bileşenini pill (99px) radius'a ve Signal Violet'e geçir

**Files:**
- Modify: `src/components/ui/button.tsx` (tam dosya, 60 satır civarı)

**Interfaces:**
- Consumes: `--vurgu` (Task 1'den)
- Produces: `buttonVariants` cva fonksiyonu aynı API (variant/size prop'ları DEĞİŞMİYOR, yalnızca ürettiği class'lar değişiyor) — hiçbir çağıran dosya güncellenmesi gerekmez.

- [ ] **Step 1: `buttonVariants` tanımını güncelle**

`src/components/ui/button.tsx` dosyasındaki `buttonVariants` sabitini şu şekilde değiştir (base class'taki `rounded-lg` → kaldırılıyor, her size kendi radius'unu `rounded-full` olarak taşıyor; `default` variant'taki gradient + hardcoded mavi glow/ring kaldırılıp `--vurgu` tabanlı düz dolgu ile değiştiriliyor):

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-250 ease-out-expo disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-base",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-xs hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(89,79,244,0.35)] active:translate-y-0",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30",
        outline:
          "border border-white/15 bg-white/[0.06] text-slate-100 backdrop-blur-md shadow-sm hover:bg-white/[0.1] hover:border-primary/35 hover:-translate-y-px",
        secondary:
          "bg-white/[0.08] text-slate-100 border border-white/12 backdrop-blur-md hover:bg-white/[0.12] hover:border-white/20",
        ghost:
          "text-slate-300 hover:text-white hover:bg-white/[0.06]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        tertiary:
          "text-primary font-semibold underline-offset-4 hover:text-white hover:underline px-0 h-auto min-h-0",
        // Accent (cyan CTA) — kontrast 1.12 bug fix: `bg-cyan-500 text-slate-950` className
        // override Button default gradient ile çakışıp arka planı şeffaf bırakıyordu.
        // !important + bg-image:none + bg-cyan-500 üçlüsü garanti opak cyan zemin.
        accent:
          "!bg-cyan-500 !text-slate-950 !bg-none shadow-sm border border-cyan-400/30 hover:!bg-cyan-400 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(34,211,238,0.45)] active:translate-y-0",
      },
      size: {
        default: "h-11 px-6 py-2.5 has-[>svg]:px-5 text-[0.9375rem]",
        sm: "h-9 rounded-full gap-1.5 px-3.5 text-xs has-[>svg]:px-2.5",
        lg: "h-12 min-h-[52px] rounded-full px-9 text-base font-bold has-[>svg]:px-7 shadow-xs",
        xl: "h-14 min-h-[56px] rounded-full px-10 text-lg font-bold has-[>svg]:px-8 shadow-xs",
        icon: "size-10 rounded-full",
        "icon-sm": "size-9 rounded-full",
        "icon-lg": "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

Not: `font-semibold` → `font-medium` yapıldı (Shares "Aeonik 500" gövde/UI ağırlığı kuralı). `shadow-lux`/`shadow-lux-lg` → `shadow-xs` (Shares "no shadow" kuralı butonlarda). `bg-gradient-to-r from-lux-blue-600 via-lux-blue-500 to-lux-blue-400` → `bg-primary` (düz Signal Violet, zaten `--primary` → `--vurgu`). `focus-visible:ring-blue-500/50` → `focus-visible:ring-primary/50`. Hover glow rengi `rgba(37,99,235,...)` (mavi) → `rgba(89,79,244,...)` (Signal Violet RGB — #594ff4 = rgb(89,79,244)).

- [ ] **Step 2: Doğrula**

```bash
npm run typecheck && npm run lint && npm run test:run
```
Beklenen: hepsi geçer. `Navbar.test.tsx` gibi buton içeren testler class isimlerine değil davranışa baktığı için kırılmamalı — kırılırsa test içeriğini oku ve `rounded-lg`/`rounded-xl` gibi bir class'ı literal string olarak assert ediyorsa güncelle.

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "feat(design): Button pill radius (99px) + Signal Violet düz dolgu"
```

---

### Task 3: Card bileşenini 36px radius'a geçir

**Files:**
- Modify: `src/components/ui/card.tsx:5-19` (yalnızca `Card` fonksiyonu)

**Interfaces:**
- Produces: `Card` bileşeni aynı props/children API'si, yalnızca üretilen class'lar değişiyor.

- [ ] **Step 1: `Card` fonksiyonunun className'ini güncelle**

`src/components/ui/card.tsx` dosyasında satır 5-19 arasındaki `Card` fonksiyonunu şu şekilde değiştir (`rounded-xl` → `rounded-[36px]`, `py-6` → `p-8` — Shares'in 32px card padding kuralı, `border` kaldırılıyor çünkü Shares kartları border değil zemin tonuyla ayırıyor — `hover:border-primary/15` de kaldırılıyor, yerine hafif gölge artışı):

```tsx
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-[36px] p-8 shadow-xs",
        "transition-all duration-300",
        "hover:shadow-md",
        className
      )}
      {...props}
    />
  )
}
```

Not: `CardHeader`/`CardContent`/`CardFooter` fonksiyonlarındaki `px-6` iç boşlukları DEĞİŞMİYOR (Card'ın kendi `p-8`'i dış boşluğu zaten sağlıyor; iç bölümlerin göreli hizası bozulmaz). `dark:hover:*` satırları kaldırıldı çünkü proje tek temaya (açık) kilitli, dark: varyantları hiçbir zaman tetiklenmiyor — ölü kod temizliği.

- [ ] **Step 2: Doğrula**

```bash
npm run typecheck && npm run lint && npm run test:run && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "feat(design): Card 36px radius + 32px padding (Shares kart stili)"
```

---

### Task 4: Input ve Accordion radius'unu 16px yap

**Files:**
- Modify: `src/components/ui/input.tsx:5-19`
- Modify: `src/components/ui/accordion.tsx:26-46` (yalnızca `AccordionTrigger`)

**Interfaces:**
- Produces: `Input`, `AccordionTrigger` bileşenleri aynı API, yalnızca radius class'ı değişiyor. `Badge` zaten `rounded-full` (Shares'in "tags: 99px" kuralıyla örtüşüyor) — DOKUNULMUYOR.

- [ ] **Step 1: `Input`'un className'inde `rounded-md` → `rounded-[16px]`**

`src/components/ui/input.tsx` satır 11'deki class string'inde `rounded-md` geçen tek yeri `rounded-[16px]` yap:

```tsx
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-[16px] border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
```

- [ ] **Step 2: `AccordionTrigger`'ın className'inde `rounded-md` → `rounded-[16px]`**

`src/components/ui/accordion.tsx` satır 36'daki class string'inde:

```tsx
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-[16px] py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
```

- [ ] **Step 3: Doğrula**

```bash
npm run typecheck && npm run lint && npm run test:run && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/input.tsx src/components/ui/accordion.tsx
git commit -m "feat(design): Input + Accordion 16px radius (Shares input/accordion stili)"
```

---

### Task 5: Font ailesini Inter'e birleştir + başlık ağırlık/tracking kuralları

**Files:**
- Modify: `tailwind.config.js:8-11`
- Modify: `src/styles/tema.css` (dosya sonuna ekleme — h1-h6 kuralı zaten satır ~263-265'te var, genişletiliyor)

**Interfaces:**
- Produces: `font-display`/`font-body` Tailwind utility'leri artık ikisi de Inter'e çözülüyor (Plus Jakarta Sans kaldırıldı).

- [ ] **Step 1: `tailwind.config.js`'te `fontFamily.display`'i Inter'e çevir**

```js
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
```

- [ ] **Step 2: `tema.css`'teki `h1, h2, h3, h4, h5, h6 { color: var(--metin); }` kuralını genişlet**

`src/styles/tema.css` dosyasının sonundaki (mevcut satır ~263-265) bloğu şununla DEĞİŞTİR:

```css
h1, h2, h3, h4, h5, h6 {
  color: var(--metin);
  font-weight: 700;
}

/* Shares: gövde/UI 500 ağırlık, başlık 700 — varsayılan gövde ağırlığı */
body {
  font-weight: 500;
}

/* Shares: uppercase eyebrow/etiket satırlarına 0.075em tracking */
.uppercase {
  letter-spacing: 0.075em;
}
```

- [ ] **Step 3: Doğrula**

```bash
npm run typecheck && npm run lint && npm run test:run && npm run build
```
Not: `body { font-weight: 500 }` genel kuralı, `font-semibold`/`font-bold` gibi daha spesifik Tailwind utility'leri (yüksek specificity, aynı katmanda sonra gelir) override ETMEZ — yalnızca hiçbir font-weight utility'si olmayan düz metni etkiler. Build sonrası ana sayfada (`npm run preview`) gözle kontrol: gövde metninin kalınlaşmadığından emin ol.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js src/styles/tema.css
git commit -m "feat(design): font ailesi Inter'e birleştirildi, Shares ağırlık/tracking kuralları"
```

---

### Task 6: Ana sayfa (Home) hero ve modül başlığı tipografi taraması

**Files:**
- Modify: `src/styles/premium-cinematic-home.css:2082-2091` (`.terminal-hero__prompt`)
- Modify: `src/pages/Home.tsx:47` (`h2#home-modules-title`)

**Interfaces:**
- Consumes: `--metin`, `--vurgu` (Task 1)
- Produces: Görsel değişiklik yalnız; hiçbir prop/interface değişmiyor.

- [ ] **Step 1: `.terminal-hero__prompt`'u Shares "display" ölçeğine güncelle**

`src/styles/premium-cinematic-home.css` satır 2082-2091'deki kuralı şu şekilde değiştir (Shares display: 56px, line-height 1.1, letter-spacing 0.075em, weight 700 — mevcut `clamp(1.35rem, 3.5vw, 2.25rem)` üst sınırı 36px'ten 56px'e çıkarılıyor, responsive clamp korunuyor):

```css
.terminal-hero__prompt {
  margin: 0 0 1.25rem;
  font-size: clamp(1.5rem, 4.5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.075em;
  color: var(--metin);
  /* Glow KALDIRILDI: açık zeminde parlama okunurluğu düşürüyor ve
     "neredeyse görünmez yükselti" kuralına aykırı. */
}
```

- [ ] **Step 2: `Home.tsx`'teki "Modüller" başlığını Shares "heading" (26px) ölçeğine güncelle**

`src/pages/Home.tsx` satır 47'deki h2'yi değiştir:

```tsx
          <h2 id="home-modules-title" className="text-[20px] font-bold text-foreground lg:text-[26px] tracking-[0.02em]">
```

- [ ] **Step 3: Doğrula (typecheck + build + görsel)**

```bash
npm run typecheck && npm run lint && npm run test:run && npm run build
```

Ardından `npm run preview` ile `http://localhost:4173/` adresini masaüstü (1280px) ve mobil (375px, tarayıcı devtools) genişliğinde aç: hero başlığının taşmadığını, satır kırılmasının doğal olduğunu gözle doğrula.

- [ ] **Step 4: Commit**

```bash
git add src/styles/premium-cinematic-home.css src/pages/Home.tsx
git commit -m "feat(design): Home hero + modül başlığı Shares tipografi ölçeğine geçti"
```

---

### Task 7: LiveAuctions (ihaleler) sayfası tipografi taraması

**Files:**
- Modify: `src/pages/LiveAuctions.tsx:153-155`

**Interfaces:**
- Consumes: yok (yalnız Tailwind class değişikliği)

- [ ] **Step 1: Sayfa başlığını Shares "heading-lg" (36px) ölçeğine güncelle**

`src/pages/LiveAuctions.tsx` satır 153-155'teki h1'i değiştir:

```tsx
          <h1
            className="text-[26px] font-bold leading-[1.15] tracking-[0.027em] sm:text-[36px] md:text-[36px]"
```

Not: `leading-tight tracking-tight` (Tailwind'in negatif/sıkı varsayılan değerleri) kaldırıldı, Shares'in `heading-lg` rolü (36px / line-height 1.15 / letter-spacing 2.7px ≈ 0.075em) ile birebir eşleşen açık değerlerle değiştirildi.

- [ ] **Step 2: Doğrula**

```bash
npm run typecheck && npm run lint && npm run test:run && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/LiveAuctions.tsx
git commit -m "feat(design): LiveAuctions başlığı Shares heading-lg ölçeğine geçti"
```

---

### Task 8: AuctionDetail (ilan detay) sayfası tipografi taraması

**Files:**
- Modify: `src/pages/AuctionDetail.tsx:410` ("ilan bulunamadı" h1)
- Modify: `src/pages/AuctionDetail.tsx:849` (ilan başlığı h1)

**Interfaces:**
- Consumes: yok

- [ ] **Step 1: "İlan bulunamadı" başlığını güncelle (satır 410)**

```tsx
        <h1 className="text-[26px] font-bold sm:text-[36px]">
```

(`text-white` kaldırıldı — bu zaten `global-acik.css`'in yüzey sözleşmesi üzerinden `--metin`'e dönüyordu; açıkça kaldırmak niyeti netleştiriyor ve override katmanına bağımlılığı azaltıyor.)

- [ ] **Step 2: İlan başlığını Shares "heading-lg" (36px) ölçeğine güncelle (satır 849)**

```tsx
              <h1 className="text-[26px] md:text-[36px] lg:text-[36px] font-bold mb-2">{auction.title}</h1>
```

(`text-white` aynı gerekçeyle kaldırıldı.)

- [ ] **Step 3: Doğrula**

```bash
npm run typecheck && npm run lint && npm run test:run && npm run build
```

Ardından `npm run preview` ile `/ilan/demo-1` (veya mevcut bir demo ilan slug'ı) sayfasını aç, başlığın koyu metin (`--metin`) olarak göründüğünü (beyaz DEĞİL) doğrula — `text-white` kaldırıldığı için artık override katmanına değil doğrudan varsayılan renge (`--metin`, miras yoluyla) bağlı.

- [ ] **Step 4: Commit**

```bash
git add src/pages/AuctionDetail.tsx
git commit -m "feat(design): AuctionDetail başlıkları Shares heading-lg ölçeğine geçti"
```

---

### Task 9: Görsel doğrulama — tasarım ölçüm harness'i + Playwright ekran görüntüleri

**Files:**
- Kullanılan (değiştirilmeyen): `scripts/tasarim-olcum.mjs`

**Interfaces:**
- Consumes: Tüm önceki task'ların ürettiği son hal (canlı dev/preview sunucusu üzerinden HTTP ile ölçülüyor, dosya değişikliği yok).

- [ ] **Step 1: Preview sunucusunu arka planda başlat**

```bash
npm run build && npm run preview -- --port 4173 &
sleep 3
```

- [ ] **Step 2: Tasarım ölçüm script'ini çalıştır**

```bash
BASE=http://localhost:4173 ROUTES=/,/ihaleler,/ilan/demo-1 OUT=/tmp/shares-olcum.json node scripts/tasarim-olcum.mjs
```

Beklenen çıktı: her rota için `darkPanels: 0`, `gradients: 0` (Shares "no gradient" kuralı), `aaFails` düşük/sıfıra yakın (WCAG AA). `hardcoded` sayısı varsa (satır içi hex/rgb) not al — bu task'ların kapsamı dışında kalan, ayrı bir temizlik maddesi olarak raporlanacak, DÜZELTİLMEYECEK (scope creep önlenir).

- [ ] **Step 3: Playwright ile masaüstü + mobil ekran görüntüsü al**

Aşağıdaki tek seferlik script'i `/tmp/shares-screenshot.mjs` olarak yaz ve çalıştır:

```js
import { chromium } from "playwright";
const BASE = "http://localhost:4173";
const ROUTES = ["/", "/ihaleler", "/ilan/demo-1"];
const browser = await chromium.launch();
for (const vp of [{ w: 1280, h: 900, tag: "desktop" }, { w: 375, h: 812, tag: "mobile" }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  for (const r of ROUTES) {
    await page.goto(BASE + r, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(800);
    const name = r === "/" ? "home" : r.replace(/\//g, "_");
    await page.screenshot({ path: `/tmp/shares-${vp.tag}${name}.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log("Ekran görüntüleri /tmp/shares-*.png altında");
```

```bash
node /tmp/shares-screenshot.mjs
```

- [ ] **Step 4: Ekran görüntülerini gözden geçir**

Her PNG dosyasını (Read tool ile) aç, şunları kontrol et:
- Taşan içerik yok (yatay scroll yok)
- Kırılan layout yok (üst üste binen element yok)
- Metin okunaklı (mobilde küçülüp kaybolmuyor)
- Signal Violet (#594ff4) vurgu tutarlı görünüyor, eski lacivert (#1e40af) hiçbir yerde kalmamış

Sorun bulunursa ilgili task'a dön, düzelt, bu task'ı tekrar çalıştır.

- [ ] **Step 5: Preview sunucusunu kapat**

```bash
kill %1 2>/dev/null || true
```

- [ ] **Step 6: Sonuçları özetleyen kısa bir not commit et**

`docs/superpowers/plans/2026-08-24-shares-design-system.md` dosyasının sonuna bir "Doğrulama Sonucu" bölümü ekle (ölçüm script'inin çıktı özeti + ekran görüntüsü bulguları), commit et:

```bash
git add docs/superpowers/plans/2026-08-24-shares-design-system.md
git commit -m "docs: Shares tasarım geçişi görsel doğrulama sonuçları eklendi"
```

## Doğrulama Sonucu (Task 9 — 2026-08-25)

Ortam notu: `scripts/tasarim-olcum.mjs` `chromium.launch({ channel: 'msedge' })` kullanıyor; bu
sandbox'ta Microsoft Edge önceden kurulu değildi, `npx playwright install msedge` ile kuruldu
(script'e dokunulmadı). Aynı gerekçeyle tek seferlik Playwright ekran görüntüsü script'i de,
bu ortamda `playwright install chromium` proxy tarafından engellendiği (`cdn.playwright.dev`
403) için, brief'teki `chromium.launch()` yerine `chromium.launch({ channel: "msedge" })`
kullanılarak çalıştırıldı — davranış aynı, sadece tarayıcı kanalı ortama uyarlandı.

### Ölçüm harness'i özeti (`scripts/tasarim-olcum.mjs`, BASE=http://localhost:4173)

| Rota | Görünüm | darkPanels | gradients | hardcoded | aaFails | overflow |
|---|---|---|---|---|---|---|
| `/` | desktop | 0 | 0 | 1 | 0 | 0 |
| `/` | mobil | 0 | 0 | 1 | 0 | 0 |
| `/ihaleler` | desktop | 0 | 0 | 0 | 0 | 0 |
| `/ihaleler` | mobil | 0 | 0 | 0 | 0 | 0 |
| `/ilan/demo-1` | desktop | 0 | 0 | 0 | 0 | 0 |
| `/ilan/demo-1` | mobil | 0 | 0 | 0 | 0 | 0 |

Tüm rotalarda `darkPanels: 0`, `gradients: 0`, `aaFails: 0`, `overflow: 0` (beklenen sonuç,
"no gradient" kuralı ve WCAG AA karşılanıyor). `hardcoded: 1` yalnızca `/` (anasayfa) rotasında,
hem masaüstü hem mobilde görüldü — kaynağı `cinematic-stats-bar__value` span'ı
(`style="color: rgb(251, 191, 36)"`, "9 AKTİF İHALE" sayacı). Bu, brief'in talimatı gereği
**düzeltilmedi**; ayrı bir temizlik maddesi olarak not düşülüyor (scope creep önlenir).

### Ekran görüntüsü bulguları (masaüstü 1280px + mobil 375px, 3 rota)

Genel kontrol listesi (taşan içerik / kırılan layout / okunaklı metin / eski lacivert
#1e40af kalıntısı) tüm 6 ekran görüntüsünde tarandı:

- Yatay taşma: harness'in `overflow: 0` ölçümüyle uyumlu, sayfa seviyesinde görülmedi.
- Eski lacivert (#1e40af): hiçbir ekran görüntüsünde görülmedi; vurgu tutarlı şekilde
  Signal Violet (#594ff4) ve türevleri.
- Kırılan/üst üste binen layout: genel olarak yok — **tek istisna aşağıda ayrıca not edildi**.

**Bulunan gerçek görsel kusur (düzeltilmedi, sadece raporlanıyor):** `/ihaleler` mobil
(375px) görünümünde, "AI YATIRIM SİNYALLERİ" panelindeki skor rozetleri (`94/100`, `+12.2%`
gibi) sağ kenardan kırpılıyor ve kısmen okunamıyor (ör. sadece "94" ve "+1" görünüyor).
Kök neden doğrulandı: `src/components/borsa/BorsaTerminali.tsx` içindeki
`<div className="grid lg:grid-cols-2 gap-4">` (satır ~389) `lg:` altında taban
`grid-cols-1` tanımlamıyor; `lg` kırılımının altında grid sütunu içeriğin intrinsic
genişliğine göre büyüyüp (ölçülen: 411px) 375px'lik viewport'u ~36px aşıyor, bu taşma
`<main class="... overflow-x-hidden">` tarafından kırpılıyor — bu yüzden harness'in
sayfa-seviyesi `overflow` ölçümü bunu yakalamıyor (0 raporluyor) ama içerik görsel olarak
kırpılmış/okunaksız kalıyor. Bu; renk/radius/font token migrasyonunun kapsamı dışında,
önceden var olan bir responsive-grid hatası olabilir — bu task görsel doğrulama amaçlı
olduğundan **düzeltilmedi**, ayrı bir düzeltme maddesi olarak işaretleniyor.

### İki özel taşınan risk — kapanış kontrolü

1. **Anasayfa hero başlığı** (`.terminal-hero__prompt`, font-size 56px / line-height 1.1 /
   letter-spacing +0.075em): Gerçek Türkçe dinamik (yazı makinesi) metin
   ("Size nasıl yardımcı olabiliriz?") hem masaüstü (1280px, tek satırda, kart kenarından
   rahat mesafeli) hem mobilde (375px, "Size nasıl yardımcı" / "olabiliriz?" olarak iki
   satıra temiz kırılıyor, taşma/kenara yapışma yok) sorunsuz render edildi. **GEÇTİ.**
2. **AuctionDetail iki `<h1>`** (text-white cascade'e bırakılmış): `/ilan/demo-1` bu
   preview build'inde gerçek ilan verisi bulamadığı için "ilan bulunamadı" (not-found)
   durumuna düşüyor — o başlık (`Listing not found` / "İlan bulunamadı" karşılığı) koyu,
   okunaklı metin olarak doğrulandı (beyaz-üstüne-beyaz değil). Gerçek ilan hero başlığını
   (`{auction.title}`, satır ~849) doğrulamak için ayrıca gerçek bir ilan ID'si
   (`/ilan/1`, "Levent'te Prestijli Plaza Katı") ziyaret edildi; bu başlık da hem
   masaüstü hem mobilde koyu/siyah, tam okunaklı render edildi. **Her iki başlık da GEÇTİ.**

### Sonuç

- DONE_WITH_CONCERNS: Ölçüm harness'i temiz (darkPanels/gradients/aaFails/overflow hepsi 0
  her rotada), iki özel risk de görsel olarak doğrulandı ve sorunsuz. Ancak `/ihaleler`
  mobil görünümde bağımsız bir görsel kusur (AI Yatırım Sinyalleri panelinde skor
  rozetlerinin kırpılması) tespit edildi ve brief'in "düzeltme yok, sadece raporla"
  talimatı gereği düzeltilmeden bırakıldı.
