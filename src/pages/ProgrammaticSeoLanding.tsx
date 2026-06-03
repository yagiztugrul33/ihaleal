import { useEffect, useMemo } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { ArrowRight, Building2, MapPin, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { LoadingState } from "@/components/async/LoadingState";
import { loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import { useRegionPriceIndex } from "@/hooks/useRegionPriceIndex";
import {
  buildRegionDescription,
  buildSeoDescription,
  buildSeoTitle,
  dealLabel,
  findProvince,
  PROPERTY_TYPE_LABELS,
  resolveProgrammaticRoute,
  slugifyTr,
  type ProgrammaticSeoRoute,
} from "@/lib/seo/programmaticSeo";
import { getShareUrlForPath } from "@/data/siteOrigin";
import { useState } from "react";
import type { Auction } from "@/types/auction";

function matchesRoute(auction: Auction, route: ProgrammaticSeoRoute): boolean {
  const cityOk = slugifyTr(auction.city) === route.provinceSlug;
  if (!cityOk) return false;

  const deal = route.deal === "kiralik" ? "rent" : "sale";
  const auctionDeal = auction.dealType ?? (auction.category === "Kiralık" ? "rent" : "sale");
  if (auctionDeal !== deal) return false;

  if (route.segmentKind === "district" && route.districtSlug) {
    if (slugifyTr(auction.district) !== route.districtSlug) return false;
  }

  if (route.segmentKind === "district-type" && route.districtSlug) {
    if (slugifyTr(auction.district) !== route.districtSlug) return false;
  }

  if ((route.segmentKind === "type" || route.segmentKind === "district-type") && route.propertyType) {
    const cat = slugifyTr(auction.category);
    const type = route.propertyType;
    if (type === "arsa" && !cat.includes("arsa")) return false;
    if (type === "villa" && !cat.includes("villa")) return false;
    if (type === "isyeri" && !/(ticari|is|ofis|dukkan)/.test(cat)) return false;
    if (type === "dukkan" && !/(dukkan|magaza)/.test(cat)) return false;
    if (type === "daire" && !/(daire|konut|rezidans)/.test(cat)) return false;
    if (type === "konut" && !/(konut|daire|rezidans|mustakil)/.test(cat)) return false;
  }

  return true;
}

export default function ProgrammaticSeoLanding() {
  const { il, segment, tip } = useParams<{ il: string; segment?: string; tip?: string }>();
  const { pathname } = useLocation();
  const deal = pathname.startsWith("/kiralik") ? "kiralik" : pathname.startsWith("/satilik") ? "satilik" : "";
  const route = useMemo(
    () => (deal && il ? resolveProgrammaticRoute(deal, il, segment, tip) : null),
    [deal, il, segment, tip],
  );
  const [catalog, setCatalog] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ok = true;
    setLoading(true);
    void loadAllAuctionsForSearch()
      .then((rows) => {
        if (ok) setCatalog(rows);
      })
      .finally(() => {
        if (ok) setLoading(false);
      });
    return () => {
      ok = false;
    };
  }, []);

  const listings = useMemo(() => {
    if (!route) return [];
    return catalog.filter((a) => matchesRoute(a, route)).slice(0, 24);
  }, [catalog, route]);

  const { data: priceIndex, loading: indexLoading } = useRegionPriceIndex(route?.provinceName ?? "");

  useEffect(() => {
    if (!route) return;
    document.title = buildSeoTitle(route);
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", buildSeoDescription(route));
    const json = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: buildSeoTitle(route),
      description: buildSeoDescription(route),
      url: getShareUrlForPath(route.path, ""),
    };
    const prev = document.getElementById("jsonld-programmatic-seo");
    prev?.remove();
    const script = document.createElement("script");
    script.id = "jsonld-programmatic-seo";
    script.type = "application/ld+json";
    script.text = JSON.stringify(json);
    document.head.appendChild(script);
    return () => document.getElementById("jsonld-programmatic-seo")?.remove();
  }, [route]);

  if (!route) return <Navigate to="/" replace />;

  const province = findProvince(route.provinceSlug);
  const siblingDistricts = province?.districts.slice(0, 8) ?? [];
  const dealText = dealLabel(route.deal);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 px-4">
      <div className="max-w-6xl mx-auto">
        <PageBreadcrumbs
          className="mb-6"
          jsonLdId={`prog-seo-${route.path}`}
          items={[
            { label: "Ana sayfa", href: "/" },
            { label: dealText, href: `/${route.deal}/${route.provinceSlug}` },
            ...(route.districtName ? [{ label: route.districtName }] : []),
            ...(route.propertyType ? [{ label: PROPERTY_TYPE_LABELS[route.propertyType] }] : []),
          ]}
        />

        <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900/90 to-slate-950 p-8 md:p-10">
          <Badge className="mb-3 border-teal-500/30 bg-teal-500/10 text-teal-300">{dealText}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {route.segmentKind === "district" && route.districtName
              ? `${route.districtName}, ${route.provinceName}`
              : route.segmentKind === "type" && route.propertyType
                ? `${route.provinceName} ${PROPERTY_TYPE_LABELS[route.propertyType]}`
                : route.provinceName}{" "}
            gayrimenkul ilanları
          </h1>
          <p className="text-slate-400 max-w-3xl leading-relaxed mb-4">{buildRegionDescription(route)}</p>

          <div className="flex flex-wrap gap-3 mb-4">
            {indexLoading ? (
              <LoadingState compact label="Endeks yükleniyor…" />
            ) : priceIndex ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                {priceIndex.changePct >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                Borsa endeksi ({priceIndex.regionCode}): {priceIndex.indexValue.toLocaleString("tr-TR")}
                <span className="font-semibold">
                  {priceIndex.changePct >= 0 ? "+" : ""}
                  {priceIndex.changePct.toFixed(1)}%
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-500">Bölge endeksi yakında güncellenecek.</span>
            )}
            <span className="text-xs text-slate-500 self-center">{listings.length} eşleşen ilan</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-gradient-to-r from-blue-500 to-teal-400 text-white gap-2">
              <Link to={`/arama?q=${encodeURIComponent(route.provinceName)}`}>
                Aramada aç <ArrowRight className="rtl:rotate-180 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/15">
              <Link to="/ihaleler">Tüm ilanlar</Link>
            </Button>
          </div>
        </div>

        {siblingDistricts.length > 0 ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {siblingDistricts.map((d) => (
              <Link
                key={d.slug}
                to={`/${route.deal}/${route.provinceSlug}/${d.slug}`}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:border-teal-500 hover:text-teal-700"
              >
                {d.name}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
          <Building2 className="w-5 h-5 text-blue-500" />
          {dealText} — {route.provinceName}
          {route.districtName ? ` / ${route.districtName}` : ""}
        </div>

        {loading ? (
          <LoadingState label="İlanlar yükleniyor…" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.length === 0 ? (
              <p className="text-slate-500 text-sm col-span-full">
                Bu kriterde aktif ilan bulunamadı.{" "}
                <Link to="/ihaleler" className="text-teal-600 hover:underline">
                  Tüm ilanlara göz atın
                </Link>
                .
              </p>
            ) : (
              listings.map((a) => (
                <Card key={a.id} className="border-slate-200 bg-white overflow-hidden hover:border-teal-500/30 transition-colors">
                  <div className="h-36 overflow-hidden">
                    <img src={a.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" /> {a.district}, {a.city}
                    </p>
                    <h2 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2">{a.title}</h2>
                    <p className="text-lg font-bold text-blue-600">₺{a.currentBid.toLocaleString("tr-TR")}</p>
                    <Link to={`/ilan/${a.id}`} className="mt-2 inline-block text-xs text-teal-600 hover:underline font-medium">
                      İlan detayı →
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
