/**
 * Edge Function: PayTR ödeme entegrasyonu (iframe API — sandbox + production hazır).
 *
 * Secrets (TODO(anahtar) — PayTR mağaza panelinden alınır, Supabase secrets'a eklenir):
 *   PAYTR_MERCHANT_ID
 *   PAYTR_MERCHANT_KEY
 *   PAYTR_MERCHANT_SALT
 *
 * Anahtar yoksa → SANDBOX simülasyonu (iyzico fonksiyonuyla aynı desen).
 * Anahtar varsa → gerçek PayTR "get-token" REST API çağrısı.
 *
 * İki farklı istek türü aynı endpoint'e gelir (PayTR'ın kendi entegrasyon deseni budur):
 *   1. POST + Content-Type: application/json  → bizim frontend'imiz, ödeme başlatma
 *      isteği ({ action: "create_payment", ... }), Authorization: Bearer <user JWT> gerekir.
 *   2. POST + Content-Type: application/x-www-form-urlencoded → PayTR'ın kendi sunucusundan
 *      gelen asenkron bildirim (webhook), Authorization gerekmez (hash ile doğrulanır).
 *
 * Kaynak (PayTR resmi entegrasyon dokümantasyonunun yaygın olarak yayımlanan algoritması):
 *   paytr_token = base64(HMAC-SHA256(
 *     merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket +
 *       no_installment + max_installment + currency + test_mode + merchant_salt,
 *     merchant_key
 *   ))
 *   Bildirim doğrulama: base64(HMAC-SHA256(merchant_oid + merchant_salt + status +
 *     total_amount, merchant_key)) === gelen `hash` alanı.
 *
 * ÖNEMLİ: Bu entegrasyon bu oturumda gerçek bir PayTR sandbox hesabına karşı uçtan uca
 * TEST EDİLEMEDİ (ağ erişimi bu ortamda kısıtlı). HMAC yardımcı fonksiyonları kendi
 * içinde tutarlılık için doğrulandı (bkz. commit mesajı); production'a almadan önce
 * gerçek PAYTR_MERCHANT_* secret'larıyla ve PayTR'ın sandbox modunda (test_mode=1)
 * bir kez uçtan uca manuel doğrulanmalı.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function envOk(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!Deno.env.get("PAYTR_MERCHANT_ID")?.trim()) missing.push("PAYTR_MERCHANT_ID");
  if (!Deno.env.get("PAYTR_MERCHANT_KEY")?.trim()) missing.push("PAYTR_MERCHANT_KEY");
  if (!Deno.env.get("PAYTR_MERCHANT_SALT")?.trim()) missing.push("PAYTR_MERCHANT_SALT");
  return { ok: missing.length === 0, missing };
}

/** HMAC-SHA256(message, key) → base64 (PayTR'ın beklediği imza formatı). */
async function hmacSha256Base64(message: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

/** PayTR merchant_oid: yalnızca harf/rakam/alt çizgi kabul eder — UUID'deki tireler kaldırılır. */
function toMerchantOid(paymentId: string): string {
  return `ihaleal_${paymentId.replace(/-/g, "")}`;
}

async function audit(
  supabaseAdmin: ReturnType<typeof createClient>,
  eventType: string,
  userId: string | null,
  paymentId: string | null,
  details: Record<string, unknown>,
): Promise<void> {
  try {
    await supabaseAdmin.from("payment_audit_log").insert({
      event_type: eventType,
      user_id: userId,
      payment_id: paymentId,
      subscription_id: null,
      details,
    });
  } catch (_) {
    /* sessiz — audit hatası ana akışı kesemez */
  }
}

/** PayTR sunucusundan gelen bildirimi işler (form-urlencoded, hash ile doğrulanır). */
async function handleCallback(req: Request, cors: Record<string, string>): Promise<Response> {
  const e = envOk();
  if (!e.ok) {
    return new Response("PAYTR notification failed: merchant secrets missing", { status: 500, headers: cors });
  }
  const merchantKey = Deno.env.get("PAYTR_MERCHANT_KEY")!;
  const merchantSalt = Deno.env.get("PAYTR_MERCHANT_SALT")!;

  const form = await req.formData();
  const merchantOid = String(form.get("merchant_oid") ?? "");
  const status = String(form.get("status") ?? "");
  const totalAmount = String(form.get("total_amount") ?? "");
  const receivedHash = String(form.get("hash") ?? "");

  if (!merchantOid || !status || !totalAmount || !receivedHash) {
    return new Response("PAYTR notification failed: missing fields", { status: 400, headers: cors });
  }

  const hashStr = merchantOid + merchantSalt + status + totalAmount;
  const expectedHash = await hmacSha256Base64(hashStr, merchantKey);

  if (expectedHash !== receivedHash) {
    return new Response("PAYTR notification failed: bad hash", { status: 400, headers: cors });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("id, user_id, status")
    .eq("provider", "paytr")
    .eq("provider_ref", merchantOid)
    .maybeSingle();

  if (!payment) {
    // PayTR'a yine de "OK" dönülür (tekrar tekrar retry etmesin) ama loglanır.
    console.error(`[payments-paytr] callback: bilinmeyen merchant_oid ${merchantOid}`);
    return new Response("OK", { status: 200, headers: cors });
  }

  const newStatus = status === "success" ? "success" : "failed";
  await supabaseAdmin
    .from("payments")
    .update({
      status: newStatus,
      completed_at: newStatus === "success" ? new Date().toISOString() : null,
      failed_reason: newStatus === "failed"
        ? String(form.get("failed_reason_msg") ?? "paytr_payment_failed")
        : null,
    })
    .eq("id", payment.id);

  await audit(supabaseAdmin, newStatus === "success" ? "payment_completed" : "payment_failed", payment.user_id, payment.id, {
    provider: "paytr",
    merchant_oid: merchantOid,
    total_amount: totalAmount,
  });

  // PayTR yalnızca gövdesi tam olarak "OK" olan 200 yanıtını kabul eder; aksi halde bildirimi tekrar dener.
  return new Response("OK", { status: 200, headers: cors });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions(req);
  const cors = corsHeaders(req);

  if (req.method === "GET") {
    const e = envOk();
    return json(
      {
        ok: true,
        provider: "paytr",
        stage: e.ok ? "production" : "sandbox",
        secrets_configured: e.ok,
        missing_secrets: e.missing,
        supported_actions: ["create_payment"],
      },
      200,
      cors,
    );
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405, cors);
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return handleCallback(req, cors);
  }

  // ==========================================================================
  // JSON gövde: bizim frontend'imizden gelen create_payment isteği (auth gerekir)
  // ==========================================================================
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ ok: false, error: "unauthorized" }, 401, cors);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabaseUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  const { data: userData } = await supabaseUser.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ ok: false, error: "unauthorized" }, 401, cors);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400, cors);
  }

  const action = String(body.action ?? "");
  if (action !== "create_payment") {
    return json({ ok: false, error: "unknown_action", action }, 400, cors);
  }

  const amount = Number(body.amount_try ?? 0);
  const purpose = String(body.purpose ?? "addon_purchase");
  const idempotencyKey = String(body.idempotency_key ?? "");
  const description = String(body.description ?? "").slice(0, 200);

  if (amount <= 0 || amount > 1_000_000) {
    return json({ ok: false, error: "invalid_amount" }, 400, cors);
  }
  if (!idempotencyKey || idempotencyKey.length < 8) {
    return json({ ok: false, error: "idempotency_key_required" }, 400, cors);
  }

  const { data: existing } = await supabaseAdmin
    .from("payments")
    .select("id, status, provider_ref")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existing) {
    return json({ ok: true, duplicate: true, payment_id: existing.id, status: existing.status }, 200, cors);
  }

  const { data: payment, error: insertError } = await supabaseAdmin
    .from("payments")
    .insert({
      user_id: user.id,
      provider: "paytr",
      amount_try: amount,
      currency: "TRY",
      status: "pending",
      purpose,
      idempotency_key: idempotencyKey,
      metadata: { description },
    })
    .select("id")
    .single();

  if (insertError || !payment) {
    return json({ ok: false, error: "db_insert_failed", detail: insertError?.message }, 500, cors);
  }

  await audit(supabaseAdmin, "payment_started", user.id, payment.id, { amount, purpose, provider: "paytr" });

  const e = envOk();
  const merchantOid = toMerchantOid(payment.id);

  // SANDBOX MODU (anahtar yoksa) — iyzico fonksiyonuyla aynı desen
  if (!e.ok) {
    await supabaseAdmin.from("payments").update({ provider_ref: merchantOid }).eq("id", payment.id);
    const mockPaymentPageUrl = `${supabaseUrl.replace("/v1", "")}/sandbox-3ds-mock?payment_id=${payment.id}&amount=${amount}`;
    return json(
      {
        ok: true,
        sandbox: true,
        payment_id: payment.id,
        status: "requires_3ds",
        payment_page_url: mockPaymentPageUrl,
        message: "Sandbox modunda. Gerçek tahsilat için PAYTR_MERCHANT_ID/KEY/SALT secret'a girilmeli.",
      },
      200,
      cors,
    );
  }

  // GERÇEK PayTR get-token çağrısı
  try {
    const merchantId = Deno.env.get("PAYTR_MERCHANT_ID")!;
    const merchantKey = Deno.env.get("PAYTR_MERCHANT_KEY")!;
    const merchantSalt = Deno.env.get("PAYTR_MERCHANT_SALT")!;
    const appBaseUrl = Deno.env.get("APP_BASE_URL") ?? "https://ihaleal.com";

    const userIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
    const email = user.email ?? "noreply@ihaleal.com";
    const paymentAmountKurus = Math.round(amount * 100);
    const userBasket = btoa(JSON.stringify([[description || purpose, amount.toFixed(2), 1]]));
    const noInstallment = 0;
    const maxInstallment = 0;
    const currency = "TL";
    const testMode = 0;

    const hashStr =
      merchantId + userIp + merchantOid + email + paymentAmountKurus + userBasket +
      noInstallment + maxInstallment + currency + testMode;
    const paytrToken = await hmacSha256Base64(hashStr + merchantSalt, merchantKey);

    const form = new URLSearchParams({
      merchant_id: merchantId,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email,
      payment_amount: String(paymentAmountKurus),
      paytr_token: paytrToken,
      user_basket: userBasket,
      debug_on: "0",
      no_installment: String(noInstallment),
      max_installment: String(maxInstallment),
      user_name: user.email?.split("@")[0] ?? "ihaleal_user",
      user_address: "Türkiye",
      user_phone: "05000000000",
      merchant_ok_url: `${appBaseUrl}/odeme/basarili?payment_id=${payment.id}`,
      merchant_fail_url: `${appBaseUrl}/odeme/basarisiz?payment_id=${payment.id}`,
      timeout_limit: "30",
      currency,
      test_mode: String(testMode),
      lang: "tr",
    });

    const ptResp = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const ptData = await ptResp.json();

    if (ptData.status === "success") {
      await supabaseAdmin
        .from("payments")
        .update({ status: "requires_3ds", provider_ref: merchantOid, metadata: { description, paytr_token_issued: true } })
        .eq("id", payment.id);

      return json(
        {
          ok: true,
          payment_id: payment.id,
          status: "requires_3ds",
          payment_page_url: `https://www.paytr.com/odeme/guvenli/${ptData.token}`,
          token: ptData.token,
        },
        200,
        cors,
      );
    } else {
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed", provider_ref: merchantOid, failed_reason: ptData.reason ?? "paytr_get_token_failed" })
        .eq("id", payment.id);

      await audit(supabaseAdmin, "payment_failed", user.id, payment.id, { paytr_error: ptData });

      return json({ ok: false, error: "paytr_error", detail: ptData.reason }, 502, cors);
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await supabaseAdmin
      .from("payments")
      .update({ status: "failed", provider_ref: merchantOid, failed_reason: errMsg })
      .eq("id", payment.id);
    return json({ ok: false, error: "paytr_network_error", detail: errMsg }, 503, cors);
  }
});
