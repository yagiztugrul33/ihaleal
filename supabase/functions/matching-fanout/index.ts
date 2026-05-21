import { preflight, json, fail } from "../_shared/http.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";
import { logger } from "../_shared/logger.ts";
import { env } from "../_shared/env.ts";

const BATCH = 50;

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  const secret = req.headers.get("x-internal-secret");
  if (secret !== env.INTERNAL_CRON_SECRET) return fail(req, 401, "unauthorized");

  const log = logger({ fn: "matching-fanout" });
  const db = supabaseAdmin();

  const { data: listings, error } = await db
    .from("listings")
    .select("id, city, district, seller_id, organization_id, created_at, start_price_try")
    .eq("status", "active")
    .is("matched_at", null)
    .gte("created_at", new Date(Date.now() - 24 * 3600_000).toISOString())
    .limit(BATCH);

  if (error) {
    log.error("listings_query", { err: error.message });
    return fail(req, 500, "db_error");
  }
  if (!listings?.length) return json(req, { ok: true, processed: 0 });

  let total = 0;
  for (const l of listings) {
    try {
      const { data: prefs } = await db
        .from("buyer_preferences")
        .select("*")
        .eq("is_active", true)
        .contains("cities", [l.city])
        .neq("user_id", l.seller_id);

      const matches = (prefs ?? []).filter((p) => {
        const min = p.price_min ?? 0;
        const max = p.price_max ?? Number.POSITIVE_INFINITY;
        return l.start_price_try >= min && l.start_price_try <= max;
      });

      if (!matches.length) {
        await db.from("listings").update({ matched_at: new Date().toISOString() }).eq("id", l.id);
        continue;
      }

      await db.from("listing_matches").upsert(
        matches.map((p) => ({
          listing_id: l.id,
          user_id: p.user_id,
          score: 0.6,
          reason: { city: l.city },
        })),
        { onConflict: "listing_id,user_id" },
      );

      await db.from("notifications").insert(
        matches.flatMap((p) => [
          {
            user_id: p.user_id,
            type: "new_match",
            channel: "in_app",
            payload: { listing_id: l.id },
          },
        ]),
      );

      total += matches.length;
      await db.from("listings").update({ matched_at: new Date().toISOString() }).eq("id", l.id);
    } catch (e) {
      log.error("match_failed", { listing: l.id, err: String(e) });
    }
  }

  return json(req, { ok: true, processed: listings.length, matches: total });
});
