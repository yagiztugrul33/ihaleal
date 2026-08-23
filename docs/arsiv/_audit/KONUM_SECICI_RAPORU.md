# 📍 KONUM SEÇİCİ — LocationPicker (il/ilçe dropdown + Leaflet harita)

**Tarih:** 2026-06-01
**Tag baseline:** `safe-before-konum-secici`
**Doktrin:** ÜCRETSİZ harita (Leaflet + OpenStreetMap), Google Maps YASAK. Core/auth/RLS DOKUNULMADI.

---

## ⚡ TEK-CÜMLELİK ÖZET

`LocationPicker` ortak bileşen tamamlandı (81 il dropdown + büyük 10 ilin ilçeleri + Leaflet harita + Nominatim adres arama opsiyonel); demo entegrasyon `/konum-risk-sorgu` ve `/zemin-risk` route'larında canlı; **tüm site dönüşümü (CreateAuction, ValuationTool, GES, BinaRisk, arama)** ayrı dilim — bu turda altyapı ve dürüst zemin risk gösterimi (sıvılaşma + heyelan + zemin büyütme + AFAD/İBB kaynak etiketli).

---

## ✅ BLOK 1 — Ortak Bileşen LocationPicker

`src/components/location/LocationPicker.tsx` (262 satır):

| Özellik | Statü |
|---|---|
| 81 il kademeli dropdown | ✅ (plaka kodu + isim) |
| İl → ilçe kademeli (büyük 10 il için) | ✅ İstanbul/Ankara/İzmir/Bursa/Antalya/Adana/Konya/Gaziantep/Kayseri/Mersin |
| Diğer iller ilçe listesi | "(veri yok — haritadan pin atın)" not | 
| Leaflet harita (OpenStreetMap) | ✅ ÜCRETSİZ |
| Pin sürükle + tıkla = koordinat al | ✅ (lat/lng 6 ondalık) |
| Auto-zoom (il → ilçe → pin) | ✅ |
| Nominatim adres arama (opsiyonel) | ✅ `showSearch` prop ile |
| Mobil dokunmatik harita | ✅ Leaflet default |
| Disabled mode | ✅ |

### Veri tabanı: `src/data/trProvinces.ts`

- 81 il + il merkezi koordinatları (WGS84, Wikipedia)
- Büyük 10 ilin tam ilçe listesi (manuel veri — kamuya açık)
- `findProvince(name)` + `findProvinceByCode(code)` helpers
- `PROVINCES_WITH_DISTRICTS` — ilçesi dolu iller (kanıt için)

---

## ✅ BLOK 2 — Demo Entegrasyon: LocationRiskQueryPage

Route: **`/konum-risk-sorgu`** + alias `/zemin-risk`

`src/pages/LocationRiskQueryPage.tsx` — LocationPicker + ZoneRiskCard birleşik:
1. **Veri Kapsamı kartı** — kaç il, kaç ilçe veri var (dürüst)
2. **LocationPicker** — il/ilçe + Leaflet harita + Nominatim arama
3. **ZoneRiskCard** — seçilen konuma göre dürüst risk gösterimi
4. **Eğitici** — Sıvılaşma / Heyelan / Zemin Büyütme nedir (vatandaş dili)

### ⚠️ Geriye kalan sayfalar (ayrı dilim — Master onayı sonra)

| Sayfa | Şu an | Bağlanacak |
|---|---|---|
| CreateAuction | Şehir input string | LocationPicker (ilan ekleme akışı) |
| ValuationTool | Şehir dropdown (mevcut) | LocationPicker entegrasyonu |
| GES Analizi | Lokasyon form | LocationPicker |
| BinaRisk | EarthquakeRiskWorkbench (manuel girdi) | LocationPicker → auto-fill |
| Arama/filtre | İl listesi (mevcut) | LocationPicker dropdown |

→ Altyapı hazır; tüm sayfa dönüşümü ayrı dilim 8-12 saat tahmini.

---

## 🔒 ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 298 entries (6447.64 KiB) — +2 yeni chunk
```
✅ **YEŞİL**

### Lint
```
$ npx eslint src/data/trProvinces.ts src/components/location/*.tsx src/pages/LocationRiskQueryPage.tsx src/App.tsx
→ 0 hata
```

### Çekirdek korundu
- ✅ `fees.ts`, `placeBid` RPC, RLS, sealed view, auth DOKUNULMADI
- ✅ Sadece YENİ dosyalar (trProvinces, LocationPicker, ZoneRiskCard, LocationRiskQueryPage, zoneRiskData) + App.tsx route ekleme

### Canlı kanıt (Playwright local 4173)

```json
{
  "http": 200,
  "has_il_dropdown": true,
  "has_il_secimi": true,
  "has_leaflet": true,          ← Leaflet harita render
  "has_osm": true,              ← OpenStreetMap attribution
  "has_afad_tdth": true,        ← AFAD TDTH 2018 kaynak
  "has_ibb": true,              ← İBB Mikrobölgeleme kaynak
  "errs": []                    ← 0 console error
}
```

---

## 📂 Audit Ayak İzi

```
src/data/trProvinces.ts                          (134 satır — 81 il + 10 ilin ilçeleri)
src/components/location/LocationPicker.tsx       (262 satır — ortak bileşen)
src/components/location/ZoneRiskCard.tsx         (zemin risk gösterimi — zemin raporu ile birlikte)
src/pages/LocationRiskQueryPage.tsx              (demo entegrasyon)
src/App.tsx                                      (+2 route: /konum-risk-sorgu, /zemin-risk)

_audit/konum-zemin/
├── _test-konum2.mjs                              (Playwright doğrulama)
├── istanbul-avcilar.png                         (canlı kanıt İstanbul + Avcılar)
└── bayburt-veri-yok.png                         (dürüst "veri yok" mesajı)
```

---

— **Ortak bileşen + 81 il + Leaflet harita + ücretsiz OSM hazır; tüm site dönüşümü ayrı dilim.**
📍✅
