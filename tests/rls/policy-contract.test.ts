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

  it("hardens bid read scope and exposes only public aggregate views", () => {
    const hardening = readFileSync(
      join(migDir, "20260521221500_harden_bids_visibility_and_public_views.sql"),
      "utf8"
    );
    expect(hardening).toContain('create policy "bids_select_bidder_or_listing_owner"');
    expect(hardening).toContain("auth.uid() = bidder_id");
    expect(hardening).toContain("l.seller_id = auth.uid()");
    expect(hardening).toContain("auction_bid_public_summary");
    expect(hardening).toContain("auction_bid_public_tape");
    expect(hardening).toContain("grant select on public.auction_bid_public_summary to anon, authenticated");
    expect(hardening).toContain("grant select on public.auction_bid_public_tape to anon, authenticated");
  });

  it("place_bid enforces server-side self-bid rejection", () => {
    const placeBid = readFileSync(
      join(migDir, "20260430120000_write_policies_and_place_bid_v2.sql"),
      "utf8"
    );
    expect(placeBid).toContain("v_seller_id");
    expect(placeBid).toContain("v_bidder = v_seller_id");
    expect(placeBid).toContain("Kendi ilanınıza teklif veremezsiniz");
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