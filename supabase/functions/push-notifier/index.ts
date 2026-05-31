/**
 * push-notifier Edge function — Web Push gönderici.
 *
 * Tetikleyiciler (örnek):
 *   - Bir ihale kapanışa < 1 saat
 *   - Kullanıcının kayıtlı aramasına yeni ilan eşleşti (saved_search_listing_trigger)
 *   - Teklif kabul/red durumu değişti (listing_offer_notifications)
 *
 * Çağrı:
 *   POST /functions/v1/push-notifier
 *   Body: { user_ids: string[], title: string, body: string, url?: string, tag?: string }
 *   Header: Authorization: Bearer SERVICE_ROLE_KEY (sadece backend)
 *
 * Çıktı:
 *   { sent: number, failed: number, errors: [{ user_id, reason }] }
 *
 * Bağımlılıklar:
 *   - VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT (Supabase secrets)
 *   - device_push_tokens tablosu (RLS owner-only, service_role full access)
 *   - web-push uyumlu native API (Deno crypto + manuel JWT — esid library yok)
 *
 * NOT (iskelet): Üretim için web-push library Deno port'u (deno.land/x/webpush)
 * veya manuel VAPID JWT + AES-128-GCM payload encryption gerekir.
 * Bu dosya altyapı şablonudur — Master canlı deploy öncesi VAPID anahtarlarını
 * Supabase secrets'a koyar ve tam encryption mantığını ekler.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Body {
  user_ids: string[];
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
}

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY");
  const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY");
  const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:info@ihaleal.com";

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return json({ error: "missing_supabase_env" }, 500);
  }
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return json(
      {
        error: "missing_vapid_env",
        hint: "VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY secrets eklenmeli (Supabase Dashboard)",
      },
      500,
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  if (!Array.isArray(body.user_ids) || body.user_ids.length === 0) {
    return json({ error: "user_ids_required" }, 400);
  }
  if (!body.title || !body.body) {
    return json({ error: "title_body_required" }, 400);
  }

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  const { data: tokens, error: dbErr } = await sb
    .from("device_push_tokens")
    .select("token, platform, user_id")
    .in("user_id", body.user_ids);

  if (dbErr) {
    return json({ error: "db_error", message: dbErr.message }, 500);
  }
  if (!tokens || tokens.length === 0) {
    return json({ sent: 0, failed: 0, reason: "no_tokens" });
  }

  const payload = JSON.stringify({
    title: body.title,
    body: body.body,
    url: body.url ?? "/",
    tag: body.tag ?? "ihaleal-notification",
    icon: body.icon ?? "/icon-192.png",
  });

  // İSKELET — gerçek web-push gönderimi VAPID JWT + AES-128-GCM encryption gerektirir.
  // Production için: import { webPushHandler } from "https://deno.land/x/webpush/mod.ts";
  // veya manuel ECDH + HKDF + AES-GCM. Bu fonksiyon şu anda gönderim simülasyonu yapar.
  let sent = 0;
  let failed = 0;
  const errors: { user_id: string; reason: string }[] = [];

  for (const row of tokens) {
    try {
      const sub = JSON.parse(row.token);
      if (!sub.endpoint) throw new Error("invalid_subscription");
      // TODO: Gerçek web-push call buraya:
      //   await pushService.send(sub, payload, { vapidDetails: { ... } });
      // İskelet log:
      console.log(`[push-notifier] ${row.platform} → ${sub.endpoint.slice(0, 50)}... | ${payload.slice(0, 80)}`);
      sent++;
    } catch (e) {
      failed++;
      errors.push({
        user_id: row.user_id,
        reason: String(e).slice(0, 200),
      });
    }
  }

  return json({
    sent,
    failed,
    errors: errors.slice(0, 10),
    skeleton: true,
    note: "Gerçek web-push gönderimi için VAPID JWT + AES-128-GCM encryption gerek. Bu sürüm log + DB tarama yapar.",
  });
});
