import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  mergedFlowPermissions,
  mergedRequirements,
  readUserFlowsFromStorage,
  writeUserFlowsToStorage,
  USER_FLOWS_STORAGE_KEY,
  type UserFlow,
} from "../userFlows";

describe("userFlows", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("mergedRequirements dedupes by id", () => {
    const flows: UserFlow[] = ["browser_only", "listing_only"];
    const docs = mergedRequirements(flows);
    const ids = new Set(docs.map((d) => d.id));
    expect(ids.size).toBe(docs.length);
    expect(docs.some((d) => d.id === "email")).toBe(true);
  });

  it("mergedFlowPermissions OR-combines capabilities", () => {
    const p = mergedFlowPermissions(["listing_only", "auction_seller"]);
    expect(p.canCreateListing).toBe(true);
    expect(p.canOpenAuction).toBe(true);
    expect(p.canBid).toBe(false);
  });

  it("readUserFlowsFromStorage returns [] when missing or invalid", () => {
    expect(readUserFlowsFromStorage()).toEqual([]);
    localStorage.setItem(USER_FLOWS_STORAGE_KEY, "not-json");
    expect(readUserFlowsFromStorage()).toEqual([]);
    localStorage.setItem(USER_FLOWS_STORAGE_KEY, JSON.stringify(["nope"]));
    expect(readUserFlowsFromStorage()).toEqual([]);
  });

  it("writeUserFlowsToStorage persists valid flows", () => {
    const spy = vi.spyOn(window, "dispatchEvent");
    const flows: UserFlow[] = ["browser_only", "auction_bidder"];
    writeUserFlowsToStorage(flows);
    expect(readUserFlowsFromStorage()).toEqual(flows);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
