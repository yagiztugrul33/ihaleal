/**
 * Hemen Al — mobil köprü.
 *
 * Çekirdek helper'ı (`src/lib/buyNow.ts`) olduğu gibi re-export eder. Yeniden yazma
 * YOK; istemcide para mantığı YOK. Helper'ın kendisi `execute_buy_now` Postgres
 * RPC'sini sarar; sunucu KYC guard'ı (migration 20260527120000) atlatılamaz.
 */
export { executeBuyNow } from '@web/lib/buyNow';
export type { ExecuteBuyNowParams, ExecuteBuyNowResult } from '@web/lib/buyNow';
