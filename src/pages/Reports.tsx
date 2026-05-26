import { Link } from "react-router-dom";
import { Calendar, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_REPORTS } from "@/data/reportsDemo";

const CATEGORY_LABEL: Record<string, string> = {
  piyasa: "Piyasa",
  operasyon: "Operasyon",
  uyumluluk: "Uyumluluk",
};

export default function Reports() {
  const KFE_2026 = {
    nominal: 26.6,
    reel: -4.3,
    ankara: 36.7,
  };

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

        <section className="mb-8 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-200">KFE 2026 nominal</p>
            <p className="mt-1 text-xl font-bold text-white">+%{KFE_2026.nominal}</p>
          </article>
          <article className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-amber-200">KFE 2026 reel</p>
            <p className="mt-1 text-xl font-bold text-white">%{KFE_2026.reel}</p>
          </article>
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-200">Ankara yıllık</p>
            <p className="mt-1 text-xl font-bold text-white">+%{KFE_2026.ankara}</p>
          </article>
        </section>

        <section className="mb-8 rounded-xl border border-slate-200 bg-slate-900/40 p-4">
          <h2 className="text-lg font-semibold text-white inline-flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            Raporları nasıl okumalı?
          </h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-400 space-y-1">
            <li>Nominal ve reel metrikleri birlikte okuyun; tek başına nominal artış yanıltıcı olabilir.</li>
            <li>Piyasa raporunu operasyon ve uyumluluk raporuyla birlikte değerlendirin.</li>
            <li>Rapor çıktısı karar desteğidir; nihai yatırım/hukuk kararı için uzman görüşü gerekir.</li>
          </ul>
        </section>

        <section className="mb-8 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
            <p className="text-xs font-semibold text-cyan-100">Nedir?</p>
            <p className="mt-2 text-xs text-slate-200">Rapor merkezi; piyasa, operasyon ve uyumluluk çıktılarının tek formatta toplandığı kullanıcı alanıdır.</p>
          </article>
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <p className="text-xs font-semibold text-emerald-100">Neden?</p>
            <p className="mt-2 text-xs text-slate-200">Kullanıcı, karar öncesi aynı veriyi farklı ekranlarda aramak yerine rapor kartlarından doğrudan okuyabilir.</p>
          </article>
          <article className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4">
            <p className="text-xs font-semibold text-violet-100">Güncel veri notu</p>
            <p className="mt-2 text-xs text-slate-200">KFE 2026 ve bölgesel sinyaller son rapor sürümüyle görünür; tarih ve kapsam her kartta açıkça yazılır.</p>
          </article>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {DEMO_REPORTS.map((r) => (
            <Card key={r.id} className="border-slate-200 bg-slate-900/40 transition-colors hover:border-white/20">
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

        <section className="mt-8 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-slate-100">Kime göre</h3>
            <p className="mt-2 text-xs text-slate-300">Yatırımcı için piyasa sinyali, operasyon ekibi için iş akışı, hukuk/uyum ekibi için risk görünürlüğü sağlar.</p>
          </article>
          <article className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
            <h3 className="text-sm font-semibold text-amber-100">Dürüst sınır</h3>
            <p className="mt-2 text-xs text-slate-200">Raporlar karar desteğidir; nihai yatırım, hukuk ve vergi kararı için uzman onayı gereklidir.</p>
          </article>
        </section>

        <section className="mt-4 rounded-xl border border-blue-500/25 bg-blue-500/10 p-4">
          <h3 className="text-sm font-semibold text-blue-100">CTA</h3>
          <p className="mt-2 text-xs text-slate-200">Bir rapor seçip detay ekranında aksiyon kartlarını tamamlayın; ardından favori/panel akışına geri dönün.</p>
        </section>

        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-slate-100">Kullanıcı yaşam döngüsü bağı</h3>
          <p className="mt-2 text-xs text-slate-300">
            Raporlar ekranı; keşif aşamasından teklif aşamasına geçerken kullanıcıyı belge, favori ve panel adımlarıyla bağlayarak karar
            zincirini tamamlamayı hedefler.
          </p>
          <p className="mt-2 text-xs text-slate-300">Rapor geçmişi düzenli izlendiğinde kullanıcı geri dönüşlerinde karar kalitesi artar.</p>
        </section>
      </div>
    </div>
  );
}
