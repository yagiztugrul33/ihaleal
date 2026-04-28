# Geri dönüşüm noktası — 2026-04-27 (saat ~04:37 yerel)

**Amaç:** Maraton öncesi/sonrası dosya seti; kayıp olursa bu listeyle eşleştirin.

## Repo: ihaleal.com — kritik yollar

| Dosya / klasör | Ne içerir |
|----------------|-----------|
| `docs/KIMI_CURSOR_UZUN_MARATON_KOMUT.md` | Kimi + Cursor tek yapıştırma maraton komutu |
| `docs/SOZLESMESONRASI_TEK_KOMUT.md` | Patron §A–§J, K1–K35, C1–C23 |
| `docs/hukuk/YETKI_VE_ARACILIK_TASLAK_CERCEVE.md` | ihaleal orijinal sözleşme iskeleti (telif güvenli) |
| `docs/hukuk/README.md` | Örnek PDF arşiv talimatı |
| `src/components/ListingDocumentFooter.tsx` | İlan kartı altı belge/rapor şeridi |
| `src/pages/AuctionDetail.tsx` | Rapor butonları + diyaloglar |
| `src/pages/CreateAuction.tsx` | Rapor / ekspertiz / taahhüt formları |
| `src/types/auction.ts` | İlan alanları (rapor, ekspertiz, limit) |
| `src/lib/listingPolicy.ts` | Bütünlük özeti metinleri |
| `src/data/auctions.ts` | Demo ilanlar (id 1–3 belge alanları) |

## PDF (RE/MAX örnek tarama)

- Otomatik okuma: taranan PDF’de **metin katmanı çıkmadı** (görüntü tarama). Bu nedenle sözleşme **transkribe edilmedi** (telif + halüsinasyon riski).
- Yerel kopya: `C:\Users\yagiz\Downloads\CamScanner 4-23-26 10.24.pdf` — avukat incelemesi için `docs/hukuk/kaynak/` altına isteğe bağlı kopya.

## Ürün hatırlatması (patron özeti)

- Tek muhatap ihaleal.com; ilanda taraf telefonu yok.
- Üç mod: sadece ilan, teklif al, ihale — satılık + kiralık.
- Piyasa raporu (Endeksa/eşdeğer) + ekspertiz (şerh/ipotek/haciz) + resmi belgeler butonu + taahhüt limitleri + komisyon matrahı; kira: kiraya verenden 1 aylık kira + KDV.
- Gelir: hedef yalnızca başarılı işlem komisyonu; ilan/vitrin/doping satışı yok.

*Bu not maraton başlangıcına denk getirilir; commit alınamadıysa dosyaların yedeğini manuel kopyalayın.*
