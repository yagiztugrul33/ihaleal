/**
 * PNG üretimi: og-image + PWA ikonları (sharp gerekir: npm i -D sharp && npm run gen:assets)
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "..", "public");

const svgOverlay = (w, h, title, subtitle) =>
  Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0f1e"/>
          <stop offset="100%" style="stop-color:#111827"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <text x="60" y="${Math.round(h * 0.35)}" font-family="Segoe UI,system-ui,sans-serif" font-size="${Math.round(h * 0.09)}" fill="#38bdf8" font-weight="700">${title}</text>
      <text x="60" y="${Math.round(h * 0.48)}" font-family="Segoe UI,system-ui,sans-serif" font-size="${Math.round(h * 0.035)}" fill="#94a3b8">${subtitle}</text>
    </svg>`
  );

async function main() {
  if (!fs.existsSync(pub)) fs.mkdirSync(pub, { recursive: true });

  await sharp({
    create: { width: 1200, height: 630, channels: 3, background: { r: 10, g: 15, b: 30 } },
  })
    .composite([{ input: svgOverlay(1200, 630, "ihaleal.com", "Gayrimenkul ihale · AI analiz · Demo platform"), top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(pub, "og-image.png"));

  const iconSvg = svgOverlay(512, 512, "İ", "ihaleal");
  for (const size of [192, 512]) {
    await sharp(iconSvg).resize(size, size).png().toFile(path.join(pub, `icon-${size}.png`));
  }

  console.log("Wrote public/og-image.png, icon-192.png, icon-512.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
