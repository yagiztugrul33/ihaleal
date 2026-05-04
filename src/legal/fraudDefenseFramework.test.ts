import { describe, expect, it } from "vitest";
import {
  assertFraudDefensePillarsComplete,
  FRAUD_DEFENSE_PRODUCT_RULES,
  FRAUD_LITIGATION_PILLARS,
} from "./fraudDefenseFramework";

describe("fraudDefenseFramework", () => {
  it("passes completeness self-check", () => {
    expect(() => assertFraudDefensePillarsComplete()).not.toThrow();
  });

  it("has ten pillars with controls and threats", () => {
    expect(FRAUD_LITIGATION_PILLARS.length).toBe(10);
    for (const p of FRAUD_LITIGATION_PILLARS) {
      expect(p.threats.length).toBeGreaterThan(0);
      expect(p.controls.length).toBeGreaterThan(0);
      expect(p.legalAnchors.length).toBeGreaterThan(0);
    }
  });

  it("exports product rules for listing policy merge", () => {
    expect(FRAUD_DEFENSE_PRODUCT_RULES.length).toBeGreaterThanOrEqual(5);
  });
});
