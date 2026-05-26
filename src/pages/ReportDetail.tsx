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

        <section className="mb-8 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3">
            <p className="text-xs font-semibold text-cyan-100">Yöntem</p>
            <p className="mt-1 text-xs text-slate-200">Rapor metni standartlaştırılmış şablonla hazırlanır: sinyal, risk, aksiyon.</p>
          </article>
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
            <p className="text-xs font-semibold text-emerald-100">Örnek okuma</p>
            <p className="mt-1 text-xs text-slate-200">Nominal artış güçlü görünse de reel baskı varsa temkinli senaryo önce okunmalıdır.</p>
          </article>
          <article className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-3">
            <p className="text-xs font-semibold text-violet-100">Geri dönüş akışı</p>
            <p className="mt-1 text-xs text-slate-200">Rapor sonrası kullanıcı paneline dönüp favori ve teklif adımlarını günceller.</p>
          </article>
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

        <section className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
          <h3 className="text-sm font-semibold text-amber-100">Kime göre / dürüst sınır</h3>
          <p className="mt-2 text-xs text-slate-200">
            Bu detay ekranı yönetici, analist ve operasyon ekipleri için ortak referanstır; bağlayıcı yatırım/hukuk görüşü yerine geçmez.
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-slate-100">Kullanım kılavuzu</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-slate-300">
            <li>Önce yönetici özetini okuyup risk başlıklarını işaretleyin.</li>
            <li>Ardından detay paragraflarda ilgili metrikleri not alın.</li>
            <li>Panelde aynı başlıkları takip kartlarına dönüştürün.</li>
            <li>Gerekli hallerde favori/mesajlar ekranında ekip içi paylaşım yapın.</li>
          </ol>
        </section>

        <section className="mt-4 rounded-xl border border-blue-500/25 bg-blue-500/10 p-4">
          <h3 className="text-sm font-semibold text-blue-100">CTA</h3>
          <p className="mt-2 text-xs text-slate-200">
            Bu rapordan çıkan aksiyonları kullanıcı panelinize aktarın ve bir sonraki raporu aynı metodolojiyle karşılaştırın.
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-slate-100">Soru-cevap</h3>
          <div className="mt-2 space-y-2 text-xs text-slate-300">
            <p><strong className="text-slate-100">Bu raporla doğrudan yatırım kararı alınır mı?</strong> Hayır, bu içerik ön analizdir.</p>
            <p><strong className="text-slate-100">En kritik bölüm hangisi?</strong> Yönetici özeti ve risk maddeleri birlikte okunmalıdır.</p>
            <p><strong className="text-slate-100">Kime paylaşmalıyım?</strong> Operasyon, hukuk ve yatırım ekibine aynı sürüm gönderilmelidir.</p>
            <p><strong className="text-slate-100">Güncel veri nasıl anlaşılır?</strong> Güncelleme tarihi ve sürüm notu kart başlığında yer alır.</p>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-slate-100">Kullanıcı döngüsü bağlantısı</h3>
          <p className="mt-2 text-xs text-slate-300">
            Rapor detayından çıkan aksiyonlar favori listesi, mesaj merkezi ve kullanıcı panelindeki görev kartlarıyla
            eşleştirilerek takip edilir. Böylece rapor yalnızca okunan bir metin değil, uygulanan bir iş planına dönüşür.
          </p>
        </section>

        <p className="mt-12 rounded-lg border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-amber-100/90">
          Bu içerik bilgilendirme amaçlıdır; yatırım veya hukuki tavsiye değildir.
        </p>
      </article>
    </div>
  );
}
