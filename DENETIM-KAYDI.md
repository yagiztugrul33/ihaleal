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
