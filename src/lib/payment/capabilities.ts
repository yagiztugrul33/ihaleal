import { isLivePaymentMode, isMockPaymentMode, isProdBuild } from "../runtimeFlags";

export type PaymentProviderId = "mock" | "unconfigured" | "iyzico" | "paytr";

export type PaymentCapabilities = {
  provider: PaymentProviderId;
  canPreAuthorize: boolean;
  canCapture: boolean;
  productionSafe: boolean;
  mode: "mock" | "live" | "disabled";
};

export function getPaymentCapabilities(): PaymentCapabilities {
  if (isProdBuild && isLivePaymentMode) {
    return {
      provider: "unconfigured",
      canPreAuthorize: false,
      canCapture: false,
      productionSafe: true,
      mode: "live",
    };
  }
  if (isProdBuild && isMockPaymentMode) {
    return {
      provider: "mock",
      canPreAuthorize: false,
      canCapture: false,
      productionSafe: true,
      mode: "mock",
    };
  }
  if (isMockPaymentMode) {
    return {
      provider: "mock",
      canPreAuthorize: true,
      canCapture: true,
      productionSafe: false,
      mode: "mock",
    };
  }
  return {
    provider: "unconfigured",
    canPreAuthorize: false,
    canCapture: false,
    productionSafe: true,
    mode: "disabled",
  };
}

export function paymentBlockedReason(): string | null {
  const caps = getPaymentCapabilities();
  if (!caps.canPreAuthorize) {
    if (isProdBuild && isMockPaymentMode) {
      return "Uretim ortaminda demo odeme devre disi. PSP entegrasyonu tamamlanana kadar islem yapilamaz.";
    }
    if (isProdBuild && isLivePaymentMode) {
      return "Canli odeme henuz yapilandirilmadi.";
    }
  }
  return null;
}