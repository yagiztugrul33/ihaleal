# KIMI MEGA paket — durum

Bu klasör, 30 görevlik paketin **dosyaya taşınabilen** kısmını içerir.

## Tamamlanan dosyalar (sayısal kontrol)

| Dosya | Görev | Kayıt / madde |
|-------|--------|----------------|
| 01-auctions.json | 1 | 24 ihale |
| 02-sellers.json | 2 (**A_02**) | 50 satıcı — **iş modeli v2026** (yıllık satıcı üyeliği 5.000 TL, sınırsız ilan; %2+%2 komisyon özeti; eski paket yok) |
| 03-buyers.json | 3 (**A_03**) | 80 alıcı — **iş modeli v2026** (yıllık alıcı üyeliği 1.000 TL, teklif yetkisi; eski paket modeli yok) |
| 04-faq.md | 4 | 40 soru-cevap |
| 08-push-notifications.json | 8 | 30 push |
| 09-tooltips.json | 9 | 40 tooltip |
| 10-errors.json | 10 | 50 hata |
| 11-testimonials.json | 11 | 50 yorum |
| 17-glossary.md | 17 | 60 terim |

## İş modeli notu (2026)

**A_02 / A_03** kayıtları "business_model_version": "2026_membership_commission" ile işaretlenir. Satıcı tarafında **yıllık üyelik (5.000 TL, sınırsız ilan)** + komisyon; alıcıda **yıllık üyelik (1.000 TL)** ile teklif yetkisi varsayımı demo metindedir. Eski **Standart/Vitrin/Doping/Pro** ve **99/299/799/2299 TL** paket modeli bu dosyalarda kullanılmaz.

## Tek mesajda üretilemeyen görevler (açık itiraf)

Aşağıdakiler toplam **~50.000+ kelime** ve çoklu HTML uzunluğu gerektirir; tek sohbet çıktısı ve makul token sınırı içinde **eksiksiz ve kalite kontrollü** teslim edilemez. Devam için görev numarasıyla ayrı turlar veya dosya başına bir tur önerilir:

- 5 (12 e-posta × HTML+text)
- 6 (8 × 1000–1500 kelime)
- 7, 12–16, 18–30 (uzun metin, çoklu seri, mağaza metinleri, rehberler)

## Repo içi yol (Cursor’da aç)

`ihaleal.com/docs/kimi-mega-pack/`

Üretim scripti (yeniden çalıştırma): `node scripts/_generate_kimi_mega_pack.mjs`
