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

describe("RLS contract for moderation/events hardening", () => {
  const migration = readFileSync(
    join(migDir, "20260526162000_harden_events_moderation_rls_soft_delete.sql"),
    "utf8"
  );

  it("enables RLS for previously open user-data tables", () => {
    expect(migration).toContain("alter table public.moderation_queue enable row level security");
    expect(migration).toContain("alter table public.events enable row level security");
  });

  it("defines owner/admin policies across CRUD", () => {
    expect(migration).toContain("mq_select_own_or_admin");
    expect(migration).toContain("mq_insert_own");
    expect(migration).toContain("mq_update_own_or_admin");
    expect(migration).toContain("mq_delete_soft_own_or_admin");

    expect(migration).toContain("ev_select_own_or_admin");
    expect(migration).toContain("ev_insert_own");
    expect(migration).toContain("ev_update_own_or_admin");
    expect(migration).toContain("ev_delete_soft_own_or_admin");

    expect(migration).toContain("auth.uid()");
  });

  it("converts delete into audited soft delete", () => {
    expect(migration).toContain("create or replace function public.soft_delete_moderation_queue()");
    expect(migration).toContain("create or replace function public.soft_delete_events()");
    expect(migration).toContain("before delete on public.moderation_queue");
    expect(migration).toContain("before delete on public.events");
    expect(migration).toContain("write_audit_v2");
    expect(migration).toContain("deleted_at");
    expect(migration).toContain("deleted_by");
  });
});

describe("RLS contract for rate limit storage hardening", () => {
  const migration = readFileSync(
    join(migDir, "20260526200500_harden_rate_limit_buckets_rls.sql"),
    "utf8"
  );

  it("enables RLS and restricts direct access to service role", () => {
    expect(migration).toContain("alter table public.rate_limit_buckets enable row level security");
    expect(migration).toContain('create policy "rate_limit_buckets_service_only"');
    expect(migration).toContain("auth.role() = 'service_role'");
  });
});