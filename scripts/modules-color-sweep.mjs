#!/usr/bin/env node
// modules/ (AI Intelligence Hub) sayfaları statik bilgilendirme/hesaplayıcı
// ekranlarıdır — Borsa'nın aksine gerçek canlı-veri trendi yok, dolayısıyla
// tüm dekoratif kromatik renkler güvenle nötre çevrilebilir (renk-kaosu bulgusu).
import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "glob";

const files = globSync([
  "src/pages/modules/**/*.tsx",
  "src/components/energy/GesIntelligenceWorkbench.tsx",
  "src/components/home/LiveEarthquakeTicker.tsx",
  "src/components/location/LocationIntelligenceWorkbench.tsx",
  "src/components/valuation/ValuationWorkbench.tsx",
  "src/pages/CampaignsPage.tsx",
  "src/pages/InternationalInvestorPage.tsx",
  "src/pages/LoyaltyProgramPage.tsx",
  "src/pages/mega/CommissionCalculator.tsx",
  "src/sections/PremiumCinematicHome.tsx",
]);
const hues = "cyan|emerald|rose|amber|violet|blue|indigo|fuchsia|pink|teal|sky|purple|yellow|red|orange|lime";

const rules = [
  // border-color/40 gibi opaklıklı kenarlıklar
  { re: new RegExp(`\\bborder-(?:${hues})-[0-9]+(?:/[0-9]+)?\\b`, "g"), to: "border-[var(--cizgi)]" },
  { re: new RegExp(`\\bbg-(?:${hues})-[0-9]+(?:/[0-9]+)?\\b`, "g"), to: "bg-[var(--zemin-yumusak)]" },
  { re: new RegExp(`\\btext-(?:${hues})-[0-9]+(?:/[0-9]+)?\\b`, "g"), to: "text-[var(--metin-ikincil)]" },
  { re: new RegExp(`\\bfrom-(?:${hues})-[0-9]+(?:/[0-9]+)?\\b`, "g"), to: "from-[var(--zemin-yumusak)]" },
  { re: new RegExp(`\\bto-(?:${hues})-[0-9]+(?:/[0-9]+)?\\b`, "g"), to: "to-[var(--zemin-yumusak)]" },
  { re: new RegExp(`\\bvia-(?:${hues})-[0-9]+(?:/[0-9]+)?\\b`, "g"), to: "via-[var(--zemin-yumusak)]" },
  { re: new RegExp(`\\bring-(?:${hues})-[0-9]+(?:/[0-9]+)?\\b`, "g"), to: "ring-[var(--cizgi)]" },
];

let filesChanged = 0;
let hits = 0;
for (const file of files) {
  const original = readFileSync(file, "utf8");
  let next = original;
  for (const rule of rules) {
    const matches = next.match(rule.re);
    if (matches) hits += matches.length;
    next = next.replace(rule.re, rule.to);
  }
  if (next !== original) {
    writeFileSync(file, next, "utf8");
    filesChanged++;
  }
}
console.log(`Files scanned: ${files.length}`);
console.log(`Files changed: ${filesChanged}`);
console.log(`Chromatic class hits replaced: ${hits}`);
