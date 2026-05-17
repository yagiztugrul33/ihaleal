/**
 * UTF-16LE kaynak dosyaları Vite/esbuild'i kırar (\x00 hatası).
 * src altında .ts/.tsx/.js/.jsx tarar; şüpheli UTF-16LE ASCII deseninde çıkış kodu 1.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "src");
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs"]);
const ROOT_FILES = ["vite.config.ts"];

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = ent.name;
    if (name === "node_modules" || name === "dist" || name === ".git") continue;
    const p = path.join(dir, name);
    if (ent.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(name))) out.push(p);
  }
}

function looksUtf16LeAscii(buf) {
  if (buf.length < 40) return false;
  if (buf[0] === 0x69 && buf[1] === 0x6d && buf[2] === 0x70) return false;
  let run = 0;
  const cap = Math.min(buf.length - 1, 800);
  for (let i = 0; i < cap; i += 2) {
    const b0 = buf[i];
    const b1 = buf[i + 1];
    if (b1 === 0 && b0 >= 0x20 && b0 <= 0x7e) {
      run++;
      if (run >= 12) return true;
    } else {
      run = 0;
    }
  }
  return false;
}

const files = [];
walk(ROOT, files);
for (const name of ROOT_FILES) {
  const p = path.join(process.cwd(), name);
  if (fs.existsSync(p)) files.push(p);
}
const bad = [];
for (const f of files) {
  const buf = fs.readFileSync(f);
  if (looksUtf16LeAscii(buf)) bad.push(path.relative(process.cwd(), f));
}

if (bad.length) {
  console.error("[check-source-encoding] UTF-16LE şüphesi:");
  for (const f of bad) console.error("  -", f);
  process.exit(1);
}
console.log("[check-source-encoding] OK —", files.length, "dosya");
