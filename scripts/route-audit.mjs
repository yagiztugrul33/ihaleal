import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const appPath = path.join(root, "src", "App.tsx");
const outDir = path.join(root, "screenshots", "audit", "wave3-final");
const outPath = path.join(root, "reports", "wave3-final-audit.json");

function parseBaseUrl() {
  const argIdx = process.argv.indexOf("--base");
  if (argIdx >= 0 && process.argv[argIdx + 1]) return process.argv[argIdx + 1].replace(/\/$/, "");
  return (process.env.AUDIT_BASE_URL || "http://localhost:4173").replace(/\/$/, "");
}

const baseUrl = parseBaseUrl();

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

function extractPaths(appSource) {
  const paths = new Set();
  const re = /path=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(appSource)) !== null) {
    const raw = m[1];
    if (raw === "*") continue;
    const p = raw.startsWith("/") ? raw : `/${raw}`;
    if (p.includes(":")) continue;
    paths.add(p);
  }
  return [...paths].sort();
}

const DYNAMIC_DEMOS = {
  "/ilanlar/:kategori": "/ilanlar/prop-001",
  "/ilanlar/:kategori/:alt": "/ilanlar/konut/villa",
  "/ilanlar/:kategori/:alt/:tip": "/ilanlar/konut/villa/mustakil",
  "/ilan/:id": "/ilanlar/prop-001",
  "/ihale/:id": "/ihale/demo-ihale-1",
  "/ihale/:auctionId/hemen-al": "/ihale/demo-ihale-1/hemen-al",
  "/sehir/:cityName": "/sehir/istanbul",
  "/emlakci/:slug": "/emlakci/demo-emlakci",
  "/emlakci/ozellikler/:slug": "/emlakci/ozellikler/crm",
  "/blog/:slug": "/blog/ornek-yazi",
  "/rapor/:id": "/rapor/ornek",
  "/panel/:tabId": "/panel/ozet",
  "/yasal/sozlesmeler/:slug": "/yasal/sozlesmeler/ornek",
  "/how-it-works/yol/:slug": "/how-it-works/yol/alici",
  "/how-it-works/adim/:slug": "/how-it-works/adim/kesfet",
};

const TAXONOMY_SAMPLE = [
  "/ilanlar/konut",
  "/ilanlar/konut/villa",
  "/ilanlar/konut/villa/mustakil",
  "/ilanlar/ticari",
  "/ilanlar/ticari/ofis",
  "/ilanlar/ticari/ofis/a_sinif",
  "/ilanlar/endustri",
  "/ilanlar/endustri/fabrika",
  "/ilanlar/konaklama",
  "/ilanlar/konaklama/otel",
  "/ilanlar/arsa",
  "/ilanlar/arsa/tarla",
  "/ilanlar/altyapi",
  "/ilanlar/altyapi/ges",
  "/ilanlar/komple",
  "/ilanlar/devren",
];

const EXTRA_PATHS = [
  "/how-it-works",
  "/how-it-works/yol/alici",
  "/how-it-works/yol/satici",
  "/how-it-works/yol/danisman",
  "/how-it-works/yol/kurumsal",
  "/how-it-works/yol/operasyon",
  "/how-it-works/adim/kesfet",
  "/how-it-works/adim/teklif",
  "/how-it-works/adim/kazan",
  "/how-it-works/adim/teslim",
  "/ilanlar/turizm",
  "/ilanlar/ges",
  "/ilanlar/prop-001",
  "/modul/kentsel-donusum",
  "/modul/afet-toplanma-alanlari",
  "/modul/deprem-cantasi",
  "/modul/deprem-sigortasi",
  "/modul/komsuluk-risk-analizi",
  "/modul/tatbikat-rehberi",
  "/modul/yapay-zeka-hasar-tahmini",
  "/modul/deprem-egitimi",
  "/modul/deprem-egitimi/ders-1",
  "/modul/deprem-egitimi/ders-10",
  "/modul/yikilan-binalar-arsivi",
  "/modul/uzman-randevu",
  "/modul/bina-risk-sorgu",
  "/modul/deprem-risk-haritasi",
  "/modul/aile-acil-plan",
  "/modul/guclendirme-rehberi",
  "/modul/canli-deprem-takip",
];

function isIgnorableConsole(text) {
  const t = text.toLowerCase();
  if (t.includes("supabase") && (t.includes("env") || t.includes("anon") || t.includes("url"))) return true;
  if (t.includes("failed to load resource") && t.includes("supabase")) return true;
  if (t.includes("download the react devtools")) return true;
  return false;
}

