#!/usr/bin/env node
/**
 * IndexNow ile Yandex + Bing'e ilan/sayfa güncellemelerini anında bildirir.
 * Google zaten Search Console + sitemap crawl ile kendi hızında geliyor;
 * Yandex ve Bing için "değişti" sinyalini push eden tek kanal IndexNow'dur —
 * aksi halde botun tekrar uğrayıp fark etmesini haftalarca bekleriz.
 *
 * Kullanım: node scripts/submit-indexnow.mjs
 * Anahtar doğrulama dosyası: public/<key>.txt (IndexNow spesifikasyonu gereği
 * https://<host>/<key>.txt adresinde barınmalı — key değişirse dosya adı da değişmeli).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const HOST = "ihaleal.com";
const KEY = "9b15c3989629ed9c227f6cc3521288c5";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// api.indexnow.org tek bir gönderiyi katılımcı tüm motorlara (Yandex, Bing, Seznam...) dağıtır.
const ENDPOINT = "https://api.indexnow.org/indexnow";

const SITEMAP_FILES = [
  "public/sitemap.xml",
  "public/sitemap-programmatic.xml",
];

function extractUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function loadAllUrls() {
  const urls = new Set();
  for (const rel of SITEMAP_FILES) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) continue;
    for (const u of extractUrls(fs.readFileSync(file, "utf8"))) urls.add(u);
  }
  return [...urls];
}

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let chunks = "";
        res.on("data", (c) => (chunks += c));
        res.on("end", () => resolve({ status: res.statusCode, body: chunks }));
      },
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// IndexNow tek istekte en fazla 10.000 URL kabul eder; biz 500'lük parçalar
// halinde göndeririz ki tek bir hata tüm listeyi düşürmesin.
const BATCH_SIZE = 500;

async function main() {
  const urls = loadAllUrls();
  if (urls.length === 0) {
    console.log("Sitemap'lerde URL bulunamadı, IndexNow gönderilmedi.");
    return;
  }

  console.log(`IndexNow: ${urls.length} URL, ${HOST} için gönderiliyor...`);

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const payload = {
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: batch,
    };
    try {
      const res = await postJson(ENDPOINT, payload);
      if (res.status >= 200 && res.status < 300) {
        console.log(`  batch ${i / BATCH_SIZE + 1}: OK (${batch.length} URL, HTTP ${res.status})`);
      } else {
        console.warn(`  batch ${i / BATCH_SIZE + 1}: HTTP ${res.status} ${res.body}`.trim());
      }
    } catch (err) {
      console.warn(`  batch ${i / BATCH_SIZE + 1}: hata — ${err.message}`);
    }
  }
}

main();
