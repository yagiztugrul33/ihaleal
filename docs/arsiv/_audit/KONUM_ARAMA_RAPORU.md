# YAKINIMDAKİ İLANLAR TURU — RAPOR

**AMAÇ:** Kullanıcı izin verince konumuna yakın ilanları GERÇEK mesafeyle gösteren dürüst arama.
Tarih: 2026-06-03 · Tag: `safe-before-konum-arama` → `safe-after-konum-arama` · Nitelik: **İZOLE, anlık arama (bildirim/sürekli-takip DEĞİL), çekirdeğe SIFIR dokunuş, mağazadan bağımsız**

---

## 1. VERİ DURUMU (BLOK 1 — önce netleştirildi)
**Sonuç: koordinat VAR → mesafe-bazlı GERÇEK arama yapılabilir (1b).**
- `src/types/auction.ts`: her ilanda **`mapLat: number; mapLng: number`** (zorunlu).
- `src/data/auctions.ts`: 12 ilanda gerçek koordinat (İstanbul 41.08/29.0, Bodrum 37.1/27.3, Ankara 39.9…).
- Mesafe için **mevcut `src/lib/geo/haversine.ts`** (`haversineDistanceM`) REUSE edildi — yeni hesap icat edilmedi.
- Sahte koordinat/mesafe ÜRETİLMEDİ (gerek yoktu; veri gerçek).

## 2. UYGULANAN YÖNTEM
- **Yeni bileşen** `src/components/nearby/NearbyListings.tsx` (izole): `catalog: Auction[]` okur, Haversine ile mesafe hesaplar, yarıçapa göre (5/10/25 km) filtreler + artan sıralar.
- **Kart:** sayfanın mevcut Auction-kart pattern'i (LiveAuctions Shelf: görsel + `CountdownTimer` + başlık + ilçe/şehir + ₺ + `/ilan/:id`) REUSE; üstüne **mesafe rozeti** ("4.1 km"). Yeni kart icat edilmedi.
  - *Not:* paylaşılan `PropertyListingCard` `PropertyRecord` tipi + `/ilanlar/` rotası için; Auction domain'ine uymuyor → ona dokunmadan sayfanın Auction kartı kullanıldı (sıfır risk).
- **Yer:** `/ihaleler` (LiveAuctions) hero altı, shelf'lerden önce — `<NearbyListings catalog={catalog}/>`. Mevcut katalog yeniden kullanıldı (ekstra fetch yok).

## 3. İZİN AKIŞI (BLOK 2 — dürüst + KVKK-nazik)
- `navigator.geolocation.getCurrentPosition` — **TEK SEFERLİK** (`watchPosition`/sürekli takip YOK — o FAZ-2 mobil). Mevcut `useGeofenceWatch` (sürekli) **kullanılmadı**.
- İzin **yalnız kullanıcı "Yakınımdaki ilanlar" butonuna basınca** istenir — sayfa açılışında konum sorma spam'i YOK.
- **İzin reddi → nazik fallback** ("Konum izni verilmedi. Şehir seçerek de arayabilirsin."); hata ekranı YOK.
- Desteklenmeyen tarayıcı → nazik mesaj.

## 4. KVKK — KONUM SAKLANMAZ
- Konum **yalnız component state'inde** (`useState`) tutulur; **localStorage/DB/sunucuya YAZILMAZ**.
- **Kanıt (test):** konum alındıktan sonra localStorage yeni anahtar=**[] (boş)**, konum sızıntısı=**false**. Tek seferlik arama için kullanılıp atılır.

## 5. PERMISSIONS-POLICY DÜZELTMESİ (gerekli ön koşul)
Mevcut güvenlik başlığı `Permissions-Policy: geolocation=()` API'yi **tamamen kapatıyordu** (tarayıcı izni verilse bile "disabled by permissions policy" hatası). Özellik için **3 header kaynağında** minimal düzeltme:
| Dosya | Değişiklik |
|---|---|
| `vite.config.ts` (preview/dev) | `geolocation=()` → `geolocation=(self)` |
| `vercel.json` (Vercel production) | `geolocation=()` → `geolocation=(self)` |
| `public/_headers` (Netlify/CF production) | `geolocation=()` → `geolocation=(self)` |
→ `=(self)`: yalnız **same-origin** konum; 3. taraf iframe'lere **kapalı**. `camera=()`/`microphone=()` **kapalı kaldı**. Güvenlik daraltması korundu, yalnız gerekli yetki açıldı.

