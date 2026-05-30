import { describe, expect, it, beforeEach } from "vitest";
import { getPresenceSessionId } from "@/lib/presence/presenceSessionId";

describe("getPresenceSessionId", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("uses user id when logged in", () => {
    expect(getPresenceSessionId("abc-123")).toBe("user_abc-123");
  });

  it("persists anonymous id in session", () => {
    const a = getPresenceSessionId(null);
    const b = getPresenceSessionId(null);
    expect(a).toBe(b);
    expect(a.startsWith("anon_")).toBe(true);
  });
});
