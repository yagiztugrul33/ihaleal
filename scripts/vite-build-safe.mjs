/**
 * Linux CI/Vercel: lockfile Windows'ta uretildiyse @rollup/rollup-linux-* eksik kalabilir.
 */
import { execSync } from "node:child_process";
import { arch, platform } from "node:os";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROLLUP_VERSION = "4.60.3";

function ensureRollupLinux() {
  if (platform() !== "linux" || arch() !== "x64") return;

  for (const pkg of ["@rollup/rollup-linux-x64-gnu", "@rollup/rollup-linux-x64-musl"]) {
    try {
      require.resolve(pkg);
    } catch {
      console.log(`[vite-build-safe] Installing missing ${pkg}@${ROLLUP_VERSION}`);
      execSync(`npm install ${pkg}@${ROLLUP_VERSION} --no-save --no-package-lock`, {
        stdio: "inherit",
      });
    }
  }
}

ensureRollupLinux();

const nodeOptions = process.env.NODE_OPTIONS ?? "--max-old-space-size=6144";
execSync("vite build", {
  stdio: "inherit",
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
});