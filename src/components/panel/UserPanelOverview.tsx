import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart, Bell, Search, HandCoins, Eye, Bookmark, Plus, Sparkles,
  Gavel, TrendingUp, MapPin, Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { useNotifications } from "@/hooks/useNotifications";
import { useBuyerOffers, useSellerOffers } from "@/hooks/useListingOffers";
import { useSellerAnalytics } from "@/hooks/useSellerAnalytics";
import { SellerAnalyticsPanel } from "@/components/seller/SellerAnalyticsPanel";
import { isSupabaseConfigured } from "@/lib/supabase";
import { LoadingState } from "@/components/async/LoadingState";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import type { Auction } from "@/types/auction";

function formatTRY(v: number): string {
  if (v >= 1_000_000) return `₺${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₺${(v / 1_000).toFixed(0)}K`;
  return `₺${v.toLocaleString("tr-TR")}`;
}

export function UserPanelOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [catalog, setCatalog] = useState<Auction[]>(() => getLocalAndStaticAuctions());
  const savedApi = useSavedSearches(catalog);
  const { unreadCount } = useNotifications();
  const buyerOffers = useBuyerOffers();
  const sellerOffers = useSellerOffers();
  const analytics = useSellerAnalytics();

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

  const pendingBuyer = buyerOffers.offers.filter((o) => o.status === "pending" || o.status === "countered").length;
  const pendingSeller = sellerOffers.offers.filter((o) => o.status === "pending").length;

  // Anonim — zengin landing
  if (!user) {
    return (
      <Card className="border-dashed border-slate-200/80 bg-slate-900/50">
        <CardContent className="p-8">
          <div className="text-center max-w-lg mx-auto">
            <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-white mb-2">Kişisel paneliniz burada</h2>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              Giriş yaptıktan sonra: kayıtlı aramalarınız, favori ilanlarınız, aktif teklifleriniz,
              bildirimler ve satıcı analitiği tek ekrandan yönetilir.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 text-start text-xs text-slate-400 mb-6">
              <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 p-2">
                <Heart className="w-4 h-4 text-rose-400" /> Favori takibi + fiyat değişimi
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 p-2">
                <Bookmark className="w-4 h-4 text-cyan-400" /> Aramalarınız + yeni eşleşmeler
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 p-2">
                <HandCoins className="w-4 h-4 text-amber-400" /> Tekliflerinizin durumu
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 p-2">
                <Eye className="w-4 h-4 text-blue-400" /> İlanlarınızın görüntülenmesi
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={() => navigate("/giris?next=/panel")} className="[background:var(--gradient-cta)] text-white">
                Giriş
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/kayit?next=/panel")} className="border-cyan-400/40">
                Hesap Oluştur
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Son aktivite — favorilerden ve tekliflerden son birkaç
  const recentFavorites = favorites.slice(0, 3);
  const favoriteAuctions = recentFavorites
    .map((id) => catalog.find((a) => a.id === id))
    .filter((a): a is Auction => Boolean(a));
  const recentBuyerOffers = buyerOffers.offers.slice(0, 3);

  // Hoşgeldin metni: user.name varsa onunla, yoksa "kullanıcı"
  const userName = (user as { name?: string; email?: string }).name ?? (user as { email?: string }).email?.split("@")[0] ?? "kullanıcı";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-slate-900/40 p-5">
        <p className="text-xs text-cyan-300 uppercase tracking-wider mb-1">Hoş geldiniz</p>
        <h2 className="text-xl md:text-2xl font-bold text-white">{userName}</h2>
        <p className="text-sm text-slate-400 mt-1">Aşağıdaki kartlar canlı veriden geliyor.</p>
      </div>

      {/* 4 özet kart */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <Heart className="h-4 w-4" /> Favoriler
            </div>
            <div className="mt-1 text-3xl font-bold text-rose-400">{favorites.length}</div>
            <Button type="button" variant="link" className="h-auto p-0 text-xs text-teal-400" onClick={() => navigate("/favoriler")}>
              Görüntüle
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <Bookmark className="h-4 w-4" /> Kayıtlı arama
            </div>
            <div className="mt-1 text-3xl font-bold text-sky-400">
              {savedApi.loading ? "…" : savedApi.searches.length}
            </div>
            <Button type="button" variant="link" className="h-auto p-0 text-xs text-teal-400" onClick={() => navigate("/aramalarim")}>
              Aramalarım
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <HandCoins className="h-4 w-4" /> Tekliflerim
            </div>
            <div className="mt-1 text-3xl font-bold text-amber-400">
              {buyerOffers.loading ? "…" : pendingBuyer}
            </div>
            <span className="text-xs text-slate-500">bekleyen</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <Bell className="h-4 w-4" /> Bildirim
            </div>
            <div className="mt-1 text-3xl font-bold text-violet-400">{unreadCount}</div>
            <span className="text-xs text-slate-500">okunmamış</span>
          </CardContent>
        </Card>
      </div>

      {/* Son aktivite — favoriler */}
      {favoriteAuctions.length > 0 ? (
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" /> Son Favori İlanlarınız
              </h3>
              <Button type="button" variant="link" className="h-auto p-0 text-xs text-teal-400" onClick={() => navigate("/favoriler")}>
                Tümünü gör
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {favoriteAuctions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => navigate(`/ilan/${a.id}`)}
                  className="text-start rounded-xl border border-white/10 bg-slate-950/40 overflow-hidden hover:border-cyan-400/40 transition-colors"
                >
                  <div className="aspect-[16/10] bg-slate-800 overflow-hidden">
                    <img src={a.images[0]} alt={a.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5 space-y-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {a.district}, {a.city}
                    </div>
                    <div className="text-xs font-medium text-white line-clamp-2 leading-snug">{a.title}</div>
                    <div className="text-sm font-bold text-cyan-300">{formatTRY(a.currentBid)}</div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Son aktivite — tekliflerim (sealed maskeleme korunuyor: useBuyerOffers
          satıcı tarafını filtreler; buyer kendi tekliflerini görür). */}
      {recentBuyerOffers.length > 0 ? (
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-amber-400" /> Son Tekliflerim
              </h3>
              <Button type="button" variant="link" className="h-auto p-0 text-xs text-teal-400" onClick={() => navigate("/panel/tekliflerim")}>
                Tümünü gör
              </Button>
            </div>
            <div className="space-y-2">
              {recentBuyerOffers.map((o) => (
                <div
                  key={o.id}
                  className="rounded-lg border border-slate-700/60 bg-slate-950/40 p-2.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 truncate">İlan #{o.listing_id?.slice(0, 8) ?? "?"}</p>
                    <p className="text-sm text-white font-medium">{formatTRY(o.amount_try ?? 0)}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      o.status === "pending" ? "bg-amber-500/20 text-amber-200" :
                      o.status === "accepted" ? "bg-emerald-500/20 text-emerald-200" :
                      o.status === "rejected" ? "bg-red-500/20 text-red-200" :
                      o.status === "countered" ? "bg-violet-500/20 text-violet-200" :
                      "bg-slate-700/40 text-slate-300"
                    }`}
                  >
                    {o.status === "pending" ? "Bekleyen" : o.status === "accepted" ? "Kabul" : o.status === "rejected" ? "Ret" : o.status === "countered" ? "Karşı teklif" : o.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isSupabaseConfigured() ? (
        <>
          {analytics.loading ? <LoadingState compact label="Satıcı analitiği…" /> : null}
          {!analytics.loading && analytics.data && analytics.data.totalViews > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="bg-slate-900/50 border-slate-200/80">
                <CardContent className="p-4 flex items-center gap-3">
                  <Eye className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-slate-500">Toplam görüntülenme</p>
                    <p className="text-xl font-bold text-white">{analytics.data.totalViews.toLocaleString("tr-TR")}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-200/80">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">Gelen teklif (bekleyen)</p>
                  <p className="text-xl font-bold text-emerald-400">{pendingSeller}</p>
                </CardContent>
              </Card>
            </div>
          ) : null}
          <SellerAnalyticsPanel />
        </>
      ) : null}

      {/* Hızlı erişim — Master DOKUNDU: "İlan ver" CTA eklendi */}
      <Card className="bg-slate-900/50 border-slate-200/80">
        <CardContent className="p-5 flex flex-wrap gap-3">
          <Button asChild className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold gap-2">
            <Link to="/ihale-ac">
              <Plus className="w-4 h-4" /> İlan / İhale Aç
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-cyan-400/40 gap-2">
            <Link to="/arama">
              <Search className="w-4 h-4" /> Arama Yap
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/profil">Profil</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/panel/tekliflerim">Tekliflerim</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/panel/gelen-teklifler">Gelen teklifler</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/bildirimler">Bildirimler</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/aramalarim">Aramalarım</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
