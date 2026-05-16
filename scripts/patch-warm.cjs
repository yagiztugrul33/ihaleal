const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

require("child_process").execSync("node scripts/fix-theme.mjs", { stdio: "inherit", cwd: root });

const files = {
  "src/sections/EndingSoon.tsx": [
    ['className="absolute inset-0 bg-gradient-to-b from-[#071228]/95 to-[#0d1326]"', 'className="absolute inset-0 section-warm-alt"'],
    ['font-bold text-white flex items-center', 'font-bold flex items-center" style={{ color: "var(--color-text)" }}'],
    ['text-slate-400 mt-1"', 'mt-1" style={{ color: "var(--color-text-muted)" }}'],
  ],
  "src/sections/HowItWorks.tsx": [
    ['font-bold text-white mb-4 tracking-tight"', 'section-heading mb-4 tracking-tight"'],
    ['text-slate-400 max-w-2xl mx-auto text-lg', 'section-subtitle mx-auto text-lg'],
    ['font-bold text-white mb-2 group-hover', 'font-bold mb-2 group-hover" style={{ color: "var(--color-text)" }}'],
    ['text-sm text-slate-400 leading-relaxed', 'text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}'],
    [
      "rounded-2xl border border-slate-200 bg-white/[0.04] backdrop-blur-xl p-6 hover:border-cyan-400/35",
      "card-warm p-6 hover:border-[var(--color-primary)]",
    ],
  ],
  "src/sections/Stats.tsx": [
    ['font-bold text-white mb-1"', 'font-bold mb-1" style={{ color: "var(--color-primary)" }}'],
    ['text-sm text-slate-500 font-medium"', 'text-sm font-medium" style={{ color: "var(--color-text-muted)" }}'],
    [
      "relative group rounded-2xl p-6 bg-gradient-to-br ${s.color} border border-slate-200 hover:border-cyan-400/20",
      "card-warm group bg-gradient-to-br ${s.color}",
    ],
  ],
};

for (const [file, pairs] of Object.entries(files)) {
  const p = path.join(root, file);
  let s = fs.readFileSync(p, "utf8");
  for (const [a, b] of pairs) {
    if (!s.includes(a)) console.warn("missing", file, a.slice(0, 50));
    else s = s.split(a).join(b);
  }
  s = s.replace(/<motion/g, "<div").replace(/<\/motion>/g, "</div>");
  fs.writeFileSync(p, s, "utf8");
  console.log("patched", file);
}

console.log("theme + sections ok");
