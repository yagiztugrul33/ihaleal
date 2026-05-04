import { describe, expect, it } from "vitest";
import { isUuid } from "./isUuid";

describe("isUuid", () => {
  it("accepts version-4 UUID", () => {
    expect(isUuid("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(true);
  });
  it("rejects demo thread ids", () => {
    expect(isUuid("t1")).toBe(false);
    expect(isUuid("local-123")).toBe(false);
  });
});
