/**
 * Ön kontrol — anahtarları stdout'a yazmaz (.env.local)
 *
 * PostgREST: `select=count` geçerli bir kolon değildir; count için gerçek kolon + Prefer: count=exact kullanılır.
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

/** JWT payload içinden `role` (secret yazdırmaz). */
function decodeJwtRole(jwt) {
  if (!jwt || typeof jwt !== "string") return "(yok)";
  jwt = jwt.trim();
  const parts = jwt.split(".");
  if (parts.length < 2) return "(geçersiz-jwt)";
  try {
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const json = Buffer.from(b64, "base64").toString("utf8");
    const payload = JSON.parse(json);
    return payload.role ?? "(role-alanı-yok)";
  } catch {
    return "(decode-hatası)";
  }
}

const url = env.VITE_SUPABASE_URL;
const anon = env.VITE_SUPABASE_ANON_KEY;
const sr = env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`jwt_anon_role=${decodeJwtRole(anon)}`);
console.log(`jwt_service_role=${decodeJwtRole(sr)}`);

async function rest(table, headers, label) {
  const endpoint = `${url}/rest/v1/${table}?select=id&limit=1`;
  const res = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      ...headers,
      Prefer: "count=exact",
    },
  });
  const range = res.headers.get("content-range") ?? "(no content-range)";
  console.log(`${label}: HTTP ${res.status} content-range=${range}`);
  if (!res.ok) {
    const body = await res.text();
    const snippet = body.slice(0, 500).replace(/\s+/g, " ").trim();
    console.log(`${label}_body(first500)=${snippet || "(boş)"}`);
  }
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

console.log("");
console.log(
  "Not — memberships_service_role / bid_bonds_service_role: HTTP 403 PostgreSQL \"permission denied\" ise çoğunlukla service_role için GRANT SELECT eksiktir (migration 20260502120000_profiles_rls_recursion_service_grants.sql). jwt_service_role decode başarısızsa .env anahtarında satır sonu/bozuk JWT olabilir."
);
