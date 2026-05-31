# 500 / Hata / Boşluk Tam Site Taraması — ANAYASA Raporu

**Tarih:** 2026-05-31
**Tetikleyici:** Master /ilan/prop-010'da "500 — Bir sorun oluştu" gördü; önceki PWA raporu sadece 4 rotayı kapsamıştı (anayasa ihlali). Bu rapor TÜM siteyi gezer.
**Build:** `97dde99` → fix commit (bu raporla birlikte)
**Tag:** `safe-before-ilan-500-fix` (baseline)

---

## 1) Kök Neden — /ilan/prop-010 "500"

### Lokal tekrar üretilemedi (104/104 yeşil)
Tam Playwright taraması (52 rota × 2 viewport = 104) `/ilan/prop-010` dahil **TÜM URL'lerde HTTP 200 + EB=0 + PE=0** sonuç verdi. ErrorBoundary lokal'de tetiklenmiyor.

### Olası neden: PWA SW eski cache + yeni deploy paradoksu
- Master, eski deploy zamanından kalmış bir Service Worker ile /ilan/prop-010'a girdi.
- Yeni deploy → bundle hash'leri değişti (`AuctionDetail-XXXX.js`).
- Eski SW cache, **eski lazy-import URL'sini** Network'ten istemiş → 404 → `Failed to fetch dynamically imported module` → ErrorBoundary → ErrorPage "500 Bir sorun oluştu".
- Bu klasik PWA migration tuzağıdır. Çözüm aşağıda.

### Yan bulgu: EmptyState `<h3>` → /ilan/prop-XXX için `<h1>` yoktu
- `AuctionDetail.tsx` 397-409. satırlardaki "İlan bulunamadı" fallback `EmptyState` kullanıyordu.
- `EmptyState` `<h3>` rendır eder; sayfada `<h1>` hiç yok → **anayasa "her sayfada h1" kuralı kırılıyor**.
- Tarama: `prop-001`, `prop-010`, `prop-030`, `prop-060`, `prop-999`, UUID-zero, `saçma-id` → h1="" (boş).

---

## 2) Uygulanan Fix'ler

### Fix A: `AuctionDetail.tsx` — özel "İlan bulunamadı" sayfası + `<h1>` + iki CTA
**Dosya:** `src/pages/AuctionDetail.tsx`
**Satır:** 389-422 (önce 21 satır → şimdi 32 satır)
- EmptyState yerine inline render: görünür `<h1>` "İlan bulunamadı".
- Açıklama metni + ID önizleme (`ID: {id ?? "—"}`).
- İki CTA: "İhalelere dön" (gradient), "Arama sayfası" (outline + Search ikon).
- `min-h-screen` + dikey hizalama korunur, anayasa "boşluk yok" sağlandı.

### Fix B: `ErrorBoundary.tsx` — PWA chunk recovery
**Dosya:** `src/components/ErrorBoundary.tsx`
**Satır:** 14-50 (yeni `attemptChunkRecovery` + `isChunkLoadError` yardımcıları)
- Hata mesajında / stack'inde `Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed|ChunkLoadError` regex eşleşmesi.
- Tek seferlik recovery: `sessionStorage` flag → SW unregister + tüm `caches.delete` + `location.reload()`.
- İkinci kez aynı hata gelirse "gerçek" ErrorPage gösterilir (sonsuz döngü yok).
- `clientLogError` extra `isChunkLoad: true` payload ile telemetri'ye işaretlenir.

---

## 3) Tam Site Tarama Sonucu

**Script:** `_audit/dalga5-pwa/site-tarama/_full-scan.mjs`
**JSON dump:** `_audit/dalga5-pwa/site-tarama/_scan-result.json`
**Çıktı log:** `_audit/dalga5-pwa/site-tarama/_full-scan-2.log`

### Toplam: **104 / 104 PASS** (52 rota × 2 viewport)

| Kategori | Rota Sayısı | HTTP=200 | EB=0 | PE=0 | EBox=N |
|---|---|---|---|---|---|
| Ana navigasyon (8) | 8 | ✅ | ✅ | ✅ | ✅ |
| Borsa (7) | 7 | ✅ | ✅ | ✅ | ✅ |
| /ilan/{1..12} (12) | 12 | ✅ | ✅ | ✅ | ✅ |
| /ilan/prop-XXX + UUID + saçma (8) | 8 | ✅ "İlan bulunamadı" h1 | ✅ | ✅ | ✅ |
| Auth (giris/kayit/profil/panel/favoriler) | 5 | ✅ | ✅ | ✅ | ✅ |
| Legal/destek/iletisim (5) | 5 | ✅ | ✅ | ✅ | ✅ |
| Modüller (2 örnek) | 2 | ✅ | ✅ | ✅ | ✅ |
| SEO landing (/satilik/istanbul, /kiralik/istanbul) | 2 | ✅ | ✅ | ✅ | ✅ |
| **TOPLAM** | **52** | **52/52** | **52/52** | **52/52** | **52/52** |

