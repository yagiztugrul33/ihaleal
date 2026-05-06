/** Production origin: OG, canonical, schema (HashRouter). */
export const SITE_ORIGIN = "https://ihaleal.com" as const;

/** HashRouter demo (hybrid): single canonical root; share URLs use full hash path. */
export const CANONICAL_ROOT_HREF = `${SITE_ORIGIN}/` as const;

export function getCanonicalHref(): string {
  return CANONICAL_ROOT_HREF;
}

export function getShareUrlForPath(pathname: string, search: string): string {
  const path =
    !pathname || pathname === "/" ? "/" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN}/#${path}${search ?? ""}`;
}
