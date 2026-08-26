# Factory Design System Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Shares" (Signal Violet) design system with "Factory" (dark obsidian canvas, Geist/Geist Mono, near-square radii, zero shadows), per the repo-root `DESIGN.md` reference, without breaking existing features.

**Architecture:** Same single-source-of-truth pattern the Shares migration used: central token files (`src/styles/tema.css`, `src/styles/tokens.css`, `tailwind.config.js`) drive color/radius/font-family; core `src/components/ui/*` primitives consume those tokens; a targeted sweep updates font-weight and letter-spacing in the same pages the Shares migration touched (Home, LiveAuctions, AuctionDetail). `global-acik.css` (the dark→light override layer) is inventoried read-only in this plan and left untouched pending a separate follow-up decision.

**Tech Stack:** Vite + React 19 + TypeScript + Tailwind CSS 3, shadcn/ui (cva), Vitest, Playwright.

## Global Constraints

- Source of truth: repo-root `DESIGN.md` ("Factory — Style Reference"). Do not invent values not present there.
- Logo/brand mark stays Signal Violet `#594ff4` exactly as-is: `src/components/**/MarkaIsareti.tsx`, `src/components/**/Logo.tsx`, `public/favicon.svg`, `public/icon-*.png` are NOT touched by this plan.
- `supabase/functions/report-notifier/index.ts` email HTML keeps its current `#594ff4` brand color untouched (brand theme, not UI chrome) — NOT touched by this plan.
- Status colors `--durum-basari` / `--durum-uyari` / `--durum-hata` (and their `-zemin` companions) in `tema.css` are NOT touched — Factory's orange/green accents are reserved for live-data/status signals only, never reused for generic success/warning/error UI.
- `PAYMENTS_ENABLED` kill-switch, payment demo-mode behavior, and Google integrations are NOT touched by any task in this plan.
- Every task: `npm run typecheck` (0 errors), `npm run build`, `npm run test:run`, `npm run lint` must all pass before commit.
- Do not touch `src/styles/global-acik.css` beyond the read-only inventory in Task 7 — no edits, no deletions.
- Do not rename existing CSS custom properties that other files depend on (e.g. `--zemin`, `--metin`, `--vurgu`) — redefine their *values* to Factory equivalents, keep the *names* Shares already introduced, so every consumer file (tokens.css, tailwind.config.js, global-acik.css, premium-cinematic-home.css, etc.) picks up the new values automatically without being edited.
- Factory reference values (from `DESIGN.md`): canvas `#101010`, carbon-lift `#1d1a18`, ash-stroke `#3d3a39`, graphite-mid `#4d4947`, warm-granite `#8a8380`, pale-stone `#b8b3b0`, bone `#eeeeee`, chalk `#fafafa`. Radii: nav/buttons `3px`, cards `10px`, largePanels `20px`. Zero box-shadow. Font: Geist (400 default, 500 rare emphasis), Geist Mono (uppercase 12px labels). Tracking: `-0.04em`@72px / `-0.025em`@44px / `-0.02em`@12px.

---

### Task 1: Token layer — `tema.css` colors/radius/weight base rewrite to Factory

**Files:**
- Modify: `src/styles/tema.css:22-73` (`:root` primary token block)
- Modify: `src/styles/tema.css:268-281` (heading/body font-weight + uppercase tracking rules)

**Interfaces:**
- Consumes: nothing (this is the root token source)
- Produces: `--zemin`, `--zemin-yumusak`, `--zemin-gri`, `--metin`, `--metin-ikincil`, `--vurgu`, `--vurgu-koyu`, `--vurgu-yumusak`, `--cizgi`, `--golge-kucuk`, `--golge-buyuk`, `--kose`, `--kose-kucuk` — every downstream file (tokens.css, tailwind.config.js, global-acik.css, `.vurgu-yuzey`, `premium-cinematic-home.css`) consumes these by name unchanged, so redefining values here cascades everywhere without touching those files.

- [ ] **Step 1: Update the primary `:root` token block**

Replace lines 22-73 of `src/styles/tema.css` with:

