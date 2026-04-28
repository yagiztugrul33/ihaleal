/** public/ altındaki dosyalar için Vite BASE_URL (örn. ./) uyumlu yol */
export function publicAsset(path: string): string {
  const rel = path.replace(/^\//, "");
  const base = import.meta.env.BASE_URL;
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return `${normalized}${rel}`;
}
