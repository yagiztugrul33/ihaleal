/**
 * Entegrasyon cekirdek testleri (GES + parsel motorlari).
 * Vitest uzerinden TypeScript modullerini calistirir.
 */
const { spawnSync } = require("node:child_process");

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, env: process.env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("=== ENTEGRASYON CEKIRDEK TESTLERI BASLATILIYOR ===\n");
run("npx", ["vitest", "run", "tests/engineering/integration/coreIntegration.test.ts"]);
console.log("\n=== TUM CEKIRDEK TESTLER BASARIYLA GECTI (0 HATA) ===");