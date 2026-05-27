/**
 * mobile/shared — Web src/lib motorlarının mobil köprüsü.
 *
 * Web tarafındaki valuation/borsa/calculators/location motorları burada thin re-export
 * olarak sunulur. Yeniden yazılmaz; mobil ekranlar `@/shared/...` yerine doğrudan
 * `./shared/<module>` ya da bu barrel dosyası üzerinden tüketir.
 *
 * Çekirdek dosyalar (placeBid, payment, fees, escrow, KYC, RLS, taxConfig, preAuthorize)
 * BURADAN ÇAĞRILIR, YENİDEN YAZILMAZ. `bidActions.ts` bunun için thin facade'dir.
 */

export * from './valuation';
export * from './borsa';
export * from './calculators';
export * from './locationIntelligence';
export * from './bidActions';
export * from './buyNow';
export * from './demoMarket';
