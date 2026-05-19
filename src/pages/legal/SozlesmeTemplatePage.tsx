import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
        {doc.clauses.map((cl) => (
          <section key={cl.heading} className="rounded-xl border border-white/10 p-4">
            <h2 className="font-semibold text-white">{cl.heading}</h2>
            <p className="mt-2 text-sm text-slate-400">{cl.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}