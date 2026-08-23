# E-İmza Hukuki Notu (MVP vs Yasal E-İmza)

**Tarih:** 2026-05-30 · **Kapsam:** N23 MVP

## MVP konumlandırma

`SignaturePad` (`src/components/signature/SignaturePad.tsx`) **ön onay / görsel imza** sağlar:

- Canvas üzerinde çizilen imza
- SHA-256 `content_hash` ile bütünlük kaydı (`signatures` tablosu)
- İmzalı PDF indirme (`pdfBuilder.ts`)

Bu MVP **5070 sayılı Elektronik İmza Kanunu kapsamında nitelikli e-imza değildir**.

## Yasal e-imza için gerekenler (Master / avukat kararı)

| Gereksinim | Açıklama |
|------------|----------|
| Nitelikli sertifika | BTK onaylı Elektronik Sertifika Hizmet Sağlayıcısı (ESHS) |
| e-Devlet / mobil imza | GSM operatörü veya e-Devlet mobil imza entegrasyonu |
| KEP | Kayıtlı Elektronik Posta (delil zinciri) |
| Zaman damgası | TSA (Time Stamping Authority) |
| MASAK / sözleşme | Yüksek tutarlı emlak sözleşmelerinde noter / resmi senet |

## CC-apply

- `supabase/migrations/20260603110000_signatures.sql` — RLS: yalnız `signer_id = auth.uid()`

## Sonraki adımlar (ürün kararı)

1. ESHS sağlayıcı seçimi (TurkTrust, E-Güven, vb.)
2. API entegrasyonu + imza doğrulama UI
3. Hukuk metni güncellemesi (`/yasal/*`)
