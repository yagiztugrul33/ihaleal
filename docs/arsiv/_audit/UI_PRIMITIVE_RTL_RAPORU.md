# UI-PRIMITIVE RTL TURU — RAPOR

**FAZ 2 [REVIEW] grup 1 (side-variant primitive'ler) + grup 4 (toast slide)**
Tarih: 2026-06-03 · Tag: `safe-before-ui-rtl` (3c00b87) → `safe-after-ui-rtl`
Nitelik: **PRESENTATION-ONLY + ANİMASYON-EŞGÜDÜMLÜ** · ÇEKİRDEK/MANTIK SIFIR dokunuş

---

## 1. AMAÇ & İLKE

Side-variant primitive'leri (Sheet) + radix floating primitive'leri (Dropdown/
Popover/Select/Tooltip/ContextMenu/Menubar/NavigationMenu) + Toast slide
animasyonunu **AR'da düzgün aynalanacak**, **LTR'de birebir aynı** kalacak şekilde
RTL'e hazırla. Kural: **yön + animasyon + transform-origin BİRLİKTE** çevrildi
(biri eksik = bozuk). Fade/scale/dikey/merkez DOKUNULMADI. JS-side/test-edilemez →
[REVIEW].

LTR-özdeşliği üç mekanizmayla **inşaen garanti**:
- **Mantıksal utility** (`end-0`, `start-0`, `border-s`, `border-e`, `ps-8`, `pe-2`,
  `ms-auto`, `start-2`, `end-2`, `text-start`) → LTR'de fiziksel ile **bayt-özdeş**
  computed-style üretir (CSS spec); yalnız `dir=rtl`'de aynalar.
- **`rtl:`-önekli sınıflar** (Sheet slide, submenu chevron) → CSS spec gereği
  **yalnız `[dir=rtl]`'de** uygulanır; LTR'ye sıfır etki.
- **`[dir="rtl"]`-scoped CSS** (Toast) + **DirectionProvider `dir="ltr"`** (radix'in
  varsayılanı) → LTR davranışı değişmez.

---

## 2. YAPILAN DEĞİŞİKLİKLER (yalnız yön/animasyon)

### A. DirectionProvider — radix floating primitive RTL'i (TEK NOKTA)
`src/contexts/LocaleContext.tsx`: children `<DirectionProvider dir={LOCALE_DIRECTION[locale]}>`
ile sarıldı (`@radix-ui/react-direction`, repoda mevcut).
→ Radix Dropdown/Popover/Select/Tooltip/ContextMenu/Menubar/NavigationMenu/HoverCard
**side/align hesabını** `dir`'den okur. `dir="ltr"` = radix varsayılanı → **LTR birebir**;
`dir="rtl"` (AR) → konum + slide-animasyonu otomatik aynalanır. Yalnızca sunum;
hiçbir iş/mantık değişmedi.

### B. Sheet (side-variant) — `src/components/ui/sheet.tsx`
Statik (radix konumlandırmıyor; developer `side` prop'u). **Konum+kenar mantıksal,
slide `rtl:` çifti** (eşgüdümlü):
| side | konum | kenar | slide (giriş/çıkış) |
|---|---|---|---|
| `right` | `right-0`→`end-0` | `border-l`→`border-s` | `+rtl:slide-in-from-left`/`rtl:slide-out-to-left` |
| `left`  | `left-0`→`start-0` | `border-r`→`border-e` | `+rtl:slide-in-from-right`/`rtl:slide-out-to-right` |
- Close butonu: `top-4 right-4` → `top-4 end-4`.
- `top`/`bottom` blokları (dikey) **DOKUNULMADI**.

### C. Toast — `src/components/Toast.tsx` (konum) + `src/index.css` (animasyon)
- Konum `end-4` (D1'de yapılmıştı) → AR'da sola yerleşir.
- Animasyon eşgüdümü (index.css, **additive**): yeni `@keyframes slide-in-left`
  (`translateX(-100%)→0`) + `[dir="rtl"] .animate-slide-in-right { animation-name: slide-in-left }`.
  → AR'da toast soldan girer (konumla tutarlı). LTR `slide-in-right` birebir korundu.

### D. Menü-içi statik yönlüler (DirectionProvider'ın çözmediği className'ler) → mantıksal
DirectionProvider menünün **nereye açılacağını** aynalar; menü **iç düzeni** statik
className'dir, ayrıca mantıksala çevrildi:
- `dropdown-menu.tsx` / `context-menu.tsx` / `menubar.tsx`:
  `absolute left-2`→`absolute start-2` (check/radio indikatör), `data-[inset]:pl-8`→`ps-8`,
  `py-1.5 pr-2 pl-8`→`pe-2 ps-8` (checkbox/radio item), `ml-auto`→`ms-auto` (kısayol),
  submenu `<ChevronRightIcon className="ml-auto …">` → `ms-auto … rtl:rotate-180`.
- `select.tsx`: check indikatörü `absolute right-2`→`absolute end-2`.
- `command.tsx`: kısayol `ml-auto`→`ms-auto`.
- `alert-dialog.tsx`: header `sm:text-left`→`sm:text-start`.
- `table.tsx`: header hücresi `px-2 text-left`→`px-2 text-start`.
- `scroll-area.tsx`: dikey scrollbar `border-l border-l-transparent`→`border-s border-s-transparent`.

**Diff denetimi:** yalnız yön/mantıksal/`rtl:`/DirectionProvider/keyframe-additive
satırları. **Hiçbir değer/renk/spacing/tasarım değişmedi.**

---

## 3. [REVIEW] — DOKUNULMAYANLAR (dürüst, gerekçeli)

| Öğe | Sebep |
|---|---|
| **Drawer** (`ui/drawer.tsx`, vaul `data-[vaul-drawer-direction=left/right]`) | App'te **hiç kullanılmıyor** (0 `DrawerContent`/`direction=` kullanımı) → canlı test imkânsız ("dondurulmuş+canlı şart"). Benimsenirse aynı `rtl:`/mantıksal desen uygulanır. |
| **Carousel** (`ui/carousel.tsx` `-ml-4`/`pl-4` + prev/next konum) | Embla **JS scroll yönü**; CSS-gap aynalamak tek başına kaydırmayı bozar → JS-side [REVIEW]. Ayrıca `left-1/2` = merkez (sonraki tur). |
| **Calendar** range `rounded-l/r-md` | DayPicker'ın kendi `dir` desteği + aralık-köşe mantığı incelikli → [REVIEW]. |
| **Sidebar** (`ui/sidebar.tsx` `left-0`/`right-0` + offcanvas calc) | `data-[side]`-koşullu, custom + offcanvas hesabı → canlı test gerekli [REVIEW]. |
| **input-otp** `first:rounded-l-md`/`last:rounded-r-md`/`border-r` | Hücre-sırası inceliği → [REVIEW]. |
| **navigation-menu** `left-0` viewport | DirectionProvider align'ı aynalar; viewport konumu belirsiz → [REVIEW]. |
| **Merkez idiom** (`left-1/2 -translate-x-1/2`: carousel, radio-group, resizable) | **Merkezleme — sonraki CENTERING turu** (DOKUNULMAZ). |

---

## 4. KANIT

### 4.1 Build
`npm run build` → **YEŞİL** (✓ 31.86s, 0 TS hatası, PWA 299 entry; DirectionProvider import çözüldü).

### 4.2 Smoke (DirectionProvider güvenli) — `_audit/ui-primitive-rtl/result.json`
3 sayfa × 2 dil = **6/6 sayfada 0 pageerror**, `dir` doğru (tr→ltr, ar→rtl):
`/`, `/kat-karsiligi/studio`, `/ihaleler`.

### 4.3 Canlı + sentetik computed-style (gerçek derlenmiş CSS, runtime, auth-bağımsız)
Sandbox'ta Sheet/dropdown veri/auth-kapılı → gerçek elemana sınıf enjekte edip
LTR=fiziksel / RTL=aynalı doğrulandı:
| Öğe | LTR | RTL | Sonuç |
|---|---|---|---|
| Sheet `border-s` (side=right) | sol kenar (1/0px) | sağ kenar (0/1px) | ✓ aynalandı |
| Sheet close `end-4` | sağ (left 1264) | sol (left 16) | ✓ aynalandı |
| **Toast** `animate-slide-in-right` | `slide-in-right` | `slide-in-left` | ✓ aynalandı (canlı) |
| Menü `start-2` indikatör | sol (8px) | sağ (8px) | ✓ aynalandı |
| Select `end-2` check | sağ (8px) | sol (8px) | ✓ aynalandı |
| inset `ps-8 pe-2` | pL32/pR8 | pL8/pR32 | ✓ aynalandı |
| `ms-auto` (flex serbest alan) | sağa it (180px) | sola it (0px) | ✓ aynalandı |
| `text-start` (gerçek boyama) | sol-baş | sağ-baş | ✓ aynalandı |

### 4.4 CSS-seviye (LTR'ye sıfır etki ispatı)
- `rtl:slide-in-from-left/right` → `[dir=rtl],[dir=rtl] *{--tw-enter-translate-x:-100%/100%}`
  (yalnız `[dir=rtl]` kapsamında üretildi).
- Mantıksal utility'ler → `inset-inline-*` / `margin-inline-start` / `padding-inline-start`
  / `border-inline-start` / `text-align:start` derlendi.
- Toast: `[dir=rtl] .animate-slide-in-right{animation-name:slide-in-left}` + `@keyframes slide-in-left` mevcut.

### 4.5 Frozen LTR (DirectionProvider global layout'u bozmadı)
- **Footer (statik, frozen): BYTE-IDENTICAL** before=after (sha `3f9edf9b…` = `3f9edf9b…`). ✅
- Navbar: before≠after **AMA KONTROL TESTİ** (aynı after-build'den 2× shot da farklı:
  13242≠13229) → navbar **non-deterministik** (canlı içerik); fark **benim değişikliğimden
  DEĞİL** (D1'deki tanı). Statik footer'ın byte-özdeşliği geçerli kanıttır.

### 4.6 Çekirdek/mantık
Hiçbir hesap/RPC/sealed/geri-sayım/motor/iş-mantığı dosyası **dokunulmadı**. Değişiklik
tümüyle CSS yön sınıfları + 1 radix yön-provider + 1 keyframe. Davranış (open/close/
ESC/overlay/focus-trap) radix/primitif'in kendi mantığında — değişmedi.

---

## 5. SONUÇ
Side-variant Sheet + radix floating primitive'ler (DirectionProvider) + menü-içi
yön + Toast slide **RTL'e hazır**; LTR **birebir korundu** (footer byte-identical +
sentetik computed + CSS-scope + smoke). Test-edilemez/JS-side/merkez öğeler dürüstçe
[REVIEW]. **FAZ 2 [REVIEW] grup 1+4 kapandı.** Sıradaki: CENTERING/ARBITRARY turu (grup 2, FAZ 2 finali).
