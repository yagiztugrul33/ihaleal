import { describe, expect, it } from "vitest";
import { assertRealEstateAtlasComplete, REAL_ESTATE_RISK_ATLAS } from "./realEstateRiskAtlas";

describe("realEstateRiskAtlas", () => {
  it("passes completeness self-check", () => {
    expect(() => assertRealEstateAtlasComplete()).not.toThrow();
  });

  it("has thirteen atlas entries with controls and threats", () => {
    expect(REAL_ESTATE_RISK_ATLAS.length).toBe(13);
    for (const p of REAL_ESTATE_RISK_ATLAS) {
      expect(p.threats.length).toBeGreaterThan(0);
      expect(p.controls.length).toBeGreaterThan(0);
      expect(p.legalAnchors.length).toBeGreaterThan(0);
      expect(p.evidenceArtifacts.length).toBeGreaterThan(0);
    }
  });
});
