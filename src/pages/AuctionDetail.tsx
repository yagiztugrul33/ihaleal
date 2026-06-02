import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, MapPin, Phone, Mail, Share2, Heart, Flag,
  Home, Building, Layers, CheckCircle2,
  XCircle, AlertTriangle, BarChart3, TrendingUp, TrendingDown, Minus,
  MessageSquare, GitCompare, Navigation, CarFront, Video,
  ExternalLink, Eye, Calculator, Receipt, ShieldCheck, Percent,
  FileText, Scale, Landmark, ShoppingCart, HandCoins, Printer, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FxRef } from "@/components/FxRef";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import { AUCTIONS } from "@/data/auctions";
import {
  PLATFORM_LISTING_CONTACT,
  resolveMarketingMode,
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
import { PdfExportButton } from "@/components/pdf/PdfExportButton";
import { downloadStructuredPdf } from "@/lib/pdf/pdfBuilder";
import { downloadEndeksRaporu } from "@/lib/reports/endeksRaporu";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { useAuctionRealtime } from "@/hooks/useAuctionRealtime";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
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
import { injectJsonLd, removeJsonLd, buildAuctionListingJsonLd } from "@/lib/seoStructuredData";
import { CaymaPolitikasi } from "@/components/legal/CaymaPolitikasi";
import { ListingCoverImage } from "@/components/ListingCoverImage";
import { CinematicPropertyGallery, AIInsightLayer, InvestorTrustStrip, type AIInsight } from "@/components/cinematic";
import { ListingNumberBadge } from "@/components/ListingNumberBadge";
import { ListingSimilarSection } from "@/components/listing/ListingSimilarSection";
import { ListingNearbyPoiSection } from "@/components/listing/ListingNearbyPoiSection";
import { ListingMortgageWidget } from "@/components/listing/ListingMortgageWidget";
import { ListingOfferDialog } from "@/components/offers/ListingOfferDialog";
import { ListingOffersSection } from "@/components/offers/ListingOffersSection";
import { LoadingState, EmptyState } from "@/components/async";
import { SellerTrustCard } from "@/components/trust/SellerTrustCard";
import { ListingReviewDialog } from "@/components/trust/ListingReviewDialog";
import { lazy, Suspense } from "react";
import { resolveListingCoords } from "@/lib/geo/cityCenters";
import { incrementListingView } from "@/lib/listingViewCount";
import { ListingFeaturedBadge } from "@/components/listing/ListingFeaturedBadge";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { landingPathForCity } from "@/data/seoLandings";
import { useListingRatings } from "@/hooks/useListingRatings";
import { RatingSummaryBadge } from "@/components/trust/RatingSummaryBadge";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { AvmEstimateSection } from "@/components/listing/AvmEstimateSection";
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
import { invokeSystemQa } from "@/lib/systemQaClient";
import { Sparkles, Loader2 } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

const ListingDetailMapLazy = lazy(async () => {
  const mod = await import("@/components/maps/ListingMapViews");
  return { default: mod.ListingDetailMap };
});

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const realtime = useAuctionRealtime(id);
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [catalog, setCatalog] = useState(() => getLocalAndStaticAuctions());
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [detailResolving, setDetailResolving] = useState(true);
  useEffect(() => {
    let ok = true;
    setCatalogLoading(true);
    void loadAllAuctionsForSearch()
      .then((rows) => {
        if (ok) setCatalog(rows);
      })
      .finally(() => {
        if (ok) setCatalogLoading(false);
      });
    return () => {
      ok = false;
    };
  }, []);
  // R14 — lansman listing'leri catalog'da olmayabilir (auctions tablosunda satir yok).
  // Listings'ten compose edilmis fallback auction'i state olarak tut.
  const [fallbackAuction, setFallbackAuction] = useState<typeof catalog[number] | null>(null);
  const auction = useMemo(
    () => catalog.find((a) => a.id === id) ?? fallbackAuction,
    [catalog, id, fallbackAuction],
  );
  const catalogRef = useRef(catalog);
  useEffect(() => {
    catalogRef.current = catalog;
  }, [catalog]);
  const marketingMode = auction ? resolveMarketingMode(auction) : "auction";
  const isListingOnly = marketingMode === "listing_only";
  const isSealedOffer = marketingMode === "sealed_offers";
  const isAuctionMode = marketingMode === "auction";
  const listingWithDefaults = useMemo(() => (auction ? withListingDefaults(auction) : null), [auction]);
  const mapCoords = useMemo(() => {
    if (!auction) return null;
    return resolveListingCoords(auction.mapLat, auction.mapLng, auction.city);
  }, [auction]);
  const integritySummaryLines = useMemo(
    () => (listingWithDefaults ? integrityRulesSummaryForAuction(listingWithDefaults) : []),
    [listingWithDefaults],
  );
  const isRent = listingWithDefaults?.dealType === "rent";
  const { t: tt } = useLocale();
  const ld = tt.listingDetail;
  const pricePrimaryLabel =
    marketingMode === "listing_only" ? ld.priceListing : marketingMode === "sealed_offers" ? ld.priceStartingBid : ld.priceCurrentBid;
  const [bidAmount, setBidAmount] = useState("");
  const [showBidDialog, setShowBidDialog] = useState(false);
  // Dalga 2-2: Proxy bid (otomatik teklif) — frontend tercih. Gerçek
  // arka plan otomasyonu için yeni tablo + migration (auction_proxy_bids,
  // RLS, sealed maskeleme uyumu) gerekir → Master'a sorulacak.
  // Şimdilik max tutar localStorage'a yazılır (kullanıcı niyet beyanı),
  // gönderim klasik placeBid akışıyla devam eder.
  const proxyKey = id ? `ihaleal_proxy_max_${id}` : "";
  const [proxyEnabled, setProxyEnabled] = useState<boolean>(false);
  const [proxyMaxAmount, setProxyMaxAmount] = useState<string>("");
  // Dalga 2-3: AI öneri "Bu ihaleye ne vermeli?"
  const [aiBidBusy, setAiBidBusy] = useState(false);
  const [aiBidReply, setAiBidReply] = useState<string | null>(null);
  // Dalga 2-4: Ekspertiz PDF
  const [expertisePdfBusy, setExpertisePdfBusy] = useState(false);
  useEffect(() => {
    if (!proxyKey) return;
    try {
      const raw = localStorage.getItem(proxyKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { enabled?: boolean; max?: string };
        setProxyEnabled(Boolean(parsed.enabled));
        setProxyMaxAmount(parsed.max ?? "");
      }
    } catch {
      /* sessiz */
    }
  }, [proxyKey]);
  useEffect(() => {
    if (!proxyKey) return;
    try {
      if (proxyEnabled || proxyMaxAmount) {
        localStorage.setItem(proxyKey, JSON.stringify({ enabled: proxyEnabled, max: proxyMaxAmount }));
      } else {
        localStorage.removeItem(proxyKey);
      }
    } catch {
      /* sessiz */
    }
  }, [proxyKey, proxyEnabled, proxyMaxAmount]);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addRecent } = useRecentlyViewed();
  const saved = id ? isFavorite(id) : false;

  useEffect(() => {
    if (id) {
      addRecent(id);
    }
  }, [id, addRecent]);

  // FAZ 2c — JSON-LD RealEstateListing (Googlebot rich result)
  useEffect(() => {
    if (!auction || !id) return;
    injectJsonLd(
      `listing-${id}`,
      buildAuctionListingJsonLd({
        id,
        title: auction.title,
        description: auction.description?.slice(0, 500) ?? auction.title,
        city: auction.city,
        district: auction.district,
        priceTRY: auction.currentBid || auction.startingBid || 0,
        image: auction.images?.[0],
        category: auction.category,
      }),
    );
    return () => removeJsonLd(`listing-${id}`);
  }, [id, auction]);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "features" | "location" | "priceHistory" | "ai">("overview");
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [showMarketReportDialog, setShowMarketReportDialog] = useState(false);
  const [showOfficialDocsDialog, setShowOfficialDocsDialog] = useState(false);

  const { user } = useAuth();
  const [dbListingId, setDbListingId] = useState<string | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [dbAuctionPk, setDbAuctionPk] = useState<string | null>(null);

  useEffect(() => {
    const listingId = dbListingId ?? (isAuctionUuid(id ?? "") ? id : null);
    if (listingId) void incrementListingView(listingId);
  }, [id, dbListingId]);
  const [dbReportLoaded, setDbReportLoaded] = useState<PropertyAnalysisReportRecord | null>(null);
  const [buyNowPriceDb, setBuyNowPriceDb] = useState<number | null>(null);
  // R14 PAKET 5 — lansman alanları (listings.is_lansman, project_id, unit_id)
  const [isLansman, setIsLansman] = useState(false);
  const [lansmanProjectId, setLansmanProjectId] = useState<string | null>(null);
  const [lansmanUnitId, setLansmanUnitId] = useState<string | null>(null);
  const [lansmanProjectName, setLansmanProjectName] = useState<string | null>(null);
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
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);

  const offerListingId = dbListingId ?? (isAuctionUuid(id ?? "") ? id ?? "" : "");
  const detailListingIds = useMemo(() => (auction?.id ? [auction.id] : []), [auction]);
  const { ratings: detailListingRatings } = useListingRatings(detailListingIds);

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
      if (!alive) return;
      // R14 PAKET 5 — id ya bir auctions PK (auctioned listing) ya da doğrudan bir listings PK (lansman ilanı)
      const listingId = auc?.listing_id ?? id;
      if (auc?.id) setDbAuctionPk(auc.id);
      setDbListingId(listingId);
      const { data: rep } = await fetchReportForListing(supabase, listingId);
      if (!alive) return;
      if (rep) setDbReportLoaded(rep);
      const { data: listingRow } = await supabase
        .from("listings")
        .select("buy_now_price_try, is_lansman, project_id, unit_id, title, body, start_price_try, seller_id")
        .eq("id", listingId)
        .maybeSingle();
      if (!alive) return;
      if (listingRow?.seller_id) setSellerId(String(listingRow.seller_id));
      if (listingRow?.buy_now_price_try != null) setBuyNowPriceDb(Number(listingRow.buy_now_price_try));
      const lansmanRow = listingRow as
        | {
            is_lansman?: boolean;
            project_id?: string | null;
            unit_id?: string | null;
            title?: string | null;
            body?: unknown;
            start_price_try?: number | string | null;
          }
        | null;

      // R14 fallback: id catalog'da yok ama listings'te bulundu -> minimal auction compose
      const inCatalog = catalogRef.current.some((a) => a.id === id);
      if (!inCatalog && lansmanRow && listingRow) {
        const template = AUCTIONS[0];
        const price = Number(lansmanRow.buy_now_price_try ?? lansmanRow.start_price_try ?? 0) || 0;
        setFallbackAuction({
          ...template,
          id: id!,
          title: lansmanRow.title ?? template.title,
          description:
            (typeof lansmanRow.body === "object" && lansmanRow.body && "description" in lansmanRow.body
              ? String((lansmanRow.body as { description?: string }).description ?? "")
              : "") || template.description,
          currentBid: price,
          startingBid: price,
          buyNowPriceTry: price,
          status: "live",
        });
      }
      if (lansmanRow?.is_lansman) {
        setIsLansman(true);
        if (lansmanRow.project_id) {
          setLansmanProjectId(lansmanRow.project_id);
          // Proje adı için ek fetch (görsel bağ)
          const { data: proj } = await supabase
            .from("developer_projects")
            .select("project_name")
            .eq("id", lansmanRow.project_id)
            .maybeSingle();
          if (alive && proj) {
            setLansmanProjectName((proj as { project_name?: string }).project_name ?? null);
          }
        }
        if (lansmanRow.unit_id) setLansmanUnitId(lansmanRow.unit_id);
      }
    })().finally(() => {
      if (alive) setDetailResolving(false);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id) {
      setDetailResolving(false);
      return;
    }
    if (!catalogLoading && catalog.some((a) => a.id === id)) {
      setDetailResolving(false);
      return;
    }
    if (!isAuctionUuid(id) || !isSupabaseConfigured()) {
      setDetailResolving(false);
    }
  }, [id, catalog, catalogLoading]);

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
    if (catalogLoading || detailResolving) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-24">
          <LoadingState label={ld.loading} />
        </div>
      );
    }
    // ANAYASA: olmayan/silinen ilan → CRASH DEĞİL, görünür h1 + iki CTA.
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-12 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-900/50">
          <Search className="h-8 w-8 text-slate-400" aria-hidden />
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {ld.notFoundTitle}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          {ld.notFoundDesc}
        </p>
        <p className="mt-2 font-mono text-xs text-slate-600">
          ID: {id ?? "—"}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => navigate("/ihaleler")}
            className="bg-gradient-to-r from-blue-500 to-teal-400 text-white"
          >
            {ld.notFoundBackAuctions}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/arama")}
            className="border-white/15 text-slate-200 hover:bg-white/5"
          >
            <Search className="me-2 h-4 w-4" />
            {ld.notFoundSearch}
          </Button>
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
        window.alert(pr.error ?? ld.toastPreAuthRejected);
        return;
      }
      if (pr.riskScore != null && pr.riskScore > 70) {
        window.alert(ld.toastRiskHigh);
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
        toastBid(pr.error ?? ld.toastPreAuthRejected, "error");
        return;
      }
      if (pr.riskScore != null && pr.riskScore > 70) {
        toastBid(ld.toastRiskHigh, "warning");
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
          toastBid(ld.toastBuyNowHoldSaved, "success");
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
        toastBid(ld.toastBuyNowHoldLocal, "info");
      }
      setPreAuthBuyNowOpen(false);
    } finally {
      setPreAuthBusy(false);
    }
  };

  const executeBuyNowConfirm = () => {
    if (!user || effectiveBuyNowTry == null) {
      toastBid(ld.toastLogin, "warning");
      return;
    }
    if (!reportApproved) {
      toastBid(ld.toastApproveReportBuyNow, "warning");
      return;
    }
    if (!depositIdBuyNow) {
      toastBid(ld.toastCompleteHold, "warning");
      return;
    }
    if (!buyNowFinalAck) {
      toastBid(ld.toastCheckBuyNowAck, "warning");
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
                ld.toastWon.replace("{amount}", result.amountTry.toLocaleString("tr-TR")),
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
      ld.toastWonDemo.replace("{amount}", effectiveBuyNowTry.toLocaleString("tr-TR")),
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
      toastBid(ld.toastAuctionEnded, "info");
      return;
    }
    const amount = parsePositiveTryFromInput(bidAmount);
    if (amount == null) {
      toastBid(ld.toastInvalidBid, "error");
      return;
    }
    const minRequired = isListingOnly ? liveBid + 1 : minNextBidTry(liveBid);
    if (amount < minRequired) {
      toastBid(ld.toastMinBid.replace("{amount}", minRequired.toLocaleString("tr-TR")), "warning");
      return;
    }
    if (!user) {
      toastBid(ld.bidLoginRequired, "warning");
      return;
    }
    if (!isListingOnly && bidDisabled) {
      toastBid(ld.toastBidGate, "warning");
      return;
    }
    if (!isListingOnly && !isBidGateComplete(bidGateAck)) {
      toastBid(ld.bidAcceptRequired, "warning");
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
          toastBid(res.message ?? ld.toastDuplicate, "info");
          setShowBidDialog(false);
          setBidAmount("");
          setBidGateAck(initialBidGateAck());
          return;
        }
        toastBid(ld.toastBidSaved.replace("{amount}", amount.toLocaleString("tr-TR")), "success");
        setShowBidDialog(false);
        setBidAmount("");
        setBidGateAck(initialBidGateAck());
      } finally {
        setBidBusy(false);
      }
      return;
    }

    toastBid(ld.toastDemoBid, "info");
    setShowBidDialog(false);
    setBidAmount("");
  };

  const bidIncrements = [10000, 50000, 100000, 250000, 500000];
  const closing = estimateBuyerClosingCosts(liveBid);

  const galleryBadges = [
    { label: auction.status === "live" ? ld.badgeLive : ld.badgeUpcoming, className: `${auction.status === "live" ? "bg-red-500" : "bg-sky-500"} text-white border-0` },
    { label: isRent ? ld.badgeRent : ld.badgeSale, className: "bg-emerald-600/90 text-white border-0" },
    { label: ld.marketingBadge[marketingMode], className: "bg-slate-700 text-white border border-white/15" },
    // R14 PAKET 5 — lansman branding badge
    ...(isLansman
      ? [{ label: ld.badgeLansman, className: "bg-cyan-500 text-slate-950 font-bold border-0" }]
      : []),
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
    <div ref={ref} className="min-h-screen pt-20 pb-28 lg:pb-16">
      <div className="glass-panel sticky top-16 z-40 rounded-none border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {ld.back}</Button>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button variant="ghost" size="sm" onClick={() => id && toggleFavorite(id)} className={`${saved ? "text-pink-400" : "text-slate-400"} hover:text-white`} aria-label={saved ? ld.favoriteRemove : ld.favoriteAdd}><Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} /></Button>
            {id && <ShareButton title={auction?.title || ""} url={`/ilan/${id}`} />}
            {auction && (
              /* CEPHE 1: eski "İlan Özet" 1 sayfa PDF butonu KALDIRILDI.
                 Tek PDF aksiyonu = İhaleal Endeks Raporu (10 bölüm, 4 sayfa,
                 Roboto TR, AI değerlendirme). Eski downloadListingPdf çağrısı
                 başka kullanım yerlerinde duruyor; AuctionDetail'de artık
                 yalnızca derin Endeks Raporu üretilir. */
              <PdfExportButton
                label={ld.pdfReport}
                onExport={() => downloadEndeksRaporu(auction)}
              />
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate(`/karsilastir?ids=${auction.id}`)} className="text-slate-400 hover:text-blue-400" aria-label={ld.compareLabel}><GitCompare className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => window.print()} className="text-slate-400 hover:text-white gap-1" aria-label={ld.printLabel}><Printer className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("location")} className="text-slate-400 hover:text-white gap-1" aria-label={ld.openMap}><MapPin className="w-4 h-4" /></Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/arama?q=${encodeURIComponent(auction.city)}`)}
              className="text-slate-400 hover:text-teal-300 gap-1"
              aria-label="Benzer ara"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <PageBreadcrumbs
          className="mb-4"
          jsonLdId={`listing-bc-${id ?? "detail"}`}
          items={[
            { label: ld.bcHome, href: "/" },
            { label: ld.bcListings, href: "/ilanlar" },
            ...(auction && landingPathForCity(auction.city)
              ? [{ label: auction.city, href: landingPathForCity(auction.city) }]
              : []),
            { label: auction?.title?.slice(0, 48) ?? ld.bcListingFallback },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
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
                <ListingFeaturedBadge isFeatured={auction.isFeatured} badge={auction.featuredBadge} />
                {(auction.viewCount ?? 0) > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-slate-400">
                    <Eye className="w-3.5 h-3.5" aria-hidden />
                    <span dir="ltr">{auction.viewCount!.toLocaleString("tr-TR")}</span> {ld.viewCountSuffix}
                  </span>
                ) : null}
                <RatingSummaryBadge summary={detailListingRatings.get(auction.id)} />
                {/* R14 PAKET 5 — lansman badge */}
                {isLansman && (
                  <Badge className="bg-cyan-500 text-slate-950 font-bold border-0 gap-1">
                    {ld.lansmanUnitBadge}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">{auction.title}</h1>
              <div className="flex flex-wrap items-center gap-2 text-slate-400 mb-4">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{auction.location}</span>
                {landingPathForCity(auction.city) ? (
                  <Link to={landingPathForCity(auction.city)!} className="text-sm text-teal-400 hover:underline">
                    {auction.city} {ld.cityAreaListingsSuffix} <span className="inline-block rtl:rotate-180">→</span>
                  </Link>
                ) : null}
              </div>
              {/* R14 PAKET 5 — Lansman proje bağlantı kartı */}
              {isLansman && lansmanProjectId && (
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30 mb-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-xs text-cyan-100">
                    <p className="font-semibold text-cyan-50 text-sm mb-0.5">{ld.lansmanCardTitle}</p>
                    <p>
                      {ld.lansmanDeveloperLabel} <span className="font-semibold">{lansmanProjectName ?? ld.lansmanProjectFallback}</span>
                      {lansmanUnitId ? ` · ${ld.lansmanUnitPrefix} #${lansmanUnitId.slice(0, 8)}` : ""}
                    </p>
                  </div>
                  <Link to={`/proje/${lansmanProjectId}`} className="shrink-0">
                    <Button size="sm" variant="outline" className="gap-1.5 border-cyan-400/40 text-cyan-100 hover:bg-cyan-500/15">
                      <Eye className="w-3.5 h-3.5" /> {ld.lansmanProjectPage}
                    </Button>
                  </Link>
                </div>
              )}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-200 mb-6 text-xs text-slate-400 leading-relaxed space-y-1.5">
                <p className="font-semibold text-slate-200 text-sm">{ld.weeklyScheduleTitle}</p>
                <p>
                  <span className="text-cyan-200/90">{ld.weeklySlot}</span> {ld.weeklyPolicy}
                </p>
                <p>
                  {ld.participationDocsLabel}{" "}
                  <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/evraklar")}>
                    /evraklar
                  </button>{" "}
                  {ld.participationDocsNote}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <PriceCard label={pricePrimaryLabel} value={`₺${(liveBid / 1000000).toFixed(1)}M`} color="blue" />
                <PriceCard
                  label={ld.estimatedValueTitle}
                  value={`₺${(auction.estimatedValue / 1000000).toFixed(1)}M`}
                  color="emerald"
                  showDemoBadge={isDemoData("aiValuation")}
                />
                <PriceCard
                  label={ld.priceCardAiPredicted}
                  value={`₺${(auction.aiPredictedPrice / 1000000).toFixed(1)}M`}
                  color="sky"
                  showDemoBadge={isDemoData("aiValuation")}
                />
                <PriceCard
                  label={ld.priceCardInvestmentScore}
                  value={`${auction.investmentScore}/100`}
                  color="violet"
                  showDemoBadge={isDemoData("auctionSeed")}
                />
              </div>
              <ListingDocumentFooter auction={auction} />
              <div className="flex flex-wrap gap-2 mb-6">
                <Button type="button" variant="outline" size="sm" className="border-teal-500/35 text-teal-100 gap-2 bg-teal-500/5" onClick={() => setShowMarketReportDialog(true)}>
                  <FileText className="w-4 h-4 shrink-0" /> {ld.marketReportBtn}
                </Button>
                <Button type="button" variant="outline" size="sm" className="border-sky-500/35 text-sky-100 gap-2 bg-sky-500/5" onClick={() => setShowOfficialDocsDialog(true)}>
                  <Landmark className="w-4 h-4 shrink-0" /> {ld.officialDocsBtn}
                </Button>
              </div>
              <div className={`p-4 rounded-xl border mb-6 ${recommendation === "strongBuy" ? "bg-emerald-500/10 border-emerald-500/20" : recommendation === "buy" ? "bg-emerald-500/5 border-emerald-500/10" : recommendation === "hold" ? "bg-amber-500/5 border-amber-500/10" : "bg-red-500/5 border-red-500/10"}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${recommendation === "strongBuy" || recommendation === "buy" ? "bg-emerald-500/20 text-emerald-400" : recommendation === "hold" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                    {recommendation === "strongBuy" || recommendation === "buy" ? <TrendingUp className="w-5 h-5" /> : recommendation === "hold" ? <Minus className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{ld.aiRecoTitle}</div>
                    <div className="text-xs text-slate-400">{recommendation === "strongBuy" ? ld.aiRecoStrongBuy : recommendation === "buy" ? ld.aiRecoBuy : recommendation === "hold" ? ld.aiRecoHold : ld.aiRecoAvoid}</div>
                  </div>
                </div>
              </div>
            </div>

            <AIInsightLayer insights={aiInsights} className="mb-8" />

            <div className={`sticky top-[7.5rem] z-30 bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/80 -mx-4 px-4 transition-all duration-700 delay-200 ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <div className="flex gap-1 overflow-x-auto py-2">
                {[
                  { key: "overview" as const, label: ld.tabOverview, icon: <Home className="w-4 h-4" /> },
                  { key: "details" as const, label: ld.tabDetails, icon: <Building className="w-4 h-4" /> },
                  { key: "features" as const, label: ld.tabFeatures, icon: <CheckCircle2 className="w-4 h-4" /> },
                  { key: "location" as const, label: ld.tabLocation, icon: <MapPin className="w-4 h-4" /> },
                  { key: "priceHistory" as const, label: ld.tabPriceHistory, icon: <TrendingUp className="w-4 h-4" /> },
                  { key: "ai" as const, label: ld.tabAi, icon: <BarChart3 className="w-4 h-4" />, mandatory: true },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-slate-500 hover:text-slate-900 hover:bg-white/5"}`}>{tab.icon} {tab.label}{tab.mandatory ? <Badge className="bg-emerald-600/90 text-white border-0 text-[10px] px-1.5 py-0">{ld.tabMandatory}</Badge> : null}</button>
                ))}
              </div>
            </div>

            <div className="min-h-[300px]">
              {activeTab === "overview" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                    <h3 className="text-sm font-semibold text-amber-200 mb-2">{ld.ovProfRules}</h3>
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                      {integritySummaryLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                  <AvmEstimateSection
                    city={auction.city}
                    district={auction.district}
                    areaM2={auction.propertyDetails?.netSqm ?? auction.propertyDetails?.grossSqm ?? 100}
                    listingPrice={auction.currentBid}
                  />
                  {(auction.commitmentFloorTRY != null && auction.commitmentCeilingTRY != null) || auction.bindingCommitmentAccepted ? (
                    <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/25">
                      <div className="flex items-center gap-2 text-amber-100 mb-2">
                        <Scale className="w-5 h-5" />
                        <span className="text-sm font-semibold">{ld.ovCommitmentTitle}</span>
                      </div>
                      {auction.commitmentFloorTRY != null && auction.commitmentCeilingTRY != null ? (
                        <p className="text-xs text-slate-300">
                          {ld.ovCommitmentFloor} <strong className="text-white" dir="ltr">₺{auction.commitmentFloorTRY.toLocaleString("tr-TR")}</strong>
                          {" · "}
                          {ld.ovCommitmentCeiling} <strong className="text-white" dir="ltr">₺{auction.commitmentCeilingTRY.toLocaleString("tr-TR")}</strong>
                          {" "}
                          {ld.ovCommitmentNote}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">{ld.ovCommitmentPending}</p>
                      )}
                    </div>
                  ) : null}
                  {auction.expertiseRequired || auction.expertisePdfName ? (
                    <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5">
                      <div className="text-sm font-semibold text-emerald-100 mb-1">{ld.ovExpertiseTitle}</div>
                      <p className="text-xs text-slate-400">
                        {auction.expertiseRequired ? ld.ovExpertiseRequiredNote : ""}
                        {auction.expertisePdfName ? (
                          <span>{ld.ovExpertiseFileLabel} <code className="text-emerald-300/90" dir="ltr">{auction.expertisePdfName}</code></span>
                        ) : (
                          <span>{ld.ovExpertiseFileNote}</span>
                        )}
                      </p>
                    </div>
                  ) : null}
                  <div><h3 className="text-lg font-bold text-white mb-3">{ld.ovDescriptionTitle}</h3><p className="text-slate-400 leading-relaxed whitespace-pre-line">{auction.description}</p></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <DetailItem icon={<Building className="w-5 h-5" />} label={ld.ovDetailRoom} value={auction.propertyDetails.roomCount} />
                    <DetailItem icon={<Layers className="w-5 h-5" />} label={ld.ovDetailNetSqm} value={`${auction.propertyDetails.netSqm} m²`} />
                    <DetailItem icon={<Layers className="w-5 h-5" />} label={ld.ovDetailFloor} value={auction.propertyDetails.floor} />
                    <DetailItem icon={<Building className="w-5 h-5" />} label={ld.ovDetailBuildingAge} value={auction.propertyDetails.buildingAge} />
                  </div>
                  {auction.virtualTour && (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-sm font-semibold text-white">{ld.ovVirtualTourTitle}</div>
                          <div className="text-xs text-slate-400">{ld.ovVirtualTourDesc}</div>
                        </div>
                        <Button size="sm" onClick={() => setShowVirtualTour(true)} className="ms-auto bg-gradient-to-r from-blue-500 to-teal-400 text-white">{ld.ovVirtualTourStart}</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "details" && (
                <div className="grid sm:grid-cols-2 gap-3 animate-fade-in">
                  {[
                    { label: ld.detRoomLiving, value: auction.propertyDetails.roomCount },
                    { label: ld.detGrossSqm, value: `${auction.propertyDetails.grossSqm} m²` },
                    { label: ld.detNetSqm, value: `${auction.propertyDetails.netSqm} m²` },
                    { label: ld.detCurrentFloor, value: auction.propertyDetails.floor },
                    { label: ld.detTotalFloors, value: `${auction.propertyDetails.totalFloors}` },
                    { label: ld.detBuildingAge, value: `${auction.propertyDetails.buildingAge} ${ld.detBuildingAgeUnit}` },
                    { label: ld.detHeating, value: auction.propertyDetails.heating },
                    { label: ld.detFacade, value: auction.propertyDetails.facade },
                    { label: ld.detBathroom, value: `${auction.propertyDetails.bathroom}` },
                    { label: ld.detBalcony, value: auction.propertyDetails.balcony ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
                    { label: ld.detElevator, value: auction.propertyDetails.elevator ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
                    { label: ld.detParking, value: auction.propertyDetails.parking ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
                    { label: ld.detFurnished, value: auction.propertyDetails.furnished ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
                    { label: ld.detUsage, value: auction.propertyDetails.usingStatus },
                    { label: ld.detDeedStatus, value: auction.propertyDetails.deedStatus },
                    { label: ld.detEligibility, value: auction.propertyDetails.eligibility },
                  ].map((item) => (
                    <div key={item.label as string} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-slate-200/80"><span className="text-sm text-slate-500">{item.label}</span><span className="text-sm font-medium text-white">{item.value}</span></div>
                  ))}
                </div>
              )}
              {activeTab === "features" && (
                <div className="animate-fade-in">
                  <div className="flex flex-wrap gap-2">
                    {auction.features.map((f) => <Badge key={f} variant="outline" className="border-slate-200 text-slate-300 px-3 py-1.5 text-sm"><CheckCircle2 className="w-3.5 h-3.5 me-1.5 text-emerald-400" /> {f}</Badge>)}
                  </div>
                </div>
              )}
              {activeTab === "location" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">{ld.locNearby}</h3>
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
                            <div><div className="text-sm font-medium text-white">{f.name}</div><div className="text-xs text-slate-500"><span dir="ltr">{f.distance}m</span> {ld.locDistanceSuffix}</div></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    {mapCoords ? (
                      <>
                        <Suspense fallback={<LoadingState compact label={ld.locMapLoading} />}>
                          <ListingDetailMapLazy
                            lat={mapCoords.lat}
                            lng={mapCoords.lng}
                            title={auction.title}
                            subtitle={auction.location}
                          />
                        </Suspense>
                        {mapCoords.fromFallback ? (
                          <p className="mt-2 text-[11px] text-slate-500">
                            {ld.locMapFallbackNote.replace("{city}", auction.city)}
                          </p>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                  {mapCoords ? (
                    <ListingNearbyPoiSection
                      lat={mapCoords.lat}
                      lng={mapCoords.lng}
                      district={auction.district}
                      city={auction.city}
                    />
                  ) : null}
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
                        <div className="text-end"><div className="text-sm font-medium text-white">₺{p.price.toLocaleString("tr-TR")}</div><div className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString("tr-TR")}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "ai" && resolvedReport && (
                <div className="space-y-8 animate-fade-in">
                  {/* R13.4 Pantsir — İstihbarat Paneli (mock veri, R13.2'de OSM API'ye geçiş) */}
                  {id ? <PantsirPanel listingId={id} lat={mapCoords?.lat} lng={mapCoords?.lng} /> : null}
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
                      {ld.aiGateNote}
                    </p>
                  ) : null}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={12} />
                          <PolarRadiusAxis stroke="#52525b" fontSize={10} />
                          <Radar name={ld.aiRadarScore} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white">{ld.aiCommentTitle}</h3>
                      <div className={`p-4 rounded-xl border ${isUnderpriced ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {isUnderpriced
                            ? ld.aiCommentUnder
                                .replace("{pct}", String(Math.abs(Number(priceDiffPercent))))
                                .replace("{location}", auction.location)
                                .replace("{avgSqm}", auction.areaStats.avgPricePerSqm.toLocaleString("tr-TR"))
                                .replace("{sqm}", auction.pricePerSqm.toLocaleString("tr-TR"))
                            : ld.aiCommentFair.replace("{demand}", String(auction.areaStats.demandIndex))}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <AIBadge label={ld.priceCardInvestmentScore} value={`${auction.investmentScore}/100`} color={auction.investmentScore >= 80 ? "emerald" : auction.investmentScore >= 60 ? "blue" : "slate"} />
                        <AIBadge label={ld.aiBadgeRentalYield} value={`%${auction.areaStats.rentalYield}`} color="sky" />
                        <AIBadge label={ld.aiBadgeDemandIndex} value={`${auction.areaStats.demandIndex}/100`} color="violet" />
                        <AIBadge label={ld.aiBadgeYearlyGrowth} value={`%${auction.areaStats.priceChangeYearly}`} color="amber" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">{ld.aiRegionStatsTitle} — {auction.district}</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <StatBadge label={ld.statAvgSqmPrice} value={`₺${auction.areaStats.avgPricePerSqm.toLocaleString("tr-TR")}`} />
                      <StatBadge label={ld.statMonthlyChange} value={`%${auction.areaStats.priceChangeMonthly}`} positive={auction.areaStats.priceChangeMonthly > 0} />
                      <StatBadge label={ld.statYearlyChange} value={`%${auction.areaStats.priceChangeYearly}`} positive={auction.areaStats.priceChangeYearly > 0} />
                      <StatBadge label={ld.statAvgDaysOnMarket} value={`${auction.areaStats.avgDaysOnMarket} ${ld.statDaysUnit}`} />
                      <StatBadge label={ld.activeListing} value={`${auction.areaStats.supplyCount}`} />
                      <StatBadge label={ld.aiBadgeRentalYield} value={`%${auction.areaStats.rentalYield}`} />
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
                  <div className="text-3xl font-bold text-blue-400" dir="ltr">₺{liveBid.toLocaleString("tr-TR")}</div>
                  <FxRef amountTry={liveBid} variant="block" note={ld.fxNoteTransaction} />
                  <div className="text-xs text-slate-500 mt-1" dir="ltr">
                    ₺{auction.pricePerSqm.toLocaleString("tr-TR")} / m²
                    <FxRef amountTry={auction.pricePerSqm} variant="compact" />
                  </div>
                  {/* AI değerleme referansı — Auction.estimatedValue VAR (veri kanıtlı) */}
                  {auction.estimatedValue > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-700">
                      <div className="text-[11px] text-slate-500">{ld.estimatedValueTitle}</div>
                      <div className="text-sm font-semibold text-emerald-400" dir="ltr">
                        ₺{auction.estimatedValue.toLocaleString("tr-TR")}
                        <FxRef amountTry={auction.estimatedValue} variant="compact" />
                      </div>
                      {liveBid > 0 && (
                        <div className={`text-[11px] mt-0.5 ${liveBid < auction.estimatedValue ? "text-emerald-500" : "text-amber-500"}`}>
                          {liveBid < auction.estimatedValue
                            ? ld.estValueBelowText.replace("{pct}", String(Math.round((1 - liveBid / auction.estimatedValue) * 100)))
                            : ld.estValueAboveText.replace("{pct}", String(Math.round((liveBid / auction.estimatedValue - 1) * 100)))}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Doğrulama rozeti — SADECE auction.verified=true ise (sahte gösterim YASAK) */}
                  {auction.verified === true && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {ld.verifiedListing}
                    </div>
                  )}
                </div>
                {/* Dalga 2-1: ihale geri sayım — sadece auction/sealed modlarında, listing_only'de göstermeye gerek yok. */}
                {!isListingOnly && auction.endDate ? (
                  <CountdownTimer
                    endDate={auction.endDate}
                    status={auction.status}
                    size="md"
                    layout="wide"
                  />
                ) : null}

                {/* Dalga 2-3: AI öneri — "Bu ihaleye ne vermeli?" */}
                {!isListingOnly ? (
                  <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-3" data-testid="ai-bid-suggestion">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-violet-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> {ld.aiSuggestTitle}
                      </h4>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={aiBidBusy}
                        onClick={async () => {
                          if (aiBidBusy) return;
                          setAiBidBusy(true);
                          setAiBidReply(null);
                          const prompt =
                            `Bir kullanıcı şu ihaleyi takip ediyor: "${auction.title.slice(0, 80)}" ` +
                            `(${auction.district}, ${auction.city}, ${auction.category}, ` +
                            `${auction.propertyDetails?.grossSqm ?? "?"} m²). ` +
                            `Güncel teklif ₺${liveBid.toLocaleString("tr-TR")}, ` +
                            `AI tahmini fiyat ₺${auction.aiPredictedPrice.toLocaleString("tr-TR")}, ` +
                            `birim fiyat ₺${auction.pricePerSqm.toLocaleString("tr-TR")}/m², ` +
                            `bölge ortalama ₺${(auction.areaStats?.avgPricePerSqm ?? 0).toLocaleString("tr-TR")}/m², ` +
                            `kira getirisi %${auction.areaStats?.rentalYield ?? 0}, ` +
                            `talep endeksi ${auction.areaStats?.demandIndex ?? 0}/100. ` +
                            `3 cümlede: (1) önerilen makul teklif aralığı (₺X-Y), ` +
                            `(2) bu öneri neye dayanır (bölge/m²/emsal), ` +
                            `(3) bu ihalede dikkat edilmesi gereken risk noktası. ` +
                            `Yatırım tavsiyesi değil; bilgilendirme amaçlı.`;
                          const res = await invokeSystemQa([{ role: "user", content: prompt }]);
                          if (res.ok) {
                            setAiBidReply(res.text.slice(0, 700));
                          } else {
                            setAiBidReply(ld.aiSuggestError);
                          }
                          setAiBidBusy(false);
                        }}
                        className="h-7 px-2 text-[11px] gap-1 border-violet-400/40 text-violet-100 hover:bg-violet-500/10"
                      >
                        {aiBidBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {aiBidBusy ? ld.aiSuggestThinking : aiBidReply ? ld.aiSuggestRetry : ld.aiSuggestGet}
                      </Button>
                    </div>
                    {aiBidReply ? (
                      <div className="rounded-md border border-violet-400/25 bg-violet-500/5 px-2.5 py-2 text-[11px] text-violet-100 leading-relaxed whitespace-pre-line" data-testid="ai-bid-reply">
                        {aiBidReply}
                      </div>
                    ) : (
                      <p className="text-[11px] text-violet-200/70 leading-snug">
                        {ld.aiSuggestPlaceholder}
                      </p>
                    )}
                  </div>
                ) : null}

                {/* Dalga 2-4: Ekspertiz Raporu PDF */}
                <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-3" data-testid="expertise-pdf">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> {ld.expPanelTitle}
                    </h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={expertisePdfBusy}
                      onClick={async () => {
                        if (expertisePdfBusy) return;
                        setExpertisePdfBusy(true);
                        try {
                          const p = auction.propertyDetails;
                          const a = auction.areaStats;
                          await downloadStructuredPdf({
                            title: "İhaleal Ekspertiz Özet Raporu",
                            subtitle: `${auction.title} · ${auction.district}, ${auction.city}`,
                            filename: `ihaleal-ekspertiz-${getListingNumber(auction).replace(/[^a-z0-9]/gi, "-")}.pdf`,
                            disclaimer:
                              "Bu rapor algoritmik özet üretir; SPK lisanslı resmi ekspertiz raporu değildir. " +
                              "Banka kredisi veya yasal işlemler için lisanslı eksper raporu gereklidir. " +
                              "Yatırım tavsiyesi değildir.",
                            sections: [
                              {
                                heading: "Mülk Tanımı",
                                lines: [
                                  `Başlık: ${auction.title}`,
                                  `Konum: ${auction.district}, ${auction.city}`,
                                  `Kategori: ${auction.category}`,
                                  `Brüt / Net m²: ${p?.grossSqm ?? "—"} / ${p?.netSqm ?? "—"} m²`,
                                  `Oda dağılımı: ${p?.roomCount ?? "—"}`,
                                  `Kat / Toplam: ${p?.floor ?? "—"} / ${p?.totalFloors ?? "—"}`,
                                  `Bina yaşı: ${p?.buildingAge ?? "—"}`,
                                  `Isıtma: ${p?.heating ?? "—"}`,
                                  `Tapu durumu: ${p?.deedStatus ?? "—"}`,
                                  `Krediye uygunluk: ${p?.eligibility ?? "—"}`,
                                ],
                              },
                              {
                                heading: "Fiyat ve Değerleme",
                                lines: [
                                  `Güncel teklif / liste: ₺${liveBid.toLocaleString("tr-TR")}`,
                                  `AI tahmini değer: ₺${auction.aiPredictedPrice.toLocaleString("tr-TR")}`,
                                  `Birim fiyat: ₺${auction.pricePerSqm.toLocaleString("tr-TR")} / m²`,
                                  `Tahmini değer (referans): ₺${auction.estimatedValue.toLocaleString("tr-TR")}`,
                                  `Yatırım skoru: ${auction.investmentScore}/100`,
                                ],
                              },
                              {
                                heading: "Bölge Analizi",
                                lines: a
                                  ? [
                                      `Bölge ortalama m² fiyatı: ₺${a.avgPricePerSqm.toLocaleString("tr-TR")}`,
                                      `Aylık değişim: %${a.priceChangeMonthly.toFixed(1)}`,
                                      `Yıllık değişim: %${a.priceChangeYearly.toFixed(1)}`,
                                      `Kira getirisi: %${a.rentalYield.toFixed(1)}`,
                                      `Talep endeksi: ${a.demandIndex}/100`,
                                      `Ortalama satış süresi: ${a.avgDaysOnMarket} gün`,
                                    ]
                                  : ["Bölge verisi mevcut değil."],
                              },
                              {
                                heading: ld.tabFeatures,
                                lines:
                                  auction.features?.length > 0
                                    ? auction.features.map((f) => `• ${f}`)
                                    : [ld.featuresListMissing],
                              },
                              ...(auction.nearbyFacilities && auction.nearbyFacilities.length > 0
                                ? [
                                    {
                                      heading: "Çevre Olanakları",
                                      lines: auction.nearbyFacilities.map(
                                        (f) => `• ${f.name} (${f.type}) — ${f.distance} m`,
                                      ),
                                    },
                                  ]
                                : []),
                            ],
                          });
                        } finally {
                          setExpertisePdfBusy(false);
                        }
                      }}
                      className="h-7 px-2 text-[11px] gap-1 border-cyan-400/40 text-cyan-100 hover:bg-cyan-500/10"
                    >
                      {expertisePdfBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                      {expertisePdfBusy ? ld.expPanelPreparing : ld.expPanelDownload}
                    </Button>
                  </div>
                  <p className="text-[11px] text-cyan-200/70 leading-snug">
                    {ld.expPanelDesc}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-slate-200/80">
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">{ld.priceCardAiPredicted}</span><span className="text-blue-400 font-semibold" dir="ltr">₺{auction.aiPredictedPrice.toLocaleString("tr-TR")}</span></div>
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
                            ? ld.loginRequired
                            : !reportApproved
                              ? ld.reportApproval
                              : !depositId
                                ? ld.depositRequired
                                : ""
                          : ""
                      }
                      onClick={() => {
                        setBidAmount((liveBid + 50000).toString());
                        setShowBidDialog(true);
                      }}
                    >
                      <TrendingUp className="w-4 h-4 me-1.5" /> {isSealedOffer ? ld.ctaSealedBid : ld.ctaBid}
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="flex-1 min-w-[8rem] bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-bold h-11"
                        type="button"
                        disabled={!user || (sellerId != null && user?.id === sellerId)}
                        title={!user ? ld.loginRequired : sellerId && user?.id === sellerId ? ld.cantBidOwn : undefined}
                        onClick={() => {
                          if (!user) {
                            toastBid(ld.toastLogin, "warning");
                            return;
                          }
                          setOfferDialogOpen(true);
                        }}
                      >
                        <HandCoins className="w-4 h-4 me-1.5" /> {ld.ctaNegotiate}
                      </Button>
                      <Button className="flex-1 bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white font-bold h-11" type="button" onClick={() => { navigate("/"); window.setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100); }}>
                        {ld.ctaInfoRequest}
                      </Button>
                    </>
                  )}
                  {!isListingOnly && auction.dealType !== "rent" && effectiveBuyNowTry != null ? (
                    <Button
                      variant="outline"
                      className="border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/10 h-11 px-3 shrink-0"
                      disabled={buyNowDisabled}
                      title={
                        buyNowDisabled
                          ? !user
                            ? ld.loginRequired
                            : !reportApproved
                              ? ld.reportApproval
                              : !depositIdBuyNow
                                ? ld.tooltipBuyNowGate
                                : ""
                          : !buyNowPriceDb
                            ? ld.tooltipBuyNowMock
                            : ""
                      }
                      onClick={() => {
                        if (!user) {
                          toastBid(ld.toastLogin, "warning");
                          return;
                        }
                        if (!reportApproved) {
                          toastBid(ld.toastApproveReportBuyNow, "warning");
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
                      <span dir="ltr">{ld.ctaBuyNow} ₺{(effectiveBuyNowTry / 1e6).toFixed(2)}M</span>
                    </Button>
                  ) : null}
                  {!isListingOnly && user && reportApproved && !depositId ? (
                    <Button type="button" variant="secondary" className="h-11 px-3 bg-white/10 text-white shrink-0" onClick={() => setPreAuthOpen(true)}>
                      {ld.depositDemo}
                    </Button>
                  ) : null}
                  {!isListingOnly && auction.dealType !== "rent" ? (
                    <Button variant="outline" className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-11 px-3 shrink-0" onClick={() => navigate("/mortgage")} title={ld.tooltipCalcMortgage}>
                      <Calculator className="w-4 h-4" />
                    </Button>
                  ) : null}
                  <Button variant="outline" className="border-slate-200 text-slate-300 hover:text-white h-11 px-3" type="button" onClick={() => navigate(`/mesajlar?listing=${encodeURIComponent(auction.id)}&title=${encodeURIComponent(auction.title)}`)} title={ld.tooltipMessage}><MessageSquare className="w-4 h-4" /></Button>
                </div>
                <div className="pt-4 border-t border-slate-200/80 space-y-3">
                  <SellerTrustCard sellerId={sellerId} listingId={auction.id} listingTitle={auction.title} />
                  {auction.status === "ended" && sellerId && user?.id && user.id !== sellerId ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
                      onClick={() => setReviewOpen(true)}
                    >
                      {ld.evaluateSeller}
                    </Button>
                  ) : null}
                  <Button variant="outline" className="w-full border-slate-200 text-slate-300 hover:text-white gap-2 h-10" type="button" onClick={() => window.open("mailto:destek@ihaleal.com?subject=İlan%20talebi%20" + encodeURIComponent(auction.id), "_blank")}>
                    <Mail className="w-4 h-4" /> {ld.supportEmail}
                  </Button>
                  {!isRent ? (
                    <ListingMortgageWidget priceTry={liveBid} className="mt-1" />
                  ) : null}
                  {sellerId && user?.id === sellerId && offerListingId ? (
                    <ListingOffersSection listingId={offerListingId} className="pt-3 border-t border-slate-200/80" />
                  ) : null}
                </div>
                <div className="pt-4 border-t border-slate-200/80">
                  <button onClick={() => navigate("/ekspertiz")} className="w-full text-start p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors group">
                    <div className="flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4 text-blue-400" /><span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{ld.expertOpinion}</span></div>
                    <p className="text-xs text-slate-500">{ld.expertOpinionDesc}</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-slate-900/50 border-slate-200/80 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="w-4 h-4 text-teal-400" />
                  <h4 className="text-sm font-semibold text-white">{ld.commissionTitle}</h4>
                  <Badge variant="outline" className="border-teal-500/20 text-teal-400 text-[10px] ms-auto">{feeBadgeLabel()}</Badge>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-slate-200/80 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{isListingOnly ? ld.commissionRefListing : ld.commissionRefAuction}</span>
                    </div>
                    <div className="text-lg font-bold text-white" dir="ltr">₺{liveBid.toLocaleString("tr-TR")}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">{ld.commissionPlatformBuyer}</span><span className="text-slate-300 font-medium" dir="ltr">₺{closing.commission.toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">{ld.commissionVat}</span><span className="text-slate-300 font-medium" dir="ltr">₺{closing.vatOnCommission.toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">{ld.commissionDeedDuty} (%{(DEED_DUTY_RATE * 100).toFixed(0)})</span><span className="text-slate-300 font-medium" dir="ltr">₺{closing.deed.toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">{ld.commissionRevolvingCapital}</span><span className="text-slate-300 font-medium" dir="ltr">₺{closing.fixed.toLocaleString("tr-TR")}</span></div>
                    <div className="border-t border-slate-200/80 pt-2 flex justify-between font-semibold"><span className="text-teal-400">{ld.commissionTotal}</span><span className="text-teal-400" dir="ltr">₺{closing.total.toLocaleString("tr-TR")}</span></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed px-0.5">{FEE_TEXTS.commissionMatrahLine()}</p>
                <button onClick={() => navigate("/ihale-kosullari")} className="text-xs text-slate-500 hover:text-teal-400 transition-colors flex items-center gap-1"><Percent className="w-3 h-3" /> {ld.commissionDetailLink}</button>
              </CardContent>
            </Card>

            <InvestorTrustStrip className="mb-6" />

            <Card className={`bg-slate-900/50 border-slate-200/80 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  <h4 className="text-sm font-semibold text-white">{ld.securityTitle}</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {ld.secIdentity}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {ld.secFindeks}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {ld.sec2fa}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {ld.secBankApi}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {ld.secAmlKyc}</div>
                </div>
                <p className="text-[10px] text-slate-500 mt-3">{ld.secLawNote}</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <ListingSimilarSection
          currentId={auction.id}
          catalog={catalog}
          city={auction.city}
          district={auction.district}
          category={auction.category}
          priceTry={auction.currentBid || auction.startingBid}
        />
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
            <DialogTitle className="text-xl font-bold">{isSealedOffer ? ld.ctaSealedBid : isAuctionMode ? ld.ctaBid : ld.ctaNegotiate}</DialogTitle>
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
              <p className="text-xs text-slate-400 mb-1">{ld.bidCostTitle}</p>
              <p className="text-sm font-bold text-teal-400" dir="ltr">₺{estimateBuyerClosingCosts(liveBid).total.toLocaleString("tr-TR")}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                {ld.bidCostNote.replace("{pct}", (DEED_DUTY_RATE * 100).toFixed(0))}
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
                {ld.bidAmountLabel}
              </label>
              <Input
                id="bid-amount-input"
                inputMode="numeric"
                dir="ltr"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="bg-slate-950 border-slate-200 text-white focus:ring-blue-500"
                placeholder={ld.bidAmountPlaceholder}
              />
            </div>

            {/* Dalga 2-2: Proxy bid (otomatik artırma) — frontend UI.
                Backend (otomatik tetikleme + sealed maskeleme uyumu) ayrı tur. */}
            {!isListingOnly && isAuctionMode ? (
              <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 p-3" data-testid="proxy-bid-panel">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-violet-100 flex items-center gap-2">
                      <span className="text-base">⚡</span> {ld.proxyTitle}
                    </p>
                    <p className="text-[10px] text-violet-200/70 mt-0.5">
                      {ld.proxyDesc}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={proxyEnabled}
                    onChange={(e) => setProxyEnabled(e.target.checked)}
                    className="h-5 w-5 accent-violet-500 flex-shrink-0"
                    aria-label={ld.proxyEnableAria}
                  />
                </label>
                {proxyEnabled ? (
                  <div className="mt-3 space-y-2">
                    <label className="text-xs text-violet-200/90" htmlFor="proxy-max-input">
                      {ld.proxyMaxLabel}
                    </label>
                    <Input
                      id="proxy-max-input"
                      inputMode="numeric"
                      dir="ltr"
                      value={proxyMaxAmount}
                      onChange={(e) => setProxyMaxAmount(e.target.value)}
                      placeholder={`${ld.proxyMaxPlaceholderPrefix} ${(liveBid * 1.5 / 1_000_000).toFixed(1)}M`}
                      className="bg-slate-950 border-violet-500/30 text-white focus:ring-violet-500"
                    />
                    <p className="text-[10px] text-amber-200/85 leading-snug rounded-md border border-amber-500/25 bg-amber-500/5 px-2 py-1.5">
                      {ld.proxyDemoNote}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!isListingOnly ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-black/20 p-3">
                <p className="text-xs font-semibold text-white">{ld.bidGateTitle}</p>
                <div className="space-y-3">
                  {BID_GATE_CHECKBOXES.map((row) => (
                    <label key={row.id} className="flex gap-3 text-start text-[11px] text-slate-300 leading-snug cursor-pointer">
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
              {ld.cancel}
            </Button>
            <Button
              type="button"
              disabled={bidBusy || (!isListingOnly && !isBidGateComplete(bidGateAck))}
              title={!isListingOnly && !isBidGateComplete(bidGateAck) ? ld.bidGateTooltip : undefined}
              onClick={() => void handleBid()}
              className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold disabled:opacity-40"
            >
              {bidBusy ? ld.ctaBidSubmitting : isSealedOffer ? ld.ctaSealedSubmit : ld.ctaBidSubmit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {sellerId && id ? (
        <ListingReviewDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          listingId={dbListingId ?? id}
          reviewedId={sellerId}
        />
      ) : null}

      {offerListingId && auction ? (
        <ListingOfferDialog
          open={offerDialogOpen}
          onOpenChange={setOfferDialogOpen}
          listingId={offerListingId}
          listingTitle={auction.title}
          referencePrice={liveBid}
          onSubmitted={() => toastBid(ld.toastOfferSubmitted, "success")}
        />
      ) : null}

      <Dialog open={showMarketReportDialog} onOpenChange={setShowMarketReportDialog}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" /> {ld.mrTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-400">
            <p>
              {ld.mrBody}
            </p>
            {auction.marketReportPdfName ? (
              <p className="text-xs">
                {ld.mrFileLabel} <code className="text-teal-300/90" dir="ltr">{auction.marketReportPdfName}</code>
              </p>
            ) : (
              <p className="text-xs text-slate-500">{ld.mrNoFile}</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="border-white/15 text-slate-200" onClick={() => navigate("/veri-ve-endeks")}>
              {ld.mrGotoAnalysis}
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-teal-400 text-white" onClick={() => setShowMarketReportDialog(false)}>{ld.close}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showOfficialDocsDialog} onOpenChange={setShowOfficialDocsDialog}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-sky-400" /> {ld.odTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-400">
            <p>
              {ld.odBody}
            </p>
            {auction.officialDocumentsForBuyer ? (
              <p className="text-xs text-emerald-300/90">{ld.odDeclYes}</p>
            ) : (
              <p className="text-xs text-amber-200/80">{ld.odDeclNo}</p>
            )}
            <ul className="text-xs list-disc list-inside text-slate-500 space-y-1">
              <li>{ld.odItem1}</li>
              <li>{ld.odItem2}</li>
              <li>{ld.odItem3}</li>
            </ul>
          </div>
          <DialogFooter>
            <Button className="bg-gradient-to-r from-blue-500 to-teal-400 text-white" onClick={() => setShowOfficialDocsDialog(false)}>{ld.understood}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={preAuthOpen} onOpenChange={setPreAuthOpen}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{ld.paTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-300">
            <p dir="ltr" className="text-start">
              {ld.paAmountNote
                .replace("{amount}", calcBidBond(liveBid).toLocaleString("tr-TR"))
                .replace("{base}", liveBid.toLocaleString("tr-TR"))
                .replace("{pct}", String(Math.round(BID_BOND_RATE * 100)))}
            </p>
            <p>{ld.paWinNote}</p>
            <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5">
              {ld.paDemoNote}
            </p>
            {/* FAZ 3 — cayma/iade şartı (bağlayıcı legal): avukat onayı normumuz, çevrilmedi */}
            <p>Cayarsanız yaklaşık %10 kesinti ve kalanın iadesi hedeflenir — detay için cayma politikası.</p>
            <div>
              <label className="text-xs text-slate-500 block mb-1">{ld.cardTokenLabel}</label>
              <Input value={cardToken} onChange={(e) => setCardToken(e.target.value)} className="bg-slate-950 border-slate-200 text-white" placeholder={ld.cardTokenPlaceholder} dir="ltr" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => setPreAuthOpen(false)}>
              {ld.cancel}
            </Button>
            <Button type="button" className="bg-gradient-to-r from-blue-500 to-teal-400 text-white" disabled={preAuthBusy} onClick={() => void runPreAuth()}>
              {preAuthBusy ? ld.processing : ld.paConfirm}
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
              <p className="text-xs font-semibold text-cyan-200">{ld.hgCardSection}</p>
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
              {ld.cancel}
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
              {ld.hgContinue}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={preAuthBuyNowOpen} onOpenChange={setPreAuthBuyNowOpen}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{ld.pabTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-300">
            {effectiveBuyNowTry != null ? (
              <p dir="ltr" className="text-start">
                {ld.pabAmountNote.replace("{amount}", effectiveBuyNowTry.toLocaleString("tr-TR"))}
              </p>
            ) : null}
            <p dir="ltr" className="text-start">
              {ld.pabHoldNote
                .replace("{amount}", calcBidBond(effectiveBuyNowTry ?? 0).toLocaleString("tr-TR"))
                .replace("{pct}", String(Math.round(BID_BOND_RATE * 100)))}
            </p>
            <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5">
              {ld.pabDemoNote}
            </p>
            <div>
              <label className="text-xs text-slate-500 block mb-1">{ld.cardTokenLabel}</label>
              <Input value={cardToken} onChange={(e) => setCardToken(e.target.value)} className="bg-slate-950 border-slate-200 text-white" placeholder={ld.cardTokenPlaceholder} dir="ltr" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => setPreAuthBuyNowOpen(false)}>
              {ld.cancel}
            </Button>
            <Button type="button" className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white" disabled={preAuthBusy} onClick={() => void runPreAuthBuyNow()}>
              {preAuthBusy ? ld.processing : ld.pabStart}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBuyNowConfirm} onOpenChange={setShowBuyNowConfirm}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{ld.bncTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-300">
            <p dir="ltr" className="text-start">
              {ld.bncAmount.replace("{amount}", (effectiveBuyNowTry ?? 0).toLocaleString("tr-TR"))}
            </p>
            <p className="text-xs text-slate-400" dir="ltr">
              {ld.bncCommNote.replace("{amount}", estimateBuyerClosingCosts(effectiveBuyNowTry ?? liveBid).total.toLocaleString("tr-TR"))}
            </p>
            {/* FAZ 3 — bağlayıcı yasal onay (MESAFELİ/MASAK/MODULE3): avukat onayı normumuz, çevrilmedi */}
            <label className="flex items-start gap-2 cursor-pointer text-xs">
              <Checkbox checked={buyNowFinalAck} onCheckedChange={(c) => setBuyNowFinalAck(c === true)} className="mt-0.5" />
              <span>MESAFELI SATIS, ihale kosullari, MASAK/KYC ve MODULE3 Hemen Al yukumluluklerini tekrar onayliyorum.</span>
            </label>
          </div>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => setShowBuyNowConfirm(false)}>
              {ld.cancel}
            </Button>
            <Button
              type="button"
              className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white"
              disabled={!buyNowFinalAck || buyNowBusy}
              onClick={() => executeBuyNowConfirm()}
            >
              {buyNowBusy ? ld.bncSaving : ld.bncClose}
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
          <DialogHeader><DialogTitle className="text-xl font-bold">{ld.ovVirtualTourTitle}</DialogTitle></DialogHeader>
          <div className="aspect-video rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">{ld.vtIntegrationTitle}</p>
              <p className="text-sm text-slate-400">{ld.vtIntegrationDesc}</p>
              <p className="text-xs text-slate-500 mt-2">URL: <span dir="ltr">{auction.virtualTour || ld.vtUrlNotAdded}</span></p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/*
        ───────── MOBİL ALT STICKY AKSİYON BARI ─────────
        Sadece lg breakpoint altında görünür (lg:hidden).
        Masaüstü sağ sticky özet kart (line 1205, lg:col-span-1) DOKUNULMADI.
        Buton mevcut handler'ları çağırır (setShowBidDialog / setOfferDialogOpen);
        yeni teklif/akış mantığı YOK — placeBid/validateBid/preAuthorize hep aynı dialog'tan.
        Görsel: dark zemin (site dark-first), birincil buton mavi (görsel disiplin: amber=ikincil),
        logical CSS (me-/ms-), dir="ltr" sayı (BiDi/Arapça hazır), sahte aciliyet YOK.
      */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
        role="region"
        aria-label={ld.mobileBarAria}
      >
        <div className="flex items-center gap-3 px-3 py-2.5 max-w-7xl mx-auto">
          <div className="flex-1 min-w-0" dir="ltr">
            <div className="text-[10px] uppercase tracking-wide text-slate-400 truncate">
              {pricePrimaryLabel}
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-base font-bold text-white truncate">
                ₺{liveBid.toLocaleString("tr-TR")}
              </div>
              <FxRef
                amountTry={liveBid}
                variant="compact"
                className="text-[11px] text-amber-300/80 truncate"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => id && toggleFavorite(id)}
              className={`h-11 w-11 p-0 ${saved ? "text-pink-400" : "text-slate-400"} hover:text-white`}
              aria-label={saved ? ld.favoriteRemove : ld.favoriteAdd}
            >
              <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
            </Button>
            {isListingOnly ? (
              <Button
                type="button"
                className="h-11 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                disabled={!user || (sellerId != null && user?.id === sellerId)}
                title={
                  !user
                    ? ld.loginRequired
                    : sellerId && user?.id === sellerId
                    ? ld.cantBidOwn
                    : undefined
                }
                onClick={() => {
                  if (!user) {
                    toastBid(ld.toastLogin, "warning");
                    return;
                  }
                  setOfferDialogOpen(true);
                }}
              >
                <HandCoins className="w-4 h-4 me-1.5" /> {ld.mobileBidShort}
              </Button>
            ) : (
              <Button
                type="button"
                className="h-11 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50"
                disabled={bidDisabled}
                title={
                  bidDisabled
                    ? !user
                      ? ld.loginRequired
                      : !reportApproved
                      ? ld.reportApproval
                      : !depositId
                      ? ld.depositRequired
                      : ld.auctionEnded
                    : undefined
                }
                onClick={() => {
                  setBidAmount((liveBid + 50000).toString());
                  setShowBidDialog(true);
                }}
              >
                <TrendingUp className="w-4 h-4 me-1.5" />{" "}
                {isSealedOffer ? ld.ctaSealedBidShort : ld.ctaBid}
              </Button>
            )}
          </div>
        </div>
      </div>
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
