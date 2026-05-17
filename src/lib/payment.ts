/**
 * Ödeme katmanı — üretimde mock tahsilat kapalı (capabilities).
 * PSP: iyzico / PayTR Edge Functions + VITE_PAYMENT_MODE=live.
 */
import { getPaymentCapabilities, paymentBlockedReason } from "@/lib/payment/capabilities";

export { getPaymentCapabilities, paymentBlockedReason } from "@/lib/payment/capabilities";

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

/** Sandbox/mock — üretim build'de mock tahsilat çalışmaz (fail-closed). */
export async function preAuthorize(req: PreAuthRequest): Promise<PreAuthResult> {
  const blocked = paymentBlockedReason();
  if (blocked) {
    return { success: false, error: blocked };
  }
  const caps = getPaymentCapabilities();
  if (!caps.canPreAuthorize) {
    return { success: false, error: "Ödeme işlemi bu ortamda kullanılamıyor." };
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
