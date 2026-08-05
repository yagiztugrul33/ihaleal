# SABAH ONAY KUYRUGU — gece renk donusumu (2026-08-05)

## Ö2 sadeleştirme sonrası eklenenler (2026-08-05 sabah)

1. ~~**Kök `typecheck` scripti no-op**~~ — **KAPANDI (2026-08-05, TS kapanışı turu).**
   30 hatanın tamamı kapatıldı (`37715c5`, `a69b734`, `337f58c`, `f68fb87`, `ca31db2`),
   ardından script `tsc --noEmit -p tsconfig.app.json`'a bağlandı (`263cc8d`). Kök
   `tsconfig.json` değiştirilmedi. Soğuk klonda `npm run typecheck` **exit 0**,
   `npm run build` **exit 0**. Ayrıntı: `DENETIM-KAYDI.md` → "Ö2 — TS KAPANIŞI".
2. **staging push edildi** (`git push -u origin staging` başarılı, 29 commit). Vercel build
   `state: success` (commit 563e812).
3. **Vercel Deployment Protection AÇIK — preview dışarıdan doğrulanamıyor.**
   `https://ihaleal-git-staging-yagizo.vercel.app/` → HTTP 200 ama gövde `<title>Login – Vercel</title>`
   (uygulama HTML'i değil, `id="root"` yok). Yapılacak: **Vercel → ihaleal → Settings → Deployment
   Protection → kapat** (veya bypass token üret). Kapatıldıktan sonra aynı URL curl ile doğrulanmalı.
   Not: production `https://ihaleal.vercel.app/` korumasız (HTTP 200, `id="root"` var) ama main dalını
   yansıtıyor, Ö2 değişikliklerini içermez.

## TS kapanışı turundan çıkanlar (2026-08-05, operatör kararı bekliyor)

1. **`BorsaTerminali`'de `compact` prop'unun asıl niyeti** — `CountdownTimer`'a iki yerde
   (satır ~283 ve ~469) `compact` geçiliyordu; bu prop `Props`'ta **yok** ve bileşen rest
   spread yapmadığı için çalışma zamanında **zaten yok sayılıyordu**. Görünümü değiştirmemek
   adına prop kaldırıldı. Bileşende `layout?: "compact" | "wide"` (varsayılan `"wide"`) var —
   yazarın niyeti büyük olasılıkla `layout="compact"`. **Bu bir görsel değişikliktir**,
   onay olmadan yapılmadı. Karar: olduğu gibi mi kalsın, `layout="compact"` mi olsun?
2. **`BorsaPage` izleyici sayacı semantiği** — `setWatchers((p) => Math.max(1, p + (item.dir === "up" ? 1 : 0)))`
   satırındaki `item`, `forEach` geri çağrısının parametresiydi ve blok dışında kapsam dışı
   kalıyordu → **çalışma zamanında `ReferenceError`** (fiyat her değiştiğinde). Aynı blokta
   hesaplanan `upCount` ile değiştirildi (`upCount > 0 ? 1 : 0`). Alternatif yorum: `p + upCount`
   (her yükselen ilan için 1 artış). Hangisinin ürün açısından doğru olduğu **teyit edilmeli**.
3. **`Auction.verified` alanını hiçbir veri kaynağı doldurmuyor** — `AuctionDetail.tsx:1238`
   `auction.verified === true` kontrolü yapıyor ve tipe opsiyonel `verified?: boolean` eklendi,
   ama `src/` altında hiçbir yer bu alanı bir ilan kaydına yazmıyor. Yani doğrulama rozeti
   **hiç görünmüyor** (ölü kod). Rozet gerçekten isteniyorsa alanın veri kaynağından gelmesi gerekir.
4. **`build:full` scripti hâlâ sahte yeşil** — `"build:full": "tsc --noEmit && vite build"`
   aynı no-op kök projeyi kullanıyor. Görev kapsamı yalnızca `typecheck` satırıydı, dokunulmadı.
   Aynı düzeltme (`-p tsconfig.app.json`) burada da uygulanmalı mı?
5. **`tsconfig.node.json` hiç denetlenmiyor** — `scripts/*.mjs` ve vite config tarafı yeni
   `typecheck` scriptinin dışında. İstenirse ikinci bir `typecheck:node` scripti eklenebilir.

## Operator onayi bekleyenler

1. **staging push operatör onayı bekliyor** (bundle: `yedekler/ihaleal-staging-gece.bundle`)
   - 16 yeni "renk:" commit'i (origin/main'in 17 commit ilerisinde, `git log --oneline origin/main..staging`).
   - Bundle dogrulandi: `git bundle verify` → "complete history".
   - Push icin: `git push origin staging` (operatör).
2. **iOS/Android build tetiklenmedi — imzalama sırları yok.** Mobil (Capacitor) taraf icin
   keystore / provisioning profili bu makinede bulunmuyor; sadece web build + typecheck kosuldu.

## Gece yapilanlar (ozet)

