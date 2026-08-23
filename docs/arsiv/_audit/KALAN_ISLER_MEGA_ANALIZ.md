# KALAN İŞLER MEGA ANALİZ — Dalga 3, 5, 6 + Mobil App

**Tarih:** 2026-05-31
**Hazırlayan:** Claude · **Yöntem:** Playwright lokal preview gezinti + package.json bağımlılık denetimi + grep altyapı taraması + sub-agent ile WebFetch/WebSearch güncel teknoloji araştırması (2026 Q2 kaynaklarla).
**Tarih: 2026-05-31** · **Salt-okuma:** kod/migration değişikliği yapılmadı, sadece rapor.
**Master'ın talebi:** "Tek mega komutla kalanı analiz et — Dalga 3+5+6 + Mobil App + öncelik plan."

---

## 0) YÖNTEM TEYİDİ

| Aşama | Araç | Çıktı |
|---|---|---|
| 6 kritik rota gezme (Dalga 3+5) | Playwright headless 1366×900 | `scripts/_mega-traverse.json` (her sayfa için 20+ sinyal: bodyLen, h1/h2, hasLeaflet, hasMarkers, hasPolygonDraw, hasPdf, hasSubscribe, hasUSDEUR) |
| Altyapı kontrolü | `package.json` + grep src/ | Hangi kütüphane mevcut, neredeyse hangi component'lerde kullanılıyor |
| Mobil teknoloji + push + i18n + blog + 360° araştırması | Sub-agent (general-purpose) + 25+ WebFetch/WebSearch | 2026 Q2 güncel ekosistem fotoğrafı |
| Sentez + öncelik + zaman planı | Manuel | Bu rapor |

**Hiçbir kod/migration/RLS değişikliği yapılmadı.** Uygulama Master onayından sonra dalga dalga.

---

## 1) DALGA 3 — HARİTA + BÖLGE DERİNLİK

### 1.1 `/harita` — KRİTİK BULGU: Altyapı var, sayfa kullanmıyor

**Mevcut durum (Playwright):**
- `bodyLen=3411`, `mainLen=1708`, `h1=1`, `iframes=1`, `hasLeaflet=false`, `hasMarkers=0`, `hasCluster=false`, `hasPolygonDraw=false`
- MapPage.tsx 174 satır — **Leaflet hiç import etmiyor**, sadece liste/kart gösterimi yapıyor

**Package.json'da MEVCUT (sürpriz):**
```json
"leaflet": "^1.9.4",
"react-leaflet": "^5.0.0",
"@types/leaflet": "^1.9.21"
```

**Halihazırda Leaflet kullanan 5 component:**
- `src/components/intelligence/IntelligenceMap.tsx`
- `src/components/maps/AuctionsMap.tsx`
- `src/components/maps/CityDistrictHeatmap.tsx`
- `src/components/maps/ListingMapViews.tsx`
- `src/components/maps/SimilarListingsMap.tsx`

→ **Dalga 3 /harita aslında "yeniden yapım" değil, "var olan komponenti reuse" işidir.**

**Eksik (Master raporu §3.6):**
- Cluster (Leaflet.markercluster paketi: **YOK, eklenmeli**)
- Poligon çizim aracı (Leaflet.draw paketi: **YOK, eklenmeli**)
- Sol filtre overlay + sağ sonuç paneli senkronize (UI iş, mevcut altyapıyla yapılır)
- Pop-up mini ilan kartı (mevcut ListingDocumentFooter/ListingCoverImage reuse)

**Bağımlılık + zorluk:**
- Yeni npm paket: `leaflet.markercluster` (40KB), `leaflet-draw` (35KB), `@types/leaflet-draw`
- Migration: **YOK**
- Backend: **YOK**
- TCMB: **HAYIR** (sadece harita UI)

**Tahmini efor:** **3-4 kişi-gün**
- 1.5 gün: MapPage.tsx Leaflet entegrasyon + cluster + popup
- 1 gün: Poligon çizim + bbox filtre
- 1 gün: Sol filtre overlay + URL state + sağ sonuç senkron

### 1.2 `/borsa/sehir/:il` — Zayıf, derinleştirme şart

**Mevcut (Playwright `/borsa/sehir/istanbul`):**
- `bodyLen=2123`, `mainLen=420` (oldukça boş, sayfa içeriği çok az)
- Sayfa var ama derinlik yok: muhtemelen şehir adı + bir-iki istatistik

**Master raporu §3.12 önerisi:**
- Şehir tıkla → `/borsa/sehir/:il` drilldown (var ama içerik zayıf)
- Endeks bileşenleri açıklama "İhaleal Endeksi nasıl hesaplanır?"
- PDF aylık endeks raporu (jspdf Roboto font hazır — Fix 4)

**Eksik:**
- Şehir bazlı istatistik kartları (avg ₺/m², trend, talep endeksi)
- Şehir içindeki en yüksek/düşük ilçeler (tablo/grafik)
- Şehir ilanları grid (mevcut Auctions section reuse)
- Endeks açıklama collapsable accordion

