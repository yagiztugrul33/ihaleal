import { describe, expect, it } from "vitest";
import { isMockPaymentMode, localAuthEnabled } from "../runtimeFlags";

describe("runtimeFlags", () => {
  it("localAuthEnabled is boolean", () => {
    expect(typeof localAuthEnabled).toBe("boolean");
  });

  it("payment mode defaults to mock in test env", () => {
    expect(isMockPaymentMode).toBe(true);
  });
});