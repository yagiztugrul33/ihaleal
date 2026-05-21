import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { preflight, parseBody, json, fail } from "../_shared/http.ts";
import { getAuthContext } from "../_shared/auth.ts";
import { withIdempotency, hashRequest } from "../_shared/idempotency.ts";
import { logger } from "../_shared/logger.ts";

const BidSchema = z.object({
  auction_id: z.string().uuid(),
  amount: z.number().positive().max(1_000_000_000),
  max_proxy: z.number().positive().max(1_000_000_000).optional(),
});

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return fail(req, 405, "method_not_allowed");

  const log = logger({ fn: "place-bid" });
  const ctx = await getAuthContext(req);
  if (!ctx) return fail(req, 401, "unauthenticated");

  let body: z.infer<typeof BidSchema>;
  try {
    body = await parseBody(req, BidSchema);
  } catch (resp) {
    return resp as Response;
  }

  const idemKey = req.headers.get("idempotency-key");
  const reqHash = await hashRequest({ ...body, user: ctx.user.id });

  const result = await withIdempotency({
    key: idemKey,
    userId: ctx.user.id,
    endpoint: "place-bid",
    requestHash: reqHash,
    run: async () => {
      const { data, error } = await ctx.client.rpc("place_bid", {
        p_auction_id: body.auction_id,
        p_amount: body.amount,
        p_idempotency_key: idemKey,
      });

      if (error) {
        log.error("rpc_failed", { error: error.message });
        return { status: 500, body: { ok: false, error: "internal" } };
      }

      const row = data as Record<string, unknown> | null;
      const status = String(row?.status ?? "");
      if (status === "error") {
        return {
          status: 422,
          body: { ok: false, error: row?.message ?? "bid_rejected" },
        };
      }

      return {
        status: 200,
        body: {
          ok: true,
          ...row,
          new_current_price: body.amount,
          new_end_at: row?.ends_at ?? row?.new_ends_at,
        },
      };
    },
  });

  return json(req, result.body, {
    status: result.status,
    headers: { "x-idempotent-replay": String(result.replayed) },
  });
});
