import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(rel: string): string {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

describe("fraud surface static audit", () => {
  it("confirms bid core defenses and server-side self-bid hard stop", () => {
    const placeBidSql = read("supabase/migrations/20260430120000_write_policies_and_place_bid_v2.sql");
    expect(placeBidSql).toContain("for update");
    expect(placeBidSql).toContain("Önce teminat yatırmalısınız");
    expect(placeBidSql).toContain("Teklif çok düşük");
    expect(placeBidSql).toContain("anti_sniping_extended");
    expect(placeBidSql).toContain("v_bidder = v_seller_id");
    expect(placeBidSql).toContain("Kendi ilanınıza teklif veremezsiniz");
  });

  it("hardens bid visibility and routes public reads to masked aggregate views", () => {
    const hardeningSql = read("supabase/migrations/20260521221500_harden_bids_visibility_and_public_views.sql");
    expect(hardeningSql).toContain('create policy "bids_select_bidder_or_listing_owner"');
    expect(hardeningSql).toContain("auth.uid() = bidder_id");
    expect(hardeningSql).toContain("l.seller_id = auth.uid()");
    expect(hardeningSql).toContain("auction_bid_public_summary");
    expect(hardeningSql).toContain("auction_bid_public_tape");
  });

  it("captures payment mock-only and no live adapter state", () => {
    const paymentLib = read("src/lib/payment.ts");
    const iyzicoFn = read("supabase/functions/payments-iyzico/index.ts");
    expect(paymentLib).toContain("mock_pre_");
    expect(paymentLib).toContain("Math.random");
    expect(iyzicoFn).toContain("provider_adapter_not_enabled");
  });

  it("captures fake-account attack surface (no captcha gate in app sign-up)", () => {
    const authCtx = read("src/contexts/AuthContext.tsx");
    expect(authCtx.toLowerCase().includes("captcha")).toBe(false);
    expect(authCtx).toContain("supabase.auth.signUp");
  });
});

