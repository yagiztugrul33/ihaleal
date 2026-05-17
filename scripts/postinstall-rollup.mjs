import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { arch, platform } from "node:os";

if (platform() !== "linux" || arch() !== "x64") process.exit(0);

const require = createRequire(import.meta.url);
const pkg = "@rollup/rollup-linux-x64-gnu";
const ver = "4.60.3";
try {
  require.resolve(pkg);
} catch {
  console.log(`[postinstall] ${pkg}@${ver}`);
  execSync(`npm install ${pkg}@${ver} --no-save --no-package-lock`, { stdio: "inherit" });
}