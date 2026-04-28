import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Phone, Mail, Share2, Heart, Flag,
  ChevronLeft, ChevronRight, Home, Building, Layers, CheckCircle2,
  XCircle, AlertTriangle, BarChart3, TrendingUp, TrendingDown, Minus,
  MessageSquare, GitCompare, Navigation, CarFront, Video,
  ExternalLink, Eye, Calculator, Receipt, ShieldCheck, Percent,
  FileText, Scale, Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getAllAuctionsForSearch } from "@/lib/auctionsSource";
import {
  PLATFORM_LISTING_CONTACT,
  resolveMarketingMode,
  MARKETING_MODE_LABELS,
  INTEGRITY_RULES_SUMMARY,
} from "@/lib/listingPolicy";
import { DEED_DUTY_RATE, estimateBuyerClosingCosts, feeBadgeLabel, FEE_TEXTS } from "@/lib/fees";
import { isDemoData } from "@/lib/dataStrategy";
import { DemoDataCornerBadge } from "@/components/DemoDataCornerBadge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { ShareButton } from "@/components/ShareButton";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.05);
  const auction = useMemo(() => getAllAuctionsForSearch().find((a) => a.id === id) ?? null, [id]);
  const marketingMode = auction ? resolveMarketingMode(auction) : "auction";
  const isListingOnly = marketingMode === "listing_only";
  const isSealedOffer = marketingMode === "sealed_offers";
  const isAuctionMode = marketingMode === "auction";
  const isRent = auction?.dealType === "rent";
  const pricePrimaryLabel =
    marketingMode === "listing_only" ? "İlan fiyatı" : marketingMode === "sealed_offers" ? "Başlangıç / talep" : "Güncel teklif";
  const [currentImage, setCurrentImage] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [showBidDialog, setShowBidDialog] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addRecent } = useRecentlyViewed();
  const saved = id ? isFavorite(id) : false;

  useEffect(() => {
    if (id) {
      addRecent(id);
    }
  }, [id, addRecent]);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "features" | "location" | "priceHistory" | "ai">("overview");
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [showMarketReportDialog, setShowMarketReportDialog] = useState(false);
  const [showOfficialDocsDialog, setShowOfficialDocsDialog] = useState(false);

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">İlan bulunamadı.</p>
          <Button onClick={() => navigate("/")} className="mt-4">Ana Sayfaya Dön</Button>
        </div>
      </div>
    );
  }

  const priceDiff = auction.aiPredictedPrice - auction.currentBid;
  const priceDiffPercent = ((priceDiff / auction.aiPredictedPrice) * 100).toFixed(1);
  const isUnderpriced = priceDiff > 0;
  const recommendation = auction.investmentScore >= 85 ? "strongBuy" : auction.investmentScore >= 70 ? "buy" : auction.investmentScore >= 50 ? "hold" : "avoid";

  const radarData = [
    { subject: "Konum", A: auction.investmentScore * 0.9 + 10, fullMark: 100 },
    { subject: "Fiyat", A: isUnderpriced ? 85 : 60, fullMark: 100 },
    { subject: "Özellikler", A: auction.propertyDetails.elevator && auction.propertyDetails.parking ? 80 : 65, fullMark: 100 },
    { subject: "Piyasa", A: auction.areaStats.demandIndex, fullMark: 100 },
    { subject: "Getiri", A: auction.areaStats.rentalYield * 10, fullMark: 100 },
    { subject: "Talep", A: auction.areaStats.demandIndex, fullMark: 100 },
  ];

  const handleBid = () => {
    const amount = parseInt(bidAmount.replace(/\D/g, ""));
    if (amount > auction.currentBid) {
      setShowBidDialog(false);
      setBidAmount("");
    }
  };

  const bidIncrements = [10000, 50000, 100000, 250000, 500000];
  const closing = estimateBuyerClosingCosts(auction.currentBid);

  return (
    <div ref={ref} className="min-h-screen pt-20 pb-16">
      <div className="sticky top-16 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2"><ArrowLeft className="w-4 h-4" /> Geri</Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => id && toggleFavorite(id)} className={`${saved ? "text-pink-400" : "text-slate-400"} hover:text-white`}><Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} /></Button>
            {id && <ShareButton title={auction?.title || ""} url={`/ilan/${id}`} />}
            <Button variant="ghost" size="sm" onClick={() => navigate(`/karsilastir?ids=${auction.id}`)} className="text-slate-400 hover:text-blue-400"><GitCompare className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className={`relative rounded-2xl overflow-hidden mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="relative h-[300px] md:h-[450px] lg:h-[500px]">
            <img src={auction.images[currentImage]} alt={auction.title} className="w-full h-full object-cover transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <button onClick={() => setCurrentImage((prev) => (prev === 0 ? auction.images.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setCurrentImage((prev) => (prev === auction.images.length - 1 ? 0 : prev + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"><ChevronRight className="w-5 h-5" /></button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {auction.images.map((_, i) => <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? "bg-blue-500 w-6" : "bg-white/50"}`} />)}
            </div>
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <Badge className={`${auction.status === "live" ? "bg-red-500" : "bg-sky-500"} text-white gap-1`}>{auction.status === "live" ? "Canlı" : "Yaklaşan"}</Badge>
              {isRent ? <Badge className="bg-violet-600 text-white border-0">Kiralık</Badge> : <Badge className="bg-emerald-600/90 text-white border-0">Satılık</Badge>}
              <Badge className="bg-slate-700 text-white border border-white/15">{MARKETING_MODE_LABELS[marketingMode].badge}</Badge>
            </div>
            {auction.virtualTour && (
              <div className="absolute top-4 right-4">
                <Button size="sm" onClick={() => setShowVirtualTour(true)} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white gap-2"><Video className="w-4 h-4" /> Sanal Tur</Button>
              </div>
            )}
          </div>
          <div className="flex gap-2 p-3 bg-slate-900/50 border-t border-white/5 overflow-x-auto">
            {auction.images.map((img, i) => (
              <button key={i} onClick={() => setCurrentImage(i)} className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${i === currentImage ? "border-blue-500" : "border-transparent"}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className={`transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">{auction.title}</h1>
              <div className="flex items-center gap-2 text-slate-400 mb-4"><MapPin className="w-4 h-4" /> {auction.location}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <PriceCard label={pricePrimaryLabel} value={`₺${(auction.currentBid / 1000000).toFixed(1)}M`} color="blue" />
                <PriceCard
                  label="Tahmini Değer"
                  value={`₺${(auction.estimatedValue / 1000000).toFixed(1)}M`}
                  color="emerald"
                  showDemoBadge={isDemoData("aiValuation")}
                />
                <PriceCard
                  label="AI Tahmini"
                  value={`₺${(auction.aiPredictedPrice / 1000000).toFixed(1)}M`}
                  color="sky"
                  showDemoBadge={isDemoData("aiValuation")}
                />
                <PriceCard
                  label="Yatırım Skoru"
                  value={`${auction.investmentScore}/100`}
                  color="violet"
                  showDemoBadge={isDemoData("auctionSeed")}
                />
              </div>
              <ListingDocumentFooter auction={auction} />
              <div className="flex flex-wrap gap-2 mb-6">
                <Button type="button" variant="outline" size="sm" className="border-teal-500/35 text-teal-100 gap-2 bg-teal-500/5" onClick={() => setShowMarketReportDialog(true)}>
                  <FileText className="w-4 h-4 shrink-0" /> Endeksa / piyasa raporu — analiz
                </Button>
                <Button type="button" variant="outline" size="sm" className="border-sky-500/35 text-sky-100 gap-2 bg-sky-500/5" onClick={() => setShowOfficialDocsDialog(true)}>
                  <Landmark className="w-4 h-4 shrink-0" /> Resmi belgeler (imar, belediye…)
                </Button>
              </div>
              <div className={`p-4 rounded-xl border mb-6 ${recommendation === "strongBuy" ? "bg-emerald-500/10 border-emerald-500/20" : recommendation === "buy" ? "bg-emerald-500/5 border-emerald-500/10" : recommendation === "hold" ? "bg-amber-500/5 border-amber-500/10" : "bg-red-500/5 border-red-500/10"}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${recommendation === "strongBuy" || recommendation === "buy" ? "bg-emerald-500/20 text-emerald-400" : recommendation === "hold" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                    {recommendation === "strongBuy" || recommendation === "buy" ? <TrendingUp className="w-5 h-5" /> : recommendation === "hold" ? <Minus className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">AI Alım Tavsiyesi</div>
                    <div className="text-xs text-slate-400">{recommendation === "strongBuy" ? "Güçlü alım fırsatı. Fiyat AI tahmininin altında." : recommendation === "buy" ? "Makul alım fırsatı." : recommendation === "hold" ? "Beklemek daha mantıklı." : "Dikkatli olun, fiyat yüksek."}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`sticky top-[7.5rem] z-30 bg-slate-950/95 backdrop-blur-xl border-b border-white/5 -mx-4 px-4 transition-all duration-700 delay-200 ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <div className="flex gap-1 overflow-x-auto py-2">
                {[
                  { key: "overview" as const, label: "Genel Bakış", icon: <Home className="w-4 h-4" /> },
                  { key: "details" as const, label: "Detaylar", icon: <Building className="w-4 h-4" /> },
                  { key: "features" as const, label: "Özellikler", icon: <CheckCircle2 className="w-4 h-4" /> },
                  { key: "location" as const, label: "Konum", icon: <MapPin className="w-4 h-4" /> },
                  { key: "priceHistory" as const, label: "Fiyat Geçmişi", icon: <TrendingUp className="w-4 h-4" /> },
                  { key: "ai" as const, label: "AI Analiz", icon: <BarChart3 className="w-4 h-4" /> },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>{tab.icon} {tab.label}</button>
                ))}
              </div>
            </div>

            <div className="min-h-[300px]">
              {activeTab === "overview" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                    <h3 className="text-sm font-semibold text-amber-200 mb-2">Profesyonel kurallar (özet)</h3>
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                      {INTEGRITY_RULES_SUMMARY.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                  {(auction.commitmentFloorTRY != null && auction.commitmentCeilingTRY != null) || auction.bindingCommitmentAccepted ? (
                    <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/25">
                      <div className="flex items-center gap-2 text-amber-100 mb-2">
                        <Scale className="w-5 h-5" />
                        <span className="text-sm font-semibold">Taahhüt limit bandı (satıcı / kiraya veren)</span>
                      </div>
                      {auction.commitmentFloorTRY != null && auction.commitmentCeilingTRY != null ? (
                        <p className="text-xs text-slate-300">
                          Alt: <strong className="text-white">₺{auction.commitmentFloorTRY.toLocaleString("tr-TR")}</strong>
                          {" · "}
                          Üst: <strong className="text-white">₺{auction.commitmentCeilingTRY.toLocaleString("tr-TR")}</strong>
                          {" "}
                          — üst limite ulaşıldığında işlem yükümlülüğü ve komisyon matrahı sözleşmede (hedef). Alıcı ve kiracı için simetrik kurallar aynı pakette.
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">Taahhüt onayı kayıtlı; limit değerleri üretimde tamamlanır.</p>
                      )}
                    </div>
                  ) : null}
                  {auction.expertiseRequired || auction.expertisePdfName ? (
                    <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5">
                      <div className="text-sm font-semibold text-emerald-100 mb-1">Ekspertiz raporu (şerh / ipotek / haciz)</div>
                      <p className="text-xs text-slate-400">
                        {auction.expertiseRequired ? "Bu ilanda ekspertiz zorunluluğu beyanı var. " : ""}
                        {auction.expertisePdfName ? (
                          <span>Dosya (demo): <code className="text-emerald-300/90">{auction.expertisePdfName}</code></span>
                        ) : (
                          <span>PDF üretimde doğrulanır; sahtecilik riskine karşı AI ön tarama + insan onayı hedeflenir.</span>
                        )}
                      </p>
                    </div>
                  ) : null}
                  <div><h3 className="text-lg font-bold text-white mb-3">Açıklama</h3><p className="text-slate-400 leading-relaxed whitespace-pre-line">{auction.description}</p></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <DetailItem icon={<Building className="w-5 h-5" />} label="Oda" value={auction.propertyDetails.roomCount} />
                    <DetailItem icon={<Layers className="w-5 h-5" />} label="Net m²" value={`${auction.propertyDetails.netSqm} m²`} />
                    <DetailItem icon={<Layers className="w-5 h-5" />} label="Kat" value={auction.propertyDetails.floor} />
                    <DetailItem icon={<Building className="w-5 h-5" />} label="Bina Yaşı" value={auction.propertyDetails.buildingAge} />
                  </div>
                  {auction.virtualTour && (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-sm font-semibold text-white">360° Sanal Tur</div>
                          <div className="text-xs text-slate-400">Bu mülkü sanal olarak gezebilirsiniz.</div>
                        </div>
                        <Button size="sm" onClick={() => setShowVirtualTour(true)} className="ml-auto bg-gradient-to-r from-blue-500 to-teal-400 text-white">Sanal Turu Başlat</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "details" && (
                <div className="grid sm:grid-cols-2 gap-3 animate-fade-in">
                  {[
                    { label: "Oda + Salon", value: auction.propertyDetails.roomCount },
                    { label: "Brüt m²", value: `${auction.propertyDetails.grossSqm} m²` },
                    { label: "Net m²", value: `${auction.propertyDetails.netSqm} m²` },
                    { label: "Bulunduğu Kat", value: auction.propertyDetails.floor },
                    { label: "Toplam Kat", value: `${auction.propertyDetails.totalFloors}` },
                    { label: "Bina Yaşı", value: `${auction.propertyDetails.buildingAge} Yıl` },
                    { label: "Isıtma", value: auction.propertyDetails.heating },
                    { label: "Cephe", value: auction.propertyDetails.facade },
                    { label: "Banyo", value: `${auction.propertyDetails.bathroom}` },
                    { label: "Balkon", value: auction.propertyDetails.balcony ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
                    { label: "Asansör", value: auction.propertyDetails.elevator ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
                    { label: "Otopark", value: auction.propertyDetails.parking ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
                    { label: "Eşyalı", value: auction.propertyDetails.furnished ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
                    { label: "Kullanım Durumu", value: auction.propertyDetails.usingStatus },
                    { label: "Tapu Durumu", value: auction.propertyDetails.deedStatus },
                    { label: "Uygunluk", value: auction.propertyDetails.eligibility },
                  ].map((item) => (
                    <div key={item.label as string} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5"><span className="text-sm text-slate-500">{item.label}</span><span className="text-sm font-medium text-white">{item.value}</span></div>
                  ))}
                </div>
              )}
              {activeTab === "features" && (
                <div className="animate-fade-in">
                  <div className="flex flex-wrap gap-2">
                    {auction.features.map((f) => <Badge key={f} variant="outline" className="border-white/10 text-slate-300 px-3 py-1.5 text-sm"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> {f}</Badge>)}
                  </div>
                </div>
              )}
              {activeTab === "location" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Yakın Çevre</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {auction.nearbyFacilities.map((f) => {
                        const icons: Record<string, any> = {
                          transport: <Navigation className="w-4 h-4 text-sky-400" />,
                          education: <Building className="w-4 h-4 text-emerald-400" />,
                          health: <Heart className="w-4 h-4 text-red-400" />,
                          shopping: <CarFront className="w-4 h-4 text-amber-400" />,
                          other: <MapPin className="w-4 h-4 text-violet-400" />,
                        };
                        return (
                          <div key={f.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                            <div className="p-2 rounded-lg bg-white/5">{icons[f.type]}</div>
                            <div><div className="text-sm font-medium text-white">{f.name}</div><div className="text-xs text-slate-500">{f.distance}m mesafe</div></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-white/5 h-64 bg-slate-900">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${auction.mapLng}!3d${auction.mapLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDA1JzEwLjEiTiAyOcKwMDEnMzYuNiJF!5e0!3m2!1str!2str!4v1`}
                    />
                  </div>
                </div>
              )}
              {activeTab === "priceHistory" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={auction.priceHistory.map((p) => ({ date: new Date(p.date).toLocaleDateString("tr-TR", { month: "short", year: "2-digit" }), price: p.price / 1000000 }))}>
                        <defs><linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                        <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₺${v}M`} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                        <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} fill="url(#priceGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {auction.priceHistory.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${p.event === "Fiyat Düşüşü" ? "bg-red-400" : "bg-blue-400"}`} />
                          <span className="text-sm text-slate-400">{p.event}</span>
                        </div>
                        <div className="text-right"><div className="text-sm font-medium text-white">₺{p.price.toLocaleString("tr-TR")}</div><div className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString("tr-TR")}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "ai" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={12} />
                          <PolarRadiusAxis stroke="#52525b" fontSize={10} />
                          <Radar name="Skor" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white">AI Yorumu</h3>
                      <div className={`p-4 rounded-xl border ${isUnderpriced ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {isUnderpriced
                            ? `Bu gayrimenkul AI değerleme modelimize göre %${Math.abs(Number(priceDiffPercent))} oranında değerinin altında fiyatlandırılmış. ${auction.location} bölgesinde ortalama m² fiyatı ₺${auction.areaStats.avgPricePerSqm.toLocaleString("tr-TR")} iken, bu ilan ₺${auction.pricePerSqm.toLocaleString("tr-TR")} / m² fiyatla listeleniyor.`
                            : `Bu gayrimenkul AI değerleme modelimize göre piyasa ortalamasına yakın fiyatlandırılmış. Talep endeksi ${auction.areaStats.demandIndex}/100.`}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <AIBadge label="Yatırım Skoru" value={`${auction.investmentScore}/100`} color={auction.investmentScore >= 80 ? "emerald" : auction.investmentScore >= 60 ? "blue" : "slate"} />
                        <AIBadge label="Kira Getirisi" value={`%${auction.areaStats.rentalYield}`} color="sky" />
                        <AIBadge label="Talep Endeksi" value={`${auction.areaStats.demandIndex}/100`} color="violet" />
                        <AIBadge label="Yıllık Artış" value={`%${auction.areaStats.priceChangeYearly}`} color="amber" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Bölge İstatistikleri — {auction.district}</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <StatBadge label="Ort. m² Fiyat" value={`₺${auction.areaStats.avgPricePerSqm.toLocaleString("tr-TR")}`} />
                      <StatBadge label="Aylık Değişim" value={`%${auction.areaStats.priceChangeMonthly}`} positive={auction.areaStats.priceChangeMonthly > 0} />
                      <StatBadge label="Yıllık Değişim" value={`%${auction.areaStats.priceChangeYearly}`} positive={auction.areaStats.priceChangeYearly > 0} />
                      <StatBadge label="Ort. Satış Süresi" value={`${auction.areaStats.avgDaysOnMarket} gün`} />
                      <StatBadge label="Aktif İlan" value={`${auction.areaStats.supplyCount}`} />
                      <StatBadge label="Kira Getirisi" value={`%${auction.areaStats.rentalYield}`} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className={`bg-slate-900/50 border-white/5 sticky top-[11rem] transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <CardContent className="p-5 space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">{pricePrimaryLabel}</div>
                  <div className="text-3xl font-bold text-blue-400">₺{auction.currentBid.toLocaleString("tr-TR")}</div>
                  <div className="text-xs text-slate-500 mt-1">₺{auction.pricePerSqm.toLocaleString("tr-TR")} / m²</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">AI Tahmini</span><span className="text-blue-400 font-semibold">₺{auction.aiPredictedPrice.toLocaleString("tr-TR")}</span></div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400" style={{ width: `${Math.min((auction.currentBid / auction.aiPredictedPrice) * 100, 100)}%` }} /></div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed border border-white/5 rounded-lg p-2.5 bg-white/[0.02]">
                  {isListingOnly ? (
                    <>
                      Bu ilan <strong className="text-slate-400">sadece ilan</strong> modundadır; fiyat bilgisi aşağıdadır. Bilgi veya talep için ihaleal.com ile iletişime geçin; taraf telefonu ilanda yok (ofis kartındaki yetkili adı gibi platform adı).
                    </>
                  ) : (
                    <>
                      Teklif verenlerin <strong className="text-slate-400">kimlik bilgileri ilanda yer almaz</strong>. Teklifler platform tarafından size iletilir; kabul sonrası süreç ve sözleşme{" "}
                      <strong className="text-slate-400">ihaleal.com</strong> üzerinden yürütülür (üretim hedefi). Sahte veya oyun amaçlı teklif yasaktır; cezai şartlar sözleşmede.
                    </>
                  )}
                </p>
                <div className="flex gap-2">
                  {!isListingOnly ? (
                    <Button className="flex-1 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-bold h-11" onClick={() => { setBidAmount((auction.currentBid + 50000).toString()); setShowBidDialog(true); }}>
                      <TrendingUp className="w-4 h-4 mr-1.5" /> {isSealedOffer ? "Kapalı teklif ver" : "Teklif ver"}
                    </Button>
                  ) : (
                    <Button className="flex-1 bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white font-bold h-11" type="button" onClick={() => { navigate("/"); window.setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100); }}>
                      Gösterim / bilgi talebi
                    </Button>
                  )}
                  {!isListingOnly && auction.dealType !== "rent" ? (
                    <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 h-11 px-3" onClick={() => navigate("/mortgage")} title="Kredi Hesapla"><Calculator className="w-4 h-4" /></Button>
                  ) : null}
                  <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white h-11 px-3" type="button" onClick={() => { navigate("/"); window.setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100); }} title="İletişim"><MessageSquare className="w-4 h-4" /></Button>
                </div>
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                    <div className="text-sm font-semibold text-white">{PLATFORM_LISTING_CONTACT.displayName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{PLATFORM_LISTING_CONTACT.roleLine}</div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{PLATFORM_LISTING_CONTACT.detailLine}</p>
                  </div>
                  <Button variant="outline" className="w-full border-white/10 text-slate-300 hover:text-white gap-2 h-10" type="button" onClick={() => window.open("mailto:destek@ihaleal.com?subject=İlan%20talebi%20" + encodeURIComponent(auction.id), "_blank")}>
                    <Mail className="w-4 h-4" /> Talep oluştur (e-posta)
                  </Button>
                  <Button variant="outline" className="w-full border-white/10 text-slate-300 hover:text-white gap-2 h-10" type="button" onClick={() => { navigate("/"); window.setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100); }}>
                    <Phone className="w-4 h-4" /> İletişim formu
                  </Button>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <button onClick={() => navigate("/ekspertiz")} className="w-full text-left p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors group">
                    <div className="flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4 text-blue-400" /><span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Uzman Gorusu Al</span></div>
                    <p className="text-xs text-slate-500">Profesyonel ekspertiz raporu talep edin</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-slate-900/50 border-white/5 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="w-4 h-4 text-teal-400" />
                  <h4 className="text-sm font-semibold text-white">Komisyon Hesaplayici</h4>
                  <Badge variant="outline" className="border-teal-500/20 text-teal-400 text-[10px] ml-auto">{feeBadgeLabel()}</Badge>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{isListingOnly ? "İlan tutarı (referans)" : "İhale / teklif tutarı (tahmini)"}</span>
                    </div>
                    <div className="text-lg font-bold text-white">₺{auction.currentBid.toLocaleString("tr-TR")}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Platform (alıcı)</span><span className="text-slate-300 font-medium">₺{closing.commission.toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">KDV (platform)</span><span className="text-slate-300 font-medium">₺{closing.vatOnCommission.toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Tapu Harci (%{(DEED_DUTY_RATE * 100).toFixed(0)})</span><span className="text-slate-300 font-medium">₺{closing.deed.toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Döner Sermaye</span><span className="text-slate-300 font-medium">₺{closing.fixed.toLocaleString("tr-TR")}</span></div>
                    <div className="border-t border-white/5 pt-2 flex justify-between font-semibold"><span className="text-teal-400">Toplam Maliyet</span><span className="text-teal-400">₺{closing.total.toLocaleString("tr-TR")}</span></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed px-0.5">{FEE_TEXTS.commissionMatrahLine()}</p>
                <button onClick={() => navigate("/ihale-kosullari")} className="text-xs text-slate-500 hover:text-teal-400 transition-colors flex items-center gap-1"><Percent className="w-3 h-3" /> Komisyon yapısını detaylı incele</button>
              </CardContent>
            </Card>

            <Card className={`bg-slate-900/50 border-white/5 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  <h4 className="text-sm font-semibold text-white">Guvenlik Dogrulamasi</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Kimlik dogrulamasi zorunlu</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Findeks kredi notu kontrolu</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> SMS ile iki asamali dogrulama</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Banka API ile odeme garantisi</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> AML/KYC uyumu</div>
                </div>
                <p className="text-[10px] text-slate-500 mt-3">ihaleal.com, 7263 sayili Kanun kapsaminda faaliyet gosterir.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{isSealedOffer ? "Kapalı teklif ver" : isAuctionMode ? "Teklif ver" : "Teklif"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Kimlik ve iletişim bilginiz ilan sahibine <strong className="text-slate-400">açıkça gösterilmez</strong>. Kabul ve sözleşme aşamasında süreç ihaleal.com üzerinden yürütülür (üretim hedefi; bu ekran demo).
            </p>
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-sm text-slate-400">{auction.title}</p>
              <p className="text-lg font-bold text-blue-400 mt-1">₺{auction.currentBid.toLocaleString("tr-TR")}</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/10">
              <p className="text-xs text-slate-400 mb-1">Tahmini Toplam Maliyet (Komisyon + Harclar Dahil)</p>
              <p className="text-sm font-bold text-teal-400">₺{estimateBuyerClosingCosts(auction.currentBid).total.toLocaleString("tr-TR")}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Alıcı platform: fees.ts · tapu %{(DEED_DUTY_RATE * 100).toFixed(0)} + sabit masraf (demo)
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {bidIncrements.map((inc) => (
                <button key={inc} onClick={() => setBidAmount((auction.currentBid + inc).toString())} className="px-2 py-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-xs font-semibold text-white transition-colors">+₺{(inc / 1000).toFixed(0)}K</button>
              ))}
            </div>
            <div><label className="text-sm text-slate-400 mb-1.5 block">Teklif Tutarı (₺)</label><Input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="bg-slate-950 border-white/10 text-white focus:ring-blue-500" placeholder="örn: 3000000" /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleBid} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold">
              {isSealedOffer ? "Kapalı teklifi gönder" : "Teklif Ver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMarketReportDialog} onOpenChange={setShowMarketReportDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" /> Piyasa raporu analizi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-400">
            <p>
              Endeksa veya benzeri bölge / fiyat raporu PDF’i yapay zeka destekli özet ve tutarlılık kontrolüne tabidir; hukuki değerleme yerine geçmez. Üçüncü taraf rapor telifine uyum kullanıcı sorumluluğundadır.
            </p>
            {auction.marketReportPdfName ? (
              <p className="text-xs">
                Bu ilan için seçilen dosya (demo): <code className="text-teal-300/90">{auction.marketReportPdfName}</code>
              </p>
            ) : (
              <p className="text-xs text-slate-500">İlan sahibi henüz rapor dosya adı eklemedi; tam akış üretimde.</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="border-white/15 text-slate-200" onClick={() => navigate("/veri-ve-endeks")}>
              Analiz sayfasına git
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-teal-400 text-white" onClick={() => setShowMarketReportDialog(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showOfficialDocsDialog} onOpenChange={setShowOfficialDocsDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-sky-400" /> Resmi belgeler özeti
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-400">
            <p>
              İmar planı değişiklikleri, belediye onayları, yapı kullanma izni ve benzeri resmi kararlar tapu öncesi alıcı veya kiracıya bu kanaldan gösterilir; tapu sonrası sürpriz kalmaması hedeflenir.
            </p>
            {auction.officialDocumentsForBuyer ? (
              <p className="text-xs text-emerald-300/90">İlan kaydında “resmi paket alıcıya gösterilecek” beyanı mevcut (demo).</p>
            ) : (
              <p className="text-xs text-amber-200/80">Bu ilanda resmi paket beyanı yok veya henüz tamamlanmadı; üretimde moderasyon tamamlar.</p>
            )}
            <ul className="text-xs list-disc list-inside text-slate-500 space-y-1">
              <li>İmar durumu / plan notları</li>
              <li>Belediye yazıları ve ruhsat izleri</li>
              <li>İlgili mahkeme veya idari karar özeti (varsa)</li>
            </ul>
          </div>
          <DialogFooter>
            <Button className="bg-gradient-to-r from-blue-500 to-teal-400 text-white" onClick={() => setShowOfficialDocsDialog(false)}>Anladım</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showVirtualTour} onOpenChange={setShowVirtualTour}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-4xl">
          <DialogHeader><DialogTitle className="text-xl font-bold">360° Sanal Tur</DialogTitle></DialogHeader>
          <div className="aspect-video rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">Sanal Tur Entegrasyonu</p>
              <p className="text-sm text-slate-400">Momento360 veya Matterport ile 360° tur eklenebilir.</p>
              <p className="text-xs text-slate-500 mt-2">URL: {auction.virtualTour || "Henüz eklenmemiş"}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PriceCard({
  label,
  value,
  color,
  showDemoBadge,
}: {
  label: string;
  value: string;
  color: string;
  showDemoBadge?: boolean;
}) {
  const colors: Record<string, string> = { blue: "text-blue-400", emerald: "text-emerald-400", sky: "text-sky-400", violet: "text-violet-400" };
  return (
    <div
      className="relative p-3 rounded-xl bg-white/[0.03] border border-white/5"
      data-demo={showDemoBadge ? "true" : undefined}
    >
      {showDemoBadge ? <DemoDataCornerBadge /> : null}
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-sm md:text-base font-bold ${colors[color] || "text-white"}`}>{value}</div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"><div className="text-blue-500">{icon}</div><div><div className="text-xs text-slate-500">{label}</div><div className="text-sm font-medium text-white">{value}</div></div></div>;
}

function AIBadge({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = { emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", blue: "bg-blue-500/10 border-blue-500/20 text-blue-400", sky: "bg-sky-500/10 border-sky-500/20 text-sky-400", violet: "bg-violet-500/10 border-violet-500/20 text-violet-400", amber: "bg-amber-500/10 border-amber-500/20 text-amber-400", slate: "bg-slate-500/10 border-slate-500/20 text-slate-400" };
  return <div className={`p-3 rounded-xl border ${colors[color] || colors.slate}`}><div className="text-xs opacity-80">{label}</div><div className="text-lg font-bold">{value}</div></div>;
}

function StatBadge({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5"><div className="text-xs text-slate-500">{label}</div><div className={`text-sm font-semibold ${positive === true ? "text-emerald-400" : positive === false ? "text-red-400" : "text-white"}`}>{value}</div></div>;
}
