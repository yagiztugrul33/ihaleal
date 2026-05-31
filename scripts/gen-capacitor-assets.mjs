/**
 * Capacitor / App Store asset üretici.
 *
 * Üretilen dosyalar:
 *  mobile/assets/icon-1024.png       — App Store / Google Play store ikonu
 *  mobile/assets/icon-foreground.png — Adaptive icon foreground (1024×1024, padding'li)
 *  mobile/assets/splash-2732.png     — Capacitor portrait splash (2732×2732 cover)
 *  mobile/assets/splash-dark-2732.png
 *
 * Kaynak: public/icon-512.png (mevcut 512×512 marka ikonu).
 * Tema: koyu lacivert (#0B1120) — PWA manifest theme_color ile aynı.
 *
 * Sharp kütüphanesi (devDep) ile çalışır. Bağımsız çalıştırılır:
 *   node scripts/gen-capacitor-assets.mjs
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = process.cwd();
const SRC = resolve(ROOT, "public", "icon-512.png");
const OUT = resolve(ROOT, "mobile", "assets");
const BG = { r: 11, g: 17, b: 32, alpha: 1 }; // #0B1120

async function ensureOut() {
  await mkdir(OUT, { recursive: true });
}

async function genStoreIcon1024() {
  // 1024×1024 düz arka plan + ortada 760×760 logo
  const logoSize = 760;
  const logo = await sharp(SRC).resize(logoSize, logoSize, { fit: "contain" }).toBuffer();
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(resolve(OUT, "icon-1024.png"));
  console.log("  ✅ icon-1024.png (App Store / Play Store master)");
}

async function genAdaptiveForeground() {
  // Android adaptive icon foreground: %66 inner safe area (1024 → 676 padded)
  const logoSize = 600;
  const logo = await sharp(SRC).resize(logoSize, logoSize, { fit: "contain" }).toBuffer();
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(resolve(OUT, "icon-foreground.png"));
  console.log("  ✅ icon-foreground.png (Android adaptive)");
}

async function genAdaptiveBackground() {
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: BG },
  })
    .png()
    .toFile(resolve(OUT, "icon-background.png"));
  console.log("  ✅ icon-background.png (Android adaptive — düz #0B1120)");
}

async function genSplash2732() {
  // 2732×2732 koyu zemin + ortada 600×600 logo (Capacitor safe area)
  const logoSize = 600;
  const logo = await sharp(SRC).resize(logoSize, logoSize, { fit: "contain" }).toBuffer();
  await sharp({
    create: { width: 2732, height: 2732, channels: 4, background: BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(resolve(OUT, "splash-2732.png"));
  console.log("  ✅ splash-2732.png (iOS + Android universal)");
}

async function genSplashDark() {
  // Dark variant — şu an aynı, ileride daha koyu / gradient eklenebilir
  const logoSize = 600;
  const logo = await sharp(SRC).resize(logoSize, logoSize, { fit: "contain" }).toBuffer();
  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: { r: 5, g: 8, b: 16, alpha: 1 },
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(resolve(OUT, "splash-dark-2732.png"));
  console.log("  ✅ splash-dark-2732.png (dark mode)");
}

async function main() {
  console.log("Capacitor asset üretimi başlıyor…");
  await ensureOut();
  await genStoreIcon1024();
  await genAdaptiveForeground();
  await genAdaptiveBackground();
  await genSplash2732();
  await genSplashDark();
  console.log("\nBitti.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
