import { Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck, Timer, Wallet } from "lucide-react";

const STEPS = [
  {
    title: "1) İlanı doğrula",
    detail:
      "AI değerleme, deprem skoru, emsal tablo ve satıcı profilini inceleyin. Hemen Al yalnızca doğrulanmış ilanlarda açılır.",
  },
  {
    title: "2) KYC + blokaj adımı",
    detail:
      "Alıcı kimliği ve ödeme yöntemi doğrulanır. Kart blokesi/teminat adımı tamamlanmadan atomik satın alma akışı başlamaz.",
  },
  {
    title: "3) Atomik işlem",
    detail:
      "Sunucu tarafında tek işlemde uygunluk, depozito ve sözleşme koşulları kontrol edilir. Geçersiz durumda işlem geri alınır.",
  },
  {
    title: "4) Devir ve kapanış",
    detail:
      "Başarılı işlem sonrası evrak ve tapu hazırlık paketi açılır. Operasyon ekibi sonraki adımları kullanıcıya bildirir.",
  },
];

export default function HemenAlLanding() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <section className="mx-auto max-w-4xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5" /> Hemen Al Akışı
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Anlık satın alma, kontrollü güvenlik</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Bu sayfa Hemen Al modelinin mekanik özetidir. Gerçek satın alma butonu ilan detay ekranındaki
          uygun ihalelerde açılır ve işlem akışı sunucu tarafında yürütülür.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-4">
            <p className="flex items-center gap-2 text-cyan-200 text-sm font-semibold">
              <Timer className="h-4 w-4" /> Zaman disiplini
            </p>
            <p className="mt-2 text-sm text-slate-200">
              Son dakika kararlarında acele yerine checklist yaklaşımı uygulanır. Önce teknik/hukuki kontroller,
              sonra ödeme/sözleşme adımı.
            </p>
          </article>
          <article className="rounded-xl border border-violet-400/25 bg-violet-500/10 p-4">
            <p className="flex items-center gap-2 text-violet-200 text-sm font-semibold">
              <Wallet className="h-4 w-4" /> Finansal şeffaflık
            </p>
            <p className="mt-2 text-sm text-slate-200">
              Toplam yükümlülükte komisyon/vergiler ayrı gösterilir; kullanıcı yalnızca çıplak fiyatı değil toplam
              maliyet etkisini görür.
            </p>
          </article>
        </div>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold">Adım adım Hemen Al</h2>
          <ol className="mt-4 space-y-3">
            {STEPS.map((step) => (
              <li key={step.title} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-sm font-semibold text-slate-100">{step.title}</p>
                <p className="mt-1 text-sm text-slate-300">{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 rounded-xl border border-amber-400/25 bg-amber-500/10 p-4 text-xs text-amber-100">
          <p>
            Dürüst sınır: Bu ekran bir ürün akışı anlatımıdır; nihai hukuki sonuç ve finansal kesinlik için uzman inceleme
            ve resmi süreçler gereklidir.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/ihaleler" className="btn-primary inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Uygun ihaleleri gör
          </Link>
          <Link to="/teklif-al" className="btn-ghost">
            Anında teklif / iBuyer
          </Link>
        </div>
      </section>
    </main>
  );
}
