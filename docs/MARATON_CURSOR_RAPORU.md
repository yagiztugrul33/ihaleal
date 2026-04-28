# Maraton — Cursor raporu (X1–X20 turu)

**Tarih:** 2026-04-27  
**Komut:** `docs/KIMI_CURSOR_UZUN_MARATON_KOMUT.md`

## Kanıt: komutlar

- `npm run typecheck` — yeşil  
- `npm run test:run` — yeşil (6 test)  
- `npm run build` — yeşil  

## Tamamlanan X maddeleri

| X | Sonuç | Dosyalar |
|---|--------|----------|
| **X1** | Tamam | `ListingDocumentFooter` eklendi: önceden `Auctions`, `SearchResults`, `EndingSoon`, `MapPage` — bu turda **`Compare`** (seçici), **`CityGuide`** (şehir ilanları), **`Favorites`**. |
| **X2** | Tamam | `AuctionDetail`: fiyat kartlarından hemen sonra `ListingDocumentFooter`; ardından rapor/resmi belge butonları. Genel Bakış’taki uzun taahhüt/ekspertiz kartları bilgi için bırakıldı (çift özet değil: üstte chip, altta detay). |
| **X3** | Tamam | `CreateAuction`: `title` ipucu + kısa görünür açıklama metni; hata mesajı netleştirildi. Radix tooltip **kullanılmadı** (`@radix-ui/react-tooltip` yok — build kırılıyordu). |
| **X4** | Tamam | `fees.ts` → `FEE_TEXTS.commissionMatrahLine`; `AuctionDetail` komisyon kartında gösterim. |
| **X5** | Kısmi | `AuctionDetail` “yalnız vitrin” → “sadece ilan”. `sellerHubData` vitrin **ücret** satırları patron ile hizalandı (ihaleal sütunu: hedef ücretsiz). Hero/BusinessModel’deki “yok” dili patrona uygun bırakıldı. |
| **X6** | Varsayım: yeni sayfa yok | Atlandı. |
| **X7** | Tamam | `SellerHub` üst bilgi kutusu + `/ihale-ac` linki; `sellerHubData` metinleri güncellendi. |
| **X8** | Tamam | `DataStrategy` alt başlıkta ilan detay butonu ile köprü cümlesi. |
| **X9** | Tamam | `userFlows.ts` expertise `hint` ile CreateAuction hizası. |
| **X10** | Doğrulandı | `getAllAuctionsForSearch` + seed alanları; manuel senaryo: liste kartlarında chip’ler. |
| **X11** | Tamam | `ListingDocumentFooter`: `role="region"`, chip’lerde `role="status"` + `aria-label`. |
| **X12** | Tamam | `SOZLESMESONRASI_TEK_KOMUT.md` §0 tablosu ürün karşılığı satırlarıyla dolduruldu. |
| **X13** | Önceki tur | `hukuk/README.md` Downloads yolu mevcut. |
| **X14** | Önceki + bu tur | `EndingSoon` Türkçe/₺; Footer “Satıcı modu”. |
| **X15** | Kontrol | Kullanıcıya dönük “ilan ücreti yok” uyumlu; `sellerHubData` rakip karşılaştırması düzeltildi. |
| **X16** | Tamam | Compare seçicide tam `ListingDocumentFooter` (mini ikon yerine şerit — sığdı). |
| **X17** | Tamam | `README.md` + `KONTROL_KOMUTU.txt` maraton linkleri. |
| **X18** | Tamam | Yeni birim test eklenmedi; mevcut testler yeşil. |
| **X19** | Varsayım | Liste re-render profili: ek ölçüm yapılmadı (kapsam dışı). |
| **X20** | Bu dosya | Güncellendi. |

## Kimi çıktısı (repo dosyası)

- `docs/icerik/maraton-k36-k50.md` — K36–K50 özet metinleri (Kimi yerine Cursor dosyaladı; Kimi ayrıca genişletebilir).

## Bilinçli bırakılan / sonraki tur

- `Compare` sonuç aşaması: kazanan kutusu + tabloda **“Rapor / belge”** satırı eklendi (önceki “yok” notu güncellendi).  
- `npm install @radix-ui/react-tooltip` ile zengin tooltip istenirse ayrı PR.  
- PDF–madde eşlemesi: avukat + kullanıcı PDF kopyası.

## Kimi raporu düzeltmeleri (MASTER — kanıt)

Kimi’nin X tablosundaki bazı maddeler **bu repoyla çelişiyordu**; doğruluk kaynağı dosya yolu + komuttur. Ayrıntı: `docs/KIMI_CURSOR_MASTER_KANITLI_KOMUT.md` **B)** tablosu.

| Kimi iddiası | Repo |
|--------------|------|
| X4 `fees.ts` yok | **Var:** `src/lib/fees.ts` (`FEE_TEXTS.commissionMatrahLine`). |
| X7–X9 repoda yok | **Var:** `src/pages/SellerHub.tsx`, `src/pages/DataStrategy.tsx`, `src/lib/userFlows.ts`. |
| X16 varsayım | Sonuç Compare’da `ListingDocumentFooter` (tablo + kazanan); seçicide de vardı. |

**Tek komut (Kimi + Cursor birlikte):** `docs/KIMI_CURSOR_MASTER_KANITLI_KOMUT.md`
