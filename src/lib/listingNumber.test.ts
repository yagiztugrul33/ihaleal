import { describe, expect, it } from "vitest";
import { computeListingNumber, getIsoWeekAndYear, getListingNumber } from "./listingNumber";

describe("listingNumber", () => {
  it("is deterministic for same id and endDate", () => {
    expect(computeListingNumber("abc-123", "2026-06-15T12:00:00.000Z")).toBe(
      computeListingNumber("abc-123", "2026-06-15T12:00:00.000Z"),
    );
  });

  it("differs for different ids same week", () => {
    const a = computeListingNumber("id-a", "2026-06-15T12:00:00.000Z");
    const b = computeListingNumber("id-b", "2026-06-15T12:00:00.000Z");
    expect(a).not.toBe(b);
    expect(a.startsWith("ILN-")).toBe(true);
    expect(b.startsWith("ILN-")).toBe(true);
  });

  it("getListingNumber prefers stored listingNumber", () => {
    expect(
      getListingNumber({
        id: "x",
        listingNumber: "ILN-CUSTOM-000001",
        endDate: "2026-01-01T00:00:00.000Z",
      }),
    ).toBe("ILN-CUSTOM-000001");
  });

  it("getIsoWeekAndYear matches known anchor", () => {
    const { weekYear, week } = getIsoWeekAndYear(new Date("2026-01-05T12:00:00.000Z"));
    expect(weekYear).toBe(2026);
    expect(week).toBeGreaterThanOrEqual(1);
    expect(week).toBeLessThanOrEqual(53);
  });
});
