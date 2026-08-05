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
