/**
 * UTF-8 — manual_push_v3_v6_combined.sql dosyasını v3 / v4 / v5 / v6 mantıksal bloklarına böler.
 * PL/pgSQL içindeki ';' ile yanlış kesmez.
 * Çalıştır: node scripts/export-sql-chunks-for-chat.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const src = readFileSync(join(root, "supabase", "manual_push_v3_v6_combined.sql"), "utf8");

const i4 = src.indexOf("-- ===== v4 BAŞLANGIÇ =====");
const i5 = src.indexOf("-- ===== v5 BAŞLANGIÇ =====");
const i6 = src.indexOf("-- ===== v6 BAŞLANGIÇ =====");

if (i4 === -1 || i5 === -1 || i6 === -1) {
  console.error("Ayırıcı yorum satırları bulunamadı.");
  process.exit(1);
}

const blocks = [
  src.slice(0, i4).trim(),
  src.slice(i4, i5).trim(),
  src.slice(i5, i6).trim(),
  src.slice(i6).trim(),
];

const labels = ["v3 (profiles, bid_bonds, place_bid v1, listings RLS)", "v4 (audit_log, admin)", "v5 (memberships, commission tabloları)", "v6 (RLS güncellemeleri, place_bid v2, komisyon RPC)"];

let md = `# ihaleal.com SQL — 4 parça (v3→v6)\n\n`;
md += `Her dosya **tam bir faz**dır; içindeki PL/pgSQL blokları bütün olarak kalır.\n\n`;
md += `Supabase SQL Editor: **01 → 02 → 03 → 04** sırayla yapıştır, her defasında **Run**.\n\n`;
md += `---\n\n`;

const dir = join(root, "docs", "supabase_sql_parcalar");
mkdirSync(dir, { recursive: true });

blocks.forEach((body, i) => {
  const num = String(i + 1).padStart(2, "0");
  md += `## Parça ${i + 1}/4 — ${labels[i]}\n\n`;
  md += "```sql\n";
  md += body;
  md += "\n```\n\n";

  writeFileSync(join(dir, `${num}_parca.sql`), `${body}\n`, "utf8");
});

writeFileSync(join(root, "docs", "SUPABASE_SQL_PARCA_PARCA_KOPYALA.md"), md, "utf8");

writeFileSync(
  join(dir, "OKU.txt"),
  [
    "Cursor: sol panelden bu klasordeki dosyalari ac (01_parca.sql ... 04_parca.sql).",
    "Her birinin tamamini kopyala -> Supabase SQL Editor -> Run.",
    "Sira: 01 sonra 02 sonra 03 sonra 04.",
    "",
  ].join("\n"),
  "utf8",
);

blocks.forEach((b, i) => console.log(`Parça ${i + 1}: ${b.length} bayt`));
console.log("Yazıldı:", join(dir, "01_parca.sql … 04_parca.sql"));
console.log("Markdown:", join(root, "docs", "SUPABASE_SQL_PARCA_PARCA_KOPYALA.md"));
