import { describe, expect, it } from "vitest";

import { getDefaultKkaInput, validateKkaInput } from "../model";

describe("kka preview model", () => {
  it("default input is valid", () => {
    expect(validateKkaInput(getDefaultKkaInput())).toBeNull();
  });

  it("rejects invalid ratio", () => {
    expect(validateKkaInput({ parcelValueTry: "1000", shareRatioPct: "120" })).toBe(
      "Pay oranı %0-100 arasında olmalı.",
    );
  });
});
