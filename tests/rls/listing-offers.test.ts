import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isOfferAmountVisible } from "@/lib/offers/listingOffers";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260919100000_listing_offers_amount_lockdown.sql"),
  "utf8",
);
const client = readFileSync(join(process.cwd(), "src/lib/offers/listingOffersClient.ts"), "utf8");

describe("listing_offers amount lockdown — migration contract (static)", () => {
  it("removes table-wide SELECT and grants only non-amount columns", () => {
    expect(migration).toMatch(/revoke select on public\.listing_offers from authenticated/i);
    const m = migration.match(/grant select \(([^)]+)\)\s+on public\.listing_offers to authenticated/i);
    expect(m).not.toBeNull();
    const cols = m![1].split(",").map((c) => c.trim());
    expect(cols).not.toContain("amount_try");
    expect(cols).not.toContain("counter_amount_try");
    expect(cols).toEqual(expect.arrayContaining(["id", "listing_id", "buyer_id", "status"]));
  });

  it("limits UPDATE to status + counter_amount_try", () => {
    expect(migration).toMatch(/revoke update on public\.listing_offers from authenticated/i);
    const m = migration.match(/grant update \(([^)]+)\) on public\.listing_offers to authenticated/i);
    expect(m).not.toBeNull();
    expect(m![1].split(",").map((c) => c.trim()).sort()).toEqual(["counter_amount_try", "status"]);
  });

  it("view is not security_invoker and filters rows itself", () => {
    expect(migration).toMatch(/create view public\.listing_offers_safe\s+with \(security_invoker = false\)/i);
    expect(migration).toMatch(/where o\.buyer_id = auth\.uid\(\)/i);
    expect(migration).toMatch(/l\.seller_id = auth\.uid\(\)/i);
  });

  it("masks sealed amount (including null sealed_until) unless viewer is buyer", () => {
    expect(migration).toMatch(/when o\.buyer_id = auth\.uid\(\) then o\.amount_try/i);
    expect(migration).toMatch(/o\.is_sealed = true and \(o\.sealed_until is null or o\.sealed_until > now\(\)\) then null/i);
  });

  it("view is closed to anon/public and open to authenticated", () => {
    expect(migration).toMatch(/revoke all on public\.listing_offers_safe from public, anon/i);
    expect(migration).toMatch(/grant select on public\.listing_offers_safe to authenticated/i);
  });
});

describe("listing offers client — reads go through the safe view", () => {
  it("never selects amount_try from the base table", () => {
    const baseReads = client.match(/\.from\("listing_offers"\)\s*\n?\s*\.select\([^)]*amount_try/g);
    expect(baseReads).toBeNull();
  });

  it("reads all three lists from listing_offers_safe", () => {
    expect(client.match(/\.from\("listing_offers_safe"\)/g)?.length).toBe(3);
  });

  it("keeps hidden amounts null instead of Number(null) = 0", () => {
    expect(client).not.toMatch(/amount_try:\s*Number\(row\.amount_try\)/);
    expect(client.match(/row\.amount_try != null \? Number\(row\.amount_try\) : null/g)?.length).toBe(3);
  });
});

describe("isOfferAmountVisible", () => {
  const future = new Date(Date.now() + 3_600_000).toISOString();
  const past = new Date(Date.now() - 3_600_000).toISOString();
  const base = { buyer_id: "buyer", amount_try: 1000 as number | null };

  it("seller does not see a sealed, not-yet-expired amount", () => {
    expect(isOfferAmountVisible({ ...base, is_sealed: true, sealed_until: future }, "seller", true)).toBe(false);
  });

  it("seller does not see a sealed amount with no sealed_until", () => {
    expect(isOfferAmountVisible({ ...base, is_sealed: true, sealed_until: null }, "seller", true)).toBe(false);
  });

  it("seller sees a sealed amount after sealed_until", () => {
    expect(isOfferAmountVisible({ ...base, is_sealed: true, sealed_until: past }, "seller", true)).toBe(true);
  });

  it("seller sees a non-sealed amount", () => {
    expect(isOfferAmountVisible({ ...base, is_sealed: false, sealed_until: null }, "seller", true)).toBe(true);
  });

  it("buyer always sees own sealed amount", () => {
    expect(isOfferAmountVisible({ ...base, is_sealed: true, sealed_until: future }, "buyer", false)).toBe(true);
  });

  it("a null amount (masked by the API) is never visible, even if not sealed", () => {
    expect(isOfferAmountVisible({ ...base, amount_try: null, is_sealed: false, sealed_until: null }, "seller", true)).toBe(false);
    expect(isOfferAmountVisible({ ...base, amount_try: null, is_sealed: true, sealed_until: past }, "buyer", false)).toBe(false);
  });
});
