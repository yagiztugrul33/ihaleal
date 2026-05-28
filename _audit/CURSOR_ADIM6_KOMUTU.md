# CURSOR ADIM 6a KOMUTU (K-M1 / K-M2 / O-M1 / O-M2)

Aşağıdaki metni Cursor'a tek parça olarak yapıştır:

```text
═══ CURSOR — ihaleal-mobile (feat/mobile-calculators). ADIM 6a TEK TUR DÜZELTME. Çekirdek/supabase/web'e dokunma. Push YOK. ═══

ÖNEMLİ KAPSAM:
- Sadece mobile/src/app/** içinde ve bu adım için zorunlu model dosyalarında çalış.
- DOKUNMA: mobile/shared/**, src/** (web), supabase/**.
- K-M3 (mock→gerçek Supabase fetch) BU TURDA YOK. Mock veri kalacak.
- Sürpriz/risk çıkarsa DUR, raporla.

DÜZELTME 1 (K-M1) — listingId alanı modelde zorunlu:
1) mobile/src/app/ihale/viewModel.ts
   - AuctionDetailViewModel tipine listingId: string ekle.
   - toAuctionDetailViewModel dönüşünde listingId alanını doldur.
2) mobile/src/app/ihaleler/data.ts
   - MOCK_AUCTIONS her satıra listingId alanı ekle.
   - Mock için id ile aynı olabilir veya ayrı mock UUID olabilir (kararı sen ver).
   - Not: production'da farklı olacağı için bu adım sadece model-semantic düzeltme.

DÜZELTME 2 (K-M2) — teklif/hemen-al semantic tutarlılık:
1) mobile/src/app/ihale/[id]/hemen-al.tsx
   - URL parametresi const { id: auctionId } olacak (id route paramı auction id semantiğiyle kullanılacak).
   - registerBidDeposit çağrısı:
     - listingId: auction.listingId
     - auctionId: auctionId
2) mobile/src/app/ihale/[id]/teklif.tsx
   - Aynı semantic:
     - listingId: auction.listingId
     - auctionId: auctionId
   - İki ekran tam aynı modeli kullanmalı.

DÜZELTME 3 (O-M1) — hemen-al başarı bildirim parity:
1) mobile/src/app/ihale/[id]/hemen-al.tsx
   - executeBuyNow sonucunda status === "ok" bloğuna başarı bildirimi ekle:
     - dispatchTransactionNotifications("Hemen Al", buyResult.amountTry) parity hedefi.
   - Helper mobilde yoksa:
     - mobile tarafına uygun küçük/temiz bir çözüm uygula (inline veya mevcut mobile yardımcı pattern).
   - Referans davranış: web AuctionDetail.tsx civarı başarı bildirim akışı.

DÜZELTME 4 (O-M2) — teklif.tsx eksik case'ler:
1) mobile/src/app/ihale/[id]/teklif.tsx
   - submitBid sonuç switch'ine özel case olarak ekle:
     - listing_not_found
     - config_missing
     - rpc_error
   - Her biri için ayrı, anlamlı kullanıcı mesajı + uygun action (gerekirse geri dön/tekrar dene).
   - Bu 3 durum default'a düşmemeli.

KALİTE KAPISI (zorunlu):
1) mobile/ içinde: npx tsc --noEmit
2) mobile/ içinde: npm run lint
3) mobile/ içinde: npx expo export --platform web
Hepsi PASS olacak. Fail olursa düzelt, tekrar çalıştır.

COMMIT:
- Mantıklı commit stratejisi seç (tek commit veya ikili).
- Commit mesajı net olsun; push yapma.
- Sonunda git status temiz olmalı (geçici artefakt bırakma).

RAPOR (tek kapsamlı):
- Her düzeltme için dosya:satır + önce/sonra ne değişti
- listingId akışı artık doğru mu (teklif + hemen-al aynı semantic) net teyit
- tsc/lint/expo export sonuçları
- commit hash(ler)i
- working tree temiz mi
- sürpriz/risk çıktı mı
```