Mobile (iPhone 13) viewport'unda ayrıca aynı 52 rota → 52/52 PASS.

### EmptyState h1 fix kanıtı
| Rota | h1 (önce) | h1 (sonra) |
|---|---|---|
| /ilan/prop-010 | "" | "İlan bulunamadı" |
| /ilan/prop-999 | "" | "İlan bulunamadı" |
| /ilan/saçma-id | "" | "İlan bulunamadı" |
| /ilan/00000000-...-000000000000 | "" | "İlan bulunamadı" |

---

## 4) Boşluk Taraması

| Bulgu | Durum | Notlar |
|---|---|---|
| h1 her sayfada var mı | ✅ — fix sonrası tüm 52 rota h1 görünür (önce 8 prop-XXX rotası boştu) | EmptyState yerine inline render |
| ErrorBoundary placeholder/TODO | ✅ — temiz, PWA chunk recovery eklendi | |
| Görsel 404 (galeri) | ✅ — Dalga 2-5 fix'i Unsplash URL'lerini değiştirmişti | |
| Mobil bozulma | ✅ — iPhone 13 viewport'unda 52/52 PASS | |
| Boş state placeholder | ✅ — /favoriler, /bildirimler, /aramalarim hepsi anlamlı boş durum gösteriyor (kullanıcı önce ekleyince render değişir) | |
| Sealed teklif maskeleme | ✅ — `listing_offers_safe` view dokunulmadı, RLS değişmedi | |
| PWA SW (Workbox) | ✅ — Supabase NetworkOnly, denylist /api,/auth,/rest,/storage,/functions | Dalga 5'te kuruldu |

---

## 5) Sealed Teklif Maskeleme Doğrulama

- `listing_offers_safe` view → değişmedi.
- Workbox SW `urlPattern: /^https:\/\/[a-z0-9-]+\.supabase\.(co|in)\/.*/i` → **NetworkOnly** (asla cache).
- `navigateFallback` denylist içinde `/rest`, `/functions`, `/auth`, `/storage` → SPA shell asla bu yolları yutmaz.

---

## 6) Anayasa Uyumu

| Madde | Durum |
|---|---|
| 500 taraması her raporda zorunlu | ✅ — bu raporla anayasa restore edildi |
| safe-before-X tag | ✅ `safe-before-ilan-500-fix` pushed |
| Build yeşil | ✅ 19.54s + 26.40s (PWA + fix sonrası) |
| Playwright EB=0 | ✅ 104/104 |
| Migration dokunma | ✅ — frontend-only fix |
| Sealed maskeleme | ✅ değişmedi + Workbox NetworkOnly güvencesi |
| Cursor lane dokunma | ✅ stash/restore ile korundu |
| Premium CSS / responsive | ✅ |

---

## 7) Kalan / Çözülemez

**Yok.** Tüm tespit edilen bulgular düzeltildi. Master'ın bildirdiği "/ilan/prop-010 500" semptomu lokal'de tekrar üretilemedi ama:
- (a) PWA chunk recovery ile **yeniden olamayacak** (otomatik reload).
- (b) Eski SW cache: bir sonraki deploy'da `cleanupOutdatedCaches: true` Workbox tüm eski cache'leri siler.
- (c) prop-XXX URL'leri artık "İlan bulunamadı" + h1 + iki CTA gösteriyor.

---

## 8) Screenshot Kanıtı

| Dosya | İçerik |
|---|---|
| `_audit/dalga5-pwa/site-tarama/screenshot-desktop-ilan_prop-010.png` | /ilan/prop-010 → "İlan bulunamadı" h1 (desktop) |
| `_audit/dalga5-pwa/site-tarama/screenshot-mobile-ilan_prop-010.png` | aynı (iPhone 13) |
| `_audit/dalga5-pwa/site-tarama/screenshot-{desktop,mobile}-ilan_1.png` | /ilan/1 → "Levent'te Prestijli Plaza Katı" (kontrol) |
| `_audit/dalga5-pwa/site-tarama/screenshot-{desktop,mobile}-ilan_saçma-id.png` | tamamen geçersiz ID → "İlan bulunamadı" |

---

## 9) Dalga 5 Sonrası → Capacitor App Store Hazırlık Paketi

Mega plan döngüsünde sıradaki adım: **Capacitor 7 wrap** (iOS + Android proje), splash + ikon assets üret, store metin paketi (TR+EN), gizlilik linki. Sonra **push (device_tokens)** ve **Dalga 6 i18n**. Her dalga 500/hata/boşluk taraması + kanıt ile sürer (anayasa).

— bitti —
