import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, CheckCircle2, Gavel, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  DashboardShell,
  DataTable,
  MetricCard,
  SkeletonTable,
  TrustIndicator,
} from "@/components/enterprise";

type ListingRow = {
  id: string;
  title: string;
  status: string;
  city: string | null;
  created_at?: string;
};

type AuctionRow = {
  id: string;
  listing_id: string;
  status: string;
  ends_at: string | null;
  bid_count: number | null;
};

type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<"users" | "listings" | "auctions" | "audit">("listings");
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [auctions, setAuctions] = useState<AuctionRow[]>([]);
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadListings = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const { data, error } = await supabase
      .from("listings")
      .select("id,title,status,city,created_at")
      .eq("status", "review")
      .order("created_at", { ascending: false })
      .limit(80);
    if (error) setMsg(error.message);
    else setListings((data ?? []) as ListingRow[]);
  }, []);

  const loadAuctions = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const { data, error } = await supabase
      .from("auctions")
      .select("id,listing_id,status,ends_at,bid_count")
      .order("created_at", { ascending: false })
      .limit(80);
    if (error) setMsg(error.message);
    else setAuctions((data ?? []) as AuctionRow[]);
  }, []);

  const loadAudit = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const { data, error } = await supabase
      .from("audit_log")
      .select("id,action,entity_type,entity_id,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) setMsg(error.message);
    else setAudits((data ?? []) as AuditRow[]);
  }, []);

  const loadProfilesProbe = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) setProfileErr(error.message);
    else setProfileErr(null);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await Promise.all([loadListings(), loadProfilesProbe()]);
      setLoading(false);
    })();
  }, [loadListings, loadProfilesProbe]);

  useEffect(() => {
    if (tab === "auctions") void loadAuctions();
    if (tab === "audit") void loadAudit();
  }, [tab, loadAuctions, loadAudit]);

  async function approveListing(id: string) {
    if (!isSupabaseConfigured()) return;
    setBusyId(id);
    setMsg(null);
    const { data, error } = await supabase.rpc("admin_approve_listing", { p_listing_id: id });
    setBusyId(null);
    if (error) {
      setMsg(error.message);
      return;
    }
    const ok = data && typeof data === "object" && (data as { ok?: boolean }).ok === true;
    if (!ok) {
      setMsg("Onay işlemi reddedildi.");
      return;
    }
    await loadListings();
    setMsg("İlan onaylandı (active).");
  }

  const tabs = [
    ["users", "Kullanıcılar"],
    ["listings", "İlanlar"],
    ["auctions", "İhaleler"],
    ["audit", "Audit Log"],
  ] as const;

  return (
    <DashboardShell
      badge="Kurumsal"
      title="Yönetim merkezi"
      subtitle="Moderasyon, onay akışları ve denetim kayıtları — sunucu tarafı yetkilendirme zorunlu."
      maxWidth="lg"
      back={
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-400">
            <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Siteye dön
          </Button>
        </Link>
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <TrustIndicator icon={Shield} label="RLS korumalı" variant="success" />
          <TrustIndicator icon={CheckCircle2} label="RPC onay" variant="info" />
        </div>
      }
    >
      {msg ? (
        <div className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-4 py-3 text-sm text-[var(--metin-ikincil)]">{msg}</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Onay bekleyen" value={String(listings.length)} icon={FileText} />
        <MetricCard label="İhale kaydı" value={String(auctions.length)} icon={Gavel} />
        <MetricCard label="Audit" value={String(audits.length)} icon={Shield} />
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-[10px] border px-4 py-2 text-sm font-normal transition-all ${
              tab === id
                ? "border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-white shadow-lux"
                : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && tab === "listings" ? <SkeletonTable rows={4} /> : null}

      {tab === "users" ? (
        <div className="card-luxury p-6">
          <p className="mb-4 text-sm text-slate-400">
            Çoklu kullanıcı listesi için Supabase&apos;de admin&apos;e profiles SELECT politikası gerekir.
          </p>
          {profileErr ? (
            <p className="font-mono text-sm text-[var(--metin-ikincil)]">{profileErr}</p>
          ) : (
            <p className="text-sm text-[var(--metin-ikincil)]">Profil tablosuna örnek sorgu başarılı.</p>
          )}
        </div>
      ) : null}

      {tab === "listings" && !loading ? (
        <DataTable
          rows={listings}
          getRowKey={(r) => r.id}
          emptyMessage="Onay bekleyen ilan yok veya RLS engelledi."
          columns={[
            { key: "title", header: "Başlık", cell: (r) => <span className="max-w-[240px] truncate block">{r.title}</span> },
            { key: "city", header: "Şehir", cell: (r) => r.city ?? "—" },
            {
              key: "status",
              header: "Durum",
              cell: (r) => <span className="font-normal text-[var(--metin-ikincil)]">{r.status}</span>,
            },
            {
              key: "action",
              header: "",
              className: "w-[140px]",
              cell: (r) => (
                <Button
                  size="sm"
                  disabled={busyId === r.id}
                  onClick={() => void approveListing(r.id)}
                >
                  {busyId === r.id ? "…" : "Onayla"}
                </Button>
              ),
            },
          ]}
        />
      ) : null}

      {tab === "auctions" ? (
        <DataTable
          rows={auctions}
          getRowKey={(r) => r.id}
          emptyMessage="Kayıt yok veya sorgu engellendi."
          columns={[
            { key: "id", header: "İhale", cell: (r) => <span className="font-mono text-xs">{r.id.slice(0, 8)}…</span> },
            { key: "listing", header: "Listing", cell: (r) => <span className="font-mono text-xs">{r.listing_id.slice(0, 8)}…</span> },
            { key: "status", header: "Durum", cell: (r) => r.status },
            {
              key: "ends",
              header: "Bitiş",
              cell: (r) => (r.ends_at ? new Date(r.ends_at).toLocaleString("tr-TR") : "—"),
            },
            { key: "bids", header: "Teklif", cell: (r) => r.bid_count ?? 0 },
          ]}
        />
      ) : null}

      {tab === "audit" ? (
        <DataTable
          rows={audits}
          getRowKey={(r) => r.id}
          emptyMessage="Audit kaydı yok veya okuma yetkisi yok."
          columns={[
            {
              key: "time",
              header: "Zaman",
              cell: (r) => (
                <span className="whitespace-nowrap text-slate-500">
                  {new Date(r.created_at).toLocaleString("tr-TR")}
                </span>
              ),
            },
            { key: "action", header: "Aksiyon", cell: (r) => r.action },
            {
              key: "entity",
              header: "Varlık",
              cell: (r) => `${r.entity_type}${r.entity_id ? ` · ${r.entity_id.slice(0, 8)}…` : ""}`,
            },
          ]}
        />
      ) : null}
    </DashboardShell>
  );
}
