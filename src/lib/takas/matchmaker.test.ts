import { describe, expect, it } from "vitest";
import {
  categoryToTradeListingType,
  checkTradeMatch,
  type TradeMatchListing,
} from "./matchmaker";

const arsaAnkara: TradeMatchListing = {
  type: "REAL_ESTATE",
  wantsTrade: true,
  acceptedTradeTypes: ["REAL_ESTATE", "VEHICLE"],
  acceptsVehicleTrade: true,
  city: "Ankara",
  district: "Cankaya",
  desiredCity: "Ankara",
};

const vehicleAnkara: TradeMatchListing = {
  type: "VEHICLE",
  wantsTrade: true,
  acceptedTradeTypes: ["REAL_ESTATE"],
  acceptsRealEstateTrade: true,
  city: "Ankara",
  desiredCity: "Ankara",
};

describe("checkTradeMatch", () => {
  it("matches when both sides accept each other asset types", () => {
    expect(checkTradeMatch(arsaAnkara, vehicleAnkara)).toBe(true);
  });

  it("fails when one side does not accept the other type", () => {
    const onlyVehicle: TradeMatchListing = {
      type: "VEHICLE",
      acceptedTradeTypes: ["VEHICLE"],
      city: "Izmir",
    };
    expect(checkTradeMatch(arsaAnkara, onlyVehicle)).toBe(false);
  });

  it("maps listing category to trade type", () => {
    expect(categoryToTradeListingType("real_estate")).toBe("REAL_ESTATE");
    expect(categoryToTradeListingType("vehicle")).toBe("VEHICLE");
  });
});
