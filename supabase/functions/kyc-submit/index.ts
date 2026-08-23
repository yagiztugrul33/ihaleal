/**
 * kyc-submit Edge Function.
 *
 * Akış:
 *   1. Auth + zod doğrulaması, kyc_verifications tablosuna 'in_review' kaydı.
 *   2. KYC_PROVIDER_API_URL/KEY tanımlıysa (TODO(anahtar) — .env.example'a bakın):
 *      üçüncü parti doğrulama sağlayıcısına bir doğrulama isteği açılır, dönen
 *      sağlayıcı referansı kyc_verifications.provider/provider_ref'e yazılır.
 *      Sağlayıcı yoksa (varsayılan, mevcut davranış) kayıt 'in_review'de kalır —
 *      manuel inceleme kuyruğu önceki gibi çalışmaya devam eder.
 *   3. Sağlayıcının asenkron webhook sonucu action=provider_callback ile aynı
 *      fonksiyona POST edilir, hash/imza doğrulaması TODO(anahtar) sağlayıcı
 *      seçilince eklenir (şimdilik service_role Authorization header'ı ile
 *      korunur — bkz. handleProviderCallback).
 *
 * NOT: Hangi sağlayıcının (Sumsub/Onfido/Veriff/yerel eIDV vb.) kullanılacağı
 * henüz seçilmedi. Bu dosya PROVIDER-AGNOSTIC bir dispatch iskeleti sunar:
 * gerçek sağlayıcı seçilince `callVerificationProvider` fonksiyonu o
 * sağlayıcının REST şemasına göre güncellenmeli (istek gövdesi, dönen alan
 * adları ve belgelerin sağlayıcıya nasıl iletileceği — imzalı URL mi, dosya
 * proxy mi — sağlayıcıya özgüdür ve dokümantasyonuna göre netleştirilmelidir).
 * Bu oturumda gerçek bir sağlayıcıya karşı test EDİLEMEDİ (ağ erişimi kısıtlı
 * ve seçilmiş bir sağlayıcı yok) — sadece "sağlayıcı yok" (mevcut, varsayılan)
 * yolu doğrulandı.
 */
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

const CallbackBody = z.object({
  action: z.literal("provider_callback"),
  provider_ref: z.string(),
  verdict: z.enum(["approved", "rejected", "review_required"]),
  reason: z.string().optional(),
});

type KycDocument = z.infer<typeof Body>["documents"][number];

function providerEnvOk(): { ok: boolean; url: string | null; key: string | null } {
  const url = Deno.env.get("KYC_PROVIDER_API_URL")?.trim() || null;
  const key = Deno.env.get("KYC_PROVIDER_API_KEY")?.trim() || null;
  return { ok: !!(url && key), url, key };
}

/**
 * Seçilen sağlayıcının doğrulama başlatma isteği. Sağlayıcı seçilene kadar
 * bu, jenerik bir REST çağrısıdır (çoğu eKYC sağlayıcısı benzer bir "applicant
 * oluştur + belge referansı ekle" akışı kullanır) — TODO(anahtar): gerçek
 * sağlayıcı dokümantasyonuna göre istek/yanıt şeması güncellenmeli.
 */
async function callVerificationProvider(
  url: string,
  apiKey: string,
  payload: {
    kyc_id: string;
    subject_type: string;
    subject_id: string;
    documents: KycDocument[];
    declared_data: Record<string, unknown>;
  },
): Promise<{ ok: boolean; provider_ref?: string; verdict?: string; error?: string }> {
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      return { ok: false, error: `provider_http_${resp.status}` };
    }
    const data = await resp.json();
    return {
      ok: true,
      provider_ref: typeof data.reference_id === "string" ? data.reference_id : undefined,
      verdict: typeof data.verdict === "string" ? data.verdict : undefined,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Sağlayıcının asenkron webhook sonucu — servis rolü header'ı ile korunur. */
async function handleProviderCallback(req: Request): Promise<Response> {
  // TODO(anahtar): Sağlayıcı seçilince burada gerçek imza/hash doğrulaması
  // eklenmeli (çoğu sağlayıcı bir HMAC imzalı webhook secret kullanır).
  // Şimdilik yalnızca service_role Authorization header'ı zorunlu tutuluyor.
  const auth = req.headers.get("Authorization") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!serviceKey || auth !== `Bearer ${serviceKey}`) {
    return fail(401, "unauthorized");
  }

  let body: z.infer<typeof CallbackBody>;
  try {
    body = await parseBody(req, CallbackBody);
  } catch (resp) {
    return resp as Response;
  }

  const db = supabaseAdmin();
  const status = body.verdict === "approved" ? "approved" : body.verdict === "rejected" ? "rejected" : "in_review";

  const { data: updated, error } = await db
    .from("kyc_verifications")
    .update({ status, verdict: body.verdict, verdict_reason: body.reason ?? null })
    .eq("provider_ref", body.provider_ref)
    .select("id")
    .maybeSingle();

  if (error) {
    logger({ fn: "kyc-submit", action: "provider_callback" }).error("update_failed", { err: error.message });
    return fail(500, "db_error");
  }
  if (!updated) {
    return fail(404, "unknown_provider_ref");
  }
  return json({ ok: true, kyc_id: updated.id, status });
}

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return fail(405, "method_not_allowed");

  // Sağlayıcı webhook'u mu yoksa kullanıcı gönderimi mi — body'yi bir kez okuyup ayırt ediyoruz.
  const raw = await req.json().catch(() => null);
  if (raw && raw.action === "provider_callback") {
    return handleProviderCallback(new Request(req.url, { method: "POST", headers: req.headers, body: JSON.stringify(raw) }));
  }

  const ctx = await getAuthContext(req);
  if (!ctx) return fail(401, "unauthenticated");

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return fail(422, "validation_error", { issues: parsed.error.issues });
  }
  const body = parsed.data;

  if (body.subject_type === "individual" && body.subject_id !== ctx.user.id) {
    return fail(403, "forbidden");
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
    return fail(500, "db_error");
  }

  const provider = providerEnvOk();
  if (provider.ok) {
    const result = await callVerificationProvider(provider.url!, provider.key!, {
      kyc_id: kyc.id,
      subject_type: body.subject_type,
      subject_id: body.subject_id,
      documents: body.documents,
      declared_data: body.declared_data ?? {},
    });
    if (result.ok && result.provider_ref) {
      await db.from("kyc_verifications").update({
        provider: "external",
        provider_ref: result.provider_ref,
        verdict: result.verdict ?? null,
      }).eq("id", kyc.id);
    } else {
      logger({ fn: "kyc-submit" }).warn("provider_dispatch_failed", { kyc_id: kyc.id, err: result.error });
    }
  }

  return json({ ok: true, kyc_id: kyc.id, status: "in_review" });
});
