import { PageShell } from "@/components/marketing/PageShell";
import { FileBarChart } from "lucide-react";
const REPORTS = Array.from({ length: 84 }, (_, i) => ({ id: "r" + (i+1), title: "Rapor " + (i+1), date: "2026-05-15", pages: 12 }));
export default function PiyasaRaporlariPage() {
  return (
    <PageShell badge="Piyasa" title="84 rapor" subtitle="Demo">
      <section className="py-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {REPORTS.map((r) => (
          <article key={r.id} className="card-warm p-4"><FileBarChart className="h-5 w-5" /><h2 className="text-sm font-semibold">{r.title}</h2></article>
        ))}
      </section>
    </PageShell>
  );
}