import { describe, expect, it } from "vitest";
import { mergedFlowPermissions, mergedRequirements, type UserFlow } from "../userFlows";

describe("userFlows", () => {
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
});
