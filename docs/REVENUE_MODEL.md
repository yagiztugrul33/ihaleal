# Gelir modeli (taslak)

**Kaynak kod:** `src/lib/fees.ts` (tek kaynak: oranlar, KDV, iade/ödeme süreleri).

## Komisyon modeli (§D-K1 — kullanıcı onayı bekleniyor)

`COMMISSION_MODEL` sabiti şu an kodda `seller_only` (Cloud önerisi: başlangıç için A). Ürün sahibi **A / B / C** seçimini `CLOUD_CIKTI/AGENT_RAPORU.md` §D-K1’de işaretlediğinde Cursor/Cloud `fees.ts` içindeki değeri netleştirir.

| Seçenek | Özet |
|--------|------|
| **seller_only** | Yalnız satıcıdan komisyon + KDV |
| **buyer_only** | Yalnız alıcıdan komisyon + KDV |
| **both_sides** | Her iki taraftan oranlar (`FEES` içinde ayrı alanlar) |

## Diğer gelir hatları (metin; kod dışı)

- Vitrin / öne çıkarma paketleri (henüz ücret akışı yok).
- B2B / kurumsal satıcı (henüz ücret akışı yok).

## Yasal not (özet)

TKHK ön bilgilendirme: komisyon kalemleri satış/teklif öncesi şeffaf gösterilmeli. Kesin metinler avukat onaylı sözleşmelerde yer almalıdır.
