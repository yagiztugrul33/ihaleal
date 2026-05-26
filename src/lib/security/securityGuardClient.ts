import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { getCsrfToken } from "@/lib/security/csrf";

export type SecurityScope = "login" | "bid" | "payment";

type GuardResult = {
  ok: boolean;
  remaining?: number;
  retryAfterSec?: number;
};

function endpointUrl(): string | null {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/functions/v1/security-guard`;
}

export async function runSecurityGuard(scope: SecurityScope, identity: string): Promise<GuardResult> {
  if (!isSupabaseConfigured()) return { ok: true };
  const url = endpointUrl();
  if (!url) return { ok: true };

  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token ?? null;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": getCsrfToken(),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify({
      scope,
      identity,
    }),
  });

  const payload = (await resp.json().catch(() => null)) as GuardResult | null;
  if (!resp.ok) {
    return {
      ok: false,
      retryAfterSec: payload?.retryAfterSec ?? 60,
      remaining: payload?.remaining,
    };
  }
  return payload ?? { ok: true };
}

