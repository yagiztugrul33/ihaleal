import { Link } from "react-router-dom";
import { FileText, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_REPORTS } from "@/data/reportsDemo";

const CATEGORY_LABEL: Record<string, string> = {
  piyasa: "Piyasa",
  operasyon: "Operasyon",
  uyumluluk: "Uyumluluk",
};

export default function Reports() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Analiz ve bilgilendirme belgeleri</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Demo özetler; tam hukuki veya finansal bağlayıcılık taşımaz. Üretimde PDF ve kaynak dipnotları eklenebilir.
            </p>
          </div>
          <Badge variant="outline" className="border-amber-500/40 text-amber-200">
            Demo veri
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {DEMO_REPORTS.map((r) => (
            <Card key={r.id} className="border-white/10 bg-slate-900/40 transition-colors hover:border-white/20">
              <CardContent className="pt-6">
                <div className="mb-3 flex items-start gap-2">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                  <div>
                    <h2 className="font-semibold leading-snug text-white">
                      <Link to={`/rapor/${r.id}`} className="hover:text-blue-300">
                        {r.title}
                      </Link>
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Badge variant="secondary" className="font-normal">
                        {CATEGORY_LABEL[r.category] ?? r.category}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {r.updatedAt}
                      </span>
                      <span>{r.readingMinutes} dk okuma</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{r.excerpt}</p>
                <Link
                  to={`/rapor/${r.id}`}
                  className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  Belgeyi aç →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
