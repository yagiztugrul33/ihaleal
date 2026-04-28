/**
 * Birleşik migration SQL üretir (Supabase SQL Editor için).
 * Çalıştır: node --env-file=.env.local scripts/push-migrations.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const migrationsDir = join(root, "supabase", "migrations");

function loadEnvLocal() {
  try {
    const p = join(root, ".env.local");
    const raw = readFileSync(p, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      const k = m[1];
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      if (process.env[k] === undefined) process.env[k] = v;
    }
  } catch {
    /* yoksa sadece process.env */
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

console.log(`Found ${files.length} migration files`);

let combined = `-- ihaleal.com — birleşik migration\n-- Tarih: ${new Date().toISOString()}\n\n`;
for (const f of files) {
  combined += `-- ===== ${f} =====\n`;
  combined += readFileSync(join(migrationsDir, f), "utf8");
  combined += "\n\n";
}

const out = join(root, "supabase", "manual_push.sql");
writeFileSync(out, combined, "utf8");
console.log("Written:", out);
console.log("Size:", combined.length, "chars");
