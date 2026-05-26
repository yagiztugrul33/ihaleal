import { describe, expect, it } from "vitest";

import { calculateRealFxReturn } from "../../../../shared/calculators";
import {
  buildRealFxReturnRows,
  computeRealFxReturn,
  getDefaultRealFxReturnForm,
} from "../realFxReturn.logic";

describe("RealFx screen model", () => {
  it("builds expected render rows", () => {
    const result = calculateRealFxReturn({
      initialTry: 1000000,
      finalTry: 1370000,
      annualInflationPct: 41.1,
      startUsdTry: 32.4,
      endUsdTry: 38.7,
    });
    const rows = buildRealFxReturnRows(result);
    expect(rows.map((row) => row.label)).toEqual([
      "Nominal getiri",
      "Reel getiri",
      "USD bazlı getiri",
      "Başlangıç USD karşılığı",
      "Bitiş USD karşılığı",
    ]);
  });

  it("returns validation error on invalid usd rate", () => {
    const bad = computeRealFxReturn({
      ...getDefaultRealFxReturnForm(),
      endUsdTry: "0",
    });
    expect("error" in bad).toBe(true);
  });
});

describe("RealFx parity", () => {
  it("matches shared engine for default form", () => {
    const computed = computeRealFxReturn(getDefaultRealFxReturnForm());
    expect("value" in computed).toBe(true);
    if (!("value" in computed)) return;

    const expected = calculateRealFxReturn({
      initialTry: 1000000,
      finalTry: 1370000,
      annualInflationPct: 41.1,
      startUsdTry: 32.4,
      endUsdTry: 38.7,
    });
    expect(computed.value.realReturnPct).toBe(expected.realReturnPct);
    expect(computed.value.usdReturnPct).toBe(expected.usdReturnPct);
  });

  it("matches shared engine for downside scenario", () => {
    const computed = computeRealFxReturn({
      initialTry: "1.000.000",
      finalTry: "900.000",
      annualInflationPct: "20",
      startUsdTry: "30",
      endUsdTry: "40",
    });
    expect("value" in computed).toBe(true);
    if (!("value" in computed)) return;

    const expected = calculateRealFxReturn({
      initialTry: 1000000,
      finalTry: 900000,
      annualInflationPct: 20,
      startUsdTry: 30,
      endUsdTry: 40,
    });
    expect(computed.value.nominalReturnPct).toBe(expected.nominalReturnPct);
  });
});