**Bağımlılık:**
- TCMB EVDS gerçek veri: **ŞART DEĞİL** (mevcut `areaStats` yapay veriden başlanabilir; TCMB gerçek veri Dalga 3 sonrası/Faz 3'te eklenir)
- Migration: **YOK**
- Backend: **YOK**

**Tahmini efor:** **2-3 kişi-gün**

### 1.3 `/raporlar` — Aylık endeks PDF

**Mevcut (Playwright):**
- `bodyLen=2402`, `mainLen=699` (çok az içerik), `h1=1`, `h2=3`, `hasPdf=true` (metinde "PDF" geçiyor ama gerçek PDF butonu yok), `hasSubscribe=true` (metinde "abone" geçiyor)

**Master raporu §3.7 önerisi:**
- Aylık "İhale Endeksi" raporu PDF — Roboto Türkçe font (mevcut, Fix 4)
- Yatay scroll'lu en yeni 3 rapor + filtre (şehir/kategori/tarih)
- "Aylık rapor abone ol" e-posta opt-in

**Eksik:**
- Gerçek bölge rapor verisi (placeholder olduğu açık)
- PDF üretici fonksiyonu (mevcut `downloadStructuredPdf` reuse)
- E-posta opt-in form (Supabase tablo `report_subscribers` gerekebilir — **Master'a SOR**)

**Bağımlılık:**
- Migration: **OLABİLİR** (`report_subscribers` tablosu — sadece email + frequency; Master onayı şart)
- Backend: e-posta gönderim için Edge function + SMTP/SendGrid (faz 2)
- TCMB: ŞART DEĞİL

**Tahmini efor:** **3-4 kişi-gün** (e-posta send altyapısı hariç)

### 1.4 Dalga 3 toplam

| Madde | Efor | Migration | TCMB bağımlı | Master onay |
|---|:-:|:-:|:-:|:-:|
| /harita Leaflet + cluster + poligon | 3-4 gün | YOK | HAYIR | YOK |
| /borsa/sehir derinleştirme | 2-3 gün | YOK | HAYIR (faz 2) | YOK |
| /raporlar aylık endeks PDF | 3-4 gün | "Belki" — e-posta opt-in için | HAYIR | E-posta opt-in tablo onayı |
| **DALGA 3 TOPLAM** | **8-11 gün** | **1 küçük opsiyonel** | **— hiç biri** | **1 madde** |

**TCMB EVDS notu:** Master daha önceki turlarda API anahtarı (`kpeucVovjh`, 10 char, 302 redirect) sorunluydu. Dalga 3 **TCMB'ye bağımlı değil** — mevcut `areaStats` (Auction tipinde) gibi statik veriyle çalışılabilir. Gerçek TCMB entegrasyonu **Faz 3** (lansman sonrası) işidir, Dalga 3'ü engellemez.

---

## 2) DALGA 5 — MARKETING + İÇERİK

### 2.1 `/blog` — Altyapı yok, 8-12 SEO post için

**Mevcut (Playwright):**
- `bodyLen=3006`, `mainLen=1303`, `h1=1`, `h2=0`, `hasBlogPosts=0` (article tag yok), `hasSubscribe=true`
- Sayfa BoŞ — blog post listesi yok

**Seçenek analizi (agent araştırması):**

| Yaklaşım | Pros | Cons | Karar |
|---|---|---|---|
| **A) Lokal markdown + `vite-react-ssg`** | Repo'da .md, build-time HTML, mevcut Vite'a dokunma, SEO mükemmel | Editör non-tech için git zahmeti | **MVP'ye uygun** |
| B) Astro alt-domain (blog.ihaleal.com) | En iyi Core Web Vitals, type-safe Content Collections | Ayrı codebase + deploy + tema duplikasyonu | Sonraki faz |
| C) Supabase CMS-lite | Dinamik içerik, admin UI küçük | SEO için pre-render gerekir, karmaşıklık | Hayır (12 post için orantısız) |
| D) Ghost/Sanity/Strapi headless | Profesyonel editör | $9-$30/ay, overkill | Hayır |

**Önerilen mimari (A):**
```
/content/blog/*.md  (frontmatter: title, slug, date, lang, ogImage)
/src/blog/          (loader + list/detail components)
build hook → vite-react-ssg her .md için /blog/<slug>/index.html üret
sitemap.xml otomatik genişlet
```

**OG image:** build-time `@vercel/og` veya `satori` ile başlık+brand'den otomatik PNG (mevcut OG altyapı reuse — Polish 2-3'te eklendi).

**Tahmini efor:**
- Teknik (`vite-react-ssg` + markdown loader + frontmatter + sitemap + RSS + OG generator): **5 kişi-gün**
- İçerik üretimi (12 post TR, ortalama 800-1200 kelime, SEO-friendly): **~10-15 gün copywriter (paralel)**

**Bağımlılık:** Migration/RLS YOK · Backend YOK.

### 2.2 `/kampanyalar` — Gerçek kampanya içeriği

**Mevcut (Playwright):**
- `bodyLen=2852`, `mainLen=1148`, `h1=1`, `h2=1`, `sections=3`, `hasCoupon=false` (kupon/indirim kelimesi metinde geçmiyor)
- Yapı var (3 section) ama içerik dummy gibi

