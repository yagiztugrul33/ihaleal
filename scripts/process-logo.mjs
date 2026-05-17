import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const input = path.join(process.env.USERPROFILE || "", "Downloads", "logom.png");
const output = path.join(root, "public", "ihaleal-logo.png");
const BG = { r: 8, g: 17, b: 32 };

function isCheckerboard(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min < 22 && min >= 65 && max <= 235;
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const pixels = Buffer.from(data);

for (let i = 0; i < w * h; i++) {
  const o = i * 4;
  if (isCheckerboard(pixels[o], pixels[o + 1], pixels[o + 2])) pixels[o + 3] = 0;
}

let minX = w, minY = h, maxX = 0, maxY = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (pixels[(y * w + x) * 4 + 3] > 12) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
}

const pad = 4;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(w - 1, maxX + pad);
maxY = Math.min(h - 1, maxY + pad);
const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;

await sharp(pixels, { raw: { width: w, height: h, channels: 4 } })
  .extract({ left: minX, top: minY, width: cropW, height: cropH })
  .flatten({ background: BG })
  .png({ compressionLevel: 9 })
  .toFile(output);

const meta = await sharp(output).metadata();
console.log("Wrote " + output + " (" + meta.width + "x" + meta.height + ")");