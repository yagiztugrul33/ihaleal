import { useNavigate } from "react-router-dom";
import { Heart, Trash2, ArrowLeft, MapPin, TrendingUp, Star, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFavorites } from "@/hooks/useFavorites";
import { AUCTIONS } from "@/data/auctions";
import { ShareButton } from "@/components/ShareButton";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { ListingNumberBadge } from "@/components/ListingNumberBadge";
import { withListingDefaults } from "@/lib/listingPolicy";

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, removeFavorite, clearFavorites, count } = useFavorites();

  const favoriteAuctions = AUCTIONS.filter((a) => favorites.includes(a.id)).map((a) => withListingDefaults(a));

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Geri
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-500 fill-current" />
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
              className="border-slate-200 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 gap-2"
            >
              <Trash2 className="w-4 h-4" /> Tümünü Temizle
            </Button>
          )}
        </div>

        {/* Favorites Grid */}
        {favoriteAuctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Henüz Favori Yok</h3>
            <p className="text-slate-500 max-w-md mb-6">
              İlanları inceleyin ve beğendiklerinizi favorilere ekleyin. Favorileriniz burada listelenecek.
            </p>
            <Button
              onClick={() => {
                navigate("/");
                setTimeout(() => document.getElementById("auctions")?.scrollIntoView({ behavior: "smooth" }), 150);
              }}
              className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-semibold px-6"
            >
              İhaleleri Keşfet
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteAuctions.map((auction) => (
              <Card
                key={auction.id}
                className="group bg-slate-900/50 border-slate-200/80 overflow-hidden hover:border-pink-500/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/5"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={auction.images[0]}
                    alt={auction.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {auction.status === "live" && (
                      <span className="px-2.5 py-1 rounded-lg bg-red-500/90 text-white text-xs font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Canlı
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                        auction.investmentScore >= 85
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : auction.investmentScore >= 70
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                      }`}
                    >
                      <Star className="w-3 h-3" /> {auction.investmentScore}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <ShareButton title={auction.title} url={`/ilan/${auction.id}`} />
                    <button
                      onClick={() => removeFavorite(auction.id)}
                      aria-label={`Favoriden kaldır: ${auction.title}`}
                      className="p-2.5 rounded-xl bg-pink-500 text-white hover:bg-pink-600 transition-colors"
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/ilan/${auction.id}`);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    className="text-base font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    {auction.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {auction.location}
                  </div>

                  <div className="flex items-center gap-2 mb-3 mt-3 p-2.5 rounded-lg bg-white/[0.03] border border-slate-200/80">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">AI Değerleme</span>
                        <span className="text-blue-400 font-semibold">
                          ₺{(auction.aiPredictedPrice / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400"
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
                      <div className="text-lg font-bold text-blue-400">
                        ₺{auction.currentBid.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-xs text-slate-600">
                        ₺{auction.pricePerSqm.toLocaleString("tr-TR")}/m²
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/ilan/${auction.id}`)}
                      className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-semibold text-xs h-9 px-4"
                    >
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
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
