# ANASAYFA BOŞLUK DOLDURMA TURU — RAPOR

**AMAÇ:** Anasayfadaki "—" çevrimiçi placeholder kutusu + diğer boş/placeholder göstergeleri **GERÇEK veriyle doldur veya KALDIR** — sahte sayı **ASLA**.
Tarih: 2026-06-03 · Tag: `safe-before-anasayfa-bosluk` → `safe-after-anasayfa-bosluk` · Nitelik: **İZOLE, çekirdeğe SIFIR dokunuş, dürüstlük çekirdek kuralı**

---

## 1. METRİK ENVANTERİ (BLOK 1) — kaynaklar + sınıflandırma

**Stat şeridi** (`src/components/cinematic/CinematicStatsBar.tsx`, `/` hero altı):

| # | Etiket | Kaynak | Durum | Eylem |
|---|---|---|---|---|
| 1 | **aktif ihale** | `useActiveAuctionCount()` → `getLocalAndStaticAuctions` + `loadAllAuctionsForSearch` (Supabase) `.filter(status==="live")` | ✅ **GERÇEK** (canlı katalogtan) | **dokunma** |
| 2 | **SEO sayfa** | `programmaticSeoPageCount()` → `PROGRAMMATIC_SEO_ROUTES.length` (üretilen rota sayısı) | ✅ **GERÇEK** (gerçek rota sayımı) | **dokunma** |
| 3 | **— çevrimiçi** | `useOnlinePresence()` Supabase presence channel; `connected===false` → "—" | ⚠️ **BOŞ** — pre-launch'ta dürüst "—" konmuş ama gösterimde tutarsız: connected=true olsa "1 çevrimiçi" (sadece ziyaretçinin kendisi) görünür → BU DA misleading | **KALDIR + 3'lü dengeli grid** |
| 4 | **CANLI / borsa terminali** | Statik pulse badge | ✅ **DURUM GÖSTERGESİ** (sayı değil — borsa terminali gerçekten canlı bir bileşen) | **dokunma** |

**Karar (3 → 1c/2c, en dürüst):** "—" çevrimiçi kutusu kaldırıldı. Layout `display:flex` zaten oto-dengeli; 3 item + 2 divider'a düştü. `useOnlinePresence` ALTYAPISI silinmedi — `OnlinePresenceBadge` başka yerde (`onlineCount>=1 && connected`) hâlâ gösterebilir. Yalnız anasayfa şeridinden çıkarıldı.

---

## 2. BAŞKA PLACEHOLDER TARAMASI (BLOK 1c — diğerleri)

Anasayfada (`PremiumCinematicHome.tsx`) `"—"`, `"TODO"`, `"Lorem"`, `"placeholder"` aramasında **kullanıcı-gözüne** giden başka placeholder bulunmadı (yalnız useState init değerleri `setX(null)` vb.). Ancak **çok daha kritik** bulgular:

### ⚠️ [REVIEW] — bu turun KAPSAMI DIŞINDA, ayrı dürüstlük turu gerekli:

| Bulgu | Konum | Sorun | Risk |
|---|---|---|---|
| **`heroMetrics` (4 kart)** | `PremiumCinematicHome.tsx:188,261-266,431-433` | **HARDCODED FAKE**: `volume: 126_400_000` ₺, `active: 284`, `avgRise: 2.6`, `watchers: 1932` — 2.6s'de bir `Math.random()` ile mutasyon | **AÇIKLAMA YOK** → gerçek metrik gibi sunuluyor. **`heroMetrics.active=284` ↔ stat-bar `aktif ihale=9` ÇELİŞKİSİ var** (sayfa içinde 9 ve 284 aynı anda "aktif ihale" diyor). |
| **`TRUST_METRICS` (4 güven kartı)** | `PremiumCinematicHome.tsx:133-138,467-479` | Hardcoded değerler + `Math.random()*0.12` her 3s | Açıklama VAR ("Canlı demo metrik" — line 478) — açık ama hâlâ pre-launch için yanıltıcı. |
| **Market ticker mutasyonu** | `PremiumCinematicHome.tsx:210-226` | Gerçek auction'lar üzerinde **synthetic fiyat mutasyonu** (2.6s'de bir random tick) | Etiket "Yeni teklif", "SATILDI bildirimi" gerçek değil. |
| **`REGION_INDEXES`** | `PremiumCinematicHome.tsx:126-131` | Statik "endeks" değerleri (İstanbul Konut +1.7%, Ege Arsa -0.5%, …) | Açıklama yok; gerçek endeks gibi sunuluyor. |