- Ikincil sayfalar tema tokenlarina gecti (sayfa basina commit): Mortgage, Mesajlar, Profil,
  Bildirimler, InvestorDashboard, UserPanel-dashboard, Favoriler, Aramalarim, Belgelerim,
  Raporlar, AramaSonuclari, Auth (Login/Register/EDevlet), BuyNow.
  Ayarlar ve Admin (AdminDashboard) zaten 0/0 idi — degisiklik gerekmedi.
- `--gradient-scrim` tokeni tokens.css'e eklendi (gorsel scrim'lerin merkezi karsiligi).
- E-posta sablonlari (src/emails/*.html + supabase/functions/report-notifier) lux paletine
  hex-eslemesiyle esitlendi (#0a0f1e→#0B1120, #64748b→#94A3B8, #06B6D4→#38BDF8,
  CTA gradyani → gradient-cta literal duraklari). gen-assets.mjs splash bg → #0B1120.
  gen-luxury-theme.mjs DOKUNULMADI (token tanimlarinin kaynak ureticisi).
- Final gradyan supurmesi: 239 → 160 (51 dosyada tekrarlanan mavi/cyan CTA, scrim ve
  %5 panel tintleri tokene gecti).
- Dogrulama: `npm run typecheck` 0 hata, `npm run build` OK, `precheck:encoding` OK (713 dosya).

## Kalan is kuyrugu (dokunulmadi — karar/onay gerekli)

- **Kalan 160 gradyan** (gorsel-kritik / token karsiligi yok):
  - `src/styles/premium-cinematic-home.css` (27) + cinematic bilesenler (CinematicPropertyGallery,
    AIInsightLayer, WaveBackground, HomeTarget, PlatformModulesShowcase) — ana sayfa sinematik
    tasarim dili, gorsel-kritik.
  - Emerald/amber "durum" CTA'lari (basari/premium anlami tasiyor; yesil/amber gradyan tokeni yok —
    token eklemek tasarim karari): NasilCalisir, CreateAuction, SellerHub, PricingPage vb.
  - `src/index.css` (4) ve `src/borsa/borsa.css` (3) — tanim/fallback katmani.
  - AuctionDetail.tsx (6), ChatWidget.tsx (7), About/AdCampaign/Analytics vb. dekoratif tintler.
- **Hardcoded renk (A) uzun kuyrugu** (ikincil liste disinda kaldi): Analytics.tsx (A=53),
  GesAnalysisPage (23), Compare (19), MapPage (16), CityGuide (15), AuctionDetail (15),
  KomsulukRiskCharts (14), BorsaDataAnalysisPage (13), ParcelIntelligencePage (11),
  DepremRiskHaritasiMapInner (11) ve afet/borsa/modul sayfalari — cogu harita/chart
  kutuphanesi renkleri; sayfa sayfa ele alinmali.
- NotificationsPage/Reports/panel tintlerinde %5-10 renk tonu duzlestirildi (bg-slate-900/xx);
  tasarim gozden gecirebilir.

---

## Perf turu kuyrugu — 90 hedefine kalan yol (2026-08-05, ref `e9a95b4`, Perf **76**)

Bu turda 70 → **76** cikildi (yerel Lighthouse mobil, 9 tur medyan, aralik 75-77).
90'a **ulasilmadi**. Asagidakiler ölçüldü ama bu turda YAPILMADI — karar/onay gerekiyor.

**Kalibrasyon (bu turda olculdu):** kritik yoldan **~13 KB gzip ≈ 1 Lighthouse puani**
(`vendor-supabase` 53 KB -> +4 puan datasindan). 90 icin kritik yoldan kabaca **~180 KB gzip
daha** cikmali. Kritik yolda su an: giris chunk'i 145 KB + `vendor-react` 74.5 KB +
`vendor-motion` 41.3 KB + `vendor-ui` 20 KB + `vendor-utils` 9 KB + uygulama CSS'i 47 KB
+ fontlar 183 KB.

### 1. Fontlari SELF-HOST et (tahmini en buyuk tek kazanc) — ONAY GEREKIYOR

Kontrol olcumu: font stylesheet'i tamamen cikarilinca **Perf 74 -> 80** (FCP 4214 -> 3070 ms).
Bu turda `media="print"` deseniyle bunun bir kismi alindi (74 -> 75), tamami alinamadi
cunku fontlar hala capraz kaynaktan (fonts.gstatic.com) 183 KB olarak iniyor.

Self-host etmek: (a) DNS + TCP + TLS el sikismasini (~3 RTT) tamamen kaldirir,
(b) yalnizca gereken alt kumeler (latin + latin-ext) ve gereken agirliklar servis edilir.

**Neden yapilmadi:** woff2 dosyalarini indirmek gerekiyor; talimat geregi dosya indirmek
icin acik onay sart. Inter ve Plus Jakarta Sans OFL lisansli, Google Fonts'tan alinabilir.
**Karar gereken:** indirme onayi + hangi agirliklarin korunacagi (su an Inter 400/500/600/700,
Plus Jakarta Sans 500/600/700/800 = 8 agirlik; kirpilirsa gorsel karar).

### 2. `src/i18n/messages.ts` — 268 KB, 4 dilin TAMAMI eager (en buyuk tekil kalem)

Kritik yoldaki eager modul grafigi 93 dosya / 719 KB kaynak; bunun **%37'si tek basina bu dosya.**
Yapisi: `messages.en` (~1070 satir) + `messages.tr` (~1085) + `_ruOverrides` (~960) +
`_arOverrides` (~970). Ziyaretci ayni anda **tek** dil kullaniyor.

Onerilen adim (dusuk riskli parca): `_ruOverrides` ve `_arOverrides` (~1930 satir, ~110 KB kaynak)
ayri modullere alinip yalnizca dil RU/AR secildiginde dinamik yuklensin. TR/EN senkron kalir.

**Karar gereken:** `getMessagesFor()` bugun SENKRON ve `t` her yerde senkron tuketiliyor.
RU/AR icin kisa bir "once TR, sonra cevrilmis" gecisi olusur. Bu UX takasi onaylanmali.

### 3. `vendor-motion` (framer-motion) — 41.3 KB gzip, **%73'u kullanilmiyor**

Kritik yola cekenler: `src/components/motion/MotionReveal.tsx` ve
`src/components/motion/PageTransition.tsx` (Layout `<Outlet>` sarmalayicisi), ayrica
Hero / PlatformModulesShowcase / cinematic bilesenler. (`src/lib/motion/presets.ts` yalnizca
`import type` kullaniyor — o zincir olusturmuyor.)

Onerilen yol: framer-motion'in resmi `LazyMotion` + `m` deseni — `motion.*` yerine `m.*`,
ozellik paketi dinamik yuklenir. Gorsel sonuc birebir korunur, animasyonlar ozellikler
inince baslar.

**Karar gereken:** ~9 dosyada `motion.*` -> `m.*` degisikligi ve saglayici eklenmesi;
"dokunulmaz cekirdek" kapsaminda mi? Tahmini kazanc +2/+3 puan, ONCE OLCULMELI.

### 4. Uygulama CSS'i 47 KB — tek kalan render-blocking kaynak

Bu turdan sonra `render-blocking-insight` listesinde **yalnizca** `assets/index-*.css` kaldi
(tahmini 300 ms; tur basinda liste 1.460 ms idi). Kaynakta en buyuk pay
`src/styles/premium-cinematic-home.css` **45 KB** — ana sayfa sinematik tasarim dili.

Secenekler: (a) ilk ekran (kritik) CSS'i ayirip gerisini ertelemek, (b) sinematik CSS'i
yalnizca ana sayfada yuklemek (diger rotalar zaten kullanmiyor).
**Karar gereken:** (b) sikligi yuksek ve gorsel riski dusuk gorunuyor ama ana sayfa LCP'sini
etkiler — mutlaka olculmeli.

### 5. Olculdu, FAYDA VERMEDI — tekrar denenecekse baslangic notu

- `Layout.tsx`'te ChatWidget/GeofenceWatcher/CookieConsent `React.lazy`: **Perf 75 -> 72.**
  FCP iyilesti ama LCP kotulesti (4433 -> 4758 ms) — uc tembel chunk kritik pencerede istendigi
  icin LCP ile yaristi. Tekrar denenecekse chunk'lar **ilk boyamadan sonraya** ertelenmeli
  (ornegin `requestIdleCallback`), sadece `lazy` yetmiyor.
- `Navbar.tsx`'te SearchModal `React.lazy`: giris chunk'i yalnizca **2.4 KB** kuculdu
  (147 173 -> 144 805 bayt gzip), skor sonucsuz. Veri bagimliliklari baska eager modullerle
  paylasildigi icin kazanc yok.

### 6. Olcum altyapisi notu (sonraki tur zaman kazansin)

- **PSI bu depo icin su an kullanilamaz**: preview'lar Vercel SSO arkasinda (302),
  `www.ihaleal.com` ise 2026-06-03 tarihli Production build'i servis ediyor. Staging'i PSI ile
  olcmek icin ya SSO korumasi kaldirilmali ya da staging bir public domaine deploy edilmeli.
  **Karar gereken:** hangisi?
- Yerel Lighthouse `vite preview` uzerinde **calismiyor**: preview'in gonderdigi
  `Cross-Origin-Opener-Policy: same-origin` basligi her turda `NO_NAVSTART` uretiyor.
  Olcum icin COOP'suz + gzip'li minimal statik sunucu kullanildi.
- Chrome kurulu degil; `CHROME_PATH` ile Edge kullanildi. chrome-launcher Windows'ta gecici
  profili silemeyip `EPERM` atiyor ve zombi `msedge` surecleri sonraki turlari bozuyor —
  her turdan once `taskkill` gerekli.
