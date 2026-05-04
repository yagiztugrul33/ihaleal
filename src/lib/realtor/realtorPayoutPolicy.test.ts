import { describe, expect, it } from "vitest";
import { evaluateRealtorPayoutStub, POLICY_FIRST_CLOSING_AGENT_SHARE_HELD_IN_POOL } from "./realtorPayoutPolicy";

describe("realtorPayoutPolicy", () => {
  it("blocks when risk or documents incomplete", () => {
    const r = evaluateRealtorPayoutStub({
      closingOrdinal: 2,
      deedOrContractVerified: false,
      invoiceMatched: true,
      riskClearance: true,
    });
    expect(r.allowOutboundTransfer).toBe(false);
    expect(r.reasonCodes).toContain("DEED_OR_CONTRACT_UNVERIFIED");
  });

  it("retains first closing when policy on", () => {
    if (!POLICY_FIRST_CLOSING_AGENT_SHARE_HELD_IN_POOL) return;
    const r = evaluateRealtorPayoutStub({
      closingOrdinal: 1,
      deedOrContractVerified: true,
      invoiceMatched: true,
      riskClearance: true,
    });
    expect(r.retainInEscrow).toBe(true);
    expect(r.allowOutboundTransfer).toBe(false);
    expect(r.reasonCodes).toContain("FIRST_CLOSING_HELD_PER_POLICY");
  });

  it("allows subsequent when inputs ok", () => {
    const r = evaluateRealtorPayoutStub({
      closingOrdinal: 2,
      deedOrContractVerified: true,
      invoiceMatched: true,
      riskClearance: true,
    });
    expect(r.allowOutboundTransfer).toBe(true);
    expect(r.retainInEscrow).toBe(false);
  });
});
