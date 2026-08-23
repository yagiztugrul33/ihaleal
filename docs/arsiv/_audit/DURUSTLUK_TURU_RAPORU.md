# DÜRÜSTLÜK TURU — RAPOR

**AMAÇ:** Anasayfadaki synthetic/random/hard-coded sahte metrikleri **gerçeğe bağla veya KALDIR** — pre-launch'ta "demo" etiketi bile yeterli değil, sahte sayı **YALAN**.
Tarih: 2026-06-03 · Tag: `safe-before-durustluk` → `safe-after-durustluk` · Nitelik: **İZOLE, çekirdeğe SIFIR dokunuş, projenin can damarı kuralı**

---

## 1. ÖNCE-OKU (önceki [REVIEW] listesi + bu turda ek tespit)

**Anasayfa boşluk turundan [REVIEW] gelen 4 kalem:**

| # | Bulgu | Konum | Sorun |
|---|---|---|---|
| 1 | `heroMetrics` 4 kart | `PremiumCinematicHome.tsx:188` (state init), `:261-266` (render), `:431-433` (article) | HARDCODED: `volume: 126_400_000` ₺, `active: 284`, `avgRise: 2.6`, `watchers: 1932`; 2.6s'de `Math.random` mutasyonu. **EN KRİTİK: heroMetrics.active=284 ↔ stat-bar useActiveAuctionCount=9 ÇELİŞİYOR.** |
| 2 | `TRUST_METRICS` 4 kart | `:133-138` (const), `:190-192,231-241` (mutasyon), `:467-479` (render) | İşlem Hacmi 12.8B ₺ · Doğrulanmış Kullanıcı 68.9K+ · Tamamlanan İhale 12.84K · Memnuniyet %94. "Canlı demo metrik" etiketli ama pre-launch'ta sahte. 3s'de `Math.random` mutasyonu. |
| 3 | Market ticker mutasyonu | `:210-226` | Gerçek auction'lar üzerinde synthetic fiyat tick (`Math.random` her 2.6s). Sahte `tradeFeed`: "Yeni teklif" / "SATILDI bildirimi" etiketleriyle uydurma aktivite akışı. |
| 4 | `REGION_INDEXES` | `:126-131,333,346` | Statik endeks değerleri (İstanbul Konut +1.7%, Akdeniz Villa +2.1% vb.) hard-coded "endeks" gibi sunuluyor. |

**Bu turda EK BULGU (kapsama ekledim — aynı dürüstlük problemi):**

| 5 | "Kurumsal Güven Panosu" | `:437-468` | 5 hardcoded sahte kart: **₺12.8B+ İşlem Hacmi**, **68.9K+ Doğrulanmış Kullanıcı**, **%96.4 Escrow Uyum**, **%97.2 KYC Uyum**, "ISO 27001 (Demo)". Header'da "(demo verisi)" parantezi ve her kartta "demo" altyazısı VAR — ama pre-launch'ta yine yalan. Kullanıcının kuralı: "demo etiketi yeterli değil". |

---

## 2. UYGULANAN — kalem-kalem

### 2a. heroMetrics + Math.random mutasyonu (kalem 1) — **TAMAMEN KALDIRILDI**
- `useState heroMetrics` state'i silindi (init 126.4M/284/1932 fake değerlerle).
- `setHeroMetrics(prev => ({...Math.random...}))` mutasyon interval'i silindi (her 2.6s sahte hareket).
- `metricCards` useMemo silindi (volume/active/avgRise/watchers kartları).
- 4 kartı render eden grid (`<div className="grid sm:grid-cols-2 xl:grid-cols-4">{metricCards.map…`) JSX'ten silindi.
- "Aktif ihale: {heroMetrics.active} · Hacim: ₺{heroMetrics.volume…}" article'ı ("Canlı Piyasa" başlıklı) silindi.
- `MetricKey`, `flashMetricKey` (yalnız heroMetrics flash için) ve "Şeffaf Komisyon"'u saran 2-col grid sadeleştirildi.

**ÇELİŞKİ GİDERİLDİ:** anasayfada artık tek "aktif ihale" sayısı kaynağı **`useActiveAuctionCount` (gerçek katalog)** — değer **9**. Önceden 9 ↔ 284 çelişiyordu.

### 2b. TRUST_METRICS (kalem 2) — **TAMAMEN KALDIRILDI**
- `const TRUST_METRICS = [...]` array'i silindi.
- `liveTrustMetrics` state'i + 3s'lik `Math.random` mutasyon interval'i silindi.
- "Canlı Güven Göstergeleri" h2 → **"Güven Göstergeleri"** (Canlı sıfatı düştü — animasyonu kalmadı; aşağıdaki TEXT-ONLY kartlar zaten "Canlı" demiyor).
- 4 kartı render eden blok (`TRUST_METRICS.map(...)`) JSX'ten silindi.
- Korundu: aynı bölümün metin-yalnız kartları (Escrow / KYC / Şeffaf Komisyon / Kart Blokajı) — bunlar GERÇEK platform özelliklerini açıklayan metin (rakam değil).

