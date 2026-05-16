import fs from "fs";
import { execSync } from "child_process";

const PAGE_GRAD = "linear-gradient(180deg, #20374A 0%, #314A5A 45%, #495459 100%)";

const p = "scripts/fix-theme.mjs";
let s = fs.readFileSync(p, "utf8");

s = s.replace("--color-bg: #b8e8ef;", "--color-bg: #314A5A;");
s = s.replace("--color-bg-card: #e2e8f0;", "--color-bg-card: rgba(255, 255, 255, 0.08);");
s = s.replace("--color-bg-soft: #9dd4e3;", "--color-bg-soft: rgba(255, 255, 255, 0.06);");
s = s.replace("--color-bg-elevated: #e2e8f0;", "--color-bg-elevated: rgba(255, 255, 255, 0.1);");
s = s.replace("--color-text: #1f2937;", "--color-text: #f1f5f9;");
s = s.replace("--color-text-muted: #64748b;", "--color-text-muted: #cbd5e1;");
s = s.replace("--color-border: #b8dde8;", "--color-border: rgba(255, 255, 255, 0.14);");
s = s.replace("--color-border-strong: #8ec5d4;", "--color-border-strong: rgba(255, 255, 255, 0.22);");
s = s.replace(/--gradient-warm:[^;]+;/, `--gradient-page: ${PAGE_GRAD};\n  --gradient-warm: ${PAGE_GRAD};`);
s = s.replace(/--gradient-hero:[^;]+;/, `--gradient-hero: ${PAGE_GRAD};`);

const htmlBlock = `html,
body {
  overflow-x: clip;
  max-width: 100%;
}

html,
body,
#root {
  background: var(--gradient-page) !important;
  background-color: var(--color-bg) !important;
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 100%;
  color: var(--color-text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`;

s = s.replace(/html,\s*body,\s*#root \{[\s\S]*?-moz-osx-font-smoothing: grayscale;\s*\}/, htmlBlock);
s = s.replace(/\.section-warm \{[\s\S]*?\}\s*\.section-warm-alt \{[\s\S]*?\}/, ".section-warm,\n.section-warm-alt {\n  background: transparent !important;\n}");
s = s.replace(/\.page-shell,[\s\S]*?background-color: var\(--color-bg\) !important;\s*\}/, `.page-shell,\n.page-shell.page-shell-gradient,\n[data-theme="light"] .page-shell {\n  background: var(--gradient-page) !important;\n  background-color: var(--color-bg) !important;\n  background-attachment: fixed;\n  background-repeat: no-repeat;\n  background-size: cover;\n}\n\nmain > section {\n  background: transparent !important;\n}`);
s = s.replace(".card-warm {\n  background: var(--color-bg-card);", ".card-warm {\n  background: var(--color-bg-card);\n  backdrop-filter: blur(8px);");
s = s.replace("  background: var(--color-bg-soft);\n  color: var(--color-primary);", "  background: rgba(255, 255, 255, 0.1);\n  color: #f8fafc;");

fs.writeFileSync(p, s, "utf8");
execSync("node scripts/fix-theme.mjs", { stdio: "inherit" });
console.log("done");