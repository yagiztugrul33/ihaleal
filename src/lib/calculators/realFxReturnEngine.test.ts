import { describe, expect, it } from "vitest";
import { calculateRealFxReturn } from "./realFxReturnEngine";

describe("realFxReturnEngine", () => {
  it("matches KFE April 2026 style real return example", () => {
    const result = calculateRealFxReturn({
      initialTry: 1_000_000,
      finalTry: 1_350_000,
      annualInflationPct: 41.1,
      startUsdTry: 32.4,
      endUsdTry: 38.7,
    });
    expect(result.nominalReturnPct).toBe(35);
    expect(result.realReturnPct).toBeCloseTo(-4.32, 2);
  });

  it("produces different outputs for different inflation and fx inputs", () => {
    const a = calculateRealFxReturn({
      initialTry: 2_000_000,
      finalTry: 2_500_000,
      annualInflationPct: 20,
      startUsdTry: 32,
      endUsdTry: 36,
    });
    const b = calculateRealFxReturn({
      initialTry: 2_000_000,
      finalTry: 2_500_000,
      annualInflationPct: 45,
      startUsdTry: 32,
      endUsdTry: 42,
    });
    expect(a.realReturnPct).not.toBe(b.realReturnPct);
    expect(a.usdReturnPct).not.toBe(b.usdReturnPct);
  });
});
