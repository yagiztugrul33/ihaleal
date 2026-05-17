import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const runLive = process.env.RUN_RLS_INTEGRATION === "1";
const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "";

async function signIn(c: SupabaseClient, email: string, password: string) {
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

describe.skipIf(!runLive)("RLS live integration", () => {
  it("anon cannot admin_approve_listing", async () => {
    const anon = createClient(url, anonKey, { auth: { persistSession: false } });
    const { error } = await anon.rpc("admin_approve_listing", {
      p_listing_id: "00000000-0000-4000-8000-000000000001",
    });
    expect(error).toBeTruthy();
  });

  it("non-admin cannot admin_approve_listing", async () => {
    const email = process.env.RLS_TEST_USER_EMAIL ?? "";
    const password = process.env.RLS_TEST_USER_PASSWORD ?? "";
    if (!email || !password) expect.fail("Set RLS_TEST_USER_EMAIL/PASSWORD");
    const client = createClient(url, anonKey, { auth: { persistSession: false } });
    await signIn(client, email, password);
    const { error } = await client.rpc("admin_approve_listing", {
      p_listing_id: "00000000-0000-4000-8000-000000000001",
    });
    expect(error).toBeTruthy();
  });
});