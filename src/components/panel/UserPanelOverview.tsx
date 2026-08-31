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
      <Card className="border-dashed border-border">
        <CardContent className="p-8">
          <div className="text-center max-w-lg mx-auto">
            <Sparkles className="w-10 h-10 text-card-foreground mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-card-foreground mb-2">Kişisel paneliniz burada</h2>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Giriş yaptıktan sonra: kayıtlı aramalarınız, favori ilanlarınız, aktif teklifleriniz,
              bildirimler ve satıcı analitiği tek ekrandan yönetilir.
            </p>
            {/* Not: bg-black/[…] / bg-white/[…] KULLANMA — global-acik.css bunları
                !important ile koyu zemine (var(--zemin-yumusak)) çeviriyor. Bone
                Card üstünde nötr ayrım için sadece hairline border kullanılır. */}
            <div className="grid gap-2 sm:grid-cols-2 text-start text-xs text-muted-foreground mb-6">
              <div className="flex items-center gap-2 rounded-lg border border-border p-2">
                <Heart className="w-4 h-4 text-muted-foreground" /> Favori takibi + fiyat değişimi
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border p-2">
                <Bookmark className="w-4 h-4 text-muted-foreground" /> Aramalarınız + yeni eşleşmeler
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border p-2">
                <HandCoins className="w-4 h-4 text-muted-foreground" /> Tekliflerinizin durumu
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border p-2">
                <Eye className="w-4 h-4 text-muted-foreground" /> İlanlarınızın görüntülenmesi
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={() => navigate("/giris?next=/panel")} className="[background:var(--gradient-cta)] text-white">
                Giriş
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/kayit?next=/panel")} className="border-border">
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
      <div className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Hoş geldiniz</p>
        <h2 className="text-xl md:text-2xl font-normal text-foreground">{userName}</h2>
        <p className="text-sm text-muted-foreground mt-1">Aşağıdaki kartlar canlı veriden geliyor.</p>
      </div>

      {/* 4 özet kart */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Heart className="h-4 w-4" /> Favoriler
            </div>
            <div className="mt-1 text-3xl font-normal text-card-foreground">{favorites.length}</div>
            <Button type="button" variant="link" className="h-auto p-0 text-xs text-card-foreground" onClick={() => navigate("/favoriler")}>
              Görüntüle
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Bookmark className="h-4 w-4" /> Kayıtlı arama
            </div>
            <div className="mt-1 text-3xl font-normal text-card-foreground">
              {savedApi.loading ? "…" : savedApi.searches.length}
            </div>
            <Button type="button" variant="link" className="h-auto p-0 text-xs text-card-foreground" onClick={() => navigate("/aramalarim")}>
              Aramalarım
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <HandCoins className="h-4 w-4" /> Tekliflerim
            </div>
            <div className="mt-1 text-3xl font-normal text-card-foreground">
              {buyerOffers.loading ? "…" : pendingBuyer}
            </div>
            <span className="text-xs text-muted-foreground">bekleyen</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Bell className="h-4 w-4" /> Bildirim
            </div>
            <div className="mt-1 text-3xl font-normal text-card-foreground">{unreadCount}</div>
            <span className="text-xs text-muted-foreground">okunmamış</span>
          </CardContent>
        </Card>
      </div>

      {/* Son aktivite — favoriler */}
      {favoriteAuctions.length > 0 ? (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-normal uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Heart className="w-4 h-4 text-muted-foreground" /> Son Favori İlanlarınız
              </h3>
              <Button type="button" variant="link" className="h-auto p-0 text-xs text-card-foreground" onClick={() => navigate("/favoriler")}>
                Tümünü gör
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {favoriteAuctions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => navigate(`/ilan/${a.id}`)}
                  className="text-start rounded-xl border border-border overflow-hidden hover:border-card-foreground/40 transition-colors"
                >
                  <div className="aspect-[16/10] bg-muted overflow-hidden">
                    <img src={a.images[0]} alt={a.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5 space-y-1">
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {a.district}, {a.city}
                    </div>
                    <div className="text-xs font-medium text-card-foreground line-clamp-2 leading-snug">{a.title}</div>
                    <div className="text-sm font-normal text-card-foreground">{formatTRY(a.currentBid)}</div>
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
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-normal uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-muted-foreground" /> Son Tekliflerim
              </h3>
              <Button type="button" variant="link" className="h-auto p-0 text-xs text-card-foreground" onClick={() => navigate("/panel/tekliflerim")}>
                Tümünü gör
              </Button>
            </div>
            <div className="space-y-2">
              {recentBuyerOffers.map((o) => (
                <div
                  key={o.id}
                  className="rounded-lg border border-border p-2.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground truncate">İlan #{o.listing_id?.slice(0, 8) ?? "?"}</p>
                    <p className="text-sm text-card-foreground font-medium">{formatTRY(o.amount_try ?? 0)}</p>
                  </div>
                  <span
                    className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-[var(--zemin)] border border-[var(--cizgi)] text-muted-foreground"
                    style={o.status === "accepted" ? { color: "var(--metrik-yesil)" } : undefined}
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
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Toplam görüntülenme</p>
                    <p className="text-xl font-normal text-card-foreground">{analytics.data.totalViews.toLocaleString("tr-TR")}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Gelen teklif (bekleyen)</p>
                  <p className="text-xl font-normal text-card-foreground">{pendingSeller}</p>
                </CardContent>
              </Card>
            </div>
          ) : null}
          <SellerAnalyticsPanel />
        </>
      ) : null}

      {/* Hızlı erişim — Master DOKUNDU: "İlan ver" CTA eklendi */}
      <Card>
        <CardContent className="p-5 flex flex-wrap gap-3">
          <Button asChild className="gap-2">
            <Link to="/ihale-ac">
              <Plus className="w-4 h-4" /> İlan / İhale Aç
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-border gap-2">
            <Link to="/arama">
              <Search className="w-4 h-4" /> Arama Yap
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-border">
            <Link to="/profil">Profil</Link>
          </Button>
          <Button asChild variant="outline" className="border-border">
            <Link to="/panel/tekliflerim">Tekliflerim</Link>
          </Button>
          <Button asChild variant="outline" className="border-border">
            <Link to="/panel/gelen-teklifler">Gelen teklifler</Link>
          </Button>
          <Button asChild variant="outline" className="border-border">
            <Link to="/bildirimler">Bildirimler</Link>
          </Button>
          <Button asChild variant="outline" className="border-border">
            <Link to="/aramalarim">Aramalarım</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
