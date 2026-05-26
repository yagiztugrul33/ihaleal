import { Link } from "react-router-dom";
import { Hammer, Landmark, Wallet, FileCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell, MetricCard } from "@/components/enterprise";
import { MUTEAHHIT_DEMO_STATS, MUTEAHHIT_DEMO_PROJECTS } from "@/data/portalDemo";
import { KKA_HUB_PATH } from "@/lib/kkaHub";

export default function MuteahhitPanelPage() {
  const s = MUTEAHHIT_DEMO_STATS;

  return (
    <DashboardShell
      badge="Müteahhit paneli"
      title="KKA ve proje yönetimi"
      subtitle="Aktif projeler, hakediş dilimleri ve emanet bakiyesi (demo veri)."
      actions={
        <Button asChild size="sm" className="gap-2">
          <Link to={KKA_HUB_PATH}>
            <Landmark className="h-4 w-4" /> KKA merkezi
          </Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Aktif proje" value={String(s.activeProjects)} icon={Hammer} />
        <MetricCard label="KKA parsel" value={String(s.kkaParsels)} icon={Landmark} />
        <MetricCard label="Bekleyen hakediş" value={String(s.pendingHakedis)} icon={FileCheck} />
        <MetricCard
          label="Emanet bakiye"
          value={`₺${(s.escrowTry / 1_000_000).toFixed(1)}M`}
          hint={`Tamamlanma %${s.completionPct}`}
          icon={Wallet}
        />
      </div>
      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Projeler</h2>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/ihale-ac">
              <Plus className="h-4 w-4" /> Yeni kayıt
            </Link>
          </Button>
        </div>
        <ul className="space-y-3">
          {MUTEAHHIT_DEMO_PROJECTS.map((p) => (
            <li key={p.id} className="rounded-lg border border-white/8 p-4">
              <p className="font-medium text-white">{p.name}</p>
              <div className="flex justify-between text-sm text-slate-400 mt-2 mb-2">
                <span>{p.stage}</span>
                <span>%{p.progress}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <span className="block h-full bg-emerald-500/80 rounded-full" style={{ width: `${p.progress}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
          <h3 className="text-sm font-semibold text-cyan-100">Neden bu panel?</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-200">
            Proje, hakediş, KKA ve ihale adımları tek bakışta yönetilir; ekipler arası bilgi kaybı azalır.
          </p>
        </article>
        <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <h3 className="text-sm font-semibold text-emerald-100">Araçlar</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-200">
            <Link to="/ihale-ac" className="underline">İhale aç</Link>,{" "}
            <Link to={KKA_HUB_PATH} className="underline">kat karşılığı</Link> ve proje paneli birlikte çalışır.
          </p>
        </article>
        <article className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
          <h3 className="text-sm font-semibold text-violet-100">Örnek senaryo</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-200">
            4 fazlı projede her hakediş dilimi onaylandıkça bir önceki ödeme serbest bırakılır.
          </p>
        </article>
      </section>
      <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-lg font-bold text-white">Nasıl çalışır?</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
          <article className="rounded-lg border border-white/10 p-3">
            <p className="font-semibold text-slate-100">1) Proje kaydı</p>
            <p className="mt-1 text-slate-400">Faz, lot, metraj ve bütçe parametreleri girilir.</p>
          </article>
          <article className="rounded-lg border border-white/10 p-3">
            <p className="font-semibold text-slate-100">2) Teklif ve KKA</p>
            <p className="mt-1 text-slate-400">İhale akışı ile kat karşılığı model aynı proje bağlamında izlenir.</p>
          </article>
          <article className="rounded-lg border border-white/10 p-3">
            <p className="font-semibold text-slate-100">3) Hakediş kapanışı</p>
            <p className="mt-1 text-slate-400">Onaylı dilimlerde ödeme serbest bırakılır; kayıt zinciri korunur.</p>
          </article>
        </div>
      </section>
      <section className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
        <h3 className="text-lg font-bold text-emerald-100">Kazanç / komisyon notu</h3>
        <p className="mt-2 text-sm text-slate-200">
          Proje gelir modeli işlem ve teslim adımlarına bağlıdır. By-pass etmeyen kayıtlı akış esas alınır; nihai mali kalemler sözleşme ile
          kesinleşir.
        </p>
      </section>
      <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-lg font-bold text-white">SSS</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
          <article>
            <p className="font-semibold text-slate-100">KKA hesabı bağlayıcı mı?</p>
            <p className="text-slate-400 mt-1">Hayır, demo/ön analizdir; resmi hesaplar sözleşmeyle netleşir.</p>
          </article>
          <article>
            <p className="font-semibold text-slate-100">İhale ve panel ayrı mı?</p>
            <p className="text-slate-400 mt-1">Hayır, panelde açılan proje ihaleye bağlı takip edilir.</p>
          </article>
          <article>
            <p className="font-semibold text-slate-100">Sonraki adım?</p>
            <p className="text-slate-400 mt-1">Proje kaydı sonrası ihale açma ve KKA kontrol listesine geçin.</p>
          </article>
        </div>
      </section>
      <section className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-5">
        <h3 className="text-lg font-bold text-cyan-100">CTA</h3>
        <p className="mt-2 text-sm text-slate-200">Projeyi panelde açın, ardından ihale ve KKA adımlarını aynı kayıtta tamamlayın.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/ihale-ac">İhale aç</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={KKA_HUB_PATH}>KKA merkezine git</Link>
          </Button>
        </div>
      </section>
    </DashboardShell>
  );
}
