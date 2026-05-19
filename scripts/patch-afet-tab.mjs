import fs from "node:fs";

const p = new URL("../src/components/ilan/detail/RichTabPanels.tsx", import.meta.url);
let s = fs.readFileSync(p, "utf8");

const importNeedle = `import { buildYapiRows, dealLabel, istanbulCoords, priceOf } from "./tabHelpers";
import "leaflet/dist/leaflet.css";`;

const importReplace = `import { buildYapiRows, dealLabel, istanbulCoords, priceOf } from "./tabHelpers";
import { AfetDisasterHub } from "@/components/property/AfetDisasterHub";
import "leaflet/dist/leaflet.css";`;

if (!s.includes("AfetDisasterHub")) {
  if (!s.includes(importNeedle)) {
    console.error("import block not found");
    process.exit(1);
  }
  s = s.replace(importNeedle, importReplace);
}

s = s.replace(
  /function AfetPanel\([\s\S]*?\n\}\n\n(?=function AltyapiPanel)/,
  ""
);

s = s.replace(
  /case "AFET":\s*\n\s*return <AfetPanel property=\{property\} \/>;/,
  `case "AFET":
      return <AfetDisasterHub property={property} />;`
);

if (/AfetPanel/.test(s)) {
  console.error("AfetPanel reference remains");
  process.exit(1);
}

fs.writeFileSync(p, s, "utf8");
console.log("patched RichTabPanels");