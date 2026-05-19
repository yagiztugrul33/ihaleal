import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/components/ilan/detail");

for (const f of fs.readdirSync(dir)) {
  const p = path.join(dir, f);
  const b = fs.readFileSync(p);
  if (b[1] === 0) fs.writeFileSync(p, b.toString("utf16le"), "utf8");
}

const panels = path.join(dir, "RichTabPanels.tsx");
let c = fs.readFileSync(panels, "utf8");
c = c.replace('import { useMemo, useState }', "import { useEffect, useMemo, useState }");
c = c.replace(
  'import type { IlanTypeExtras } from "@/components/ilan/IlanDetailTabs";',
  'import type { IlanTypeExtras } from "./types";',
);
c = c.replace(
  "  useMemo(() => {\n    const t = setInterval",
  "  useEffect(() => {\n    const t = setInterval",
);
fs.writeFileSync(panels, c, "utf8");
console.log("fixed panels", fs.readFileSync(panels)[0]);
