import { describe, expect, it } from "vitest";

import { getDefaultCommissionForm, validateCommissionForm } from "../commission.logic";

describe("Commission screen model", () => {
  it("accepts valid preview inputs", () => {
    const error = validateCommissionForm(getDefaultCommissionForm());
    expect(error).toBeNull();
  });

  it("returns validation error for invalid percentage range", () => {
    const error = validateCommissionForm({
      ...getDefaultCommissionForm(),
      agentRatePct: "250",
    });
    expect(error).toBe("B2B oranı %0-100 arasında olmalı.");
  });

  it("returns validation error for empty sale amount", () => {
    const error = validateCommissionForm({
      ...getDefaultCommissionForm(),
      saleAmountTry: "",
    });
    expect(error).toBe("Satış/işlem tutarı 0'dan büyük olmalı.");
  });
});
