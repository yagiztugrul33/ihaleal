/**
 * Edge Function: iyzico payment sandbox adapter (non-live).
 * Secrets: IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { getAuthContext } from "../_shared/auth.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { fail, json, parseBody } from "../_shared/http.ts";
import { hashRequest, withIdempotency } from "../_shared/idempotency.ts";
import { logger } from "../_shared/logger.ts";

const PaymentInitSchema = z.object({
  amount: z.number().positive().max(1_000_000_000),
  currency: z.literal("TRY"),
  transactionRef: z
    .string()
    .min(8)
    .max(128)
    .regex(/^[a-zA-Z0-9:_-]+$/, "transactionRef_invalid"),
  basketRef: z.string().min(1).max(128).optional(),
  buyer: z.object({
    email: z.string().email(),
    fullName: z.string().min(2).max(120),
    gsm: z.string().min(7).max(20).optional(),
    identityNumber: z.string().min(5).max(20).optional(),
  }),
  billingAddress: z
    .object({
      contactName: z.string().min(2).max(120),
      city: z.string().min(2).max(60),
      country: z.string().min(2).max(60),
      address: z.string().min(5).max(500),
      zipCode: z.string().max(20).optional(),
    })
    .optional(),
});

type PaymentInitBody = z.infer<typeof PaymentInitSchema>;

function envOk(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!Deno.env.get("IYZICO_API_KEY")?.trim()) missing.push("IYZICO_API_KEY");
  if (!Deno.env.get("IYZICO_SECRET_KEY")?.trim()) missing.push("IYZICO_SECRET_KEY");
  if (!Deno.env.get("IYZICO_BASE_URL")?.trim()) missing.push("IYZICO_BASE_URL");
  return { ok: missing.length === 0, missing };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions(req);
  }

  const cors = corsHeaders(req);
  const log = logger({ fn: "payments-iyzico" });

  if (req.method === "GET") {
    const e = envOk();
    return json(
      {
        ok: true,
        provider: "iyzico",
        stage: "sandbox_ready_no_capture",
        secrets_configured: e.ok,
        missing_secrets: e.missing,
      },
      { status: 200, headers: cors },
    );
  }

  if (req.method !== "POST") {
    return fail(405, "method_not_allowed", { provider: "iyzico" });
  }

  const auth = await getAuthContext(req);
  if (!auth) {
    return json({ ok: false, error: "unauthenticated" }, { status: 401, headers: cors });
  }

  let body: PaymentInitBody;
  try {
    body = await parseBody(req, PaymentInitSchema);
  } catch (resp) {
    return resp as Response;
  }

  const e = envOk();
  if (!e.ok) {
    return json(
      {
        ok: false,
        error: "secrets_missing",
        provider: "iyzico",
        missing: e.missing,
      },
      { status: 503, headers: cors },
    );
  }

  const idemKey = req.headers.get("idempotency-key") ?? body.transactionRef;
  const requestHash = await hashRequest({
    userId: auth.user.id,
    amount: body.amount,
    currency: body.currency,
    transactionRef: body.transactionRef,
    basketRef: body.basketRef ?? null,
  });

  log.info("payment_init_received", {
    userId: auth.user.id,
    transactionRef: body.transactionRef,
    currency: body.currency,
    amount: body.amount,
  });

  const result = await withIdempotency({
    endpoint: "payments-iyzico:init",
    key: idemKey,
    userId: auth.user.id,
    requestHash,
    run: async () => {
      if (body.amount < 1) {
        return {
          status: 422,
          body: {
            ok: false,
            error: "invalid_amount",
            message: "Amount must be at least 1.",
          },
        };
      }

      // PROVIDER ADAPTER (IYZICO CHECKOUT FORM / 3DS):
      // Add real iyzico HTTP/SDK call here after explicit product approval.
      // The adapter must:
      // 1) Build iyzico auth signature (apiKey + nonce + signature)
      // 2) Send init request to configured IYZICO_BASE_URL endpoint
      // 3) Map provider errors to 422 and success payload to 200
      // 4) Never log or return secret values
      return {
        status: 501,
        body: {
          ok: false,
          error: "provider_adapter_not_enabled",
          provider: "iyzico",
          message: "Sandbox-ready validation passed. Live capture is disabled by guardrail.",
          transactionRef: body.transactionRef,
        },
      };
    },
  });

  if (result.replayed) {
    log.info("payment_init_replayed", {
      userId: auth.user.id,
      transactionRef: body.transactionRef,
    });
  } else {
    log.warn("payment_init_adapter_disabled", {
      userId: auth.user.id,
      transactionRef: body.transactionRef,
    });
  }

  const headers = new Headers(cors);
  if (result.replayed) {
    headers.set("x-idempotency-replayed", "1");
  }
  return json(result.body, { status: result.status, headers });
});
