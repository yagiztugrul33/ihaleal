import fs from "node:fs";
const src = fs.readFileSync("vite.config.ts", "utf8");
const start = src.indexOf("const pwaPlugin");
const end = src.indexOf("export default defineConfig");
const head = src.slice(0, src.indexOf("import { VitePWA }"));
const tailFromExport = src.slice(end);
const mid = `import { defineConfig, type PluginOption } from "vite"
import { HOME_SEO, OG_IMAGE } from "./src/data/homeSeo"
`;
// rebuild from line 5 onwards - simpler: use known good async version from 2585a07 commit via git
