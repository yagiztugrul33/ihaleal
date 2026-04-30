/**
 * migrations/*.sql dosyalarını dosya adına göre sıralayıp tek dosyada birleştirir.
 * Supabase SQL Editor’a yapıştırmak için — .env / API anahtarı GEREKMEZ.
 *
 * Çıktı: supabase/SQL_EDITOR_TEK_DOSYA.sql (+ uyumluluk için supabase/manual_push.sql)
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const migrationsDir = join(root, "supabase", "migrations");

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No .sql files in", migrationsDir);
  process.exit(1);
}

const header = `-- ═══════════════════════════════════════════════════════════════════════════
-- ihaleal.com — TEK DOSYA (tüm migration’lar birleşik)
-- Oluşturulma: ${new Date().toISOString()}
-- Kaynak: supabase/migrations/ (${files.length} dosya)
--
-- NASIL KULLANILIR
-- 1) Boş / yeni bir Supabase projesinde: içeriğin TAMAMINI SQL Editor’da bir kez Run.
-- 2) Veritabanında zaten bu şema varsa TEKRAR ÇALIŞTIRMA — "already exists" hataları normaldir.
--    O zaman sadece eksik migration dosyalarını tek tek uygula.
-- ═══════════════════════════════════════════════════════════════════════════

`;

let combined = header;
for (const f of files) {
  combined += `\n-- ═══ ${f} ═══\n\n`;
  combined += readFileSync(join(migrationsDir, f), "utf8");
  combined += "\n";
}

const outEditor = join(root, "supabase", "SQL_EDITOR_TEK_DOSYA.sql");
const outLegacy = join(root, "supabase", "manual_push.sql");
writeFileSync(outEditor, combined, "utf8");
writeFileSync(outLegacy, combined, "utf8");
console.log("Yazıldı:", outEditor);
console.log("Yazıldı:", outLegacy, "(uyumluluk)");
console.log("Dosya sayısı:", files.length, "| karakter:", combined.length);