**Eksik:**
- Aktif kampanyalar grid: kapora indirimi, komisyon iadesi, ilk ihale bedava, yeni üye hediyesi vb.
- Her kart: görsel, başlık, açıklama, geçerlilik tarihi, kullan kuponu, kopyala
- Geri sayım (kampanya bitiş — Dalga 2'de eklenen CountdownTimer reuse)
- E-posta opt-in: "Yeni kampanyalardan haberdar ol"

**Bağımlılık:**
- Migration: **OLABİLİR** — `campaigns` tablosu (id, name, code, description, valid_until, image_url, active_bool) — Master'a SOR
- Backend: kupon doğrulama Edge function (faz 2)

**Tahmini efor:** **3-4 kişi-gün** (kupon doğrulama hariç)

### 2.3 `/uluslararasi` (EN açma)

**Mevcut (Playwright):**
- `bodyLen=3337`, `mainLen=1633`, `h1=1`, `h2=5`, `sections=5`, `hasENSwitch=true` (navbar "EN" var), `hasUSDEUR=true` ("USD/EUR" metinde geçiyor), `hasVizeRezidence=false`

**Mevcut altyapı (package.json — sürpriz):**
```json
"i18next": "^24.2.0",
"react-i18next": "^15.4.0"
```
→ **react-i18next YÜKLÜ ama kullanılmıyor!** Mevcut sistem typed `messages.ts` (custom pattern) kullanıyor — bu fark **mixed model riski**.

**Önceki rapor verisi:**
- Hardcoded TR string oranı **~%97** (352 .tsx dosyasından sadece 10'u `useLocale` kullanıyor)
- TR-default + EN switch UI'da var ama EN coverage çok zayıf

**Master raporu §3.13 önerisi:**
- EN tam çalışsın (uluslararası niş)
- USD/EUR para birimi
- Vize/rezidence rehberi (foreign buyer için)

**Strateji (agent araştırması):**

| Soru | Karar |
|---|---|
| Kütüphane? | **react-i18next** (zaten yüklü, endüstri standardı) |
| URL stratejisi? | **/en/* prefix** + `<html lang>` dinamik + `<link rel="alternate" hreflang="...">` |
| Mevcut typed messages.ts? | Adapter ile react-i18next'e köprüle — yatırım koru |
| SEO? | SPA için **prerender şart** (vite-react-ssg ile blog kurulumu sırasında ortak) |
| Çeviri kalitesi? | Hukuki/finansal terimler için **profesyonel çeviri** (auction jargon sektörel) |

**Audit + refactor adımları:**
1. Codebase'de TR string regex tarama (~800-1500 unique string tahmin)
2. i18next-parser ile otomatik extraction → `tr.json` / `en.json`
3. JSX'te `t('key')` ile bulk replace (codemod)
4. EN profesyonel çeviri (paralel)
5. Routing `/en/*` + hreflang
6. Test (her sayfa TR/EN smoke)

**Tahmini efor:** **10-14 kişi-gün** + paralel ~3-5 gün profesyonel çeviri.

**Bağımlılık:** Migration YOK · Backend YOK · Blog'un `vite-react-ssg` kurulumu ile **birlikte kurulursa maliyet -%30** (ortak prerender katmanı).

### 2.4 Dalga 5 toplam

| Madde | Efor | Migration | Çeviri | Master onay |
|---|:-:|:-:|:-:|:-:|
| /blog SSG + markdown | 5 gün + 10-15 copy paralel | YOK | — | Sonraki turda blog tipo onayı |
| /kampanyalar gerçek içerik | 3-4 gün | OLABİLİR (`campaigns`) | YOK | Tablo onayı |
| /uluslararasi EN i18n | 10-14 gün | YOK | 3-5 gün paralel | Çeviri editör/yayın onayı |
| **DALGA 5 TOPLAM** | **~18-23 gün** | **1 küçük** | **var** | **2 madde** |

---

## 3) DALGA 6 — SEKTÖR PARİTY

### 3.1 360° foto / sanal tur

**Mevcut altyapı:** YOK (kütüphane yok, player yok, storage planı yok).

**Seçenek analizi (agent araştırması):**

| Kütüphane | Bundle | React entegrasyon | VR | İhaleal için |
|---|---|---|---|---|
| **react-photo-sphere-viewer** | 500KB+ (Three.js içeriyor) | Resmi React wrapper | Var | **Önerilen** — marker/hotspot ekosistemi en güçlü (ilanda alan etiketleme için kritik) |
| Pannellum + pannellum-react | 21KB gzip | Community wrapper | Yok | Hafif ama marker zayıf |
| Marzipano | ~90KB | Standart JS, wrapper yok | Var | Multi-resolution, daha kaliteli |
| A-Frame | 1MB+ | React entegrasyon zor | Var | Overkill |

**Sanal tur (multi-room ev gezisi):**
- **Kuula iframe embed**: $0 başlangıç, Insta360/Theta kamerayla uyumlu, kullanıcı dostu → **MVP için bu**
- Matterport: $12/ay + pahalı kamera donanımı → faz 2 premium portföy
- Self-hosted Marzipano tour generator: tam kontrol, faz 2

**Storage:**
- Supabase Free: 50MB/dosya, 1GB toplam
- Supabase Pro: 5GB/dosya, multi-MB tile sorunsuz
- Tipik 360 ekvirektangüler foto 5-15 MB (4K-8K) → Free tier yeterli MVP

**Tahmini efor:**
- `react-photo-sphere-viewer` entegrasyon + lazy load + hotspot: **2 gün**
- Yükleme UI + Supabase Storage upload (ilan oluşturma form integration): **2 gün**
- Kuula embed alanı (URL yapıştır + iframe whitelist CSP): **0.5 gün**
- **Toplam ~4-5 kişi-gün**

**Bağımlılık:** Migration YOK · Backend YOK · CSP `frame-src` Kuula domain eklenmeli.

### 3.2 Push bildirim (notifications → mobile push)

**Mevcut:**
- `notifications` tablosu var (in-app feed) ✓
- `push_tokens` / `device_tokens` tablosu: **YOK**
- FCM/APNs entegrasyonu: **YOK**

**Mimari:**

```
Trigger (DB değişikliği / Edge Function)
  → device_tokens lookup (user_id → token + platform)
  → FCM HTTP v1 API (Android + iOS APNs Firebase üzerinden)
  → cihaza push
```

**Aksiyon kalemleri:**

1. **DB**: `device_tokens (id, user_id, token, platform, last_seen_at, created_at)` + RLS — **Master'a SOR**
2. **Client (Capacitor)**: `@capacitor/push-notifications` plugin → token alındığında upsert
3. **Edge Function** `notifications-push`: notifications tablosu webhook → token lookup → FCM HTTP v1 (Deno fetch + Google OAuth2 service account)
4. **APNs konfig**: Firebase Console > Project Settings > Cloud Messaging > APNs Auth Key (.p8, Apple Developer'dan)
5. **Capability**: iOS `Push Notifications` + `Background Modes > Remote notifications`

**FCM direct vs OneSignal (2026):**
- **FCM**: bedava sınırsız (önerilen MVP) · segmentation/A-B test yok
- **OneSignal**: 10K abone sonra $19/ay · hazır segmentation + dashboard
- **Karar**: MVP **FCM direct + Supabase Edge Function**. Scale gelince OneSignal'a göç maliyeti düşük (token'lar zaten tabloda).

**Tahmini efor:**
- DB tablo + RLS: 0.5 gün (Master onayı sonrası)
- Edge function (FCM HTTP v1 + OAuth2): 1.5 gün
- Client integration (Capacitor plugin + upsert): 1 gün
- Apple Developer + Firebase konfig + sertifika: 0.5-1 gün
- **Toplam ~4 kişi-gün**

**Bağımlılık:** Migration **ŞART** (`device_tokens` + RLS) · Apple Developer hesabı $99/yıl · Firebase proje.

### 3.3 Sosyal paylaşım

**Mevcut:** OG meta tags var (Polish 1-2'de iyileştirildi), OG image per-route altyapı (Paket 2-3).

**Eksik:**
- Instagram Story paylaşım (mobile native — Capacitor app yapıldığında çözülür)
- "Aç ve paylaş" buton ilan detayında (Web Share API zaten mevcut tarayıcılarda)
- WhatsApp paylaşım deep link

**Tahmini efor:** **0.5-1 kişi-gün** (Web Share API + WhatsApp deep link)

### 3.4 "Benim İçin Teklif Ver" — Danışman eşleştirme

**Mevcut:** Yok (emlakçı/danışman directory `/emlakciler` var ama "delege teklif" akışı yok).

**Konsept:**
- Kullanıcı kriter girer (semt + bütçe + getiri eşiği)
- Lisanslı broker eşleştirilir (filtre veya manuel atama)
- Broker user adına teklif yönetir (sealed maskeleme korunarak)
- Komisyon paylaşımı (broker pay)

**Bağımlılık:**
- Migration: **ŞART** (broker_assignments, broker_bids tabloları, RLS)
- Yasal: emlakçı yetkilendirme sözleşmesi (signatures altyapısı mevcut, kullanılabilir)

**Tahmini efor:** **8-10 kişi-gün** (UI + backend + sözleşme akışı)

**Karar:** **Faz 2** (lansman sonrası, MVP+1). Karmaşık iş akışı, MVP için kritik değil.

### 3.5 Dalga 6 toplam

| Madde | Efor | Migration | Master onay |
|---|:-:|:-:|:-:|
| 360° foto + Kuula sanal tur | 4-5 gün | YOK | YOK |
| Push (device_tokens + FCM) | 4 gün | ŞART | EVET |
| Sosyal paylaşım (Web Share + WhatsApp) | 0.5-1 gün | YOK | YOK |
| "Benim İçin Teklif Ver" (Faz 2) | 8-10 gün | ŞART | EVET |
| **DALGA 6 MVP TOPLAM** | **~8-10 gün** | **1 (device_tokens)** | **1 (push tablo)** |
| **DALGA 6 + Broker eşleştirme** | **~18-20 gün** | **2** | **2** |

---

## 4) MOBİL APP — Detaylı Analiz ve 1-Haftalık Plan

### 4.1 Teknoloji kıyası ve karar

| Kriter | **Capacitor 7** | RN + Expo | Flutter |
|---|---|---|---|
| Web kod yeniden kullanım | %90+ (WebView wrapper) | %30-50 (UI baştan) | %0 (Dart sıfırdan) |
| 1 hafta MVP gerçekçi mi | **EVET** | Kısmen | Hayır |
| Supabase JS SDK uyumu | Tam — PKCE flow + Cap-go plugin | Tam | supabase_flutter |
| Geliştirici ihtiyacı | Web devs yeterli | Mobile dev şart | Dart developer |
| Apple/Google onay (2026) | Apple 24-72h tipik · Play aynı gün | Aynı | Aynı |
| Bundle/performans | İyi (WebView, %95 kullanıcı için yeterli) | Çok iyi | Mükemmel |
| Push plugin | `@capacitor/push-notifications` | `expo-notifications` | `firebase_messaging` |
| Risk | Ionic 2025 sonu yavaşladı; **Cap-go fork aktif (Cap-go/capacitor-supabase)** | Düşük | Düşük |

**KARAR: Capacitor 7**

**Gerekçe:** ihaleal'in tüm iş mantığı zaten React+TS+Supabase JS. Capacitor WebView wrapper olduğu için aynı kod hem PWA hem iOS/Android. 1 haftalık MVP somut. Ana risk OAuth deep link (Google/Apple sign-in) — `Cap-go/capacitor-supabase` plugin'i bilinen tuzakları çözüyor. Maintenance sinyali zayıflasa da Cap-go fork canlı, **en az 12-18 ay rahat kullanılır**.

### 4.2 Supabase mobil uyum

| Bileşen | Mobil davranış | Aksiyon |
|---|---|---|
| Auth (email/password) | Aynen çalışır, **PKCE flow zorunlu** | `createClient({ auth: { flowType: 'pkce' } })` |
| OAuth (Google/Apple) | WebView içinde başlatınca deep link döner; `code_verifier` localStorage'da kaybolabilir | **Cap-go/capacitor-supabase plugin** + Universal Link / Custom URL Scheme (`com.ihaleal.app://callback`) |
| Refresh token | SDK otomatik yönetir | `@capacitor/preferences` veya `capacitor-secure-storage-plugin` ile KeyChain/Keystore |
| Realtime (WebSocket) | Sorunsuz | App resume'da yeniden subscribe |
| RLS | `auth.uid()` değişmez | DEĞİŞİKLİK YOK |
| CORS | Mobile WebView origin `capacitor://localhost` veya `https://localhost` | Supabase Auth allow-list'e `com.ihaleal.app://**` ekle |
| Eski anon/service_role keys | 2026 sonuna kadar çalışır | Soft lansman sonrası migration |

**Tahmini ek efor:** **2-3 kişi-gün** (Auth flow + deep link + secure storage konfig)

### 4.3 Ekran haritası (mobil ana ekranlar)

| # | Ekran | Web karşılığı | Mobile özel | Öncelik |
|:-:|---|---|---|:-:|
| 1 | Giriş ekranı | /giris | iOS Sign in with Apple, Google Sign-In native | P0 |
| 2 | Anasayfa (hub) | / | Bottom tab navigation, push bildirim badge | P0 |
| 3 | İhale arama | /arama | Sticky filter sheet, harita toggle | P0 |
| 4 | İlan detay | /ilan/:id | Galeri swipe, geri sayım canlı, "Teklif Ver" bottom CTA | P0 |
| 5 | Teklif verme | bid dialog | Native bottom sheet, gizli onay slider | P0 |
| 6 | Profil | /profil | Avatar foto galerisinden, biyometrik kilit (FaceID/TouchID) | P1 |
| 7 | Bildirimler | /bildirimler | Native push'tan deep link | P0 |
| 8 | Aramalarım | /aramalarim | Pull-to-refresh, sil swipe-action | P1 |
| 9 | Panel/Dashboard | /panel | Tab içeriği swipe geçiş | P1 |
| 10 | Favoriler | /favoriler | Long-press grid actions | P1 |

**P0 (MVP):** 1, 2, 3, 4, 5, 7 → 6 ekran
**P1 (MVP+):** 6, 8, 9, 10 → 4 ekran

### 4.4 Push mimari (özet)

**Bkz. §3.2.** Mobil app ile aynı plan; tek değişiklik client tarafı:
- iOS: `@capacitor/push-notifications` plugin + APNs registration
- Android: `@capacitor/push-notifications` plugin + FCM
- Token alındığında `device_tokens` tablosuna upsert (user_id + platform + token)

### 4.5 PWA köprüsü — Capacitor öncesi geçici çözüm?

**Mevcut durum:** `public/sw-unregister.js` Service Worker temizlik modunda → fiilen PWA değil.

**PWA Push 2026 Q2 gerçekleri:**
- iOS 16.4+ PWA push çalışır AMA **sadece "Add to Home Screen" sonrası**
- iOS conversion düşük (kullanıcı app store araması daha hâkim)
- Android PWA push tam çalışır
- App Store görünürlük kaybı: Türkiye pazarında ciddi pazarlama dezavantajı

**Karar:** **PWA'yı aç ama tek başına yetmez.** Capacitor app paralel yürüt; PWA tarayıcı + masaüstü deneyimi için kalır.

**PWA efor:** **3 kişi-gün** (sw-unregister kaldır + vite-plugin-pwa + workbox + Web Push API + VAPID + tablo)

### 4.6 1-haftalık gün-gün yol haritası (Capacitor MVP)

**Varsayım:** 1 senior web dev tam-zamanlı, backend zaten hazır (Dalga 1-4 tamam, sealed maskeleme aktif).

| Gün | İş | Çıktı |
|:-:|---|---|
| **1** (Pzt) | Capacitor 7 kurulum + iOS/Android shell, build pipeline | `npx cap init` + `cap add ios` + `cap add android` çalışıyor, dev mode app açılıyor |
| **2** (Sal) | Supabase PKCE flow + deep link + Cap-go plugin entegrasyonu + secure storage | Auth flow (email + Google) çalışıyor, token KeyChain'de |
| **3** (Çar) | Bottom tab nav + 6 P0 ekran adaptasyonu (responsive web zaten var) | Anasayfa + Arama + İlan detay + Teklif + Profil + Bildirim ekranları açılıyor |
| **4** (Per) | Push: `@capacitor/push-notifications` + `device_tokens` upsert + Edge function `notifications-push` (FCM HTTP v1) | Test push cihaza ulaşıyor (Android'de + iOS'ta APNs sandbox) |
| **5** (Cum) | Native UX iyileştirme: galeri swipe, geri sayım canlı (mevcut CountdownTimer reuse), sticky filtre sheet, native back gesture | UX polish |
| **6-7** (Cmt-Paz) | Store assets (icon, screenshot, açıklama TR/EN), TestFlight + Play Store internal track yüklemesi, beta tester davet | Store submission hazır |

**Hafta sonu sonu:** TestFlight + Play Store internal track'te uygulama; gerçek cihazda canlı kullanım; geri bildirimle hafta 2'de polish + public submission.

**Ek 5 gün** (P1 ekranlar + store onay süresi + ilk submission iterasyonu): hafta 2-3.

### 4.7 Gereksinimler ve maliyet

| Kalem | Maliyet | Kim alır |
|---|---|---|
| Apple Developer Program | **$99/yıl** | Master / İhaleal LTD |
| Google Play Console (one-time) | **$25** | Master / İhaleal LTD |
| APNs Auth Key (.p8) | Bedava (Apple Developer içinde) | Apple Developer hesabından üret |
| Firebase Project | Bedava (Spark plan) | Master Google hesap |
| FCM Sender ID + Server Key | Bedava | Firebase Console'dan |
| Domain associated file (Universal Link) | — | `apple-app-site-association` + `assetlinks.json` dosyaları sunucuya |
| Icon + Splash + Screenshot | Tasarım (Figma) | İçeride veya freelance |

**Toplam tek seferlik:** **$124** + tasarım/copy paralel.

### 4.8 Riskler

| Risk | Etki | Azaltma |
|---|:-:|---|
| Apple onay süresi (2026 ortalama 24-72h, complex 3-7 gün) | Lansman gecikme | Soft lansman + TestFlight'la kapanma testleri 1 hafta önceden başla |
| Sealed teklif maskeleme mobilde | Veri sızıntısı | `listing_offers_safe` view aynen kullanılır (web'de korunduğu gibi), client değişiklik gerek değil |
| Auth token güvenliği (KeyChain/Keystore) | Token çalınma | `capacitor-secure-storage-plugin` ile platform secure storage zorunlu, localStorage YASAK |
| OAuth deep link (kod_verifier kaybı) | Auth fail | Cap-go plugin + Universal Link config (test edilmiş çözüm) |
| Push permission denied (iOS) | Bildirim kaybı | Soft prompt UI (öncesinde değer açıklayan ekran) + İzin verince yeniden iste seçeneği |
| App Store reddetme (gambling vs auction belirsizlik) | Lansman bloke | Apple guideline 5.3.4 incele: "Real estate auctions OK if no gambling element"; ilan yayın öncesi guideline eşleştir |

---

## 5) ÖNCELİK + ZAMAN PLANI (BİRLEŞİK)

### 5.1 Tüm kalan teknik efor

| Modül | Efor (kişi-gün) | Migration | Master onay | Bölge |
|---|:-:|:-:|:-:|---|
| Dalga 3 — /harita Leaflet | 3-4 | YOK | YOK | Web |
| Dalga 3 — /borsa/sehir | 2-3 | YOK | YOK | Web |
| Dalga 3 — /raporlar PDF + opt-in | 3-4 | OLABİLİR | 1 küçük | Web |
| Dalga 5 — /blog SSG | 5 + 10-15 copy paralel | YOK | YOK | Web |
| Dalga 5 — /kampanyalar | 3-4 | OLABİLİR | 1 küçük | Web |
| Dalga 5 — /uluslararasi EN i18n | 10-14 + 3-5 çeviri paralel | YOK | Çeviri editör onayı | Web |
| Dalga 6 — 360° foto + Kuula | 4-5 | YOK | YOK | Web |
| Dalga 6 — Push (device_tokens + FCM) | 4 | **ŞART** | **EVET** | Backend |
| Dalga 6 — Sosyal paylaşım | 0.5-1 | YOK | YOK | Web |
| Dalga 6 — "Benim İçin Teklif Ver" | 8-10 (faz 2) | **ŞART** | **EVET** | Backend |
| Mobil — Capacitor MVP | 10-12 (+5 P1) | YOK | YOK | Mobile |
| Mobil — PWA köprü (geçici) | 3 | YOK | YOK | Web |
| Apple Developer + Play Console + ilk submission | 1-2 | — | $124 maliyet | Operasyon |

**Net teknik efor (1 senior dev):**
- **MVP (lansman-şart):** ~30-40 kişi-gün → 6-8 hafta
- **MVP + Tam parite (lansman + Q3):** ~55-70 kişi-gün → 11-14 hafta
- **2 dev paralel:** ~5-7 hafta MVP, ~8-10 hafta tam

### 5.2 Lansman-ŞART vs NICE-TO-HAVE

#### 🔴 LANSMAN ŞART (soft lansman önce yapılmalı)
- **Push bildirim altyapısı** (FCM + device_tokens + Edge func) — kullanıcı tutmanın anahtarı
- **/blog en az 4-5 SEO post** (Türkiye emlak trendi, ihale rehberi, KKA hesabı) — organik trafik için kritik
- **/harita Leaflet** (5 component zaten hazır, MapPage reuse) — sektör tabanı eksiği kapatır
- **Mobil PWA aktivasyon** (sw-unregister kaldır + vite-plugin-pwa) — Android kullanıcı "indir" deneyimi

**Lansman-şart toplam efor:** ~17-20 kişi-gün → **3-4 hafta**

#### 🟡 LANSMAN İLE BİRLİKTE (paralel, ideal olarak)
- **Capacitor mobil MVP** (10-12 gün) — App Store onay süresi yüzünden 1 hafta önceden başlamalı
- **/kampanyalar gerçek içerik** (3-4 gün) — marketing için anlamlı
- **/raporlar aylık endeks PDF** (3-4 gün) — PR/SEO altın damar

#### 🟢 LANSMAN SONRASI (faz 2)
- **/uluslararasi EN tam i18n** (10-14 gün + çeviri) — niş kullanıcı, lansman blocker değil
- **360° foto** (4-5 gün) — premium portföy için, MVP'de 1-2 örnekle başla
- **"Benim İçin Teklif Ver"** (8-10 gün) — karmaşık akış, ürün-pazar uyumu sonrası
- **/blog 8-12 post tam** — copywriter sürekli üretim
- **Matterport entegrasyonu** — premium tier

### 5.3 Tahmini lansman zaman çizelgesi

**Varsayım:** 1 senior dev tam-zamanlı, tasarım/içerik paralel, Master onayları hızlı.

```
Hafta 1: Dalga 3 — /harita Leaflet + cluster + poligon
Hafta 2: Dalga 6 push mimari (device_tokens + FCM Edge func)
         + Dalga 5 blog altyapı (vite-react-ssg + ilk 3 post)
Hafta 3: PWA aktivasyon + Web Push
         + Mobil Capacitor başlat (gün 1-3 — kurulum + auth + ekran adapt)
Hafta 4: Mobil Capacitor MVP tamamlama (gün 4-7)
         + TestFlight + Play Store internal
         + /raporlar aylık endeks PDF
Hafta 5: Mobil mağaza submission + onay bekleme
         + Dalga 3 /borsa/sehir derinleşme
         + /kampanyalar gerçek içerik
Hafta 6: Mobil onay (Apple 24-72h tipik)
         + Soft lansman dahili test grubuyla
Hafta 7: Public lansman (web + mobil paralel)
Hafta 8+: Faz 2 — EN i18n + 360° + Broker eşleştirme + Blog devamı
```

**Gerçekçi zaman: 6-8 hafta** (lansmanlı versiyon) · **+4-6 hafta** (faz 2 tam parite)

### 5.4 Migration/Backend onayı gerektirenler (Master'a SOR LİSTESİ)

| # | Madde | Tablo/RLS | Kullanım |
|:-:|---|---|---|
| 1 | **Push** | `device_tokens (id, user_id FK, token, platform 'ios'/'android'/'web', last_seen_at, created_at)` + RLS (kullanıcı kendi token'ını okur/günceller) | Mobil push + Web Push |
| 2 | **Aylık rapor abone** | `report_subscribers (id, email, frequency, city_filter, created_at, opted_in_at, opted_out_at)` + RLS (anonim insert mümkün, admin okur) | /raporlar opt-in |
| 3 | **Kampanya** | `campaigns (id, code, name, description, valid_until, image_url, active_bool, target_audience)` + RLS (anonim okur, admin yazar) | /kampanyalar |
| 4 | **Broker eşleştirme** (Faz 2) | `broker_assignments (id, user_id, broker_id, criteria_json, status, created_at)` + `broker_bids (id, broker_assignment_id, listing_id, amount, created_at)` + RLS (sealed-equivalent — buyer ve broker görür, satıcı görmez) | Dalga 6 "Benim İçin Teklif Ver" |
| 5 | **Proxy bid** (Dalga 2'de iade edilmişti) | `auction_proxy_bids (id, listing_id, user_id, max_amount, created_at, active_bool)` + trigger (yeni rakip teklifte otomatik artış) + RLS (sealed-equivalent) | Dalga 2-2'de UI hazır, backend bekliyor |

**Toplam yeni tablo: 6** (push 1 + raporlar 1 + kampanya 1 + broker 2 + proxy bid 1)

**Master onayı verilince:** Migration SQL hazırlanır → master review → `supabase db push` → smoke test.

### 5.5 Dış bağımlılık (ertelenebilir)

| Bağımlılık | Etkilenen | Durum | Karar |
|---|---|:-:|---|
| TCMB EVDS API (gerçek konut endeks veri) | /borsa, /raporlar, /degerleme | Master daha önce API key sorunluydu (kpeucVovjh 10 char 302 redirect) | **Faz 3** — mevcut areaStats statik veriyle MVP yeterli |
| Apple Developer hesabı | Mobil | $99/yıl, Master'ın açması gerek | Mobil MVP başlamadan önce |
| Google Play Console | Mobil | $25 tek seferlik | Mobil MVP başlamadan önce |
| Firebase proje + APNs Auth Key | Push | Bedava ama Master Google hesabıyla kurulmalı | Push entegrasyon başlamadan önce |
| Profesyonel çeviri (EN) | i18n | DeepL + insan editör | Faz 2 |
| Copywriter (blog 8-12 post) | /blog | Freelance veya iç ekip | Faz 1-2 paralel |
| Tasarımcı (mobil icon/splash) | Mobil | Figma + freelance | Mobil hafta 1 başlamadan önce |
| Matterport kamera/lisans | 360° premium | Pahalı donanım | Faz 2-3 |

---

## 6) SONUÇ + ÖNERİ

### 6.1 Üst düzey karar tablosu

| Soru | Yanıt |
|---|---|
| Mobil app teknolojisi? | **Capacitor 7** (gerekçe: %90+ kod reuse, 1 hafta MVP) |
| Push? | **FCM direct + Supabase Edge Function** (OneSignal scale gelince göç) |
| PWA? | Aç — geçici köprü, kalır (Android conversion için) |
| i18n? | **react-i18next + `/en/*` prefix** (yüklü ama kullanılmıyor — paradoks) |
| Blog? | **vite-react-ssg + lokal markdown** (Vite SPA'ya minimum dokunma) |
| 360° foto? | **react-photo-sphere-viewer** + Kuula iframe |
| TCMB? | **Faz 3** — MVP areaStats yeter |
| Yeni tablo? | **6 önerilen** — Master onayı sonrası migration |

### 6.2 Önerilen aksiyon sırası (Master onayı için)

**Adım 1: Bu rapor üzerinde Master review** → hangi maddeler "lansman-şart" oluyor, hangi maddeler "faz 2" listesine.

**Adım 2: Migration onayı** — 6 tablo özelinde net karar (özellikle Push = `device_tokens` MVP ŞART).

**Adım 3: Apple Developer + Play Console hesap açılışı** (Master direkt, $124 maliyet).

**Adım 4: Dalga 3 başlat** (paralel: Master onayı bekliyor → 1 hafta tampon).

**Adım 5: Dalga 6-Push + Mobil Capacitor paralel başlat** (push mobil entegrasyon ile aynı sprint).

**Adım 6: Dalga 5 blog + içerik paralel** (copywriter ile asenkron).

**Adım 7: Soft lansman web + mobil paralel** (TestFlight 1 hafta önceden).

**Adım 8: Faz 2 — EN i18n + 360° + Broker eşleştirme** (lansman sonrası 4-6 hafta).

### 6.3 Master'a kritik sorular (rapor sonuna kadar bekleyenler)

1. **Push migration onayı** — `device_tokens` tablosu + RLS. Hazırlığa başlanması için ŞART.
2. **Apple Developer hesabı** — Master mi açacak yoksa İhaleal LTD adına vergi/imza sürecinde mi?
3. **Mobil app öncelik** — soft lansman ile aynı zamanda mı (riskli) yoksa 2 hafta sonra mı (organik trafik kaybı)?
4. **Copy/içerik üretimi** — blog 12 post için freelance copywriter mı, iç ekip mi?
5. **Profesyonel çeviri** — EN i18n için DeepL + editör mü, ofis-içi mi?

---

## 7) APPENDİX — Ham veri

### Playwright traversal (`scripts/_mega-traverse.json` özeti)

| Rota | body | main | h1 | h2 | iframe | Leaflet | USD/EUR |
|---|--:|--:|:-:|:-:|:-:|:-:|:-:|
| /harita | 3411 | 1708 | 1 | 1 | 1 | ✗ | ✗ |
| /borsa/sehir/istanbul | 2123 | 420 | 1 | 1 | 0 | ✗ | ✗ |
| /raporlar | 2402 | 699 | 1 | 3 | 0 | ✗ | ✗ |
| /blog | 3006 | 1303 | 1 | 0 | 0 | ✗ | ✗ |
| /kampanyalar | 2852 | 1148 | 1 | 1 | 0 | ✗ | ✗ |
| /uluslararasi | 3337 | 1633 | 1 | 5 | 0 | ✗ | ✓ |

EB=0 (6/6), 200/200.

### package.json'da MEVCUT (kritik bağımlılıklar)
- `leaflet@1.9.4` + `react-leaflet@5.0.0` ✓ (Dalga 3 için HAZIR)
- `i18next@24.2.0` + `react-i18next@15.4.0` ✓ (Dalga 5 EN için HAZIR — kullanılmıyor)
- jspdf + Roboto TR ✓ (Dalga 3 /raporlar PDF için HAZIR — Fix 4)
- Recharts ✓ (Dalga 3 grafik için HAZIR)
- Tailwind + Radix UI ✓
- Supabase JS v2 (web tarafında aktif)

### Eklenecek (yeni)
- `leaflet.markercluster` + `@types/leaflet-cluster` (Dalga 3)
- `leaflet-draw` + `@types/leaflet-draw` (Dalga 3)
- `vite-react-ssg` veya `@wroud/vite-plugin-ssg` (Dalga 5 + i18n)
- `vite-plugin-pwa` + workbox (PWA)
- `react-photo-sphere-viewer` (Dalga 6 360°)
- `@capacitor/core` + `@capacitor/cli` + `@capacitor/ios` + `@capacitor/android` + `@capacitor/push-notifications` + `Cap-go/capacitor-supabase` + `capacitor-secure-storage-plugin` (Mobil)

### Eski/kapalı (temizlenebilir)
- `public/sw-unregister.js` (PWA aktif olunca kaldırılır)
- Mixed model: typed `messages.ts` + yüklü `react-i18next` (adapter ile köprüle, drift kalmasın)

---

*Hazırlayan: Claude · Yöntem: Playwright (6 rota) + package.json bağımlılık denetimi + sub-agent ile 25+ WebFetch/WebSearch (2026 Q2 ekosistem güncel) + sentez. Salt-okuma + tek rapor, hiçbir kod/migration değişikliği yapılmadı. Uygulama Master onayı sonrası dalga dalga.*
