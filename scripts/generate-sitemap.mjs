import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const appPath = path.join(root, "src", "App.tsx");
const seoLandingsPath = path.join(root, "src", "data", "seoLandings.ts");
const sitemapPath = path.join(root, "public", "sitemap.xml");
const origin = "https://ihaleal.com";

function extractPaths(appSource) {
  const out = new Set();
  const re = /path=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(appSource)) !== null) {
    const routePath = m[1];
    if (routePath === "*" || routePath.includes(":")) continue;
    out.add(routePath);
  }
  return [...out].sort();
}

function priorityFor(routePath) {
  if (routePath === "/") return "1.0";
  if (routePath === "/ihaleler" || routePath === "/ilanlar") return "0.9";
  if (routePath.startsWith("/rehber") || routePath.startsWith("/bolge")) return "0.85";
  if (routePath.split("/").filter(Boolean).length <= 1) return "0.8";
  return "0.7";
}

function changeFreqFor(routePath) {
  if (routePath === "/") return "daily";
  if (routePath.startsWith("/rehber") || routePath.startsWith("/blog")) return "weekly";
  if (routePath.startsWith("/yasal") || routePath.startsWith("/kvkk") || routePath.startsWith("/gizlilik")) return "monthly";
  return "weekly";
}

function asXml(routes) {
  const body = routes
    .map((routePath) => {
      const loc = `${origin}${routePath}`;
      return `  <url><loc>${loc}</loc><changefreq>${changeFreqFor(routePath)}</changefreq><priority>${priorityFor(routePath)}</priority></url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function extractSeoLandingPaths(source) {
  const out = new Set();
  const re = /path:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const p = m[1];
    if (p.startsWith("/")) out.add(p);
  }
  return [...out];
}

async function main() {
  const source = await fs.readFile(appPath, "utf8");
  const seoLandingsSource = await fs.readFile(seoLandingsPath, "utf8");
  const baseRoutes = extractPaths(source);
  const seoLandingRoutes = extractSeoLandingPaths(seoLandingsSource);
  const cityGuides = ["/sehir/Istanbul", "/sehir/Ankara", "/sehir/Izmir", "/sehir/Antalya", "/sehir/Bursa", "/sehir/Adana"];
  const routes = [...new Set([...baseRoutes, ...seoLandingRoutes, ...cityGuides])].sort();
  await fs.writeFile(sitemapPath, asXml(routes), "utf8");
  console.log(`[generate-sitemap] wrote ${routes.length} routes to public/sitemap.xml`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
