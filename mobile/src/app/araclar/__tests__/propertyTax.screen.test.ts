import { describe, expect, it } from "vitest";

import { calculatePropertyTax } from "../../../../shared/calculators";
import {
  buildPropertyTaxSummaryRows,
  computePropertyTax,
  getDefaultPropertyTaxForm,
} from "../propertyTax.logic";

describe("Property tax screen model", () => {
  it("builds expected summary row labels for rendering", () => {
    const result = calculatePropertyTax({
      purchasePriceTry: 1_200_000,
      salePriceTry: 2_800_000,
      holdingYears: 3,
      officialAssessmentTry2026: 2_700_000,
      revolvingFundCoefficient: 1,
      isUrbanTransformationExempt6306: false,
    });
    const rows = buildPropertyTaxSummaryRows(result);
    expect(rows.map((row) => row.label)).toEqual([
      "Tapu harcı toplam",
      "Döner sermaye",
      "Toplam tapu maliyeti",
      "Değer artış vergisi",
    ]);
  });

  it("returns validation error for invalid holding years", () => {
    const bad = computePropertyTax({
      ...getDefaultPropertyTaxForm(),
      holdingYears: "-3",
    });
    expect("error" in bad).toBe(true);
  });
});

describe("Property tax calculator parity", () => {
  it("matches shared motor for default form", () => {
    const computed = computePropertyTax(getDefaultPropertyTaxForm());
    expect("value" in computed).toBe(true);
    if (!("value" in computed)) return;

    const expected = calculatePropertyTax({
      purchasePriceTry: 1_200_000,
      salePriceTry: 2_800_000,
      holdingYears: 3,
      officialAssessmentTry2026: 2_700_000,
      revolvingFundCoefficient: 1,
      isUrbanTransformationExempt6306: false,
    });

    expect(computed.value.totalTitleDeedCostTry).toBe(expected.totalTitleDeedCostTry);
    expect(computed.value.capitalGainTaxTry).toBe(expected.capitalGainTaxTry);
  });

  it("matches shared motor for 6306 exempt scenario", () => {
    const computed = computePropertyTax({
      ...getDefaultPropertyTaxForm(),
      isUrbanTransformationExempt6306: true,
      holdingYears: "6",
    });
    expect("value" in computed).toBe(true);
    if (!("value" in computed)) return;

    const expected = calculatePropertyTax({
      purchasePriceTry: 1_200_000,
      salePriceTry: 2_800_000,
      holdingYears: 6,
      officialAssessmentTry2026: 2_700_000,
      revolvingFundCoefficient: 1,
      isUrbanTransformationExempt6306: true,
    });
    expect(computed.value.deedDutyTotalTry).toBe(expected.deedDutyTotalTry);
    expect(computed.value.capitalGainTaxTry).toBe(expected.capitalGainTaxTry);
  });
});
