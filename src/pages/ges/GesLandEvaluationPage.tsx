import { Sun } from "lucide-react";
import { GesEvaluationForm } from "@/components/ges/GesEvaluationForm";
import { gesLandSubtitle } from "@/lib/gesLandHub";

export default function GesLandEvaluationPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 text-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-1 text-xs text-[var(--metin-ikincil)]">
            <Sun className="h-3.5 w-3.5" /> GES Arazi
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-normal">GES Arazi Degerlendirme</h1>
          <p className="mt-2 text-slate-400 max-w-2xl">{gesLandSubtitle}</p>
        </div>
        <GesEvaluationForm />
      </section>
    </main>
  );
}
