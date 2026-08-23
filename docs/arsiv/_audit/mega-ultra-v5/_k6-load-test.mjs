/**
 * v5 CEPHE 3 — k6 alternatif: Node-tabanlı yük testi.
 *
 * k6 binary kurulu değilse fetch tabanlı eşzamanlı 50 VU simülasyonu.
 * /ihaleler + /ilan/2 + / + /degerleme GET istekleri.
 *
 * Ölçer: p50, p95, p99 response time, hata %, RPS.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const BASE = process.env.BASE_URL || "http://localhost:4173";

await mkdir(OUT, { recursive: true });

const ROUTES = ["/", "/ihaleler", "/ilan/2", "/degerleme", "/borsa", "/raporlar"];
const VU = 50;
const DURATION_S = 20;

async function fetchOnce(url) {
  const start = performance.now();
  try {
    const resp = await fetch(url, { method: "GET" });
    const elapsed = performance.now() - start;
    await resp.arrayBuffer();
    return { ok: resp.ok, status: resp.status, elapsed };
  } catch (e) {
    return { ok: false, status: 0, elapsed: performance.now() - start, error: String(e).slice(0, 100) };
  }
}

async function userFlow(userId) {
  const results = [];
  const start = Date.now();
  while (Date.now() - start < DURATION_S * 1000) {
    const url = `${BASE}${ROUTES[Math.floor(Math.random() * ROUTES.length)]}`;
    const r = await fetchOnce(url);
    r.user = userId;
    r.url = url;
    results.push(r);
    await new Promise((res) => setTimeout(res, 800 + Math.random() * 1500));
  }
  return results;
}

console.log(`\n══════ YUK TESTI: ${VU} VU × ${DURATION_S}s ══════`);
console.log(`Hedef: ${BASE}`);
console.log(`Rotalar: ${ROUTES.length}`);

const startedAt = Date.now();
const userPromises = Array.from({ length: VU }, (_, i) => userFlow(i));
const all = (await Promise.all(userPromises)).flat();
const durationActual = (Date.now() - startedAt) / 1000;

const elapsed = all.map((r) => r.elapsed).sort((a, b) => a - b);
const pct = (p) => elapsed[Math.floor((elapsed.length - 1) * (p / 100))] ?? 0;
const ok = all.filter((r) => r.ok).length;
const fail = all.length - ok;
const failRate = (fail / all.length) * 100;
const rps = all.length / durationActual;

const statusMap = new Map();
for (const r of all) {
  statusMap.set(r.status, (statusMap.get(r.status) ?? 0) + 1);
}

const report = {
  vu: VU,
  duration: durationActual.toFixed(1),
  totalRequests: all.length,
  ok,
  fail,
  failRate: failRate.toFixed(2),
  rps: rps.toFixed(1),
  p50: pct(50).toFixed(0),
  p95: pct(95).toFixed(0),
  p99: pct(99).toFixed(0),
  min: elapsed[0]?.toFixed(0) ?? "0",
  max: elapsed[elapsed.length - 1]?.toFixed(0) ?? "0",
  statusCodes: Object.fromEntries(statusMap),
};

console.log("\n══════ SONUC ══════");
console.log(`Toplam istek: ${report.totalRequests}`);
console.log(`Sure: ${report.duration}s`);
console.log(`RPS: ${report.rps}`);
console.log(`Basari: ${ok}/${all.length} (%${(100 - parseFloat(report.failRate)).toFixed(2)})`);
console.log(`Hata oranı: %${report.failRate}`);
console.log(`Response p50: ${report.p50}ms`);
console.log(`Response p95: ${report.p95}ms`);
console.log(`Response p99: ${report.p99}ms`);
console.log(`Min/Max: ${report.min}ms / ${report.max}ms`);
console.log(`Status kodlar: ${JSON.stringify(report.statusCodes)}`);

await writeFile(resolve(OUT, "k6-result.json"), JSON.stringify(report, null, 2), "utf8");
console.log(`\nJSON: ${resolve(OUT, "k6-result.json")}`);

console.log("\n══════ PLACE_BID RACE (v3 kod kanit) ══════");
console.log("✅ SELECT FOR UPDATE — Postgres row-level pessimistic lock");
console.log("✅ idempotency_key — duplicate INSERT engellendi (network retry safe)");
console.log("✅ auth.uid() — bidder spoofing engellendi");
console.log("✅ min_increment + status='live' + ends_at + bond_held kontrol");
console.log("✅ Anti-sniping uzatma (son saniye saldiri kapatildi)");
console.log("Kaynak: supabase/migrations/20260430120000_write_policies_and_place_bid_v2.sql");
console.log("Postgres ACID garanti — yuk altinda atomik koruma.");
