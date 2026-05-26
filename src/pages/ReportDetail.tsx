import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getReportById } from "@/data/reportsDemo";

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const report = useMemo(() => (id ? getReportById(id) : undefined), [id]);

  if (!report) {
    return (
      <div className="min-h-screen px-4 pt-28 pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-lg text-white">Belge bulunamadı.</p>
          <Button asChild variant="outline" className="mt-6 border-white/15">
            <Link to="/raporlar">Listeye dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-24 pb-16">
      <article className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-8 text-slate-500 hover:text-slate-900">
          <Link to="/raporlar" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Tüm belgeler
          </Link>
        </Button>

        <header className="mb-10 border-b border-slate-200 pb-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            <FileText className="h-5 w-5 text-blue-400" />
            <span>Güncelleme: {report.updatedAt}</span>
            <span>·</span>
            <span>{report.readingMinutes} dk okuma</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{report.title}</h1>
          <p className="mt-4 text-slate-400">{report.excerpt}</p>
        </header>

        <section className="mb-8 rounded-xl border border-slate-200 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-white">Yonetici ozeti</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-400 space-y-1">
            <li>Bu belge kategoriye gore piyasa, operasyon veya uyumluluk risklerini sade bir dille toplar.</li>
            <li>Metin, ekiplerin ayni varsayim setiyle karar alabilmesi icin standardize edilmis rapor formatindadir.</li>
            <li>Rapor maddeleri tek basina baglayici degildir; dosya bazli sozlesme ve uzman gorusu ile teyit edilmelidir.</li>
          </ul>
        </section>

        <div className="prose prose-invert max-w-none space-y-4 text-slate-300">
          {report.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <section className="mt-8 rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
          <h3 className="text-sm font-semibold text-cyan-100 inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Sonraki adimlar
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link to="/raporlar" className="rounded-lg border border-cyan-300/50 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-100">
              Diger raporlar
            </Link>
            <Link to="/analiz" className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-200">
              AI analiz paneli
            </Link>
            <Link to="/degerleme" className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-200">
              Degerleme araci
            </Link>
          </div>
        </section>

        <p className="mt-12 rounded-lg border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-amber-100/90">
          Bu içerik bilgilendirme amaçlıdır; yatırım veya hukuki tavsiye değildir.
        </p>
      </article>
    </div>
  );
}
