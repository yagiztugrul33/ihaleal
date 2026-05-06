import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { clientLogError } from "./clientLog";

describe("clientLogError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not throw for Error instance", () => {
    expect(() => clientLogError("scope", new Error("x"), { k: 1 })).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });

  it("does not throw for string reason", () => {
    expect(() => clientLogError("scope", "oops")).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });
});