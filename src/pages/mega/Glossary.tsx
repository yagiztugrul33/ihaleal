import { BookOpen } from "lucide-react";
import { GLOSSARY_TERMS } from "@/data/glossaryTerms";

export default function GlossaryPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-start gap-3">
          <div className="rounded-xl bg-teal-500/15 p-3 text-teal-400">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Emlak sözlüğü</h1>
            <p className="mt-2 text-sm text-slate-400">{GLOSSARY_TERMS.length} terim — bilgilendirme amaçlıdır.</p>
          </div>
        </div>
        <div className="space-y-2">
          {GLOSSARY_TERMS.map((t) => (
            <details
              key={t.term}
              className="group rounded-xl border border-slate-200 bg-slate-900/40 px-4 py-3 open:bg-slate-900/60"
            >
              <summary className="cursor-pointer list-none font-medium text-white marker:content-none [&::-webkit-details-marker]:hidden">
                {t.term}
              </summary>
              <p className="mt-2 border-t border-slate-200/80 pt-3 text-sm leading-relaxed text-slate-400">{t.definition}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
