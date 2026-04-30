# Kimi — içerik senkron görevleri (ihaleal.com)

Bu liste, **Kimi mega paketi** ile **ürün kodu** (`src/lib/fees.ts`) arasındaki tek doğruluk kaynağını hizalar.

## Mutlak kural — kod ile aynı (TURBO 24H iş modeli)

| Kavram | Değer |
|--------|--------|
| Satıcı işlem komisyon matrahı | Satış/teklif tutarı üzerinden **%4** (+ **KDV %20**, komisyon tutarı üzerinden) |
| Alıcı işlem komisyon matrahı | **%0** (işlem üzerinden); alıcı **yıllık üyelik** ayrı |
| Ortak emlakçı (B2B) | İşlem tutarı üzerinden **%2 + KDV**; ödeme hedefi **7 gün** |
| Üyelik | Satıcı **5.000 TL/yıl**, alıcı **1.000 TL/yıl** (`MEMBERSHIP_FEES`) |
| Hizmet bedelleri | `SERVICE_FEES` — satış öncesi tahsil; **mahsup** satıcı komisyon faturasından |
| Yasaklı eski/tekrar | Rakip sitelerdeki “paket” isimleri ve sabit fiyat örnekleri (patron listesi) metinde kullanılmaz |

## Yapılacaklar (öncelik sırası)

1. **“Alıcıdan işlem komisyonu %2” veya “alıcı %2 + satıcı %2”** ifadelerini kaldır — doğru çerçeve: işlem komisyonu **satıcıdan %4 + KDV**, alıcıdan işlem üzerinden **0**.
2. **“Satıcıdan tek %4”** ifadesi doğru yönde kalır; **“toplam %4 iki taraf”** eski modeldir — güncelle.
3. **Mahsup metni** — Yalnızca **satıcı** tarafında ödenen üyelik + satıcı hizmet bedellerinin komisyon faturasından düşümü.
4. **E-posta şablonları** — Komisyon tablosunda satıcı %4 + KDV; ortak emlakçı B2B %2 + KDV satırı.
5. **Sözleşme taslakları** — Komisyon ve ortaklık maddeleri bu modele göre.
6. **Basın / istatistik** — Ölçülemeyen rakamları “örnek senaryo” veya “hedef” diye etiketle.

## Kod referansı (doğrulama)

- `src/lib/fees.ts` — `SELLER_COMMISSION_RATE`, `REALTOR_B2B_RATE`, `calcCommissionBreakdown`, `calcSellerNet`, `calcBuyerTotal`
- `docs/REVENUE_MODEL.md` — iş modeli özeti

Son güncelleme: TURBO 24H BLOK A (Cursor) ile kod hizası.
