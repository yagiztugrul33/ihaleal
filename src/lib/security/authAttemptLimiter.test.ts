import { beforeEach, describe, expect, it } from "vitest";
import { getAuthBlockRemainingMs, markAuthAttempt } from "@/lib/security/authAttemptLimiter";

describe("authAttemptLimiter", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("blocks after repeated failed attempts", () => {
    const identity = "user@example.com";
    for (let i = 0; i < 8; i += 1) {
      markAuthAttempt("signin", identity, false);
    }
    const remaining = getAuthBlockRemainingMs("signin", identity);
    expect(remaining).toBeGreaterThan(0);
  });

  it("clears block state on success", () => {
    const identity = "user@example.com";
    for (let i = 0; i < 8; i += 1) {
      markAuthAttempt("signin", identity, false);
    }
    markAuthAttempt("signin", identity, true);
    const remaining = getAuthBlockRemainingMs("signin", identity);
    expect(remaining).toBe(0);
  });
});

