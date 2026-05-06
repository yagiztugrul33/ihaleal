import { describe, expect, it } from "vitest";
import {
  INTEGRITY_RULES_SUMMARY,
  integrityRulesSummaryForAuction,
  resolveIntegrityDealContext,
} from "./listingPolicy";

describe("listingPolicy integrity (sale vs rent vs devren)", () => {
  it("exports sale default summary with SPK and tapu sonrasi wording", () => {
    const text = INTEGRITY_RULES_SUMMARY.join(" ");
    expect(text).toMatch(/SPK/);
    expect(text).toMatch(/tapu sonrası/i);
    expect(text).toMatch(/Lansman ve ön satış/i);
    expect(text).toMatch(/dolandiricilik-savunmasi/);
  });

  it("uses rent trail without tapu sonrasi for Kiralik", () => {
    const lines = integrityRulesSummaryForAuction({
      dealType: "rent",
      category: "Kiralık",
      title: "Deniz manzarali",
    });
    const blob = lines.join(" ");
    expect(blob).toMatch(/1 aylık kira/i);
    expect(blob).not.toMatch(/tapu sonrası/i);
    expect(blob).not.toMatch(/SPK uzmanı/);
    expect(resolveIntegrityDealContext({ dealType: "rent", category: "Kiralık", title: "x" })).toBe("rent");
  });

  it("appends devren line when title or category contains devren on rent", () => {
    const lines = integrityRulesSummaryForAuction({
      dealType: "rent",
      category: "Kiralık",
      title: "Devren restoran",
    });
    expect(resolveIntegrityDealContext({ dealType: "rent", category: "Kiralık", title: "Devren restoran" })).toBe("rent_devren");
    expect(lines.join(" ")).toMatch(/Devren kiralık/i);
    expect(lines.join(" ")).toMatch(/devir/i);
  });

  it("keeps sale trail for satilik even if devren appears in noise", () => {
    expect(
      resolveIntegrityDealContext({
        dealType: "sale",
        category: "Satılık",
        title: "Devren satılık dükkan",
      }),
    ).toBe("sale");
  });
});