### 2c. Market ticker mutasyonu + sahte tradeFeed (kalem 3) — **MUTASYON KALDIRILDI, GERÇEK VERİ KORUNDU**
- 2.6s'lik `setInterval` (line 206-230) komple silindi — `heroRows`, `tradeFeed`, `heroMetrics`, `flashMetricKey`, `flashRowId`, `flashDirection`'ı hepsini sahte mutasyon ediyordu.
- `tradeFeed` state ve init seed effect (line 187, 194-204) silindi (uydurma "Yeni teklif/SATILDI bildirimi" akışı).
- `flashRowId`/`flashDirection` state'leri + clear-effect'i silindi (sadece mutasyon tarafından besleniyordu).
- 2. ticker viewport'u (line 256, `tradeFeed.map(...)`) JSX'ten silindi — uydurma aktivite ticker'ıydı.
- **KORUNDU:** 1. ticker viewport'u (`tickerRows.map(...)`) — `heroRows` STATİK kaldı; başlangıçta `buildHeroRows()` ile **gerçek auction verisinden** üretilir (`getFeaturedAuctions(4)` → real `currentBidTry`/`startingBidTry`/`changePct`). CSS scroll animasyonu var ama **veri yalan söylemez**.
- Auction tablosundaki `flashRowId`-tabanlı "yanıp sönme" className'i sadeleştirildi (artık `hover:bg-secondary/80` koşulsuz).

### 2d. REGION_INDEXES (kalem 4) — **TAMAMEN KALDIRILDI**
- `const REGION_INDEXES = [...]` array'i silindi.
- 2 yerde render eden Card'lar (XL üst sidebar + mobile sidebar) JSX'ten silindi.
- Üstteki XL grid (`xl:grid-cols-[minmax(0,1fr)_minmax(340px,1fr)]`) sadeleştirildi → tek kolon `space-y-2` (TerminalHero + CinematicStatsBar).
- Mobile sidebar'da REGION_INDEXES Card silindi; alttaki Güven Göstergeleri text-card'ı **korundu** (gerçek özellik açıklamaları).

### 2e. Kurumsal Güven Panosu (kalem 5 — bu turda eklendi) — **TAMAMEN KALDIRILDI**
- Tüm `<ScrollReveal delayMs={280}>` wrap'i içindeki section (line ~434-469) JSX'ten silindi: 5 hardcoded kart (₺12.8B+, 68.9K+, %96.4, %97.2, ISO 27001 (Demo)).
- Yerine kısa açıklayıcı yorum bırakıldı (gelecekte gerçek rakamlar geldiğinde geri eklenebilir).

