import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useOrgPermissions } from "@/hooks/useOrgPermissions";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { LoadingSkeletonList } from "@/components/async";

type OrgStats = {
  total_listings: number;
  active_listings: number;
  total_views_30d: number;
  total_leads_30d: number;
  conversion_pct: number;
  ai_used: number;
  ai_quota: number;
  pending_kyc: number;
  open_disputes: number;
};

type ListingPerf = {
  id: string;
  title: string;
  price: number;
  status: string;
};

export function OrganizationDashboard() {
  const { org, loading: orgLoading } = useActiveOrg();
  const { can } = useOrgPermissions();
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [topListings, setTopListings] = useState<ListingPerf[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!org?.id || !isSupabaseConfigured()) return;
    setStatsLoading(true);
    void (async () => {
      const { data: s } = await supabase.rpc("org_dashboard_stats", { p_org: org.id });
      if (s) setStats(s as OrgStats);

      const { data: rows } = await supabase
        .from("listings")
        .select("id, title, status, start_price_try")
        .eq("organization_id", org.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setTopListings(
        (rows ?? []).map((r) => ({
          id: r.id as string,
          title: r.title as string,
          status: r.status as string,
          price: Number(r.start_price_try),
        })),
      );
      setStatsLoading(false);
    })();
  }, [org?.id]);

  const aiUsagePct = useMemo(() => {
    if (!stats?.ai_quota) return 0;
    return Math.min(100, Math.round((stats.ai_used / stats.ai_quota) * 100));
  }, [stats]);

  if (orgLoading) return <div className="p-6"><LoadingSkeletonList count={4} /></div>;

  if (!org) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <h2 className="text-xl font-normal text-slate-900">Aktif kurumsal hesap yok</h2>
        <p className="mt-2 text-sm text-slate-600">
          Demo için önce bir kurumsal hesaba üye olun veya sağ üstten çalışma alanı seçin.
        </p>
        <Link to="/kurumsal" className="mt-6 inline-block rounded-[10px] bg-slate-900 px-4 py-2 text-sm text-white">
          Kurumsal çözümler
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-normal text-slate-900">{org.display_name}</h1>
          <p className="mt-1 text-sm text-slate-500">{org.plan.toUpperCase()} · {org.kyc_status}</p>
        </div>
        {can("listings.create") && (
          <div className="flex gap-2">
            <Link to="/kurumsal/iletisim" className="rounded-[10px] border border-slate-200 px-3 py-2 text-sm">
              Destek
            </Link>
            <Link to="/ihale-ac" className="rounded-[10px] bg-slate-900 px-3 py-2 text-sm text-white">
              Yeni İlan
            </Link>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Aktif İlan" value={stats?.active_listings} sub={`Toplam ${stats?.total_listings ?? 0}`} loading={statsLoading} />
        <StatCard label="30G Görüntülenme" value={stats?.total_views_30d} loading={statsLoading} />
        <StatCard label="30G Lead" value={stats?.total_leads_30d} loading={statsLoading} />
        <StatCard label="AI Kullanımı" value={stats?.ai_used} sub={`Kota ${stats?.ai_quota ?? 0} (%${aiUsagePct})`} loading={statsLoading} />
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-4">
        <h2 className="font-normal text-slate-900">Son ilanlar</h2>
        {statsLoading ? (
          <LoadingSkeletonList count={3} className="mt-4" />
        ) : !topListings.length ? (
          <p className="mt-4 text-sm text-slate-500">Henüz kurumsal ilan yok.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {topListings.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-3 text-sm">
                <Link to={`/ilan/${l.id}`} className="font-normal text-slate-800 hover:text-slate-950">
                  {l.title}
                </Link>
                <span className="text-slate-600">{formatTRY(l.price)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, loading }: {
  label: string;
  value?: number;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      {loading ? (
        <div className="mt-2 h-7 w-16 animate-pulse rounded-[3px] bg-slate-100" />
      ) : (
        <div className="mt-1 text-2xl font-normal text-slate-900">{(value ?? 0).toLocaleString("tr-TR")}</div>
      )}
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function formatTRY(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}
