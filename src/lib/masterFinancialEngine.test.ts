import { describe, expect, it } from "vitest";
import { COMMISSION_POOL_VAT_RATE, LAND_SHARE_TOTAL_EX_VAT_RATE } from "@/lib/commission/engine";
import { heroRevenueStripLine, KKA_SERVICE_POOL_RATE_EX_VAT, KKA_SERVICE_POOL_VAT_RATE } from "@/lib/masterFinancialEngine";

describe("masterFinancialEngine / hero strip", () => {
  it("re-exports same rates as commission engine", () => {
    expect(KKA_SERVICE_POOL_RATE_EX_VAT).toBe(LAND_SHARE_TOTAL_EX_VAT_RATE);
    expect(KKA_SERVICE_POOL_VAT_RATE).toBe(COMMISSION_POOL_VAT_RATE);
  });

  it("heroRevenueStripLine includes engine-derived pool and VAT percentages", () => {
    const line = heroRevenueStripLine();
    expect(line).toContain("%" + (LAND_SHARE_TOTAL_EX_VAT_RATE * 100).toFixed(0));
    expect(line).toContain("KDV %" + (COMMISSION_POOL_VAT_RATE * 100).toFixed(0));
    expect(line).toMatch(/MASTER_RULES/);
  });
});
