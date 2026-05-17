import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migDir = join(process.cwd(), "supabase/migrations");
const sql = readdirSync(migDir)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(join(migDir, f), "utf8"))
  .join("\n");

describe("RLS policy contract (static)", () => {
  it("defines is_profile_admin helper", () => {
    expect(sql).toContain("is_profile_admin");
  });

  it("defines admin_approve_listing RPC", () => {
    expect(sql).toContain("admin_approve_listing");
  });

  it("grants place_bid to authenticated only", () => {
    expect(sql).toMatch(/grant execute on function public\.place_bid/i);
    expect(sql).toContain("to authenticated");
  });

  it("place_bid rejects unauthenticated callers", () => {
    expect(sql).toMatch(/v_bidder\s+uuid\s*:=\s*auth\.uid\(\)/i);
    expect(sql).toMatch(/if\s+v_bidder\s+is\s+null/i);
  });

  it("defines execute_buy_now for authenticated", () => {
    expect(sql).toContain("execute_buy_now");
    expect(sql).toMatch(/grant execute on function public\.execute_buy_now/i);
  });

  it("enables RLS on core tables", () => {
    for (const table of ["profiles", "listings", "bids"]) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it("listings update limited to owner or admin helper", () => {
    expect(sql).toContain("listings_update_own");
    expect(sql).toMatch(/listings_update_admin|is_profile_admin\(auth\.uid\(\)\)/);
  });
});

describe("Admin attack surface (static expectations)", () => {
  it("admin RPC checks auth uid", () => {
    const adminBlock = readFileSync(
      join(migDir, "20260516120000_admin_listing_security.sql"),
      "utf8"
    );
    expect(adminBlock).toContain("v_uid is null");
    expect(adminBlock).toContain("is_profile_admin");
  });
});