import { describe, expect, it } from "vitest";
import { calculateAutomatedOfferAmount } from "@/lib/ibuyer/offerEngine";
import {
  assessLegalRisk,
  calculateLegalRiskScore,
  determineOfferStatus,
} from "@/lib/ibuyer/riskAssessment";
import type { LegalRiskFlags } from "@/lib/ibuyer/types";

const clean: LegalRiskFlags = {
  inheritance: false,
  concordat: false,
  lien: false,
  urban: false,
  arsaPayi: false,
  familySherh: false,
  veraset: false,
  imar: false,
  katMismatch: false,
};

describe("calculateLegalRiskScore", () => {
  it("sums flag weights", () => {
    const { score } = calculateLegalRiskScore({
      ...clean,
      lien: true,
      urban: true,
    });
    expect(score).toBe(40);
  });

  it("caps at sum of all flags", () => {
    const allTrue = Object.fromEntries(
      Object.keys(clean).map((k) => [k, true]),
    ) as LegalRiskFlags;
    const { score } = calculateLegalRiskScore(allTrue);
    expect(score).toBe(215);
  });
});

describe("determineOfferStatus", () => {
  it("rejects when inheritance and concordat", () => {
    expect(
      determineOfferStatus({ ...clean, inheritance: true, concordat: true }, 0),
    ).toBe("REJECTED");
  });

  it("legal review for inheritance only", () => {
    expect(determineOfferStatus({ ...clean, inheritance: true }, 0)).toBe("LEGAL_REVIEW");
  });

  it("rejects at score >= 70", () => {
    expect(determineOfferStatus(clean, 70)).toBe("REJECTED");
  });

  it("legal review at score >= 30", () => {
    expect(determineOfferStatus(clean, 30)).toBe("LEGAL_REVIEW");
  });

  it("offer generated below 30 without inheritance flags", () => {
    expect(determineOfferStatus(clean, 25)).toBe("OFFER_GENERATED");
  });
});

describe("assessLegalRisk + offer engine", () => {
  it("generates offer amount for clean profile", () => {
    const a = assessLegalRisk(clean);
    expect(a.status).toBe("OFFER_GENERATED");
    const offer = calculateAutomatedOfferAmount(1_000_000, a.riskScore);
    expect(offer).toBe(820_000);
  });

  it("reduces offer as risk increases", () => {
    const a = assessLegalRisk({ ...clean, lien: true });
    const offer = calculateAutomatedOfferAmount(1_000_000, a.riskScore);
    expect(offer).toBeLessThan(820_000);
  });
});