function slugify(routePath) {
  return routePath.replace(/^\//, "").replace(/\//g, "__") || "root";
}

async function detectOverflow(page) {
  const readOverflow = () =>
    page.evaluate(() => {
      const doc = globalThis.document.documentElement;
      const body = globalThis.document.body;
      const scrollW = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
      const clientW = doc.clientWidth;
      const overflow = scrollW > clientW + 2;
      const offenders = [];
      if (overflow) {
        for (const el of globalThis.document.querySelectorAll("*")) {
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          if (r.right > clientW + 2) {
            const tag = el.tagName.toLowerCase();
            const cls = (el.className && String(el.className).slice(0, 60)) || "";
            offenders.push(`${tag}${cls ? "." + cls.split(" ")[0] : ""}`);
            if (offenders.length >= 5) break;
          }
        }
      }
      return { overflow, scrollW, clientW, offenders };
    });

  try {
    return await readOverflow();
  } catch {
    await page.waitForTimeout(200);
    try {
      return await readOverflow();
    } catch {
      return { overflow: false, scrollW: 0, clientW: 0, offenders: [] };
    }
  }
}

async function auditRoute(page, routePath, viewport, label) {
  const url = `${baseUrl}${routePath}`;
  const routeErrors = [];
  const handler = (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!isIgnorableConsole(text)) routeErrors.push(text);
    }
  };
  page.on("console", handler);
  let status = 0;
  let error = null;
  let loadMs;
  const t0 = Date.now();
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    status = res?.status() ?? 0;
    await page.waitForTimeout(600);
    loadMs = Date.now() - t0;
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    loadMs = Date.now() - t0;
  }
  page.off("console", handler);

  const overflow = label === "mobile" ? await detectOverflow(page) : { overflow: false, offenders: [] };

  const shotName = `${slugify(routePath)}--${label}.png`;
  const shotPath = path.join(outDir, shotName);
  await page.screenshot({ path: shotPath, fullPage: label === "mobile" });

  return {
    viewport: label,
    status,
    loadMs,
    error,
    consoleErrors: routeErrors,
    screenshot: path.relative(root, shotPath).replace(/\\/g, "/"),
    mobileOverflow: overflow.overflow,
    overflowOffenders: overflow.offenders,
  };
}

async function main() {
  console.log(`Route audit base: ${baseUrl}`);
  const appSource = await fs.readFile(appPath, "utf8");
  const staticPaths = extractPaths(appSource);
  const demoPaths = Object.values(DYNAMIC_DEMOS);
  const paths = [...new Set([...staticPaths, ...demoPaths, ...TAXONOMY_SAMPLE, ...EXTRA_PATHS])].sort();

  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const browser = await chromium.launch();
  const results = [];

  for (const routePath of paths) {
    const desktopContext = await browser.newContext({
      viewport: DESKTOP,
      deviceScaleFactor: 1,
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.addInitScript(() => {
      localStorage.setItem("ihaleal_cookie_consent_v1", new Date().toISOString());
    });

    const mobileContext = await browser.newContext({
      viewport: MOBILE,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.addInitScript(() => {
      localStorage.setItem("ihaleal_cookie_consent_v1", new Date().toISOString());
    });

    const desktop = await auditRoute(desktopPage, routePath, DESKTOP, "desktop");
    const mobile = await auditRoute(mobilePage, routePath, MOBILE, "mobile");

    const ok =
      desktop.status >= 200 &&
      desktop.status < 400 &&
      !desktop.error &&
      mobile.status >= 200 &&
      mobile.status < 400 &&
      !mobile.error;

    results.push({
      path: routePath,
      url: `${baseUrl}${routePath}`,
      ok,
      status: desktop.status,
      statusMobile: mobile.status,
      loadMsDesktop: desktop.loadMs,
      loadMsMobile: mobile.loadMs,
      error: desktop.error || mobile.error,
      consoleErrors: [...new Set([...desktop.consoleErrors, ...mobile.consoleErrors])],
      screenshots: [desktop.screenshot, mobile.screenshot],
      mobileOverflow: mobile.mobileOverflow,
      overflowOffenders: mobile.overflowOffenders,
    });

    await desktopContext.close();
    await mobileContext.close();
    process.stdout.write(ok ? "." : "F");
  }

  await browser.close();
  console.log("");

  const status200 = results.filter((r) => r.status === 200 && r.statusMobile === 200);
  const status404 = results.filter((r) => r.status === 404 || r.statusMobile === 404);
  const status500 = results.filter((r) => r.status >= 500 || r.statusMobile >= 500);
  const withConsole = results.filter((r) => r.consoleErrors.length > 0);
  const overflowPages = results.filter((r) => r.mobileOverflow);

  const allConsole = withConsole.flatMap((r) =>
    r.consoleErrors.map((msg) => ({ path: r.path, message: msg }))
  );

  const summary = {
    auditedAt: new Date().toISOString(),
    baseUrl,
    total: results.length,
    passed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    http200: status200.length,
    http404: status404.map((r) => r.path),
    http500: status500.map((r) => r.path),
    consoleErrorTotal: allConsole.length,
    consoleErrorByPath: withConsole.map((r) => ({
      path: r.path,
      errors: r.consoleErrors,
    })),
    mobileOverflowCount: overflowPages.length,
    mobileOverflowPaths: overflowPages.map((r) => ({
      path: r.path,
      offenders: r.overflowOffenders,
    })),
    screenshotDir: path.relative(root, outDir).replace(/\\/g, "/"),
    screenshotCount: results.length * 2,
    paths,
    results,
  };

  await fs.writeFile(outPath, JSON.stringify(summary, null, 2), "utf8");
  console.log(`Route audit: ${summary.passed}/${summary.total} OK`);
  console.log(`HTTP 404: ${summary.http404.length}, HTTP 500: ${summary.http500.length}`);
  console.log(`Console errors: ${summary.consoleErrorTotal}, Mobile overflow: ${summary.mobileOverflowCount}`);
  console.log(`Report -> ${outPath}`);
  if (summary.failed > 0 || summary.http404.length > 0 || summary.http500.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
