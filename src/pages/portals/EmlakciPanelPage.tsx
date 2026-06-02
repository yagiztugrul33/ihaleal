import { Link } from "react-router-dom";
import { Building2, Plus, TrendingUp, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell, MetricCard } from "@/components/enterprise";
import { OrganizationDashboard } from "@/features/organizations/OrganizationDashboard";
import { EMLAKCI_DEMO_STATS, EMLAKCI_DEMO_LISTINGS } from "@/data/portalDemo";
import { isSupabaseConfigured } from "@/lib/supabase";
import { SellerAnalyticsPanel } from "@/components/seller/SellerAnalyticsPanel";
import { FxRef } from "@/components/FxRef";

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
              <span className="text-slate-400 inline-flex items-center gap-1.5" dir="ltr">
                {formatTry(l.price)}
                <FxRef amountTry={l.price} variant="compact" className="text-[11px] text-amber-300/80" />
                <span className="text-slate-500">·</span>
                <span>{l.status}</span>
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
      {!useLive ? <DemoEmlakciPanel /> : <SellerAnalyticsPanel />}
      <div className={useLive ? "" : "mt-8 rounded-xl border border-dashed border-white/15 overflow-hidden"}>
        <OrganizationDashboard />
      </div>
      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
          <h3 className="text-sm font-semibold text-cyan-100">Neden bu panel?</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-200">
            Portföy, teklif ve müşteri akışını tek ekranda toplar; satış ekibi ile operasyonun aynı gerçekliğe bakmasını sağlar.
          </p>
        </article>
        <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <h3 className="text-sm font-semibold text-emerald-100">Örnek senaryo</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-200">
            Sabah ilan güncellemesi, öğlen canlı teklif takibi, akşam kapanış evrak kontrolü aynı panelden yapılır.
          </p>
        </article>
        <article className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
          <h3 className="text-sm font-semibold text-violet-100">Kazanç modeli</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-200">
            Gelir işlem bazlı ilerler; by-pass etmeyen ortaklık için <Link to="/emlakci-ortaklik" className="underline">kurumsal model</Link> esas alınır.
          </p>
        </article>
      </section>
      <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-lg font-bold text-white">Nasıl çalışır?</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
          <article className="rounded-lg border border-white/10 p-3">
            <p className="font-semibold text-slate-100">1) Portföy hazırlığı</p>
            <p className="mt-1 text-slate-400">İlan, evrak ve fiyat bandı aynı panelde tanımlanır.</p>
          </article>
          <article className="rounded-lg border border-white/10 p-3">
            <p className="font-semibold text-slate-100">2) Teklif yönetimi</p>
            <p className="mt-1 text-slate-400">Canlı teklif akışı, müşteri notları ve durum adımlarıyla ilerler.</p>
          </article>
          <article className="rounded-lg border border-white/10 p-3">
            <p className="font-semibold text-slate-100">3) Kapanış ve tahakkuk</p>
            <p className="mt-1 text-slate-400">İşlem kapanınca gelir tahakkuk eder; liste satışı modeli yoktur.</p>
          </article>
        </div>
      </section>
      <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-lg font-bold text-white">SSS</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
          <article>
            <p className="font-semibold text-slate-100">Panel canlı veriyi ne zaman gösterir?</p>
            <p className="text-slate-400 mt-1">Supabase bağlantısı aktif olduğunda canlı organizasyon verisi açılır.</p>
          </article>
          <article>
            <p className="font-semibold text-slate-100">Teklif akışı denetlenebilir mi?</p>
            <p className="text-slate-400 mt-1">Evet, teklif geçmişi ve durum adımları kayıtlı ilerler.</p>
          </article>
          <article>
            <p className="font-semibold text-slate-100">Hangi sonraki adım önerilir?</p>
            <p className="text-slate-400 mt-1">Ortaklık sözleşmesi ve panel rol yetkilerini birlikte tamamlayın.</p>
          </article>
        </div>
      </section>
      <section className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-5">
        <h3 className="text-lg font-bold text-cyan-100">CTA</h3>
        <p className="mt-2 text-sm text-slate-200">
          Ekibiniz için by-pass etmeyen ortaklık kurgusunu aktif etmek için önce panel yetkilerini, sonra ortaklık sözleşmesini tamamlayın.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/emlakci-ortaklik">Ortaklık başvurusu</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/emlakci">Landing sayfasına dön</Link>
          </Button>
        </div>
      </section>
    </DashboardShell>
  );
}
