import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, TrendingUp, Target, MapPin, Wallet, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { useFavorites } from "@/hooks/useFavorites";
import { loadAllAuctionsForSearch, getLocalAndStaticAuctions } from "@/lib/auctionsSource";
import { withListingDefaults } from "@/lib/listingPolicy";
import { LoadingState } from "@/components/async";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLocale } from "@/contexts/LocaleContext";
import type { Auction } from "@/types/auction";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartPanel,
  DashboardShell,
  EmptyState,
  MetricCard,
  CHART_COLORS,
  chartAxisFontSize,
  chartAxisStroke,
  chartGridStroke,
  chartTooltipStyle,
} from "@/components/enterprise";

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const iv = t.investorDashboard;
  const { ref, isVisible } = useScrollAnimation(0.05);
  const { favorites, loading: favLoading, syncError } = useFavorites();
  const [catalog, setCatalog] = useState<Auction[]>(() => getLocalAndStaticAuctions());
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let ok = true;
    setCatalogLoading(true);
    void loadAllAuctionsForSearch()
      .then((rows) => {
        if (ok) setCatalog(rows);
      })
      .catch(() => {
        if (ok) setCatalog(getLocalAndStaticAuctions());
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

  const isLoading = favLoading || catalogLoading;

  const portfolioValue = favoriteAuctions.reduce((sum, a) => sum + a.currentBid, 0);
  const predictedValue = favoriteAuctions.reduce((sum, a) => sum + a.aiPredictedPrice, 0);
  const avgYield =
    favoriteAuctions.length > 0
      ? favoriteAuctions.reduce((sum, a) => sum + a.areaStats.rentalYield, 0) / favoriteAuctions.length
      : 0;
  const potentialGain = predictedValue - portfolioValue;
  const potentialGainPercent = portfolioValue > 0 ? ((potentialGain / portfolioValue) * 100).toFixed(1) : "0";

  const yieldData = useMemo(
    () => favoriteAuctions.map((a) => ({ name: a.district, yield: a.areaStats.rentalYield, score: a.investmentScore })),
    [favoriteAuctions],
  );

  const pieData = useMemo(() => {
    const typeMap = new Map<string, number>();
    favoriteAuctions.forEach((a) => {
      typeMap.set(a.category, (typeMap.get(a.category) || 0) + a.currentBid);
    });
    return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value: Math.round(value / 1000000) }));
  }, [favoriteAuctions]);

  const priceHistory = useMemo(() => {
    if (favoriteAuctions.length === 0) return [];
    const months = iv.months;
    return months.map((m, i) => {
      const base = portfolioValue;
      const growth = base * (0.015 * (i + 1));
      return { month: m, value: Math.round((base + growth) / 1000000) };
    });
  }, [portfolioValue, favoriteAuctions.length, iv.months]);

  return (
    <div ref={ref}>
      <DashboardShell
        badge={iv.badge}
        title={iv.title}
        subtitle={iv.subtitle}
        back={
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2 text-slate-400">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {iv.back}
          </Button>
        }
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/analiz")} className="gap-2">
            <LayoutDashboard className="w-4 h-4" /> {iv.marketAnalysis}
          </Button>
        }
      >
        {syncError ? (
          <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{syncError}</p>
        ) : null}
        {isLoading ? (
          <LoadingState label={iv.loading} />
        ) : favoriteAuctions.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={iv.emptyTitle}
            description={iv.emptyDesc}
            action={
              <Button onClick={() => navigate("/ilanlar")} className="btn-primary">
                {iv.emptyCta}
              </Button>
            }
          />
        ) : (
          <div
            className={`space-y-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricCard
                label={iv.kpiPortfolioValue}
                value={`₺${(portfolioValue / 1_000_000).toFixed(1)}M`}
                hint={`${favoriteAuctions.length} ${iv.kpiListingsHint}`}
                icon={Wallet}
              />
              <MetricCard
                label={iv.kpiPredictedValue}
                value={`₺${(predictedValue / 1_000_000).toFixed(1)}M`}
                trend={{ value: `+${potentialGainPercent}% AI`, positive: true }}
                icon={Target}
              />
              <MetricCard
                label={iv.kpiAvgYield}
                value={`%${avgYield.toFixed(1)}`}
                hint={iv.kpiAvgYieldHint}
                icon={Percent}
              />
              <MetricCard
                label={iv.kpiPotential}
                value={`₺${(potentialGain / 1_000_000).toFixed(1)}M`}
                hint={iv.kpiPotentialHint}
                icon={TrendingUp}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <ChartPanel title={iv.chartGrowthTitle} subtitle={iv.chartGrowthSubtitle} className="lg:col-span-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistory}>
                    <defs>
                      <linearGradient id="invArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--lux-blue-500)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--lux-blue-500)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                    <XAxis dataKey="month" stroke={chartAxisStroke} fontSize={chartAxisFontSize} />
                    <YAxis stroke={chartAxisStroke} fontSize={chartAxisFontSize} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area type="monotone" dataKey="value" stroke="var(--lux-blue-500)" fill="url(#invArea)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartPanel>
              <ChartPanel title={iv.chartCategoryTitle} subtitle={iv.chartCategorySubtitle}>
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </RePieChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>

            <ChartPanel title={iv.chartYieldTitle} subtitle={iv.chartYieldSubtitle} tall>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yieldData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                  <XAxis dataKey="name" stroke={chartAxisStroke} fontSize={10} />
                  <YAxis stroke={chartAxisStroke} fontSize={chartAxisFontSize} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="yield" name={iv.barRentPct} fill="var(--lux-trust-green)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="score" name={iv.barAiScore} fill="var(--lux-blue-500)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <section>
              <h2 className="mb-4 text-lg font-bold text-white">{iv.portfolioListings}</h2>
              <div className="space-y-3">
                {favoriteAuctions.map((auction) => {
                  const upside = auction.aiPredictedPrice - auction.currentBid;
                  const upsidePercent = ((upside / auction.currentBid) * 100).toFixed(1);
                  return (
                    <div
                      key={auction.id}
                      className="card-luxury cursor-pointer !p-0 transition-all hover:border-blue-400/30"
                      onClick={() => navigate(`/ilan/${auction.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && navigate(`/ilan/${auction.id}`)}
                    >
                      <div className="flex flex-col gap-4 p-4 sm:flex-row">
                        <img
                          loading="lazy"
                          src={auction.images[0]}
                          alt={auction.title}
                          className="h-24 w-full shrink-0 rounded-xl object-cover sm:w-32"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-bold text-white">{auction.title}</h4>
                              <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                                {auction.location}
                              </div>
                            </div>
                            <Badge className={upside > 0 ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400" : "border-red-500/30 bg-red-500/15 text-red-400"}>
                              {upside > 0 ? "+" : ""}
                              {upsidePercent}%
                            </Badge>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2">
                              <div className="text-[10px] uppercase text-slate-500">{iv.cardCurrent}</div>
                              <div className="text-sm font-bold text-white" dir="ltr">₺{(auction.currentBid / 1_000_000).toFixed(1)}M</div>
                            </div>
                            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2">
                              <div className="text-[10px] uppercase text-slate-500">{iv.cardPredicted}</div>
                              <div className="text-sm font-bold text-emerald-400" dir="ltr">₺{(auction.aiPredictedPrice / 1_000_000).toFixed(1)}M</div>
                            </div>
                            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2">
                              <div className="text-[10px] uppercase text-slate-500">{iv.cardYield}</div>
                              <div className="text-sm font-bold text-blue-400" dir="ltr">%{auction.areaStats.rentalYield}</div>
                            </div>
                          </div>
                          <ListingDocumentFooter auction={auction} compact showTopRule={false} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </DashboardShell>
    </div>
  );
}