```css
:root {
  /* ——— Zemin (Factory: Obsidian Canvas — koyu her yerde) ——— */
  --zemin: #101010;
  --zemin-yumusak: #1d1a18;
  --zemin-gri: #3d3a39;

  /* ——— Metin (Factory: Bone — canvas üstünde tek parlak metin) ——— */
  --metin: #eeeeee;
  --metin-ikincil: #8a8380;

  /* ——— Vurgu: Factory'de buton/chip dolgusu NÖTR — mor artık chrome değil.
     --vurgu/--vurgu-koyu/--vurgu-yumusak sadece geriye-uyum için tutulur,
     ama artık nötr (Carbon Lift) değerlere işaret eder — turuncu/yeşil
     (signal/metric) EKLENMEDİ, çünkü onlar sadece canlı veri/status için
     (bkz. Global Constraints). ——— */
  --vurgu: #1d1a18;
  --vurgu-koyu: #0d0b0a;
  --vurgu-yumusak: #3d3a39;

  /* ——— Çizgi (Factory: Ash Stroke — ince hairline, koyu zeminde) ——— */
  --cizgi: #3d3a39;

  /* ——— Gölge: Factory kuralı "zero box-shadow anywhere" — sıfıra çekildi ——— */
  --golge-kucuk: none;
  --golge-buyuk: none;

  /* ——— Köşe: Factory sabit ölçek — nav/buton 3px, kart 10px, büyük panel 20px.
     Genel bant burada kart radius'una (10px) sabitlenir; buton/input/nav
     kendi bileşenlerinde 3px'e ayrıca override edilir (bkz. Task 3). ——— */
  --kose: 10px;
  --kose-kucuk: 3px;

  /* ——— Boşluk: 8px grid (Factory ile zaten uyumlu, değişmedi) ——— */
  --bosluk: 8px;
  --bosluk-1: 8px;
  --bosluk-2: 16px;
  --bosluk-3: 24px;
  --bosluk-4: 32px;
  --bosluk-6: 48px;
  --bosluk-8: 64px;

  /* ——— Fonksiyonel durum renkleri (DEĞİŞMEDİ — Global Constraints) ———
     Hepsi beyaz zeminde AA: #15803d 4.54:1 · #9a6700 4.53:1 · #b42318 5.86:1 */
  --durum-basari: #15803d;
  --durum-basari-zemin: #f0f7f2;
  --durum-uyari: #9a6700;
  --durum-uyari-zemin: #fbf6e9;
  --durum-hata: #b42318;
  --durum-hata-zemin: #fdf3f2;

  /* ——— Hareket: Factory Motion Philosophy — 0.15-0.2s, mekanik ——— */
  --gecis-hizli: 150ms;
  --gecis: 200ms;
  --gecis-egri: cubic-bezier(0.4, 0, 0.2, 1);
}
```

Note: this step intentionally does NOT touch the second `:root` block (lines 80-211, the backward-compat aliasing + shadcn HSL block) or the `[data-theme]` block (lines 213-234) or `.vurgu-yuzey` (lines 236-250) — those are Task 2's scope, since the shadcn HSL triplets need their own Factory-equivalent values (they can't simply inherit hex vars).

- [ ] **Step 2: Update the header comment block**

