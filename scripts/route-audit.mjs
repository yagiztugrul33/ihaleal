import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const appPath = path.join(root, "src", "App.tsx");
const outPath = path.join(root, "reports", "route-audit-final.json");
const baseUrl = process.env.AUDIT_BASE_URL || "http://localhost:5174";

function extractPaths(appSource) {
  const paths = new Set();
  const re = /path=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(appSource)) !== null) {
    const p = m[1];
    if (p.includes(":")) continue;
    if (p === "*") continue;
    paths.add(p);
  }
  return [...paths].sort();
}

async function main() {
  const appSource = await fs.readFile(appPath, "utf8");
  const paths = extractPaths(appSource);
  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem("ihaleal_cookie_consent_v1", new Date().toISOString());
  });

  const results = [];
  const consoleErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push({ text: msg.text(), location: msg.location() });
    }
  });

  for (const routePath of paths) {
    const url = `${baseUrl}${routePath}`;
    const routeErrors = [];
    const handler = (msg) => {
      if (msg.type() === "error") routeErrors.push(msg.text());
    };
    page.on("console", handler);
    let status = 0;
    let error = null;
    try {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      status = res?.status() ?? 0;
      await page.waitForTimeout(800);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
    page.off("console", handler);
    results.push({
      path: routePath,
      url,
      status,
      ok: status >= 200 && status < 400 && !error,
      error,
      consoleErrors: routeErrors,
    });
  }

  await browser.close();

  const summary = {
    auditedAt: new Date().toISOString(),
    baseUrl,
    total: results.length,
    passed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    paths,
    results,
    globalConsoleErrorCount: consoleErrors.length,
  };

  await fs.writeFile(outPath, JSON.stringify(summary, null, 2), "utf8");
  console.log(`Route audit: ${summary.passed}/${summary.total} OK -> ${outPath}`);
  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
