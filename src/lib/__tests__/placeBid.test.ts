import { describe, expect, it } from "vitest";
import { minNextBidTry } from "@/lib/placeBid";
import { MIN_INCREMENT_TRY } from "@/lib/fees";

describe("placeBid helpers", () => {
  it("minNextBidTry adds MIN_INCREMENT_TRY", () => {
    expect(minNextBidTry(1_000_000)).toBe(1_000_000 + MIN_INCREMENT_TRY);
    expect(minNextBidTry(0)).toBe(MIN_INCREMENT_TRY);
  });
});
