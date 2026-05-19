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
    </DashboardShell>
  );
}
