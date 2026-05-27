import { describe, expect, it } from "vitest";

import { getBridgeSignal, getDepremMockRows } from "../model";

describe("deprem module model", () => {
  it("returns bridge signal object", () => {
    const s = getBridgeSignal();
    expect(typeof s.exportCount).toBe("number");
    expect(typeof s.bridgeActive).toBe("boolean");
  });

  it("returns non-empty mock rows", () => {
    const rows = getDepremMockRows();
    expect(rows.length).toBeGreaterThan(0);
  });
});
