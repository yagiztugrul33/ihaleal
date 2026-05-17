import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
  const [tab, setTab] = useState("listings");
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [auctions, setAuctions] = useState<AuctionRow[]>([]);
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

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
    void loadListings();
    void loadProfilesProbe();
  }, [loadListings, loadProfilesProbe]);

  useEffect(() => {
    if (tab === "auctions") void loadAuctions();
    if (tab === "audit") void loadAudit();
  }, [tab, loadAuctions, loadAudit]);

  async function approveListing(id: string) {
    if (!isSupabaseConfigured()) return;
    setBusyId(id);
    setMsg(null);
    const { data, error } = await supabase.rpc("admin_approve_listing", {
      p_listing_id: id,
    });
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

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Yönetim</h1>
            <p className="text-sm text-slate-500">Admin — ilan / ihale özeti ve audit log</p>
          </div>
          <Link to="/" className="ml-auto">
            <Button variant="ghost" size="sm" className="text-slate-400 gap-2">
              <ArrowLeft className="w-4 h-4" /> Siteye dön
            </Button>
          </Link>
        </div>

        {msg ? (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">{msg}</div>
        ) : null}

        <div className="flex flex-wrap gap-2 mb-6">
          {(
            [
              ["users", "Kullanıcılar"],
              ["listings", "İlanlar"],
              ["auctions", "İhaleler"],
              ["audit", "Audit Log"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                tab === id
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-slate-900/60 border-slate-200 text-slate-500 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "users" ? (
            <div className="rounded-xl border border-slate-200 bg-slate-900/40 p-6">
              <p className="text-slate-400 text-sm mb-4">
                Çoklu kullanıcı listesi için Supabase&apos;de admin&apos;e `profiles` SELECT politikası gerekir (
                <code className="text-teal-400/90">manual_push_v4.sql</code>).
              </p>
              {profileErr ? (
                <p className="text-red-400 text-sm font-mono">{profileErr}</p>
              ) : (
                <p className="text-emerald-400/90 text-sm">Profil tablosuna örnek sorgu başarılı — politikalar uygun olabilir.</p>
              )}
            </div>
        ) : null}

        {tab === "listings" ? (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-950/80 text-left text-slate-400">
                  <tr>
                    <th className="p-3">Başlık</th>
                    <th className="p-3">Şehir</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3 w-[140px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-slate-500 text-center">
                        Onay bekleyen (review) ilan yok veya RLS engelledi.
                      </td>
                    </tr>
                  ) : (
                    listings.map((row) => (
                      <tr key={row.id} className="text-slate-200">
                        <td className="p-3 max-w-[240px] truncate">{row.title}</td>
                        <td className="p-3 text-slate-400">{row.city ?? "—"}</td>
                        <td className="p-3">
                          <span className="text-amber-400">{row.status}</span>
                        </td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            disabled={busyId === row.id}
                            className="bg-teal-600 hover:bg-teal-500 text-white"
                            onClick={() => void approveListing(row.id)}
                          >
                            {busyId === row.id ? "…" : "İlanı onayla"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        ) : null}

        {tab === "auctions" ? (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-950/80 text-left text-slate-400">
                  <tr>
                    <th className="p-3">İhale ID</th>
                    <th className="p-3">Listing</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3">Bitiş</th>
                    <th className="p-3">Teklif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auctions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-slate-500 text-center">
                        Kayıt yok veya sorgu engellendi.
                      </td>
                    </tr>
                  ) : (
                    auctions.map((row) => (
                      <tr key={row.id} className="text-slate-300">
                        <td className="p-3 font-mono text-xs">{row.id.slice(0, 8)}…</td>
                        <td className="p-3 font-mono text-xs">{row.listing_id.slice(0, 8)}…</td>
                        <td className="p-3">{row.status}</td>
                        <td className="p-3 text-slate-500">{row.ends_at ? new Date(row.ends_at).toLocaleString("tr-TR") : "—"}</td>
                        <td className="p-3">{row.bid_count ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        ) : null}

        {tab === "audit" ? (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-950/80 text-left text-slate-400">
                  <tr>
                    <th className="p-3">Zaman</th>
                    <th className="p-3">Aksiyon</th>
                    <th className="p-3">Varlık</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {audits.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-6 text-slate-500 text-center">
                        Audit kaydı yok veya okuma yetkisi yok (`audit_log` + admin RLS).
                      </td>
                    </tr>
                  ) : (
                    audits.map((row) => (
                      <tr key={row.id} className="text-slate-300">
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          {new Date(row.created_at).toLocaleString("tr-TR")}
                        </td>
                        <td className="p-3">{row.action}</td>
                        <td className="p-3">
                          {row.entity_type} {row.entity_id ? `· ${row.entity_id.slice(0, 8)}…` : ""}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        ) : null}
      </div>
    </div>
  );
}
