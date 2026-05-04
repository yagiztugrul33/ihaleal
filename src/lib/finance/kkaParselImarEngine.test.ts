import { describe, expect, it } from "vitest";
import { computeKkaBuildingSummary, resolveImarProfile, slugifyTr } from "./kkaParselImarEngine";

describe("kkaParselImarEngine", () => {
  it("slugifyTr normalizes Turkish characters", () => {
    expect(slugifyTr("  Kadıköy ")).toBe("kadikoy");
    expect(slugifyTr("Çankaya")).toBe("cankaya");
  });

  it("resolveImarProfile matches ada parsel demo row", () => {
    const p = resolveImarProfile({ il: "İstanbul", ilce: "Kadıköy", ada: "15", parsel: "200" });
    expect(p.resolutionSource).toBe("ada_parsel_match");
    expect(p.matchedKey).toBe("istanbul|kadikoy|15|200");
    expect(p.emsal).toBeGreaterThan(1);
  });

  it("resolveImarProfile falls back to ilce", () => {
    const p = resolveImarProfile({ il: "istanbul", ilce: "kadikoy", ada: "9", parsel: "9" });
    expect(p.resolutionSource).toBe("ilce_fallback");
    expect(p.matchedKey).toBe("istanbul|kadikoy|*|*");
  });

  it("computeKkaBuildingSummary caps floors and splits owner share", () => {
    const s = computeKkaBuildingSummary({
      il: "istanbul",
      ilce: "kadikoy",
      koy: "",
      mahalle: "",
      ada: "15",
      parsel: "200",
      landAreaM2: 1000,
      ownerShareOfSellable: 0.35,
      assumedNetUnitM2: 100,
    });
    expect(s.grossConstructionRightM2).toBe(1450);
    expect(s.maxFootprintM2).toBeCloseTo(380, 5);
    expect(s.cappedFloorsBuildable).toBeLessThanOrEqual(s.effectiveMaxStoreys);
    expect(s.ownerApproxSellableM2).toBeCloseTo(507.5, 3);
    expect(s.ownerEquivalentUnits).toBeGreaterThan(5);
  });
});
