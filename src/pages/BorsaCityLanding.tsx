import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, TrendingDown, TrendingUp, Minus, Activity,
  Home, Gavel, Building2, ChevronRight, AlertCircle, Sparkles, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { LoadingState } from "@/components/async/LoadingState";
import { findProvince, slugifyTr } from "@/lib/seo/programmaticSeo";
import { useRegionPriceIndex } from "@/hooks/useRegionPriceIndex";
import { loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import type { Auction } from "@/types/auction";
import { getCityByKey, type CityKey, CITY_OPTIONS } from "@/lib/valuation/regionalPriceData";
import { cn } from "@/lib/utils";

function formatTRY(v: number): string {
  if (v >= 1_000_000) return `₺${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₺${(v / 1_000).toFixed(0)}K`;
  return `₺${v.toLocaleString("tr-TR")}`;
}

// 6 aylık endeks trend simülasyonu — canlı endeks + monthly variance ile.
// Master onayı sonrası gerçek price_index history (zaman serisi) eklenir;
// şimdilik canlı endeks + sin/cos ile yumuşak salınım.
function simulateTrend(latestIndex: number, monthlyChangePct: number, months = 6): number[] {
  const out: number[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const variance = Math.sin((i + 1) * 0.7) * (Math.abs(monthlyChangePct) * 0.4);
    const monthsBefore = i;
    const value = latestIndex / (1 + (monthlyChangePct / 100) * monthsBefore + variance / 100);
    out.push(Math.round(value));
  }
  return out;
}

export default function BorsaCityLanding() {
  const { il } = useParams<{ il: string }>();
  const navigate = useNavigate();
  const province = il ? findProvince(il) : undefined;
  const { data: index, loading: indexLoading } = useRegionPriceIndex(province?.name ?? "");
  const [catalog, setCatalog] = useState<Auction[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setCatalogLoading(true);
    void loadAllAuctionsForSearch()
      .then((rows) => {
        if (alive) setCatalog(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setCatalogLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Province slug → CityKey eşleme (regionalPriceData'da 10 ilin detayı var)
  const cityKey: CityKey | null = useMemo(() => {
    if (!province) return null;
    const slug = province.slug.toLowerCase();
    const match = CITY_OPTIONS.find((c) => c.value === slug);
    return match ? (match.value as CityKey) : null;
  }, [province]);
  const regional = cityKey ? getCityByKey(cityKey) : undefined;

  // O ile ait ilanlar
  const cityListings = useMemo(() => {
    if (!province) return [];
    return catalog.filter((a) => slugifyTr(a.city) === province.slug);
  }, [catalog, province]);

  // İlan tabanlı istatistik (catalog'tan hesap)
  const stats = useMemo(() => {
    if (cityListings.length === 0) {
      return { count: 0, liveAuctions: 0, avgPricePerSqm: 0, avgPrice: 0 };
    }
    const live = cityListings.filter((a) => a.status === "live").length;
    const sqms = cityListings.map((a) => a.pricePerSqm).filter((p) => p > 0);
    const prices = cityListings.map((a) => a.currentBid).filter((p) => p > 0);
    return {
      count: cityListings.length,
      liveAuctions: live,
      avgPricePerSqm: sqms.length > 0 ? Math.round(sqms.reduce((a, b) => a + b, 0) / sqms.length) : 0,
      avgPrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
    };
  }, [cityListings]);

  // İlçe seviyesi: catalog'tan o ilin ilçelerini grupla + regional data ile birleştir
  const districts = useMemo(() => {
    if (!province) return [];
    const map = new Map<string, { name: string; count: number; avgPricePerSqm: number; sumSqm: number }>();
    for (const a of cityListings) {
      const d = a.district || "Diğer";
      const prev = map.get(d) ?? { name: d, count: 0, avgPricePerSqm: 0, sumSqm: 0 };
      prev.count += 1;
      prev.sumSqm += a.pricePerSqm;
      map.set(d, prev);
    }
    const out = Array.from(map.values()).map((d) => ({
      name: d.name,
      count: d.count,
      avgPricePerSqm: Math.round(d.sumSqm / d.count),
      regionalSalePerM2: regional?.districts?.[d.name]?.salePerM2 ?? null,
      regionalRentPerM2: regional?.districts?.[d.name]?.rentPerM2 ?? null,
    }));
    // Regional data ilçeleri de ekle (catalog'da olmasa bile)
    if (regional?.districts) {
      for (const [name, prices] of Object.entries(regional.districts)) {
        if (!map.has(name)) {
          out.push({
            name,
            count: 0,
            avgPricePerSqm: 0,
            regionalSalePerM2: prices.salePerM2,
            regionalRentPerM2: prices.rentPerM2,
          });
        }
      }
    }
    return out.sort((a, b) => b.count - a.count || b.avgPricePerSqm - a.avgPricePerSqm).slice(0, 8);
  }, [cityListings, regional, province]);

  // Trend simülasyonu
  const trend = useMemo(() => {
    if (!index) return [];
    return simulateTrend(index.indexValue, index.changePct);
  }, [index]);
  const trendMax = trend.length > 0 ? Math.max(...trend) : 0;
  const trendMin = trend.length > 0 ? Math.min(...trend) : 0;

  if (!province) {
    return <Navigate to="/borsa" replace />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>

        <PageBreadcrumbs
          className="mb-4"
          items={[
            { label: "Ana sayfa", href: "/" },
            { label: "Borsa", href: "/borsa" },
            { label: `${province.name} endeksi` },
          ]}
        />

        {/* HERO */}
        <div className="mb-6 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/60 to-violet-500/5 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 mb-3">
                <MapPin className="h-3.5 w-3.5" /> Borsa şehir endeksi
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {province.name} Gayrimenkul Endeksi
              </h1>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                Canlı price_index verisi, bölge ortalama m² fiyatı, ilçe trendi ve {province.name}{" "}
                bölgesindeki güncel ilanlar.
              </p>
            </div>

            {/* Canlı endeks değeri */}
            <div className="text-right" data-testid="city-index">
              {indexLoading ? (
                <LoadingState compact label="Endeks…" />
              ) : index ? (
                <>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Endeks</div>
                  <div className="text-3xl md:text-4xl font-bold text-cyan-200">
                    {index.indexValue.toLocaleString("tr-TR")}
                  </div>
                  <div className={cn(
                    "inline-flex items-center gap-1 mt-1 text-sm font-semibold",
                    index.changePct > 0 ? "text-emerald-400" :
                    index.changePct < 0 ? "text-red-400" : "text-slate-400",
                  )}>
                    {index.changePct > 0 ? <TrendingUp className="w-4 h-4" /> :
                      index.changePct < 0 ? <TrendingDown className="w-4 h-4" /> :
                      <Minus className="w-4 h-4" />}
                    {index.changePct > 0 ? "+" : ""}{index.changePct.toFixed(2)}%
                  </div>
                  {index.indexDate ? (
                    <p className="text-[10px] text-slate-500 mt-1">Güncelleme: {index.indexDate}</p>
                  ) : null}
                </>
              ) : (
                <p className="text-xs text-slate-400 max-w-[200px]">
                  Bu bölge için canlı endeks bekleniyor. Aşağıdaki ilan-tabanlı istatistikler aktif.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 4 ÖZET KART */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-cyan-500/15 p-2.5">
                <Activity className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Ort. ₺/m² (ilanlardan)</p>
                <p className="text-xl font-bold text-white">
                  {stats.avgPricePerSqm > 0 ? `₺${stats.avgPricePerSqm.toLocaleString("tr-TR")}` : "—"}
                </p>
                {regional?.salePerM2 ? (
                  <p className="text-[10px] text-slate-500">Bölge baz: ₺{regional.salePerM2.toLocaleString("tr-TR")}/m²</p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/15 p-2.5">
                <Home className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Aktif ilan</p>
                <p className="text-xl font-bold text-white">{stats.count.toLocaleString("tr-TR")}</p>
                <p className="text-[10px] text-slate-500">{province.name} bölgesinde</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/15 p-2.5">
                <Gavel className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Canlı ihale</p>
                <p className="text-xl font-bold text-white">{stats.liveAuctions.toLocaleString("tr-TR")}</p>
                <p className="text-[10px] text-slate-500">devam eden</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-violet-500/15 p-2.5">
                <Building2 className="w-5 h-5 text-violet-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Ort. ilan fiyatı</p>
                <p className="text-xl font-bold text-white">
                  {stats.avgPrice > 0 ? formatTRY(stats.avgPrice) : "—"}
                </p>
                <p className="text-[10px] text-slate-500">geçerli teklif/listing</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2 SÜTUN: Trend grafik + İlçe tablo */}
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          {/* Trend grafik (CSS bar) */}
          <Card className="bg-slate-900/50 border-slate-200/80" data-testid="trend-chart">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-300" /> 6 Aylık Endeks Trendi
                </h3>
                <span className="text-[10px] text-slate-500">Aylık değer</span>
              </div>
              {trend.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">Canlı endeks bekleniyor — grafik hazırlanıyor.</p>
              ) : (
                <>
                  <div className="flex items-end justify-between gap-2 h-32 mb-2">
                    {trend.map((v, i) => {
                      const range = Math.max(1, trendMax - trendMin);
                      const pct = ((v - trendMin) / range) * 0.85 + 0.15; // min 15% yükseklik
                      const isLatest = i === trend.length - 1;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={cn(
                              "w-full rounded-t transition-all",
                              isLatest ? "bg-gradient-to-t from-cyan-500 to-emerald-300" : "bg-slate-700",
                            )}
                            style={{ height: `${pct * 100}%` }}
                            title={`${v.toLocaleString("tr-TR")} endeks`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    {[5, 4, 3, 2, 1, 0].map((m, i) => (
                      <span key={m} className={i === 5 ? "text-emerald-400 font-semibold" : ""}>
                        {m === 0 ? "Şu an" : `${m}ay önce`}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] text-slate-500 italic leading-relaxed">
                    * Grafik canlı endeks + aylık değişim oranıyla simüle. Tam zaman serisi backend
                    history kayıtları aktifleştiğinde gerçek veri gösterir.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* İlçe tablo */}
          <Card className="bg-slate-900/50 border-slate-200/80" data-testid="district-table">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-amber-300" /> İlçe Bazlı Veri
              </h3>
              {districts.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  Bu il için ilçe verisi yok. Bölge ortalamasıyla devam edin.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {districts.map((d) => (
                    <div
                      key={d.name}
                      className="rounded-lg border border-slate-700/40 bg-slate-950/40 p-2.5 flex items-center justify-between gap-2 hover:border-cyan-400/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{d.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {d.count > 0 ? `${d.count} ilan` : "İlan yok"}
                          {d.regionalSalePerM2 ? ` · Bölge baz ₺${d.regionalSalePerM2.toLocaleString("tr-TR")}/m²` : ""}
                        </p>
                      </div>
                      {d.avgPricePerSqm > 0 ? (
                        <div className="text-right">
                          <p className="text-xs text-cyan-300 font-semibold">₺{d.avgPricePerSqm.toLocaleString("tr-TR")}</p>
                          <p className="text-[10px] text-slate-500">ort. ₺/m²</p>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
              {!regional ? (
                <p className="mt-3 text-[10px] text-slate-500 italic leading-relaxed flex items-start gap-1.5">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  Bu il için detaylı ilçe baz fiyat verisi mevcut değil; ilan ortalamasından üretildi.
                  10 büyük il (İstanbul, Ankara, İzmir, Bursa, Antalya, vs.) için ilçe baz fiyat ek olarak gösterilir.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* AKSIYON ŞERIDI */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 gap-2">
            <Link to={`/arama?city=${province.name}`}>
              <Home className="w-4 h-4" /> {province.name}'de Tüm İlanlar
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15 gap-2">
            <Link to={`/harita?city=${province.name}`}>
              <MapPin className="w-4 h-4" /> Haritada Gör
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to={`/satilik/${province.slug}`}>Satılık SEO</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to={`/kiralik/${province.slug}`}>Kiralık SEO</Link>
          </Button>
        </div>

        {/* İLAN GRİDİ */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" /> {province.name}'de Öne Çıkan İlanlar
            </h2>
            {cityListings.length > 0 ? (
              <span className="text-xs text-slate-500">{cityListings.length} ilan</span>
            ) : null}
          </div>
          {catalogLoading ? (
            <LoadingState label="İlanlar yükleniyor…" />
          ) : cityListings.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-200/80">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-slate-400 mb-4">
                  Bu il için listelenen ilan bulunamadı. {province.name} dışındaki ilanlar için arama sayfasını ziyaret edin.
                </p>
                <Button asChild>
                  <Link to="/arama">Tüm İlanlar</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cityListings.slice(0, 9).map((a) => {
                const statusColor =
                  a.status === "live" ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/40" :
                  a.status === "upcoming" ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/40" :
                  "bg-slate-700/60 text-slate-300 border-slate-500/40";
                const statusLabel = a.status === "live" ? "Canlı" : a.status === "upcoming" ? "Yaklaşan" : "Bitti";
                return (
                  <Link
                    key={a.id}
                    to={`/ilan/${a.id}`}
                    className="group rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden hover:border-cyan-400/40 transition-colors"
                  >
                    <div className="relative aspect-[16/10] bg-slate-800 overflow-hidden">
                      <img
                        loading="lazy"
                        src={a.images[0]}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      <span className={cn("absolute top-2 right-2 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold", statusColor)}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{a.district}, {a.city}</span>
                      </div>
                      <h3 className="font-semibold text-white text-sm line-clamp-2 leading-snug">{a.title}</h3>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-bold text-blue-400">{formatTRY(a.currentBid)}</span>
                        {a.propertyDetails?.grossSqm ? (
                          <span className="text-[10px] text-slate-500">{a.propertyDetails.grossSqm} m²</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          {cityListings.length > 9 ? (
            <div className="mt-4 text-center">
              <Button asChild variant="outline" className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10">
                <Link to={`/arama?city=${province.name}`}>
                  Tümünü gör ({cityListings.length}) <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          ) : null}
        </section>

        {/* DİĞER ŞEHİRLERE GEÇİŞ */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">Diğer Büyük Şehirler</h3>
          <div className="flex flex-wrap gap-2">
            {CITY_OPTIONS.filter((c) => c.value !== cityKey).slice(0, 9).map((c) => (
              <Link
                key={c.value}
                to={`/borsa/sehir/${c.value}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-950/40 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-400/40 hover:text-cyan-200 transition-colors"
              >
                <MapPin className="w-3 h-3" /> {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
