import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const base = (process.env.AUDIT_BASE_URL || "http://localhost:4180").replace(/\/$/, "");

const src = fs.readFileSync(path.join(root, "src/data/nasilCalisirContent.ts"), "utf8");
const paths = [...new Set([...src.matchAll(/path:\s*["']([^"']+)["']/g)].map((m) => m[1]))].sort();

const staticChecks = [
  "/how-it-works",
  "/how-it-works/adim/kesfet",
  "/how-it-works/adim/teklif",
  "/how-it-works/adim/kazan",
  "/how-it-works/adim/teslim",
  "/how-it-works/yol/alici",
  "/how-it-works/yol/satici",
  "/how-it-works/yol/danisman",
  "/how-it-works/yol/kurumsal",
  "/how-it-works/yol/operasyon",
  "/videos/ihaleal-tanitim.mp4",
];

const all = [...new Set([...staticChecks, ...paths])];

const rows = [];
for (const p of all) {
  const res = await fetch(`${base}${p}`, { redirect: "follow" });
  rows.push({ path: p, status: res.status, ok: res.status === 200 });
}

const bad = rows.filter((r) => !r.ok);
const videoPath = path.join(root, "public/videos/ihaleal-tanitim.mp4");
const videoStat = fs.existsSync(videoPath) ? fs.statSync(videoPath) : null;

const report = {
  verifiedAt: new Date().toISOString(),
  baseUrl: base,
  videoFile: {
    path: "public/videos/ihaleal-tanitim.mp4",
    exists: Boolean(videoStat),
    sizeBytes: videoStat?.size ?? 0,
  },
  routesChecked: rows.length,
  routesPassed: rows.length - bad.length,
  routesFailed: bad.length,
  failed: bad,
  passed: bad.length === 0,
};

const outPath = path.join(root, "reports/how-it-works-proof.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");

console.log(`How-it-works link proof: ${report.routesPassed}/${report.routesChecked} OK`);
console.log(`Video file: ${report.videoFile.exists ? report.videoFile.sizeBytes + " bytes" : "MISSING"}`);
console.log(`Report -> ${outPath}`);

if (bad.length) process.exit(1);
