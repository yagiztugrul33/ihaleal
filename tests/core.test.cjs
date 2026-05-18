const { spawnSync } = require("node:child_process");

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, env: process.env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run("npx", ["tsc", "-p", "tsconfig.test.json", "--noEmit"]);
run("npx", ["vitest", "run", "tests/engineering/verified-core.test.ts"]);
run("npx", ["vitest", "run", "tests/engineering/integration/coreIntegration.test.ts"]);
console.log("core.test.cjs OK");
