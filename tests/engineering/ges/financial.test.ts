import { describe, expect, it } from "vitest";
import { irrBisection, lcoe, npv } from "@/lib/engineering/ges/financial";

describe("GES financial", () => {
  it("computes NPV for positive cashflows", () => {
    const flows = Array(10).fill(1_000_000);
    const result = npv(5_000_000, flows, 0.1);
    expect(result).toBeGreaterThan(0);
  });

  it("finds IRR when NPV crosses zero", () => {
    const flows = Array(15).fill(900_000);
    const irr = irrBisection(5_000_000, flows);
    expect(irr).not.toBeNull();
    expect(irr!).toBeGreaterThan(0.05);
    expect(irr!).toBeLessThan(0.25);
  });

  it("computes LCOE from cost and energy PV", () => {
    const energy = Array(25).fill(8_000_000);
    const opex = Array(25).fill(200_000);
    const result = lcoe(50_000_000, opex, energy, 0.08);
    expect(result).toBeGreaterThan(0);
    expect(Number.isFinite(result)).toBe(true);
  });
});