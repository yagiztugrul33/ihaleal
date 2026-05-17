import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const migDir = join(process.cwd(), "supabase/migrations");
const files = readdirSync(migDir).filter((f) => f.endsWith(".sql"));
const lines = [
  "# RLS Test Matrix (generated)",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "| Migration | Policies / functions |",
  "|-----------|----------------------|",
];

for (const f of files.sort()) {
  const content = readFileSync(join(migDir, f), "utf8");
  const policies = [...content.matchAll(/create policy "([^"]+)"/gi)].map((m) => m[1]);
  const fns = [...content.matchAll(/create or replace function public\.(\w+)/gi)].map((m) => m[1]);
  const summary = [...new Set([...policies.slice(0, 5), ...fns.slice(0, 3)])].join(", ") || "—";
  lines.push(`| ${f} | ${summary} |`);
}

lines.push("", "## Manual verification", "", "- Run `RUN_RLS_INTEGRATION=1 npm run test:rls:live` when Supabase credentials available.", "- Apply migration `20260516120000_admin_listing_security.sql` on production project.");

writeFileSync(join(process.cwd(), "docs/RLS_TEST_MATRIX.md"), lines.join("\n"), "utf8");
console.log("Wrote docs/RLS_TEST_MATRIX.md");