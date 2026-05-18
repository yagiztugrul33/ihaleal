import { beforeEach, describe, expect, it, vi } from "vitest";

const rpcMock = vi.fn();
const isConfiguredMock = vi.fn(() => true);

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => isConfiguredMock(),
  supabase: {
    rpc: (...args: unknown[]) => rpcMock(...args),
  },
}));

import { submitInstantOffer } from "@/lib/ibuyer/submitInstantOffer";
import type { IBuyerApplicationPayload } from "@/lib/ibuyer/types";

const basePayload: IBuyerApplicationPayload = {
  city: "İstanbul",
  grossM2: 120,
  marketValueTry: 5_000_000,
  legalFlags: {
    inheritance: false,
    concordat: false,
    lien: false,
    urban: false,
    arsaPayi: false,
    familySherh: false,
    veraset: false,
    imar: false,
    katMismatch: false,
  },
};

describe("submitInstantOffer", () => {
  beforeEach(() => {
    rpcMock.mockReset();
    isConfiguredMock.mockReturnValue(true);
  });

  it("throws when Supabase is not configured", async () => {
    isConfiguredMock.mockReturnValue(false);
    await expect(submitInstantOffer(basePayload)).rejects.toThrow(/yapılandırması eksik/i);
  });

  it("returns mapped result on RPC success", async () => {
    rpcMock.mockResolvedValue({
      data: {
        status: "OFFER_GENERATED",
        riskScore: 10,
        riskBreakdown: [],
        submissionId: "sub-1",
        offerRequestId: "off-1",
        offerAmountTry: 4_000_000,
        marketValueTry: 5_000_000,
        expiresAt: "2026-12-31T00:00:00.000Z",
      },
      error: null,
    });

    const result = await submitInstantOffer(basePayload);

    expect(rpcMock).toHaveBeenCalledWith("submit_ibuyer_application", expect.any(Object));
    expect(result.status).toBe("OFFER_GENERATED");
    expect(result.submissionId).toBe("sub-1");
    expect(result.offerAmountTry).toBe(4_000_000);
    expect("demoMode" in result).toBe(false);
  });

  it("throws on RPC error", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: "authentication required" } });

    await expect(submitInstantOffer(basePayload)).rejects.toThrow(/authentication required/i);
  });

  it("throws on empty RPC response", async () => {
    rpcMock.mockResolvedValue({ data: null, error: null });

    await expect(submitInstantOffer(basePayload)).rejects.toThrow(/boş yanıt/i);
  });
});
