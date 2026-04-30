# Mega içerik paketi — görev kontrolü (ihaleal_paket_01 … _10)

## Kaynak dosyalar

| Dosya | Durum |
|-------|--------|
| **`docs/mega-paket-kaynak/PAKET_PARCALARI_INDEX.md`** | Parça → görev kimlikleri (**A_01–A_50**, **B_01–B_500**) tek tablo |
| **`docs/mega-paket-kaynak/ihaleal_paket_01.md` … `_10.md`** | İskelet başlıklar (tam metin ana paketten yapıştırılacak) |

Önceki aramalarda tam **500× görev metni** repoda yoktu; indeks ve iskelet artık klasörde tutuluyor.

## Terminoloji uyumu (otomatik kontrol)

| Kural | Durum |
|--------|--------|
| “Standart / vitrin / doping / pro paket” kullanılmaması | Kod ve yeni içerik metinlerinde **yok** |
| “İlan paketi”, “ilan başına ödeme”, “aylık abonelik” | **Kullanılmıyor**; yerine **yıllık üyelik**, **komisyon mahsubu**, **hizmet bedeli** |
| Sahte sertifika / katman güvenlik iddiası | **Eklenmedi**; Hero’da özet rakamlar **tanıtım amaçlı** olarak işaretlendi |

## Uygulanan teslimatlar (repo)

| Öğe | Konum |
|-----|--------|
| Tip arabirimleri | `src/types/megaContent.ts` |
| SSS 40 soru / 5 kategori | `src/data/mega/faq.ts` |
| Blog verisi | `src/data/mega/blogPosts.ts` |
| KYC adım verisi | `src/data/mega/kycSimulation.ts` |
| SSS sayfası | `#/sss` → `src/pages/mega/FrequentQuestions.tsx` |
| Komisyon hesaplayıcı | `#/komisyon-hesaplayici` → `CommissionCalculator.tsx` (`fees.ts` mahsup) |
| Blog liste / detay | `#/blog`, `#/blog/:slug` |
| Emlakçı başvuru formu | `#/emlakci-ortaklik` |
| KYC simülasyonu | `#/kyc-simulator` |
| E-posta HTML | `src/emails/*.html` |
| cURL → doküman | `docs/API_REFERENCE.md` |
| Demo ihale işareti | `Auction.is_demo` — statik katalog varsayılan **demo**; uzak kaynak **false** |

## Olası çelişkiler / eksikler (paket gelene kadar)

1. **`docs/kimi-mega-pack/*.json`** ile yeni TS verileri **birleştirilmedi** — içerik şimdilik tutarlı iş modeli ile yazıldı; paket dosyaları gelince diff alınmalı.
2. **Blog yazı sayısı** — pakette 50+ yazı istenmiş olabilir; şu an **8** örnek var.
3. **E-posta şablonları** — üretim gönderimi için ESP entegrasyonu ve değişken motoru yok.

## Paket dosyalarını ekleme talimatı

1. Ana paketteki tam metni ilgili **`docs/mega-paket-kaynak/ihaleal_paket_XX.md`** dosyasına kopyalayın.  
2. Görev kimlikleri **`PAKET_PARCALARI_INDEX.md`** ile eşleşmelidir.  
3. Ardından `src/data/mega/`, `src/emails/` ve ilgili sayfalar güncellenir.
