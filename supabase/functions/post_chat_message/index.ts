/**
 * Edge: post_chat_message — JWT ile RPC, uyum skoru, isteğe bağlı compliance_review_queue (service_role).
 * Dağıtım: supabase functions deploy post_chat_message
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";

type KeywordRule = { keyword: string; weight: number };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** ComplianceNlpService DEFAULT_KEYWORD_RULES ile aynı ağırlıklar (senkron tutun). */
const KEYWORD_RULES: KeywordRule[] = [
  { keyword: "düşük göster", weight: 0.95 },
  { keyword: "tapuda şöyle yaz", weight: 0.9 },
  { keyword: "düşük yazalım", weight: 0.92 },
  { keyword: "tapu değeri farklı", weight: 0.85 },
  { keyword: "gerçek fiyat", weight: 0.6 },
  { keyword: "vergiden kaç", weight: 0.88 },
  { keyword: "vergi ödemey", weight: 0.85 },
  { keyword: "kayıt dışı", weight: 0.9 },
  { keyword: "nakit alalım", weight: 0.7 },
  { keyword: "kapora yolla", weight: 0.75 },
  { keyword: "şimdi havale", weight: 0.65 },
  { keyword: "acil ödeme", weight: 0.5 },
  { keyword: "whatsapp", weight: 0.4 },
  { keyword: "telefon ver", weight: 0.45 },
  { keyword: "dışarıda görüş", weight: 0.55 },
  { keyword: "aradan çık", weight: 0.72 },
  { keyword: "aradan cik", weight: 0.72 },
  { keyword: "platformu bypass", weight: 0.68 },
  { keyword: "şahsi iban", weight: 0.7 },
  { keyword: "sahsi iban", weight: 0.7 },
  { keyword: "komisyonsuz kapat", weight: 0.62 },
  { keyword: "bana direkt öde", weight: 0.68 },
  { keyword: "platformu atlayalım", weight: 0.7 },
  { keyword: "disari tasiyalim", weight: 0.55 },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,;:!?()[\]{}'"`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function scoreCompliance(text: string): {
  flaggedKeywords: string[];
  modelScore: number;
  severity: "low" | "medium" | "high";
} {
  const normalized = normalize(text);
  const flagged: string[] = [];
  let totalWeight = 0;
  let maxWeight = 0;
  for (const rule of KEYWORD_RULES) {
    const nk = normalize(rule.keyword);
    if (normalized.includes(nk)) {
      flagged.push(rule.keyword);
      totalWeight += rule.weight;
      if (rule.weight > maxWeight) maxWeight = rule.weight;
    }
  }
  const modelScore = Math.min(1, maxWeight + totalWeight * 0.1);
  let severity: "low" | "medium" | "high" = "low";
  if (modelScore >= 0.85) severity = "high";
  else if (modelScore >= 0.6) severity = "medium";
  return {
    flaggedKeywords: flagged,
    modelScore: Math.round(modelScore * 10000) / 10000,
    severity,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions(req);
  const cors = corsHeaders(req);
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return new Response(JSON.stringify({ ok: false, error: "server_misconfigured" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let body: { thread_id?: string; body?: string; client_msg_id?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const threadId = body.thread_id?.trim();
  const msgBody = body.body?.trim();
  const clientMsgId = body.client_msg_id?.trim() ?? "";
  if (!threadId || !msgBody) {
    return new Response(JSON.stringify({ ok: false, error: "missing_fields" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  if (!UUID_RE.test(threadId)) {
    return new Response(JSON.stringify({ ok: false, error: "invalid_thread_id" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  if (clientMsgId.length > 128) {
    return new Response(JSON.stringify({ ok: false, error: "invalid_client_msg_id" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  if (msgBody.length > 8000) {
    return new Response(JSON.stringify({ ok: false, error: "body_too_long" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const compliance = scoreCompliance(msgBody);

  const { data: messageId, error: rpcErr } = await userClient.rpc("post_chat_message", {
    p_thread_id: threadId,
    p_body: msgBody,
    p_client_msg_id: clientMsgId.length ? clientMsgId : null,
  });

  if (rpcErr) {
    return new Response(
      JSON.stringify({ ok: false, error: "rpc_failed" }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  const mid = messageId as string;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceKey && compliance.flaggedKeywords.length > 0) {
    const admin = createClient(supabaseUrl, serviceKey);
    const { error: qErr } = await admin.from("compliance_review_queue").insert({
      message_id: mid,
      severity: compliance.severity,
      flagged_keywords: compliance.flaggedKeywords,
      model_score: compliance.modelScore,
      status: "open",
    });
    if (qErr) console.error("[post_chat_message] queue:", qErr.message);
  }

  return new Response(
    JSON.stringify({
      ok: true,
      messageId: mid,
      compliance: {
        flaggedKeywords: compliance.flaggedKeywords,
        severity: compliance.severity,
        modelScore: compliance.modelScore,
      },
    }),
    { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
  );
});
