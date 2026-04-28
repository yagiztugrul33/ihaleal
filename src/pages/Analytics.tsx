import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, TrendingUp, MapPin, Home, Star, Search,
  Building2, BarChart3, Activity, Layers, CalendarDays,
  Users, Wallet, Percent, Lightbulb, AreaChart, Calculator,
  Target, ArrowUpRight, ArrowDownRight, Minus, Clock,
  TrendingDown, CircleDollarSign, PieChart, LineChart as LineChartIcon,
  Filter, Download, ChevronUp, ChevronDown, ShieldCheck,
  AlertTriangle, Info, Gauge, MousePointerClick
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { AUCTIONS } from "@/data/auctions";
import { ListingLinkDemo } from "@/components/ListingLinkDemo";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, LineChart, Line, AreaChart as ReAreaChart,
  Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend,
  ComposedChart, Cell, PieChart as RePieChart, Pie
} from "recharts";

const CITIES = ["Istanbul", "Ankara", "Izmir", "Antalya", "Bursa", "Mugla"];

const CITY_DATA: Record<string, {
  pricePerSqm: number; avgValue: number; amortization: number; yield: number;
  annualChange: number; monthlyChange: number; totalChange: number;
  avgArea: number; marketingDays: number; avgAge: number;
  stock: number; stockChange: number;
  population: number; medianAge: number; incomePerCapita: number;
  nextYearPrediction: number; twoYearPrediction: number;
  investmentScore: { buySell: number; buyRent: number; buyLive: number; avg: number };
  marketCycle: "buyer" | "seller" | "neutral";
  pricePerSqmHist: number[];
}> = {
  "Istanbul": {
    pricePerSqm: 85200, avgValue: 12850000, amortization: 14, yield: 5.8, annualChange: 22.4, monthlyChange: 1.8, totalChange: 156,
    avgArea: 118, marketingDays: 42, avgAge: 18, stock: 285420, stockChange: -12,
    population: 15560000, medianAge: 34.2, incomePerCapita: 485000,
    nextYearPrediction: 18.5, twoYearPrediction: 38.2,
    investmentScore: { buySell: 32, buyRent: 41, buyLive: 33, avg: 35 },
    marketCycle: "seller",
    pricePerSqmHist: [68000,69500,71000,72500,74200,76000,78000,80200,81800,83200,84500,85200]
  },
  "Ankara": {
    pricePerSqm: 38500, avgValue: 5200000, amortization: 16, yield: 5.5, annualChange: 12.8, monthlyChange: 1.0, totalChange: 98,
    avgArea: 132, marketingDays: 38, avgAge: 15, stock: 87420, stockChange: -8,
    population: 5747000, medianAge: 33.8, incomePerCapita: 425000,
    nextYearPrediction: 11.2, twoYearPrediction: 24.5,
    investmentScore: { buySell: 38, buyRent: 37, buyLive: 38, avg: 38 },
    marketCycle: "neutral",
    pricePerSqmHist: [32000,32300,32600,33000,33500,34000,34600,35200,35800,36400,37400,38500]
  },
  "Izmir": {
    pricePerSqm: 62500, avgValue: 8950000, amortization: 15, yield: 6.2, annualChange: 18.6, monthlyChange: 1.5, totalChange: 134,
    avgArea: 125, marketingDays: 35, avgAge: 16, stock: 124680, stockChange: -10,
    population: 4464000, medianAge: 34.8, incomePerCapita: 465000,
    nextYearPrediction: 15.8, twoYearPrediction: 33.4,
    investmentScore: { buySell: 35, buyRent: 42, buyLive: 35, avg: 37 },
    marketCycle: "seller",
    pricePerSqmHist: [51000,52200,53500,54800,56200,57800,59500,61200,62800,64200,65500,62500]
  },
  "Antalya": {
    pricePerSqm: 48000, avgValue: 7200000, amortization: 12, yield: 7.5, annualChange: 24.2, monthlyChange: 1.9, totalChange: 168,
    avgArea: 110, marketingDays: 28, avgAge: 8, stock: 98500, stockChange: -6,
    population: 2691000, medianAge: 36.5, incomePerCapita: 380000,
    nextYearPrediction: 20.4, twoYearPrediction: 42.6,
    investmentScore: { buySell: 28, buyRent: 38, buyLive: 25, avg: 30 },
    marketCycle: "seller",
    pricePerSqmHist: [37000,38000,39200,40500,42000,43800,45600,47500,49200,51000,52800,48000]
  },
  "Bursa": {
    pricePerSqm: 32000, avgValue: 4500000, amortization: 17, yield: 5.0, annualChange: 11.5, monthlyChange: 0.9, totalChange: 85,
    avgArea: 135, marketingDays: 45, avgAge: 14, stock: 56200, stockChange: -5,
    population: 3166000, medianAge: 33.2, incomePerCapita: 395000,
    nextYearPrediction: 10.1, twoYearPrediction: 21.8,
    investmentScore: { buySell: 42, buyRent: 36, buyLive: 40, avg: 39 },
    marketCycle: "buyer",
    pricePerSqmHist: [27500,27800,28100,28500,29000,29600,30200,30800,31200,31600,31800,32000]
  },
  "Mugla": {
    pricePerSqm: 78000, avgValue: 14200000, amortization: 11, yield: 8.2, annualChange: 28.5, monthlyChange: 2.2, totalChange: 195,
    avgArea: 105, marketingDays: 22, avgAge: 6, stock: 42500, stockChange: -3,
    population: 1047000, medianAge: 38.2, incomePerCapita: 420000,
    nextYearPrediction: 24.8, twoYearPrediction: 51.2,
    investmentScore: { buySell: 22, buyRent: 30, buyLive: 18, avg: 23 },
    marketCycle: "seller",
    pricePerSqmHist: [58000,59500,61200,63000,65000,67200,69500,72000,74200,76200,78000,78000]
  }
};