## 6. DİL + RTL
- Yeni `nearby` namespace (`messages.ts`) — **4 dil** (TR/EN/RU/AR): button, intro, privacyNote, locating, radiusLabel, kmSuffix, resultsTitle, countWithin, empty, denied, unavailable, retry, collapse. i18n deseni (type + en/tr + ru/ar override) korundu.
- RTL: logical CSS (`start-2`/`end-2`), AR `dir=rtl`. **Mesafe rozeti + ₺ + yarıçap sayısı `dir="ltr"`** (AR'da sayı düzgün akar).

## 7. KANIT (`_audit/dil-konum/result.json`, `test.mjs`)
| Test | Sonuç |
|---|---|
| **5f Build + lint** | Build **YEŞİL**; ESLint **0**. |
| **5a İzin VER** | 4 dil: buton görünür, km rozeti VAR, mesafeler **[4.1, 4.7, 6.8, 7.9] km** (İstanbul konumu → İstanbul ilanları, GERÇEK Haversine), **artan sıralı**, 0 pageerror. |
| **5a İzin REDDET** | nazik fallback mesajı çıkar, hata yok, 0 pageerror. |
| **5b 4 dil + RTL** | tr/en/ru/ltr, ar `dir=rtl`; buton + metin + rozet + boş-durum çevrildi. Screenshot: `yakinimdaki-{tr,en,ru,ar}.png`. |
| **5c Dürüstlük** | gerçek mesafe (koordinat var); sahte sonuç YOK; boş sonuçta "yarıçapı genişlet". |
| **5d Regresyon** | LiveAuctions shelf'leri + borsa terminali + auctions sağlam, 0 pageerror. PWA/ilan-detay etkilenmedi. |
| **5e KVKK** | konum localStorage'a yazılmadı (yeni anahtar=[]), sızıntı=false. |
| **5g Diff** | `messages.ts`(nearby additive) + yeni `NearbyListings.tsx` + `LiveAuctions.tsx`(import+mount) + 3 header dosyası(geolocation=self). **Çekirdek (placeBid/fees/auth/CurrencyContext/sealed/rpc) diff'te YOK.** |

## 8. [REVIEW] / NOT
- **`_vite_utf8.ts`** (kök dizinde) — `vite.config.ts`'in ölü bir UTF-8 kopyası, hiçbir yerde referanslı değil (Vite `vite.config.ts` kullanır). Bu turda **dokunulmadı**; ileride silinmeli (içinde eski `geolocation=()` var ama aktif değil).
- Önizleme (vite preview) test sırasında stale process header'ı eski gösteriyordu; `taskkill` + fresh start ile çözüldü (Windows'ta `pkill -f` node'u öldürmüyor) — kod sorunu değil, test ortamı notu.

## 9. SONUÇ
`/ihaleler` sayfasında **"Yakınımdaki ilanlar"**: kullanıcı izin verince GERÇEK Haversine mesafesiyle (5/10/25 km) en yakın ilanları sıralı gösterir; izin reddinde nazik fallback. **Konum saklanmaz** (KVKK), **tek seferlik** (sürekli takip yok), **4 dil + RTL**, sahte sonuç yok. **Çekirdeğe sıfır dokunuş.** Permissions-Policy 3 kaynakta `geolocation=(self)`'e daraltılarak açıldı.

**SONRAKİ:** PWA temeli (sırada) → anasayfa boşluk doldurma → [3 KAPI: avukat/ödeme/MoU] → mağaza kodu.
**BACKLOG:** native mobil + arka-plan geofencing-push (FAZ 2, web tutunca) · Supabase staging E2E · AI çok-dilli yanıt · `_vite_utf8.ts` temizliği · pre-existing 8 lint hatası (aiSanitize control-regex + GesAnalysis/WarRoom unused-import — ayrı temizlik turu, BU TURDA DOKUNULMADI).

---

## 10. BU TURDA TEKRAR DOĞRULAMA (kurtarma + kapanış turu)

**Durum:** Çekirdek konum-arama kodu paralel oturumda commit `2e780f4`'te `origin/main`'e zaten **PUSH** edilmişti (`konum-arama: Yakinimdaki ilanlar (tek-seferlik geolocation + Haversine mesafe)`). Bu turda yalnız audit kanıtı (`_audit/dil-konum/` + bu rapor) bekliyordu — tamamlandı.

**Tag durumu (zaten doğru yerde, dokunulmadı):**
- `safe-before-konum-arama` → `ee4c90d` (önceki commit: pwa-temeli) — konum öncesi temiz nokta ✓
- `safe-after-konum-arama` → `2e780f4` (konum-arama commit'i) — konum sonrası temiz nokta ✓

**Tekrar test (canlı kanıt, fresh preview):**
- Eski preview process (PID 26464) **stale** idi; `Permissions-Policy: geolocation=()` (eski) yolluyordu → test izin-verme akışında düşüyordu. **Çözüm:** `Stop-Process -Force` → `npm run preview` (taze) → header `geolocation=(self)`'e döndü → test geçti. **Kod sorunu DEĞİL, salt env. tekrarı (zaten Bölüm 8'de not edilmişti).**
- Build **YEŞİL** (PWA SW yeniden üretildi · 299 precache entry).
- Lint **0** (yalnız konum-arama dosyalarında: NearbyListings + messages + LiveAuctions).
- Test PASS: 4 dil (TR/EN/RU/AR) **buton + kmRozet + mesafeler [4.1, 4.7, 6.8, 7.9] km + sıralı + 0 pageerror**; izin reddi nazik fallback ✓; KVKK konum sızıntısı = **false**; regresyon (shelf/borsa/auctions) sağlam.

**Pre-existing 8 lint hatasına DOKUNULMADI** (ayrı temizlik turunda ele alınacak):
- `src/lib/security/aiSanitize.ts:36` — `no-control-regex` + 2× `no-irregular-whitespace`
- `src/pages/intelligence/GesAnalysisPage.tsx:5` — 3 kullanılmayan import (Zap/MapPin/Building)
- `src/pages/intelligence/WarRoomPage.tsx:5` — 2 kullanılmayan import (ChevronDown/Building)

**`origin/main..HEAD`:** BOŞ — `2e780f4` zaten `origin/main`'de. Bu turun audit-commit'i ayrıca push edildi.
