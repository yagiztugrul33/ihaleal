# AI Engine Servisi

## Amaç
Tapu OCR (optik karakter tanıma), gayrimenkul AI skorlama, fiyat analizi ve yatırım potansiyeli hesaplama servisleri. Backend AI modellerine istemci (client) hazırlık ve sonuç gösteriminden sorumlu.

## İlgili Fasıl
- Fasıl 5 — GPS Adres Önerisi, Tapu OCR, EXIF Şeridi

## Dosya Yapısı

```
ai_engine/
├── README.md
├── index.ts
├── TapuOCRService.ts        # Tapu fotoğrafı yükleme + OCR sonuç işleme
├── AIScoreService.ts        # AI değerlendirme skoru alma + caching
├── PriceAnalysisService.ts  # Fiyat/m² analizi + karşılaştırma
├── OCRImageProcessor.ts     # EXIF şeridi + görüntü optimizasyonu
├── AddressSuggestion.ts     # GPS koordinat → adres önerisi
└── types.ts
```

## Tapu OCR Akışı

```
[Kullanıcı tapu fotoğrafı çeker/seçer]
         |
         v
[EXIF şeridi atılır (GPS, cihaz bilgisi kaldırılır)]
         |
         v
[Görüntü sıkıştırılır (max 2MB, JPEG 85%)]
         |
         v
[POST /api/v2/ai/tapu-ocr multipart/form-data]
         |
         v
[OCR sonuçları + confidence skoru]
         |
         v
[Form alanları otomatik doldurulur]
         |
         v
[Kullanıcı doğrulama + düzeltme]
```

## AI Skor Faktörleri

| Faktör | Ağırlık | Veri Kaynağı |
|--------|---------|--------------|
| Lokasyon | %30 | lat/lng + metro/okul/hastane mesafe |
| Fiyat Doğrusu | %25 | Bölge ortalama fiyat/m² karşılaştırması |
| Yatırım Potansiyeli | %20 | Geçmiş 5 yıl fiyat artış trendi |
| Mülk Durumu | %15 | Bina yaşı, kat, ısıtma, site |
| Pazar Likiditesi | %10 | Ortalama satış süresi, görüntülenme |

## Kritik Kurallar

1. **EXIF Şeridi:** Tapu fotoğraflarında cihaz GPS, çekim tarihi, kamera modeli gibi metadata'lar kesinlikle kaldırılır. Bu hem gizlilik hem güvenlik için zorunludur.
2. **Günlük Limit:** Misafir kullanıcı 50 OCR/gün, üye 200 OCR/gün, emlakçı 500 OCR/gün. Limit aşımında `429` döner.
3. **Confidence Eşiği:** OCR confidence < 0.75 ise manuel review zorunludur. Kullanıcıya "Lütfen bilgileri kontrol edin" uyarısı gösterilir.
4. **Adres Önerisi:** GPS koordinatı alındığında (`expo-location`) en yakın mahalle/sokak önerilir. Kullanıcı onaylamadan adres formuna yazılmaz.

## API Endpoint'leri
- `POST /api/v2/ai/tapu-ocr` (multipart/form-data)
- `GET /api/v2/ai/score/{listingId}`

## Bağımlılıklar
- `core/security` — Cihaz izinleri (kamera, konum)
- `features/kat_karsiligi` — Tapu OCR sonuçları KKA formuna otomatik doldurulur

## Test Senaryoları
1. Net tapu fotoğrafı → OCR confidence > 0.90 → form otomatik doldurulur
2. Blurlu/bozuk fotoğraf → confidence < 0.75 → manuel review modalı
3. EXIF içeren fotoğraf → upload öncesi EXIF şeridi atılır
4. Günlük limit aşımı → 429 + upgrade prompt
