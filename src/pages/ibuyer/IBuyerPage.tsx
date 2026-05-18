import { Banknote, RefreshCw } from "lucide-react";
import { SubmissionForm } from "@/components/ibuyer/SubmissionForm";
import { ibuyerSubtitle } from "@/lib/ibuyerHub";

export default function IBuyerPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 text-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            <Banknote className="h-3.5 w-3.5" /> iBuyer
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold">Anında Nakit Teklif</h1>
          <p className="mt-2 text-slate-400 max-w-2xl">{ibuyerSubtitle}</p>
        </div>
        <p className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <RefreshCw className="h-4 w-4" />
          Hukuki risk matrisi ile 72 saat gecerli teklif
        </p>
        <SubmissionForm />
      </section>
    </main>
  );
}
