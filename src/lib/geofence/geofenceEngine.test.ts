import { describe, expect, it } from "vitest";
import { findNearbyListings, type GeofenceListing } from "./geofenceEngine";

const BASE: GeofenceListing = {
  id: "l1",
  auctionId: "a1",
  title: "Kadıköy daire",
  lat: 40.9909,
  lng: 29.0303,
  dealType: "rent",
  city: "İstanbul",
  district: "Kadıköy",
};

describe("findNearbyListings", () => {
  it("detects listing within 800m of user", () => {
    const hits = findNearbyListings(40.9915, 29.031, [BASE], { radiusMeters: 800, dealFilter: "all" });
    expect(hits).toHaveLength(1);
  });

  it("filters by deal type", () => {
    const hits = findNearbyListings(40.9915, 29.031, [BASE], { radiusMeters: 800, dealFilter: "sale" });
    expect(hits).toHaveLength(0);
  });

  it("excludes far listings", () => {
    const hits = findNearbyListings(41.05, 29.1, [BASE], { radiusMeters: 500, dealFilter: "all" });
    expect(hits).toHaveLength(0);
  });
});
