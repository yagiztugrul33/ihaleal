import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getContractBySlug } from "@/data/contractTemplates";
import NotFound from "@/pages/NotFound";

export default function SozlesmeTemplatePage() {
  const { slug } = useParams();
  const doc = slug ? getContractBySlug(slug) : undefined;
  if (!doc) return <NotFound />;
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" asChild><Link to="/yasal/sozlesmeler"><ArrowLeft className="h-4 w-4" /> Indeks</Link></Button>
        <h1 className="text-2xl font-bold text-white">{doc.title}</h1>
        <p className="text-slate-400 text-sm">{doc.summary}</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-cyan-200">Taraflar</p>
            <p className="mt-1 text-xs text-slate-300">{doc.parties.join(" · ")}</p>
          </article>
          <article className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-200">Madde adedi</p>
            <p className="mt-1 text-xs text-slate-300">{doc.clauses.length} temel madde</p>
          </article>
          <article className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-violet-200">Durum</p>
            <p className="mt-1 text-xs text-slate-300">Taslak (imza oncesi hukuk kontrolu)</p>
          </article>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Scale className="h-4 w-4 text-blue-300" /> Sablon okuma rehberi
          </h2>
          <ul className="mt-2 space-y-1 list-disc pl-5 text-xs text-slate-400">
            <li>Teminat, odeme, teslim ve cezai sart maddelerini dosya bazli rakamlarla guncelleyin.</li>
            <li>KYC/KVKK/AML maddeleri platform politikasi ve mevzuatla birlikte degerlendirilmelidir.</li>
            <li>Imza sirasinda son surum takibi (revizyon tarihi + taraf parafi) zorunlu tutulmalidir.</li>
          </ul>
        </div>

        {doc.clauses.map((cl) => (
          <section key={cl.heading} className="rounded-xl border border-white/10 p-4">
            <h2 className="font-semibold text-white">{cl.heading}</h2>
            <p className="mt-2 text-sm text-slate-400">{cl.body}</p>
          </section>
        ))}

        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs text-slate-300">
          <p className="font-medium text-amber-200 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Durust sinir
          </p>
          <p className="mt-2">
            Bu metin baglayici hukuki gorus degildir. Nihai sozlesme, somut dosyanin riski ve taraf profiline gore avukat tarafindan
            duzenlenmelidir.
          </p>
          <p className="mt-2 text-emerald-200 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Hedef: anlasilir, denetlenebilir ve uyusmazlikta ispatlanabilir metin seti.
          </p>
        </div>
      </div>
    </div>
  );
}