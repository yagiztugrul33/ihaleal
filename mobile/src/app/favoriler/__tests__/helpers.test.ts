import { describe, expect, it } from "vitest";

import { formatTl } from "../helpers";

describe("favoriler helpers", () => {
  it("formats TL values", () => {
    expect(formatTl(1250000)).toContain("TL");
  });
});
