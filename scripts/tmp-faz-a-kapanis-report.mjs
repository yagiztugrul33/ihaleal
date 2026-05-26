import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const APP = path.join(SRC, "App.tsx");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function countContentLines(file) {
  const lines = read(file).split(/\r?\n/);
  return lines.filter((line) => line.trim() && !line.trim().startsWith("//")).length;
}

function classifyContent(lines) {
  if (lines <= 30) return "BOS";
  if (lines < 160) return "SIG";
  return "DOLU";
}

function parseRouteMap() {
  const src = read(APP);
  const importMap = new Map();

  const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+"([^"]+)";/g;
  for (const match of src.matchAll(importRegex)) {
    const [, symbol, rel] = match;
    if (rel.startsWith("./") || rel.startsWith("@/")) importMap.set(symbol, rel);
  }

  const lazyRegex = /const\s+([A-Za-z0-9_]+)\s*=\s*lazy\(\(\)\s*=>\s*import\("([^"]+)"\)\);/g;
  for (const match of src.matchAll(lazyRegex)) {
    const [, symbol, rel] = match;
    if (rel.startsWith("./") || rel.startsWith("@/")) importMap.set(symbol, rel);
  }

  const routes = [];
  const routeRegex = /<Route\s+path="([^"]+)"\s+element={<([A-Za-z0-9_]+)/g;
  for (const match of src.matchAll(routeRegex)) {
    const [, routePath, symbol] = match;
    const rel = importMap.get(symbol);
    if (!rel) continue;
    const normalized = rel.startsWith("@/") ? path.join(SRC, rel.slice(2)) : path.resolve(path.dirname(APP), rel);
    const resolved = normalized.endsWith(".tsx") ? normalized : normalized + ".tsx";
    routes.push({ routePath, symbol, file: resolved });
  }
  return routes;
}

function buildRouteAndContentReport() {
  const routes = parseRouteMap();
  let calisiyor = 0;
  let yarim = 0;
  let dolu = 0;
  let sig = 0;
  let bos = 0;

  for (const route of routes) {
    if (!fs.existsSync(route.file)) {
      yarim += 1;
      bos += 1;
      continue;
    }
    const lines = countContentLines(route.file);
    const c = classifyContent(lines);
    if (c === "DOLU") dolu += 1;
    if (c === "SIG") sig += 1;
    if (c === "BOS") bos += 1;
    if (lines >= 40) calisiyor += 1;
    else yarim += 1;
  }

  return {
    routeTotal: routes.length,
    routeStatus: { CALISIYOR: calisiyor, YARIM: yarim },
    contentStatus: { DOLU: dolu, SIG: sig, BOS: bos },
  };
}

function buildEngineReport() {
  const files = walk(path.join(SRC, "lib"));
  const engineFiles = files.filter((file) => /engine\.ts$/i.test(file) && !file.endsWith(".test.ts"));
  const real = engineFiles.filter((file) => !/mock/i.test(path.basename(file)) && !/demo/i.test(path.basename(file)));
  const mock = engineFiles.filter((file) => /mock|demo/i.test(path.basename(file)));
  const tested = real.filter((file) => fs.existsSync(file.replace(/\.ts$/, ".test.ts")));

  const calculatorDir = path.join(SRC, "lib", "calculators");
  const calculatorFiles = fs.existsSync(calculatorDir)
    ? fs.readdirSync(calculatorDir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    : [];
  const calculatorTests = calculatorFiles.filter((f) =>
    fs.existsSync(path.join(calculatorDir, f.replace(/\.ts$/, ".test.ts"))),
  );

  return {
    motorStatus: { GERCEK: real.length, MOCK: mock.length, TESTLI: tested.length },
    calculatorStatus: {
      total: calculatorFiles.length,
      tested: calculatorTests.length,
      missingTests: calculatorFiles.filter((f) => !calculatorTests.includes(f)),
    },
  };
}

const result = {
  generatedAt: new Date().toISOString(),
  ...buildRouteAndContentReport(),
  ...buildEngineReport(),
};

console.log(JSON.stringify(result, null, 2));
