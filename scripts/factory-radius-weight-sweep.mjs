#!/usr/bin/env node
// Toplu Factory normalizasyonu: border-radius 3/10/20px ölçeğine, font-weight 400'e.
// rounded-full BİLİNÇLİ OLARAK dokunulmuyor (avatar/nokta/pil-buton ayrımı mekanik
// yapılamaz — insan gözüyle tek tek karar gerektirir, bu script'in kapsamı dışında).
import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "glob";

const files = globSync("src/**/*.{ts,tsx}", { ignore: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"] });

const radiusRules = [
  { re: /\brounded((?:-(?:t|b|l|r|s|e|tl|tr|bl|br|ss|se|es|ee))?)-(sm|md)\b/g, to: "rounded$1-[3px]" },
  { re: /\brounded((?:-(?:t|b|l|r|s|e|tl|tr|bl|br|ss|se|es|ee))?)-lg\b/g, to: "rounded$1-[10px]" },
  { re: /\brounded((?:-(?:t|b|l|r|s|e|tl|tr|bl|br|ss|se|es|ee))?)-(xl|2xl|3xl)\b/g, to: "rounded$1-[20px]" },
  { re: /(?<![\w-])rounded(?![\w-])/g, to: "rounded-[3px]" },
];
const weightRe = /\bfont-(bold|extrabold|black|semibold|medium)\b/g;

let filesChanged = 0;
let radiusHits = 0;
let weightHits = 0;

for (const file of files) {
  const original = readFileSync(file, "utf8");
  let next = original;

  for (const rule of radiusRules) {
    const matches = next.match(rule.re);
    if (matches) radiusHits += matches.length;
    next = next.replace(rule.re, rule.to);
  }

  const matches = next.match(weightRe);
  if (matches) weightHits += matches.length;
  next = next.replace(weightRe, "font-normal");

  if (next !== original) {
    writeFileSync(file, next, "utf8");
    filesChanged++;
  }
}

console.log(`Files scanned: ${files.length}`);
console.log(`Files changed: ${filesChanged}`);
console.log(`Radius class hits: ${radiusHits}`);
console.log(`Font-weight class hits: ${weightHits}`);
