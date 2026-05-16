import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, TrendingUp, Target, MapPin, Wallet, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AUCTIONS } from "@/data/auctions";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { useFavorites } from "@/hooks/useFavorites";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

/** Favori portföy grafikleri (tur #4 öncesi `/dashboard` içeriği). */
export default function InvestorDashboard() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.05);
  const { favorites } = useFavorites();

  const favoriteAuctions = useMemo(() => AUCTIONS.filter((a) => favorites.includes(a.id)), [favorites]);

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
    [favoriteAuctions]
  );

  const pieData = useMemo(() => {
    const typeMap = new Map<string, number>();
    favoriteAuctions.forEach((a) => {
      typeMap.set(a.category, (typeMap.get(a.category) || 0) + a.currentBid);
    });
    return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value: Math.round(value / 1000000) }));
  }, [favoriteAuctions]);

  const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

  const priceHistory = useMemo(() => {
    if (favoriteAuctions.length === 0) return [];
    const months = ["Haz", "Tem", "Agu", "Eyl", "Eki", "Kas"];
    return months.map((m, i) => {
      const base = portfolioValue;
      const growth = base * (0.015 * (i + 1));
      return { month: m, value: Math.round((base + growth) / 1000000) };
    });
  }, [portfolioValue, favoriteAuctions.length]);

  return (
    <div ref={ref} className="min-h-screen pt-24 pb-16" data-demo="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2 mb-2">
            <ArrowLeft className="w-4 h-4" /> Panele dön
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-400" />
            Yatırımcı paneli
          </h1>
          <p className="mt-2 text-slate-400">Portföy takibi (demo veri).</p>
        </div>

        {favoriteAuctions.length === 0 ? (
          <div className="text-center py-20">
            <Wallet className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Portföyunuz boş</h3>
            <p className="mb-6 text-slate-400">İlanları inceleyip favorilere ekleyin.</p>
            <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white">
              İlan keşfet
            </Button>
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-700 delay-100 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <Card className="border-slate-200/80 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Portföy değeri</span>
                </div>
                <div className="text-2xl font-bold">₺{(portfolioValue / 1000000).toFixed(1)}M</div>
                <div className="text-xs mt-1">{favoriteAuctions.length} ilan</div>
              </Card>
              <Card className="border-slate-200/80 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm">Tahmini değer</span>
                </div>
                <div className="text-2xl font-bold text-emerald-400">₺{(predictedValue / 1000000).toFixed(1)}M</div>
                <div className="text-xs mt-1 text-emerald-400">+{potentialGainPercent}%</div>
              </Card>
              <Card className="border-slate-200/80 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-5 h-5 text-violet-400" />
                  <span className="text-sm">Ort. getiri</span>
                </div>
                <div className="text-2xl font-bold text-violet-400">%{avgYield.toFixed(1)}</div>
                <div className="text-xs mt-1">Yıllık kira</div>
              </Card>
              <Card className="border-slate-200/80 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <span className="text-sm">Potansiyel</span>
                </div>
                <div className="text-2xl font-bold text-amber-400">₺{(potentialGain / 1000000).toFixed(1)}M</div>
                <div className="text-xs mt-1">AI tahmini</div>
              </Card>
            </div>

            <div
              className={`grid lg:grid-cols-3 gap-6 mb-8 transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <Card className="lg:col-span-2 border-slate-200/80 p-5">
                <h3 className="text-lg font-bold mb-1">Portföy değer artışı</h3>
                <p className="text-xs mb-4 text-slate-500">Son 6 ay tahmini</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceHistory}>
                      <defs>
                        <linearGradient id="colorValueInv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                      <YAxis stroke="#71717a" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#colorValueInv)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="border-slate-200/80 p-5">
                <h3 className="text-lg font-bold mb-4">Dağılım</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <Card className={`border-slate-200/80 p-5 mb-8 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h3 className="text-lg font-bold mb-4">Getiri ve skor</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="yield" name="Kira getirisi (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="score" name="AI skor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className={`transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h3 className="text-xl font-bold mb-4">Portföy ilanları</h3>
              <div className="space-y-3">
                {favoriteAuctions.map((auction) => {
                  const upside = auction.aiPredictedPrice - auction.currentBid;
                  const upsidePercent = ((upside / auction.currentBid) * 100).toFixed(1);
                  return (
                    <Card
                      key={auction.id}
                      className="border-slate-200/80 hover:border-blue-500/20 transition-all cursor-pointer"
                      onClick={() => navigate(`/ilan/${auction.id}`)}
                    >
                      <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                        <img loading="lazy" src={auction.images[0]} alt="" className="w-full sm:w-32 h-24 object-cover rounded-xl flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-bold">{auction.title}</h4>
                              <div className="flex items-center gap-2 text-sm mt-1">
                                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                                <span>{auction.location}</span>
                              </div>
                            </div>
                            <Badge className={upside > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}>
                              {upside > 0 ? "+" : ""}
                              {upsidePercent}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mt-3">
                            <div className="p-2 rounded-lg bg-white/[0.03]">
                              <div className="text-xs">Mevcut</div>
                              <div className="text-sm font-bold">₺{(auction.currentBid / 1000000).toFixed(1)}M</div>
                            </div>
                            <div className="p-2 rounded-lg bg-white/[0.03]">
                              <div className="text-xs">Tahmini</div>
                              <div className="text-sm font-bold text-emerald-400">₺{(auction.aiPredictedPrice / 1000000).toFixed(1)}M</div>
                            </div>
                            <div className="p-2 rounded-lg bg-white/[0.03]">
                              <div className="text-xs">Getiri</div>
                              <div className="text-sm font-bold text-violet-400">%{auction.areaStats.rentalYield}</div>
                            </div>
                          </div>
                          <ListingDocumentFooter auction={auction} compact showTopRule={false} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
