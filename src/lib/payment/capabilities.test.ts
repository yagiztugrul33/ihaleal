import { describe, expect, it } from "vitest";
import { getPaymentCapabilities, paymentBlockedReason } from "./capabilities";

describe("payment capabilities module", () => {
  it("exports capability helpers", () => {
    const caps = getPaymentCapabilities();
    expect(caps).toHaveProperty("canPreAuthorize");
    expect(caps).toHaveProperty("productionSafe");
    expect(paymentBlockedReason() === null || typeof paymentBlockedReason() === "string").toBe(true);
  });
});