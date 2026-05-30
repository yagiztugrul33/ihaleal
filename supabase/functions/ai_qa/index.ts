/**
 * Edge: OpenAI ile ihaleal.com bilgi bankasi tabanli soru-cevap.
 *
 * Deploy: `supabase secrets set OPENAI_API_KEY=sk-...` (ve istege bagli OPENAI_MODEL=gpt-4o-mini)
 * sonra `supabase functions deploy ai_qa`
 *
 * `config.toml` verify_jwt=false — uretimde rate limit / WAF veya zorunlu oturum ekleyin.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { IHALEAL_KNOWLEDGE_FOR_LLM } from "../_shared/ihalealKnowledge.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// IP-bazli token bucket (mevcut public.rl_consume kullanir, service_role).
// PUBLIC widget oldugu icin JWT zorunlu DEGIL — UX kirilir. Spam koruma:
//   capacity=20 istek, refill_rate=20/3600 (saatte 20). Patlamasi 502/503 degil 429.
const RL_CAPACITY = 20;
const RL_REFILL_PER_SEC = 20 / 3600;

function extractClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const first = xff.split(",")[0]?.trim();
  if (first) return first;
  return req.headers.get("x-real-ip") ?? "unknown";
}

async function checkRateLimit(ip: string): Promise<{ ok: boolean; reason?: string }> {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  // Rate limit infra yoksa GUVENLI default: izin ver (mevcut davranisi degistirme).
  if (!url || !serviceKey) return { ok: true, reason: "rl_not_configured" };
  try {
    const admin = createClient(url, serviceKey);
    const { data, error } = await admin.rpc("rl_consume", {
      p_key: `ai_qa:ip:${ip}`,
      p_capacity: RL_CAPACITY,
      p_refill_rate: RL_REFILL_PER_SEC,
      p_cost: 1,
    });
    if (error) return { ok: true, reason: "rl_rpc_failed" }; // sertligi UX'i kirma — log ile yetin
    return { ok: data === true };
  } catch {
    return { ok: true, reason: "rl_exception" };
  }
}

const MAX_MSG = 24;
const MAX_USER_CHARS = 4000;

function systemPrompt(): string {
  return [
    "Sen ihaleal.com urun ve is modeli asistanisin.",
    "Tum yanitlari Turkce yaz; net, madde imleri kullanabilirsin.",
    "Yalnizca asagidaki BILGI_BANKASI ile uyumlu bilgi ver; bankada olmayan detay icin tahmin uydurma, kisaca bilgi bankasinda olmadigini soyle.",
    "Hukuki danismanlik veya baglayici vergi/tapu tavsiyesi verme; gerekirse /yasal-cerceve ve uzman yonlendirmesi.",
    "Demo ortam ve rakamlarda fark olabilecegini gerektiginde belirt.",
    "",
    "BILGI_BANKASI:",
    IHALEAL_KNOWLEDGE_FOR_LLM,
  ].join("\n");
}

type ChatMsg = { role: string; content: string };

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

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "openai_not_configured" }), {
      status: 503,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // IP rate limit — public widget icin spam guard (JWT zorunlu degil).
  const ip = extractClientIp(req);
  const rl = await checkRateLimit(ip);
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ error: "rate_limited", retry_after_seconds: 180 }),
      { status: 429, headers: { ...cors, "Content-Type": "application/json", "Retry-After": "180" } },
    );
  }

  let body: { messages?: ChatMsg[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: ChatMsg[] = raw
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_USER_CHARS) }))
    .slice(-MAX_MSG);

  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return new Response(JSON.stringify({ error: "last_message_must_be_user" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";

  const payload = {
    model,
    temperature: 0.35,
    max_tokens: 900,
    messages: [{ role: "system", content: systemPrompt() }, ...messages],
  };

  // OpenAI cagrisi — network/parse exception'lari acik handle (502 yerine kontrollu JSON)
  let r: Response;
  try {
    r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25_000),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ error: "openai_network", detail: msg.slice(0, 300) }),
      { status: 502, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  if (!r.ok) {
    let t = "";
    try {
      t = await r.text();
    } catch {
      /* body read fail — bos birak */
    }
    return new Response(
      JSON.stringify({ error: "openai_http", status: r.status, detail: t.slice(0, 500) }),
      { status: 502, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  let data: { choices?: Array<{ message?: { content?: string } }> };
  try {
    data = (await r.json()) as typeof data;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ error: "openai_parse", detail: msg.slice(0, 300) }),
      { status: 502, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!reply) {
    return new Response(JSON.stringify({ error: "empty_completion" }), {
      status: 502,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
