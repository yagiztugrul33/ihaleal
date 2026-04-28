import type { ReactNode } from "react";

/**
 * Rota segmenti sarmalayıcı — `SeoSync` + `applySeoToDocument` zaten `Layout` içinde.
 * İleride rota bazlı `<title>` / JSON-LD genişletmesi veya prerender işaretleri için kullanılacak.
 * CLOUD §C RouteSeo taslağı: şimdilik pass-through (S15).
 */
export function RouteSeo({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
