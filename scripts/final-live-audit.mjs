/**
 * Production SPA route audit — Playwright headless.
 * Usage: node scripts/final-live-audit.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = process.env.AUDIT_BASE || "https://ihaleal.vercel.app";

const ROUTES = [
  { path: "/", group: "Ana", note: "Luxury landing" },
  { path: "/ilanlar", group: "Pazar", note: "İlan listesi" },
  { path: "/ihaleler", group: "Pazar", note: "Canlı ihaleler" },
  { path: "/harita", group: "Pazar", note: "Harita + liste" },
  { path: "/karsilastir", group: "Pazar", note: "Karşılaştırma" },
  { path: "/degerleme", group: "Pazar", note: "Değerleme aracı" },
  { path: "/favoriler", group: "Pazar", note: "Favoriler" },
  { path: "/nasil-calisir", group: "Pazar", note: "Nasıl çalışır" },
  { path: "/kurumsal", group: "Kurumsal", note: "Kurumsal landing" },
  { path: "/kurumsal/iletisim", group: "Kurumsal", note: "İletişim formu" },
  { path: "/kurumsal/dashboard", group: "Kurumsal", note: "Org panel (auth gerekebilir)" },
  { path: "/arastirma", group: "Intelligence", note: "Araştırma hub" },
  { path: "/arastirma/war-room", group: "Intelligence", note: "War Room GIS" },
  { path: "/arastirma/ges", group: "Intelligence", note: "GES analiz" },
  { path: "/arastirma/parsel", group: "Intelligence", note: "Parsel istihbarat" },
  { path: "/arastirma/yatirim", group: "Intelligence", note: "→ hub redirect" },
  { path: "/kat-karsiligi", group: "KKA", note: "Kat karşılığı hub" },
  { path: "/kat-karsiligi/studio", group: "KKA", note: "İmar stüdyosu" },
  { path: "/giris", group: "Auth", note: "Giriş" },
  { path: "/kayit", group: "Auth", note: "Kayıt" },
  { path: "/dashboard", group: "Auth", note: "Dashboard" },
  { path: "/hakkimizda", group: "Kurumsal", note: "Hakkımızda" },
  { path: "/iletisim", group: "Kurumsal", note: "İletişim" },
  { path: "/blog", group: "İçerik", note: "Blog" },
  { path: "/kvkk", group: "Hukuk", note: "KVKK" },
  { path: "/gizlilik", group: "Hukuk", note: "Gizlilik" },
  { path: "/sss", group: "Hukuk", note: "SSS" },
  { path: "/ilan/demo-1", group: "Pazar", note: "Örnek ilan (ID değişebilir)" },
  { path: "/foo-bar-yok", group: "Test", note: "Bilinmeyen → NotFound beklenir" },
];

const MOJIBAKE = /Ã§|Ã¶|Ã¼|ÄŸ|Ä±|ÅŸ|ï¿½|뿯|├╝/;

async function auditRoute(page, route) {
  const errors = [];
  const consoleErrors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  let httpStatus = 0;
  try {
    const res = await page.goto(`${BASE}${route.path}`, {
      waitUntil: "networkidle",
      timeout: 45_000,
    });
    httpStatus = res?.status() ?? 0;
  } catch (e) {
    return {
      http: 0,
      status: "❌ Yüklenemedi",
      detail: String(e.message).slice(0, 120),
    };
  }

  await page.waitForTimeout(800);
  const bodyText = await page.locator("body").innerText().catch(() => "");
  const h1 = await page.locator("h1").first().textContent().catch(() => "");
  const title = await page.title();

  const is404 =
    /404|sayfa bulunamad|not found/i.test(bodyText.slice(0, 500)) ||
    /^404$/i.test((h1 || "").trim());
  const hasMojibake = MOJIBAKE.test(bodyText.slice(0, 8000));
  const chunkFail = [...errors, ...consoleErrors].some((e) =>
    /ChunkLoadError|dynamically imported module|Loading chunk/i.test(e),
  );

  let status = "✅ OK";
  let detail = (h1 || title || "").trim().slice(0, 80);

  if (route.path === "/foo-bar-yok") {
    status = is404 ? "✅ NotFound" : "⚠️ 404 bekleniyordu";
    detail = detail || "SPA fallback";
  } else if (httpStatus !== 200) {
    status = `❌ HTTP ${httpStatus}`;
  } else if (chunkFail) {
    status = "❌ Chunk hatası";
  } else if (is404) {
    status = "❌ React 404";
  } else if (hasMojibake) {
    status = "⚠️ Mojibake";
  } else if (!h1 && route.group !== "Auth") {
    status = "⚠️ H1 yok";
    detail = title;
  }

  return { http: httpStatus, status, detail };
}

async function main() {
  const outDir = path.join(process.cwd(), "_audit", "final");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "00.log"),
    new Date().toISOString() + "\n",
    "utf8",
  );

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const homeRes = await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const homeHtml = await homeRes?.text() ?? "";
  const bundleMatch = homeHtml.match(/index-[A-Za-z0-9_-]+\.js/);
  const bundle = bundleMatch?.[0] ?? "bilinmiyor";

  const results = [];
  for (const route of ROUTES) {
    process.stderr.write(`Testing ${route.path}...\n`);
    const r = await auditRoute(page, route);
    results.push({ ...route, ...r });
  }

  await browser.close();

  const now = new Date();
  const lines = [
    "# ihaleal.com — Final Durum Raporu",
    "",
    `**Tarih:** ${now.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`,
    `**Canlı URL:** ${BASE}`,
    `**Production bundle:** \`${bundle}\``,
    "",
    "> SPA testi Playwright ile yapıldı (gerçek React render). Sadece curl HTTP 200 her route için yeterli değildir.",
    "",
    "## Canlı Sayfa Testleri",
    "",
    "| Grup | Sayfa | HTTP | Durum | Görünen başlık / not |",
    "|------|-------|------|-------|----------------------|",
  ];

  for (const r of results) {
    lines.push(
      `| ${r.group} | \`${r.path}\` | ${r.http} | ${r.status} | ${r.note}${r.detail ? ` — ${r.detail.replace(/\|/g, "/")}` : ""} |`,
    );
  }

  const ok = results.filter((r) => r.status.startsWith("✅")).length;
  const warn = results.filter((r) => r.status.startsWith("⚠️")).length;
  const fail = results.filter((r) => r.status.startsWith("❌")).length;

  lines.push(
    "",
    "## Özet",
    "",
    `- ✅ Başarılı / beklenen: **${ok}**`,
    `- ⚠️ Uyarı: **${warn}**`,
    `- ❌ Hata: **${fail}**`,
    "",
  );

  fs.writeFileSync(path.join(outDir, "01_canli.md"), lines.join("\n"), "utf8");
  console.log(lines.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
