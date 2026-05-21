import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(rel: string): string {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

describe("fraud surface static audit", () => {
  it("confirms bid core defenses and missing self-bid hard stop", () => {
    const placeBidSql = read("supabase/migrations/20260430120000_write_policies_and_place_bid_v2.sql");
    expect(placeBidSql).toContain("for update");
    expect(placeBidSql).toContain("Önce teminat yatırmalısınız");
    expect(placeBidSql).toContain("Teklif çok düşük");
    expect(placeBidSql).toContain("anti_sniping_extended");
    // Shill-bidding server-side hard stop should compare bidder and seller.
    expect(placeBidSql.includes("v_bidder = v_seller")).toBe(false);
  });

  it("detects public bid read policy risk", () => {
    const rlsSql = read("supabase/migrations/20260428120100_rls_policies.sql");
    expect(rlsSql).toContain('create policy "bids_select_public"');
    expect(rlsSql).toContain("for select using (true)");
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

