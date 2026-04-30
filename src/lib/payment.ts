/**
 * Ödeme katmanı — cumartesi yayınında bile gerçek PSP yoksa **mock** kalır.
 * iyzico / PayTR vb. entegrasyonu için bu dosyada `preAuthorize` ve yakalama akışını değiştirin.
 *
 * `import.meta.env.VITE_PAYMENT_MODE` === `"live"` ise (ileride) gerçek sağlayıcı çağrılır;
 * şimdilik tanımlı değil veya `mock` olduğu sürece aşağıdaki simülasyon çalışır.
 */
const PAYMENT_MODE = import.meta.env.VITE_PAYMENT_MODE ?? "mock";

export interface PreAuthRequest {
  amountTRY: number;
  cardToken: string;
  buyerId: string;
  listingId: string;
  context: "bid" | "buy_now";
}

export interface PreAuthResult {
  success: boolean;
  preAuthRef?: string;
  error?: string;
  riskScore?: number;
}

/** Sandbox/mock — `VITE_PAYMENT_MODE=live` + PSP bağlanana kadar üretim ödemesi yok. */
export async function preAuthorize(req: PreAuthRequest): Promise<PreAuthResult> {
  if (PAYMENT_MODE === "live") {
    return {
      success: false,
      error:
        "Canlı ödeme henüz yapılandırılmadı. Yayın öncesi PSP anahtarlarını ekleyin veya geçici olarak VITE_PAYMENT_MODE=mock kullanın.",
    };
  }
  if (req.cardToken === "test-fail") {
    return { success: false, error: "Yetersiz limit" };
  }
  await new Promise((r) => setTimeout(r, 800));
  return {
    success: true,
    preAuthRef: "mock_pre_" + Date.now(),
    riskScore: Math.floor(Math.random() * 30),
  };
}

export async function captureDeposit(preAuthRef: string, amount: number) {
  void amount;
  void preAuthRef;
  return { success: true, captureRef: "mock_cap_" + Date.now() };
}

export async function voidDeposit(preAuthRef: string) {
  void preAuthRef;
  return { success: true, voidRef: "mock_void_" + Date.now() };
}

export async function refundPartial(captureRef: string, amount: number) {
  void captureRef;
  void amount;
  return { success: true, refundRef: "mock_ref_" + Date.now() };
}
