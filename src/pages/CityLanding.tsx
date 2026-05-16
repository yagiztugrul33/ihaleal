import { useEffect, useMemo } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { MapPin, TrendingUp, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { landingConfigByPath } from "@/data/seoLandings";
import { DEMO_AUCTION_CATALOG } from "@/data/demoAuctionCatalog";
import { getShareUrlForPath } from "@/data/siteOrigin";

export default function CityLandingPage() {
  const { pathname } = useLocation();
  const cfg = landingConfigByPath(pathname);

  const auctions = useMemo(() => {
    if (!cfg) return [];
    return DEMO_AUCTION_CATALOG.filter((a) => a.city === cfg.cityTr).slice(0, 12);
  }, [cfg]);

  useEffect(() => {
    if (!cfg) return;
    const json = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: cfg.title.replace(/\s—.*$/, ""),
      description: cfg.description,
      url: getShareUrlForPath(pathname, ""),
    };
    const prev = document.getElementById("jsonld-city-landing");
    prev?.remove();
    const script = document.createElement("script");
    script.id = "jsonld-city-landing";
    script.type = "application/ld+json";
    script.text = JSON.stringify(json);
    document.head.appendChild(script);
    return () => document.getElementById("jsonld-city-landing")?.remove();
  }, [cfg, pathname]);

  if (!cfg) {
    return <Navigate to="/__landing_not_configured__" replace />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 px-4">
      <div className="max-w-6xl mx-auto">
        <nav className="text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-teal-400">
            Ana sayfa
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">{cfg.cityTr} landing</span>
        </nav>

        <div className="mb-10 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-8 md:p-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {cfg.heroKeywords.map((k) => (
              <Badge key={k} variant="outline" className="border-teal-500/30 text-teal-300 bg-teal-500/10">
                {k}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{cfg.cityTr} gayrimenkul ihaleleri ve ilanlar</h1>
          <p className="text-slate-400 max-w-3xl leading-relaxed mb-6">{cfg.description}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-gradient-to-r from-blue-500 to-teal-400 text-white gap-2">
              <Link to="/ihaleler">
                Tüm ihalelere git <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/15">
              <Link to={`/sehir/${cfg.analyticsKey}`}>Şehir rehberi</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/15">
              <Link to="/analiz">AI bölge analizi</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-white font-semibold">
          <Building2 className="w-5 h-5 text-blue-400" />
          {cfg.cityTr} — örnek aktif ilanlar (demo katalog)
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.length === 0 ? (
            <p className="text-slate-500 text-sm col-span-full">Bu şehir için demo kayıt bulunamadı; katalog güncellenince düşer.</p>
          ) : (
            auctions.map((a) => (
              <Card key={a.id} className="border-slate-200 bg-slate-900/45 overflow-hidden hover:border-teal-500/25 transition-colors">
                <div className="h-36 overflow-hidden">
                  <img src={a.images[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" /> {a.district}
                  </p>
                  <h2 className="text-sm font-semibold text-white line-clamp-2 mb-2">{a.title}</h2>
                  <p className="text-lg font-bold text-blue-400">₺{a.currentBid.toLocaleString("tr-TR")}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" /> Skor {a.investmentScore}
                    </span>
                    <Link to={`/ilan/${a.id}`} className="text-teal-400 hover:underline font-medium">
                      İhaleye git →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <p className="mt-10 text-xs text-slate-600 max-w-3xl leading-relaxed">
          ihaleal.com, <strong className="text-slate-400">İhaleal Endeksi</strong> ile ihale akışına bağlı çoklu sinyalli analiz vizyonunu benimser; yıllık üyelik ve komisyon mahsup modeli için{" "}
          <Link to="/komisyon-modeli" className="text-teal-500 hover:underline">
            iş modeli
          </Link>{" "}
          sayfasına bakınız.
        </p>
      </div>
    </div>
  );
}
