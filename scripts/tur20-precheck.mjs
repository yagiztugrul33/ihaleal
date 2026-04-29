/**
 * Tur #20 ön kontrol — anahtar sızdırmaz
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const envPath = join(process.cwd(), ".env.local");
const env = {};
if (!existsSync(envPath)) {
  console.log("NO_ENV_FILE");
  process.exit(1);
}
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  )
    v = v.slice(1, -1);
  env[m[1]] = v;
}

const url = env.VITE_SUPABASE_URL;
const sr = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !sr) {
  console.log("MISSING_URL_OR_SERVICE_ROLE");
  process.exit(1);
}

async function check(table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=count&limit=1`, {
    headers: {
      apikey: sr,
      Authorization: `Bearer ${sr}`,
      Accept: "application/json",
      Prefer: "count=exact",
    },
  });
  const cr = res.headers.get("content-range");
  console.log(`${table}: HTTP ${res.status} content-range=${cr ?? "(yok)"}`);
}

await check("memberships");
await check("bid_bonds");
await check("audit_log");
