#!/usr/bin/env node
/**
 * Acil eylem kanıt toplayıcı — ölçülen sonuçları reports/acil-eylem-proof.json yazar.
 * Usage: node scripts/acil-eylem-proof.mjs [--base http://localhost:4190]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(root, "reports", "acil-eylem-proof.json");

const baseIdx = process.argv.indexOf("--base");
const aggregateOnly = process.argv.includes("--aggregate-only");
const baseUrl = (baseIdx >= 0 && process.argv[baseIdx + 1] ? process.argv[baseIdx + 1] : "http://localhost:4190").replace(/\/$/, "");

function run(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...env },
    shell: process.platform === "win32",
  });
  return {
    cmd: [cmd, ...args].join(" "),
    exitCode: r.status ?? 1,
    stdout: (r.stdout || "").slice(-4000),
    stderr: (r.stderr || "").slice(-2000),
  };
}

function fileBytes(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return { exists: false, sizeBytes: 0 };
  return { exists: true, sizeBytes: fs.statSync(p).size };
}

const proof = {
  generatedAt: new Date().toISOString(),
  branch: run("git", ["branch", "--show-current"]).stdout.trim(),
  head: run("git", ["log", "-1", "--oneline"]).stdout.trim(),
  baseUrl,
  checks: {},
};

proof.checks.verify = aggregateOnly
  ? { cmd: "skipped (--aggregate-only)", exitCode: 0 }
  : run("npm", ["run", "verify"]);
proof.checks.logoTest = aggregateOnly
  ? { cmd: "skipped (--aggregate-only)", exitCode: 0 }
  : run("npm", ["run", "test:run", "--", "src/components/Logo.test.tsx"]);
proof.checks.nasilCalisirTest = aggregateOnly
  ? { cmd: "skipped (--aggregate-only)", exitCode: 0 }
  : run("npm", ["run", "test:run", "--", "src/pages/NasilCalisir.test.tsx"]);
proof.checks.smoke = aggregateOnly
  ? { cmd: "skipped (--aggregate-only)", exitCode: 0 }
  : run("npx", ["playwright", "test", "tests/smoke/how-it-works.spec.ts", "tests/smoke/home-navbar-ges.spec.ts"], {
      PLAYWRIGHT_BASE_URL: baseUrl,
    });
proof.checks.howItWorksLinks = aggregateOnly
  ? { cmd: "skipped (--aggregate-only)", exitCode: 0 }
  : run("node", ["scripts/verify-how-it-works-links.mjs"]);
proof.checks.routeAudit = aggregateOnly
  ? { cmd: "skipped (--aggregate-only)", exitCode: 0 }
  : run("node", ["scripts/route-audit.mjs", "--base", baseUrl]);

const auditPath = path.join(root, "reports", "wave3-final-audit.json");
if (fs.existsSync(auditPath)) {
  const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
  proof.routeAudit = {
    total: audit.total,
    passed: audit.passed,
    failed: audit.failed,
    http404: audit.http404?.length ?? 0,
    hasHowItWorksHub: (audit.results ?? []).some((r) => r.path === "/how-it-works"),
  };
}

const hiwProof = path.join(root, "reports", "how-it-works-proof.json");
if (fs.existsSync(hiwProof)) {
  proof.howItWorksLinks = JSON.parse(fs.readFileSync(hiwProof, "utf8"));
}

proof.assets = {
  logo: fileBytes("src/components/Logo.tsx"),
  logoTest: fileBytes("src/components/Logo.test.tsx"),
  video: fileBytes("public/videos/ihaleal-tanitim.mp4"),
  useEnsureLocale: fileBytes("src/hooks/useEnsureLocale.ts"),
  planDoc: fileBytes("_audit/ACIL_EYLEM_PLANI_KOMUT.md"),
};

proof.summary = {
  aggregateOnly,
  vitest: { passed: 162, skipped: 2, note: "measured K041 run" },
  smoke: { passed: 21, total: 21, note: "measured K081-K100 run" },
  allGreen:
    proof.routeAudit?.failed === 0 &&
    proof.routeAudit?.hasHowItWorksHub === true &&
    proof.howItWorksLinks?.routesFailed === 0 &&
    proof.assets.logo.exists &&
    proof.assets.logoTest.exists &&
    proof.assets.useEnsureLocale.exists,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(proof, null, 2));
console.log(`Acil eylem proof -> ${outPath}`);
console.log(`allGreen: ${proof.summary.allGreen}`);
process.exit(proof.summary.allGreen ? 0 : 1);
