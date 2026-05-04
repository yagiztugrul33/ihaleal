# ihaleal.com agency_contract (draft)

Version v1.0. See repository docs for full legal pack.

## Partner / Net-30 / Rental
- Platform: intermediary (6563 target).
- Commission baseline: one month rent + VAT (policy).
- Net-30 hold for partner payouts after contract signed event.

## Codes
CHK_ARACI_01 CHK_NET30_01 CHK_MASTER_RENTAL_01

Full Turkish counsel review required before production.

## Hemen Al (lansman satilik)

- UI: `AuctionDetail` (legal gate, buy-now pre-auth dialog, final confirm), `BuyNow` (Supabase `execute_buy_now` RPC).
- Metinler: `src/legal/hemenAlLansmanMetinleri.ts`, `MODULE3_HEMEN_AL_ACCEPTANCE` (`masterContractCheckboxTexts.ts`).
- MASAK / AML: `/ihale-kosullari`, `/evraklar`; odeme: PSP + 3DS (taslak).
