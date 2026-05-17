import { execSync } from "node:child_process";
import { arch, platform } from "node:os";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ROLLUP_VERSION = "4.60.3";

function ensureRollupLinux() {
  if (platform() !== "linux" || arch() !== "x64") return;
  for (const pkg of ["@rollup/rollup-linux-x64-gnu", "@rollup/rollup-linux-x64-musl"]) {
    try {
      require.resolve(pkg);
    } catch {
      console.log(`[vite-build-safe] Installing ${pkg}@${ROLLUP_VERSION}`);
      execSync(`npm install ${pkg}@${ROLLUP_VERSION} --no-save --no-package-lock`, { stdio: "inherit" });
    }
  }
}

ensureRollupLinux();

const viteBin = join(__dirname, "..", "node_modules", "vite", "bin", "vite.js");
const nodeOptions = process.env.NODE_OPTIONS ?? "--max-old-space-size=8192";

console.log("[vite-build-safe] Running vite build via", viteBin);
execSync(`node "${viteBin}" build`, {
  stdio: "inherit",
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
});
