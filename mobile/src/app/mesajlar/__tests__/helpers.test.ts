import { describe, expect, it } from "vitest";

import { formatConversationDate } from "../helpers";

describe("mesaj helpers", () => {
  it("formats conversation date", () => {
    const out = formatConversationDate("2026-01-02T10:30:00.000Z");
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });
});
