import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const strict = process.argv.includes("--strict");
const root = process.cwd();
const envPath = join(root, ".env.local");
const env = {};

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]] = v;
  }
}

const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "";
const anon = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "";
const payment = (process.env.VITE_PAYMENT_MODE || env.VITE_PAYMENT_MODE || "mock").toLowerCase();
const allowLocal = process.env.VITE_ALLOW_LOCAL_AUTH || env.VITE_ALLOW_LOCAL_AUTH || "";

const issues = [];

if (!url || url.includes("placeholder") || url.includes("your-project")) {
  issues.push("VITE_SUPABASE_URL missing or placeholder");
}
if (!anon || anon.includes("placeholder") || anon.includes("xxxxxxxx")) {
  issues.push("VITE_SUPABASE_ANON_KEY missing or placeholder");
}
if (strict && allowLocal === "true") {
  issues.push("VITE_ALLOW_LOCAL_AUTH must not be true in production");
}
if (strict && payment === "live") {
  issues.push("VITE_PAYMENT_MODE=live requires PSP wiring audit before deploy");
}

for (const i of issues) {
  console.log(strict ? "ERROR" : "WARN", i);
}

if (strict && issues.length > 0) process.exit(1);
console.log("validate-build-env ok", { strict, issueCount: issues.length });