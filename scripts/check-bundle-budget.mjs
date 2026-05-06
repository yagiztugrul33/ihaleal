import fs from "node:fs";
import path from "node:path";

const assetsDir = path.join(process.cwd(), "dist", "assets");
const maxEntryBytes = 800 * 1024;

if (!fs.existsSync(assetsDir)) {
  console.error("[bundle-budget] missing dist/assets; run npm run build first");
  process.exit(1);
}

const files = fs.readdirSync(assetsDir).filter((f) => f.endsWith(".js"));
let worst = { name: "", size: 0 };
for (const f of files) {
  const p = path.join(assetsDir, f);
  const s = fs.statSync(p).size;
  if (s > worst.size) {
    worst = { name: f, size: s };
  }
}

if (worst.size > maxEntryBytes) {
  console.error(
    `[bundle-budget] FAIL largest ${worst.name} = ${worst.size} B > limit ${maxEntryBytes} B`,
  );
  process.exit(1);
}

console.log(`[bundle-budget] OK largest ${worst.name} = ${worst.size} B (limit ${maxEntryBytes} B)`);