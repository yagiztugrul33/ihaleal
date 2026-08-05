/**
 * Komisyon / KKA havuzu ORAN SABITLERI — bagimlilik yok.
 *
 * Neden ayri dosya: bu iki sabit `commission/engine.ts` icinde tanimliydi; engine
 * ise `zod` ice aktariyor. Yalnizca sabiti okuyan cagri noktalari (ornegin
 * ChatWidget -> masterFinancialEngine) 12.4 KB gzip'lik `vendor-zod` chunk'ini
 * uygulamanin kritik giris yoluna cekiyordu. Sabitler buraya alindi; hesaplama
 * mantigi ve zod semalari engine.ts'te kaldi.
 *
 * TEK KAYNAK: engine.ts ve masterFinancialEngine.ts bu degerleri buradan alir.
 */

/** KDV, komisyon / KKA hizmet havuzu matrahı üzerinden (çıktı satırı). */
export const COMMISSION_POOL_VAT_RATE = 0.2 as const;

/** land_share: rayiç üzerinden toplam hizmet bedeli matrahı (KDV hariç, MASTER_RULES taslak). */
export const LAND_SHARE_TOTAL_EX_VAT_RATE = 0.04 as const;

/** KKA hizmet havuzu orani — `LAND_SHARE_TOTAL_EX_VAT_RATE` ile ayni deger. */
export const KKA_SERVICE_POOL_RATE_EX_VAT = LAND_SHARE_TOTAL_EX_VAT_RATE;

/** KKA hizmet havuzu KDV orani — `COMMISSION_POOL_VAT_RATE` ile ayni deger. */
export const KKA_SERVICE_POOL_VAT_RATE = COMMISSION_POOL_VAT_RATE;