Replace lines 1-20 (the file's top comment) with:

```css
/* ══════════════════════════════════════════════════════════════════════════
   ihaleal — "FACTORY" TASARIM SİSTEMİ  (tek kaynak)
   ──────────────────────────────────────────────────────────────────────────
   Kural: Obsidian Canvas (#101010) her yerde · Bone (#eeeeee) SADECE kart
   yüzeyi (figure-on-ground) · sıfır box-shadow · Geist/Geist Mono · 400
   ağırlık neredeyse her yerde, 600+ YASAK. Kaynak: repo kökündeki
   "Factory — Style Reference" DESIGN.md.

   Bu dosya main.tsx'te EN SON import edilir; böylece eski tema dosyalarının
   (:root) tanımlarını geçersiz kılar. Eski değişken ADLARI (Shares'ten kalan)
   korunur — sadece DEĞERLERİ Factory'ye çekildi; böylece tokens.css,
   tailwind.config.js, global-acik.css gibi tüketici dosyalar değişmeden
   yeni değerleri otomatik alır.
   ══════════════════════════════════════════════════════════════════════════ */
```

- [ ] **Step 3: Update heading/body weight + uppercase tracking rules (lines 268-281)**

Replace:

```css
h1, h2, h3, h4, h5, h6 {
  color: var(--metin);
  font-weight: 700;
}

/* Shares: gövde/UI 500 ağırlık, başlık 700 — varsayılan gövde ağırlığı */
body {
  font-weight: 500;
}

/* Shares: uppercase eyebrow/etiket satırlarına 0.075em tracking (yalnız tracking-* class'ı yoksa) */
.uppercase:not([class*="tracking-"]) {
  letter-spacing: 0.075em;
}
```

with:

```css
h1, h2, h3, h4, h5, h6 {
  color: var(--metin);
  font-weight: 400;
}

/* Factory: 400 neredeyse evrensel — 500 sadece nadir vurgu (bkz. Task 4) */
body {
  font-weight: 400;
}

/* Factory: Geist Mono uppercase etiketler SIKI (negatif) tracking taşır,
   Shares'in geniş (positive) tracking'i tersine çevrildi. */
.uppercase:not([class*="tracking-"]) {
  letter-spacing: -0.02em;
}
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run build && npm run test:run && npm run lint`
Expected: all pass with 0 errors (CSS-only change, no TS/test impact expected — if `test:run` has any snapshot/visual assertions on these exact hex values, update them to match).

- [ ] **Step 5: Commit**

```bash
git add src/styles/tema.css
git commit -m "feat(factory): tema.css kök tokenlarını Factory değerlerine çevir"
```

---

### Task 2: Shadcn HSL block + dark-mode block + `.vurgu-yuzey` → Factory

**Files:**
- Modify: `src/styles/tema.css:80-234` (backward-compat alias block, shadcn HSL triplets, `[data-theme]` block)
- Modify: `src/styles/tema.css:236-250` (`.vurgu-yuzey`)

**Interfaces:**
- Consumes: Task 1's new hex values (`--zemin`, `--metin`, etc.)
- Produces: shadcn `--background`/`--foreground`/`--card`/`--primary`/`--border`/`--input`/`--ring` HSL triplets consumed by every shadcn component via `tailwind.config.js`'s `hsl(var(--x))` wiring (unchanged in this task).

- [ ] **Step 1: Convert Factory hex values to HSL for the shadcn block**

Factory hex → HSL (computed, verify with a quick Node `chroma`/manual conversion if in doubt):
- `#101010` → `0 0% 6%`
- `#eeeeee` → `0 0% 93%`
- `#1d1a18` → `36 8% 11%`
- `#3d3a39` → `40 3% 24%`

Replace the shadcn HSL block (both the plain `:root` occurrence at lines 188-210 and the `[data-theme]` block at lines 214-234) — same values in both places since Factory has one single (dark) theme:

```css
  /* shadcn/ui (HSL üçlüsü) — Factory (koyu) tema */
  --background: 0 0% 6%;
  --foreground: 0 0% 93%;
  --card: 0 0% 93%;
  --card-foreground: 0 0% 6%;
  --popover: 0 0% 6%;
  --popover-foreground: 0 0% 93%;
  --primary: 36 8% 11%;
  --primary-foreground: 0 0% 93%;
  --secondary: 40 3% 24%;
  --secondary-foreground: 0 0% 93%;
  --muted: 36 8% 11%;
  --muted-foreground: 0 0% 66%;
  --accent-foreground: 0 0% 93%;
  --destructive: 4 76% 40%;
  --destructive-foreground: 0 0% 100%;
  --border: 40 3% 24%;
  --input: 40 3% 24%;
  --ring: 0 0% 66%;
  --radius: 10px;
  --page-gradient-from: 0 0% 6%;
  --page-gradient-via: 0 0% 6%;
  --page-gradient-to: 0 0% 6%;
```

Note `--card`/`--card-foreground` stay INVERTED relative to `--background`/`--foreground` (light card `#eeeeee` on dark page `#101010`) — this is the deliberate Factory figure/ground move, not a mistake. `--destructive` stays unchanged (status color, out of scope per Global Constraints).

- [ ] **Step 2: Update `.vurgu-yuzey` (filled-accent surface, e.g. price cards/CTA bands)**

Replace lines 236-250:

```css
/* ── Dolu vurgu yüzeyi (Factory: Chalk-filled yüksek-vurgu yüzeyi) ──────────
   Nötr açık dolgu — mor artık chrome değil. Üzerindeki metin koyuya döner. */
.vurgu-yuzey {
  background: #fafafa !important;
  border-color: #fafafa !important;
  color: #101010;
  --uzerine: #101010;
  --uzerine-ikincil: rgba(16, 16, 16, 0.7);
  --uzerine-vurgu: #101010;
  --uzerine-basari: #101010;
  --uzerine-uyari: #101010;
  --uzerine-hata: #101010;
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run build && npm run test:run && npm run lint`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/styles/tema.css
git commit -m "feat(factory): shadcn HSL tokenları ve .vurgu-yuzey Factory'ye çevrildi"
```

---

### Task 3: Radius + shadow removal in core UI primitives

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/accordion.tsx`

**Interfaces:**
- Consumes: `--kose`/`--kose-kucuk` from Task 1 (already 10px/3px), but this task also removes hardcoded Tailwind radius/shadow utility classes that don't route through those vars.
- Produces: no interface change — same component props/exports, only visual classes change.

- [ ] **Step 1: `button.tsx` — radius 3px, remove all shadow/glow classes**

In `buttonVariants` (the `cva(...)` call), replace `rounded-full` in the base string (line 8) with `rounded-[3px]`.

Replace the `default` variant (line 12-13):
```ts
        default:
          "bg-primary text-white hover:bg-primary/80",
```

Replace the `outline` variant (line 16-17):
```ts
        outline:
          "border border-white/15 bg-white/[0.06] text-slate-100 hover:bg-white/[0.1] hover:border-white/25",
```

Replace the `secondary` variant (line 18-19):
```ts
        secondary:
          "bg-white/[0.08] text-slate-100 border border-white/12 hover:bg-white/[0.12] hover:border-white/20",
```

Replace the `accent` variant (lines 25-29, drop the cyan-glow comment and glow shadow):
```ts
        accent:
          "!bg-cyan-500 !text-slate-950 !bg-none border border-cyan-400/30 hover:!bg-cyan-400",
```

In the `size` variants, remove `rounded-full` (replace with `rounded-[3px]`) from every size entry (`sm`, `lg`, `xl`, `icon`, `icon-sm`, `icon-lg` — lines 33-38) and remove `shadow-xs` from `lg`/`xl` (lines 34-35).

- [ ] **Step 2: `card.tsx` — radius 10px, no shadow**

Line 10, replace:
```ts
        "bg-card text-card-foreground flex flex-col gap-6 rounded-[10px] p-6 border border-[var(--cizgi)]",
```
(also reduce padding from `p-8` to `p-6` per Factory's 24px card-padding token)

Remove lines 11-12 entirely (`"transition-all duration-300",` and `"hover:shadow-md",`) — Factory cards get no shadow and no hover-elevation.

- [ ] **Step 3: `input.tsx` — radius 3px**

Line 11, replace `rounded-[16px]` with `rounded-[3px]`.

- [ ] **Step 4: `accordion.tsx` — radius 3px on trigger**

Line 36, replace `rounded-[16px]` with `rounded-[3px]`.

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm run build && npm run test:run && npm run lint`
Expected: all pass. Then start `npm run build && npx vite preview --port 4174` and use Playwright to screenshot the Home page and a page using `Card`/`Button`/`Input`/`Accordion` (e.g. `/sss` or any FAQ-style page using Accordion) at desktop (1280px) width, confirming: buttons are near-square (not pill), cards are 10px-rounded with no visible shadow.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/input.tsx src/components/ui/accordion.tsx
git commit -m "feat(factory): button/card/input/accordion radius ve shadow Factory'ye çevrildi"
```

---

### Task 4: Geist + Geist Mono self-host

**Files:**
- Create: `public/fonts/geist-latin.woff2`, `public/fonts/geist-latin-ext.woff2`, `public/fonts/geist-mono-latin.woff2`, `public/fonts/geist-mono-latin-ext.woff2` (extracted from the npm `geist` package)
- Modify: `public/fontlar.css` (add Geist + Geist Mono `@font-face` blocks, following the exact existing Inter pattern)
- Modify: `src/styles/tokens.css:28-31` (`--font-display`/`--font-body`) and add `--font-mono`
- Modify: `tailwind.config.js:8-11` (`fontFamily.display`/`fontFamily.body`, add `fontFamily.mono`)

**Interfaces:**
- Consumes: nothing new
- Produces: `--font-display`, `--font-body`, `--font-mono` CSS vars; Tailwind `font-display`/`font-body`/`font-mono` utility classes — consumed by any component using those utilities (unchanged call sites, only the underlying family changes).

- [ ] **Step 1: Download and extract the Geist woff2 files**

```bash
cd /tmp && npm pack geist@1.7.2 --silent
tar -xzf geist-1.7.2.tgz
find package/dist -iname "*.woff2" | grep -i -v mono | head -5
find package/dist -iname "*mono*.woff2" | head -5
```

Locate the Regular-weight (400) static woff2 files for both Geist and Geist Mono (the package ships variable fonts and per-weight static fonts — prefer the variable-font file if one covers 400-500 in one file, matching the existing Inter self-host pattern of "one variable file per subset"). Copy the located files into the worktree as:
- `public/fonts/geist-latin.woff2` (or `-ext` if the package separates subsets — if the npm package does NOT split by latin/latin-ext subset the way Google Fonts does, use a single `public/fonts/geist.woff2` and a single `public/fonts/geist-mono.woff2` file instead, and skip the unicode-range split in Step 2 for these two families — Inter's split was specific to how Google Fonts served it, not a hard requirement).

- [ ] **Step 2: Add `@font-face` blocks to `public/fontlar.css`**

Append (adjust filenames/unicode-range to match what Step 1 actually produced):

```css
/* Geist — self-host, aynı sebep: fonts.googleapis.com/gstatic.com round-trip'i yok.
   Kaynak: npm "geist" paketi (Vercel resmi), registry.npmjs.org üzerinden indirildi. */
@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 400 500;
  font-display: swap;
  src: url(/fonts/geist.woff2) format('woff2');
}

@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/geist-mono.woff2) format('woff2');
}
```

- [ ] **Step 3: Update `tokens.css` font tokens**

Replace lines 28-31:
```css
  /* Tipografi — Factory: Geist (gövde/başlık) + Geist Mono (etiket/eyebrow) */
  --font-display: "Geist", "Inter Fallback", system-ui, sans-serif;
  --font-body: "Geist", "Inter Fallback", system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

- [ ] **Step 4: Update `tailwind.config.js` fontFamily**

Replace lines 8-11:
```js
      fontFamily: {
        display: ["Geist", "system-ui", "sans-serif"],
        body: ["Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm run build && npm run test:run && npm run lint`
Expected: all pass. Confirm the woff2 files are actually present under `public/fonts/` and referenced paths in `fontlar.css` resolve (`ls public/fonts/geist*.woff2`). Start `npx vite preview` and use Playwright to check the Network tab or computed `font-family` on `body` shows "Geist" loaded (DevTools `getComputedStyle(document.body).fontFamily`).

- [ ] **Step 6: Commit**

```bash
git add public/fonts/geist*.woff2 public/fontlar.css src/styles/tokens.css tailwind.config.js
git commit -m "feat(factory): Geist + Geist Mono self-host olarak eklendi"
```

---

### Task 5: font-bold/font-semibold cleanup (400 default, 600+ forbidden)

**Files:**
- Modify: `src/components/ui/button.tsx:24,34,35` (already touched in Task 3 for radius — this task removes `font-bold` from those same lines; if Task 3 already landed, this task does a follow-up edit on the post-Task-3 file state)
- Modify: `src/components/ui/card.tsx:37` (`CardTitle`)
- Modify: `src/pages/Home.tsx`, `src/pages/LiveAuctions.tsx`, `src/pages/AuctionDetail.tsx` (grep-driven sweep, same three pages the Shares migration swept for typography)

**Interfaces:**
- Consumes: Task 1's `h1-h6 { font-weight: 400 }` base rule
- Produces: no interface change, class-string edits only

- [ ] **Step 1: Fix `button.tsx`**

Line 24 (`tertiary` variant): remove `font-semibold`, keep the rest of the class string intact (link-style text stays regular weight).

Lines 34-35 (`lg`/`xl` sizes): remove `font-bold` from both (already had `shadow-xs` removed in Task 3 — if Task 3 hasn't landed yet when this task runs, also strip `shadow-xs` and `rounded-full`→`rounded-[3px]` here; check current file state first with `git log` / `Read` before editing, since duplicate edits to already-migrated lines will simply no-op safely).

- [ ] **Step 2: Fix `card.tsx`**

Line 37 (`CardTitle`): replace `"leading-none font-semibold"` with `"leading-none font-medium"` (Factory: weight 500 is the only permitted emphasis step above 400, per DESIGN.md "weight 500 is reserved for emphasis").

- [ ] **Step 3: Grep-driven sweep of Home/LiveAuctions/AuctionDetail**

```bash
grep -n "font-bold\|font-semibold" src/pages/Home.tsx
grep -n "font-bold\|font-semibold" src/pages/LiveAuctions.tsx
grep -n "font-bold\|font-semibold" src/pages/AuctionDetail.tsx
```

For every match: replace `font-bold` → `font-normal` (headings/hero text — the DESIGN.md "Do" rule requires 400 for display type, tightness carries the weight instead), and replace `font-semibold` → `font-medium` (any inline emphasis — e.g., a price figure or label that must stand out slightly, per the "500 reserved for rare emphasis" rule; use judgment per-match: if the element is body copy that doesn't need any emphasis at all, prefer `font-normal` over `font-medium`).

Do not touch `font-bold`/`font-semibold` occurrences inside string literals unrelated to className (e.g. i18n message content, comments) — only Tailwind class strings.

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run build && npm run test:run && npm run lint`
Expected: all pass. Playwright screenshot Home/LiveAuctions/AuctionDetail desktop+mobile, confirm no heading renders visually bold.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/button.tsx src/components/ui/card.tsx src/pages/Home.tsx src/pages/LiveAuctions.tsx src/pages/AuctionDetail.tsx
git commit -m "feat(factory): font-bold/semibold temizliği — 400 varsayılan, 500 nadir vurgu"
```

---

### Task 6: Negative letter-spacing on headings/display type

**Files:**
- Modify: `src/styles/tokens.css:44` (`--tracking-tight`)
- Modify: `src/styles/tema.css` (h1-h6 rule, touched again — add tracking alongside the weight already set in Task 1)

**Interfaces:**
- Consumes: Task 1's `h1-h6` rule
- Produces: `--tracking-tight`, `--tracking-display`, `--tracking-heading` vars

- [ ] **Step 1: Update `tokens.css` tracking tokens**

Replace line 44 (`--tracking-tight: -0.02em;`) and add two more, so the block reads:
```css
  --tracking-tight: -0.02em;
  --tracking-heading: -0.025em;
  --tracking-display: -0.04em;
```

- [ ] **Step 2: Apply tracking to the `h1-h6` rule in `tema.css`**

The Task-1 rule:
```css
h1, h2, h3, h4, h5, h6 {
  color: var(--metin);
  font-weight: 400;
}
```
becomes:
```css
h1, h2, h3, h4, h5, h6 {
  color: var(--metin);
  font-weight: 400;
  letter-spacing: var(--tracking-heading);
}

h1 {
  letter-spacing: var(--tracking-display);
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run build && npm run test:run && npm run lint`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/styles/tokens.css src/styles/tema.css
git commit -m "feat(factory): başlıklara Factory negatif letter-spacing eklendi"
```

---

### Task 7: Card `variant` prop (surface / outline)

**Files:**
- Modify: `src/components/ui/card.tsx`

**Interfaces:**
- Consumes: nothing new
- Produces: `Card` now accepts an optional `variant?: "surface" | "outline"` prop, default `"surface"` — every existing `<Card>` call site (no prop passed) keeps rendering the current post-Task-3 look unchanged (light `#eeeeee`-on-dark-canvas figure/ground card). `variant="outline"` is new and opt-in only — no existing call site is affected until a caller adds the prop.

- [ ] **Step 1: Add the variant prop to `Card`**

Replace the `Card` function (post-Task-3 state) with a `cva`-based version:

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "flex flex-col gap-6 rounded-[10px] p-6",
  {
    variants: {
      variant: {
        surface: "bg-card text-card-foreground border border-[var(--cizgi)]",
        outline: "bg-transparent text-[var(--metin)] border border-[var(--cizgi)]",
      },
    },
    defaultVariants: {
      variant: "surface",
    },
  }
)

function Card({
  className,
  variant = "surface",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
}
```

(This drops the Task-3 inline class string in favor of the `cva` call — if Task 3 has already landed on this file, use its exact `p-6`/`rounded-[10px]` output as the `surface` variant's base, don't reintroduce `p-8` or the old radius.)

Leave `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` untouched — their exports and props are unaffected.

- [ ] **Step 2: Export `cardVariants` alongside the existing exports**

At the bottom of the file, change:
```ts
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
```
to:
```ts
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run build && npm run test:run && npm run lint`
Expected: all pass — since `variant` defaults to `"surface"` and every existing call site omits the prop, no visual regression is expected anywhere in the app. Playwright screenshot 2-3 pages that use `<Card>` (e.g. Home, a listing page) desktop+mobile to confirm unchanged appearance versus Task 3's screenshots.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "feat(factory): Card bileşenine surface/outline variant eklendi"
```

---

### Task 8: `global-acik.css` read-only inventory (NO edits — report only)

**Files:**
- Read only: `src/styles/global-acik.css` (1079 lines)
- Create: `docs/superpowers/plans/factory-global-acik-inventory.md` (the report)

**Interfaces:**
- Consumes: nothing
- Produces: a written inventory document — no code/behavior change whatsoever. This task must NOT modify `global-acik.css` or any other source file.

- [ ] **Step 1: Categorize every rule block in `global-acik.css`**

Read the full file. For each rule block, note: (a) the selector(s) it targets (e.g. `[class*="bg-slate-900"]`), (b) what it forces (e.g. "forces dark Tailwind bg utility → `var(--zemin)`"), (c) roughly how many distinct Tailwind utility classes/selectors it intercepts, (d) whether its forced direction (dark→light) is now backwards given Factory's dark canvas, or still correct/neutral (e.g. rules that force accent colors, unrelated to canvas polarity, may still be fine).

- [ ] **Step 2: Write the report**

Write `docs/superpowers/plans/factory-global-acik-inventory.md` with: a summary count (total rule blocks, total distinct selectors/classes affected), a table of every block found in Step 1, and a recommendation split into "safe to leave as-is" vs "polarity-inverted, needs neutralizing in a follow-up task" vs "unclear, needs a call".

- [ ] **Step 3: Commit the report only**

```bash
git add docs/superpowers/plans/factory-global-acik-inventory.md
git commit -m "docs(factory): global-acik.css salt-okunur envanter raporu"
```

Do NOT proceed to edit `global-acik.css` itself — that is explicitly out of scope for this plan (see Global Constraints) and requires a separate user decision after this report is reviewed.

---

## Notes for the controller (not a task)

After Task 8, STOP and present the inventory report to the human partner per their explicit instruction — do not dispatch any task that edits `global-acik.css`. The final whole-branch review (per subagent-driven-development) should run after Task 7, since Task 8 makes no code changes and doesn't need the same review rigor (a lighter read-through of the report document is enough).
