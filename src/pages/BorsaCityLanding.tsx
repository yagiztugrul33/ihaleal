import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { LoadingState } from "@/components/async/LoadingState";
import { findProvince } from "@/lib/seo/programmaticSeo";
import { useRegionPriceIndex } from "@/hooks/useRegionPriceIndex";
import { loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import { useEffect, useState } from "react";
import type { Auction } from "@/types/auction";
import { slugifyTr } from "@/lib/seo/programmaticSeo";

export default function BorsaCityLanding() {
  const { il } = useParams<{ il: string }>();
  const province = il ? findProvince(il) : undefined;
  const { data: index, loading: indexLoading } = useRegionPriceIndex(province?.name ?? "");
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

  const cityListings = useMemo(() => {
    if (!province) return [];
    return catalog.filter((a) => slugifyTr(a.city) === province.slug).slice(0, 12);
  }, [catalog, province]);

  if (!province) {
    return <Navigate to="/borsa" replace />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <PageBreadcrumbs
          className="mb-4"
          items={[
            { label: "Ana sayfa", href: "/" },
            { label: "Borsa", href: "/borsa" },
            { label: `${province.name} endeksi` },
          ]}
        />

        <h1 className="text-2xl font-bold text-white md:text-3xl">
          {province.name} gayrimenkul fiyat endeksi
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Canlı price_index verisi ve {province.name} bölgesindeki güncel ilanlar.
        </p>

        <Card className="mt-6 border-white/10 bg-slate-900/50">
          <CardContent className="p-5">
            {indexLoading ? (
              <LoadingState compact label="Endeks yükleniyor…" />
            ) : index ? (
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Endeks değeri</p>
                  <p className="text-3xl font-bold text-white">{index.indexValue.toLocaleString("tr-TR")}</p>
                </div>
                <div className="flex items-center gap-2">
                  {index.changePct >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  )}
                  <span className={index.changePct >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {index.changePct >= 0 ? "+" : ""}
                    {index.changePct.toFixed(2)}%
                  </span>
                </div>
                {index.indexDate ? (
                  <p className="text-xs text-slate-500">Güncelleme: {index.indexDate}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Bu bölge için henüz endeks kaydı yok.</p>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="outline" className="border-white/15">
            <Link to={`/satilik/${province.slug}`}>Satılık ilanlar</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to={`/kiralik/${province.slug}`}>Kiralık ilanlar</Link>
          </Button>
        </div>

        <h2 className="mt-10 text-lg font-semibold text-white">Öne çıkan ilanlar</h2>
        {loading ? (
          <LoadingState className="mt-4" label="İlanlar yükleniyor…" />
        ) : cityListings.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Bu il için henüz listelenen ilan yok.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {cityListings.map((a) => (
              <li key={a.id}>
                <Link
                  to={`/ilan/${a.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm hover:border-blue-500/30"
                >
                  <span className="text-white line-clamp-1">{a.title}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
