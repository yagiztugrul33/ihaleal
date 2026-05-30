import { Link, useNavigate } from "react-router-dom";
import { Heart, Bell, Search, HandCoins, Eye } from "lucide-react";
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

export function UserPanelOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const savedApi = useSavedSearches([]);
  const { unreadCount } = useNotifications();
  const buyerOffers = useBuyerOffers();
  const sellerOffers = useSellerOffers();
  const analytics = useSellerAnalytics();

  const pendingBuyer = buyerOffers.offers.filter((o) => o.status === "pending" || o.status === "countered").length;
  const pendingSeller = sellerOffers.offers.filter((o) => o.status === "pending").length;

  if (!user) {
    return (
      <Card className="border-dashed border-slate-200/80 bg-slate-900/50">
        <CardContent className="p-8 text-center text-sm text-slate-400">
          Özet için giriş yapın.
          <Button type="button" className="mt-4" onClick={() => navigate("/giris")}>
            Giriş
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
              <Search className="h-4 w-4" /> Kayıtlı arama
            </div>
            <div className="mt-1 text-3xl font-bold text-sky-400">
              {savedApi.loading ? "…" : savedApi.searches.length}
            </div>
            <Button type="button" variant="link" className="h-auto p-0 text-xs text-teal-400" onClick={() => navigate("/arama")}>
              Arama sayfası
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

      <Card className="bg-slate-900/50 border-slate-200/80">
        <CardContent className="p-5 flex flex-wrap gap-3">
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
        </CardContent>
      </Card>
    </div>
  );
}
