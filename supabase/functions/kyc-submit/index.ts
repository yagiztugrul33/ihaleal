import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { preflight, json, fail, parseBody } from "../_shared/http.ts";
import { getAuthContext } from "../_shared/auth.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";
import { logger } from "../_shared/logger.ts";

const Body = z.object({
  subject_type: z.enum(["individual", "organization", "property"]),
  subject_id: z.string().uuid(),
  documents: z.array(z.object({
    kind: z.string(),
    storage_path: z.string(),
  })).min(1).max(10),
  declared_data: z.record(z.any()).optional(),
});

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return fail(req, 405, "method_not_allowed");

  const ctx = await getAuthContext(req);
  if (!ctx) return fail(req, 401, "unauthenticated");

  let body: z.infer<typeof Body>;
  try {
    body = await parseBody(req, Body);
  } catch (resp) {
    return resp as Response;
  }

  if (body.subject_type === "individual" && body.subject_id !== ctx.user.id) {
    return fail(req, 403, "forbidden");
  }

  const db = supabaseAdmin();
  const { data: kyc, error } = await db.from("kyc_verifications").insert({
    subject_type: body.subject_type,
    subject_id: body.subject_id,
    submitted_by: ctx.user.id,
    organization_id: body.subject_type === "organization" ? body.subject_id : ctx.activeOrgId,
    documents: body.documents,
    declared_data: body.declared_data ?? {},
    status: "in_review",
  }).select("id").single();

  if (error) {
    logger({ fn: "kyc-submit" }).error("kyc_insert", { err: error.message });
    return fail(req, 500, "db_error");
  }

  return json(req, { ok: true, kyc_id: kyc.id, status: "in_review" });
});
