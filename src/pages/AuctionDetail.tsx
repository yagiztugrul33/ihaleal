import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, MapPin, Phone, Mail, Share2, Heart, Flag,
  Home, Building, Layers, CheckCircle2,
  XCircle, AlertTriangle, BarChart3, TrendingUp, TrendingDown, Minus,
  MessageSquare, GitCompare, Navigation, CarFront, Video,
  ExternalLink, Eye, Calculator, Receipt, ShieldCheck, Percent,
  FileText, Scale, Landmark, ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import {
  PLATFORM_LISTING_CONTACT,
  resolveMarketingMode,
  MARKETING_MODE_LABELS,
  integrityRulesSummaryForAuction,
  withListingDefaults,
} from "@/lib/listingPolicy";
import { DEED_DUTY_RATE, estimateBuyerClosingCosts, feeBadgeLabel, FEE_TEXTS, BID_BOND_RATE, calcBidBond } from "@/lib/fees";
import { isDemoData } from "@/lib/dataStrategy";
import { DemoDataCornerBadge } from "@/components/DemoDataCornerBadge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { ShareButton } from "@/components/ShareButton";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { useAuctionRealtime } from "@/hooks/useAuctionRealtime";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { registerBidDeposit } from "@/lib/depositRegister";
import { isAuctionUuid } from "@/lib/auctionIds";
import {
  approveReport,
  fetchReportForListing,
  generateMockReport,
  userHasApprovedReport,
  type PropertyAnalysisReportRecord,
} from "@/lib/aiAnalysis";
import { PropertyAnalysisReportViewer } from "@/components/PropertyAnalysisReportViewer";
import { PantsirPanel } from "@/components/property/PantsirPanel";
import { CaymaPolitikasi } from "@/components/legal/CaymaPolitikasi";
import { ListingCoverImage } from "@/components/ListingCoverImage";
import { CinematicPropertyGallery, AIInsightLayer, InvestorTrustStrip, type AIInsight } from "@/components/cinematic";
import { ListingNumberBadge } from "@/components/ListingNumberBadge";
import { WEEKLY_AUCTION_POLICY_TR, WEEKLY_AUCTION_SLOT_TR } from "@/lib/listingNumber";
import { preAuthorize } from "@/lib/payment";
import {
  HEMEN_AL_CARD_BLOCK,
  HEMEN_AL_CONTRACT_LINKS,
  HEMEN_AL_DOCS_BLOCK,
  HEMEN_AL_GATE_INTRO,
  HEMEN_AL_GATE_TITLE,
  HEMEN_AL_MASAK_BLOCK,
} from "@/legal/hemenAlLansmanMetinleri";
import { MASTER_LEGAL_DISCLAIMER, MODULE3_HEMEN_AL_ACCEPTANCE } from "@/legal/masterContractCheckboxTexts";
import { BID_GATE_CHECKBOXES, initialBidGateAck, isBidGateComplete } from "@/legal/bidGateAgreement";
import { placeBidRpc, minNextBidTry, parsePositiveTryFromInput } from "@/lib/placeBid";
import { executeBuyNow } from "@/lib/buyNow";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const realtime = useAuctionRealtime(id);
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [catalog, setCatalog] = useState(() => getLocalAndStaticAuctions());
  useEffect(() => {
    let ok = true;
    void loadAllAuctionsForSearch().then((rows) => {
      if (ok) setCatalog(rows);
    });
    return () => {
      ok = false;
    };
  }, []);
  const auction = useMemo(() => catalog.find((a) => a.id === id) ?? null, [catalog, id]);
  const marketingMode = auction ? resolveMarketingMode(auction) : "auction";
  const isListingOnly = marketingMode === "listing_only";
  const isSealedOffer = marketingMode === "sealed_offers";
  const isAuctionMode = marketingMode === "auction";
  const listingWithDefaults = useMemo(() => (auction ? withListingDefaults(auction) : null), [auction]);
  const integritySummaryLines = useMemo(
    () => (listingWithDefaults ? integrityRulesSummaryForAuction(listingWithDefaults) : []),
    [listingWithDefaults],
  );
  const isRent = listingWithDefaults?.dealType === "rent";
  const pricePrimaryLabel =
    marketingMode === "listing_only" ? "İlan fiyatı" : marketingMode === "sealed_offers" ? "Başlangıç / talep" : "Güncel teklif";
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

  const { user } = useAuth();
  const [dbListingId, setDbListingId] = useState<string | null>(null);
  const [dbAuctionPk, setDbAuctionPk] = useState<string | null>(null);
  const [dbReportLoaded, setDbReportLoaded] = useState<PropertyAnalysisReportRecord | null>(null);
  const [buyNowPriceDb, setBuyNowPriceDb] = useState<number | null>(null);
  const [reportApproved, setReportApproved] = useState(false);
  const [legalWithdrawAccepted, setLegalWithdrawAccepted] = useState(false);
  const [depositId, setDepositId] = useState<string | null>(null);
  const [depositIdBuyNow, setDepositIdBuyNow] = useState<string | null>(null);
  const [preAuthOpen, setPreAuthOpen] = useState(false);
  const [preAuthBuyNowOpen, setPreAuthBuyNowOpen] = useState(false);
  const [showBuyNowConfirm, setShowBuyNowConfirm] = useState(false);
  const [demoBuyNowWon, setDemoBuyNowWon] = useState(false);
  const [cardToken, setCardToken] = useState("test-ok");
  const [preAuthBusy, setPreAuthBusy] = useState(false);
  const [bidBusy, setBidBusy] = useState(false);
  const [buyNowBusy, setBuyNowBusy] = useState(false);
  const [hemenAlGateOpen, setHemenAlGateOpen] = useState(false);
  const [buyNowAcceptContracts, setBuyNowAcceptContracts] = useState(false);
  const [buyNowAcceptMasak, setBuyNowAcceptMasak] = useState(false);
  const [buyNowAcceptCard, setBuyNowAcceptCard] = useState(false);
  const [buyNowAcceptModule3, setBuyNowAcceptModule3] = useState(false);
  const [buyNowFinalAck, setBuyNowFinalAck] = useState(false);
  const [bidGateAck, setBidGateAck] = useState(initialBidGateAck);

  const resolvedReport = useMemo((): PropertyAnalysisReportRecord | null => {
    if (!id || !auction) return null;
    if (dbReportLoaded) return dbReportLoaded;
    return generateMockReport({
      listingId: id,
      titleHint: auction.title,
      cityHint: auction.city,
      districtHint: auction.district,
      startPriceTry: auction.currentBid,
    });
  }, [id, auction, dbReportLoaded]);

  useEffect(() => {
    if (!id) return;
    try {
      if (sessionStorage.getItem(`ihaleal_report_ok_${id}`) === "1") setReportApproved(true);
      const d = sessionStorage.getItem(`ihaleal_deposit_${id}`);
      if (d) setDepositId(d);
      const dbn = sessionStorage.getItem(`ihaleal_deposit_buynow_${id}`);
      if (dbn) setDepositIdBuyNow(dbn);
      if (sessionStorage.getItem(`ihaleal_buynow_won_${id}`) === "1") setDemoBuyNowWon(true);
    } catch {
      /* ignore */
    }
  }, [id]);

  useEffect(() => {
    if (!id || !isAuctionUuid(id) || !isSupabaseConfigured()) return;
    let alive = true;
    void (async () => {
      const { data: auc } = await supabase.from("auctions").select("id, listing_id").eq("id", id).maybeSingle();
      if (!alive || !auc?.listing_id) return;
      setDbAuctionPk(auc.id);
      setDbListingId(auc.listing_id);
      const { data: rep } = await fetchReportForListing(supabase, auc.listing_id);
      if (!alive) return;
      if (rep) setDbReportLoaded(rep);
      const { data: listingRow } = await supabase
        .from("listings")
        .select("buy_now_price_try")
        .eq("id", auc.listing_id)
        .maybeSingle();
      if (!alive) return;
      if (listingRow?.buy_now_price_try != null) setBuyNowPriceDb(Number(listingRow.buy_now_price_try));
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!user?.id || !resolvedReport?.id || !isSupabaseConfigured()) return;
    let alive = true;
    void userHasApprovedReport(supabase, resolvedReport.id, user.id).then((ok) => {
      if (alive && ok) setReportApproved(true);
    });
    return () => {
      alive = false;
    };
  }, [user?.id, resolvedReport?.id]);

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">İlan bulunamadı veya katalog yükleniyor.</p>
          <Button onClick={() => navigate("/")} className="mt-4">Ana Sayfaya Dön</Button>
        </div>
      </div>
    );
  }

  const liveBid = realtime.highBidTry ?? auction.currentBid;
  const priceDiff = auction.aiPredictedPrice - liveBid;
  const priceDiffPercent = ((priceDiff / auction.aiPredictedPrice) * 100).toFixed(1);
  const isUnderpriced = priceDiff > 0;
  const recommendation = auction.investmentScore >= 85 ? "strongBuy" : auction.investmentScore >= 70 ? "buy" : auction.investmentScore >= 50 ? "hold" : "avoid";

  const effectiveBuyNowTry =
    buyNowPriceDb ?? (auction.buyNowPriceTry != null ? auction.buyNowPriceTry : null);

  const auctionEndedVisual = demoBuyNowWon || auction.status === "ended";

  const showBuyNowPanel =
    !isListingOnly &&
    isAuctionMode &&
    !isRent &&
    auction.status === "live" &&
    effectiveBuyNowTry != null &&
    !auctionEndedVisual;

  const buyNowDisabled =
    !user || !reportApproved || !depositIdBuyNow || buyNowBusy || auctionEndedVisual;
  const bidGateBlocked =
    !isListingOnly && Boolean(user) && (!reportApproved || !depositId);
  const bidDisabled = auctionEndedVisual || (!isListingOnly && (!user || !reportApproved || !depositId));

  const handleBuyerReportConfirm = async () => {
    if (!legalWithdrawAccepted || !user || !id || !resolvedReport) return;
    if (resolvedReport.id) {
      const { error } = await approveReport(supabase, resolvedReport.id, user.id);
      if (error) {
        window.alert(error.message);
        return;
      }
    }
    sessionStorage.setItem(`ihaleal_report_ok_${id}`, "1");
    setReportApproved(true);
  };

  const runPreAuth = async () => {
    if (!user || !id) return;
    setPreAuthBusy(true);
    try {
      const base = liveBid;
      const depositAmt = calcBidBond(base);
      const pr = await preAuthorize({
        amountTRY: depositAmt,
        cardToken,
        buyerId: user.id,
        listingId: dbListingId ?? id,
        context: "bid",
      });
      if (!pr.success) {
        window.alert(pr.error ?? "Ön yetki reddedildi");
        return;
      }
      if (pr.riskScore != null && pr.riskScore > 70) {
        window.alert("Risk skoru yüksek — işlem manuel incelenecek (demo simülasyonu).");
      }
      if (isAuctionUuid(id) && dbListingId && dbAuctionPk) {
        const result = await registerBidDeposit({
          listingId: dbListingId,
          auctionId: dbAuctionPk,
          context: "bid",
          baseAmountTry: base,
          depositAmountTry: depositAmt,
          preAuthRef: pr.preAuthRef ?? "mock",
        });
        if (result.ok) {
          setDepositId(result.depositId);
          sessionStorage.setItem(`ihaleal_deposit_${id}`, result.depositId);
        } else {
          window.alert(result.message);
          if (result.status === "kyc_required") {
            window.setTimeout(() => navigate("/kyc"), 2500);
          }
          return;
        }
      } else {
        const mockDep = `mock-local-${Date.now()}`;
        setDepositId(mockDep);
        sessionStorage.setItem(`ihaleal_deposit_${id}`, mockDep);
      }
      setPreAuthOpen(false);
    } finally {
      setPreAuthBusy(false);
    }
  };

  const runPreAuthBuyNow = async () => {
    if (!user || !id || effectiveBuyNowTry == null) return;
    setPreAuthBusy(true);
    try {
      const base = effectiveBuyNowTry;
      const depositAmt = calcBidBond(base);
      const pr = await preAuthorize({
        amountTRY: depositAmt,
        cardToken,
        buyerId: user.id,
        listingId: dbListingId ?? id,
        context: "buy_now",
      });
      if (!pr.success) {
        toastBid(pr.error ?? "Ön yetki reddedildi", "error");
        return;
      }
      if (pr.riskScore != null && pr.riskScore > 70) {
        toastBid("Risk skoru yüksek — işlem manuel incelenecek (demo simülasyonu).", "warning");
      }
      if (isAuctionUuid(id) && dbListingId && dbAuctionPk) {
        const result = await registerBidDeposit({
          listingId: dbListingId,
          auctionId: dbAuctionPk,
          context: "buy_now",
          baseAmountTry: base,
          depositAmountTry: depositAmt,
          preAuthRef: pr.preAuthRef ?? "mock",
        });
        if (result.ok) {
          setDepositIdBuyNow(result.depositId);
          sessionStorage.setItem(`ihaleal_deposit_buynow_${id}`, result.depositId);
          toastBid("Satın alım için blokaj kaydedildi.", "success");
        } else {
          toastBid(result.message, result.status === "kyc_required" ? "warning" : "error");
          if (result.status === "kyc_required") {
            window.setTimeout(() => navigate("/kyc"), 2500);
          }
          return;
        }
      } else {
        const mockDep = `mock-buynow-${Date.now()}`;
        setDepositIdBuyNow(mockDep);
        sessionStorage.setItem(`ihaleal_deposit_buynow_${id}`, mockDep);
        toastBid("Demo: satın al blokajı yerelde saklandı.", "info");
      }
      setPreAuthBuyNowOpen(false);
    } finally {
      setPreAuthBusy(false);
    }
  };

  const executeBuyNowConfirm = () => {
    if (!user || effectiveBuyNowTry == null) {
      toastBid("Giriş yapın.", "warning");
      return;
    }
    if (!reportApproved) {
      toastBid("Önce AI analiz raporunu onaylayın.", "warning");
      return;
    }
    if (!depositIdBuyNow) {
      toastBid("Satın alım için önce blokaj (ön yetki) adımını tamamlayın.", "warning");
      return;
    }
    if (!buyNowFinalAck) {
      toastBid("Hemen Al yasal onay kutusunu isaretleyin.", "warning");
      return;
    }
    setShowBuyNowConfirm(false);
    const useServerBuyNow =
      isAuctionUuid(id ?? "") &&
      isSupabaseConfigured() &&
      dbListingId &&
      depositIdBuyNow &&
      !depositIdBuyNow.startsWith("mock-buynow");
    if (useServerBuyNow) {
      setBuyNowBusy(true);
      void (async () => {
        try {
          const result = await executeBuyNow({
            listingId: dbListingId,
            depositId: depositIdBuyNow,
          });
          switch (result.status) {
            case "ok":
              setDemoBuyNowWon(true);
              sessionStorage.setItem(`ihaleal_buynow_won_${id}`, "1");
              toastBid(
                `Tebrikler! ₺${result.amountTry.toLocaleString("tr-TR")} ile ihaleyi kazandınız; ihale kapandı.`,
                "success",
              );
              return;
            case "duplicate":
              toastBid(result.message, "info");
              return;
            case "kyc_required":
              // Kademeli UX: net uyarı + KYC sayfasına yönlendirme (kullanıcı önce mesajı görür)
              toastBid(result.message, "warning");
              window.setTimeout(() => navigate("/kyc"), 2500);
              return;
            case "auth_required":
            case "preconditions_failed":
            case "rpc_error":
            case "config_missing":
              toastBid(result.message, "error");
              return;
          }
        } finally {
          setBuyNowBusy(false);
        }
      })();
      return;
    }
    sessionStorage.setItem(`ihaleal_buynow_won_${id}`, "1");
    setDemoBuyNowWon(true);
    toastBid(
      `Tebrikler! ₺${effectiveBuyNowTry.toLocaleString("tr-TR")} ile ihaleyi kazandınız (demo). İhale kapandı.`,
      "success",
    );
  };

  const radarData = [
    { subject: "Konum", A: auction.investmentScore * 0.9 + 10, fullMark: 100 },
    { subject: "Fiyat", A: isUnderpriced ? 85 : 60, fullMark: 100 },
    { subject: "Özellikler", A: auction.propertyDetails.elevator && auction.propertyDetails.parking ? 80 : 65, fullMark: 100 },
    { subject: "Piyasa", A: auction.areaStats.demandIndex, fullMark: 100 },
    { subject: "Getiri", A: auction.areaStats.rentalYield * 10, fullMark: 100 },
    { subject: "Talep", A: auction.areaStats.demandIndex, fullMark: 100 },
  ];

  const toastBid = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    window.dispatchEvent(new CustomEvent("ihaleal:add-toast", { detail: { message, type } }));
  };

  const handleBid = async () => {
    if (auctionEndedVisual) {
      toastBid("Bu ihale sona ermiş.", "info");
      return;
    }
    const amount = parsePositiveTryFromInput(bidAmount);
    if (amount == null) {
      toastBid("Geçerli bir teklif tutarı girin (pozitif tam sayı, makul üst sınır içinde).", "error");
      return;
    }
    const minRequired = isListingOnly ? liveBid + 1 : minNextBidTry(liveBid);
    if (amount < minRequired) {
      toastBid(`Teklif en az ₺${minRequired.toLocaleString("tr-TR")} olmalı.`, "warning");
      return;
    }
    if (!user) {
      toastBid("Teklif için giriş yapın.", "warning");
      return;
    }
    if (!isListingOnly && bidDisabled) {
      toastBid("Önce AI raporunu onaylayın ve teminat (ön yetki) adımını tamamlayın.", "warning");
      return;
    }
    if (!isListingOnly && !isBidGateComplete(bidGateAck)) {
      toastBid("Teklifi göndermek için tüm sözleşme ve beyan kutularını işaretleyin.", "warning");
      return;
    }

    if (isAuctionUuid(id ?? "") && isSupabaseConfigured()) {
      setBidBusy(true);
      try {
        const res = await placeBidRpc({
          auctionId: id as string,
          amountTry: amount,
          idempotencyKey: crypto.randomUUID(),
        });
        if (!res.ok) {
          toastBid(res.message, "error");
          return;
        }
        if (res.status === "duplicate") {
          toastBid(res.message ?? "Bu teklif zaten kayıtlı.", "info");
          setShowBidDialog(false);
          setBidAmount("");
          setBidGateAck(initialBidGateAck());
          return;
        }
        toastBid(`Teklif kaydedildi: ₺${amount.toLocaleString("tr-TR")}`, "success");
        setShowBidDialog(false);
        setBidAmount("");
        setBidGateAck(initialBidGateAck());
      } finally {
        setBidBusy(false);
      }
      return;
    }

    toastBid(
      "Demo ilan: teklif veritabanına yazılmaz. Canlı ihalelerde (Supabase UUID) teklif sunucuda saklanır.",
      "info",
    );
    setShowBidDialog(false);
    setBidAmount("");
  };

  const bidIncrements = [10000, 50000, 100000, 250000, 500000];
  const closing = estimateBuyerClosingCosts(liveBid);

  const galleryBadges = [
    { label: auction.status === "live" ? "Canlı" : "Yaklaşan", className: `${auction.status === "live" ? "bg-red-500" : "bg-sky-500"} text-white border-0` },
    { label: isRent ? "Kiralık" : "Satılık", className: "bg-emerald-600/90 text-white border-0" },
    { label: MARKETING_MODE_LABELS[marketingMode].badge, className: "bg-slate-700 text-white border border-white/15" },
  ];

  const aiInsights: AIInsight[] = [
    {
      id: "valuation",
      title: "Değerleme konumu",
      body: isUnderpriced
        ? `Model fiyatın %${Math.abs(Number(priceDiffPercent))} altında olduğunu işaret ediyor; bölge ortalaması ₺${auction.areaStats.avgPricePerSqm.toLocaleString("tr-TR")}/m².`
        : `Fiyat piyasa bandına yakın; talep endeksi ${auction.areaStats.demandIndex}/100.`,
      confidence: isUnderpriced ? 88 : 72,
      tone: isUnderpriced ? "positive" : "neutral",
    },
    {
      id: "yield",
      title: "Getiri profili",
      body: `Tahmini kira getirisi %${auction.areaStats.rentalYield}; amortisman ${Math.round(100 / Math.max(auction.areaStats.rentalYield, 0.1))} yıl bandında.`,
      confidence: 76,
      tone: "neutral",
    },
    {
      id: "risk",
      title: "Risk sinyali",
      body:
        recommendation === "avoid"
          ? "Fiyat baskısı ve düşük skor — ek due diligence önerilir."
          : "Likidite ve belge paketi kurumsal süreçle doğrulanabilir.",
      confidence: recommendation === "avoid" ? 58 : 84,
      tone: recommendation === "avoid" ? "caution" : "positive",
    },
  ];

  return (
    <div ref={ref} className="min-h-screen pt-20 pb-16">
      <div className="glass-panel sticky top-16 z-40 rounded-none border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2"><ArrowLeft className="w-4 h-4" /> Geri</Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => id && toggleFavorite(id)} className={`${saved ? "text-pink-400" : "text-slate-400"} hover:text-white`}><Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} /></Button>
            {id && <ShareButton title={auction?.title || ""} url={`/ilan/${id}`} />}
            <Button variant="ghost" size="sm" onClick={() => navigate(`/karsilastir?ids=${auction.id}`)} className="text-slate-400 hover:text-blue-400"><GitCompare className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <CinematicPropertyGallery
            images={auction.images}
            title={auction.title}
            badges={galleryBadges}
            aiPredictedPrice={auction.aiPredictedPrice}
            liveBid={liveBid}
            investmentScore={auction.investmentScore}
            hasVirtualTour={Boolean(auction.virtualTour)}
            onVirtualTour={() => setShowVirtualTour(true)}
          />
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className={`transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <ListingNumberBadge auction={auction} />
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">{auction.title}</h1>
              <div className="flex items-center gap-2 text-slate-400 mb-4"><MapPin className="w-4 h-4" /> {auction.location}</div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-200 mb-6 text-xs text-slate-400 leading-relaxed space-y-1.5">
                <p className="font-semibold text-slate-200 text-sm">Haftalık ihale takvimi (hedef)</p>
                <p>
                  <span className="text-cyan-200/90">{WEEKLY_AUCTION_SLOT_TR}</span> {WEEKLY_AUCTION_POLICY_TR}
                </p>
                <p>
                  Katılım evrakları ve kategoriler:{" "}
                  <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/evraklar")}>
                    /evraklar
                  </button>{" "}
                  (kimlik, Findeks, ekspertiz, tapu özeti, teminat vb.; hukuki son söz sözleşme ve avukat).
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <PriceCard label={pricePrimaryLabel} value={`₺${(liveBid / 1000000).toFixed(1)}M`} color="blue" />
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
                  <FileText className="w-4 h-4 shrink-0" /> İhaleal Endeksi — piyasa raporu analizi
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

            <AIInsightLayer insights={aiInsights} className="mb-8" />

            <div className={`sticky top-[7.5rem] z-30 bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/80 -mx-4 px-4 transition-all duration-700 delay-200 ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <div className="flex gap-1 overflow-x-auto py-2">
                {[
                  { key: "overview" as const, label: "Genel Bakış", icon: <Home className="w-4 h-4" /> },
                  { key: "details" as const, label: "Detaylar", icon: <Building className="w-4 h-4" /> },
                  { key: "features" as const, label: "Özellikler", icon: <CheckCircle2 className="w-4 h-4" /> },
                  { key: "location" as const, label: "Konum", icon: <MapPin className="w-4 h-4" /> },
                  { key: "priceHistory" as const, label: "Fiyat Geçmişi", icon: <TrendingUp className="w-4 h-4" /> },
                  { key: "ai" as const, label: "AI Analiz", icon: <BarChart3 className="w-4 h-4" />, mandatory: true },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-slate-500 hover:text-slate-900 hover:bg-white/5"}`}>{tab.icon} {tab.label}{tab.mandatory ? <Badge className="bg-emerald-600/90 text-white border-0 text-[10px] px-1.5 py-0">ZORUNLU</Badge> : null}</button>
                ))}
              </div>
            </div>

            <div className="min-h-[300px]">
              {activeTab === "overview" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                    <h3 className="text-sm font-semibold text-amber-200 mb-2">Profesyonel kurallar (özet)</h3>
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                      {integritySummaryLines.map((line) => (
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
                    <div key={item.label as string} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-slate-200/80"><span className="text-sm text-slate-500">{item.label}</span><span className="text-sm font-medium text-white">{item.value}</span></div>
                  ))}
                </div>
              )}
              {activeTab === "features" && (
                <div className="animate-fade-in">
                  <div className="flex flex-wrap gap-2">
                    {auction.features.map((f) => <Badge key={f} variant="outline" className="border-slate-200 text-slate-300 px-3 py-1.5 text-sm"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> {f}</Badge>)}
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
                          <div key={f.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-slate-200/80">
                            <div className="p-2 rounded-lg bg-white/5">{icons[f.type]}</div>
                            <div><div className="text-sm font-medium text-white">{f.name}</div><div className="text-xs text-slate-500">{f.distance}m mesafe</div></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-200/80 h-64 bg-slate-900">
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
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-slate-200/80">
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
              {activeTab === "ai" && resolvedReport && (
                <div className="space-y-8 animate-fade-in">
                  {/* R13.4 Pantsir — İstihbarat Paneli (mock veri, R13.2'de OSM API'ye geçiş) */}
                  {id ? <PantsirPanel listingId={id} /> : null}
                  <PropertyAnalysisReportViewer report={resolvedReport} mockBanner={!dbReportLoaded} />
                  <CaymaPolitikasi accepted={legalWithdrawAccepted} onAcceptedChange={setLegalWithdrawAccepted} />
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reportApproved}
                        disabled={!legalWithdrawAccepted}
                        onChange={(e) => {
                          void (async () => {
                            if (!legalWithdrawAccepted || !user || !id) return;
                            if (!e.target.checked) {
                              setReportApproved(false);
                              sessionStorage.removeItem(`ihaleal_report_ok_${id}`);
                              return;
                            }
                            await handleBuyerReportConfirm();
                          })();
                        }}
                        className="mt-1 rounded border-white/20"
                      />
                      <span>Raporu okuduğumu ve bilgilendirme niteliğini anladığımı onaylıyorum (taslak).</span>
                    </label>
                  </div>
                  {bidGateBlocked ? (
                    <p className="text-xs text-amber-200/90 border border-amber-400/25 rounded-lg px-3 py-2 bg-amber-500/10">
                      Teklif verebilmek için önce raporu onaylayın ve ardından blokaj ön yetkisini tamamlayın.
                    </p>
                  ) : null}
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
            <Card className={`card-luxury sticky top-[11rem] !p-0 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <CardContent className="p-5 space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">{pricePrimaryLabel}</div>
                  <div className="text-3xl font-bold text-blue-400">₺{liveBid.toLocaleString("tr-TR")}</div>
                  <div className="text-xs text-slate-500 mt-1">₺{auction.pricePerSqm.toLocaleString("tr-TR")} / m²</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-slate-200/80">
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">AI Tahmini</span><span className="text-blue-400 font-semibold">₺{auction.aiPredictedPrice.toLocaleString("tr-TR")}</span></div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400" style={{ width: `${Math.min((liveBid / auction.aiPredictedPrice) * 100, 100)}%` }} /></div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed border border-slate-200/80 rounded-lg p-2.5 bg-white/[0.02]">
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
                <div className="flex gap-2 flex-wrap">
                  {!isListingOnly ? (
                    <Button
                      className="flex-1 min-w-[8rem] bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-bold h-11 disabled:opacity-40 disabled:grayscale"
                      disabled={bidDisabled}
                      title={
                        bidDisabled
                          ? !user
                            ? "Giriş gerekli"
                            : !reportApproved
                              ? "Önce AI raporunu onaylayın"
                              : !depositId
                                ? "Blokaj ön yetkisi gerekli"
                                : ""
                          : ""
                      }
                      onClick={() => {
                        setBidAmount((liveBid + 50000).toString());
                        setShowBidDialog(true);
                      }}
                    >
                      <TrendingUp className="w-4 h-4 mr-1.5" /> {isSealedOffer ? "Kapalı teklif ver" : "Teklif ver"}
                    </Button>
                  ) : (
                    <Button className="flex-1 bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white font-bold h-11" type="button" onClick={() => { navigate("/"); window.setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100); }}>
                      Gösterim / bilgi talebi
                    </Button>
                  )}
                  {!isListingOnly && auction.dealType !== "rent" && effectiveBuyNowTry != null ? (
                    <Button
                      variant="outline"
                      className="border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/10 h-11 px-3 shrink-0"
                      disabled={buyNowDisabled}
                      title={
                        buyNowDisabled
                          ? !user
                            ? "Giriş gerekli"
                            : !reportApproved
                              ? "Önce AI raporunu onaylayın"
                              : !depositIdBuyNow
                                ? "Önce sözleşme / MASAK kapısı ve kart blokesi"
                                : ""
                          : !buyNowPriceDb
                            ? "MOCK gösterim — DB’de buy_now_price_try yoksa tahmini fiyat"
                            : ""
                      }
                      onClick={() => {
                        if (!user) {
                          toastBid("Giriş yapın.", "warning");
                          return;
                        }
                        if (!reportApproved) {
                          toastBid("Önce AI analiz raporunu onaylayın.", "warning");
                          return;
                        }
                        if (depositIdBuyNow) {
                          setBuyNowFinalAck(false);
                          setShowBuyNowConfirm(true);
                          return;
                        }
                        setBuyNowAcceptContracts(false);
                        setBuyNowAcceptMasak(false);
                        setBuyNowAcceptCard(false);
                        setBuyNowAcceptModule3(false);
                        setHemenAlGateOpen(true);
                      }}
                    >
                      Hemen Al ₺{(effectiveBuyNowTry / 1e6).toFixed(2)}M
                    </Button>
                  ) : null}
                  {!isListingOnly && user && reportApproved && !depositId ? (
                    <Button type="button" variant="secondary" className="h-11 px-3 bg-white/10 text-white shrink-0" onClick={() => setPreAuthOpen(true)}>
                      Blokaj (demo)
                    </Button>
                  ) : null}
                  {!isListingOnly && auction.dealType !== "rent" ? (
                    <Button variant="outline" className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-11 px-3 shrink-0" onClick={() => navigate("/mortgage")} title="Kredi Hesapla">
                      <Calculator className="w-4 h-4" />
                    </Button>
                  ) : null}
                  <Button variant="outline" className="border-slate-200 text-slate-300 hover:text-white h-11 px-3" type="button" onClick={() => { navigate("/"); window.setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100); }} title="İletişim"><MessageSquare className="w-4 h-4" /></Button>
                </div>
                <div className="pt-4 border-t border-slate-200/80 space-y-3">
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                    <div className="text-sm font-semibold text-white">{PLATFORM_LISTING_CONTACT.displayName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{PLATFORM_LISTING_CONTACT.roleLine}</div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{PLATFORM_LISTING_CONTACT.detailLine}</p>
                  </div>
                  <Button variant="outline" className="w-full border-slate-200 text-slate-300 hover:text-white gap-2 h-10" type="button" onClick={() => window.open("mailto:destek@ihaleal.com?subject=İlan%20talebi%20" + encodeURIComponent(auction.id), "_blank")}>
                    <Mail className="w-4 h-4" /> Talep oluştur (e-posta)
                  </Button>
                  <Button variant="outline" className="w-full border-slate-200 text-slate-300 hover:text-white gap-2 h-10" type="button" onClick={() => { navigate("/"); window.setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100); }}>
                    <Phone className="w-4 h-4" /> İletişim formu
                  </Button>
                </div>
                <div className="pt-4 border-t border-slate-200/80">
                  <button onClick={() => navigate("/ekspertiz")} className="w-full text-left p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors group">
                    <div className="flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4 text-blue-400" /><span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Uzman Gorusu Al</span></div>
                    <p className="text-xs text-slate-500">Profesyonel ekspertiz raporu talep edin</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-slate-900/50 border-slate-200/80 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="w-4 h-4 text-teal-400" />
                  <h4 className="text-sm font-semibold text-white">Komisyon Hesaplayici</h4>
                  <Badge variant="outline" className="border-teal-500/20 text-teal-400 text-[10px] ml-auto">{feeBadgeLabel()}</Badge>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-slate-200/80 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{isListingOnly ? "İlan tutarı (referans)" : "İhale / teklif tutarı (tahmini)"}</span>
                    </div>
                    <div className="text-lg font-bold text-white">₺{liveBid.toLocaleString("tr-TR")}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Platform (alıcı)</span><span className="text-slate-300 font-medium">₺{closing.commission.toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">KDV (platform)</span><span className="text-slate-300 font-medium">₺{closing.vatOnCommission.toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Tapu Harci (%{(DEED_DUTY_RATE * 100).toFixed(0)})</span><span className="text-slate-300 font-medium">₺{closing.deed.toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Döner Sermaye</span><span className="text-slate-300 font-medium">₺{closing.fixed.toLocaleString("tr-TR")}</span></div>
                    <div className="border-t border-slate-200/80 pt-2 flex justify-between font-semibold"><span className="text-teal-400">Toplam Maliyet</span><span className="text-teal-400">₺{closing.total.toLocaleString("tr-TR")}</span></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed px-0.5">{FEE_TEXTS.commissionMatrahLine()}</p>
                <button onClick={() => navigate("/ihale-kosullari")} className="text-xs text-slate-500 hover:text-teal-400 transition-colors flex items-center gap-1"><Percent className="w-3 h-3" /> Komisyon yapısını detaylı incele</button>
              </CardContent>
            </Card>

            <InvestorTrustStrip className="mb-6" />

            <Card className={`bg-slate-900/50 border-slate-200/80 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
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

      <Dialog
        open={showBidDialog}
        onOpenChange={(open) => {
          setShowBidDialog(open);
          if (open) setBidGateAck(initialBidGateAck());
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-200 text-white sm:max-w-lg max-h-[min(90vh,640px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{isSealedOffer ? "Kapalı teklif ver" : isAuctionMode ? "Teklif ver" : "Teklif"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-[10px] text-amber-200/90 leading-relaxed rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2">
              {MASTER_LEGAL_DISCLAIMER}
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Kimlik ve iletişim bilginiz ilan sahibine <strong className="text-slate-400">açıkça gösterilmez</strong>. Kabul ve sözleşme aşamasında süreç ihaleal.com üzerinden yürütülür (üretim hedefi; bu ekran demo).
            </p>
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-sm text-slate-400">{auction.title}</p>
              <p className="text-lg font-bold text-blue-400 mt-1">₺{liveBid.toLocaleString("tr-TR")}</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/10">
              <p className="text-xs text-slate-400 mb-1">Tahmini Toplam Maliyet (Komisyon + Harçlar Dahil)</p>
              <p className="text-sm font-bold text-teal-400">₺{estimateBuyerClosingCosts(liveBid).total.toLocaleString("tr-TR")}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Alıcı platform: fees.ts · tapu %{(DEED_DUTY_RATE * 100).toFixed(0)} + sabit masraf (demo)
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {bidIncrements.map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setBidAmount(String(liveBid + inc))}
                  className="px-2 py-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-xs font-semibold text-white transition-colors"
                >
                  +₺{(inc / 1000).toFixed(0)}K
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block" htmlFor="bid-amount-input">
                Teklif tutarı (₺)
              </label>
              <Input
                id="bid-amount-input"
                inputMode="numeric"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="bg-slate-950 border-slate-200 text-white focus:ring-blue-500"
                placeholder="örn: 3000000 veya 3.000.000"
              />
            </div>
            {!isListingOnly ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-black/20 p-3">
                <p className="text-xs font-semibold text-white">Zorunlu onaylar</p>
                <div className="space-y-3">
                  {BID_GATE_CHECKBOXES.map((row) => (
                    <label key={row.id} className="flex gap-3 text-left text-[11px] text-slate-300 leading-snug cursor-pointer">
                      <Checkbox
                        checked={bidGateAck[row.id]}
                        onCheckedChange={(v) =>
                          setBidGateAck((prev) => ({ ...prev, [row.id]: v === true }))
                        }
                        className="mt-0.5 border-white/25 data-[state=checked]:bg-blue-600"
                        aria-labelledby={`bid-gate-${row.id}`}
                      />
                      <span id={`bid-gate-${row.id}`}>
                        {row.to && row.linkLabel ? (
                          <>
                            {row.label}{" "}
                            <Link to={row.to} className="text-cyan-400 hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                              ({row.linkLabel})
                            </Link>
                          </>
                        ) : (
                          row.label
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-end">
            <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => setShowBidDialog(false)}>
              Vazgeç
            </Button>
            <Button
              type="button"
              disabled={bidBusy || (!isListingOnly && !isBidGateComplete(bidGateAck))}
              title={!isListingOnly && !isBidGateComplete(bidGateAck) ? "Tüm onay kutularını işaretleyin" : undefined}
              onClick={() => void handleBid()}
              className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold disabled:opacity-40"
            >
              {bidBusy ? "Gönderiliyor..." : isSealedOffer ? "Kapalı teklifi gönder" : "Teklif Ver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMarketReportDialog} onOpenChange={setShowMarketReportDialog}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" /> Piyasa raporu analizi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-400">
            <p>
              Yüklediğiniz veya referans gösterdiğiniz bölge / fiyat raporu PDF’leri, İhaleal Endeksi çerçevesinde yapay zeka destekli özet ve tutarlılık kontrolüne tabidir; hukuki değerleme yerine geçmez. Üçüncü taraf rapor telifine uyum kullanıcı sorumluluğundadır.
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
        <DialogContent className="bg-slate-900 border-slate-200 text-white max-w-lg">
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

      <Dialog open={preAuthOpen} onOpenChange={setPreAuthOpen}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Blokaj ön yetkisi (mock)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              Blokaj tutarı: <strong className="text-white">₺{calcBidBond(liveBid).toLocaleString("tr-TR")}</strong> (taban ₺
              {liveBid.toLocaleString("tr-TR")} üzerinden %{Math.round(BID_BOND_RATE * 100)}).
            </p>
            <p>Kazanırsanız kaparo / teminat akışına işlenmesi hedeflenir (Ürün koşulları taslak).</p>
            <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5">
              Gerçek kart ödemesi yok; şu an demo ön yetki simülasyonu. PSP (iyzico vb.) bağlanınca canlı moda geçilir.
            </p>
            <p>Cayarsanız yaklaşık %10 kesinti ve kalanın iadesi hedeflenir — detay için cayma politikası.</p>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Kart token (demo)</label>
              <Input value={cardToken} onChange={(e) => setCardToken(e.target.value)} className="bg-slate-950 border-slate-200 text-white" placeholder="test-ok veya test-fail" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => setPreAuthOpen(false)}>
              Vazgeç
            </Button>
            <Button type="button" className="bg-gradient-to-r from-blue-500 to-teal-400 text-white" disabled={preAuthBusy} onClick={() => void runPreAuth()}>
              {preAuthBusy ? "İşleniyor..." : "Ön yetkilendir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={hemenAlGateOpen} onOpenChange={setHemenAlGateOpen}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              {HEMEN_AL_GATE_TITLE}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5">{MASTER_LEGAL_DISCLAIMER}</p>
            <p className="leading-relaxed">{HEMEN_AL_GATE_INTRO}</p>
            <div className="rounded-lg border border-slate-200 bg-white/[0.03] p-3 space-y-2">
              <p className="text-xs font-semibold text-emerald-200">MASAK / AML</p>
              <p className="text-xs text-slate-400 leading-relaxed">{HEMEN_AL_MASAK_BLOCK}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white/[0.03] p-3 space-y-2">
              <p className="text-xs font-semibold text-cyan-200">Kart ve 3DS</p>
              <p className="text-xs text-slate-400 leading-relaxed">{HEMEN_AL_CARD_BLOCK}</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{HEMEN_AL_DOCS_BLOCK}</p>
            <div className="flex flex-wrap gap-2">
              {HEMEN_AL_CONTRACT_LINKS.map((l) => (
                <Button
                  key={l.href}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-white/15 text-slate-200 text-xs"
                  onClick={() => {
                    navigate(l.href);
                    setHemenAlGateOpen(false);
                  }}
                >
                  {l.label}
                </Button>
              ))}
            </div>
            <div className="space-y-3 border-t border-slate-200 pt-3">
              <label className="flex items-start gap-2 cursor-pointer text-xs">
                <Checkbox checked={buyNowAcceptContracts} onCheckedChange={(c) => setBuyNowAcceptContracts(c === true)} className="mt-0.5" />
                <span>Yukaridaki sözlesme ve kosullar baglantilarini inceledim; satilik Hemen Al&apos;in araci satis akisi oldugunu anliyorum.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer text-xs">
                <Checkbox checked={buyNowAcceptMasak} onCheckedChange={(c) => setBuyNowAcceptMasak(c === true)} className="mt-0.5" />
                <span>MASAK / KYC ve supheli islem prosedurune uygun veri islenmesini kabul ediyorum.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer text-xs">
                <Checkbox checked={buyNowAcceptCard} onCheckedChange={(c) => setBuyNowAcceptCard(c === true)} className="mt-0.5" />
                <span>Kart blokesi ve PSP kurallarini (3D Secure, capture) okudum.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer text-xs">
                <Checkbox checked={buyNowAcceptModule3} onCheckedChange={(c) => setBuyNowAcceptModule3(c === true)} className="mt-0.5" />
                <span>Hemen Al ihlal / kotuye kullanim uyarilarini okudum.</span>
              </label>
            </div>
            <pre className="text-[10px] text-slate-500 whitespace-pre-wrap max-h-32 overflow-y-auto rounded border border-slate-200 p-2 bg-black/30">
              {MODULE3_HEMEN_AL_ACCEPTANCE}
            </pre>
          </div>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => setHemenAlGateOpen(false)}>
              Vazgec
            </Button>
            <Button
              type="button"
              className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white"
              disabled={!(buyNowAcceptContracts && buyNowAcceptMasak && buyNowAcceptCard && buyNowAcceptModule3)}
              onClick={() => {
                setHemenAlGateOpen(false);
                setPreAuthBuyNowOpen(true);
              }}
            >
              Kart blokesi (Hemen Al) adımina devam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={preAuthBuyNowOpen} onOpenChange={setPreAuthBuyNowOpen}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Hemen Al — kart on yetkisi (mock)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-300">
            {effectiveBuyNowTry != null ? (
              <p>
                Hemen Al tutari: <strong className="text-white">₺{effectiveBuyNowTry.toLocaleString("tr-TR")}</strong>
              </p>
            ) : null}
            <p>
              Blokaj tutarı:{" "}
              <strong className="text-white">
                ₺{calcBidBond(effectiveBuyNowTry ?? 0).toLocaleString("tr-TR")}
              </strong>{" "}
              (Hemen Al bedeli üzerinden %{Math.round(BID_BOND_RATE * 100)} bloke/teminat; PSP provizyonu).
            </p>
            <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5">
              Gercek odeme baglaninca 3D Secure zorunlu olur; simdi demo token ile on yetki simule edilir.
            </p>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Kart token (demo)</label>
              <Input value={cardToken} onChange={(e) => setCardToken(e.target.value)} className="bg-slate-950 border-slate-200 text-white" placeholder="test-ok veya test-fail" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => setPreAuthBuyNowOpen(false)}>
              Vazgec
            </Button>
            <Button type="button" className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white" disabled={preAuthBusy} onClick={() => void runPreAuthBuyNow()}>
              {preAuthBusy ? "İşleniyor..." : "Blokaji baslat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBuyNowConfirm} onOpenChange={setShowBuyNowConfirm}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Hemen Al — islemi tamamla</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              Tutar:{" "}
              <strong className="text-emerald-300">
                ₺{(effectiveBuyNowTry ?? 0).toLocaleString("tr-TR")}
              </strong>
            </p>
            <p className="text-xs text-slate-400">
              Tahmini komisyon + harç (referans): ₺
              {estimateBuyerClosingCosts(effectiveBuyNowTry ?? liveBid).total.toLocaleString("tr-TR")} — fees.ts
            </p>
            <label className="flex items-start gap-2 cursor-pointer text-xs">
              <Checkbox checked={buyNowFinalAck} onCheckedChange={(c) => setBuyNowFinalAck(c === true)} className="mt-0.5" />
              <span>MESAFELI SATIS, ihale kosullari, MASAK/KYC ve MODULE3 Hemen Al yukumluluklerini tekrar onayliyorum.</span>
            </label>
          </div>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => setShowBuyNowConfirm(false)}>
              Vazgec
            </Button>
            <Button
              type="button"
              className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white"
              disabled={!buyNowFinalAck || buyNowBusy}
              onClick={() => executeBuyNowConfirm()}
            >
              {buyNowBusy ? "Kaydediliyor..." : "Ihaleyi Hemen Al ile kapat"}
            </Button>
            {isSupabaseConfigured() && isAuctionUuid(id ?? "") && dbListingId && depositIdBuyNow && !depositIdBuyNow.startsWith("mock-buynow") ? (
              <Button
                type="button"
                variant="secondary"
                className="border-slate-200 text-slate-200"
                disabled={!buyNowFinalAck}
                onClick={() => {
                  setShowBuyNowConfirm(false);
                  navigate(`/ihale/${id}/hemen-al`, {
                    state: { listingId: dbListingId, depositId: depositIdBuyNow },
                  });
                }}
              >
                Atomik RPC sayfasina git
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showVirtualTour} onOpenChange={setShowVirtualTour}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white max-w-4xl">
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
      className="relative p-3 rounded-xl bg-white/[0.03] border border-slate-200/80"
      data-demo={showDemoBadge ? "true" : undefined}
    >
      {showDemoBadge ? <DemoDataCornerBadge /> : null}
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-sm md:text-base font-bold ${colors[color] || "text-white"}`}>{value}</div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-slate-200/80"><div className="text-blue-500">{icon}</div><div><div className="text-xs text-slate-500">{label}</div><div className="text-sm font-medium text-white">{value}</div></div></div>;
}

function AIBadge({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = { emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", blue: "bg-blue-500/10 border-blue-500/20 text-blue-400", sky: "bg-sky-500/10 border-sky-500/20 text-sky-400", violet: "bg-violet-500/10 border-violet-500/20 text-violet-400", amber: "bg-amber-500/10 border-amber-500/20 text-amber-400", slate: "bg-slate-500/10 border-slate-500/20 text-slate-400" };
  return <div className={`p-3 rounded-xl border ${colors[color] || colors.slate}`}><div className="text-xs opacity-80">{label}</div><div className="text-lg font-bold">{value}</div></div>;
}

function StatBadge({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return <div className="p-3 rounded-xl bg-white/[0.03] border border-slate-200/80"><div className="text-xs text-slate-500">{label}</div><div className={`text-sm font-semibold ${positive === true ? "text-emerald-400" : positive === false ? "text-red-400" : "text-white"}`}>{value}</div></div>;
}
