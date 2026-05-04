import { describe, expect, it } from "vitest";
import { minNextBidTry, parsePositiveTryFromInput } from "@/lib/placeBid";
import { MIN_INCREMENT_TRY } from "@/lib/fees";

describe("placeBid helpers", () => {
  it("minNextBidTry adds MIN_INCREMENT_TRY", () => {
    expect(minNextBidTry(1_000_000)).toBe(1_000_000 + MIN_INCREMENT_TRY);
    expect(minNextBidTry(0)).toBe(MIN_INCREMENT_TRY);
  });

  it("parsePositiveTryFromInput accepts digits and TR grouping", () => {
    expect(parsePositiveTryFromInput("3000000")).toBe(3_000_000);
    expect(parsePositiveTryFromInput("3.000.000")).toBe(3_000_000);
    expect(parsePositiveTryFromInput("  1.234.567  ")).toBe(1_234_567);
  });

  it("parsePositiveTryFromInput rejects invalid", () => {
    expect(parsePositiveTryFromInput("")).toBeNull();
    expect(parsePositiveTryFromInput("abc")).toBeNull();
    expect(parsePositiveTryFromInput("0")).toBeNull();
    expect(parsePositiveTryFromInput("-500")).toBeNull();
  });
});
