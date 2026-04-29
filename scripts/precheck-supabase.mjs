/**
 * Ön kontrol — anahtarları stdout'a yazmaz (.env.local)
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());
const envPath = join(root, ".env.local");
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
for (const k of ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]) {
  console.log(`${k}=${env[k] ? "***DOLU***" : "***YOK***"}`);
}

const url = env.VITE_SUPABASE_URL;
const anon = env.VITE_SUPABASE_ANON_KEY;
const sr = env.SUPABASE_SERVICE_ROLE_KEY;

async function rest(table, headers, label) {
  const res = await fetch(`${url}/rest/v1/${table}?select=count&limit=1`, {
    headers: {
      Accept: "application/json",
      ...headers,
      Prefer: "count=exact",
    },
  });
  const range = res.headers.get("content-range") ?? "(no content-range)";
  console.log(`${label}: HTTP ${res.status} content-range=${range}`);
}

await rest(
  "profiles",
  { apikey: anon, Authorization: `Bearer ${anon}` },
  "profiles_anon"
);
await rest(
  "memberships",
  { apikey: sr, Authorization: `Bearer ${sr}` },
  "memberships_service_role"
);
await rest(
  "bid_bonds",
  { apikey: sr, Authorization: `Bearer ${sr}` },
  "bid_bonds_service_role"
);
