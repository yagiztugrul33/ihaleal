import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Trash2, ArrowLeft, MapPin, TrendingUp, Star, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFavorites } from "@/hooks/useFavorites";
import { loadAllAuctionsForSearch, getLocalAndStaticAuctions } from "@/lib/auctionsSource";
import { ShareButton } from "@/components/ShareButton";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { ListingNumberBadge } from "@/components/ListingNumberBadge";
import { withListingDefaults } from "@/lib/listingPolicy";
import { LoadingState, LoadingSkeletonGrid } from "@/components/async";
import type { Auction } from "@/types/auction";

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, removeFavorite, clearFavorites, count, loading, syncError } = useFavorites();
  const [catalog, setCatalog] = useState<Auction[]>(() => getLocalAndStaticAuctions());
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let ok = true;
    setCatalogLoading(true);
    setCatalogError(null);
    void loadAllAuctionsForSearch()
      .then((rows) => {
        if (ok) setCatalog(rows);
      })
      .catch(() => {
        if (ok) {
          setCatalogError("Uzak liste alınamadı; yerel demo kayıtları gösteriliyor.");
          setCatalog(getLocalAndStaticAuctions());
        }
      })
      .finally(() => {
        if (ok) setCatalogLoading(false);
      });
    return () => {
      ok = false;
    };
  }, []);

  const favoriteAuctions = useMemo(
    () => catalog.filter((a) => favorites.includes(a.id)).map((a) => withListingDefaults(a)),
    [catalog, favorites],
  );

  const isLoading = loading || catalogLoading;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-3"
            >
              <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
            </button>
            <h1 className="text-3xl sm:text-4xl font-normal text-white flex items-center gap-3">
              <Heart className="w-8 h-8 text-[var(--metin-ikincil)] fill-current" />
              Favorilerim
              {count > 0 && (
                <span className="text-lg font-normal text-slate-500">({count})</span>
              )}
            </h1>
            <p className="text-slate-400 mt-2">Favorilerinize eklediğiniz gayrimenkul ihaleleri</p>
          </div>
          {count > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFavorites}
              className="border-slate-200 text-slate-400 hover:text-[var(--metin-ikincil)] hover:border-[var(--cizgi)] hover:bg-[var(--zemin-yumusak)] gap-2"
            >
              <Trash2 className="w-4 h-4" /> Tümünü Temizle
            </Button>
          )}
        </div>

        {syncError ? (
          <p className="mb-4 rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-4 py-3 text-sm text-[var(--metin-ikincil)]" role="status">
            {syncError}
          </p>
        ) : null}
        {catalogError ? (
          <p className="mb-4 rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-4 py-3 text-sm text-[var(--metin-ikincil)]" role="status">
            {catalogError}
          </p>
        ) : null}
        {isLoading ? (
          <>
            <LoadingState label="Favoriler yükleniyor…" compact className="mb-4" />
            <LoadingSkeletonGrid count={3} />
          </>
        ) : !isLoading && favoriteAuctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-[20px] bg-white/5 flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-normal text-white mb-2">Henüz Favori Yok</h3>
            <p className="text-slate-500 max-w-md mb-6">
              İlanları inceleyin ve beğendiklerinizi favorilere ekleyin. Favorileriniz burada listelenecek.
            </p>
            <Button
              onClick={() => {
                navigate("/");
                setTimeout(() => document.getElementById("auctions")?.scrollIntoView({ behavior: "smooth" }), 150);
              }}
              className="[background:var(--gradient-cta)] hover:brightness-110 text-white font-normal px-6"
            >
              İhaleleri Keşfet
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteAuctions.map((auction) => (
              <Card
                key={auction.id}
                className="group bg-slate-900/50 border-slate-200/80 overflow-hidden hover:border-[var(--cizgi)] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/5"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={auction.images[0]}
                    alt={auction.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 [background:var(--gradient-scrim)]" />
                  <div className="absolute top-3 start-3 flex gap-2">
                    {auction.status === "live" && (
                      <span className="px-2.5 py-1 rounded-[10px] bg-[var(--zemin-yumusak)] text-white text-xs font-normal flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Canlı
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-1 rounded-[10px] text-xs font-normal flex items-center gap-1 ${
                        auction.investmentScore >= 85
                          ? "bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] border border-[var(--cizgi)]"
                          : auction.investmentScore >= 70
                          ? "bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] border border-[var(--cizgi)]"
                          : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                      }`}
                    >
                      <Star className="w-3 h-3" /> {auction.investmentScore}
                    </span>
                  </div>
                  <div className="absolute top-3 end-3 flex gap-1.5">
                    <ShareButton title={auction.title} url={`/ilan/${auction.id}`} />
                    <button
                      onClick={() => removeFavorite(auction.id)}
                      className="p-2.5 rounded-[20px] bg-[var(--zemin-yumusak)] text-white hover:bg-[var(--zemin-yumusak)] transition-colors"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <ListingNumberBadge auction={auction} compact />
                  </div>
                  <h3
                    onClick={() => navigate(`/ilan/${auction.id}`)}
                    className="text-base font-normal text-white line-clamp-2 group-hover:text-[var(--metin-ikincil)] transition-colors cursor-pointer"
                  >
                    {auction.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {auction.location}
                  </div>

                  <div className="flex items-center gap-2 mb-3 mt-3 p-2.5 rounded-[10px] bg-white/[0.03] border border-slate-200/80">
                    <BarChart3 className="w-4 h-4 text-[var(--metin-ikincil)]" />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">AI Değerleme</span>
                        <span className="text-[var(--metin-ikincil)] font-normal">
                          ₺{(auction.aiPredictedPrice / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full [background:var(--gradient-cta)]"
                          style={{
                            width: `${Math.min(
                              (auction.currentBid / auction.aiPredictedPrice) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Güncel Teklif</div>
                      <div className="text-lg font-normal text-[var(--metin-ikincil)]">
                        ₺{auction.currentBid.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-xs text-slate-600">
                        ₺{auction.pricePerSqm.toLocaleString("tr-TR")}/m²
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/ilan/${auction.id}`)}
                      className="[background:var(--gradient-cta)] hover:brightness-110 text-white font-normal text-xs h-9 px-4"
                    >
                      <TrendingUp className="w-3.5 h-3.5 me-1" />
                      Teklif Ver
                    </Button>
                  </div>
                  <ListingDocumentFooter auction={auction} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
