# Finans, vergi uyumu ve faturalama cekirdek kurallari (TASLAK)

**Durum:** Urun gereksinim taslagi - avukat ve YMM onayi zorunludur.

## Ozet
- Fatura satir aciklamalari sirket politikasinda; `InvoiceComposer` yasakli kelime ve proje kodu kontrolu saglar.
- KDV / Kurumlar vergisi istisnasi bayraklari yalnizca resmi uygunlukla acilir.
- Takasbank mutabakati: `TakasbankReconciliationService`.
- Vergi simulasyonu: bilgilendirme; resmi hesap YMM + tapu sicil.

Kod: `src/lib/finance/InvoiceComposer.ts`, `TakasbankReconciliationService.ts`, `billingConfig.ts`.
