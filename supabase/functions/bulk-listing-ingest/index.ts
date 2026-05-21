import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { preflight, json, fail, parseBody } from "../_shared/http.ts";
import { getAuthContext } from "../_shared/auth.ts";
import { requireOrg, HttpError } from "../_shared/permissions.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";

const Body = z.object({
  filename: z.string(),
  storage_path: z.string(),
});

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return fail(req, 405, "method_not_allowed");

  try {
    const ctx = await getAuthContext(req);
    if (!ctx) return fail(req, 401, "unauthenticated");
    requireOrg(ctx, ctx.activeOrgId, "manager");

    const body = await parseBody(req, Body);
    const db = supabaseAdmin();

    const { data: job, error } = await db.from("bulk_jobs").insert({
      organization_id: ctx.activeOrgId,
      user_id: ctx.user.id,
      kind: "listing_ingest",
      input: body,
      status: "queued",
    }).select("id").single();

    if (error) throw new HttpError(500, "job_create_failed", error.message);
    return json(req, { ok: true, job_id: job.id, status: "queued" });
  } catch (e) {
    if (e instanceof HttpError) return fail(req, e.status, e.code);
    return fail(req, 500, "internal");
  }
});
