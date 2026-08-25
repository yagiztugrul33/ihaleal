/**
 * report-notifier Edge function — Aylık endeks rapor mailleri.
 *
 * Tetikleyici (önerilen):
 *   - Her ayın 1'inde 09:00 UTC+3 cron (Supabase pg_cron veya GitHub Actions).
 *   - Veya manuel admin tetikleme.
 *
 * Akış:
 *   1. Confirmed olan tüm report_subscribers'ı tara.
 *   2. Her abonenin filtreli şehir/kategori için yeni rapor URL'i oluştur.
 *   3. Resend/Postmark/SES üzerinden HTML mail gönder.
 *   4. unsubscribe_token mail footer'ına eklenir.
 *
 * Çağrı:
 *   POST /functions/v1/report-notifier
 *   Header: Authorization: Bearer SERVICE_ROLE_KEY
 *   Body (opsiyonel): { dry_run?: boolean, limit?: number }
 *
 * Bağımlılıklar:
 *   - RESEND_API_KEY veya POSTMARK_API_KEY (Supabase secrets)
 *   - MAIL_FROM (info@ihaleal.com)
 *   - APP_BASE_URL (https://ihaleal.com)
 *
 * NOT (iskelet): Gerçek mail gönderimi için Master canlı deploy öncesi
 * Resend SDK'sı eklenir ve buradaki TODO gerçek fetch'e dönüşür.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Body {
  dry_run?: boolean;
  limit?: number;
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

const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function buildEmailHtml(opts: {
  monthLabel: string;
  appUrl: string;
  unsubscribeToken: string;
  cities: string[];
  categories: string[];
}) {
  const filterLine =
    opts.cities.length === 0 && opts.categories.length === 0
      ? "Tüm şehir ve kategoriler"
      : [
          opts.cities.length ? `Şehirler: ${opts.cities.join(", ")}` : "",
          opts.categories.length ? `Kategoriler: ${opts.categories.join(", ")}` : "",
        ]
          .filter(Boolean)
          .join(" · ");
  const unsubUrl = `${opts.appUrl}/abone/iptal?t=${encodeURIComponent(opts.unsubscribeToken)}`;
  const reportsUrl = `${opts.appUrl}/raporlar`;
  return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"></head>
<body style="margin:0;background:#f6f6f6;color:#1f1f1f;font-family:system-ui,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6">
  <tr><td align="center" style="padding:32px 16px">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e7e7e7">
      <tr><td>
        <h1 style="color:#1f1f1f;margin:0 0 12px;font-size:24px">ihaleal Endeks Raporları — ${opts.monthLabel}</h1>
        <p style="color:#5d5d5d;margin:0 0 24px;font-size:14px">${filterLine}</p>
        <p style="color:#1f1f1f;line-height:1.6">
          Bu ay yeni şehir endeksi raporları yayımlandı. Konut, ticari ve arsa fiyat trendleri
          + ilçe bazlı karşılaştırmalar + PDF indirme — hepsi yeni raporda hazır.
        </p>
        <p style="margin:24px 0">
          <a href="${reportsUrl}" style="display:inline-block;background:#594ff4;color:#ffffff;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none">Raporları Gör</a>
        </p>
        <p style="color:#5d5d5d;font-size:12px;margin-top:32px;border-top:1px solid #e7e7e7;padding-top:16px">
          Bu maili almak istemiyorsanız <a href="${unsubUrl}" style="color:#594ff4">abonelikten çıkın</a>.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
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
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
  const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "ihaleal <info@ihaleal.com>";
  const APP_BASE_URL = Deno.env.get("APP_BASE_URL") ?? "https://ihaleal.com";

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return json({ error: "missing_supabase_env" }, 500);
  }

  let body: Body = {};
  try {
    body = await req.json();
  } catch {
    /* boş body OK */
  }
  const dryRun = body.dry_run === true;
  const limit = Math.min(Math.max(Number(body.limit) || 500, 1), 5000);

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  const { data: subs, error } = await sb
    .from("report_subscribers")
    .select("id, email, cities, categories, unsubscribe_token")
    .not("confirmed_at", "is", null)
    .limit(limit);

  if (error) {
    return json({ error: "db_error", message: error.message }, 500);
  }
  if (!subs || subs.length === 0) {
    return json({ sent: 0, reason: "no_confirmed_subscribers" });
  }

  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const errors: { email: string; reason: string }[] = [];

  for (const row of subs) {
    const html = buildEmailHtml({
      monthLabel,
      appUrl: APP_BASE_URL,
      unsubscribeToken: row.unsubscribe_token,
      cities: Array.isArray(row.cities) ? row.cities : [],
      categories: Array.isArray(row.categories) ? row.categories : [],
    });

    if (dryRun) {
      sent++;
      continue;
    }
    if (!RESEND_API_KEY) {
      // TODO(anahtar): RESEND_API_KEY setlenmeden gerçek gönderim yapılamaz.
      console.log(`[report-notifier] SKIP no RESEND_API_KEY → ${row.email}`);
      skipped++;
      continue;
    }

    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: MAIL_FROM,
          to: row.email,
          subject: `ihaleal Endeks — ${monthLabel} raporları yayında`,
          html,
        }),
      });
      if (!resp.ok) {
        failed++;
        errors.push({ email: row.email, reason: `HTTP ${resp.status}` });
      } else {
        sent++;
      }
    } catch (e) {
      failed++;
      errors.push({ email: row.email, reason: String(e).slice(0, 200) });
    }
  }

  return json({
    sent,
    failed,
    skipped,
    total: subs.length,
    dry_run: dryRun,
    errors: errors.slice(0, 10),
  });
});
