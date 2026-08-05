import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, GitCompare, Star, CheckCircle2, XCircle, ArrowRight, TrendingUp, TrendingDown, Minus, Home, BarChart3, BadgePercent, Banknote, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AUCTIONS } from "@/data/auctions";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { ListingNumberBadge } from "@/components/ListingNumberBadge";
import { withListingDefaults } from "@/lib/listingPolicy";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function Compare() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialIds = searchParams.get("ids")?.split(",") || [];
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  const [showSelector, setShowSelector] = useState(initialIds.length < 2);

  const catalogNorm = useMemo(() => AUCTIONS.map((a) => withListingDefaults(a)), []);
  const compared = useMemo(
    () => catalogNorm.filter((a) => selectedIds.includes(a.id)),
    [catalogNorm, selectedIds],
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  const calculateScore = useCallback((auction: (typeof catalogNorm)[number]) => {
    const priceScore = Math.max(0, 100 - (auction.pricePerSqm / 2000));
    const locationScore = auction.areaStats.demandIndex;
    const featureScore = auction.propertyDetails.elevator && auction.propertyDetails.parking && auction.propertyDetails.balcony ? 90 : 70;
    const marketScore = Math.min(auction.areaStats.priceChangeYearly * 3 + 50, 100);
    const investmentScore = auction.investmentScore;
    return {
      price: Math.round(priceScore), location: Math.round(locationScore), features: Math.round(featureScore),
      market: Math.round(marketScore), investment: Math.round(investmentScore),
      overall: Math.round((priceScore + locationScore + featureScore + marketScore + investmentScore) / 5),
    };
  }, []);

  const scores = useMemo(() => compared.map((a) => ({ auction: a, score: calculateScore(a) })), [compared, calculateScore]);
  const winner = scores.length > 0 ? scores.reduce((best, curr) => (curr.score.overall > best.score.overall ? curr : best)) : null;

  // Price difference analysis
  const priceAnalysis = useMemo(() => {
    if (scores.length < 2) return [];
    const minPrice = Math.min(...scores.map((s) => s.auction.currentBid));
    return scores.map((s) => {
      const diff = s.auction.currentBid - minPrice;
      const diffPercent = minPrice > 0 ? ((diff / minPrice) * 100).toFixed(1) : "0";
      return { ...s, diff, diffPercent, isCheapest: diff === 0 };
    });
  }, [scores]);

  // Value analysis (AI predicted vs current)
  const valueAnalysis = useMemo(() => {
    return scores.map((s) => {
      const upside = s.auction.aiPredictedPrice - s.auction.currentBid;
      const upsidePercent = ((upside / s.auction.currentBid) * 100).toFixed(1);
      const isUndervalued = upside > 0;
      return { ...s, upside, upsidePercent, isUndervalued };
    });
  }, [scores]);

  const radarData = [
    { subject: "Fiyat", ...Object.fromEntries(scores.map((s) => [s.auction.district, s.score.price])) },
    { subject: "Konum", ...Object.fromEntries(scores.map((s) => [s.auction.district, s.score.location])) },
    { subject: "Ozellikler", ...Object.fromEntries(scores.map((s) => [s.auction.district, s.score.features])) },
    { subject: "Piyasa", ...Object.fromEntries(scores.map((s) => [s.auction.district, s.score.market])) },
    { subject: "Yatirim", ...Object.fromEntries(scores.map((s) => [s.auction.district, s.score.investment])) },
  ];

  const barData = scores.map((s) => ({
    district: s.auction.district,
    current: Math.round(s.auction.currentBid / 1000000),
    predicted: Math.round(s.auction.aiPredictedPrice / 1000000),
    value: Math.round(s.auction.estimatedValue / 1000000),
  }));

  const colors = ["#3b82f6", "#14b8a6", "#8b5cf6", "#ec4899"];

  return (
    <div ref={ref} className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-2"><ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri</Button>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3"><GitCompare className="w-8 h-8 text-cyan-400" /> Gayrimenkul Karşılaştırma</h1>
          <p className="text-slate-400 mt-2">İlanları yan yana karşılaştırın; AI skorları ve belge özeti ile seçim yapın.</p>
        </div>

        {showSelector && (
          <Card className="bg-slate-900/50 border-slate-200/80 mb-8 animate-scale-in">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">İlan seç ({selectedIds.length}/4)</h3>
                <Button size="sm" onClick={() => setShowSelector(false)} disabled={selectedIds.length < 2} className="[background:var(--gradient-cta)] text-white">Karşılaştırmaya başla</Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[28rem] overflow-y-auto pe-1">
                {catalogNorm.map((a) => (
                  <label key={a.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedIds.includes(a.id) ? "border-blue-500/30 bg-blue-500/5" : "border-slate-200/80 bg-white/[0.02] hover:border-slate-200"}`}>
                    <Checkbox checked={selectedIds.includes(a.id)} onCheckedChange={() => toggleSelection(a.id)} />
                    <img loading="lazy" src={a.images[0]} alt="" className="w-14 h-10 object-cover rounded-lg shrink-0" />
                    <div className="min-w-0">
                      <div className="mb-1">
                        <ListingNumberBadge auction={a} compact />
                      </div>
                      <div className="text-sm font-medium text-white truncate">{a.title}</div>
                      <div className="text-xs text-slate-500">₺{(a.currentBid / 1000000).toFixed(1)}M · {a.district}</div>
                      <ListingDocumentFooter auction={a} compact showTopRule={false} />
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!showSelector && selectedIds.length < 2 && (
          <div className="text-center py-20">
            <GitCompare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Karşılaştırma için en az iki ilan seçmelisiniz.</p>
            <Button onClick={() => setShowSelector(true)} className="mt-4 [background:var(--gradient-cta)] text-white">İlan seç</Button>
          </div>
        )}

        {!showSelector && scores.length >= 2 && (
          <>
            {/* Kazanan Kart */}
            {winner && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 mb-8 animate-fade-in space-y-3">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20"><Star className="w-6 h-6 text-blue-400" /></div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-400">Tavsiye edilen</div>
                    <div className="mt-1 mb-1">
                      <ListingNumberBadge auction={winner.auction} compact />
                    </div>
                    <div className="text-xl font-bold text-white">{winner.auction.title}</div>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="text-sm text-blue-400 font-semibold">Genel skor: {winner.score.overall}/100</span>
                      <span className="text-sm text-emerald-400">AI tahmini: ₺{winner.auction.aiPredictedPrice.toLocaleString("tr-TR")}</span>
                    </div>
                  </div>
                  <Button onClick={() => navigate(`/ilan/${winner.auction.id}`)} className="[background:var(--gradient-cta)] text-white whitespace-nowrap">Detaylar <ArrowRight className="rtl:rotate-180 w-4 h-4 ms-1" /></Button>
                </div>
                <ListingDocumentFooter auction={winner.auction} showTopRule={false} />
              </div>
            )}

            {/* Deger Analizi Kartlari */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-slate-900/50 border-slate-200/80 p-4">
                <div className="flex items-center gap-2 mb-3"><BadgePercent className="w-5 h-5 text-blue-400" /><span className="text-sm text-slate-400">Fiyat analizi</span></div>
                <div className="space-y-2">
                  {priceAnalysis.map((item) => (
                    <div key={item.auction.id} className="flex items-center justify-between">
                      <span className="text-sm text-white">{item.auction.district}</span>
                      <span className={`text-sm font-semibold ${item.isCheapest ? "text-emerald-400" : "text-red-400"}`}>
                        {item.isCheapest ? "En Ucuz" : `+${item.diffPercent}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="bg-slate-900/50 border-slate-200/80 p-4">
                <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-5 h-5 text-emerald-400" /><span className="text-sm text-slate-400">Değer artışı potansiyeli</span></div>
                <div className="space-y-2">
                  {valueAnalysis.map((item) => (
                    <div key={item.auction.id} className="flex items-center justify-between">
                      <span className="text-sm text-white">{item.auction.district}</span>
                      <span className={`text-sm font-semibold ${item.isUndervalued ? "text-emerald-400" : "text-red-400"}`}>
                        {item.isUndervalued ? `+${item.upsidePercent}%` : `${item.upsidePercent}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="bg-slate-900/50 border-slate-200/80 p-4">
                <div className="flex items-center gap-2 mb-3"><Banknote className="w-5 h-5 text-violet-400" /><span className="text-sm text-slate-400">Kira getirisi</span></div>
                <div className="space-y-2">
                  {scores.map((s) => (
                    <div key={s.auction.id} className="flex items-center justify-between">
                      <span className="text-sm text-white">{s.auction.district}</span>
                      <span className="text-sm font-semibold text-violet-400">%{s.auction.areaStats.rentalYield}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Radar + Bar Chart */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-slate-900/50 border-slate-200/80 p-5">
                <h3 className="text-lg font-bold text-white mb-4">Çok boyutlu karşılaştırma</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={12} />
                      <PolarRadiusAxis stroke="#52525b" fontSize={10} />
                      {scores.map((s, i) => <Radar key={s.auction.id} name={s.auction.district} dataKey={s.auction.district} stroke={colors[i]} fill={colors[i]} fillOpacity={0.15} strokeWidth={2} />)}
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="bg-slate-900/50 border-slate-200/80 p-5">
                <h3 className="text-lg font-bold text-white mb-4">Fiyat karşılaştırması (milyon ₺)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="district" stroke="#71717a" fontSize={11} />
                      <YAxis stroke="#71717a" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Bar dataKey="current" name="Güncel teklif" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="predicted" name="AI Tahmini" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="value" name="Piyasa Degeri" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Detayli Karsilastirma Tablosu */}
            <Card className="bg-slate-900/50 border-slate-200/80 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-start p-4 text-sm font-medium text-slate-500">Özellik</th>
                      {scores.map((s) => <th key={s.auction.id} className="text-center p-4 min-w-[200px]">
                        <div className="flex flex-col items-center gap-2">
                          <ListingNumberBadge auction={s.auction} compact />
                          <img loading="lazy" src={s.auction.images[0]} alt="" className="w-20 h-14 object-cover rounded-lg" />
                          <span className="text-sm font-bold text-white">{s.auction.district}</span>
                          {s.auction.id === winner?.auction.id && <Badge className="bg-blue-500 text-white text-xs">Tavsiye</Badge>}
                        </div>
                      </th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200/80 align-top">
                      <td className="p-4 text-sm text-slate-400">Rapor / belge</td>
                      {scores.map((s) => (
                        <td key={`doc-${s.auction.id}`} className="p-2 text-center align-top">
                          <ListingDocumentFooter auction={s.auction} compact showTopRule={false} />
                        </td>
                      ))}
                    </tr>
                    {/* AI Skorlar */}
                    {["overall", "price", "location", "features", "investment"].map((field) => {
                      const maxVal = Math.max(...scores.map((s) => s.score[field as keyof typeof s.score] as number));
                      return (
                        <tr key={field} className="border-b border-slate-200/80">
                          <td className="p-4 text-sm text-slate-400">{field === "overall" ? "Genel skor" : field === "price" ? "Fiyat avantajı" : field === "location" ? "Konum avantajı" : field === "features" ? "Özellik avantajı" : "Yatırım avantajı"}</td>
                          {scores.map((s) => {
                            const val = s.score[field as keyof typeof s.score] as number;
                            const isMax = val === maxVal && scores.length > 1;
                            return (
                              <td key={s.auction.id} className="p-4 text-center">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${isMax ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-white"}`}>
                                  {isMax && <CheckCircle2 className="w-3.5 h-3.5" />}{val}/100
                                </div>
                                <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full ${isMax ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${val}%` }} /></div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                    {/* Fiyat Bilgileri */}
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Güncel teklif</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm font-bold text-blue-400">₺{s.auction.currentBid.toLocaleString("tr-TR")}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">AI tahmini</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm text-sky-400">₺{s.auction.aiPredictedPrice.toLocaleString("tr-TR")}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Piyasa değeri</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm text-violet-400">₺{s.auction.estimatedValue.toLocaleString("tr-TR")}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">m² fiyatı</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm text-white">₺{s.auction.pricePerSqm.toLocaleString("tr-TR")}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Net m²</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm text-white">{s.auction.propertyDetails.netSqm} m²</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Kira getirisi</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm text-emerald-400">%{s.auction.areaStats.rentalYield}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Yıllık artış</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm text-blue-400">%{s.auction.areaStats.priceChangeYearly}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Oda sayısı</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm text-white">{s.auction.propertyDetails.roomCount}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Kat</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm text-white">{s.auction.propertyDetails.floor}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Bina yaşı</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm text-white">{s.auction.propertyDetails.buildingAge}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Isıtma</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm text-white">{s.auction.propertyDetails.heating}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Cephe</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm text-white">{s.auction.propertyDetails.facade}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Asansör</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center">{s.auction.propertyDetails.elevator ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /> : <XCircle className="w-5 h-5 text-red-400 mx-auto" />}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Otopark</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center">{s.auction.propertyDetails.parking ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /> : <XCircle className="w-5 h-5 text-red-400 mx-auto" />}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Balkon</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center">{s.auction.propertyDetails.balcony ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /> : <XCircle className="w-5 h-5 text-red-400 mx-auto" />}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Krediye uygun</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center">{s.auction.propertyDetails.eligibility ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /> : <XCircle className="w-5 h-5 text-red-400 mx-auto" />}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Eşya durumu</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm text-white">{s.auction.propertyDetails.furnished ? "Eşyalı" : "Boş"}</td>)}</tr>
                    <tr className="border-b border-slate-200/80"><td className="p-4 text-sm text-slate-400">Teklif sayısı</td>{scores.map((s) => <td key={s.auction.id} className="p-4 text-center text-sm text-white">{s.auction.bidderCount}</td>)}</tr>
                    <tr>
                      <td className="p-4" />
                      {scores.map((s) => <td key={s.auction.id} className="p-4 text-center"><Button size="sm" onClick={() => navigate(`/ilan/${s.auction.id}`)} className="[background:var(--gradient-cta)] text-white text-xs">Detaylar</Button></td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={() => setShowSelector(true)} className="border-slate-200 text-slate-500 hover:text-slate-900"><GitCompare className="w-4 h-4 me-2" />Farklı ilanlar karşılaştır</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
