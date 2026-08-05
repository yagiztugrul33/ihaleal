# DENETİM KAYDI — Ö2 Sadeleştirme (2026-08-05)

Temel (öncesi) ref: `2da8c8d` — sadeleştirme serisinin ebeveyni.
Son ölçüm ref: `6d0711a` (staging). Metrik kaynağı: `scripts/denetim-uret.mjs` → `public/denetim.json`
(git show + regex sayımı; elle girilmiş değer yok).

## Sayfa önce/sonra tablosu

Sütunlar: HC = hardcoded hex renk, GR = gradyan, KP = koyu panel (bg-slate-900/950 + bg-[#0…]),
DK = düşük kontrast metin (<4.5:1, palet çözümlemeli), TA = tıkla-aç modül/toggle sayısı.

| Sayfa | HC | GR | KP | DK | TA |
|---|---|---|---|---|---|
| pages/Home.tsx | 0→0 | 0→0 | 0→0 | 0→0 | 0→6 |
| components/SearchModal.tsx (Ctrl+K) | 1→1 | 0→0 | 1→1 | 12→0 | 0→1 |
| pages/SearchResults.tsx | 0→0 | 0→0 | 12→13 | 2→0 | 0→1 |
| pages/Analytics.tsx | 37→37 | 2→0 | 24→24 | 16→0 | 0→1 |
| pages/Reports.tsx | 0→0 | 0→0 | 12→13 | 10→0 | 0→1 |
| pages/Documents.tsx | 0→0 | 0→0 | 1→1 | 4→0 | 0→0 |
| pages/LiveAuctions.tsx | 0→0 | 0→0 | 2→2 | 1→0 | 0→0 |
| pages/Messages.tsx | 0→0 | 0→0 | 4→4 | 11→0 | 0→0 |
| pages/NotificationsPage.tsx | 0→0 | 0→0 | 3→3 | 3→0 | 0→0 |
| pages/AuctionDetail.tsx | 10→10 | 6→0 | 18→18 | 29→0 | 0→0 |
| pages/PricingPage.tsx | 0→0 | 2→0 | 16→16 | 12→0 | 0→0 |
| pages/CitiesList.tsx | 0→0 | 1→0 | 0→0 | 5→0 | 0→0 |
| pages/intelligence/IntelligenceHub.tsx | 1→1 | 2→1 | 1→1 | 1→0 | 0→0 |
| pages/legal/LegalHubPage.tsx | 0→0 | 1→0 | 10→10 | 2→0 | 0→0 |

Notlar:
- DK sütunundaki sıfırlama TOKEN düzeyinde yapıldı: `slate-500` #64748B→#7D8CA3 (3.9:1→5.4:1),
  `slate-600` #475569→#74849E; açık `bg-white` adacıkları index.css'te eski koyu değere döner.
  Bu yüzden sayfalara tek tek dokunulmadan 762 kullanım birden AA'ya çekildi.
- Home "öncesi" 0/0: temel ref'te Home.tsx ince bir sarmalayıcıydı (yoğun içerik sections/ altındaydı);
  yoğun blokların kaldırılıp 6 modül kartına inişi `aaa482e` commit'inde.
- KP 12→13 (SearchResults/Reports): toggle butonunun kendisi bir koyu panel satırı ekledi; blok içeriği
  varsayılan kapalı.

## Gradyan son durumu

Depo geneli satır sayısı: 239 (gece öncesi) → 200 (Ö2 başı) → **158**.

Sıfırlananlar: tüm emerald/amber/durum gradyanları (31 dosya) düz `--lux-emerald/amber` token
tintlerine indirildi; şablon-beslemeli kartlar (Pricing, LegalHub, IntelligenceHub, CitiesList,
Stats, skor halkası) düz sınıfa geçti.

Kalan gradyan gerekçeleri (kategori bazında):
- `styles/premium-cinematic-home.css` (27) + cinematic bileşenler (TerminalHero, WaveBackground,
  CinematicPropertyGallery, AIInsightLayer, HomeTarget, PlatformModulesShowcase): **ana sayfa
  sinematik tasarım dili** — tek "wow" yüzeyi olarak bilinçli korunuyor; ana sayfa dışına sızmıyor.
- `styles/tokens.css` (8) + `theme.css` (3) + `theme-luxury-ext.css` (29): **token tanım katmanı** —
  gradyanların tek kaynağı burası; sayfalar bunları tüketir (gradyansızlaştırma bu tanımlar üzerinden yönetilir).
- `index.css` (4) + `borsa/borsa.css` (3): tanım/fallback katmanı (skeleton shimmer, text-gradient utility).
- Görsel üstü scrim'ler (`--gradient-scrim` tüketen kartlar): **okunabilirlik zorunluluğu** — fotoğraf
  üzerine metin.
- Chart/SVG `linearGradient` dolguları (Analytics, AuctionDetail fiyat grafiği): **veri görselleştirme
  dolgusu**, panel süsü değil.
- ChatWidget (7), AiAssistantAvatar (3): marka maskotu/CTA yüzeyi — tek bileşende sınırlı.
- IntelligenceHub hero yıkaması (1): war-room sayfa kimliği, tek örnek.

## Tıkla-aç envanteri

- Ana sayfa: 6 modül kartı (İhale Arama, Gayrimenkul Borsası, Harita, Analiz & Raporlar,
  Portföyüm, Risk Merkezi) — tıklayınca kendi sayfası açılır.
- SearchResults: "Gelişmiş filtreler" toggle (URL paramı aktifse açık başlar).
- Analytics: "Gelişmiş görünüm" (piyasa döngüsü + portföy dağılımı) varsayılan kapalı.
- Reports: filtre paneli toggle arkasında.
- Ctrl+K komut paleti: 24 rota/modül kaydı + ilan araması, ok tuşları + Enter.

## Commit listesi (Ö2 serisi)

- `aaa482e` ana sayfa 6 modül kartına indirildi
- `5c3587e` gelişmiş filtre/grafik blokları toggle arkasına (3 sayfa)
- `4ded4e1` skeleton yükleme + boş-durum ekranları (11 sayfa)
- `9d8fdc1` Ctrl+K komut paleti — rota + modül araması
- `674bfce` durum gradyanları düz lux tokenlarına (emerald/amber tokenleri)
- `1f62c8d` AA kontrast token düzeyinde (slate-500/600 + muted-foreground)
- `ee8b71a` AuctionDetail son durum gradyanları + denetim üreticisi
- `aa6f9ac` public/denetim.json ilk üretim
- `45f71f9` LiveAuctions eksik import düzeltmesi (gerçek tsc ile bulundu)
- `6d0711a` denetim.json güncel HEAD ile

## KAPI 1 — soğuk doğrulama (C:\Users\yagiz\Projeler\_dogrulama\ihaleal, ref 6d0711a)

| Adım | Süre | Sonuç |
|---|---|---|
| git clone -b staging | 2.4 sn | OK |
| npm ci | 78.3 sn | OK (npm warn allow-scripts satırları hariç temiz) |
| npm run build | 36.5 sn | EXIT=0 — "precache 304 entries (6618.91 KiB) … dist/sw.js" |
| npm run typecheck (kök script) | 1.1 sn | EXIT=0 — **UYARI: no-op** (aşağıya bak) |
| npx tsc --noEmit -p tsconfig.app.json (gerçek) | 46.1 sn | 30 hata — tümü Ö2 ÖNCESİNDEN kalma |

**Önemli bulgu:** kök `tsconfig.json` solution-style (`"files": []`, yalnız references) olduğundan
`tsc --noEmit` hiçbir dosyayı denetlemiyor; `npm run typecheck` her zaman 0 hatayla dönüyor.
Gerçek denetim `-p tsconfig.app.json` ile yapıldı: 30 mevcut hata (BorsaTerminali, ChatWidget,
lib/reports/*, hooks/* vb. — hiçbiri Ö2 dosyalarından değil; Ö2'nin kendi hatası olan LiveAuctions
importu `45f71f9` ile kapatıldı). Script düzeltmesi CI'ı kıracağı için operatör onayına bırakıldı
(SABAH_ONAY_KUYRUGU).

## KAPI 2 — soğuk klonda preview + curl kanıtı (2026-08-05 10:49–10:50)

- `GET http://localhost:4173/` → **HTTP 200**, 10194 bayt, `<div id="root">` mevcut.
- `GET /assets/index-DEjZEl4i.js` → **HTTP 200** (483.108 karakter):
  - modül kartı başlığı bundle'da: `title:"Gayrimenkul Borsası",href:"/borsa"` (Harita, İhale Arama vb. ile birlikte)
  - Ctrl+K kodu bundle'da: "Komut paleti" + `Ctrl K` kbd etiketi + PAGE_COMMANDS rotaları
- `GET /assets/LoadingState-EfjbynJf.js` → **HTTP 200**, `animate-pulse` skeleton sınıfı mevcut.

## Vercel preview

- Push: `git push -u origin staging` **başarılı** (yeni dal, ardından 563e812 ile ikinci push).
- Commit status (563e812): `Vercel / state: success`,
  dashboard: https://vercel.com/yagizo/ihaleal/8Lc4MVbyoGvEer8jzTcDT59fiDYa
- Preview URL `https://ihaleal-git-staging-yagizo.vercel.app/` → HTTP 200 **ama uygulama değil**:
  gövde `<title>Login – Vercel</title>`, `id="root"` yok → **Deployment Protection açık.**
  → Kuyruk: Vercel → ihaleal → Settings → Deployment Protection → kapat.
- `https://ihaleal.vercel.app/` (production, main dalı) HTTP 200 + `id="root"` var — Ö2 içermez.
- GitHub deployments API'de staging kaydı yok (Vercel bu repoda yalnız commit status yayımlıyor).

---

# Ö2 — GÖRÜNÜM CİLASI (2026-08-05, ikinci tur)

Temel: `aa2d700`. Ölçüm aracı: Lighthouse CLI (mobil varsayılan kısıtlama),
**Chrome for Testing 151.0.7922.76** (Edge headless `NO_NAVSTART` verdiği için kullanılamadı).
Her ölçüm **3 tur**, tabloda **medyan** var. Sunucu: `vite preview --host 127.0.0.1`.

## Lighthouse önce / sonra (3 tur medyan)

| Ölçüt | ÖNCE (aa2d700) | SONRA (37715c5, soğuk klon) | Değişim |
|---|---|---|---|
| Performans | **57** (58/57/53) | **71** (70/71/71) | **+14** |
| Erişilebilirlik | **90** (90/90/90) | **100** (100/100/100) | **+10** |
| SEO | **100** | **100** | — |
| FCP | 5129 ms | 4643 ms | −486 ms |
| LCP | 5675 ms | 4899 ms | −776 ms |
| TBT | 54 ms | 45 ms | −9 ms |
| CLS | **0.186** | **0.0032** | **−98%** |
| Speed Index | 5129 ms | 4643 ms | −486 ms |
| Başarısız denetim (binary) | 3 | **0** | — |

## Düzeltilen 2 büyük sorun (Lighthouse'un kendi fırsat/tanı listesinden)

**1) `unused-javascript` — 1050 ms / 216 KB (en yüksek etkili fırsat)**

Kök neden ölçümle bulundu: giriş chunk'ı `vendor-charts` içinden tek bir sembol (`clsx`)
import ediyordu. Rollup, `manualChunks` recharts'ı zorladığı için paylaşılan `clsx` modülünü de
aynı chunk'a koymuş; ana sayfa hiç grafik göstermediği hâlde **456 KB'lik recharts kritik
yola giriyordu**. `vendor-utils` chunk'ı eklendi (clsx + tailwind-merge + cva).

- Kritik yoldaki 117 KB'lik `vendor-charts` yerini **27 KB'lik `vendor-utils`** aldı.
- Kullanılmayan JS 216 KB -> 124 KB; performans 57 -> 62; TBT 54 -> 0 ms.
- Kanıt: `dist/index.html` modulepreload listesinde `vendor-charts` **yok** (KAPI 2, satır 7).

**2) CLS 0.186 — sayfa yükünün tamamındaki tek kayma**

Lighthouse "Web font loaded" diyordu; **bu yanıltıcıydı.** PerformanceObserver ile gerçek
`layout-shift` kaydı alındı: `premium-home` **y:73 -> 241** (168 px aşağı). Kaynak font değil,
`OnboardingTip` bileşeniydi — `useState(false)` + `useEffect` ile localStorage'ı ilk boyamadan
SONRA okuyup görünür oluyor, içeriği aşağı itiyordu. Karar `useState` lazy init'e alındı.

- CLS **0.186 -> 0.0032**; performans 62 -> 70.
- Yanında kalan artık kaymayı da kapatan iki ek: font `@import` yerine `index.html <head>`'e
  alındı; yedek font metrik eşlemesi (`size-adjust` / `ascent-override` / `descent-override`)
  eklendi. **Değerler tahmin değil**: headless Chrome'da `canvas.measureText` ile Inter,
  Plus Jakarta Sans ve Arial'in gerçek genişlik/ascent/descent değerleri ölçülüp oranlandı.

## Erişilebilirlik 90 -> 100 (üç başarısız denetim kapatıldı)

| Denetim | Kök neden | Düzeltme |
|---|---|---|
| `button-name` | ChatWidget "Soru–cevap" butonunun metni `sm` altında gizli, ikonu `aria-hidden` -> mobilde erişilebilir ad yok | `aria-label` eklendi |
| `color-contrast` | `global-dark.css` bağlantı kuralı, buton gibi biçimlenmiş bağlantıların yazısını da maviye zorluyordu -> "İlanları gör" CTA'sı mavi üstüne mavi, **1.4 kontrast** | Kural `text-white` sınıflıları dışarıda bırakacak şekilde daraltıldı (site geneli düzeltme) |
| `heading-order` | Footer sütun başlıkları `h4`, başlık sırası atlıyordu | `h2` yapıldı (görünüm değişmedi — biçim sınıflardan geliyor) |

## Cila envanteri

| Alan | Bulgu | Aksiyon |
|---|---|---|
| Boşluk ölçeği | CSS'te 4/8px dışına çıkan hover kayması **yok** | Değişiklik gerekmedi |
| Tipografi | `--font-display` / `--font-body` token'ları tutarlı | Yedek font zinciri metrik eşlemeli hâle getirildi |
| Hover geçişleri | `:hover` kurallarında `padding/margin/border-width/font-size/width/height` değişimi **0 tane** (grep ile denetlendi) -> layout kaydırmıyor; transform/opacity/box-shadow kullanılıyor | Değişiklik gerekmedi |
| Focus | `focus-visible` yalnızca `button/a/[role=button]/[tabindex=0]` için tanımlıydı — **form alanları kapsam dışıydı** | `input/select/textarea/summary/[role=tab]` eklendi |
| Skeleton / boş durum | Önceki turda eklenmiş (`LoadingState`, `EmptyState`) | Değişiklik gerekmedi |
| Renk paleti | lux token'ları dışına çıkılmadı | — |

## 375px mobil taşma ölçümü (Playwright + Chrome, 375x812, isMobile)

**12 sayfanın 12'sinde `scrollWidth - clientWidth = 0px`** (soğuk klonda doğrulandı):

`/` · `/ilanlar` · `/arama` · `/nasil-calisir` · `/kurumsal` · `/services` ·
`/arastirma` · `/borsa` · `/kat-karsiligi` · `/aninda-teklif` · `/auctions` · `/how-it-works`

Ayrıca "kırpılıyor mu" denetimi yapıldı (taşan her eleman için en yakın kaydırılabilir ata arandı):

- **1 gerçek kusur bulundu ve düzeltildi:** `/kat-karsiligi` içindeki uzun dosya yolu `<code>`
  375px'te kırpılıyordu (`right=390/375`) -> `break-all`. Düzeltme sonrası kırpılan eleman **yok**.
- Viewport'u aşan diğer her şey **kasıtlı**: `overflow-x-auto` içindeki tablolar (kaydırılabilir),
  `aria-hidden` dekoratif ışık küreleri, ve `/borsa` şerit animasyonu
  (`.borsa-ticker{overflow:hidden}` + marquee; hover'da duruyor, `prefers-reduced-motion` destekli).

## KAPI 1 — temiz klon (süre damgalı)

Klon: `C:\Users\yagiz\Projeler\_dogrulama\ihaleal-cila`, `-b staging`, HEAD `37715c5`.

| Adım | Süre | Sonuç |
|---|---|---|
| `git clone … -b staging` | **165.4 sn** | OK |
| `npm ci` | **115.8 sn** | EXIT=0 |
| `npm run build` | **54.9 sn** | EXIT=0 — `dist/sw.js` + workbox üretildi |
| `npx tsc --noEmit -p tsconfig.app.json` | **50.6 sn** | EXIT=2 — **23 hata, hepsi bu turdan ÖNCE var** |

**Tip hatalarının bu tura ait olmadığı kanıtlandı:** çalışma ağacında `git stash` ile
değişiklikler geri çekilip tsc koşuldu -> **30 hata**; değişiklikler geri alınıp tekrar
koşuldu -> **30 hata**; `diff` **fark yok**. (Soğuk klondaki 23, eşzamanlı çalışan başka bir
oturumun tip düzeltmeleri sonrasındaki sayı.) Hatalı dosyalar: `gesEndeksPdf.ts`,
`GesAnalysisPage.tsx`, `useMembershipTier.ts`, `BorsaTerminali.tsx`, `AuctionDetail.tsx`,
`BorsaPage.tsx`, `ValuationTool.tsx`, `PaymentStartPage.tsx` —
**hiçbiri bu turda dokunulan dosya değil.**

## KAPI 2 — soğuk klonda preview + somut içerik kanıtı

`vite preview --host 127.0.0.1 --port 4210` (klon dizininden):

```
[1] HTTP durum:            200
[2] title:                 <title>ihaleal.com — Yapay zeka destekli gayrimenkul platformu</title>
[3] description:           "İhale, kapalı teklif veya ilan modu; gerçek alıcı–satıcı ve kiralıkta güvenli süreç…"
[4] font linki head'de:    1   (index.html <head> içinde — @import değil)
[5] "Inter Fallback":      2   (yedek font metrik eşlemesi kritik CSS'te)
[6] kritik chunk'lar:      vendor-react, vendor-supabase, vendor-utils, vendor-ui, vendor-zod, vendor-motion
[7] vendor-charts:         0   <- recharts kritik yolda DEĞİL (asıl düzeltmenin kanıtı)
[8] /ilanlar:              200
[9] /arastirma:            200
```

375px taşma ölçümü de soğuk klon üzerinde koşuldu (yukarıdaki tablo).

## Commit'ler

| SHA | Konu |
|---|---|
| `f8eaced` | perf: clsx/tailwind-merge ayrı chunk'a alındı, recharts kritik yoldan çıktı |
| `5b78cb8` | perf: ana sayfadaki düzen kayması (CLS) 0.186 -> 0.003 |
| `b8f8860` | fix(a11y): mobil ikon butonuna erişilebilir ad, uzun dosya yolu kırpılması |

Hepsi `origin/staging`'e push'landı.

> **Not — eşzamanlı oturum:** Bu tur sürerken aynı çalışma ağacında başka bir oturum da
> commit atıyordu (`df3dfee`, `c80ed7e`, `37715c5` ve `typecheck` script düzeltmesi onun işi).
> `b8f8860`, bu turun hazırladığı 4 dosyayı o oturumun kendi commit mesajıyla kayda geçirmesidir;
> içerik aynen korunmuştur (`git show --stat b8f8860` ile doğrulandı).

## Kuyruk (bu turda kapatılmadı)

1. ~~**`AI_DEFAULT` tanımsız**~~ — `src/components/ChatWidget.tsx:240` `return AI_DEFAULT;`
   yazıyordu ama değişken hiçbir yerde tanımlı değildi (tip hatası değil, **çalışma zamanı
   çökmesi**: hiçbir anahtar kelime eşleşmediğinde varsayılan yanıt `ReferenceError` atıyordu).
   **KAPANDI** — eşzamanlı oturum `337f58c` ile sabiti tanımladı (`ChatWidget.tsx:123`).
2. ~~**Kalan 23 tip hatası**~~ — **KAPANDI**: eşzamanlı oturumun `337f58c`, `f68fb87`,
   `ca31db2`, `263cc8d` commit'lerinden sonra `npx tsc --noEmit -p tsconfig.app.json`
   **0 hata** veriyor (bu turun sonunda doğrulandı). `npm run typecheck` de artık gerçek
   denetime bağlı (`263cc8d`), yani KAPI 1'in "no-op" uyarısı geçersiz.
3. **`unused-javascript` hâlâ 590 ms / 124 KB** — kalan en büyük fırsat; `vendor-supabase`
   (44 KB kullanılmıyor) ve `vendor-react` giriş yolunda. Supabase istemcisinin tembel
   yüklenmesi incelenebilir (AuthContext'e bağlı, dikkat gerektirir).
4. **FCP/LCP hâlâ ~4.6 / 4.9 sn** — performansı 90'a çıkarmak için kritik JS'in daha da
   küçülmesi gerekiyor; ayrı bir tur konusu.

---

# Ö2 — TS KAPANIŞI (2026-08-05, üçüncü tur)

**Hata sayısı: 30 → 0.** Yukarıdaki "eşzamanlı oturum" notlarında geçen
`37715c5 … 263cc8d` serisi bu turun işidir; aşağısı o turun tam kaydıdır.

## Sahte yeşil: sorunun kökü

Kök `tsconfig.json` solution-style (`"files": []` + yalnızca `references`). Bu yüzden
`npm run typecheck` → `tsc --noEmit` **hiçbir dosyayı denetlemiyor** ve her koşulda
exit 0 dönüyordu. Gerçek denetim `tsconfig.app.json` projesiyle yapılınca **30 hata**
ortaya çıktı.

| | Öncesi | Sonrası |
|---|---|---|
| `typecheck` scripti | `tsc --noEmit` | `tsc --noEmit -p tsconfig.app.json` |
| Denetlenen dosya | 0 | `src/**` tamamı |
| Çıktı | daima exit 0 (sahte yeşil) | gerçek denetim, şu an 0 hata |

Kök `tsconfig.json` **değiştirilmedi** — yalnızca `package.json`'daki script satırı.

## Gruplar (30 hata, 5 kök neden)

| # | Grup | Hata | Kök neden ve kapatma yöntemi |
|---|---|---|---|
| A | `PropertyDetails` index imzası | 7 | `interface` → `type` alias. TS yalnızca type alias'lara **örtük index imzası** verir; interface olduğu için `Record<string, unknown>` okuması TS2352/TS2322 veriyordu. Alan listesi ve katılık aynen korundu. `emsalMotoru.ts` (4) + `endeksRaporu.ts` (3). |
| B | GES `irrPct: number \| null` | 10 | Motor `null` dönebiliyor, tüketiciler `number` varsayıyordu. `fmtPct` imzası `number \| null \| undefined` yapıldı (`Number.isFinite(null)` zaten `false` → çıktı eskiden de `"—"`). Karşılaştırma/aritmetikte `?? 0`; JS `null`'u zaten `ToNumber → 0` yaptığı için **üretilen değerler birebir aynı**. `gesEndeksPdf.ts` (6) + `GesAnalysisPage.tsx` (4). |
| C | Tanımsız referans (TS2304) | 3 | Üçü de **gerçek çalışma zamanı `ReferenceError`**'ıydı, tip gürültüsü değil. `ChatWidget` → silinmiş `AI_DEFAULT` sabiti `4909bb7`'deki özgün metniyle geri alındı. `AuctionDetail` → eksik `getListingNumber` import'u. `BorsaPage` → `forEach` dışında kalan `item` yerine aynı blokta hesaplanan `upCount`. |
| D | Eksik alan / prop bildirimi | 7 | `Aramalarim` hook `removeSearch` dönüyor (destructure yeniden adlandırıldı) · `ValuationTool` `CityPrice.name` yok, `label` var · `AuctionDetail` satır tipine `buy_now_price_try` · `Auction` tipine opsiyonel `verified` · `PaymentStartPage` zorunlu alanlı cast → opsiyonel cast + daraltma · `BorsaTerminali` ×2 tanımsız `compact` prop'u kaldırıldı. |
| E | Hook tip uyumsuzlukları | 3 | `useDevicePushSubscription`: TS 5.7+ ile çıplak `Uint8Array` = `Uint8Array<ArrayBufferLike>` olup `SharedArrayBuffer`'ı da kapsadığından `BufferSource` ile uyuşmuyordu → dönüş tipi `Uint8Array<ArrayBuffer>`. `useMembershipTier` ×2: supabase sorgu kurucusu `PromiseLike` (`then` var, `catch` yok) → iki zincir `Promise.resolve(...)` ile gerçek Promise'e sarıldı. |

**Bu turda eklenen `@ts-expect-error` / `@ts-ignore` / `any`: 0.** Otuz hatanın tamamı
gerçek tip düzeltmesiyle kapatıldı; geçici susturmaya gerek kalmadı. Repodaki tek
`@ts-expect-error` bu turdan öncedir ve dokunulmadı: `src/components/pwa/InstallPrompt.tsx:31`
(iOS Safari'ye özgü property). `src/` altında `@ts-ignore` / `@ts-nocheck` yok.

## Davranış değişikliği notu (dürüstlük kaydı)

Grup A, B, D, E'de çalışma zamanı çıktısı **birebir aynı**. Grup C'deki üç düzeltme
tanım gereği davranışı değiştirir, çünkü mevcut kod o satırlarda `ReferenceError`
atıyordu; "değişmeyen davranış" seçeneği yoktu. `BorsaPage`'te `item.dir` yerine
`upCount` seçimi bir **yorum kararıdır** → kuyruğa yazıldı.

## Commit'ler

| SHA | Grup | Konu |
|---|---|---|
| `37715c5` | A | fix(types): PropertyDetails type alias'a alindi, ortuk index imzasi acildi |
| `a69b734` | B | fix(ges): IRR null olabilirligi tip duzeyinde ele alindi |
| `337f58c` | C | fix(runtime): tanimsiz 3 referans giderildi (TS2304) |
| `f68fb87` | D | fix(types): eksik alan/prop bildirimleri hizalandi (7 hata) |
| `ca31db2` | E | fix(hooks): push anahtar buffer turu ve supabase thenable zinciri |
| `263cc8d` | — | chore(ci): typecheck scripti gercek denetime baglandi |

Hepsi `origin/staging`'e push'landı.

Hata sayısı grup grup ölçüldü: **30 → 23 → 13 → 10 → 3 → 0**.

## KAPI 1 — soğuk klon (süre damgalı)

Yol: `C:\Users\yagiz\Projeler\_dogrulama\ihaleal-ts`, ref `263cc8d` (`-b staging`).
Süreler `Measure-Command` ile ölçüldü.

| Adım | Süre | Exit |
|---|---|---|
| `git clone … -b staging` | 177,0 sn | 0 |
| `npm ci` | 102,0 sn | 0 |
| `npm run typecheck` (artık **gerçek**) | 46,6 sn | **0** |
| `npm run build` | 43,3 sn | **0** |

Build son satırları: `✓ built in 30.07s` · `PWA v1.3.0 / mode generateSW` ·
`precache 305 entries (6621.17 KiB)` · `dist/sw.js`, `dist/workbox-9c35ba06.js`.

## KAPI 2 — soğuk klonda preview + somut içerik kanıtı

`npm run preview` → `http://localhost:4173/`. Altı kanıt curl ile toplandı:

| # | Kanıt | Sonuç |
|---|---|---|
| 1 | `GET /` | `HTTP=200`, 11236 bayt, `<title>ihaleal.com — Yapay zeka destekli gayrimenkul platformu</title>` |
| 2 | Uygulama kökü + modül script | `<div id="root"></div>` ve `src="/assets/index-BNIQW5Xp.js"` |
| 3 | **Geri alınan `AI_DEFAULT` metni bundle'da** | `assets/index-BNIQW5Xp.js` (456 232 bayt) içinde `"Anahtar kelimeyle tekrar sorabilirsiniz"` bulundu — C grubu düzeltmesi derlenmiş çıktıda |
| 4 | `GET /assets/AuctionDetail-B5GqI5DH.js` | `HTTP=200`, 132 396 bayt, içinde `ihaleal-ekspertiz-` → `getListingNumber` import'u derlendi |
| 5 | `GET /assets/BorsaPage-xjuaId1w.js` | `HTTP=200`, 45 717 bayt |
| 6 | SPA fallback `GET /ilan/deneme` | `HTTP=200`, 11236 bayt, aynı `<title>` |

## KAPI 3

Bu bölüm + `public/denetim.json` `scripts/denetim-uret.mjs` ile yeniden üretildi.

---

# Perf turu — Ö2 performans 70 → 76 (2026-08-05, ref `73b9946` → `e9a95b4`)

## Ölçüm yöntemi ve gürültü (önce dürüstlük notu)

**PSI (PageSpeed Insights) KULLANILAMADI.** Neden, kanıtla:

- Staging'in Vercel preview URL'leri SSO duvarının arkasında:
  `https://ihaleal-2cnqhi7uh-yagizo.vercel.app` → `HTTP 302` → `vercel.com/sso-api?...`.
  PSI bu sayfayı çekemez.
- `www.ihaleal.com` **herkese açık (HTTP 200)** ama **staging kodunu servis etmiyor**:
  son Production deployment `3ed3869` / 2026-06-03; canlı HTML'de `assets/index-EzvbZe4l.js`
  ve `vendor-charts` var, `vendor-utils` / `vendor-leaflet` yok — yani bu turun ve önceki turun
  chunk ayrımından önceki build. Bu URL'e PSI koşmak staging değişikliklerini ölçmezdi.

Bu yüzden **yerel Lighthouse** kullanıldı. Kurulum ve karşılaşılan üç engel:

| Engel | Belirti | Çözüm |
|---|---|---|
| Chrome kurulu değil | `No Chrome installations found` | `CHROME_PATH` → Edge (Chromium) `msedge.exe` |
| `vite preview` başlıklarındaki `Cross-Origin-Opener-Policy: same-origin` | Her turda `NO_NAVSTART`, hiçbir metrik üretilemiyor | Ölçüm, COOP göndermeyen minimal statik sunucuyla yapıldı (üretimdeki gibi **gzip**'li) |
| chrome-launcher geçici profili silemiyor (Windows `EPERM`) | Zombi `msedge` süreçleri sonraki turları bozuyor | Her turdan önce `taskkill`; rapor JSON'u yazıldıysa tur geçerli sayılır |

Ölçüm sunucusu üretimi taklit eder: metin varlıkları gzip'li, `assets/` uzun cache'li.

**Gürültü:** temel ölçüm çok kararlıydı (5/5 tur 70-71). Font aktivasyonu `load` sonrasına
alındıktan sonra dağılım **çift tepeli** hâle geldi (turların bir kısmı FCP ~3.0-3.5 sn /
TBT ~150 ms, bir kısmı FCP ~4.05 sn / TBT 0) — bu yüzden final ölçüm **5 değil 9 tur** koşuldu.
5 turluk bir final ölçüm medyanı 79 verdi, 9 turluk 76; **raporlanan sayı 9 turluk olan 76'dır**
(daha güvenilir). Tek turluk sonuçlara karar bağlanmadı.

## Önce / sonra (yerel Lighthouse, mobil, simüle kısıtlama)

| Metrik | Önce (`73b9946`, 5 tur) | Sonra (`e9a95b4`, soğuk klon, 9 tur) | Fark |
|---|---|---|---|
| **Performans** | **70** (aralık 70-71) | **76** (aralık 75-77) | **+6** |
| FCP | 4657 ms (4531-4684) | 3635 ms (3122-4081) | −1022 ms |
| LCP | 4893 ms (4879-4909) | 4115 ms (3831-4460) | −778 ms |
| Speed Index | 4657 ms | 3635 ms | −1022 ms |
| TBT | 0 ms | 145 ms (0-336) | +145 ms |
| CLS | 0.0032 | 0.0028 (0-0.0034) | −0.0004 |

TBT artışı bilinçli takas: font `media` geçişi ve tembel Supabase chunk'ı ilk boyamadan
sonra biraz ana iş parçacığı işi ekliyor. TBT'nin ağırlığı %30 olduğu hâlde 145 ms hâlâ
"iyi" bandında (<200 ms) ve FCP/LCP/SI kazancı net pozitif.

Diğer kategoriler **bozulmadı** (tam kategori koşusu, `e9a95b4`):
**Erişilebilirlik 100 · En iyi uygulamalar 100 · SEO 100.**
`npm run typecheck` **0 hata**, `npm run build` **exit 0**.

## Kabul edilen düzeltmeler ve her birinin ÖLÇÜLEN etkisi

Her adım ayrı ölçüldü; sıra önemli (6. madde bunu kanıtlıyor).

| # | Commit | Değişiklik | Ölçülen etki (medyan) |
|---|---|---|---|
| 1 | `ddcdb60` | Yanlış LCP preload (`/icon-192.png`) kaldırıldı, `fetchPriority="high"` görsele taşındı | Perf 70→70 (nötr), CLS medyanı 0.0032→0 |
| 2 | `aa0633d` | **`vendor-supabase` kritik yoldan çıkarıldı** (SDK dinamik import) | **Perf 70→74**, FCP −411 ms, LCP −436 ms (5/5 tur aynı skor) |
| 3 | `0518d78` | `preview-noindex.js` + `hash-redirect.js` `defer`; Arapça font talep üzerine | Perf 74→74 (nötr), FCP −32 ms |
| 4 | `d98f8b5` | **Google Fonts render'ı bloklamıyor** (`media="print"` + `/font-loader.js`, `load` sonrası aktivasyon) | **Perf 74→75**, FCP −399 ms |
| 5 | `d99ef7d` | `vendor-zod` kritik yoldan çıkarıldı (oran sabitleri `commission/rates.ts`) | Perf 75→75 (nötr), FCP −133 ms; kazanç yapısal |
| 6 | `e9a95b4` | **LCP görseli preload** (bu kez kazandı — aşağı bakın) | **Perf 75→77**, LCP −274 ms |

### En büyük darboğaz neydi: fontlar

Fontları `index.html`'den tamamen çıkaran **kontrol ölçümü**: Perf 74 → **80**,
FCP 4214 → 3070 ms, LCP 4448 → 3718 ms. Yani ilk boyama 183 KB'lik woff2 kuyruğunu bekliyordu.
Bunun tamamı alınamaz (fontlar korunmalı); `media="print"` deseniyle bir kısmı alındı.

### Ölçümün kararı değiştirdiği örnek (sıra bağımlılığı)

LCP görselinin preload'u **aynı turda iki kez** denendi:

1. Fontlar hâlâ render-blocking iken: **fayda yok** (LCP 4893 → 4959 ms) — 20 KB'lik görsel,
   kritik JS ve woff2 kuyruğuyla bant genişliği için yarışıyordu. **Geri alındı.**
2. Fontlar kritik yoldan çıktıktan **sonra** aynı değişiklik: **kazandı**
   (Perf 75 → 77, LCP 4427 → 4153 ms). **Kabul edildi** (`e9a95b4`).

Ders: bu kod tabanında kritik yol **bant genişliğine** bağlı; tek tek "iyi bilinen"
optimizasyonlar sıraya göre işaret değiştirebiliyor. Ölçmeden kabul edilmemeli.

## GERİ ALINAN denemeler (ölçüm kararı yönetti)

| Deneme | Ölçüm | Karar |
|---|---|---|
| `Layout.tsx`'te ChatWidget + GeofenceWatcher + CookieConsent `React.lazy` | Perf **75 → 72**. FCP iyileşti (3815→3223) ama **LCP kötüleşti** (4433→4758), TBT 84→211. Üç tembel chunk kritik pencerede istendiği için LCP ile yarıştı | **Geri alındı** |
| Yanlış LCP görselini doğrusuyla değiştirme (fontlar çıkmadan önce) | LCP 4893 → 4959 ms | **Geri alındı** — yerine preload tamamen kaldırıldı, font işinden sonra tekrar denendi ve o zaman kabul edildi |
| `Navbar.tsx`'te SearchModal `React.lazy` (yalnız açıkken render) | Giriş chunk'ı 147 173 → 144 805 bayt gzip (**yalnız 2.4 KB**); Perf medyanı 75 (7 tur, aralık 70-84 — sonuçsuz) | **Geri alındı** — ölçülebilir kazanç yok, karmaşıklık var |

## 90'a ulaşıldı mı? **HAYIR — 76.** Kalan yol (ölçülmüş kanıtla)

Hedef 90'dı, 76'da kalındı. Sebep tahmin değil ölçüm:

Kritik yolda kalan gzip transferi (`e9a95b4`): giriş chunk'ı **145 KB** + `vendor-react` 74.5 KB
+ `vendor-motion` 41.3 KB + `vendor-ui` 20 KB + `vendor-utils` 9 KB + uygulama CSS'i 47 KB,
artı fontlar 183 KB.

Bu turun kalibrasyonu: **kritik yoldan ~13 KB gzip ≈ 1 Lighthouse puanı**
(`vendor-supabase` 53 KB → +4 puan datasından). 90'a çıkmak için kritik yoldan kabaca
**~180 KB gzip daha** çıkmalı — yani kalan JS'in üçte ikisi. `vendor-react` çıkarılamaz;
dolayısıyla bu, küçük ayarlarla değil **yapısal** işle mümkün. Öncelikli adaylar
(ölçülmüş boyutlarla) `SABAH_ONAY_KUYRUGU.md` kuyruğuna yazıldı.

Bu turda kritik yolun eager modül grafiği çıkarıldı (93 dosya, 719 KB kaynak). En büyük
üç kalem: `src/i18n/messages.ts` **268 KB** (4 dilin tamamı eager),
`src/styles/premium-cinematic-home.css` 45 KB, `src/App.tsx` 35 KB.

## KAPI 1 — soğuk klon (süre damgalı)

Yol: `C:\Users\yagiz\Projeler\_dogrulama\ihaleal-perf` · dal `staging` · HEAD `e9a95b4`

| Adım | Başlangıç | Süre | Sonuç |
|---|---|---|---|
| `git clone ... -b staging` | 19:26:51 | **129.5 s** | HEAD `e9a95b478af8a1b9e85966f5598bfee98b98c86c`, dal `staging` |
| `npm ci --legacy-peer-deps` | 19:29:08 | **108.6 s** | exit 0 |
| `npm run typecheck` | 19:31:29 | **32.5 s** | exit 0, **`error TS` sayısı: 0** |
| `npm run build` | 19:32:02 | **38.1 s** | exit 0, `dist/sw.js` + `workbox-9c35ba06.js` üretildi |

Soğuk klon build çıktısı doğrulaması (19:32:53):
`dist/index.html` modulepreload listesi = `vendor-react`, `vendor-utils`, `vendor-ui`,
`vendor-motion`. **`vendor-supabase` listede YOK** (grep kontrolü: "HAYIR - doğru").
Supabase ayrı dinamik chunk olarak duruyor: `assets/supabase-ZSt08kkQ.js` +
`assets/vendor-supabase-BYqEYsAz.js`.

## KAPI 2 — soğuk klonda preview + içerik ve auth kanıtı

`npm run preview` → `http://127.0.0.1:4174/` (19:33:19).

| # | Kanıt | Sonuç |
|---|---|---|
| 1 | `GET /` başlık | `<title>ihaleal.com — Yapay zeka destekli gayrimenkul platformu</title>` |
| 2 | LCP preload HTML'de | `<link rel="preload" as="image" href="/ihaleal-logo-lockup.png" fetchpriority="high" />` |
| 3 | Font render'ı bloklamıyor | `<link rel="stylesheet" media="print" data-font-swap href="https://fonts.googleapis.com/css2?family=Inter...">` + `<script src="/font-loader.js" defer>` |
| 4 | Küçük betikler defer | `<script src="/preview-noindex.js" defer></script>` ve `<script src="/hash-redirect.js" defer></script>` |
| 5 | Kritik yolda `vendor-supabase` yok | HTML'de `vendor-supabase` geçiş sayısı **0** |
| 6 | Arapça font HTML'de yok | `Noto+Sans+Arabic` geçiş sayısı **0** |
| 7 | SPA rotaları | `/` `/giris` `/ihaleler` `/harita` → hepsi **200** |
| 8 | LCP görseli servis ediliyor | `HTTP 200`, `image/png`, 20 040 bayt |

### Auth akışı bozulmadı — tarayıcı kanıtı

Supabase env'i dolu bir build ile gerçek tarayıcıda `/giris` yüklendi. Ağ dökümü **tam olarak
amaçlanan davranışı** gösteriyor:

1. **Kritik dalga:** `ihaleal-logo-lockup.png` (preload sayesinde 3. istek), `index-*.js`,
   `vendor-react`, `vendor-utils`, `vendor-ui`, `vendor-motion`, `index-*.css`,
   `font-loader.js`, `preview-noindex.js`, `hash-redirect.js` — **`vendor-supabase` YOK.**
2. **İkinci dalga (uygulama açıldıktan sonra):** `Login-*.js`, `AuthBrandHeader-*.js`,
   **`supabase-*.js` + `vendor-supabase-*.js`**, `authProfile-*.js` — SDK **talep üzerine** indi.
3. Giriş sayfası doğru render oldu: başlık `Giriş — ihaleal.com`, alanlar
   "E-posta / Şifre / Giriş Yap" ve **"Supabase Auth ile güvenli oturum."** ibaresi — bu ibare
   `isSupabaseConfigured()` true döndüğünü, yani yapılandırma yolunun çalıştığını gösterir.
   **Konsolda hata yok.**
4. `AuthProvider`'ın `loading` durumu çözüldü (form çizildi) — SDK dinamik yüklendiği hâlde
   oturum akışı takılmadı.

Auth akışında korunan sözleşmeler (kodda yorumla sabitlendi):

- `getSupabase()` **önbelleklidir** → tek `createClient` örneği → oturum sürekliliği ve
  `detectSessionInUrl` (PKCE) korunur.
- `AuthProvider`'da **sıra korundu**: önce `onAuthStateChange` aboneliği, sonra `getSession()` —
  istemci oluşturulurken işlenen PKCE geri dönüşü kaçırılmaz.
- SDK inemezse `setLoading(false)` ile uygulama "yükleniyor"da asılı kalmaz.
- `useOnlinePresence`'ta kanal hazır olunca teardown atanır; erken unmount'ta kanal yine kapatılır.

## KAPI 3

Bu bölüm eklendi ve `public/denetim.json` `scripts/denetim-uret.mjs` ile yeniden üretildi.

## Bu turun commit'leri

| SHA | Konu |
|---|---|
| `ddcdb60` | perf(lcp): yanlış LCP preload kaldırıldı, öncelik ipucu görsele taşındı |
| `aa0633d` | perf(bundle): vendor-supabase kritik giriş yolundan çıkarıldı |
| `0518d78` | perf(render-blocking): küçük betikler defer, Arapça font talep üzerine |
| `d98f8b5` | perf(font): Google Fonts stylesheet'i render'ı bloklamıyor |
| `d99ef7d` | perf(bundle): vendor-zod kritik giriş yolundan çıkarıldı |
| `e9a95b4` | perf(lcp): LCP görseli yeniden preload edildi (fontlar çekildikten sonra kazanç) |

---

# Tasarım sistemi turu — AÇIK & MİNİMAL (2026-08-05)

Temel: `f28b2de` · Son: `621e72d` · Dal: `staging`

## 1. Ne değişti

Koyu "Luxury Institutional Futurism" teması **açık & minimal tasarım sistemine** çevrildi.
Palet ve yapı patatesci ile aynı; tek fark marka rengi.

| | Önce | Sonra |
|---|---|---|
| Zemin | radyal + doğrusal gradyan duvarı, `#0B1120` | saf beyaz `#ffffff` (+ `#f7f8f7`, `#eef1ee`) |
| Metin | `#FFFFFF` / `#E2E8F0` | `#1e2a24` / `#5f6b64` |
| Vurgu | mavi 600/500/400 + sky + emerald + amber + violet | **TEK renk: lacivert `#1E40AF`** |
| Kenarlık | `rgba(255,255,255,.10–.16)` çift ton | 1px `#e8ede9` |
| Gölge | `0 16px 48px rgba(0,0,0,.4)` + mavi parıltı | `0 1px 2px rgba(30,42,36,.04)` / `0 8px 24px rgba(30,42,36,.06)` |
| Köşe | 0.5–1.5rem karışık | 10–14px |

### Kontrast kanıtı (WCAG 2.1 hesabı — tahmin değil)

| Çift | Oran | Eşik | Sonuç |
|---|---|---|---|
| `--metin` #1e2a24 / `--zemin` #ffffff | 14.88:1 | 4.5 | geçer |
| `--metin` #1e2a24 / `--zemin-gri` #eef1ee | 12.99:1 | 4.5 | geçer |
| `--metin-ikincil` #5f6b64 / #ffffff | 5.56:1 | 4.5 | geçer |
| `--metin-ikincil` #5f6b64 / #eef1ee | 4.89:1 | 4.5 | geçer |
| `--vurgu` #1e40af / #ffffff | 8.72:1 | 4.5 | geçer |
| #ffffff / `--vurgu` #1e40af | 8.72:1 | 4.5 | geçer |

Fonksiyonel durum renkleri (tek vurgu kuralının istisnası, beyaz zeminde AA):
`--durum-basari` #15803d 4.54:1 · `--durum-uyari` #9a6700 4.53:1 · `--durum-hata` #b42318 5.86:1.

## 2. Yöntem — neden dosya dosya değil

Koyu tema ağaçtaki **250+ bileşene utility olarak** yayılmıştı: 1413 `text-white`,
918 koyu panel sınıfı, 175 gradyan kullanımı, 361 sabit hex. 150+ sayfayı tek tek elden
geçirmek bu turda kalite kaybı olmadan bitirilemezdi. Bunun yerine **iki katman** kuruldu:

1. **`src/styles/tema.css`** — tek kaynak token dosyası. Eski değişken adları
   (`--lux-*`, `--premium-*`, `--color-*`, `--bg-*`, `--text-*`, shadcn HSL üçlüleri)
   yeni tokenlara **eşlendi**; geriye uyum korunuyor. `main.tsx`'te en son yüklenir.
2. **`src/styles/global-acik.css`** — utility uyum katmanı. `global-dark.css`'in yerini aldı
   (o dosya silindi). Üretici: `scripts/gen-tema-uyum.mjs` (`npm run tema:uyum`).

### Yüzey sözleşmesi

Her yüzey kuralı miras alınan altı değişkeni set eder: `--uzerine`, `--uzerine-ikincil`,
`--uzerine-vurgu`, `--uzerine-basari`, `--uzerine-uyari`, `--uzerine-hata`.
Metin utility'leri rengini buradan okur. Sonuç: **`text-white` açık yüzeyde koyu nötre
döner, dolu vurgu yüzeyinde beyaz kalır.** Tek kural, iki bağlam — 1413 kullanımın hepsi
tek noktadan doğru davranır.

Eşleşme `[class~="bg-blue-500"]` ile **tam jeton** üzerinden: `bg-blue-50` ile `bg-blue-500`
karışmaz, `hover:`/`md:` varyantları etkilenmez. Opaklık varyantları (`bg-blue-500/10`)
ayrı ve daha açık tona bağlanır.

Yol boyunca yakalanan iki gerçek hata (ölçüm olmasa görülmezdi):
- `tema.css` yorumunun içinde geçen `*/` dizisi yorumu erken kapatıyor ve **bütün token
  bloğunu** geçersiz kılıyordu (`--metin` boş dönüyordu, metinler siyaha düşüyordu).
- Üretilen CSS'i temizleyen adım seçici listesini virgülden bölerken tırnak içi virgülleri
  de bölüyor, `[class*="bg-[rgba(15,"]` kuralını geçersiz kılıyordu (AA ihlali 0 → 82).
  Bölücü tırnak/parantez farkındalığıyla yeniden yazıldı.

## 3. Sayfa × önce/sonra (ölçüm, iddia değil)

Ölçüm: `scripts/tasarim-olcum.mjs` — Playwright (Edge), gerçek DOM + hesaplanmış stil.
Önce = soğuk klon `f28b2de` · sonra = `621e72d`. 16 rota × 1280px ve 375px.
Ham veri: `public/tasarim-olcum.json`.

| Sayfa | koyu panel | gradyan | AA ihlali | satır içi renk | tıkla-aç | 375px taşma |
|---|---|---|---|---|---|---|
| `/` | 11 → 0 | 12 → 0 | 2 → 0 | 1 → 1 | 4 | 0 |
| `/ilanlar` | 18 → 0 | 46 → 0 | 11 → 0 | 0 → 0 | 4 | 0 |
| `/ihaleler` | 61 → 0 | 47 → 0 | 45 → 0 | 0 → 0 | 4 | 0 |
| `/arama` | 8 → 0 | 10 → 0 | 1 → 0 | 0 → 0 | 6 | 0 |
| `/nasil-calisir` | 27 → 0 | 17 → 0 | 1 → 0 | 0 → 0 | 10 | 0 |
| `/kurumsal` | 9 → 0 | 16 → 0 | 20 → 0 | 5 → 3 | 4 | 0 |
| `/sss` | 6 → 0 | 13 → 0 | 1 → 0 | 2 → 0 | 4 | 0 |
| `/giris` | 8 → 0 | 10 → 0 | 1 → 0 | 0 → 0 | 4 | 0 |
| `/mortgage` | 61 → 0 | 9 → 0 | 1 → 0 | 0 → 0 | 4 | 0 |
| `/degerleme` | 42 → 0 | 9 → 0 | 1 → 0 | 0 → 0 | 4 | 0 |
| `/rehber` | 19 → 0 | 10 → 0 | 2 → 0 | 0 → 0 | 4 | 0 |
| `/sehirler` | 60 → 0 | 21 → 0 | 7 → 0 | 0 → 0 | 4 | 0 |
| `/emlakci` | 10 → 0 | 13 → 0 | 6 → 0 | 7 → 0 | 4 | 0 |
| `/muteahhit` | 8 → 0 | 14 → 0 | 1 → 0 | 5 → 0 | 4 | 0 |
| `/harita` | 8 → 0 | 9 → 0 | 4 → 0 | 6 → 3 | 5 | 0 |
| `/kayit` | 8 → 0 | 10 → 0 | 1 → 0 | 0 → 0 | 4 | 0 |
| **TOPLAM (masaüstü)** | **364 → 0** | **266 → 0** | **105 → 0** | **26 → 7** | **73** | **0** |

**Mobil (375px) toplamı:** koyu panel 320 → 0 · gradyan 250 → 0 · AA ihlali 56 → 0 ·
yatay taşma 0 → 0.

**İçerik korunumu:** `body.innerText` uzunluğu 16 rotanın **hepsinde birebir aynı**
(masaüstü toplam 65 419 → 65 419). Route/veri/işlev kaybı yok.

## 4. Kaldırılan görsel gürültü envanteri

| Kalem | Adet |
|---|---|
| Koyu panel (çalışma zamanı, masaüstü + mobil) | 684 → 0 |
| Gradyan yüzey (çalışma zamanı, masaüstü + mobil) | 516 → 0 |
| CSS dosyalarında koyu renk literali → token | 326 |
| CSS dosyalarında gradyan bildirimi → düz yüzey | 44 |
| CSS dosyalarında ağır gölge → iki değerli sistem | 50 |
| Satır içi ham renk taşıyan öge (çalışma zamanı) | 26 → 7 |
| Silinen dosya | `src/styles/global-dark.css` (201 satır) |

Ayrıca: `tokens.css`'ten koyu palet çıkarıldı (yalnız tipografi/ölçek/hareket kaldı),
`index.css`'teki cam panel/koyu gradyan bileşenleri 1px çizgi + görünmez gölgeye indirildi,
`tailwind.config.js`'te marka renkleri CSS değişkenine bağlandı.

## 5. Tıkla-aç modüller

Çalışma zamanında `details` / `aria-expanded` / `data-state` taşıyan öge sayısı:
16 rotada toplam **73** (rota başına 4–10). Bu tur akordeon **sayısı değişmedi**;
mevcut tıkla-aç yüzeyleri korundu — bilgi mimarisi yeniden düzenlemesi kuyrukta.

## 6. Modern desenler

| Desen | Durum |
|---|---|
| `:focus-visible` | var — global, 2px `--vurgu` halka + 2px offset |
| Skeleton | var — kayan gradyan yerine yalnız `opacity` (GPU, CLS=0) |
| Boş durum | var — `.empty-state`, 1px kesikli çizgi + kırık beyaz |
| Ctrl/⌘+K | var — komut paleti navbar'da |
| 44×44 dokunma hedefi | var — `global-dark.css`'ten aynen taşındı |
| `prefers-reduced-motion` | var — `tema.css` + uyum katmanı |
| Mikro etkileşim | hover `translateY(-1px)`, active geri çekiliş — yalnız transform/opacity |

## 7. Kapılar

### KAPI 1 — soğuk klon (`_dogrulama/ihaleal-tasarim2`, `Measure-Command`)

| Adım | Süre | Sonuç |
|---|---|---|
| `git clone -b staging` | 76.7 s | HEAD `621e72d` |
| `npm ci` | 88.4 s | tamam |
| `npm run typecheck` | 37.3 s | **exit 0** |
| `npm run build` | 38.9 s | **exit 0** |

### KAPI 2 — Lighthouse + içerik kanıtı + 375px

**Lighthouse (mobil, 5 tur medyan, Edge `CHROME_PATH`):**

| | Perf | A11y | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|
| Önce `f28b2de` | **79** (81/77/79/79/78) | **100** | 3515 ms | 3861 ms | 134 ms | 0.003 |
| Sonra `621e72d` | **81** (67/82/79/82/81) | **100** | 3107 ms | 3600 ms | 233 ms | 0.003 |

Perf düşmedi (79 → 81); FCP −408 ms, LCP −261 ms. A11y **100** hedefi tutuldu
(27 uygulanan denetim, 0 başarısız, `color-contrast` geçer). Tek düşük tur (67) soğuk
başlangıç kaynaklı. TBT artışı (134 → 233 ms) tur içi oynaklık bandında; JS değişmedi,
yalnız CSS değişti (paket CSS gzip 46,8 → 47,7 KB, +943 bayt / +%2,0).

> Ölçüm notu: `vite preview` `Cross-Origin-Opener-Policy: same-origin` gönderdiği için
> Lighthouse her turda `NO_NAVSTART` veriyor (kuyrukta kayıtlı bilinen sorun).
> Ölçüm COOP'suz + gzip'li minimal statik sunucu üzerinden yapıldı; **iki taraf da aynı
> sunucu ve aynı bayraklarla** ölçüldü.

**İçerik kanıtı (curl, soğuk klon üretim build'i):**

1. Kritik CSS: `html,body,#root{background:#ffffff !important;…;color:#1e2a24}`
2. `<html lang="tr" data-theme="light">` + `<meta name="theme-color" content="#ffffff">`
3. `manifest.webmanifest`: `"background_color":"#ffffff"`, `"theme_color":"#ffffff"`
4. Paket CSS'inde tokenlar: `--zemin: #ffffff`, `--metin: #1e2a24`, `--vurgu: #1e40af`,
   `--cizgi: #e8ede9`, `--kose: 14px`, `--golge-kucuk: 0 1px 2px rgba(30, 42, 36, .04)`
5. Yüzey sözleşmesi kuralı paket CSS'inde:
   `[class~=text-white],[class*=" text-white/"],[class^="text-white/"]{color:var(--uzerine)!important}`
   (251 adet `class~=` kuralı, 119 `--uzerine*` geçişi)

**375px:** 16 rotanın hepsinde yatay taşma **0** — hem dev hem üretim build'inde ayrı ölçüldü.

**Preview URL:** `https://ihaleal-nfc5o4wkx-yagizo.vercel.app` — deployment `5768264279`,
durum `success`, commit status `Vercel: success`.
**Erişilemedi:** HTTP 302 → `vercel.com/sso-api` (Vercel SSO duvarı). Bu yüzden kanıtlar
soğuk klon üretim build'i üzerinden verildi.

**Görsel ekran görüntüsü: DOĞRULANAMADI** — bu oturumda tarayıcı paneli kare üretmediği
için ekran görüntüsü alınamadı. Doğrulama DOM/hesaplanmış stil ölçümü, Lighthouse ve curl
ile yapıldı.

### KAPI 3 — bu bölüm + `public/denetim.json` yeniden üretildi

`scripts/denetim-uret.mjs` referans zemini `#0B1120` → `#ffffff` olarak güncellendi ve
çalıştırıldı. Ek olarak çalışma zamanı ölçümü `public/tasarim-olcum.json` olarak üretildi.

> **Dikkat — iki farklı ölçek:** `denetim.json` **kaynak dosyalarda** sınıf sayar; koyu tema
> sınıfları (`bg-slate-900`, `text-white`) bilerek yerinde bırakıldığı için oradaki
> `koyuPanel` sayısı düşmez (104 → 106). `tasarim-olcum.json` ise **çalışma zamanında** ne
> çizildiğini ölçer ve 0'a iner. İkisini karıştırmayın.

## 8. Bu turun commit'leri

| SHA | Konu |
|---|---|
| `c03cf8f` | tasarim: acik & minimal tema tokenlari eklendi (tema.css) |
| `d2af003` | tasarim: koyu tema zorlayici katman acik uyum katmaniyla degistirildi |
| `ded0670` | tasarim: bilesen katmani ve Tailwind paleti tokena baglandi |
| `5ceb8bb` | tasarim: kritik CSS ve PWA renkleri acik temaya cevrildi |
| `e7d2339` | tasarim: sayfa ve bilesen duzeyinde kalan koyu degerler tokena cevrildi |
| `621e72d` | perf(tasarim): uyum katmani yalniz kullanilan utility'ler icin uretiliyor |
