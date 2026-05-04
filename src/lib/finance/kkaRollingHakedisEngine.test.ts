import { describe, expect, it } from "vitest";
import { buildKkaRollingHakedisRows, formatKkaRollingHakedisContractBlock } from "./kkaRollingHakedisEngine";

describe("kkaRollingHakedisEngine", () => {
  it("rejects invalid tranche counts", () => {
    expect(() => buildKkaRollingHakedisRows(1)).toThrow(RangeError);
    expect(() => buildKkaRollingHakedisRows(25)).toThrow(RangeError);
  });

  it("first tranche pays out only after second approval", () => {
    const rows = buildKkaRollingHakedisRows(4);
    expect(rows[0].trancheIndex).toBe(1);
    expect(rows[0].becomesPayableWhenTr).toContain("Hakedis 2");
    expect(rows[0].retentionUntilTr).toContain("Hakedis 2");
  });

  it("last tranche ties to final acceptance", () => {
    const rows = buildKkaRollingHakedisRows(3);
    const last = rows[rows.length - 1];
    expect(last.trancheIndex).toBe(3);
    expect(last.retentionUntilTr.toLowerCase()).toMatch(/kesin|tapu|son/);
  });

  it("contract block includes tranche count", () => {
    const b = formatKkaRollingHakedisContractBlock(5);
    expect(b).toContain("5 hakedis");
    expect(b).toContain("Hakedis 1:");
  });
});
