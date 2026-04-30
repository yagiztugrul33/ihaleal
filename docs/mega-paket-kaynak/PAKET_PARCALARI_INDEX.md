# Mega paket — parça ve görev kimlikleri indeksi

Bu tablo, **`ihaleal_paket_01.md` … `ihaleal_paket_10.md`** dosyalarının kapsamını tanımlar. Tam içerik bu dosyalar geldiğinde `docs/mega-paket-kaynak/` altına konur ve uygulama verisi (`src/data/mega/`, e-posta şablonları vb.) ile eşlenir.

| Parça | Dosya | Görev kimlikleri | İçerik özeti |
|--------|--------|------------------|--------------|
| 1 | `ihaleal_paket_01.md` | A_01–A_05 | İhale JSON, Satıcı/Alıcı, SSS, E-posta |
| 2 | `ihaleal_paket_02.md` | A_06–A_10 | Blog, Kampanya, Push, Tooltip, Hata |
| 3 | `ihaleal_paket_03.md` | A_11–A_15 | Yorum, Sözleşme, Sosyal medya, Reels, Yardım |
| 4 | `ihaleal_paket_04.md` | A_16–A_20 | Şehir SEO, Sözlük, Komisyon, Case study, Yatırım |
| 5 | `ihaleal_paket_05.md` | A_21–A_25 | App Store, Basın, Drip e-posta, Banka, Tapu |
| 6 | `ihaleal_paket_06.md` | A_26–A_30 | KYC, İlan, Teklif, Güvenlik, Roadmap |
| 7 | `ihaleal_paket_07.md` | A_31–A_35 | Pitch deck, Finans, Birim ekonomisi, Rekabet, Hukuk |
| 8 | `ihaleal_paket_08.md` | A_36–A_40 **ve** A_41–A_50 | Güvenlik, API, Veri mimarisi, Şehir, Kurallar (+ ek bloklar) |
| 9 | `ihaleal_paket_09.md` | B_01–B_100 | JSON veriler, E-posta, Blog, SSS devamı |
| 10 | `ihaleal_paket_10.md` | B_101–B_500 | Sosyal medya, Test, SEO, Case study, Özet |

## Görev sayıları (özet)

| Aralık | Adet |
|--------|------|
| A_01–A_50 | 50 |
| B_01–B_500 | 500 |
| **Toplam** | **550** görev kimliği (indeks hiyerarşisi; tek tek satır içeriği paket dosyalarında) |

## Repo ile eşleştirme notları

- **A_01–A_05 / İhale JSON:** `src/data/auctions.ts`, `docs/kimi-mega-pack/01-auctions.json`, Supabase şema.
- **SSS:** `src/data/mega/faq.ts` + `#/sss`.
- **E-posta:** `src/emails/*.html`.
- **Blog:** `src/data/mega/blogPosts.ts` + `#/blog`.
- **Komisyon:** `src/lib/fees.ts`, `#/komisyon-hesaplayici`.
- **KYC:** `src/data/mega/kycSimulation.ts`, `#/kyc-simulator`.
- **API / veri:** `docs/API_REFERENCE.md`, `docs/ARCHITECTURE.md`, `docs/PRODUCTION_PLATFORM_MASTER.md`.

Tam metin paketleri gelene kadar iskelet dosyaları aynı klasörde (`ihaleal_paket_*.md`) tutulur.
