#!/usr/bin/env node
// Sitewide dekoratif renk-kaosu temizliği (Faz 1/2/3 denetiminde yer almayan
// yeni bulgu). Ödeme/üyelik/durum-anlamlı dosyalar KASITLI OLARAK HARİÇ —
// bunlar ayrı, elle incelenir (success/error/pending semantiği mekanik
// regex ile bozulabilir).
import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "glob";

const EXCLUDE = new Set([
  "src/pages/payment/PaymentStartPage.tsx",
  "src/pages/payment/PaymentSuccessPage.tsx",
  "src/pages/payment/CommissionPage.tsx",
  "src/components/Toast.tsx",
  "src/components/premium/PremiumGate.tsx",
  "src/pages/addon/AddonShopPage.tsx",
  "src/pages/membership/MyMembershipPage.tsx",
  "src/pages/membership/YillikUyelik.tsx",
  "src/pages/MapPage.tsx",
  "src/pages/PricingPage.tsx",
  "src/components/risk/EarthquakeRiskWorkbench.tsx",
]);

const files = globSync(["src/pages/**/*.tsx", "src/components/**/*.tsx", "src/sections/**/*.tsx"], {
  ignore: ["src/**/*.test.tsx", "src/**/*.spec.tsx"],
}).filter((f) => !EXCLUDE.has(f));

const hues = "cyan|emerald|rose|amber|violet|blue|indigo|fuchsia|pink|teal|sky|purple|yellow|red|orange|lime|green";
const rules = [
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
const changedFiles = [];
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
    changedFiles.push(file);
  }
}
console.log(`Files scanned: ${files.length} (${EXCLUDE.size} excluded for manual review)`);
console.log(`Files changed: ${filesChanged}`);
console.log(`Chromatic class hits replaced: ${hits}`);
writeFileSync("/tmp/sitewide-sweep-changed-files.txt", changedFiles.join("\n"), "utf8");