const MONTHS = ["Oca", "Sub", "Mar", "Nis", "May", "Haz", "Tem", "Agu", "Eyl", "Eki", "Kas", "Ara"];

// Generate prediction data
const generatePrediction = (city: string) => {
  const d = CITY_DATA[city];
  const lastPrice = d.pricePerSqmHist[d.pricePerSqmHist.length - 1];
  const monthlyGrowth = d.nextYearPrediction / 12 / 100;
  const data = [];
  let current = lastPrice;
  for (let i = 0; i < 12; i++) {
    current = current * (1 + monthlyGrowth);
    data.push({
      month: MONTHS[i],
      predicted: Math.round(current),
      lower: Math.round(current * 0.95),
      upper: Math.round(current * 1.05),
    });
  }
  return data;
};

// Pie chart data for market distribution
const marketDistData = [
  { name: "Konut", value: 45, color: "#3b82f6" },
  { name: "Ticari", value: 25, color: "#10b981" },
  { name: "Arsa", value: 20, color: "#f59e0b" },
  { name: "Villa", value: 10, color: "#ec4899" },
];

export default function Analytics() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [analysisType, setAnalysisType] = useState("unitPrice");
  const [sortBy, setSortBy] = useState("score");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Yield simulator state
  const [propertyValue, setPropertyValue] = useState(5000000);
  const [monthlyRent, setMonthlyRent] = useState(20000);
  const [expenses, setExpenses] = useState(15);

  const cities = useMemo(() => [...new Set(AUCTIONS.map((a) => a.city))], []);
  const filtered = useMemo(() => {
    let data = AUCTIONS.filter((a) => {
      if (selectedCity !== "all" && a.city !== selectedCity) return false;
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    return data.sort((a, b) => {
      if (sortBy === "score") return b.investmentScore - a.investmentScore;
      if (sortBy === "price") return a.pricePerSqm - b.pricePerSqm;
      if (sortBy === "yield") return b.areaStats.rentalYield - a.areaStats.rentalYield;
      return 0;
    });
  }, [selectedCity, search, sortBy]);

  const barData = filtered.slice(0, 6).map((a) => ({ name: a.district, score: a.investmentScore, price: a.pricePerSqm, yield: a.areaStats.rentalYield }));
  const scatterData = filtered.map((a) => ({ x: a.pricePerSqm, y: a.areaStats.rentalYield, z: a.investmentScore, name: a.district }));
  const radarData = CITIES.map((city) => {
    const d = CITY_DATA[city];
    return { city, price: Math.min(d.pricePerSqm / 1000, 100), yield: d.yield * 10, change: d.annualChange, score: d.investmentScore.avg };
  });

  const predictionData = generatePrediction("Istanbul");
  
  // Yield calculation
  const annualRent = monthlyRent * 12;
  const netAnnualRent = annualRent * (1 - expenses / 100);
  const grossYield = ((annualRent / propertyValue) * 100).toFixed(2);
  const netYield = ((netAnnualRent / propertyValue) * 100).toFixed(2);
  const paybackYears = (propertyValue / netAnnualRent).toFixed(1);

  const getRec = (score: number) => {
    if (score >= 85) return { text: "Guclu Al", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (score >= 70) return { text: "Al", color: "text-emerald-300 bg-emerald-500/5 border-emerald-500/10" };
    if (score >= 50) return { text: "Bekle", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { text: "Kacin", color: "text-red-400 bg-red-500/10 border-red-500/20" };
  };

  const analysisTabs = [
    { key: "unitPrice", label: "Birim Fiyat" },
    { key: "change", label: "Degisim" },
    { key: "yield", label: "Getiri" },
    { key: "amortization", label: "Amortisman" },
  ];

  const columns = analysisType === "unitPrice" ? [
    { key: "pricePerSqm", label: "m2 Birim Fiyat", color: "text-blue-400" },
    { key: "avgValue", label: "Ort. Deger", color: "text-sky-400" },
    { key: "amortization", label: "Amortisman", color: "text-violet-400" },
    { key: "yield", label: "Getiri", color: "text-emerald-400" },
    { key: "annualChange", label: "Yillik Degisim", color: "text-emerald-400" },
  ] : analysisType === "change" ? [
    { key: "monthlyChange", label: "Aylik Degisim", color: "text-blue-400" },
    { key: "annualChange", label: "Yillik Degisim", color: "text-emerald-400" },
    { key: "totalChange", label: "Toplam Degisim", color: "text-sky-400" },
    { key: "nextYearPrediction", label: "1 Yil Tahmini", color: "text-amber-400" },
    { key: "twoYearPrediction", label: "2 Yil Tahmini", color: "text-pink-400" },
  ] : analysisType === "yield" ? [
    { key: "yield", label: "Kira Getirisi", color: "text-emerald-400" },
    { key: "amortization", label: "Amortisman", color: "text-violet-400" },
    { key: "avgValue", label: "Ort. Deger", color: "text-sky-400" },
    { key: "marketingDays", label: "Satis Suresi", color: "text-amber-400" },
    { key: "annualChange", label: "Yillik Artis", color: "text-blue-400" },
  ] : [
    { key: "amortization", label: "Amortisman", color: "text-violet-400" },
    { key: "yield", label: "Getiri", color: "text-emerald-400" },
    { key: "pricePerSqm", label: "m2 Fiyat", color: "text-blue-400" },
    { key: "avgArea", label: "Ort. Alan", color: "text-sky-400" },
    { key: "marketingDays", label: "Satis Suresi", color: "text-amber-400" },
  ];

  const formatValue = (key: string, val: number) => {
    if (key === "pricePerSqm") return `TRY ${val.toLocaleString()}`;
    if (key === "avgValue") return `TRY ${(val / 1000000).toFixed(1)}M`;
    if (key === "avgArea") return `${val}m2`;
    if (key === "marketingDays") return `${val} gun`;
    if (key === "amortization") return `${val} yil`;
    return `+${val}%`;
  };

  const getMarketCycleColor = (cycle: string) => {
    if (cycle === "buyer") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (cycle === "seller") return "text-red-400 bg-red-500/10 border-red-500/20";
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  };

  const getMarketCycleLabel = (cycle: string) => {
    if (cycle === "buyer") return "Alici Piyasasi";
    if (cycle === "seller") return "Satici Piyasasi";
    return "Dengeli";
  };

  return (
    <div ref={ref} className="min-h-screen pt-24 pb-16 bg-[#0a0f1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2 mb-2">
            <ArrowLeft className="w-4 h-4" /> Geri
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-400" />
            Gayrimenkul Piyasa Analizi
          </h1>
          <p className="text-slate-400 mt-2">AI destekli endeks analizi, fiyat tahmini ve yatirim degerlendirmesi</p>
        </div>

        {/* Tab Navigation */}
        <div className={`flex gap-2 mb-8 overflow-x-auto pb-2 transition-all duration-700 delay-100 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          {[
            { key: "overview", label: "Genel Bakis", icon: <BarChart3 className="w-4 h-4" /> },
            { key: "prediction", label: "Fiyat Tahmini", icon: <LineChartIcon className="w-4 h-4" /> },
            { key: "simulator", label: "Getiri Simulatoreu", icon: <Calculator className="w-4 h-4" /> },
            { key: "opportunities", label: "Yatirim Firsatlari", icon: <Target className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key 
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" 
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ===== TAB: OVERVIEW ===== */}
        {activeTab === "overview" && (
          <>
            {/* Platform Ozeti */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-700 delay-150 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <SummaryCard icon={<Building2 className="w-5 h-5 text-blue-400" />} label="Toplam Ilan" value="12" sub="Aktif Ihale" />
              <SummaryCard icon={<Wallet className="w-5 h-5 text-emerald-400" />} label="Ort. m2 Fiyati" value="TRY 65.8K" sub="Tum Sehirler" />
              <SummaryCard icon={<Percent className="w-5 h-5 text-violet-400" />} label="Ort. Getiri" value="%6.5" sub="Yillik Kira" />
              <SummaryCard icon={<TrendingUp className="w-5 h-5 text-sky-400" />} label="Ort. Yillik Artis" value="%+19.7" sub="Son 12 Ay" />
            </div>

            {/* Filters */}
            <div className={`flex flex-col lg:flex-row gap-3 mb-6 transition-all duration-700 delay-200 ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Il veya anahtar kelime ara..." className="pl-10 bg-slate-900/50 border-white/10 text-white" />
              </div>
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm">
                <option value="all">Tum Sehirler</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm">
                <option value="score">Yatirim Skoru</option>
                <option value="price">m2 Fiyati</option>
                <option value="yield">Kira Getirisi</option>
              </select>
            </div>

            {/* Piyasa Dongusu + Dagilim */}
            <div className={`grid lg:grid-cols-3 gap-6 mb-10 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <Card className="lg:col-span-2 bg-slate-900/50 border-white/5 p-5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-blue-400" />
                  Piyasa Dongusu Gostergesi
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {CITIES.map((city) => {
                    const d = CITY_DATA[city];
                    return (
                      <div key={city} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-white">{city}</span>
                          <span className={`px-2 py-1 rounded-lg border text-xs font-medium ${getMarketCycleColor(d.marketCycle)}`}>
                            {getMarketCycleLabel(d.marketCycle)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Stok Degisim</span>
                            <span className="text-red-400">{d.stockChange}%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Satis Suresi</span>
                            <span className="text-amber-400">{d.marketingDays} gun</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">m2 Fiyat</span>
                            <span className="text-blue-400">TRY {d.pricePerSqm.toLocaleString()}</span>
                          </div>
                        </div>
                        {/* Market cycle bar */}
                        <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              d.marketCycle === "buyer" ? "bg-emerald-500 w-[30%]" : 
                              d.marketCycle === "seller" ? "bg-red-500 w-[80%]" : "bg-amber-500 w-[55%]"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="bg-slate-900/50 border-white/5 p-5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-pink-400" />
                  Portfoy Dagilimi
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={marketDistData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                        {marketDistData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Bolge Fiyat Endeksi */}
            <div className={`mb-10 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Bolge Fiyat Endeksi
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {analysisTabs.map((t) => (
                    <button key={t.key} onClick={() => setAnalysisType(t.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${analysisType === t.key ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <Card className="bg-slate-900/50 border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left px-4 py-3 text-slate-400 font-medium">Sehir</th>
                        {columns.map((col) => (
                          <th key={col.key} className="text-right px-4 py-3 text-slate-400 font-medium">{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CITIES.map((city) => {
                        const d = CITY_DATA[city];
                        return (
                          <tr key={city} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3"><span className="font-semibold text-white">{city}</span></td>
                            {columns.map((col) => (
                              <td key={col.key} className={`text-right px-4 py-3 font-semibold ${col.color}`}>
                                {formatValue(col.key, (d as any)[col.key])}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Grafikler */}
            <div className={`grid lg:grid-cols-2 gap-6 mb-10 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <Card className="bg-slate-900/50 border-white/5 p-5">
                <h3 className="text-lg font-bold text-white mb-4">Yatirim Skoru Karsilastirmasi</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                      <YAxis stroke="#71717a" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.score >= 80 ? "#10b981" : entry.score >= 60 ? "#3b82f6" : "#f59e0b"} />
                        ))}
                      </Bar>
                      <Line type="monotone" dataKey="score" stroke="#fff" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="bg-slate-900/50 border-white/5 p-5">
                <h3 className="text-lg font-bold text-white mb-4">Fiyat / Getiri Dagilimi</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="x" name="m2 Fiyati" stroke="#71717a" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <YAxis dataKey="y" name="Kira Getirisi" stroke="#71717a" fontSize={11} unit="%" />
                      <ZAxis dataKey="z" range={[60, 200]} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                      <Scatter data={scatterData} fill="#3b82f6" fillOpacity={0.7} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Yatirim Skoru + Stok */}
            <div className={`grid lg:grid-cols-2 gap-6 mb-10 transition-all duration-700 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <Card className="bg-slate-900/50 border-white/5 p-5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  Yatirim Skoru Siralamasi
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-2 text-slate-400 font-medium">Sehir</th>
                        <th className="text-right py-2 text-slate-400 font-medium">Ort.</th>
                        <th className="text-right py-2 text-slate-400 font-medium">Al-Sat</th>
                        <th className="text-right py-2 text-slate-400 font-medium">Al-Kirala</th>
                        <th className="text-right py-2 text-slate-400 font-medium">Al-Yasa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CITIES.map((city) => {
                        const s = CITY_DATA[city].investmentScore;
                        const isBest = s.avg <= 25;
                        return (
                          <tr key={city} className={`border-b border-white/[0.03] hover:bg-white/[0.02] ${isBest ? "bg-emerald-500/5" : ""}`}>
                            <td className="py-2.5 font-medium text-white flex items-center gap-2">
                              {isBest && <Star className="w-3.5 h-3.5 text-emerald-400 fill-current" />}
                              {city}
                            </td>
                            <td className="text-right py-2.5 font-bold text-white">{s.avg}</td>
                            <td className="text-right py-2.5 text-blue-400">{s.buySell}</td>
                            <td className="text-right py-2.5 text-violet-400">{s.buyRent}</td>
                            <td className="text-right py-2.5 text-sky-400">{s.buyLive}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="bg-slate-900/50 border-white/5 p-5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-400" />
                  Piyasa Stok Analizi
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-2 text-slate-400 font-medium">Sehir</th>
                        <th className="text-right py-2 text-slate-400 font-medium">Ort. Alan</th>
                        <th className="text-right py-2 text-slate-400 font-medium">Satis Suresi</th>
                        <th className="text-right py-2 text-slate-400 font-medium">Bina Yasi</th>
                        <th className="text-right py-2 text-slate-400 font-medium">Stok Degisim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CITIES.map((city) => {
                        const d = CITY_DATA[city];
                        return (
                          <tr key={city} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                            <td className="py-2.5 font-medium text-white">{city}</td>
                            <td className="text-right py-2.5 text-sky-400">{d.avgArea}m2</td>
                            <td className="text-right py-2.5 text-amber-400">{d.marketingDays} gun</td>
                            <td className="text-right py-2.5 text-slate-400">{d.avgAge} yil</td>
                            <td className="text-right py-2.5 text-red-400">{d.stockChange}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Demografi */}
            <div className={`mb-10 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                Demografi Verileri
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {CITIES.map((city) => {
                  const d = CITY_DATA[city];
                  return (
                    <Card key={city} className="bg-slate-900/50 border-white/5 p-4">
                      <h4 className="font-bold text-white mb-3">{city}</h4>
                      <div className="space-y-2.5">
                        <DemoItem icon={<Users className="w-3.5 h-3.5 text-blue-400" />} label="Nufus" value={`${(d.population / 1000000).toFixed(1)}M`} />
                        <DemoItem icon={<Activity className="w-3.5 h-3.5 text-emerald-400" />} label="Medyan Yas" value={`${d.medianAge}`} />
                        <DemoItem icon={<Wallet className="w-3.5 h-3.5 text-amber-400" />} label="Kisi Basi Gelir" value={`TRY ${d.incomePerCapita.toLocaleString()}`} />
                        <DemoItem icon={<Home className="w-3.5 h-3.5 text-violet-400" />} label="Ort. Hanehalki" value={`${(d.avgArea * 0.85).toFixed(0)}m2`} />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Ilan Listesi */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">AI Degerlendirmesi — {filtered.length} Ilan</h3>
              {filtered.map((auction) => {
                const rec = getRec(auction.investmentScore);
                return (
                  <Card key={auction.id} className="bg-slate-900/50 border-white/5 hover:border-blue-500/20 transition-all duration-500 hover:-translate-y-0.5 cursor-pointer" onClick={() => navigate(`/ilan/${auction.id}`)}>
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row gap-5">
                        <img src={auction.images[0]} alt={auction.title} className="w-full md:w-48 h-32 object-cover rounded-xl shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-lg font-bold text-white hover:text-blue-400 transition-colors">{auction.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1"><MapPin className="w-3.5 h-3.5" />{auction.location}</div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap ${rec.color}`}>{rec.text}</div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                            <MiniStat icon={<Star className="w-4 h-4 text-blue-400" />} label="Yatirim Skoru" value={`${auction.investmentScore}/100`} />
                            <MiniStat icon={<BarChart3 className="w-4 h-4 text-sky-400" />} label="m2 Fiyati" value={`TRY ${auction.pricePerSqm.toLocaleString()}`} />
                            <MiniStat icon={<TrendingUp className="w-4 h-4 text-emerald-400" />} label="Kira Getirisi" value={`%${auction.areaStats.rentalYield}`} />
                            <MiniStat icon={<Home className="w-4 h-4 text-violet-400" />} label="Yillik Artis" value={`%${auction.areaStats.priceChangeYearly}`} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* ===== TAB: PRICE PREDICTION ===== */}
        {activeTab === "prediction" && (
          <div className="space-y-8">
            <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <LineChartIcon className="w-6 h-6 text-blue-400" />
                AI Fiyat Tahmini — Istanbul
              </h2>
              <p className="text-slate-400 mb-6">Gelecek 12 ay icin m2 birim fiyat tahmini (TRY/m2)</p>
              
              <Card className="bg-slate-900/50 border-white/5 p-5">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReAreaChart data={predictionData}>
                      <defs>
                        <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} domain={['dataMin - 5000', 'dataMax + 5000']} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Area type="monotone" dataKey="upper" name="Ust Sinir" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" fill="transparent" />
                      <Area type="monotone" dataKey="predicted" name="Tahmin" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPredicted)" />
                      <Area type="monotone" dataKey="lower" name="Alt Sinir" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" fill="transparent" />
                    </ReAreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <p className="text-xs text-slate-400">
                    Tahminler %95 guven araligi ile hesaplanmistir. Ust ve alt sinirlar modelin maksimum ve minimum beklentilerini gostermektedir.
                  </p>
                </div>
              </Card>
            </div>

            {/* Tahmin Ozeti Kartlari */}
            <div className={`grid md:grid-cols-4 gap-4 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              {[
                { label: "Mevcut m2 Fiyat", value: `TRY ${CITY_DATA["Istanbul"].pricePerSqm.toLocaleString()}`, icon: <CircleDollarSign className="w-5 h-5 text-blue-400" />, color: "text-blue-400" },
                { label: "12 Ay Tahmini", value: `TRY ${predictionData[11].predicted.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, color: "text-emerald-400" },
                { label: "Tahmini Artis", value: `+%${(((predictionData[11].predicted - CITY_DATA["Istanbul"].pricePerSqm) / CITY_DATA["Istanbul"].pricePerSqm) * 100).toFixed(1)}`, icon: <ArrowUpRight className="w-5 h-5 text-violet-400" />, color: "text-violet-400" },
                { label: "Guven Araligi", value: `TRY ${predictionData[11].lower.toLocaleString()} - ${predictionData[11].upper.toLocaleString()}`, icon: <ShieldCheck className="w-5 h-5 text-amber-400" />, color: "text-amber-400" },
              ].map((item) => (
                <Card key={item.label} className="bg-slate-900/50 border-white/5 p-4">
                  <div className="flex items-center gap-2 mb-2">{item.icon}<span className="text-sm text-slate-400">{item.label}</span></div>
                  <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                </Card>
              ))}
            </div>

            {/* Tum sehirler tahmin */}
            <div className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h3 className="text-xl font-bold text-white mb-4">Sehirlere Gore 1 Yillik Fiyat Tahmini</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CITIES.map((city) => {
                  const d = CITY_DATA[city];
                  const futurePrice = Math.round(d.pricePerSqm * (1 + d.nextYearPrediction / 100));
                  return (
                    <Card key={city} className="bg-slate-900/50 border-white/5 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white">{city}</h4>
                        <span className="text-xs text-slate-500">2026 Tahmini</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Mevcut</span>
                          <span className="text-white font-medium">TRY {d.pricePerSqm.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Tahmini</span>
                          <span className="text-emerald-400 font-bold">TRY {futurePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Artis</span>
                          <span className="text-blue-400 font-bold">+{d.nextYearPrediction}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 mt-2">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${Math.min(d.nextYearPrediction * 3, 100)}%` }} />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: YIELD SIMULATOR ===== */}
        {activeTab === "simulator" && (
          <div className="space-y-8">
            <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-emerald-400" />
                Kira Getirisi Simulatoreu
              </h2>
              <p className="text-slate-400 mb-6">Gayrimenkul yatiriminizin kira getirisini hesaplayin</p>
            </div>

            <div className={`grid lg:grid-cols-3 gap-6 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              {/* Inputs */}
              <Card className="lg:col-span-1 bg-slate-900/50 border-white/5 p-5">
                <h3 className="font-bold text-white mb-5">Parametreler</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block flex justify-between">
                      <span>Gayrimenkul Degeri</span>
                      <span className="text-white font-medium">TRY {propertyValue.toLocaleString()}</span>
                    </label>
                    <Slider value={[propertyValue]} onValueChange={(v) => setPropertyValue(v[0])} min={500000} max={50000000} step={500000} className="my-3" />
                    <Input type="number" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} className="bg-slate-950 border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block flex justify-between">
                      <span>Aylik Kira Geliri</span>
                      <span className="text-white font-medium">TRY {monthlyRent.toLocaleString()}</span>
                    </label>
                    <Slider value={[monthlyRent]} onValueChange={(v) => setMonthlyRent(v[0])} min={1000} max={100000} step={1000} className="my-3" />
                    <Input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value))} className="bg-slate-950 border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block flex justify-between">
                      <span>Isletme Giderleri (%)</span>
                      <span className="text-white font-medium">%{expenses}</span>
                    </label>
                    <Slider value={[expenses]} onValueChange={(v) => setExpenses(v[0])} min={0} max={40} step={1} className="my-3" />
                  </div>
                </div>
              </Card>

              {/* Results */}
              <Card className="lg:col-span-2 bg-slate-900/50 border-white/5 p-5">
                <h3 className="font-bold text-white mb-5">Sonuclar</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <ResultCard label="Brut Getiri" value={`%${grossYield}`} icon={<TrendingUp className="w-5 h-5 text-blue-400" />} color="text-blue-400" />
                  <ResultCard label="Net Getiri" value={`%${netYield}`} icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} color="text-emerald-400" />
                  <ResultCard label="Yillik Net Gelir" value={`TRY ${netAnnualRent.toLocaleString()}`} icon={<CircleDollarSign className="w-5 h-5 text-violet-400" />} color="text-violet-400" />
                  <ResultCard label="Amortisman" value={`${paybackYears} yil`} icon={<Clock className="w-5 h-5 text-amber-400" />} color="text-amber-400" />
                </div>

                {/* Comparison with cities */}
                <h4 className="text-sm font-semibold text-white mb-3">Sehirlerle Karsilastirma</h4>
                <div className="space-y-3">
                  {CITIES.map((city) => {
                    const d = CITY_DATA[city];
                    const cityNetYield = d.yield;
                    const userNetYield = parseFloat(netYield);
                    const diff = (userNetYield - cityNetYield).toFixed(1);
                    const isBetter = userNetYield > cityNetYield;
                    return (
                      <div key={city} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-white font-medium">{city}</span>
                          <span className="text-xs text-slate-500">Ort: %{cityNetYield}</span>
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-semibold ${isBetter ? "text-emerald-400" : "text-red-400"}`}>
                          {isBetter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {diff}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Amortisman grafigi */}
            <Card className={`bg-slate-900/50 border-white/5 p-5 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h3 className="text-lg font-bold text-white mb-4">Sehirlere Gore Amortisman Sureleri (Yil)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={CITIES.map((city) => ({ city, amortization: CITY_DATA[city].amortization, yield: CITY_DATA[city].yield }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="city" stroke="#71717a" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#71717a" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar yAxisId="left" dataKey="amortization" name="Amortisman (Yil)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="yield" name="Getiri (%)" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* ===== TAB: OPPORTUNITIES ===== */}
        {activeTab === "opportunities" && (
          <div className="space-y-8">
            <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Target className="w-6 h-6 text-amber-400" />
                AI Yatirim Firsatlari
              </h2>
              <p className="text-slate-400 mb-6">Yapay zeka tarafindan secilen en iyi yatirim firsatlari</p>
            </div>

            {/* En Iyi Firsatlar */}
            <div className={`grid md:grid-cols-3 gap-6 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              {AUCTIONS.filter((a) => a.investmentScore >= 80)
                .sort((a, b) => b.investmentScore - a.investmentScore)
                .slice(0, 3)
                .map((auction, idx) => {
                  const rec = getRec(auction.investmentScore);
                  return (
                    <Card key={auction.id} className="bg-slate-900/50 border-white/5 overflow-hidden hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-1">
                      <div className="relative h-44">
                        <img src={auction.images[0]} alt={auction.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold">
                          #{idx + 1} Firsat
                        </div>
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white text-xs font-bold">
                          AI {auction.investmentScore}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-white mb-1 line-clamp-1">{auction.title}</h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                          <MapPin className="w-3 h-3" /> {auction.location}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="p-2 rounded-lg bg-white/[0.03]">
                            <div className="text-xs text-slate-500">Tahmini Getiri</div>
                            <div className="text-sm font-bold text-emerald-400">%{auction.areaStats.rentalYield}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-white/[0.03]">
                            <div className="text-xs text-slate-500">Yillik Artis</div>
                            <div className="text-sm font-bold text-blue-400">%{auction.areaStats.priceChangeYearly}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-slate-500">Guncel Teklif</div>
                            <div className="text-lg font-bold text-white">TRY {auction.currentBid.toLocaleString()}</div>
                          </div>
                          <Button size="sm" onClick={() => navigate(`/ilan/${auction.id}`)} className="bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-white font-bold">
                            Incele
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {/* Firsat Matrisi */}
            <Card className={`bg-slate-900/50 border-white/5 p-5 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MousePointerClick className="w-5 h-5 text-blue-400" />
                Fiyat / Getiri Matrisi — Tum Ilanlar
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" dataKey="x" name="Fiyat" stroke="#71717a" fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} label={{ value: "Ilan Fiyati (TRY)", position: "bottom", fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis type="number" dataKey="y" name="Getiri" stroke="#71717a" fontSize={11} unit="%" label={{ value: "Kira Getirisi (%)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 }} />
                    <ZAxis type="number" dataKey="z" range={[80, 300]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-3 shadow-xl">
                              <p className="text-sm font-bold text-white mb-1">{data.name}</p>
                              <p className="text-xs text-slate-400">Fiyat: TRY {data.x.toLocaleString()}</p>
                              <p className="text-xs text-slate-400">Getiri: %{data.y}</p>
                              <p className="text-xs text-blue-400">AI Skor: {data.z}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter data={AUCTIONS.map((a) => ({ x: a.currentBid, y: a.areaStats.rentalYield, z: a.investmentScore, name: a.title.substring(0, 30) + "..." }))} fill="#3b82f6" fillOpacity={0.8}>
                      {AUCTIONS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.investmentScore >= 85 ? "#10b981" : entry.investmentScore >= 70 ? "#3b82f6" : "#f59e0b"} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-4 justify-center">
                <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Guclu Al (85+)</div>
                <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full bg-blue-500" /> Al (70-84)</div>
                <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full bg-amber-500" /> Bekle (&lt;70)</div>
              </div>
            </Card>

            {/* Tavsiye Listesi */}
            <div className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h3 className="text-xl font-bold text-white mb-4">AI Yatirim Tavsiyeleri</h3>
              <div className="space-y-3">
                {[
                  { type: "strong_buy", title: "Mugla Yalikavak'ta Premium Villalar", desc: "Yillik %28.5 deger artisi ve %8.2 kira getirisi ile en yuksek getiri potansiyeli", score: 92 },
                  { type: "strong_buy", title: "Antalya Konyaalti'nda Yeni Proje Daireleri", desc: "8 yillik bina yasi, 12 yil amortisman ve %7.5 kira getirisi", score: 88 },
                  { type: "buy", title: "Istanbul Maslak'ta Stüdyo Daireler", desc: "Airbnb yatirimi icin ideal, %8.5 kira getirisi potansiyeli", score: 78 },
                  { type: "buy", title: "Izmir Alsancak Kordon'da Daireler", desc: "Turizm sezonu kira getirisi yuksek, deniz manzarali", score: 76 },
                  { type: "watch", title: "Ankara Eryaman'da Aile Daireleri", desc: "Dengeli piyasa, dusuk risk profili ile guvenli yatirim", score: 73 },
                ].map((item, idx) => (
                  <Card key={idx} className={`bg-slate-900/50 border-white/5 p-4 hover:border-white/10 transition-all ${item.type === "strong_buy" ? "border-l-4 border-l-emerald-500" : ""}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        item.type === "strong_buy" ? "bg-emerald-500/10" : item.type === "buy" ? "bg-blue-500/10" : "bg-amber-500/10"
                      }`}>
                        {item.type === "strong_buy" ? <ArrowUpRight className="w-5 h-5 text-emerald-400" /> : 
                         item.type === "buy" ? <TrendingUp className="w-5 h-5 text-blue-400" /> : 
                         <Minus className="w-5 h-5 text-amber-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-white">{item.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            item.type === "strong_buy" ? "bg-emerald-500/10 text-emerald-400" : 
                            item.type === "buy" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {item.type === "strong_buy" ? "Guclu Al" : item.type === "buy" ? "Al" : "Izle"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{item.desc}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-slate-500">AI Skor</div>
                        <div className="text-xl font-bold text-white">{item.score}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 space-y-6">
          <ListingLinkDemo />
        </div>

        <p className="text-xs text-slate-600 mt-8 text-center leading-relaxed">
          * Bu tahminler istatistiksel modelleme yontemleri ile uretilmistir ve sapmalar icerebilir. Bilgiler sadece danismanlik amaclidir, yatirim tavsiyesi degildir.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card className="bg-slate-900/50 border-white/5 p-4">
      <div className="flex items-center gap-3 mb-2">{icon}<span className="text-sm text-slate-400">{label}</span></div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
    </Card>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-white/[0.03]">
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-xs text-slate-500">{label}</span></div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function DemoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">{icon}<span className="text-sm text-slate-400">{label}</span></div>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function ResultCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-slate-400">{label}</span></div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
