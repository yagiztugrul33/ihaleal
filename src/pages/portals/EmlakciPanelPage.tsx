import { Link } from "react-router-dom";
import { Building2, Plus, TrendingUp, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell, MetricCard } from "@/components/enterprise";
import { OrganizationDashboard } from "@/features/organizations/OrganizationDashboard";
import { EMLAKCI_DEMO_STATS, EMLAKCI_DEMO_LISTINGS } from "@/data/portalDemo";
import { isSupabaseConfigured } from "@/lib/supabase";

function formatTry(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

function DemoEmlakciPanel() {
  const s = EMLAKCI_DEMO_STATS;
  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Aktif ilan" value={String(s.activeListings)} icon={Building2} />
        <MetricCard label="30G görüntülenme" value={s.totalViews30d.toLocaleString("tr-TR")} icon={Eye} />
        <MetricCard label="30G lead" value={String(s.leads30d)} hint={`Dönüşüm %${s.conversionPct}`} icon={Users} />
        <MetricCard label="AI kullanımı" value={`${s.aiUsed}/${s.aiQuota}`} icon={TrendingUp} />
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Son ilanlar (demo)</h2>
          <Button asChild size="sm" className="gap-2">
            <Link to="/ihale-ac">
              <Plus className="h-4 w-4" /> Yeni ilan
            </Link>
          </Button>
        </div>
        <ul className="divide-y divide-white/5">
          {EMLAKCI_DEMO_LISTINGS.map((l) => (
            <li key={l.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-slate-200">{l.title}</span>
              <span className="text-slate-400">
                {formatTry(l.price)} · {l.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default function EmlakciPanelPage() {
  const useLive = isSupabaseConfigured();

  return (
    <DashboardShell
      badge="Emlakçı paneli"
      title="Kurumsal emlakçı çalışma alanı"
      subtitle={
        useLive
          ? "Canlı kurumsal veriler Supabase üzerinden yüklenir."
          : "Demo metrikler — üretimde organizasyon hesabı gerekir."
      }
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to="/emlakci">Emlakçı çözümleri</Link>
        </Button>
      }
    >
      {!useLive ? <DemoEmlakciPanel /> : null}
      <div className={useLive ? "" : "mt-8 rounded-xl border border-dashed border-white/15 overflow-hidden"}>
        <OrganizationDashboard />
      </div>
    </DashboardShell>
  );
}
