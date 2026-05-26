import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { preflight, fail, json, parseBody } from "../_shared/http.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";

const ScopeSchema = z.enum(["login", "bid", "payment"]);
const BodySchema = z.object({
  scope: ScopeSchema,
  identity: z.string().trim().min(1).max(128),
});

const RULES: Record<z.infer<typeof ScopeSchema>, { capacity: number; refillRate: number }> = {
  login: { capacity: 8, refillRate: 1 / 90 },
  bid: { capacity: 20, refillRate: 1 / 30 },
  payment: { capacity: 8, refillRate: 1 / 120 },
};

function ipFrom(req: Request): string {
  const raw =
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for") ??
    "unknown";
  return raw.split(",")[0]?.trim() || "unknown";
}

function hashIdentity(input: string): Promise<string> {
  return crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(input))
    .then((buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join(""));
}

Deno.serve(async (req) => {
  const optionsResp = preflight(req);
  if (optionsResp) return optionsResp;
  if (req.method !== "POST") return fail(req, 405, "method_not_allowed");

  const csrf = req.headers.get("x-csrf-token")?.trim() ?? "";
  if (csrf.length < 32) return fail(req, 403, "csrf_required");

  let body: z.infer<typeof BodySchema>;
  try {
    body = await parseBody(req, BodySchema);
  } catch (resp) {
    if (resp instanceof Response) return resp;
    return fail(req, 400, "invalid_request");
  }

  const scope = body.scope;
  const ip = ipFrom(req);
  const identityHash = await hashIdentity(body.identity.toLowerCase());
  const key = `guard:${scope}:${ip}:${identityHash}`;
  const rule = RULES[scope];

  const admin = supabaseAdmin();
  const { data, error } = await admin.rpc("rl_consume", {
    p_key: key,
    p_capacity: rule.capacity,
    p_refill_rate: rule.refillRate,
    p_cost: 1,
  });

  if (error) {
    return fail(req, 500, "rate_limit_backend_error");
  }

  const allowed = Boolean(data);
  if (!allowed) {
    return json(
      req,
      { ok: false, error: "rate_limited", retryAfterSec: 60, remaining: 0 },
      { status: 429, headers: { "retry-after": "60" } },
    );
  }

  return json(req, { ok: true, remaining: null });
});

