/** Production origin: OG, canonical, schema (BrowserRouter). */
export const SITE_ORIGIN = "https://ihaleal.com" as const;

/** Canonical root (history API paths; no hash). */
export const CANONICAL_ROOT_HREF = `${SITE_ORIGIN}/` as const;

/**
 * Rota-bazlı canonical. Pathname verilmediyse kök URL döner (geri-uyum).
 * SEO için: her sayfa kendi URL'sine kanonik olmalı, "ana sayfa duplicate" olmamalı.
 * Querystring kanonik'e DAHIL EDİLMEZ (kanonik temiz tutulur).
 */
export function getCanonicalHref(pathname?: string): string {
  if (!pathname || pathname === "/") return CANONICAL_ROOT_HREF;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const origin = SITE_ORIGIN.replace(/\/$/, "");
  return `${origin}${path}`;
}

export function getShareUrlForPath(pathname: string, search: string): string {
  const path =
    !pathname || pathname === "/" ? "/" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  const origin = SITE_ORIGIN.replace(/\/$/, "");
  return `${origin}${path}${search ?? ""}`;
}
