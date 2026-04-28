/**
 * Kaynak kod yedeği: node_modules, dist, coverage, .git hariç kopyalar.
 * Çıktı: Masaüstü/ihaleal-backups/ihaleal-YYYYMMDD-HHmmss/
 */
import { cpSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const EXCLUDE = new Set(["node_modules", "dist", "dist-ssr", "coverage", ".git", ".branches", ".temp"]);

function copyFiltered(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src, { withFileTypes: true })) {
    if (EXCLUDE.has(name.name)) continue;
    const from = join(src, name.name);
    const to = join(dest, name.name);
    if (name.isDirectory()) copyFiltered(from, to);
    else if (name.isFile()) cpSync(from, to);
  }
}

const stamp = new Date().toISOString().replace(/[:]/g, "-").slice(0, 16).replace("T", "-");
const base = join(homedir(), "Desktop", "ihaleal-backups");
const out = join(base, `ihaleal-${stamp}`);
mkdirSync(base, { recursive: true });
copyFiltered(root, out);
console.log("[backup] Tamam:", out);