**Neden bu turun dışı:** kullanıcının açık talimatı **"'—' çevrimiçi kutusu + varsa diğer placeholder'lar"**. Yukarıdaki fake metrikler "placeholder" değil **synthetic-mock** — KAPSAM AYRI tur gerektiriyor (her birinde "DB'de gerçek mi → bağla / yoksa kaldır" kararı + büyük UI refactor + olası RPC sorgu seçenekleri). Bu turda **listeli** + **rapora yazıldı** ([REVIEW] not), **DOKUNULMADI**.

---

## 3. UYGULANAN DEĞİŞİKLİK (BLOK 2) — surgical

### 3a. `src/components/cinematic/CinematicStatsBar.tsx` (rewrite)
- ❌ Kaldırıldı: `useOnlinePresence` import + hook çağrısı + `connected ? onlineAnimated : "—"` blok + bir divider
- ✅ Eklendi: `useLocale` import + `s = t.cinematicStats` — 4 dil etiket
- ✅ Eklendi: sayıların `dir="ltr"` wrap'i (AR'da sayı LTR akışı)
- ✅ Eklendi: `data-testid="stats-seo-pages"` + `data-testid="stats-live-exchange"` (test selectors)
- ✅ Korundu: `useActiveAuctionCount` + `programmaticSeoPageCount` (gerçek metrikler), `cinematic-stats-bar__pulse` (CANLI animasyonu), `useCountUp` (animasyon)
- ✅ Korundu: `useOnlinePresence` hook + `OnlinePresenceBadge` (başka yerde kullanılır — silinmedi)

### 3b. `src/i18n/messages.ts` (additive — 0 deletion)
- `CinematicStatsMessages` type tanımı (4 alan: `activeAuctions`, `seoPages`, `liveLabel`, `exchangeTerminal`)
- `Messages.cinematicStats: CinematicStatsMessages` field
- TR: "aktif ihale" / "SEO sayfa" / "CANLI" / "borsa terminali"
- EN: "active auctions" / "SEO pages" / "LIVE" / "exchange terminal"
- RU: "активных торгов" / "SEO страниц" / "В ЭФИРЕ" / "терминал биржи"
- AR: "مزاد نشط" / "صفحات SEO" / "مباشر" / "محطة البورصة"

**Toplam diff:** `CinematicStatsBar.tsx` ±36 satır + `messages.ts` +32 satır additive · **çekirdek (fees/sealed/placeBid/auth/RLS/routing/CurrencyContext/FxRef) SIFIR**.

---

## 4. DÜRÜSTLÜK (BLOK 4a/4b) — kanıt

