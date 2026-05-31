import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, Trash2, Play, Bell, Search, Filter, MapPin, Building, Coins, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import type { Auction } from "@/types/auction";
import type { SavedSearchRecord } from "@/lib/savedSearches/savedSearches";
import { cn } from "@/lib/utils";

function formatTRY(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v >= 1_000_000) return `₺${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₺${(v / 1_000).toFixed(0)}K`;
  return `₺${v.toLocaleString("tr-TR")}`;
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = now - t;
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Bugün";
  if (days < 7) return `${days} gün önce`;
  if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
  return new Date(iso).toLocaleDateString("tr-TR");
}

/**
 * /aramalarim — Master Dalga 4-1: kullanıcının kayıtlı aramalarının
 * yönetim sayfası. saved_searches tablosu mevcut altyapı kullanılıyor;
 * yeni migration yok.
 *
 * Sayfa:
 * - Anonim: zengin landing "Giriş yap" + 3 fayda
 * - Login + boş: "Henüz arama yok" + /arama'ya yönlendir
 * - Login + dolu: kart grid (name, kriterler, yeni eşleşme sayısı,
 *   çalıştır → /arama URL state, sil)
 */
export default function Aramalarim() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<Auction[]>(() => getLocalAndStaticAuctions());

  useEffect(() => {
    let alive = true;
    void loadAllAuctionsForSearch()
      .then((rows) => {
        if (alive) setCatalog(rows);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const { searches, loading, error, remove } = useSavedSearches(catalog);

  const runSearch = (s: SavedSearchRecord) => {
    const params = new URLSearchParams();
    if (s.queryText) params.set("q", s.queryText);
    if (s.city) params.set("city", s.city);
    if (s.category) params.set("ptype", s.category.toLowerCase());
    if (s.priceMin != null) params.set("pmin", String(s.priceMin));
    if (s.priceMax != null) params.set("pmax", String(s.priceMax));
    if (s.sortKey && s.sortKey !== "relevance") params.set("sort", s.sortKey);
    navigate(`/arama?${params.toString()}`);
  };

  const newMatchCount = useMemo(() => {
    return new Map<string, number>(
      searches.map((s) => [s.id, Array.isArray(s.criteria?.matchedListingIds) ? s.criteria.matchedListingIds.length : 0]),
    );
  }, [searches]);

  // Anonim landing
  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white gap-2 mb-6 mx-auto">
            <ArrowLeft className="w-4 h-4" /> Geri
          </Button>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 mb-4">
            <Bookmark className="h-3.5 w-3.5" /> Aramalarım
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Kayıtlı Aramalarım</h1>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
            Arama kriterlerinizi kaydedin; yeni eşleşmelerden anında haberdar olun. Tek tıkla
            aramayı yeniden çalıştırın veya silin.
          </p>
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <Bell className="w-6 h-6 text-cyan-300 mb-2" />
              <h3 className="font-semibold text-white text-sm mb-1">Yeni Eşleşme Bildirimi</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kriterlerinize uyan yeni ilan eklenince bildirilirsiniz.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <Play className="w-6 h-6 text-emerald-300 mb-2" />
              <h3 className="font-semibold text-white text-sm mb-1">Tek Tıkla Çalıştır</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kayıtlı kriterleri /arama sayfasına aktarır, sonuçları görürsünüz.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <Filter className="w-6 h-6 text-violet-300 mb-2" />
              <h3 className="font-semibold text-white text-sm mb-1">İhale Filtreleri Dahil</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                İhale tipi, durum, fiyat, m² — tüm filtreler birlikte kaydolur.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate("/giris?next=/aramalarim")} className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold gap-2">
              <Bookmark className="w-4 h-4" /> Giriş Yap
            </Button>
            <Button onClick={() => navigate("/arama")} variant="outline" className="border-cyan-400/40 text-cyan-100 hover:bg-cyan-500/10 gap-2">
              <Search className="w-4 h-4" /> İlk Aramayı Yap
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Login
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Bookmark className="w-7 h-7 text-cyan-400" /> Kayıtlı Aramalarım
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {searches.length > 0
                ? `${searches.length} kayıtlı arama. Aşağıdan çalıştırın veya yönetin.`
                : "Henüz kayıtlı aramanız yok."}
            </p>
          </div>
          <Button onClick={() => navigate("/arama")} variant="accent">
            <Plus className="w-4 h-4" /> Yeni Arama
          </Button>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-900/40 border border-slate-700/50 animate-pulse" />
            ))}
          </div>
        ) : searches.length === 0 ? (
          <div className="rounded-3xl border border-slate-700/40 bg-slate-900/40 p-8 text-center">
            <Bookmark className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">Henüz kayıtlı aramanız yok</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
              /arama sayfasında kriter girin (mülk tipi, konum, fiyat) ve "Aramayı kaydet" deyin.
              Yeni eşleşmeler burada görünür ve bildirim alırsınız.
            </p>
            <Button onClick={() => navigate("/arama")} className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white gap-2">
              <Search className="w-4 h-4" /> Aramaya Başla
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {searches.map((s) => {
              const newCount = newMatchCount.get(s.id) ?? 0;
              return (
                <article
                  key={s.id}
                  className="rounded-2xl border border-cyan-400/20 bg-slate-900/40 p-4 flex flex-col gap-3 hover:border-cyan-400/40 transition-colors"
                  data-testid="saved-search-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white text-base truncate">{s.name || s.queryText || "Adsız arama"}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3" /> {relativeTime(s.createdAt)}
                      </p>
                    </div>
                    {newCount > 0 ? (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 text-[10px] font-semibold px-2 py-0.5 flex-shrink-0">
                        {newCount} eşleşme
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {s.queryText ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/70 border border-slate-700 px-2 py-0.5 text-slate-200">
                        <Search className="w-2.5 h-2.5" /> {s.queryText}
                      </span>
                    ) : null}
                    {s.city ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/70 border border-slate-700 px-2 py-0.5 text-slate-200">
                        <MapPin className="w-2.5 h-2.5" /> {s.city}
                      </span>
                    ) : null}
                    {s.category ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/70 border border-slate-700 px-2 py-0.5 text-slate-200">
                        <Building className="w-2.5 h-2.5" /> {s.category}
                      </span>
                    ) : null}
                    {(s.priceMin != null || s.priceMax != null) ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/70 border border-slate-700 px-2 py-0.5 text-slate-200">
                        <Coins className="w-2.5 h-2.5" /> {formatTRY(s.priceMin)} – {formatTRY(s.priceMax)}
                      </span>
                    ) : null}
                  </div>

                  <div className={cn("flex gap-2 pt-2 border-t", "border-slate-700/40")}>
                    <Button
                      size="sm"
                      onClick={() => runSearch(s)}
                      variant="accent"
                      className="flex-1 h-8"
                    >
                      <Play className="w-3.5 h-3.5" /> Çalıştır
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (window.confirm(`"${s.name || s.queryText}" aramasını silmek istediğinize emin misiniz?`)) {
                          await remove(s.id);
                        }
                      }}
                      className="border-red-400/40 text-red-200 hover:bg-red-500/10 gap-1.5 h-8"
                      aria-label={`${s.name} sil`}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Sil
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-700/40 flex flex-wrap gap-2 text-xs text-slate-500">
          <Link to="/panel" className="hover:text-cyan-300">Hesap paneli</Link>
          <span>·</span>
          <Link to="/favoriler" className="hover:text-cyan-300">Favoriler</Link>
          <span>·</span>
          <Link to="/bildirimler" className="hover:text-cyan-300">Bildirimler</Link>
          <span>·</span>
          <Link to="/profil" className="hover:text-cyan-300">Profil</Link>
        </div>
      </div>
    </div>
  );
}
