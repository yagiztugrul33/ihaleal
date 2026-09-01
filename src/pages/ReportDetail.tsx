import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
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
            <ArrowLeft className="rtl:rotate-180 h-4 w-4" /> Tüm belgeler
          </Link>
        </Button>

        <header className="mb-10 border-b border-slate-200 pb-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            <FileText className="h-5 w-5 text-[var(--metin-ikincil)]" />
            <span>Güncelleme: {report.updatedAt}</span>
            <span>·</span>
            <span>{report.readingMinutes} dk okuma</span>
          </div>
          <h1 className="text-3xl font-normal text-white">{report.title}</h1>
          <p className="mt-4 text-slate-400">{report.excerpt}</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-4 text-slate-300">
          {report.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <p className="mt-12 rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-4 text-sm text-[var(--metin-ikincil)]">
          Bu içerik bilgilendirme amaçlıdır; yatırım veya hukuki tavsiye değildir.
        </p>
      </article>
    </div>
  );
}