| Kontrol | Sonuç |
|---|---|
| Stat bar'da `"—"` var mı? | **HAYIR** (4 dilde de `hasEmDash=false`) ✓ |
| Stat bar'da "çevrimiçi"/"online"/"онлайн"/"متصل" sözcüğü? | **HAYIR** (`forbiddenInBar=false` 4 dilde) ✓ |
| Sahte sayı eklendi mi? | **HAYIR** — yalnız mevcut gerçek metrikler (`useActiveAuctionCount`=9, `programmaticSeoPageCount`=6552) ✓ |
| Etiket gerçek veriye uyuyor mu? | EVET (TR/EN/RU/AR'da "aktif ihale"/"active auctions"… karşı `useActiveAuctionCount` sayısı; "SEO sayfa"/"SEO pages"… karşı `programmaticSeoPageCount`; "CANLI"/"LIVE"… durum etiketi) ✓ |

---

## 5. 4 DİL + RTL + REGRESYON (BLOK 4c-4f) — fresh kanıt

| Kontrol | TR | EN | RU | AR |
|---|---|---|---|---|
| `dir` | ltr | ltr | ltr | **rtl** ✓ |
| items | 3 | 3 | 3 | 3 ✓ |
| dividers | 2 | 2 | 2 | 2 ✓ |
| labelsOK | ✓ | ✓ | ✓ | ✓ |
| Sayı görünüyor (digits) | ✓ | ✓ | ✓ | ✓ |
| pageerror | 0 | 0 | 0 | 0 |

**REGRESYON:** `/ihaleler` sayfası açılıyor (0 error), **KONUM rafı (NearbyListings)** korunuyor (`hasNearbyShelf=true`), SW kayıt=1.

**Screenshots:** `_audit/dil-anasayfa/stat-{tr,en,ru,ar}.png` (stat bar bbox'lı focused crop).

---

## 6. BUILD + LINT + ÇEKİRDEK (BLOK 4f-4g)

- **Build:** YEŞİL (PWA SW 299 entry regenerated).
- **Lint** (`src/components/cinematic/CinematicStatsBar.tsx` + `src/i18n/messages.ts`): **0 hata** ✓.
- **Pre-existing 8 lint hatasına DOKUNULMADI** (aiSanitize control-regex + GesAnalysis/WarRoom unused-import).
- **Çekirdek diff:** `git diff HEAD -- src/` yalnız 2 dosya (CinematicStatsBar + messages.ts). `fees`, `sealed`, `placeBid`, `CurrencyContext`, `FxRef`, `auth`, `RLS`, `routing` — **SIFIR**.

---

## 7. SONUÇ

Anasayfanın stat şeridindeki **"—" çevrimiçi** placeholder kutusu **kaldırıldı**; 3 gerçek metrikli temiz şerit kaldı (`aktif ihale` + `SEO sayfa` + `CANLI borsa terminali`). 4 dilde (TR/EN/RU/AR) etiket, AR `dir=rtl` korundu, sayı LTR. **Sahte sayı YOK** (yalnız mevcut gerçek `useActiveAuctionCount`/`programmaticSeoPageCount` kullanıldı). `useOnlinePresence` altyapısı silinmedi — başka yerlerde (`OnlinePresenceBadge`) `connected===true && count>=1` olduğunda dürüst gösterim devam edebilir.

**Çekirdeğe sıfır dokunuş** (fees/sealed/placeBid/auth/RLS/routing/CurrencyContext/FxRef/i18n run-time akışı). **PWA + konum rafı + i18n + RTL** korundu (regresyon kanıtlı).

---

## 8. [REVIEW] — SONRAKİ TURLAR İÇİN AYRI DÜRÜSTLÜK BAŞLIKLARI

Bu tur **kapsam içi değil ama acil**: anasayfada birden çok **synthetic/fake** metrik tespit edildi (Bölüm 2):
1. **`heroMetrics` 4 kart (volume/active/avgRise/watchers)** — undisclosed fake + `heroMetrics.active=284` ↔ stat-bar `aktif ihale=9` ÇELİŞKİSİ. **YÜKSEK ÖNCELİK.**
2. **`TRUST_METRICS` 4 kart** — "Canlı demo metrik" açıklaması var ama pre-launch'ta yine kaldırılmalı/gerçeklenmelidir.
3. **Market ticker mutasyonu** (2.6s'de Math.random fiyat tick'i) — synthetic; gerçek auction üzerinde sahte canlılık.
4. **`REGION_INDEXES`** — statik "endeks" değerleri (gerçek endeks API'si yoksa kaldırılmalı).

Önerilen tur sırası: **(1)** heroMetrics çelişkisini gider (en acil — kullanıcı 9 vs 284 görür); **(2)** TRUST_METRICS pre-launch için kaldır/gerçek RPC bağla; **(3)** market ticker animasyonu durdur/gerçek auction event'lerine bağla; **(4)** REGION_INDEXES kaldır/gerçek endeks tablosuna bağla.

---

**SONRAKİ:** [3 KAPI: avukat/ödeme/MoU] → mağaza kodu (Kulvar C). Bağımsız dil/UI işleri bitti.
**BACKLOG:** native mobil + geofencing-push (FAZ 2) · pre-existing 8 lint · `_vite_utf8.ts` ölü kopya · Supabase E2E · AI çok-dilli yanıt · **dürüstlük turu: heroMetrics + TRUST_METRICS + ticker mutasyonu + REGION_INDEXES**.
