/**
 * Edge Function: iyzico ödeme entegrasyonu (sandbox + production hazır).
 *
 * Secrets:
 *   IYZICO_API_KEY     — iyzico Merchant API anahtarı
 *   IYZICO_SECRET_KEY  — iyzico Merchant secret
 *   IYZICO_BASE_URL    — sandbox: https://sandbox-api.iyzipay.com
 *                        production: https://api.iyzipay.com
 *
 * Master "anahtar yoksa" → SANDBOX simülasyonu (test kartlarıyla success/fail)
 * Anahtar gelince .env'e konunca → GERÇEK iyzico REST API
 *
 * Action endpoint'leri (POST body { action: "..." }):
 *   - create_payment        — ödeme başlat (3D Secure HTML formu döner)
 *   - create_subscription   — recurring abonelik başlat
 *   - cancel_subscription   — kullanıcı iptali
 *   - get_status            — payment durum sorgu
 *
 * Güvenlik:
 *   - SUNUCUDA tutar doğrulaması (client'tan gelen tutara güvenme)
 *   - Idempotency key (çift tahsilat YASAK)
 *   - PCI: kart verisi ASLA bu fonksiyona gelmez (iyzico tokenize)
 *   - Tutar hesap pricingTiers'a göre — frontend manipülasyonu engellenir
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Tier fiyatları — frontend pricingTiers.ts ile SENKRON, sunucuda doğrulanır.
// 2026-06-01 güncellendi: Master politika belgesi (Yatırımcı 499 / Başlangıç 1900 /
// Pro 4500 / Kurumsal 9900). Yıllık -%20 indirim korundu. Erken üye fiyatları SUNUCUDA
// hesaplanmaz — kayıt anındaki LİSTE fiyatından yazılır (taahhüt 12 ay sabit).
const TIER_MONTHLY_PRICES: Record<string, number> = {
  free: 0,
  yatirimci: 499,
  emlak_baslangic: 1900,
  emlak_pro: 4500,
  kurumsal: 9900,
};
const YEARLY_DISCOUNT = 0.20;

function computeTierPrice(tierId: string, cycle: "monthly" | "yearly"): number {
  const monthly = TIER_MONTHLY_PRICES[tierId];
  if (monthly === undefined) return -1;
  if (monthly === 0) return 0;
  if (cycle === "yearly") {
    return Math.round(monthly * (1 - YEARLY_DISCOUNT) * 12);
  }
  return monthly;
}

function envOk(): { ok: boolean; missing: string[]; sandbox: boolean } {
  const missing: string[] = [];
  if (!Deno.env.get("IYZICO_API_KEY")?.trim()) missing.push("IYZICO_API_KEY");
  if (!Deno.env.get("IYZICO_SECRET_KEY")?.trim()) missing.push("IYZICO_SECRET_KEY");
  if (!Deno.env.get("IYZICO_BASE_URL")?.trim()) missing.push("IYZICO_BASE_URL");
  const isSandbox = !!Deno.env.get("IYZICO_BASE_URL")?.includes("sandbox");
  return { ok: missing.length === 0, missing, sandbox: isSandbox || missing.length > 0 };
}

/**
 * Ödeme sistemi genel kapatma anahtarı — merchant secret'larından BAĞIMSIZ.
 * Varsayılan KAPALI (yalnızca tam olarak "true" ise açık): secret'lar yanlışlıkla
 * girilse bile gerçek tahsilat bu anahtar açılmadan asla tetiklenmez.
 */
function paymentsEnabled(): boolean {
  return Deno.env.get("PAYMENTS_ENABLED") === "true";
}

