/** Production origin: OG, canonical, schema (BrowserRouter). */
export const SITE_ORIGIN = "https://ihaleal.com" as const;

/** Canonical root (history API paths; no hash). */
export const CANONICAL_ROOT_HREF = `${SITE_ORIGIN}/` as const;

export function getCanonicalHref(): string {
  return CANONICAL_ROOT_HREF;
}

export function getShareUrlForPath(pathname: string, search: string): string {
  const path =
    !pathname || pathname === "/" ? "/" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  const origin = SITE_ORIGIN.replace(/\/$/, "");
  return `${origin}${path}${search ?? ""}`;
}
