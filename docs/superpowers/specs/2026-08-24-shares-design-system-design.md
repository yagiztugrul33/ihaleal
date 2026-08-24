# ihaleal.com — "Shares" Tasarım Sistemine Geçiş

**Tarih:** 2026-08-24
**Kapsam:** Yalnızca görsel tutarlılık (renk, tipografi, spacing, border-radius, component stilleri). İçerik, route yapısı, özellik mantığı, backend/edge function'lara dokunulmuyor.
**Kaynak:** Kullanıcının Refero'dan seçip yüklediği "Shares — Style Reference" DESIGN.md dosyası (monokromatik fintech, tek vurgu rengi Signal Violet #594ff4, açık/ivory zemin).

## Neden bu yaklaşım

ihaleal.com zaten tek-kaynak token mimarisiyle kurulu:
- `src/styles/tema.css` — tüm renk/köşe/gölge/boşluk tokenlarının tanımlandığı TEK dosya (`:root` bloğu), üzerine eski değişken adlarının (--lux-*, --premium-*, --color-*, shadcn HSL üçlüsü) yeni tokenlara eşlendiği bir "geriye uyum" bloğu.
- `src/styles/global-acik.css` — üretilmiş bir override katmanı; ağaçta 250+ bileşene dağılmış hardcoded Tailwind utility class'larını (`bg-slate-900`, `bg-gradient-to-*` vb.) attribute selector'larla yakalayıp token'lara bağlıyor.
- `src/components/ui/*` — shadcn tabanlı merkezi UI primitifleri (Button, Card, Input, Badge, Accordion) — her sayfa bunları import ediyor.

Bu üç katman sayesinde, 735 dosyayı tek tek değiştirmeden **renk/gölge/genel yüzey** tutarlılığı merkezi olarak sağlanabiliyor — nitekim ekip koyu→açık tema geçişini de böyle yapmış (git geçmişi: "koyu panel 364 → 0"). Aynı deseni "Shares" tasarım sistemi için kullanacağız.

**Alternatif değerlendirilip reddedildi:** Her sayfayı/bileşeni elle yeniden yazmak — çok daha yüksek risk (735 dosya, regresyon ihtimali), çok daha uzun süre, ve mevcut mimariyi görmezden gelmek anlamına gelir. YAGNI: mevcut token/override mekanizması bu iş için zaten yeterli.

## Değişiklik Alanları

### 1. Renk Tokenları — `src/styles/tema.css`

| Token | Eski | Yeni (Shares) |
|---|---|---|
| `--vurgu` | `#1e40af` (lacivert) | `#594ff4` (Signal Violet) |
| `--vurgu-koyu` | `#1e3a8a` | Signal Violet'in ~%15 koyulaştırılmış hali (hover/active state için) |
| `--vurgu-yumusak` | `#eef2fb` | Signal Violet'in çok açık tonu (aynı üretim mantığı) |
| `--metin` | `#1e2a24` | `#1f1f1f` (Inkstone) |
| `--metin-ikincil` | `#5f6b64` | `#5d5d5d` (Slate) |
| `--zemin` | `#ffffff` | `#ffffff` (değişmiyor — ikisi de Porcelain) |
| `--zemin-yumusak` | `#f7f8f7` | `#f6f6f6` (Cloud) |
| `--zemin-gri` | `#eef1ee` | `#e7e7e7` (Mist) |
| `--cizgi` | `#e8ede9` | `#e7e7e7` (Mist, hafif ayraçlar) — daha belirgin ayraç gerektiren yerlerde `#b0b0b0` (Ash) |
| `--durum-basari/uyari/hata` | mevcut | **değişmiyor** — Shares bu renkleri tanımlamıyor, mevcut WCAG AA onaylı değerler korunuyor |

Ayrıca shadcn HSL üçlüsü (`--primary`, `--ring` vb.) yeni `--vurgu` değerinin HSL karşılığına güncellenecek. Kontrast oranları (WCAG AA) her yeni renk çifti için hesaplanıp `tema.css` başlığındaki kanıt bloğuna eklenecek (mevcut dosya zaten bu şekilde belgeleniyor).

### 2. Köşe Yarıçapı — merkezi UI bileşenlerinde (tema.css'te DEĞİL)

`--kose`/`--kose-kucuk` genel amaçlı token'ları OLDUĞU GİBİ KALIYOR (kartlar, modallar, dropdown'lar gibi Shares'in kapsamadığı yüzeylerde kullanılmaya devam edecek). Bunun yerine, Shares'in istediği radius çeşitliliği doğrudan ilgili merkezi bileşen dosyalarında uygulanacak:

- `src/components/ui/button.tsx` → tüm `size` varyantlarında `rounded-*` → `rounded-full` (99px pill)
- `src/components/ui/card.tsx` → `rounded-xl` → `rounded-[36px]`, `py-6` → 32px padding'e hizalanacak
- `src/components/ui/input.tsx` → 16px radius
- `src/components/ui/badge.tsx` → pill (99px)
- `src/components/ui/accordion.tsx` → 16px radius

### 3. Tipografi

- `tailwind.config.js` `fontFamily.display`: `['"Plus Jakarta Sans"', "Inter", ...]` → **`["Inter", ...]`** (Shares tek font kullanıyor; Inter zaten self-host, Aeonik'in resmi yedeklerinden biri).
- Gövde 500, başlık 700 ağırlık kuralı — mevcut `h1..h6 { color: var(--metin) }` bloğuna font-weight ve harf aralığı (uppercase eyebrow'lar için 0.075em) eklenecek.
- **Genişletilmiş kapsam:** Anasayfa (`src/pages/... Home` bileşenleri), ilan detay (`AuctionDetail`), ihaleler (`Auctions`/`LiveAuctions`) sayfalarındaki başlık `text-*` sınıfları Shares ölçeğine (56px/72px display, 1.05–1.15 line-height) elle güncellenecek. Diğer sayfalara dokunulmuyor.

### 4. Buton İç Detayları (mevcut kod hatası, düzeltilecek)

`button.tsx`'teki `default` varyant şu an `hover:shadow-[0_16px_48px_rgba(37,99,235,0.45)]` ve `focus-visible:ring-blue-500/50` gibi **hardcoded mavi** değerler taşıyor — `--vurgu` token'ına bağlı değil. Bunlar `--vurgu`'a bağlanacak (violet glow), aksi halde renk değişikliğinden sonra buton hover'ında eski mavi ton kalır.

### 5. Doğrulama Planı

Her mantıksal adımdan sonra:
1. `npm run typecheck && npm run lint && npm run test:run` — regresyon yok.
2. `npm run build` — bundle sağlıklı.
3. `node scripts/tasarim-olcum.mjs` (yerel dev server açıkken) — koyu panel/kontrast/gradyan taraması, önce/sonra karşılaştırması.
4. Playwright ile en az 3 sayfada (anasayfa, ilan detay, ihaleler) masaüstü (1280px) + mobil (375px) ekran görüntüsü — taşan içerik, kırılan layout, okunamayan metin kontrolü.

### Kapsam Dışı

- İçerik metni, route yapısı, özellik mantığı, Supabase/Edge Function'lar.
- Dark mode toggle (proje zaten tek temaya kilitli, `[data-theme]` kuralları aynı açık değerlere sabit).
- 735 dosyanın tamamının tek tek taranması (yalnız merkezi katman + 3 ana sayfa).
