// R14 PAKET 3 — Müteahhit Panel (TAM REVİZE: demo static kaldırıldı, gerçek Supabase)
// useDeveloperProjects + useAuth ile owner_user_id bazlı projeler ve birim metrikleri.

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Hammer, ListChecks, AlertTriangle, Plus, Eye, Megaphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardShell, MetricCard } from "@/components/enterprise";
import { useAuth } from "@/contexts/AuthContext";
import { useDeveloperProjects } from "@/hooks/useDeveloperProjects";
import { supabase } from "@/lib/supabase";

const STAGE_LABELS: Record<string, string> = {
  planning: "Planlama",
  foundation: "Temel",
  construction: "İnşaat",
  finishing: "İnce İmalat",
  ready: "Hazır",
  delivered: "Teslim Edildi",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-200 border-amber-400/30",
  verified: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
  rejected: "bg-rose-500/20 text-rose-200 border-rose-400/30",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Onay bekleniyor",
  verified: "Onaylı",
  rejected: "Reddedildi",
};

interface UnitAggregate {
  totalUnits: number;
  soldUnits: number;
  reservedUnits: number;
  pendingProjects: number;
}

export default function MuteahhitPanelPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, error, refresh } = useDeveloperProjects();

  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [ruhsatPending, setRuhsatPending] = useState(false);
  const [aggregate, setAggregate] = useState<UnitAggregate>({
    totalUnits: 0,
    soldUnits: 0,
    reservedUnits: 0,
    pendingProjects: 0,
  });

  // Role + organizations.ruhsat_pending fetch
  useEffect(() => {
    let cancelled = false;
    const loadRoleAndOrg = async () => {
      if (!user) {
        setRole(null);
        setRoleLoading(false);
        return;
      }
      const [{ data: prof }, { data: org }] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
        supabase
          .from("organizations")
          .select("settings")
          .eq("owner_user_id", user.id)
          .eq("org_type", "contractor")
          .maybeSingle(),
      ]);
      if (cancelled) return;
      const profRole = (prof as { role?: string } | null)?.role ?? null;
      setRole(profRole);
      const settings = (org as { settings?: { ruhsat_pending?: boolean } } | null)?.settings ?? {};
      setRuhsatPending(Boolean(settings.ruhsat_pending));
      setRoleLoading(false);
    };
    void loadRoleAndOrg();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Project unit aggregates (toplam birim, satılan, rezerve, bekleyen proje onayı)
  useEffect(() => {
    let cancelled = false;
    const loadAggregates = async () => {
      if (!user || projects.length === 0) {
        setAggregate({
          totalUnits: 0,
          soldUnits: 0,
          reservedUnits: 0,
          pendingProjects: projects.filter((p) => p.ruhsat_status === "pending").length,
        });
        return;
      }
      const projectIds = projects.map((p) => p.id);
      const { data: units } = await supabase
        .from("project_units")
        .select("status")
        .in("project_id", projectIds);
      if (cancelled) return;
      const list = (units as { status: string }[] | null) ?? [];
      setAggregate({
        totalUnits: list.length,
        soldUnits: list.filter((u) => u.status === "sold").length,
        reservedUnits: list.filter((u) => u.status === "reserved").length,
        pendingProjects: projects.filter((p) => p.ruhsat_status === "pending").length,
      });
    };
    void loadAggregates();
    return () => {
      cancelled = true;
    };
  }, [user, projects]);

  const loading = authLoading || roleLoading || projectsLoading;

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      // pending önce, sonra verified, sonra rejected
      const orderA = a.ruhsat_status === "pending" ? 0 : a.ruhsat_status === "verified" ? 1 : 2;
      const orderB = b.ruhsat_status === "pending" ? 0 : b.ruhsat_status === "verified" ? 1 : 2;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [projects]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Panel yükleniyor…
      </div>
    );
  }

  // Auth gate
  if (!user) {
    return (
      <div className="min-h-screen pt-24 px-4 text-center text-slate-300">
        <p className="mb-4">Bu paneli görüntülemek için giriş yapın.</p>
        <Button asChild>
          <Link to="/login?next=/muteahhit/panel">Giriş yap</Link>
        </Button>
      </div>
    );
  }

  // Role gate — sadece müteahhit/admin
  if (role && role !== "muteahhit" && role !== "admin") {
    return (
      <div className="min-h-screen pt-24 px-4 text-center text-slate-300 max-w-xl mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Müteahhit paneline erişiminiz yok</h2>
        <p className="text-sm text-slate-400 mb-4">
          Bu panel sadece müteahhit rolündeki hesaplara açıktır. Eğer firma kaydı oluşturmak istiyorsanız aşağıdaki düğmeyi kullanın.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button asChild>
            <Link to="/register?kurumsal=muteahhit">Müteahhit hesabı aç</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Ana sayfa</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      badge="Müteahhit paneli"
      title="Projeler ve lansman birimleri"
      subtitle="Ruhsatlı projeleriniz, birim envanteri ve lansman ilanlarını buradan yönetin."
      actions={
        <Button asChild size="sm" className="gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950">
          <Link to="/muteahhit/yeni-proje">
            <Plus className="h-4 w-4" /> Yeni proje
          </Link>
        </Button>
      }
    >
      {/* Ruhsat pending banner */}
      {ruhsatPending && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-300 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-100">
            <p className="font-semibold mb-0.5">Firma ruhsatınız admin onayını bekliyor</p>
            <p className="text-amber-100/80 text-xs">
              Onay tamamlanana kadar projelerinizi oluşturup birim envanteri girebilirsiniz; ancak lansman ilanları ({" "}
              <span className="font-mono">is_lansman</span>) yalnızca proje onayından sonra aktif edilir.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-rose-200 text-sm mb-4">
          Projeler okunamadı: {error}
          <Button size="sm" variant="ghost" className="ml-2 text-rose-200" onClick={() => void refresh()}>
            Tekrar dene
          </Button>
        </div>
      )}

      {/* Metrik kartları (gerçek data) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Toplam proje" value={String(projects.length)} icon={Building2} hint={`${aggregate.pendingProjects} onay bekliyor`} />
        <MetricCard label="Toplam birim" value={String(aggregate.totalUnits)} icon={ListChecks} />
        <MetricCard label="Satılan birim" value={String(aggregate.soldUnits)} icon={Hammer} />
        <MetricCard label="Rezerve birim" value={String(aggregate.reservedUnits)} icon={Megaphone} />
      </div>

      {/* Projeler listesi */}
      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Projeleriniz ({projects.length})</h2>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/muteahhit/yeni-proje">
              <Plus className="h-4 w-4" /> Yeni proje
            </Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-8 text-center">
            <Building2 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 text-sm mb-1">Henüz proje eklemediniz</p>
            <p className="text-slate-500 text-xs mb-4">
              Lansman birimlerinizi yayınlamak için önce bir proje oluşturmanız ve admin onayı almanız gerekir.
            </p>
            <Button asChild size="sm" className="gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950">
              <Link to="/muteahhit/yeni-proje">
                <Plus className="w-4 h-4" /> İlk projeyi oluştur
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {sortedProjects.map((p) => {
              const stage = STAGE_LABELS[p.stage] ?? p.stage;
              const verified = p.ruhsat_status === "verified";
              const completionPct = p.total_units > 0 ? Math.round((p.units_sold / p.total_units) * 100) : 0;
              return (
                <li
                  key={p.id}
                  className="rounded-lg border border-white/10 hover:border-cyan-400/30 transition-colors p-4 bg-slate-950/30"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-white">{p.project_name}</p>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${
                            STATUS_BADGE[p.ruhsat_status] ?? STATUS_BADGE.pending
                          }`}
                        >
                          {STATUS_LABELS[p.ruhsat_status] ?? p.ruhsat_status}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {stage}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {[p.province, p.district, p.neighborhood].filter(Boolean).join(" / ") || "Lokasyon belirtilmedi"}
                        {p.ada_parsel ? ` · Ada/Parsel: ${p.ada_parsel}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button asChild size="sm" variant="outline" className="gap-1.5">
                        <Link to={`/muteahhit/proje/${p.id}`}>
                          <Eye className="w-3.5 h-3.5" /> Detay
                        </Link>
                      </Button>
                      {verified && (
                        <Button asChild size="sm" variant="ghost" className="gap-1.5 text-cyan-300">
                          <Link to={`/proje/${p.id}`}>
                            <Megaphone className="w-3.5 h-3.5" /> Kamu görünüm
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Birim</p>
                      <p className="text-slate-200 font-semibold">{p.total_units}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Satılan</p>
                      <p className="text-blue-300 font-semibold">{p.units_sold}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Rezerve</p>
                      <p className="text-amber-300 font-semibold">{p.units_reserved}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Doluluk</p>
                      <p className="text-emerald-300 font-semibold">%{completionPct}</p>
                    </div>
                  </div>

                  <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                    <span
                      className="block h-full bg-emerald-500/80 rounded-full transition-all"
                      style={{ width: `${Math.min(completionPct, 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Eğitim/SSS bloğu (mevcut SEO içeriği korundu, demo verilere bağımlı değil) */}
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
          <h3 className="text-sm font-semibold text-cyan-100">Neden bu panel?</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-200">
            Lansman projeleri, birim envanteri ve ilan yayını tek yerden yönetilir; ruhsat onayı tamamlanan projeler kamuya açılır.
          </p>
        </article>
        <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <h3 className="text-sm font-semibold text-emerald-100">Akış</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-200">
            1) Proje oluştur (ruhsat + birim) → 2) Admin onayı → 3) Birim yayınla (lansman ilanı) → 4) Satış.
          </p>
        </article>
        <article className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
          <h3 className="text-sm font-semibold text-violet-100">Yayın kuralı</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-200">
            Sadece <span className="font-semibold text-violet-100">verified</span> projelerin birimleri ilan olarak yayınlanabilir; aksi
            durumda RLS engellenir.
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-lg font-bold text-white">SSS</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
          <article>
            <p className="font-semibold text-slate-100">Onay ne kadar sürer?</p>
            <p className="text-slate-400 mt-1">Ruhsat ve KKA doğrulaması iş günü 24-48 saat içinde tamamlanır.</p>
          </article>
          <article>
            <p className="font-semibold text-slate-100">Birimi yayınlayınca ne olur?</p>
            <p className="text-slate-400 mt-1">
              Birim "rezerve" duruma geçer ve <span className="font-mono">/ilan/:id</span> üzerinden satışa açılır.
            </p>
          </article>
          <article>
            <p className="font-semibold text-slate-100">Birden çok blok mu?</p>
            <p className="text-slate-400 mt-1">Evet, birim eklerken her birim için ayrı blok/kat girilebilir.</p>
          </article>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => navigate("/muteahhit/yeni-proje")} className="gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950">
            <Plus className="w-4 h-4" /> Yeni proje aç
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/muteahhit">Müteahhit hakkında</Link>
          </Button>
        </div>
      </section>
    </DashboardShell>
  );
}
