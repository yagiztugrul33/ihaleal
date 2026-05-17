/**
 * Build-time / deploy-time flags. VITE_* values are baked into the client bundle.
 */

export const isProdBuild = import.meta.env.PROD;

/** Yerel demo oturumu — yalnızca geliştirme veya açıkça VITE_ALLOW_LOCAL_AUTH=true */
export const localAuthEnabled =
  !isProdBuild || import.meta.env.VITE_ALLOW_LOCAL_AUTH === "true";

export const paymentMode = (import.meta.env.VITE_PAYMENT_MODE ?? "mock").toLowerCase();

export const isLivePaymentMode = paymentMode === "live";

export const isMockPaymentMode = !isLivePaymentMode;