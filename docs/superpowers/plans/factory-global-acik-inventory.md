# `global-acik.css` Read-Only Inventory (Task 8)

**Status:** inventory only — no source files were changed to produce this document.
**Subject file:** `src/styles/global-acik.css` (1079 lines, unmodified).
**Context:** this file was generated during the earlier "Luxury → Shares" migration as a
single attribute-selector override layer that redirects ~250+ components' hardcoded
Tailwind utility classes (`bg-slate-900`, `text-white`, `bg-gradient-to-br`, …) onto the
design-system's CSS custom properties, because those components' JSX still hardcodes the
old dark-theme Tailwind classes directly instead of consuming tokens. Tasks 1–7 of the
Factory migration already rewrote the *token values* it reads from (`src/styles/tema.css`,
loaded last) to Factory's dark-obsidian values. This file's own `!important` redirection
rules were never touched.

## Summary counts

| Metric | Count |
|---|---|
| Total CSS rule blocks (incl. the `:root` variable block and the one nested `@media (prefers-reduced-motion)` rule) | 52 |
| Numbered source sections (the file's own `── N.` comment headers) | 13 |
| Distinct exact-match Tailwind classes intercepted (`[class~="…"]`) | 251 |
| Additional substring/prefix opacity-variant selectors (`[class*=…]` / `[class^=…]`, mostly paired matchers for `class/opacity` forms of the same 251 base classes) | 291 + 251 = 542 |
| `!important` declarations in the file | 51 |
| Rule blocks whose forced color **still resolves correctly** for Factory's dark canvas (token flip already fixed it) | 29 |
| Rule blocks that are **polarity-inverted / a contrast or constraint regression** now that tokens point to Factory | 11 |
| Rule blocks that are **context-dependent / unclear**, needing a human call | 8 |
| Rule blocks that are **structural/neutral** (no color polarity at all — spacing, motion, touch target, sizing) | 12 |

(Some blocks carry more than one concern and are cross-referenced in the notes column rather
than double-counted.)

**Key mechanism to understand before reading the table:** `global-acik.css` does not itself
define what "light" or "dark" means — it only reads variables (`--zemin`, `--metin`,
`--vurgu`, `--cizgi`, `--durum-*`, `--uzerine*`) that are now defined by `tema.css` (loaded
last, so it wins the `:root` cascade). Because Tasks 1–7 already flipped those variables to
Factory's dark values, several of this file's "force dark Tailwind class → token" rules
*already read as correct* for a dark canvas without any edit — the token rewrite silently
fixed them. Conversely, several rules that force **text color** to a token which used to be
dark-on-light and is now light-on-dark break when the underlying element still sits on one
of Factory's few remaining **light surfaces** (the Bone `.card`/`bg-card` exception, or the
intentionally-unchanged light status-tint backgrounds `--durum-*-zemin`). Those are the
rules flagged "polarity-inverted" below — the bug is not simply "still points at a light
value," it is "text/background token pairs that used to be consistent for Shares are no
longer consistent for Factory."

## Rule-block table

Line numbers are 1-indexed and reference `src/styles/global-acik.css` as of this inventory.

