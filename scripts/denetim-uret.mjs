// Ö2 denetim üretici — public/denetim.json'u GERÇEK git/grep çıktısından üretir.
// Sahte sabit değer yok: "öncesi" temel commit'ten (git show), "sonrası" çalışma ağacından okunur.
// Kullanım: node scripts/denetim-uret.mjs   (temel: DENETIM_BASE env, varsayılan Ö2 öncesi 2da8c8d)
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.DENETIM_BASE || "2da8c8d"; // sadelestirme serisinin ebeveyni
const git = (cmd) => execSync(`git ${cmd}`, { cwd: ROOT, encoding: "utf8" }).trim();

const PAGES = [
  "src/pages/Home.tsx",
  "src/components/SearchModal.tsx",
  "src/pages/SearchResults.tsx",
  "src/pages/Analytics.tsx",
  "src/pages/Reports.tsx",
  "src/pages/Documents.tsx",
  "src/pages/LiveAuctions.tsx",
  "src/pages/Messages.tsx",
  "src/pages/NotificationsPage.tsx",
  "src/pages/AuctionDetail.tsx",
  "src/pages/PricingPage.tsx",
  "src/pages/CitiesList.tsx",
  "src/pages/intelligence/IntelligenceHub.tsx",
  "src/pages/legal/LegalHubPage.tsx",
];

// --- WCAG kontrast (gerçek hesap; tablo değil) ---
const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
const lum = (hex) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const contrast = (fg, bg) => { const [a, b] = [lum(fg) + 0.05, lum(bg) + 0.05]; return a > b ? a / b : b / a; };
const BG_DARK = "#0B1120"; // --lux-bg-base

// tailwind.config.js'ten slate override'larını gerçek dosyadan çek (yoksa Tailwind varsayılanı)
function slatePalette(configText) {
  const def = { 500: "#64748B", 600: "#475569" };
  if (!configText) return def;
  const m = configText.match(/slate:\s*\{[^}]*?500:\s*"(#[0-9A-Fa-f]{6})"[^}]*?600:\s*"(#[0-9A-Fa-f]{6})"/s);
  return m ? { 500: m[1], 600: m[2] } : def;
}

function metrics(text, twConfigText) {
  if (!text) return null;
  const count = (re) => (text.match(re) || []).length;
  const slate = slatePalette(twConfigText);
  let dusukKontrastMetin = 0;
  for (const tone of ["500", "600"]) {
    if (contrast(slate[tone], BG_DARK) < 4.5) {
      dusukKontrastMetin += count(new RegExp(`text-slate-${tone}(?![0-9])`, "g"));
    }
  }
  const tiklaAc =
    count(/data-testid="[a-z-]*advanced[a-z-]*-toggle"/g) +
    (text.includes("HOME_MODULES") ? count(/\{ title: "/g) : 0) +
    (text.includes("PAGE_COMMANDS") ? 1 : 0); // komut paleti tek tıkla-aç yüzeyi
  return {
    hardcodedRenk: count(/#[0-9A-Fa-f]{6}\b/g),
    gradyan: count(/linear-gradient|radial-gradient|bg-gradient-to/g),
    koyuPanel: count(/bg-slate-9(?:00|50)|bg-\[#0[0-9A-Fa-f]/g),
    dusukKontrastMetin,
    tiklaAcModul: tiklaAc,
  };
}

const show = (ref, p) => {
  try { return execSync(`git show ${ref}:"${p}"`, { cwd: ROOT, encoding: "utf8" }); }
  catch { return ""; } // dosya o ref'te yoksa
};

const twNow = readFileSync(join(ROOT, "tailwind.config.js"), "utf8");
const twBase = show(BASE, "tailwind.config.js");

const sayfaMetrikleri = {};
for (const p of PAGES) {
  const oncesi = metrics(show(BASE, p), twBase);
  let simdi = "";
  try { simdi = readFileSync(join(ROOT, p), "utf8"); } catch { /* yok */ }
  const sonrasi = metrics(simdi, twNow);
  sayfaMetrikleri[p] = { oncesi, sonrasi };
}

const out = {
  commitSHA: git("rev-parse HEAD"),
  temelSHA: git(`rev-parse ${BASE}`),
  buildZamani: new Date().toISOString(),
  aciklama: "Ö2 sadeleştirme denetimi — değerler git show + regex sayımından üretildi (scripts/denetim-uret.mjs).",
  sayfaMetrikleri,
};

mkdirSync(join(ROOT, "public"), { recursive: true });
writeFileSync(join(ROOT, "public", "denetim.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`[denetim-uret] public/denetim.json yazildi — commit ${out.commitSHA.slice(0, 7)}, temel ${out.temelSHA.slice(0, 7)}`);
