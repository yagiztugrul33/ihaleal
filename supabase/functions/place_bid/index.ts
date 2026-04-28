/**
 * Edge Function: teklif (tur #5 şablon).
 * Sırlar: Supabase Dashboard → Edge Functions secrets (SUPABASE_URL, SUPABASE_ANON_KEY).
 * service_role bu dosyada kullanılmaz; istek JWT + anon istemci + RPC place_bid.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return new Response(JSON.stringify({ error: "server_misconfigured" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let body: { auction_id?: string; amount?: number; idempotency_key?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const auctionId = body.auction_id;
  const amount = body.amount;
  const idempotencyKey = body.idempotency_key;
  if (!auctionId || typeof amount !== "number" || !idempotencyKey) {
    return new Response(JSON.stringify({ error: "missing_fields" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { data: profile, error: profErr } = await userClient
    .from("profiles")
    .select("findeks_score")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profErr || profile == null) {
    return new Response(JSON.stringify({ error: "profile_missing" }), {
      status: 403,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const score = profile.findeks_score ?? 0;
  if (score < 700) {
    return new Response(JSON.stringify({ error: "findeks_below_700", score }), {
      status: 403,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { data: rpcData, error: rpcErr } = await userClient.rpc("place_bid", {
    p_auction_id: auctionId,
    p_amount: amount,
    p_idempotency_key: idempotencyKey,
  });

  if (rpcErr) {
    return new Response(JSON.stringify({ error: rpcErr.message }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, result: rpcData }), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