| # | Lines | Section | Selector(s) (summarized) | What it currently forces | ~Classes | Direction now |
|---|---|---|---|---|---|---|
| 1 | 24–30 | (preamble) | `:root` | Defines `--uzerine*` contract vars = `--metin` / `--vurgu` / `--durum-*` | 0 (structural) | Neutral — structural plumbing, not a Tailwind redirect |
| 2 | 32–35 | 1 | `button`, `a[role=button]`, `[role=button]` (with size/skip exceptions) | `min-height: 44px` (WCAG touch target) | 0 | Neutral — accessibility rule, no color |
| 3 | 36–48 | 2 | `*:focus-visible` (button/a/input/select/textarea/summary/role=button/role=tab/tabindex=0) | `outline: 2px solid var(--vurgu)` | 0 | **Unclear** — `--vurgu` is now a near-black neutral (`#1d1a18`); a focus ring in that color may have low contrast against the dark canvas (`#101010`) and against `--zemin-yumusak` panels. Needs a contrast check, not obviously backwards but not obviously fine either. |
| 4 | 50–54 | 3 | `[class*="bg-gradient-to-"]`, `bg-[radial\|linear\|conic-gradient]` | `background-image: none !important` | 4 | Safe as-is — Factory's own `tema.css` also states "GRADYAN DUVARI KALDIRILDI" (gradient wall removed); this rule already agrees with Factory intent. |
| 5 | 56–59 | 3 | `[class*="bg-clip-text"]` | Flattens gradient text to `color: var(--vurgu) !important` | 1 | **Polarity-inverted** — `--vurgu` (#1d1a18, near-black) as *foreground text* on the dark canvas is a contrast regression; this pattern was written for `--vurgu` as a bright accent under Shares, not as a background-chrome neutral under Factory. |
| 6 | 61–143 | 4 | `bg-slate-700/800/900/950`, `bg-zinc-900/950`, `bg-blue-900/950`, `bg-indigo-900`, `bg-sky-950`, `bg-cyan-950`, `bg-violet-900/950`, `bg-teal-950`, `bg-emerald-950`, `bg-amber-900/950`, `bg-orange-950`, `bg-red-900/950`, `bg-rose-950`, `bg-black`, plus each of these as `/opacity` variants, plus raw hex/rgba dark literals (`bg-[#0…]`, `bg-[#1…]`, `bg-[rgba(0…]` etc.) | `background-color: var(--zemin-yumusak) !important; color: var(--metin);` + resets surface contract to the default (light-text) values | ~62 | **Safe as-is (token flip already fixed it)** — this rule used to redirect "leftover dark panel" classes to a *light* Shares surface. `--zemin-yumusak` now resolves to `#1d1a18` (dark) and `--metin` to `#eeeeee` (light text) — i.e. dark-class → dark-surface-with-light-text, which is exactly what Factory wants. No longer backwards. |
| 7 | 145–154 | 4 | `bg-white/…` (opacity only) | Same target as #6 (`--zemin-yumusak` + light text) | ~3 | Safe as-is — same reasoning as #6; these were leftover translucent-white overlay remnants from the old dark theme, now correctly resolve dark. |
| 8 | 156–187 | 5 | Solid saturated fills: `bg-blue-400/500/600/700`, `bg-indigo-600`, `bg-sky-300/400/500/600`, `bg-cyan-300/400/500/600`, `bg-violet-400/500/600/800`, `bg-purple-500`, `bg-fuchsia-500`, `bg-pink-400/500/600`, `bg-teal-500/600` | `background-color: var(--vurgu) !important; color:#fff` + contract vars → `#fff` | 23 | Safe as-is / by design — collapses ~23 distinct saturated Tailwind colors down to Factory's single neutral accent fill, matching `tema.css`'s explicit "TEK vurgu" (single accent, no color chrome) intent. Visual concern (accent nearly matches canvas darkness) is a design nuance, not a polarity bug. |
| 9 | 188–200 | 5 | `bg-emerald-400/500/600/800`, `bg-green-500` | `background-color: var(--durum-basari) !important; color:#fff` | 5 | Incidentally fine — functional status color, explicitly unchanged by the Global Constraints ("DEĞİŞMEDİ"); unrelated to canvas polarity. |
| 10 | 201–214 | 5 | `bg-amber-300/400/500/600/800`, `bg-orange-500` | `background-color: var(--durum-uyari) !important; color:#fff` | 6 | Incidentally fine — same reasoning as #9. |
| 11 | 215–227 | 5 | `bg-red-400/500`, `bg-rose-300/400/500` | `background-color: var(--durum-hata) !important; color:#fff` | 5 | Incidentally fine — same reasoning as #9. |
| 12 | 229–244 | 6 | `bg-slate-50/100`, `bg-white`, `bg-background`, `bg-card`, `bg-slate-500/600` (opacity only) | Sets `color: var(--metin)` (light Bone) + contract vars — **no background-color override** | 8 | **Polarity-inverted, high concern** — these selectors match elements that keep their *actual* light Tailwind background (`bg-white`, `bg-slate-50`) or the intentionally-light `bg-card` (Factory's one Bone surface exception), while this rule pushes their text to the now-light `--metin`. Light-on-light: likely invisible/very-low-contrast text. This is the single highest-risk block in the file. |
| 13 | 245–322 | 6 | Light/soft-tint variants: `bg-blue-50`, `bg-cyan-100`, and dozens of `/opacity` variants of blue/indigo/sky/cyan/violet/purple/fuchsia/pink/teal | `background-color: var(--vurgu-yumusak) !important; color: var(--metin)` | ~55 | Safe as-is — `--vurgu-yumusak` now resolves dark (`#3d3a39`), paired with light `--metin` text: consistent dark-surface-with-light-text, matches Factory. |
| 14 | 323–342 | 6 | Emerald/green soft tints (`/opacity` variants only) | `background-color: var(--durum-basari-zemin) !important; color: var(--metin)` | ~6 | **Polarity-inverted** — `--durum-basari-zemin` (`#f0f7f2`) is explicitly kept as a **light** tint per Global Constraints ("Hepsi beyaz zeminde AA" — designed for AA contrast on a white ground), but this rule now pairs it with `--metin`, which is light Bone text. Light bg + light text = broken contrast. |
| 15 | 343–372 | 6 | Amber/yellow/orange soft tints (`/opacity` variants + a couple exact matches) | `background-color: var(--durum-uyari-zemin) !important; color: var(--metin)` | ~19 | **Polarity-inverted** — same failure mode as #14 (`--durum-uyari-zemin` is light, paired with light `--metin`). |
| 16 | 373–407 | 6 | Rose/red soft tints (`bg-rose-200` + `/opacity` variants) | `background-color: var(--durum-hata-zemin) !important; color: var(--metin)` | ~11 | **Polarity-inverted** — same failure mode as #14/#15. |
| 17 | 409–415 | 7 | `h1, h2, h3, h4, h5, h6` | `color: var(--uzerine)` | 0 | Safe as-is — inherits the local surface contract (defaults to light `--metin`, flips to white on filled surfaces); this pattern is self-correcting by design. |
| 18 | 416–419 | 7 | `[class~="text-white"]` + opacity | `color: var(--uzerine) !important` | 1 | Safe as-is — same self-correcting contract mechanism as #17; on the default (canvas) context this resolves to `--metin` (light), which is what "text-white" wants on a dark canvas. |
| 19 | 420–449 | 7 | Light-family grays: `text-slate-50…600`, `text-gray-500`, `text-zinc-100/400` (+ opacity) | `color: var(--uzerine-ikincil) !important` | ~11 | Safe as-is — resolves to `--metin-ikincil` (`#8a8380`, Factory's muted secondary text), which reads fine on the dark canvas. |
| 20 | 451–466 | 7 | Dark-family grays + black: `text-slate-700/800/900/950`, `text-black` (+ opacity) | `color: var(--uzerine) !important` | ~10 | **Polarity-inverted, high concern** — these classes were originally "dark text for a light background" (e.g. body copy inside a light Shares card). `--uzerine` now defaults to light Bone, so this text becomes light-on-light wherever the surrounding container is still a light surface (`.card` / `bg-card` / `bg-white`) — the same failure mode as block #12, from the text side instead of the background side. |
| 21 | 468–584 | 7 | Bright color-family text: blue/indigo/sky/cyan/violet/purple/fuchsia/pink/teal, ~30 shades × plain+opacity | `color: var(--uzerine-vurgu) !important` | ~85 | **Polarity-inverted** — `--uzerine-vurgu` defaults to `--vurgu` (`#1d1a18`, near-black). Any of these ~85 selectors used as a standalone accent-colored text run (not paired with one of the filled/dolu-surface rules that reset `--uzerine-vurgu` to white) becomes near-invisible dark text directly on the dark canvas. Only "safe" when paired with a filled/accent background rule from section 5 that resets the contract var to white first. |
| 22 | 586–612 | 7 | Emerald/lime text: `text-emerald-50…700`, `text-lime-300` (+ opacity) | `color: var(--uzerine-basari) !important` (→ `--durum-basari`, dark green, unchanged) | ~13 | **Unclear** — safe when paired with the matching soft-tint background (block #14, light bg + dark green text = fine contrast), but a contrast regression as standalone text directly on the dark canvas. Needs a check of actual JSX pairing before deciding. |
| 23 | 614–661 | 7 | Amber/yellow/orange text: `text-amber-50…950`, `text-yellow-300/800`, `text-orange-200/300/400` (+ opacity) | `color: var(--uzerine-uyari) !important` (→ `--durum-uyari`, dark amber-brown, unchanged) | ~24 | **Unclear** — same pairing-dependent reasoning as #22. |
| 24 | 663–690 | 7 | Red/rose text: `text-red-100…500`, `text-rose-100…400` (+ opacity) | `color: var(--uzerine-hata) !important` (→ `--durum-hata`, dark red, unchanged) | ~14 | **Unclear** — same pairing-dependent reasoning as #22. |
| 25 | 692–820 | 8 | ~35 border-color utilities across slate/blue/sky/cyan/violet/purple/fuchsia/pink/teal/emerald/amber/orange/red/rose/white/black (+ opacity variants) | `border-color: var(--cizgi) !important` | ~70 | Safe as-is / low risk — `--cizgi` (`#3d3a39`, Ash hairline) is designed for a dark canvas; borders don't carry the same polarity risk as fill/text pairs. Minor risk only where a border sits on a light `.card` surface (hairline may be low-contrast there too), worth a visual spot-check but not a structural bug. |
| 26 | 822–828 | 8 | `divide-slate-100/800` (+ opacity) | `border-color: var(--cizgi) !important` | ~4 | Safe as-is — same reasoning as #25. |
| 27 | 829–877 | 8 | `ring-*` across slate/blue/sky/cyan/violet/emerald/amber/orange/rose (+ opacity) | `--tw-ring-color: var(--cizgi) !important` | ~17 | Safe as-is — same reasoning as #25. |
| 28 | 879–886 | 9 | `nav, header` | `background: var(--zemin) !important` (canvas), removes gradient/backdrop-filter, `border-bottom: 1px solid var(--cizgi)`, resets contract vars | 0 | Safe as-is — canvas-colored nav/header matches Factory's "obsidian canvas everywhere" rule directly. |
| 29 | 887–893 | 9 | `footer` | `background: var(--zemin-yumusak) !important`, `color: var(--metin-ikincil) !important`, border-top `--cizgi` | 0 | Safe as-is — same reasoning as #28. |
| 30 | 894–900 | 9 | `input`, `textarea`, `select` (excl. checkbox/radio/submit) | `background: var(--zemin) !important; color: var(--metin) !important; border: 1px solid var(--cizgi) !important; border-radius: var(--kose-kucuk)` | 0 | Safe as-is — dark input on dark canvas with light text; consistent with Factory and with the radius work already done in Task 3. |
| 31 | 901–904 | 9 | `input::placeholder`, `textarea::placeholder` | `color: var(--metin-ikincil) !important` | 0 | Safe as-is. |
| 32 | 905–910 | 9 | `table, th, td` | `background: transparent !important; color: var(--metin) !important; border-color: var(--cizgi) !important` | 0 | **Unclear** — transparent background inherits the ambient context; fine on the dark canvas, but light-on-light if a table happens to render inside a light `.card`/`bg-card` container (same family of risk as #12/#20). |
| 33 | 911–913 | 9 | `thead th` | `background: var(--zemin-yumusak) !important; color: var(--metin-ikincil) !important` | 0 | Safe as-is — dark header row + muted light text, consistent. |
| 34 | 914–919 | 9 | `[role="dialog"], .modal` | `background: var(--zemin) !important; color: var(--metin) !important; border: 1px solid var(--cizgi); box-shadow: var(--golge-buyuk)` | 0 | Safe as-is — and the `box-shadow` now resolves to Factory's `none`, which happens to already match the "zero box-shadow anywhere" Global Constraint. |
| 35 | 920–922 | 9 | `a:not([btn/button/data-slot=button/text-white/nav/header/footer])` (plain inline text links) | `color: var(--vurgu)` | 0 | **Polarity-inverted** — same root cause as block #5: `--vurgu` is now a near-black neutral used for background chrome, not a bright accent for foreground text/links. A body-copy link colored `#1d1a18` on the `#101010` canvas is close to invisible. This is likely the most user-visible bug of the whole file if `global-acik.css` were left as the only link-color source. |
| 36 | 924–927 | 9 | `.card`, `[class*="rounded"][class*="shadow"]` (excl. buttons/links) | `border-color: var(--cizgi); box-shadow: var(--golge-kucuk)` | 0 | Safe as-is — shadow resolves to Factory's `none`; border color is the dark hairline, fine on the dark canvas parts of a card, though see note on #25 for the light Bone card face itself. |
| 37 | 928–938 | 9 | `button.bg-white`, `button.bg-gray-100`, `.btn-default` | `background: var(--vurgu) !important; color:#fff !important` + contract vars → `#fff` | 3 | Safe as-is — dark accent button + white text, consistent with Factory's neutral-fill button design. |
| 38 | 939–953 | 9 | `.btn-primary`, `.btn-accent`, `bg-primary`, `bg-destructive`, `background:var(--gradient-cta)`, `background:var(--color-primary)`, `bg-[var(--vurgu)` | Sets surface contract vars → `#fff` only (no bg/color of its own) | 7 | Safe as-is — contract-only, no direct color decision to be backwards about. |
| 39 | 956–962 | 9 | `.btn-accent` | `background: var(--vurgu); color:#fff; border:1px solid var(--cizgi); border-radius: var(--kose-kucuk); padding: .75rem 1.5rem; font-weight: 600` | 0 | **Needs a human call — Global Constraint violation, not a polarity issue.** `tema.css`'s own header states Factory forbids font-weight 600+ almost everywhere ("600+ YASAK"). This rule hardcodes `font-weight: 600` on `.btn-accent`, directly conflicting with the constraint that Tasks 1–7 were otherwise enforcing (see the font-weight cleanup commit `c3ceb07`). Distinct from the color-polarity findings above — flagging separately since it needs a decision on whether `.btn-accent` is a deliberate exception or an oversight. |
| 40 | 964–969 | 10 | `shadow-sm/xs/shadow/md/inner` | `box-shadow: var(--golge-kucuk) !important` (→ `none`) | 5 | Safe as-is — already perfectly aligned: Factory wants zero shadow everywhere, and this rule now delivers exactly that for 5 utility classes. |
| 41 | 970–975 | 10 | `shadow-lg/xl/2xl/lux/lux-lg` | `box-shadow: var(--golge-buyuk) !important` (→ `none`) | 5 | Safe as-is — same reasoning as #40. |
| 42 | 976–1019 | 10 | ~14 colored "glow" shadow utilities (blue/cyan/violet/fuchsia/pink/teal/emerald/amber/black, + opacity variants) | `box-shadow: var(--golge-buyuk) !important` (→ `none`) | ~28 | Safe as-is — removes decorative glow shadows entirely; matches Factory's zero-shadow rule. |
| 43 | 1020–1031 | 11 | `.empty-state` | Padding/layout, `color: var(--metin-ikincil)`, `border: 1px dashed var(--cizgi)`, `border-radius: var(--kose)`, `background: var(--zemin-yumusak)` | 0 | Safe as-is — dark panel + muted light text, consistent. |
| 44 | 1032–1036 | 11 | `.empty-state svg` | Sizing + `opacity: 0.5` | 0 | Neutral — no color, unaffected by polarity. |
| 45 | 1038–1043 | 12 | `button/a/[role=button]:not([data-skip-transition])` | `transition: transform/opacity/background-color/border-color/color/box-shadow …` | 0 | Neutral — timing/property list only, no color values; still matches Factory's "transform + opacity only" motion philosophy note (plus a few extra properties transitioned, harmless). |
| 46 | 1044–1047 | 12 | `:hover` (button/a/role=button) | `transform: translateY(-1px)` | 0 | Neutral. |
| 47 | 1048–1052 | 12 | `:active` (button/a/role=button) | `transform: translateY(0); transition-duration: .05s` | 0 | Neutral. |
| 48 | 1053–1057 | 12 | `button:disabled, [aria-disabled=true]` | `opacity: .5; cursor: not-allowed; transform: none !important` | 0 | Neutral. |
| 49 | 1058–1061 | 12 | `.card-luxury`, `[class*="rounded-2xl"][class*="border"]` | `transition: border-color, box-shadow …` | 1 | Neutral — timing only. |
| 50 | 1063–1070 | 12 | `@media (prefers-reduced-motion: reduce)` | Disables the above transitions/transforms | 0 | Neutral — accessibility, duplicates similar rule already in `tema.css`; harmless redundancy. |
| 51 | 1071–1073 | 12 | `img.hover-zoom`, `.group:hover img.group-hover\:scale-105` | `transition: transform .3s ease-out` | 0 | Neutral. |
| 52 | 1075–1078 | 13 | `.skeleton-shimmer`, `[class~="animate-pulse"]` | `background-color: var(--zemin-gri) !important; background-image: none !important` | 1 | Safe as-is — `--zemin-gri` (`#3d3a39`) is dark, a skeleton-loading placeholder in that tone reads correctly on the dark canvas. |

## Recommendation

### Safe to leave as-is (converged correctly, or already neutral)
- **#2, #4** — accessibility/touch-target and gradient-removal rules, unrelated to color polarity, and #4 already matches Factory's own "no gradients" rule.
- **#6, #7** — dark-panel-class → `--zemin-yumusak` redirect: token rewrite already turned this dark→light-surface rule into a dark→dark-surface rule.
- **#8, #13** — saturated/soft accent fills redirected to the single Factory neutral accent, consistent with "TEK vurgu" design intent.
- **#9, #10, #11** — solid status-color fills (success/warning/error): explicitly unchanged per Global Constraints, and internally consistent (dark fill + white text).
- **#17, #18, #19** — text rules that read through the self-correcting `--uzerine*` surface contract; they track context correctly by construction.
- **#25, #26, #27** — border/divide/ring color rules: `--cizgi` is a dark hairline appropriate for the dark canvas; polarity risk here is minor and border-specific, not a functional break.
- **#28, #29, #30, #31, #33, #34, #36, #37, #38** — structural surface rules (nav/header/footer/input/thead/dialog/card/buttons): all resolve to dark-bg + light-text or white-on-accent, matching Factory directly; several (`#34`, `#36`, `#40`, `#41`, `#42`) get the added benefit of the shadow tokens now resolving to `none`, which happens to already satisfy Factory's zero-box-shadow rule.
- **#40, #41, #42** — all shadow-flattening rules: now perfectly aligned with Factory's "zero box-shadow anywhere."
- **#43, #44, #45, #46, #47, #48, #49, #50, #51** — empty-state and motion rules: no color decisions, or already accessibility-neutral.
- **#52** — skeleton shimmer: dark tone reads correctly on the dark canvas.

### Polarity-inverted, needs neutralizing in a follow-up task
- **#12** (`bg-slate-50/100/white/background/card` → forces `color: var(--metin)`, no bg override) — highest-risk block: light-on-light text wherever the element keeps its real light background or sits on `bg-card`.
- **#20** (`text-slate-700/800/900/950`, `text-black` → `color: var(--uzerine)`) — same failure mode from the text side: originally "dark text for light surfaces," now forces light Bone text, breaking legibility on any surviving light surface.
- **#14, #15, #16** (emerald/amber/rose soft-tint backgrounds → `color: var(--metin)`) — the `--durum-*-zemin` tokens are intentionally still light (Global Constraint, "AA on white"), but are now paired with light `--metin` text: a direct contrast break, isolated to these three status-tint blocks.
- **#21** (bright color-family text → `color: var(--uzerine-vurgu)`, defaulting to near-black `--vurgu`) — standalone accent-colored text becomes near-invisible on the dark canvas unless a paired filled-surface rule resets the contract var to white first.
- **#5** (`bg-clip-text` → `color: var(--vurgu)`) and **#35** (plain inline text links → `color: var(--vurgu)`) — both reuse `--vurgu` as a *foreground* text color; under Factory `--vurgu` is a near-black background-chrome neutral, so both produce very low-contrast text/links directly on the dark canvas. `#35` in particular is likely the single most user-visible regression in this file (ordinary in-copy links going near-invisible).
- **#39** (`.btn-accent` → `font-weight: 600`) — not a polarity bug, but a direct violation of the Factory Global Constraint ("600+ YASAK") that Tasks 1–7 otherwise enforced elsewhere; flagged here because it lives in the same file and should be fixed in the same follow-up pass.

### Unclear, needs a human call
- **#3** (focus ring color via `--vurgu`) — plausibly fine, plausibly low-contrast; needs an actual rendered contrast check against both the canvas and `--zemin-yumusak` panels before deciding.
- **#22, #23, #24** (emerald/amber/red status text → dark `--durum-*` colors) — correct and high-contrast *when paired* with the matching soft-tint background rule (`#14`/`#15`/`#16`), but a contrast risk as standalone text directly on the dark canvas. Whether this is a real problem depends on how consistently the ~250 components pair background + text status classes together in JSX — that requires either grep-auditing actual component usage or visual QA, out of scope for this read-only pass.
- **#25** (borders on `.card` faces specifically) — the dark `--cizgi` hairline is fine on the canvas but may be low-contrast on the light Bone card face; needs a visual spot-check rather than a blanket call.
- **#32** (`table, th, td` transparent background) — inherits ambient context; fine on canvas, uncertain inside a light `.card`.
- Overall scope call: whether "neutralizing" means (a) rewriting this file's target tokens to distinguish "light-surface exception" contexts from "dark canvas" contexts, (b) deleting/narrowing rules that no longer apply now that most surfaces are dark by default, or (c) a larger rethink of whether an attribute-selector override layer is still the right mechanism post-migration — that decision explicitly belongs to a human per the plan's Global Constraints, not to this inventory.

## Note on scope

This document is the entire output of Task 8. No line of `global-acik.css`, or any other
source file, was modified to produce it.
