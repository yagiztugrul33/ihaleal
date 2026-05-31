# İhaleal Endeks Raporu — Mülk Künye PDF Tamamlama Raporu

**Tarih:** 2026-05-31
**Tag:** `safe-before-endeks-raporu` (baseline, pushed)
**Tetikleyici:** Master vizyonu — mevcut /ilan PDF'i ÇOK SIĞ (konum+fiyat+kategori). ₺142M villa için kabul edilemez. 10 bölümlük kapsamlı mülk künye raporuna dönüştür.

---

## 1) İsim Ayrımı (Karışmasın)

| Sayfa | Rapor | Tetikleyici | Format |
|---|---|---|---|
| `/raporlar` | **Aylık Endeks Raporu** | Bölge/şehir geneli (10 büyük şehir) | Yatay özet PDF (Dalga 3-3'te eklendi) |
| `/ilan/:id` "Endeks Raporu" | **İhaleal Endeks Raporu** | TEK MÜLKE özel künye | 10 bölüm dikey PDF (BU dalga) |

---

## 2) Yapılanlar

### A) Migration `20260606120000_listing_transaction_history.sql`
- Tablo `public.listing_transaction_history` (id, listing_id, transaction_date, transaction_type, price_try, owner_changed, source, notes)
- index `lth_listing_date_idx` (listing_id, transaction_date desc)
- RLS:
  - public SELECT (pazar şeffaflığı — sahip bilgisi yok)
  - anon/authenticated INSERT/UPDATE/DELETE yok (yalnız service_role)
- RPC `get_listing_history(listing_id)` — stable, security invoker, ASC sıralı
- Anayasa: idempotent `if not exists`, mevcut yapıya dokunmuyor, sealed maskeleme bozulmadı

### B) `src/lib/reports/transactionHistory.ts` — fetcher + fallback
- `loadListingHistory(auction)` → DB'den RPC ile çek; boşsa demo
- `generateDemoHistory(auction)` — catalog Auction'dan deterministic 1-3 işlem üretir
  - İlk listeleme (2-5 yıl önce, %60-80 fiyat)
  - Opsiyonel önceki satış (sahip değişikliği)
  - Opsiyonel liste fiyatı güncellemesi
  - Bugünkü mevcut liste
- Yardımcı: `ownershipChanges`, `totalValueChangePct`, `annualizedReturnPct` (CAGR), `amortizationCostTry` (yıllık %2 yıpranma)

### C) `src/lib/reports/endeksRaporu.ts` — 10 bölüm PDF üretici
| # | Bölüm | İçerik kaynağı |
|---|---|---|
| 1 | Mülk Kimliği | Catalog (m², oda, kat, ısıtma, otopark, tapu durumu, açıklama, features) |
| 2 | Mülk Sicili (Geçmiş İşlemler) | `listing_transaction_history` veya demo + CAGR + amortisman |
| 3 | İhale / Fiyat Yapısı | Catalog (start, current, estimated, bidderCount, endDate) |
| 4 | Değerleme Analizi | regionalPriceData + AI tahmin + ilçe emsaller (top 4) |
| 5 | Kredi Uygunluğu | LTV %75 + 120/180 ay taksit hesabı + AI yorum |
| 6 | Deprem / Afet Riski | Bina yaşı + bölge fay + TBDY-2018 + AI değerlendirme |
| 7 | Eğitim Profili | Bölge + AI değerlendirme + MEB/YÖK referans |
| 8 | Güvenlik / Suç | Bölge + AI değerlendirme + EGM referans |
| 9 | Kira Getirisi | regionalPriceData rent + tahmini aylık/yıllık + brüt yıllık getiri + geri ödeme + AI |
| 10 | Çevre / Yaşam + Mahalle | nearbyFacilities + AI mahalle profili |
| + | Genel Özet ve Tavsiye | AI overall (güçlü/zayıf yön + tavsiye) |

- AI bölümleri `invokeSystemQa` ile (ai_qa Edge function); kota/hata fallback metni
- Disclaimer: "Yapay zeka destekli analiz + platform verisi. Resmi ekspertiz, tapu kaydı veya AFAD/TÜİK resmi verisi DEĞİL. TKGM esastır."
- Filename: `ihaleal-endeks-raporu-<id>-<YYYY-MM-DD>.pdf`

### D) `src/pages/AuctionDetail.tsx` — UI integrasyon
- `PdfExportButton` label="Endeks Raporu" → `downloadEndeksRaporu(auction)`
- Mevcut "PDF" (özet) butonun yanına eklendi — bağımsız aksiyon

---

## 3) Anayasa Kanıt

### Build
| Test | Sonuç |
|---|---|
| Build | ✅ 17.82s yeşil — 279 entry precache aynı |
| TypeScript | ✅ pass (yeni 3 dosya tip-güvenli) |

### Tam site tarama (104 rota × 2 viewport)
| Rota | HTTP | EB | PE | EBox | h1 |
|---|---|---|---|---|---|
| /ilan/2 | 200 | 0 | 0 | N | "Bebek'te Boğaz Manzaralı Tarihi Villa" |
| /ilan/4 | 200 | 0 | 0 | N | "Bodrum Yalıkavak'ta Full Deniz" |
| /ilan/prop-010 | 200 | 0 | 0 | N | "İlan bulunamadı" |
| **TOPLAM** | **104/104** | **0** | **0** | **N** | **—** |

### PDF üretim (canlı kanıt)
| İlan | Title | PDF dosyası | Magic | Boyut |
|---|---|---|---|---|
| /ilan/2 | Bebek villa (₺142M) | `ihaleal-endeks-raporu-2-2026-05-31.pdf` | %PDF- ✅ | **213,075 bytes** (208 KB) |
| /ilan/4 | Bodrum rezidans | `ihaleal-endeks-raporu-4-2026-05-31.pdf` | %PDF- ✅ | **213,207 bytes** |

**Kıyas**: önceki basit `downloadListingPdf` ~36 KB (sadece konum+fiyat). Yeni endeks raporu ~213 KB (Roboto TR embed + 10 bölüm dolu içerik + AI metinleri).

### Screenshots
- `_audit/endeks-raporu/screenshot-button-_ilan_2.png` — Endeks Raporu butonu görünür (cyan gradient, top nav)
- `_audit/endeks-raporu/screenshot-button-_ilan_4.png` — aynı, Bodrum rezidans

### Sealed Teklif Maskeleme
- ✅ `listing_offers_safe` view dokunulmadı
- ✅ Yeni tablo `listing_transaction_history` sahip/alıcı bilgisi içermez (tarih + tutar + tip)
- ✅ Workbox SW Supabase NetworkOnly aynı (yeni RPC `get_listing_history` cache değil)

---

## 4) Veri Katmanları (Dürüstlük)

| Katman | Kaynak | Disclaimer |
|---|---|---|
| **GERÇEK (somut)** | catalog Auction + `listing_transaction_history` (gerçek satış) + amortisman hesabı + regionalPriceData + kredi taksit hesabı | "Bu veriler platform kayıtlarından gelir. Tablo boşsa demo işaretiyle deterministic üretim." |
| **AI (zekā)** | `invokeSystemQa` (ai_qa Edge function) — 7 bölüm değerlendirmesi | "Yapay zeka destekli. Resmi değerlendirme değil." |
| **DISCLAIMER** | Her PDF sonunda | "Yapay zeka + platform verisi. Resmi ekspertiz, TKGM tapu kaydı, AFAD risk haritası veya TÜİK/EGM resmi verisi DEĞİL. Yatırım tavsiyesi taşımaz." |

---

## 5) Master Canlı Aktivasyon

1. **Migration push** (Master tarafından):
   ```bash
   npm run supabase:push
   # veya
   supabase db push
   ```
2. **Seed eklemek istenirse** (opsiyonel — şu an demo runtime fallback yeterli):
   ```sql
   insert into listing_transaction_history (listing_id, transaction_date, transaction_type, price_try, owner_changed, source)
   values
     ('1', '2022-01-15', 'listing', 22000000, false, 'platform'),
     ('1', '2023-09-01', 'price_change', 25500000, false, 'platform'),
     ('1', '2024-01-20', 'listing', 28500000, false, 'platform');
   ```
3. **ai_qa Edge function** zaten canlı (önceki dalgalarda deploy edildi). Kota/hata fallback metni güvenli.

---

## 6) Bilinen Sınırlar

| Konu | Durum |
|---|---|
| Kapak görsel + harita inline | Şu an metin tabanlı (görsel ekleme jspdf imaj fonksiyonu ile sonraki mikro-dalga) |
| Gerçek TKGM tapu kaydı | Şu an demo fallback — TKGM entegrasyonu büyük scope |
| AI 600 karakter cap | Cap'i artırmak için sayfa sayısı artar — şu an 10-12 sayfa dengeli |
| /ilan/prop-XXX (catalog dışı) | "İlan bulunamadı" gösterir — endeks raporu butonu da bu durumda gizli olur (auction null → buton render edilmez) |

---

## 7) Sıradaki Anayasa Döngüsü

Brief sırası:
1. ✅ İhaleal Endeks Raporu (bu)
2. ▶ `/abone/onay` + `/abone/iptal` sayfaları (report_subscribers confirmation handler)
3. EN i18n mikro-dalgalar
4. Kalan polish

Her dalga 500/EB/görünürlük taraması + atomic commit + push.

— bitti —
