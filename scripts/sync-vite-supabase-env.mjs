/**
 * Masaüstündeki supabase-keys.txt (veya ilk argüman: dosya yolu) içinden
 * VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY üretir; .env.local güncellenir.
 * Service role satırlarını bilinçli olarak yok sayar.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envLocal = join(root, ".env.local");

const defaultKeys = join(homedir(), "Desktop", "supabase-keys.txt");
const keysPath = process.argv[2] || defaultKeys;

if (!existsSync(keysPath)) {
  console.error("[sync] Bulunamadı:", keysPath);
  process.exit(1);
}

const raw = readFileSync(keysPath, "utf8");
const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

/** Klasik JWT (eyJ…) veya yeni public/anon formatı (sb_publishable_…). */
function isAnonKey(val) {
  return (
    typeof val === "string" &&
    (val.startsWith("eyJ") || val.startsWith("sb_publishable_"))
  );
}

let url = "";
let anon = "";

for (const line of lines) {
  const lower = line.toLowerCase();
  if (lower.includes("service_role") || lower.includes("service role")) continue;

  const eq = line.indexOf("=");
  if (eq > 0) {
    const key = line.slice(0, eq).trim().toLowerCase();
    let val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (
      key.includes("url") &&
      (key.includes("supabase") || key.includes("project")) &&
      val.startsWith("http")
    ) {
      url = val;
      continue;
    }
    if ((key.includes("anon") || key.includes("public")) && isAnonKey(val)) {
      anon = val;
      continue;
    }
    if (key === "vite_supabase_url" && val.startsWith("http")) {
      url = val;
      continue;
    }
    if (key === "vite_supabase_anon_key" && isAnonKey(val)) {
      anon = val;
      continue;
    }
  }

  if (!url && line.includes("supabase.co") && line.startsWith("http")) {
    const m = line.match(/https:\/\/[^\s"'<>]+/);
    if (m) url = m[0];
  }
  if (!anon && line.startsWith("eyJ")) {
    const m = line.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
    if (m) anon = m[0];
  }
  if (!anon && line.startsWith("sb_publishable_")) {
    const m = line.match(/sb_publishable_[A-Za-z0-9_-]+/);
    if (m) anon = m[0];
  }
}

if (!url || !anon) {
  console.error(
    "[sync] URL veya anon anahtar çıkarılamadı. supabase-keys.txt içinde SUPABASE_URL / anon public satırları olduğundan emin ol."
  );
  process.exit(1);
}

const header = `# Supabase (Vite) — scripts/sync-vite-supabase-env.mjs ile üretildi/güncellendi
# Service role burada tutulmaz.

`;
const body = `VITE_SUPABASE_URL=${url}
VITE_SUPABASE_ANON_KEY=${anon}
`;
writeFileSync(envLocal, header + body, "utf8");
console.log("[sync] .env.local güncellendi.");
