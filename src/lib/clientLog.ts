/** Küçük istemci log yardımcısı: üretimde hassas ayrıntıları kullanıcıya sızdırmayın. */

/**
 * Üretim crash telemetri — `client_errors` tablosuna fire-and-forget POST.
 * Hata yutulur, kullanıcı akışını BLOKLAMAZ. Migration: 20260530180000.
 */
function postClientErrorAsync(payload: {
  message: string;
  stack?: string;
  route?: string;
  user_agent?: string;
}): void {
  try {
    const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";
    const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "";
    if (!url || !key || typeof fetch === "undefined") return;
    void fetch(`${url}/rest/v1/client_errors`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* sessiz — telemetri kritik yol degil */
    });
  } catch {
    /* sessiz */
  }
}

export function clientLogError(
  scope: string,
  error: unknown,
  extra?: Record<string, string | number | boolean | undefined>
): void {
  const isDev = Boolean(import.meta.env.DEV);
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Bilinmeyen hata";

  if (isDev) {
    void extra;
    console.error(`[${scope}]`, msg, error, extra);
    return;
  }

  console.error(`[${scope}]`, { message: "İşlem sırasında bir hata oluştu", code: scope });

  // Production telemetri (R14 P0 — Gavel benzeri sessiz crash'leri yakala)
  if (typeof window !== "undefined") {
    const stack = error instanceof Error ? error.stack?.slice(0, 4000) : undefined;
    postClientErrorAsync({
      message: `[${scope}] ${msg}`.slice(0, 1000),
      stack,
      route: window.location?.pathname,
      user_agent: window.navigator?.userAgent?.slice(0, 500),
    });
  }
}
