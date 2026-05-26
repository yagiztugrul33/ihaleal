import { useEffect, useMemo } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { MapPin, TrendingUp, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { landingConfigByPath } from "@/data/seoLandings";
import { DEMO_AUCTION_CATALOG } from "@/data/demoAuctionCatalog";
import { getShareUrlForPath } from "@/data/siteOrigin";
import {
  buildLocationInputFromProfile,
  calculateCompositeLocationScore,
  type DemoLocationKey,
} from "@/lib/location/locationIntelligenceEngine";

const CITY_PROFILE_KEY: Record<string, DemoLocationKey> = {
  Istanbul: "istanbul-kadikoy",
  Ankara: "ankara-cankaya",
  Izmir: "izmir-karsiyaka",
  Antalya: "antalya-muratpasa",
  Bursa: "ankara-cankaya",
};

const CITY_KFE: Record<string, { nominal: number; reel: number }> = {
  Istanbul: { nominal: 26.6, reel: -4.3 },
  Ankara: { nominal: 36.7, reel: 3.1 },
  Izmir: { nominal: 29.8, reel: -1.2 },
  Antalya: { nominal: 31.4, reel: 0.2 },
  Bursa: { nominal: 24.1, reel: -6.0 },
};

export default function CityLandingPage() {
  const { pathname } = useLocation();
  const cfg = landingConfigByPath(pathname);

  const auctions = useMemo(() => {
    if (!cfg) return [];
    return DEMO_AUCTION_CATALOG.filter((a) => a.city === cfg.cityTr).slice(0, 12);
  }, [cfg]);
  const locationScore = useMemo(() => {
    if (!cfg) return null;
    const key = CITY_PROFILE_KEY[cfg.analyticsKey] ?? "istanbul-kadikoy";
    return calculateCompositeLocationScore(
      buildLocationInputFromProfile(key, {
        city: cfg.cityTr,
      }),
    );
  }, [cfg]);
  const kfe = cfg ? CITY_KFE[cfg.analyticsKey] : null;

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
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 px-4">
      <div className="max-w-6xl mx-auto">
        <nav className="mb-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-teal-400">
            Ana sayfa
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">{cfg.cityTr} landing</span>
        </nav>

        <div className="mb-10 rounded-3xl border border-border bg-gradient-to-br from-card to-secondary p-8 md:p-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {cfg.heroKeywords.map((k) => (
              <Badge key={k} variant="outline" className="border-teal-500/30 text-teal-300 bg-teal-500/10">
                {k}
              </Badge>
            ))}
          </div>
          <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">{cfg.cityTr} gayrimenkul ihaleleri ve ilanlar</h1>
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

        <div className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <Building2 className="w-5 h-5 text-blue-400" />
          {cfg.cityTr} — örnek aktif ilanlar (demo katalog)
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-cyan-200">Bölge zeka skoru</p>
            <p className="mt-1 text-xl font-bold text-white">{locationScore?.locationScore ?? 0}/100</p>
          </article>
          <article className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-200">Yaşanabilirlik</p>
            <p className="mt-1 text-xl font-bold text-white">{locationScore?.livabilityScore ?? 0}/100</p>
          </article>
          <article className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-amber-200">Yatırım skoru</p>
            <p className="mt-1 text-xl font-bold text-white">{locationScore?.investmentScore ?? 0}/100</p>
          </article>
        </div>
        <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
          KFE bölgesel ön okuma: nominal <strong className="text-slate-100">+%{(kfe?.nominal ?? 26.6).toFixed(1)}</strong> · reel{" "}
          <strong className="text-slate-100">%{(kfe?.reel ?? -4.3).toFixed(1)}</strong>. Resmi karar için kurum verisiyle teyit gerekir.
        </div>
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(locationScore?.contributions ?? []).map((item) => (
            <article key={item.key} className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs">
              <p className="uppercase tracking-[0.12em] text-slate-300">{item.label}</p>
              <p className="mt-1 text-lg font-bold text-cyan-200">{item.score}/100</p>
              <p className="text-slate-400">Ağırlık %{item.weightPct}</p>
            </article>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.length === 0 ? (
            <p className="col-span-full text-sm text-muted-foreground">Bu şehir için demo kayıt bulunamadı; katalog güncellenince düşer.</p>
          ) : (
            auctions.map((a) => (
              <Card key={a.id} className="overflow-hidden border-border bg-card transition-colors hover:border-teal-500/25">
                <div className="h-36 overflow-hidden">
                  <img
                    src={a.images[0]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={640}
                    height={360}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {a.district}
                  </p>
                  <h2 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground">{a.title}</h2>
                  <p className="text-lg font-bold text-blue-400">₺{a.currentBid.toLocaleString("tr-TR")}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
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

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
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
