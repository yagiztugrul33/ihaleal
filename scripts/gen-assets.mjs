/**
 * PNG üretimi: og-image, PWA ikonları, favicon, logo/, social/, email/ (KIMI eksikleri kapatır).
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
          <stop offset="0%" style="stop-color:#0B1120"/>
          <stop offset="100%" style="stop-color:#111827"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <text x="60" y="${Math.round(h * 0.35)}" font-family="Segoe UI,system-ui,sans-serif" font-size="${Math.round(h * 0.09)}" fill="#38bdf8" font-weight="700">${title}</text>
      <text x="60" y="${Math.round(h * 0.48)}" font-family="Segoe UI,system-ui,sans-serif" font-size="${Math.round(h * 0.035)}" fill="#94a3b8">${subtitle}</text>
    </svg>`
  );

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

async function main() {
  ensureDir(pub);
  ensureDir(path.join(pub, "logo"));
  ensureDir(path.join(pub, "social"));
  ensureDir(path.join(pub, "email"));

  // OG boyutu src/data/homeSeo.ts OG_IMAGE ile aynı kalmalı (Vite index inject + applySeoToDocument).
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

  /** Android adaptive (maskable): içerik ~%80 güvenli alanda, kenarlarda kırpma toleransı. */
  async function writeMaskablePng(outSize) {
    const inner = Math.round(outSize * 0.8);
    const top = Math.round((outSize - inner) / 2);
    const left = top;
    const padded = await sharp(iconSvg).resize(inner, inner).png().toBuffer();
    await sharp({
      create: {
        width: outSize,
        height: outSize,
        channels: 3,
        background: { r: 10, g: 15, b: 30 },
      },
    })
      .composite([{ input: padded, top, left }])
      .png()
      .toFile(path.join(pub, `icon-maskable-${outSize}.png`));
  }
  await writeMaskablePng(192);
  await writeMaskablePng(512);

  await sharp(iconSvg).resize(32, 32).png().toFile(path.join(pub, "favicon.png"));

  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(pub, "logo", "logo-mark-512.png"));

  await sharp({
    create: { width: 1200, height: 1200, channels: 3, background: { r: 15, g: 23, b: 42 } },
  })
    .composite([
      { input: svgOverlay(1200, 1200, "ihaleal.com", "Sosyal paylaşım — kare görsel"), top: 0, left: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(pub, "social", "share-card-1200.png"));

  await sharp({
    create: { width: 600, height: 160, channels: 3, background: { r: 10, g: 15, b: 30 } },
  })
    .composite([{ input: svgOverlay(600, 160, "ihaleal.com", "E-posta üst görseli"), top: 0, left: 0 }])
    .png()
    .toFile(path.join(pub, "email", "email-header-600.png"));

  for (const name of ["logo", "social", "email"]) {
    const readme = path.join(pub, name, "README.txt");
    if (!fs.existsSync(readme)) {
      fs.writeFileSync(
        readme,
        "Bu klasördeki PNG dosyaları scripts/gen-assets.mjs ile üretilir (tur #9 KIMI doğrulama).\n",
        "utf8"
      );
    }
  }

  console.log(
    "Wrote public/og-image.png, icon-192.png, icon-512.png, icon-maskable-192.png, icon-maskable-512.png, favicon.png, logo/logo-mark-512.png, social/share-card-1200.png, email/email-header-600.png"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