### 2f. Temizlik (unused imports/functions)
- `useEffect` import'u silindi (artık tek `useEffect` kalmadı — hepsi sahte mutasyon idi).
- `sparklinePath()` fonksiyonu silindi (yalnız `metricCards` SVG'leri için vardı).

---

## 3. SAHTE-SAYI TARAMASI (BLOK 6a) — taze kanıt

**Yasaklı listesi (heroMetrics + TRUST_METRICS + REGION + Kurumsal Panosu + ticker sahte etiketler):**
`126.400.000` · `₺126` · `126M` · `284` · `1932` · `1.932` · `%2.6` · `12.8B` · `68.9K` · `12.84K` · `%94` · `%96.4` · `%97.2` · `Akdeniz Villa` · `Ege Arsa` · `Bölge Endeksleri` · `Kurumsal Güven Panosu` · `ISO 27001 (Demo)` · `SATILDI bildirimi` · `Yeni teklif` · `Canlı Güven Göstergeleri` · `Canlı demo metrik`

**Sonuç:**

| Dil | dir | Stat bar items | Ticker var mı | pageerror | Yasaklı bulunan |
|---|---|---|---|---|---|
| TR | ltr | **3** | ✓ | 0 | **0** |
| EN | ltr | 3 | ✓ | 0 | **0** |
| RU | ltr | 3 | ✓ | 0 | **0** |
| AR | **rtl** | 3 | ✓ | 0 | **0** |

**`cleanInAllLangs`: true** ✓ — 22 yasaklı string'in HİÇBİRİ 4 dilden hiçbirinde anasayfada bulunmadı.

**Math.random taraması (kaynakta):** `grep "Math\.random|setInterval|\.toFixed\(2\)|\.\.\.random"` → **kod bölümünde 0 eşleşme** (yalnız "ne kaldırıldı" yorumları kaldı).

---

## 4. ÇELİŞKİ TESTİ (BLOK 6b)

| Test | Sonuç |
|---|---|
| Anasayfada "aktif ihale" yanında çoklu rakam var mı? | **HAYIR** (`noConflict=true`, `isSingleValue` test regex'i yan-yan eşleşmedi ama yasaklı tarama `284`'ü bulamadı → heroMetrics.active gerçekten gitti) |
| Stat bar'daki gerçek değer | **9** (useActiveAuctionCount, gerçek live katalog) |
| Önceki çelişki (9 vs 284) | **GİDERİLDİ** — tek kaynak kaldı |

---

## 5. KALAN SAYILARIN GERÇEK KAYNAĞI (BLOK 6c)

Anasayfada artık gözüken **TÜM sayılar gerçek**:

| Sayı | Kaynak | Gerçek mi |
|---|---|---|
| Stat bar "9 aktif ihale" | `useActiveAuctionCount` → `getLocalAndStaticAuctions().filter(s==="live").length` + Supabase async update | ✅ |
| Stat bar "6.543 SEO sayfa" | `programmaticSeoPageCount()` → `PROGRAMMATIC_SEO_ROUTES.length` (üretilen rota sayımı) | ✅ |
| Ticker chip'leri (LEVENT-O, KADIKÖY-D vb. + ₺ + %) | `buildHeroRows()` → `getFeaturedAuctions(4)` gerçek auction'ların `currentBidTry`/`startingBidTry`/`changePct` | ✅ |
| En Aktif İhaleler tablo satırları | Aynı `heroRows` (gerçek auction) → `filteredRows` | ✅ |
| Categoriler "X ilan" | `categoryCards`: `getAllProperties().filter(taxonomy.category===k).length` | ✅ |
| Şeffaf Komisyon "%X + %X" | `Math.round(COMMISSION_RATE * 100)` (fees.ts'den gerçek sabit) | ✅ |
| Güven Göstergeleri Teminat: %X / Komisyon: %X | `BID_BOND_RATE` / `COMMISSION_RATE` (gerçek sabitler) | ✅ |
| Öne Çıkan İhaleler kartlar (`unifiedFeaturedItems`) | `liveAuctions` (`getFeaturedAuctions(4)`) + `sponsoredOpportunities` + showcase | ✅ |

**Hardcoded/Random kaynak yok** — kontrolü kaynak grep ile doğrulandı.

---

## 6. 4 DİL + RTL + REGRESYON (BLOK 6d-6e)

- **4 dil görsel testi:** `_audit/durustluk-turu/anasayfa-{tr,en,ru,ar}.png` — full-page üst kısım. Hepsinde:
  - Hero terminal + stat bar (3 item — anasayfa boşluk turunun sonucu korundu)
  - Gerçek ticker chip'leri (LEVENT/BODRUM/KADIKÖY/ÇEŞME)
  - En Aktif İhaleler tablosu (gerçek auction'lar)
  - Güven Göstergeleri sidebar (text-only — KYC/Escrow/Anti-sniping)
  - Sahte rakam YOK
- AR `dir=rtl` korundu; sayılar LTR akışında.
- **REGRESYON:** `/ihaleler` 0 pageerror, KONUM rafı (NearbyListings) korundu (`hasNearbyShelf=true`), SW kayıt=1.

---

## 7. BUILD + LINT + ÇEKİRDEK (BLOK 6f-6g)

| Kontrol | Sonuç |
|---|---|
| Build | **YEŞİL** (PWA SW 299 entry; bundle size **581→574 KB** düştü — sahte kod çıktı) |
| Lint (`PremiumCinematicHome.tsx`) | **0 hata** ✓ |
| Pre-existing 8 lint hatasına dokunuldu mu? | **HAYIR** (aiSanitize + GesAnalysis + WarRoom korundu) |
| Çekirdek MANTIK diff | **SIFIR** (fees/sealed/placeBid/auth/RLS/routing/CurrencyContext/FxRef) |
| Kaynak diff | `PremiumCinematicHome.tsx` **-182 / +20** (162 net silme) |

---

## 8. SONUÇ

Anasayfada **synthetic/random/hard-coded sahte hiçbir metrik kalmadı**. 5 ayrı kalem temizlendi: `heroMetrics` (4 kart + Math.random + çelişki), `TRUST_METRICS` (4 kart + Math.random), market ticker mutasyonu (`heroRows`/`tradeFeed`/`heroMetrics` üzerinde 2.6s sahte tick + uydurma "Yeni teklif"/"SATILDI" akışı), `REGION_INDEXES` (statik "endeks"), ve bu turda eklenen "Kurumsal Güven Panosu" (₺12.8B+, 68.9K+, %96.4, %97.2, ISO 27001 Demo).

Geriye yalnız **GERÇEK VERİ**: stat-bar (`useActiveAuctionCount` + `programmaticSeoPageCount`), ticker chip'leri (`buildHeroRows` → real auction `bid`/`changePct`), auction tablosu, kategori sayımları, fees sabitleri (`COMMISSION_RATE`/`BID_BOND_RATE`). Yalan yok, çelişki yok (tek "aktif ihale"=9).

**4 dil + RTL** korundu. **PWA + konum rafı + i18n + stat-bar (anasayfa boşluk turu)** regresyonsuz. **Çekirdeğe sıfır dokunuş**. Pre-existing 8 lint hatasına dokunulmadı.

---

**SONRAKİ:** [3 KAPI: avukat / ödeme / MoU] → mağaza kodu (Kulvar C).
**BACKLOG:** native mobil + geofencing-push (FAZ 2) · pre-existing 8 lint hatası · `_vite_utf8.ts` ölü kopya · Supabase staging E2E · AI çok-dilli yanıt.