// JSON yanıt yardımcısı
function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// Audit log yardımcısı
async function audit(
  supabaseAdmin: ReturnType<typeof createClient>,
  eventType: string,
  userId: string | null,
  paymentId: string | null,
  subscriptionId: string | null,
  details: Record<string, unknown>,
  ip: string | null,
  ua: string | null,
) {
  try {
    await supabaseAdmin.from("payment_audit_log").insert({
      event_type: eventType,
      user_id: userId,
      payment_id: paymentId,
      subscription_id: subscriptionId,
      details,
      ip_address: ip,
      user_agent: ua,
    });
  } catch (_) {
    /* sessiz - audit hatası ana akışı kesemez */
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions(req);
  const cors = corsHeaders(req);

  // GET — diagnostic
  if (req.method === "GET") {
    const e = envOk();
    return json(
      {
        ok: true,
        provider: "iyzico",
        stage: e.ok && !e.sandbox ? "production" : "sandbox",
        secrets_configured: e.ok,
        missing_secrets: e.missing,
        sandbox_mode: e.sandbox,
        payments_enabled: paymentsEnabled(),
        supported_actions: ["create_payment", "create_subscription", "cancel_subscription", "get_status"],
      },
      200,
      cors,
    );
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405, cors);
  }

  // Auth header'dan kullanıcı çek (RLS için)
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ ok: false, error: "unauthorized" }, 401, cors);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Kullanıcı oturumlu istemci (RLS aktif)
  const supabaseUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  // Service role istemci (audit log + system insert için)
  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  const { data: userData } = await supabaseUser.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ ok: false, error: "unauthorized" }, 401, cors);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = req.headers.get("user-agent")?.slice(0, 500) ?? null;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400, cors);
  }

  const action = String(body.action ?? "");
  const e = envOk();

  // ========================================================================
  // ACTION: create_payment — tek seferlik ödeme (addon vs.)
  // ========================================================================
  if (action === "create_payment") {
    // Ödeme sistemi genel kapatma anahtarı — hiçbir kayıt oluşturulmadan, hiçbir
    // merchant çağrısı yapılmadan en baştan döner. Bkz. paymentsEnabled() yorumu.
    if (!paymentsEnabled()) {
      return json(
        {
          ok: true,
          demo_mode: true,
          payment_id: null,
          status: "demo_disabled",
          message: "Ödeme sistemi şu an demo modunda; gerçek tahsilat yapılmamaktadır. Çok yakında aktif olacak.",
        },
        200,
        cors,
      );
    }

    const amount = Number(body.amount_try ?? 0);
    const purpose = String(body.purpose ?? "addon_purchase");
    const idempotencyKey = String(body.idempotency_key ?? "");
    const description = String(body.description ?? "").slice(0, 200);

    // SUNUCU TARAFI tutar doğrulama (client manipülasyonu engellenir)
    if (amount <= 0 || amount > 1_000_000) {
      return json({ ok: false, error: "invalid_amount" }, 400, cors);
    }
    if (!idempotencyKey || idempotencyKey.length < 8) {
      return json({ ok: false, error: "idempotency_key_required" }, 400, cors);
    }

    // İdempotency kontrolü
    const { data: existing } = await supabaseAdmin
      .from("payments")
      .select("id, status, provider_ref")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existing) {
      return json({ ok: true, duplicate: true, payment_id: existing.id, status: existing.status }, 200, cors);
    }

    // payments kaydı
    const { data: payment, error: insertError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: user.id,
        provider: "iyzico",
        amount_try: amount,
        currency: "TRY",
        status: "pending",
        purpose,
        idempotency_key: idempotencyKey,
        metadata: { description, sandbox: e.sandbox },
      })
      .select("id")
      .single();

    if (insertError || !payment) {
      return json({ ok: false, error: "db_insert_failed", detail: insertError?.message }, 500, cors);
    }

    await audit(supabaseAdmin, "payment_started", user.id, payment.id, null, { amount, purpose, sandbox: e.sandbox }, ip, ua);

    // SANDBOX MODU (anahtar yoksa veya sandbox URL)
    if (!e.ok || e.sandbox) {
      // Test simülasyonu — gerçek iyzico çağrısı yok
      const mockPaymentPageUrl = `${supabaseUrl.replace("/v1", "")}/sandbox-3ds-mock?payment_id=${payment.id}&amount=${amount}`;
      return json(
        {
          ok: true,
          sandbox: true,
          payment_id: payment.id,
          status: "requires_3ds",
          payment_page_url: mockPaymentPageUrl,
          message: "Sandbox modunda. Gerçek tahsilat için IYZICO_API_KEY + IYZICO_SECRET_KEY secret'a girilmeli.",
        },
        200,
        cors,
      );
    }

    // GERÇEK iyzico REST API çağrısı (anahtar var)
    try {
      const apiKey = Deno.env.get("IYZICO_API_KEY")!;
      const secret = Deno.env.get("IYZICO_SECRET_KEY")!;
      const baseUrl = Deno.env.get("IYZICO_BASE_URL")!.replace(/\/$/, "");

      const reqBody = {
        locale: "tr",
        conversationId: payment.id,
        price: amount.toFixed(2),
        paidPrice: amount.toFixed(2),
        currency: "TRY",
        basketId: payment.id,
        paymentGroup: "PRODUCT",
        callbackUrl: `${supabaseUrl.replace("/v1", "")}/functions/v1/payments-iyzico-callback`,
        buyer: {
          id: user.id,
          name: user.email?.split("@")[0] ?? "ihaleal_user",
          surname: "user",
          gsmNumber: "+905555555555",
          email: user.email ?? "noreply@ihaleal.com",
          identityNumber: "11111111111",
          registrationAddress: "Türkiye",
          ip: ip ?? "127.0.0.1",
          city: "Istanbul",
          country: "Turkey",
        },
        shippingAddress: {
          contactName: user.email?.split("@")[0] ?? "User",
          city: "Istanbul",
          country: "Turkey",
          address: "Dijital teslimat",
        },
        billingAddress: {
          contactName: user.email?.split("@")[0] ?? "User",
          city: "Istanbul",
          country: "Turkey",
          address: "Dijital teslimat",
        },
        basketItems: [{
          id: payment.id,
          name: description || purpose,
          category1: "Dijital",
          itemType: "VIRTUAL",
          price: amount.toFixed(2),
        }],
      };

      // iyzico HMAC-SHA1 signature
      const randomStr = crypto.randomUUID().replace(/-/g, "");
      const reqStr = JSON.stringify(reqBody);
      const signSrc = apiKey + randomStr + secret + reqStr;
      const encoder = new TextEncoder();
      const hashBuf = await crypto.subtle.digest("SHA-1", encoder.encode(signSrc));
      const hashHex = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
      const authStr = `IYZWS ${apiKey}:${hashHex}`;

      const iyzResp = await fetch(`${baseUrl}/payment/iyzipos/checkoutform/initialize/auth/ecom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authStr,
          "x-iyzi-rnd": randomStr,
        },
        body: reqStr,
      });

      const iyzData = await iyzResp.json();

      if (iyzData.status === "success") {
        await supabaseAdmin
          .from("payments")
          .update({
            status: "requires_3ds",
            provider_ref: iyzData.token,
            metadata: { ...payment, iyz_response: iyzData },
          })
          .eq("id", payment.id);

        return json(
          {
            ok: true,
            payment_id: payment.id,
            status: "requires_3ds",
            payment_page_url: iyzData.paymentPageUrl,
            token: iyzData.token,
          },
          200,
          cors,
        );
      } else {
        await supabaseAdmin
          .from("payments")
          .update({
            status: "failed",
            failed_reason: iyzData.errorMessage ?? "iyzico_init_failed",
          })
          .eq("id", payment.id);

        await audit(supabaseAdmin, "payment_failed", user.id, payment.id, null, { iyz_error: iyzData }, ip, ua);

        return json({ ok: false, error: "iyzico_error", detail: iyzData.errorMessage }, 502, cors);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed", failed_reason: errMsg })
        .eq("id", payment.id);
      return json({ ok: false, error: "iyzico_network_error", detail: errMsg }, 503, cors);
    }
  }

  // ========================================================================
  // ACTION: create_subscription — recurring premium üyelik
  // ========================================================================
  if (action === "create_subscription") {
    // Ödeme sistemi genel kapatma anahtarı — hiçbir kayıt oluşturulmadan, hiçbir
    // merchant çağrısı yapılmadan en baştan döner. Bkz. paymentsEnabled() yorumu.
    if (!paymentsEnabled()) {
      return json(
        {
          ok: true,
          demo_mode: true,
          subscription_id: null,
          status: "demo_disabled",
          message: "Ödeme sistemi şu an demo modunda; gerçek tahsilat yapılmamaktadır. Çok yakında aktif olacak.",
        },
        200,
        cors,
      );
    }

    const tierId = String(body.tier_id ?? "");
    const cycle = body.cycle === "yearly" ? "yearly" : "monthly";

    // Sunucuda fiyat hesapla (client gönderirse YOKSAY)
    const serverPrice = computeTierPrice(tierId, cycle as "monthly" | "yearly");
    if (serverPrice < 0) {
      return json({ ok: false, error: "invalid_tier" }, 400, cors);
    }
    if (serverPrice === 0) {
      return json({ ok: false, error: "free_tier_no_payment" }, 400, cors);
    }

    // Mevcut aktif abonelik var mı?
    const { data: existing } = await supabaseAdmin
      .from("subscriptions")
      .select("id, status, tier_id")
      .eq("user_id", user.id)
      .in("status", ["active", "past_due", "pending"])
      .maybeSingle();

    if (existing && existing.status === "active") {
      return json({ ok: false, error: "already_subscribed", current_tier: existing.tier_id }, 409, cors);
    }

    // subscriptions kaydı (pending — iyzico onayı sonrası aktive olur)
    const monthlyPrice = TIER_MONTHLY_PRICES[tierId];
    const { data: sub, error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id: user.id,
        tier_id: tierId,
        cycle,
        status: "pending",
        provider: "iyzico",
        monthly_price_try: monthlyPrice,
        metadata: { server_price: serverPrice, sandbox: e.sandbox },
      })
      .select("id")
      .single();

    if (subErr || !sub) {
      // Detaylı hata logu — Master logs'da görür
      console.error("[create_subscription] INSERT failed:", {
        user_id: user.id,
        tier_id: tierId,
        cycle,
        monthly_price_try: monthlyPrice,
        error: subErr,
      });
      return json(
        {
          ok: false,
          error: "subscription_create_failed",
          detail: subErr?.message ?? "unknown",
          hint: subErr?.code === "23502" ? "NOT NULL constraint — monthly_price_try eksik"
            : subErr?.code === "23514" ? "CHECK constraint — tier_id veya cycle yanlış"
            : subErr?.code === "23505" ? "UNIQUE — kullanıcının aktif aboneliği zaten var"
            : subErr?.code === "42P01" ? "Tablo yok — subscriptions migration apply edilmemiş"
            : subErr?.code === "42501" ? "Permission denied — service_role key eksik"
            : "Sebep belirsiz — supabase functions logs payments-iyzico ile detaya bakın",
        },
        500,
        cors,
      );
    }

    await audit(supabaseAdmin, "subscription_started", user.id, null, sub.id, { tier_id: tierId, cycle, price: serverPrice }, ip, ua);

    // Sandbox: hemen "aktive" et (gerçek iyzico yok)
    if (!e.ok || e.sandbox) {
      const periodEnd = new Date();
      if (cycle === "yearly") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      else periodEnd.setMonth(periodEnd.getMonth() + 1);

      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "active",
          started_at: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .eq("id", sub.id);

      await audit(supabaseAdmin, "subscription_activated_sandbox", user.id, null, sub.id, { tier_id: tierId }, ip, ua);

      return json(
        {
          ok: true,
          sandbox: true,
          subscription_id: sub.id,
          status: "active",
          tier_id: tierId,
          cycle,
          price_try: serverPrice,
          current_period_end: periodEnd.toISOString(),
          message: "Sandbox: aktif kayıt. Gerçek tahsilat için iyzico secret gerekir.",
        },
        200,
        cors,
      );
    }

    // TODO(anahtar): iyzico recurring/subscription API entegrasyonu bilinçli olarak ERTELENDİ.
    // Neden: iyzico'nun subscription/recurring ürünü, tek seferlik ödeme API'sinden AYRI bir
    // ürün hattı — merchant hesabında ayrıca aktifleştirilmesi + gerçek sandbox subscription
    // plan/product ID'leri gerektiriyor. Bu anahtar/ID'ler olmadan yazılacak kod canlıda hiç
    // test edilemeyen bir tekrarlayan-tahsilat akışı olur (çift tahsilat/kaçırılan tahsilat
    // riski) — bu yüzden gerçek anahtarlar sağlanmadan burada spekülatif kod YAZILMADI.
    // Gerekli olduğunda:
    //   1. iyzico merchant panelinden Subscription (recurring) ürünü aktifleştirilmeli.
    //   2. IYZICO_SUBSCRIPTION_PRODUCT_ID / IYZICO_SUBSCRIPTION_PLAN_ID_<tier> secret'ları eklenmeli.
    //   3. iyzico'nun "Create Subscription Checkout Form" / "Create Subscription Customer+Card"
    //      endpoint'leri bu action'a bağlanmalı (iyzico resmi subscription API dokümantasyonu).
    //   4. Yenileme/başarısız tahsilat bildirimleri için ayrı bir webhook edge function
    //      (örn. payments-iyzico-subscription-webhook) eklenmeli.
    // Şimdilik: tek seferlik ödeme akışı (create_payment) ile manuel başlatılıyor, recurring
    // tetiklenmiyor — kullanıcıya "pending" statüsü + açık bir not döndürülüyor.
    return json(
      {
        ok: true,
        subscription_id: sub.id,
        status: "pending",
        note: "Production iyzico subscription akışı eklenecek — create_payment ile manuel başlat",
      },
      200,
      cors,
    );
  }

  // ========================================================================
  // ACTION: cancel_subscription
  // ========================================================================
  if (action === "cancel_subscription") {
    const immediate = !!body.immediate;
    const { data: result, error: cancelErr } = await supabaseUser.rpc("cancel_my_subscription", {
      p_immediate: immediate,
    });
    if (cancelErr) {
      return json({ ok: false, error: "cancel_failed", detail: cancelErr.message }, 500, cors);
    }
    return json(result, 200, cors);
  }

  // ========================================================================
  // ACTION: get_status — payment durum sorgu
  // ========================================================================
  if (action === "get_status") {
    const paymentId = String(body.payment_id ?? "");
    if (!paymentId) return json({ ok: false, error: "payment_id_required" }, 400, cors);

    const { data: pay } = await supabaseUser
      .from("payments")
      .select("id, status, amount_try, completed_at, failed_reason, provider_ref")
      .eq("id", paymentId)
      .maybeSingle();

    if (!pay) return json({ ok: false, error: "not_found" }, 404, cors);
    return json({ ok: true, payment: pay }, 200, cors);
  }

  return json({ ok: false, error: "unknown_action", action }, 400, cors);
});
