import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const p = path.join(root, "src/pages/Anayasa400.tsx");
let s = fs.readFileSync(p, "utf8");

const inj = `import { IHALEAL_PLATFORM_RULES } from "@/data/anayasa400IhalealRules";\n`;
if (!s.includes("anayasa400IhalealRules")) {
  s = s.replace(
    `import { Link, useNavigate } from "react-router-dom";\n`,
    `import { Link, useNavigate } from "react-router-dom";\n${inj}`,
  );
}

const start = s.indexOf("const categories = [");
const needle = `    id: 5, title: "İhale — Usul ve İlkeler"`;
const idx = s.indexOf(needle);
if (start < 0 || idx < 0) {
  console.error("markers", start, idx);
  process.exit(1);
}

const block1 = `const categories = [
  {
    id: 1,
    title: "İhaleAL — Nihai sistem ve platform",
    range: \`1–\${IHALEAL_PLATFORM_RULES.length}\`,
    color: "blue",
    icon: Shield,
    rules: IHALEAL_PLATFORM_RULES,
  },
`;
const before = s.slice(0, start);
const after = s.slice(idx);
let merged = before + block1 + after;

merged = merged.replace(`    id: 5, title: "İhale — Usul ve İlkeler"`, `    id: 2, title: "İhale — Usul ve İlkeler"`);
merged = merged.replace(
  `    id: 6, title: "İhale — Teklif ve Teminat"`,
  `    id: 3, title: "İhale — Teklif ve Teminat"`,
);
merged = merged.replace(
  `    id: 7, title: "İhale — Sözleşme ve İfası"`,
  `    id: 4, title: "İhale — Sözleşme ve İfası"`,
);
merged = merged.replace(`    id: 8, title: "İhale — Şikayet ve İptal"`, `    id: 5, title: "İhale — Şikayet ve İptal"`);
merged = merged.replace(`    id: 9, title: "İhale — Özel Haller"`, `    id: 6, title: "İhale — Özel Haller"`);

fs.writeFileSync(p, merged, "utf8");
console.log("patched", p);