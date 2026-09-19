import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Canlı doğrulama — yalnız RUN_RLS_INTEGRATION=1 iken çalışır.
 * Gerekli env:
 *   SUPABASE_URL / SUPABASE_ANON_KEY (veya VITE_*)
 *   RLS_SELLER_EMAIL, RLS_SELLER_PASSWORD  — RLS_LISTING_ID ilanının sahibi
 *   RLS_BUYER_EMAIL,  RLS_BUYER_PASSWORD   — o ilanın sahibi olmayan başka kullanıcı
 *   RLS_LISTING_ID                         — status 'active' olan ilan id
 * Test bir sealed teklif oluşturur ve sonunda satıcı hesabıyla 'rejected' yapar
 * (teklif satırı silinemez; test verisi olarak kalır).
 */
const runLive = process.env.RUN_RLS_INTEGRATION === "1";
const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "";
const listingId = process.env.RLS_LISTING_ID ?? "";
const AMOUNT = 123456;

async function login(email: string, password: string): Promise<SupabaseClient> {
  const c = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return c;
}

describe.skipIf(!runLive)("listing_offers amount lockdown (live)", () => {
  let seller: SupabaseClient;
  let buyer: SupabaseClient;
  let offerId = "";

  beforeAll(async () => {
    seller = await login(process.env.RLS_SELLER_EMAIL ?? "", process.env.RLS_SELLER_PASSWORD ?? "");
    buyer = await login(process.env.RLS_BUYER_EMAIL ?? "", process.env.RLS_BUYER_PASSWORD ?? "");
    const { data: u } = await buyer.auth.getUser();
    const sealedUntil = new Date(Date.now() + 24 * 3_600_000).toISOString();
    const { error } = await buyer.from("listing_offers").insert({
      listing_id: listingId,
      buyer_id: u.user!.id,
      amount_try: AMOUNT,
      is_sealed: true,
      sealed_until: sealedUntil,
      status: "pending",
    });
    expect(error).toBeNull();
    const { data } = await buyer
      .from("listing_offers_safe")
      .select("id")
      .eq("listing_id", listingId)
      .eq("amount_try", AMOUNT)
      .limit(1)
      .single();
    offerId = String(data?.id);
    expect(offerId).not.toBe("undefined");
  });

  afterAll(async () => {
    if (offerId) await seller.from("listing_offers").update({ status: "rejected" }).eq("id", offerId);
  });

  it("1a) seller cannot read amount_try from the base table", async () => {
    const { data, error } = await seller.from("listing_offers").select("amount_try").eq("id", offerId);
    expect(error).toBeTruthy();
    expect(data ?? null).toBeNull();
  });

  it("1b) seller cannot read counter_amount_try from the base table", async () => {
    const { error } = await seller.from("listing_offers").select("counter_amount_try").eq("id", offerId);
    expect(error).toBeTruthy();
  });

  it("2) seller gets amount_try = null for a sealed, unexpired offer via listing_offers_safe", async () => {
    const { data, error } = await seller.from("listing_offers_safe").select("id, amount_try, is_sealed").eq("id", offerId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].is_sealed).toBe(true);
    expect(data![0].amount_try).toBeNull();
  });

  it("3) buyer sees own amount_try via listing_offers_safe", async () => {
    const { data, error } = await buyer.from("listing_offers_safe").select("amount_try").eq("id", offerId);
    expect(error).toBeNull();
    expect(Number(data![0].amount_try)).toBe(AMOUNT);
  });

  it("3b) anon cannot read the view", async () => {
    const anon = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data, error } = await anon.from("listing_offers_safe").select("id").eq("id", offerId);
    expect(error || (data ?? []).length === 0).toBeTruthy();
  });

  it("4a) seller cannot PATCH amount_try / is_sealed / buyer_id", async () => {
    for (const patch of [{ amount_try: 1 }, { is_sealed: false }, { buyer_id: "00000000-0000-4000-8000-000000000001" }]) {
      const { error } = await seller.from("listing_offers").update(patch).eq("id", offerId);
      expect(error).toBeTruthy();
    }
    const { data } = await buyer.from("listing_offers_safe").select("amount_try, is_sealed").eq("id", offerId);
    expect(Number(data![0].amount_try)).toBe(AMOUNT);
    expect(data![0].is_sealed).toBe(true);
  });

  it("4b) seller can PATCH status + counter_amount_try", async () => {
    const { error } = await seller
      .from("listing_offers")
      .update({ status: "countered", counter_amount_try: 130000 })
      .eq("id", offerId);
    expect(error).toBeNull();
    const { data } = await seller.from("listing_offers_safe").select("status, counter_amount_try, amount_try").eq("id", offerId);
    expect(data![0].status).toBe("countered");
    expect(Number(data![0].counter_amount_try)).toBe(130000);
    expect(data![0].amount_try).toBeNull();
  });
});
