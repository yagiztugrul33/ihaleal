import { useState, useEffect, useMemo, useRef } from "react";
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
import {
  ANTI_SNIPING_EXTEND_SECONDS,
  ANTI_SNIPING_THRESHOLD_SECONDS,
  BID_BOND_RATE,
  FEE_TEXTS,
  PLATFORM_PENALTY_RATE,
  VICTIM_COMPENSATION_RATE,
  WITHDRAWAL_PENALTY_RATE,
  calcBuyerTotal,
  calcSellerNet,
  estimateBuyerClosingCosts,
  feeBadgeLabel,
} from "@/lib/fees";
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
import { isAuctionUuid } from "@/lib/auctionIds";
import {
  approveReport,
  fetchReportForListing,
  generateMockReport,
  userHasApprovedReport,
  type PropertyAnalysisReportRecord,
} from "@/lib/aiAnalysis";
import { PropertyAnalysisReportViewer } from "@/components/PropertyAnalysisReportViewer";
import { CaymaPolitikasi } from "@/components/legal/CaymaPolitikasi";
import { ListingCoverImage } from "@/components/ListingCoverImage";
import { CinematicPropertyGallery, AIInsightLayer, InvestorTrustStrip, type AIInsight } from "@/components/cinematic";
import { ListingNumberBadge } from "@/components/ListingNumberBadge";
import { WEEKLY_AUCTION_POLICY_TR, WEEKLY_AUCTION_SLOT_TR } from "@/lib/listingNumber";
import { ensureHouseGalleryImages } from "@/lib/listingImage";
import { preAuthorize } from "@/lib/payment";
import {
  HEMEN_AL_CARD_BLOCK,
  HEMEN_AL_CONTRACT_LINKS,
  HEMEN_AL_DOCS_BLOCK,
  HEMEN_AL_GATE_INTRO,
  HEMEN_AL_GATE_TITLE,
  HEMEN_AL_MASAK_BLOCK,
} from "@/legal/hemenAlLansmanMetinleri";
import { MODULE3_HEMEN_AL_ACCEPTANCE } from "@/legal/masterContractCheckboxTexts";
import { BID_GATE_CHECKBOXES, initialBidGateAck, isBidGateComplete } from "@/legal/bidGateAgreement";
import { placeBidRpc, minNextBidTry, parsePositiveTryFromInput } from "@/lib/placeBid";
import {
  createStandardOffer,
  getStandardOffers,
  updateStandardOfferDecision,
  type StandardOffer,
} from "@/lib/standardListingOffers";
import { persistConsentAudit } from "@/lib/legal/consentAudit";
import { getTaxRuntimeConfig, getTaxRuntimeConfigSignature } from "@/lib/taxConfig";
import { getSponsoredListings, SPONSORED_DISCLOSURE } from "@/ads/mockAds";
import {
  AI_VALUATION_DISCLAIMER,
  EXPERT_APPROVAL_PENDING_NOTE,
  MASTER_INFO_DISCLAIMER,
  PSP_FLOW_DISCLAIMER,
} from "@/legal/platformDisclaimers";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

type BidTapeItem = {
  id: string;
  bidder: string;
  amount: number;
  at: string;
};
type TradeEventItem = {
  id: string;
  bidder: string;
  amount: number;
  at: string;
  tone: "up" | "sold";
};
type PublicBidTapeRow = {
  bid_id: string;
  bidder_mask: string;
  amount_try: number | string;
  created_at: string;
  depth_rank: number;
};

type MyBidSnapshot = {
  amountTry: number;
  atIso: string;
};

type SecurityActionType = "bid" | "buy_now";

type SecurityActionPayload = {
  type: SecurityActionType;
  amountTry: number;
  listingTitle: string;
};

function isValidDemoCardToken(value: string): boolean {
  return /^[a-zA-Z0-9_-]{3,64}$/.test(value.trim());
}

const BIDDER_MASKS = ["ALC-01", "YTR-22", "KRM-07", "FON-13", "TRD-09", "PRT-17"] as const;
const AUCTION_INFO_DISCLAIMER = `${MASTER_INFO_DISCLAIMER} ${AI_VALUATION_DISCLAIMER}`;

function maskBidderName(raw: string): string {
  const normalized = raw.replace(/[^a-zA-Z]/g, "");
  const seed = normalized.length > 0 ? normalized : "Alici";
  const first = seed.slice(0, 1).toUpperCase();
  const last = seed.slice(-1).toLowerCase();
  return `${first}***${last}`;
}

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
  const isDevrenFlow =
    auction?.category?.toLowerCase().includes("devren") ||
    auction?.title?.toLowerCase().includes("devren") ||
    auction?.tags?.some((tag) => tag.toLowerCase().includes("devren")) ||
    Boolean((auction?.propertyDetails as Record<string, unknown> | undefined)?.transferPriceTry);
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
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "features" | "location" | "virtualTour" | "priceHistory" | "ai">("overview");
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [showMarketReportDialog, setShowMarketReportDialog] = useState(false);
  const [showOfficialDocsDialog, setShowOfficialDocsDialog] = useState(false);

  const { user } = useAuth();
  const [dbListingId, setDbListingId] = useState<string | null>(null);
  const [dbAuctionPk, setDbAuctionPk] = useState<string | null>(null);
  const [listingSellerId, setListingSellerId] = useState<string | null>(null);
  const [dbReportLoaded, setDbReportLoaded] = useState<PropertyAnalysisReportRecord | null>(null);
  const [buyNowPriceDb, setBuyNowPriceDb] = useState<number | null>(null);
  const [reportApproved, setReportApproved] = useState(false);
  const [legalWithdrawAccepted, setLegalWithdrawAccepted] = useState(false);
  const [depositId, setDepositId] = useState<string | null>(null);
  const [depositIdBuyNow, setDepositIdBuyNow] = useState<string | null>(null);
  const [sellerDepositId, setSellerDepositId] = useState<string | null>(null);
  const [preAuthOpen, setPreAuthOpen] = useState(false);
  const [preAuthBuyNowOpen, setPreAuthBuyNowOpen] = useState(false);
  const [preAuthSellerOpen, setPreAuthSellerOpen] = useState(false);
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
  const [buyNowAcceptPenaltyPolicy, setBuyNowAcceptPenaltyPolicy] = useState(false);
  const [buyNowFinalAck, setBuyNowFinalAck] = useState(false);
  const [bidGateAck, setBidGateAck] = useState(initialBidGateAck);
  const [bidTape, setBidTape] = useState<BidTapeItem[]>([]);
  const [publicBidTapeActive, setPublicBidTapeActive] = useState(false);
  const [flashBidId, setFlashBidId] = useState<string | null>(null);
  const [tradeEvents, setTradeEvents] = useState<TradeEventItem[]>([]);
  const [watchers, setWatchers] = useState<number>(0);
  const [calculatorBid, setCalculatorBid] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<"1H" | "1G" | "1A" | "1Y">("1G");
  const [standardOffers, setStandardOffers] = useState<StandardOffer[]>([]);
  const [myBidSnapshot, setMyBidSnapshot] = useState<MyBidSnapshot | null>(null);
  const [endingSoonNotified, setEndingSoonNotified] = useState(false);
  const [bidStatusNotified, setBidStatusNotified] = useState<"winning" | "outbid" | null>(null);
  const [standardRulesAccepted, setStandardRulesAccepted] = useState(false);
  const bidStatusInitRef = useRef(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [securityStage, setSecurityStage] = useState<"summary" | "verify">("summary");
  const [securityAction, setSecurityAction] = useState<SecurityActionPayload | null>(null);
  const [txPassword, setTxPassword] = useState("");
  const [txPin, setTxPin] = useState("");
  const [txOtp, setTxOtp] = useState("");
  const [txRiskOtp, setTxRiskOtp] = useState("");
  const [txBiometricAck, setTxBiometricAck] = useState(false);
  const [txEsignAck, setTxEsignAck] = useState(false);
  const [txNotifyAck, setTxNotifyAck] = useState(false);
  const [txInformedConsentAck, setTxInformedConsentAck] = useState(false);
  const [newDeviceRisk, setNewDeviceRisk] = useState(false);
  const pendingSecureActionRef = useRef<null | (() => Promise<void> | void)>(null);

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
      const sd = sessionStorage.getItem(`ihaleal_seller_deposit_${id}`);
      if (sd) setSellerDepositId(sd);
      if (sessionStorage.getItem(`ihaleal_buynow_won_${id}`) === "1") setDemoBuyNowWon(true);
    } catch {
      /* ignore */
    }
  }, [id]);

  useEffect(() => {
    if (!id || !user?.id) {
      setMyBidSnapshot(null);
      return;
    }
    try {
      const raw = localStorage.getItem(`ihaleal_my_bid_${id}_${user.id}`);
      if (!raw) {
        setMyBidSnapshot(null);
        return;
      }
      const parsed = JSON.parse(raw) as MyBidSnapshot;
      if (!parsed || typeof parsed.amountTry !== "number") {
        setMyBidSnapshot(null);
        return;
      }
      setMyBidSnapshot(parsed);
    } catch {
      setMyBidSnapshot(null);
    }
  }, [id, user?.id]);

  useEffect(() => {
    bidStatusInitRef.current = false;
    setBidStatusNotified(null);
    setEndingSoonNotified(false);
  }, [id]);

  useEffect(() => {
    if (!user?.id) {
      setNewDeviceRisk(false);
      return;
    }
    try {
      const fp = `${navigator.userAgent}|${navigator.language}|${navigator.platform}`;
      const key = `ihaleal_device_fp_${user.id}`;
      const known = localStorage.getItem(key);
      if (!known) {
        localStorage.setItem(key, fp);
        setNewDeviceRisk(false);
        return;
      }
      setNewDeviceRisk(known !== fp);
      if (known !== fp) {
        localStorage.setItem(key, fp);
      }
    } catch {
      setNewDeviceRisk(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!auction) return;
    setCalculatorBid(Math.max(1, realtime.highBidTry ?? auction.currentBid));
  }, [auction, realtime.highBidTry]);

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
        .select("buy_now_price_try,seller_id")
        .eq("id", auc.listing_id)
        .maybeSingle();
      if (!alive) return;
      if (listingRow?.buy_now_price_try != null) setBuyNowPriceDb(Number(listingRow.buy_now_price_try));
      if (listingRow?.seller_id) setListingSellerId(String(listingRow.seller_id));
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

  const liveBidPreview = auction ? realtime.highBidTry ?? auction.currentBid : 0;
  const auctionEndedVisualPreview = demoBuyNowWon || auction?.status === "ended";
  const usePublicBidTape = Boolean(id && isAuctionUuid(id) && isSupabaseConfigured());

  useEffect(() => {
    if (!usePublicBidTape || !id) {
      setPublicBidTapeActive(false);
      return;
    }
    let alive = true;
    void (async () => {
      const { data } = await supabase
        .from("auction_bid_public_tape")
        .select("bid_id,bidder_mask,amount_try,created_at,depth_rank")
        .eq("auction_id", id)
        .order("depth_rank", { ascending: true })
        .limit(7);
      if (!alive) return;
      const rows = ((data ?? []) as PublicBidTapeRow[]).map((row) => ({
        id: row.bid_id,
        bidder: row.bidder_mask || "A***z",
        amount: Number(row.amount_try) || 0,
        at: new Date(row.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      }));
      if (rows.length > 0) {
        setBidTape(rows);
        setTradeEvents(
          rows.slice(0, 4).map((row, idx) => ({
            id: `${row.id}-event-${idx}`,
            bidder: row.bidder,
            amount: row.amount,
            at: row.at,
            tone: "up",
          })),
        );
        setPublicBidTapeActive(true);
      } else {
        setPublicBidTapeActive(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, usePublicBidTape]);

  useEffect(() => {
    if (!auction || usePublicBidTape) return;
    const seed: BidTapeItem[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `${id ?? "auc"}-seed-${i}`,
      bidder: BIDDER_MASKS[i % BIDDER_MASKS.length],
      amount: Math.max(auction.currentBid - i * 25_000, 1),
      at: new Date(Date.now() - i * 120_000).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
    setBidTape(seed);
    setTradeEvents(
      seed.slice(0, 4).map((row, idx) => ({
        id: `${row.id}-event-${idx}`,
        bidder: row.bidder,
        amount: row.amount,
        at: row.at,
        tone: "up",
      })),
    );
    setFlashBidId(null);
    setWatchers(Math.max(18, (auction.bidderCount ?? 12) * 3));
  }, [auction, id, usePublicBidTape]);

  useEffect(() => {
    if (!auction || isListingOnly || auctionEndedVisualPreview || auction.status !== "live") return;
    if (usePublicBidTape || publicBidTapeActive) return;
    const interval = window.setInterval(() => {
      setBidTape((prev) => {
        const top = prev[0]?.amount ?? liveBidPreview;
        const nextAmount = top + (Math.floor(Math.random() * 4) + 1) * 10_000;
        const next: BidTapeItem = {
          id: `${id ?? "auc"}-${Date.now()}`,
          bidder: BIDDER_MASKS[Math.floor(Math.random() * BIDDER_MASKS.length)],
          amount: nextAmount,
          at: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        };
        setFlashBidId(next.id);
        setTradeEvents((prevEvents) => {
          const sold = Math.random() < 0.12;
          const stream: TradeEventItem = {
            id: `${next.id}-stream`,
            bidder: next.bidder,
            amount: next.amount,
            at: next.at,
            tone: sold ? "sold" : "up",
          };
          return [stream, ...prevEvents].slice(0, 8);
        });
        return [next, ...prev].slice(0, 7);
      });
      setWatchers((prev) => Math.max(1, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 2600);
    return () => window.clearInterval(interval);
  }, [auction, auctionEndedVisualPreview, id, isListingOnly, liveBidPreview, publicBidTapeActive, usePublicBidTape]);

  useEffect(() => {
    if (!flashBidId) return;
    const idTimer = window.setTimeout(() => setFlashBidId(null), 1300);
    return () => window.clearTimeout(idTimer);
  }, [flashBidId]);

  const nearbyHighlights = useMemo(() => {
    if (!auction) {
      return {
        education: [],
        transport: [],
        health: [],
      };
    }
    const pick = (type: "education" | "transport" | "health") =>
      (auction.nearbyFacilities ?? []).filter((x) => x.type === type).slice(0, 2);
    return {
      education: pick("education"),
      transport: pick("transport"),
      health: pick("health"),
    };
  }, [auction]);

  useEffect(() => {
    if (!id || !isListingOnly) {
      setStandardOffers([]);
      return;
    }
    setStandardOffers(getStandardOffers(id));
  }, [id, isListingOnly]);

  useEffect(() => {
    if (!id || !myBidSnapshot) return;
    const latestBid = bidTape[0]?.amount ?? realtime.highBidTry ?? auction?.currentBid ?? 0;
    const myStatus: "winning" | "outbid" | "pending" =
      myBidSnapshot.amountTry >= latestBid
        ? "winning"
        : bidTape.length > 0
          ? "outbid"
          : "pending";
    if (!bidStatusInitRef.current) {
      bidStatusInitRef.current = true;
      setBidStatusNotified(myStatus === "pending" ? null : myStatus);
      return;
    }
    if (myStatus === "pending" || myStatus === bidStatusNotified) return;
    if (myStatus === "winning") {
      toastBid("Kazanıyorsun: teklifin şu an lider.", "success");
    } else {
      toastBid("Teklifin geçildi. Sıra kaybettin.", "warning");
    }
    setBidStatusNotified(myStatus);
  }, [auction?.currentBid, bidStatusNotified, bidTape, id, myBidSnapshot, realtime.highBidTry]);

  useEffect(() => {
    if (!auction || endingSoonNotified || auction.status !== "live") return;
    const msLeft = new Date(auction.endDate).getTime() - Date.now();
    if (msLeft > 0 && msLeft <= 60 * 60 * 1000) {
      toastBid("İhale bitiyor: son 60 dakika.", "warning");
      setEndingSoonNotified(true);
    }
  }, [auction, endingSoonNotified]);

  const detailSponsored = useMemo(() => getSponsoredListings(2), []);

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

  const propertyDetails = {
    roomCount: auction.propertyDetails?.roomCount ?? "—",
    grossSqm: auction.propertyDetails?.grossSqm ?? 0,
    netSqm: auction.propertyDetails?.netSqm ?? 0,
    floor: auction.propertyDetails?.floor ?? "—",
    totalFloors: auction.propertyDetails?.totalFloors ?? 0,
    buildingAge: auction.propertyDetails?.buildingAge ?? 0,
    heating: auction.propertyDetails?.heating ?? "Belirtilmedi",
    facade: auction.propertyDetails?.facade ?? "Belirtilmedi",
    bathroom: auction.propertyDetails?.bathroom ?? 0,
    balcony: Boolean(auction.propertyDetails?.balcony),
    elevator: Boolean(auction.propertyDetails?.elevator),
    parking: Boolean(auction.propertyDetails?.parking),
    furnished: Boolean(auction.propertyDetails?.furnished),
    usingStatus: auction.propertyDetails?.usingStatus ?? "Belirtilmedi",
    deedStatus: auction.propertyDetails?.deedStatus ?? "Belirtilmedi",
    eligibility: auction.propertyDetails?.eligibility ?? "Belirtilmedi",
  };
  const areaStats = {
    avgPricePerSqm: auction.areaStats?.avgPricePerSqm ?? 0,
    demandIndex: auction.areaStats?.demandIndex ?? 0,
    rentalYield: auction.areaStats?.rentalYield ?? 0,
    priceChangeMonthly: auction.areaStats?.priceChangeMonthly ?? 0,
    priceChangeYearly: auction.areaStats?.priceChangeYearly ?? 0,
    avgDaysOnMarket: auction.areaStats?.avgDaysOnMarket ?? 0,
    supplyCount: auction.areaStats?.supplyCount ?? 0,
  };
  const features = auction.features ?? [];
  const nearbyFacilities = auction.nearbyFacilities ?? [];
  const priceHistory = auction.priceHistory ?? [];
  const safeGalleryImages = ensureHouseGalleryImages(auction.images, 6);
  const virtualTourCards = [
    {
      id: "vt-main",
      title: `${auction.title} · Dis Cephe`,
      location: auction.location,
      price: `₺${auction.currentBid.toLocaleString("tr-TR")}`,
      image:
        "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "vt-living",
      title: "Salon ve Yasam Alani",
      location: auction.district,
      price: "Foto tur",
      image:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "vt-office",
      title: "Is / Yatirim Potansiyeli",
      location: auction.city,
      price: "Detay inceleme",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
    },
  ];

  const liveBid = realtime.highBidTry ?? auction.currentBid;
  const standardFloorTry =
    auction.commitmentFloorTRY ?? Math.round((auction.startingBid > 0 ? auction.startingBid : liveBid) * 0.95);
  const standardCeilingTry =
    auction.commitmentCeilingTRY ?? Math.round((auction.buyNowPriceTry ?? liveBid) * 1.05);
  const safeAiPredictedPrice = auction.aiPredictedPrice > 0 ? auction.aiPredictedPrice : liveBid || 1;
  const priceDiff = safeAiPredictedPrice - liveBid;
  const priceDiffPercent = ((priceDiff / safeAiPredictedPrice) * 100).toFixed(1);
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

  const buyNowDisabled = isListingOnly
    ? !user || buyNowBusy || auctionEndedVisual
    : !user || !reportApproved || !depositIdBuyNow || buyNowBusy || auctionEndedVisual;
  const bidGateBlocked =
    isAuctionMode && Boolean(user) && (!reportApproved || !depositId);
  const bidDisabled = auctionEndedVisual || (isAuctionMode && (!user || !reportApproved || !depositId));
  const latestTapeBid = bidTape[0]?.amount ?? liveBid;
  const liveBidCount = Math.max(auction.bidderCount, (auction.bidderCount ?? 0) + bidTape.length);
  const orderDepthRows = (() => {
    const sorted = [...bidTape].sort((a, b) => b.amount - a.amount).slice(0, 6);
    const top = sorted[0]?.amount ?? 1;
    return sorted.map((row, idx) => ({
      ...row,
      maskedBidder: maskBidderName(row.bidder),
      depthPct: Math.max(12, Math.round((row.amount / top) * 100)),
      rank: idx + 1,
    }));
  })();
  const myBidRank =
    myBidSnapshot == null ? null : Math.max(1, orderDepthRows.filter((row) => row.amount > myBidSnapshot.amountTry).length + 1);
  const myBidStatus: "winning" | "outbid" | "pending" | null =
    myBidSnapshot == null
      ? null
      : myBidSnapshot.amountTry >= latestTapeBid
        ? "winning"
        : orderDepthRows.length > 0
          ? "outbid"
          : "pending";
  const isStandardSeller =
    Boolean(user?.id) &&
    (listingSellerId === user?.id || (user?.email ?? "").toLowerCase().includes("seller") || (user?.email ?? "").toLowerCase().includes("satici"));
  const isAuctionCollateralFlow = isAuctionMode;
  const isLightVerificationFlow = !isAuctionMode;
  const buyerGuaranteeMissing =
    isAuctionCollateralFlow && !isStandardSeller && Boolean(user) && (!reportApproved || !depositId);
  const sellerGuaranteeMissing = isAuctionCollateralFlow && isStandardSeller && !sellerDepositId;
  const withdrawalBaseTry = Math.max(1, Math.round(latestTapeBid || liveBid));
  const totalPenaltyTry = Math.round(withdrawalBaseTry * WITHDRAWAL_PENALTY_RATE);
  const victimCompensationTry = Math.round(withdrawalBaseTry * VICTIM_COMPENSATION_RATE);
  const platformPenaltyTry = Math.round(withdrawalBaseTry * PLATFORM_PENALTY_RATE);
  const platformPenaltyVatTry = Math.round(platformPenaltyTry * 0.2);
  const runtimeTax = getTaxRuntimeConfig();
  const bidPreAuthRate = 0.05;
  const buyerEscrowHeldTry = depositId ? Math.round(withdrawalBaseTry * bidPreAuthRate * 100) / 100 : 0;
  const sellerEscrowHeldTry = sellerDepositId ? Math.round(withdrawalBaseTry * 0.01 * 100) / 100 : 0;
  const pendingEscrowFloatTry = Math.round((buyerEscrowHeldTry + sellerEscrowHeldTry) * 100) / 100;
  const compensationReceiptRef = `GP-${(id ?? "X").toString().slice(0, 6).toUpperCase()}-${new Date().getFullYear()}`;
  const refundReferenceMethod = depositIdBuyNow ? "Aynı kart (pre-auth hattı)" : "Aynı IBAN / kart (işlem kaynağı)";
  const backupBidders = orderDepthRows.slice(1, 3);
  const visibleStandardOffers = isStandardSeller
    ? standardOffers
    : standardOffers.filter((row) => row.bidderUserId === user?.id);

  const rangePriceData = (() => {
    const source = priceHistory.length > 0 ? priceHistory : [{ date: new Date().toISOString(), price: liveBid, event: "Anlık" }];
    const toSeries = (slice: typeof source) =>
      slice.map((p, idx) => ({
        date:
          priceRange === "1H"
            ? new Date(p.date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
            : new Date(p.date).toLocaleDateString("tr-TR", { month: "short", day: "2-digit" }),
        price: Math.max(1, Math.round(p.price / 1000000)),
        open: Math.max(1, Math.round((idx === 0 ? p.price : slice[idx - 1].price) / 1000000)),
        close: Math.max(1, Math.round(p.price / 1000000)),
      }));
    if (priceRange === "1H") return toSeries(source.slice(-6));
    if (priceRange === "1G") return toSeries(source.slice(-12));
    if (priceRange === "1A") return toSeries(source.slice(-24));
    const expanded = [...source];
    for (let i = 0; i < 8; i++) {
      const last = expanded[expanded.length - 1];
      expanded.push({
        date: new Date(Date.now() - (8 - i) * 30 * 86_400_000).toISOString(),
        price: Math.round(last.price * (0.95 + Math.random() * 0.1)),
        event: "Trend",
      });
    }
    return toSeries(expanded.slice(-32));
  })();

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
    if (!isValidDemoCardToken(cardToken)) {
      toastBid("Kart token formatı geçersiz. Yalnızca harf, rakam, _ veya - kullanın.", "warning");
      return;
    }
    setPreAuthBusy(true);
    try {
      const base = liveBid;
      const depositAmt = Math.round(base * bidPreAuthRate * 100) / 100;
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
        const { data, error } = await supabase.rpc("register_bid_deposit", {
          p_listing_id: dbListingId,
          p_auction_id: dbAuctionPk,
          p_base_amount_try: base,
          p_deposit_amount_try: depositAmt,
          p_pre_auth_ref: pr.preAuthRef ?? "mock",
          p_context: "bid",
          p_idempotency_key: crypto.randomUUID(),
        });
        if (error) {
          window.alert(error.message);
          return;
        }
        const row = data as { status?: string; deposit_id?: string };
        if (row?.status === "ok" && row.deposit_id) {
          setDepositId(row.deposit_id);
          sessionStorage.setItem(`ihaleal_deposit_${id}`, row.deposit_id);
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

  const runSellerPreAuth = async () => {
    if (!user || !id) return;
    if (!isValidDemoCardToken(cardToken)) {
      toastBid("Kart token formatı geçersiz. Yalnızca harf, rakam, _ veya - kullanın.", "warning");
      return;
    }
    setPreAuthBusy(true);
    try {
      const base = liveBid;
      const depositAmt = Math.round(base * 0.01 * 100) / 100;
      const pr = await preAuthorize({
        amountTRY: depositAmt,
        cardToken,
        buyerId: user.id,
        listingId: dbListingId ?? id,
        context: "seller_commitment",
      });
      if (!pr.success) {
        toastBid(pr.error ?? "Satıcı güvencesi ön yetkisi reddedildi", "error");
        return;
      }
      const mockDep = `mock-seller-${Date.now()}`;
      setSellerDepositId(mockDep);
      sessionStorage.setItem(`ihaleal_seller_deposit_${id}`, mockDep);
      toastBid("Satıcı güvencesi (simetrik teminat) kaydedildi.", "success");
      setPreAuthSellerOpen(false);
    } finally {
      setPreAuthBusy(false);
    }
  };

  const runPreAuthBuyNow = async () => {
    if (!user || !id || effectiveBuyNowTry == null) return;
    if (!isValidDemoCardToken(cardToken)) {
      toastBid("Kart token formatı geçersiz. Yalnızca harf, rakam, _ veya - kullanın.", "warning");
      return;
    }
    setPreAuthBusy(true);
    try {
      const base = effectiveBuyNowTry;
      const depositAmt = Math.round(base * 0.015 * 100) / 100;
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
        const { data, error } = await supabase.rpc("register_bid_deposit", {
          p_listing_id: dbListingId,
          p_auction_id: dbAuctionPk,
          p_base_amount_try: base,
          p_deposit_amount_try: depositAmt,
          p_pre_auth_ref: pr.preAuthRef ?? "mock",
          p_context: "buy_now",
          p_idempotency_key: crypto.randomUUID(),
        });
        if (error) {
          toastBid(error.message, "error");
          return;
        }
        const row = data as { status?: string; deposit_id?: string };
        if (row?.status === "ok" && row.deposit_id) {
          setDepositIdBuyNow(row.deposit_id);
          sessionStorage.setItem(`ihaleal_deposit_buynow_${id}`, row.deposit_id);
          toastBid("Satın alım için blokaj kaydedildi.", "success");
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

  const executeBuyNowConfirmCore = () => {
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
          const { data, error } = await supabase.rpc("execute_buy_now", {
            p_listing_id: dbListingId,
            p_deposit_id: depositIdBuyNow,
            p_idempotency_key: crypto.randomUUID(),
          });
          if (error) {
            toastBid(error.message, "error");
            return;
          }
          const row = data as { status?: string; message?: string; amount?: number };
          if (row?.status === "ok") {
            setDemoBuyNowWon(true);
            sessionStorage.setItem(`ihaleal_buynow_won_${id}`, "1");
            dispatchTransactionNotifications("Hemen Al", row.amount ?? effectiveBuyNowTry);
            toastBid(
              `Tebrikler! ₺${(row.amount ?? effectiveBuyNowTry).toLocaleString("tr-TR")} ile ihaleyi kazandınız; ihale kapandı.`,
              "success",
            );
            return;
          }
          if (row?.status === "duplicate") {
            toastBid(row.message ?? "Bu işlem zaten kayıtlı.", "info");
            return;
          }
          toastBid(row?.message ?? "Satın alma tamamlanamadı.", "error");
        } finally {
          setBuyNowBusy(false);
        }
      })();
      return;
    }
    sessionStorage.setItem(`ihaleal_buynow_won_${id}`, "1");
    setDemoBuyNowWon(true);
    dispatchTransactionNotifications("Hemen Al", effectiveBuyNowTry);
    toastBid(
      `Tebrikler! ₺${effectiveBuyNowTry.toLocaleString("tr-TR")} ile ihaleyi kazandınız (demo). İhale kapandı.`,
      "success",
    );
  };

  const executeBuyNowConfirm = () => {
    if (!user) {
      toastBid("Giriş yapın.", "warning");
      return;
    }
    if (effectiveBuyNowTry == null) {
      toastBid("Hemen Al tutarı yok.", "warning");
      return;
    }
    openSecurityFlow(
      {
        type: "buy_now",
        amountTry: effectiveBuyNowTry,
        listingTitle: auction.title,
      },
      () => {
        executeBuyNowConfirmCore();
      },
    );
  };

  const radarData = [
    { subject: "Konum", A: auction.investmentScore * 0.9 + 10, fullMark: 100 },
    { subject: "Fiyat", A: isUnderpriced ? 85 : 60, fullMark: 100 },
    { subject: "Özellikler", A: propertyDetails.elevator && propertyDetails.parking ? 80 : 65, fullMark: 100 },
    { subject: "Piyasa", A: areaStats.demandIndex, fullMark: 100 },
    { subject: "Getiri", A: areaStats.rentalYield * 10, fullMark: 100 },
    { subject: "Talep", A: areaStats.demandIndex, fullMark: 100 },
  ];
  const regionTrendData = [
    { period: "6ay", sqm: Math.round(areaStats.avgPricePerSqm * 0.86) },
    { period: "5ay", sqm: Math.round(areaStats.avgPricePerSqm * 0.89) },
    { period: "4ay", sqm: Math.round(areaStats.avgPricePerSqm * 0.92) },
    { period: "3ay", sqm: Math.round(areaStats.avgPricePerSqm * 0.95) },
    { period: "2ay", sqm: Math.round(areaStats.avgPricePerSqm * 0.98) },
    { period: "1ay", sqm: Math.round(areaStats.avgPricePerSqm) },
  ];
  const comparableSales = [
    { id: `${auction.id}-cmp-1`, title: `${auction.district} benzer satış A`, price: Math.round(liveBid * 0.93), sqm: Math.max(1, propertyDetails.netSqm - 8), closedAt: "2026-03" },
    { id: `${auction.id}-cmp-2`, title: `${auction.district} benzer satış B`, price: Math.round(liveBid * 1.02), sqm: Math.max(1, propertyDetails.netSqm + 6), closedAt: "2026-02" },
    { id: `${auction.id}-cmp-3`, title: `${auction.district} benzer satış C`, price: Math.round(liveBid * 0.98), sqm: Math.max(1, propertyDetails.netSqm - 2), closedAt: "2026-01" },
  ];

  function toastBid(message: string, type: "success" | "error" | "info" | "warning" = "info") {
    window.dispatchEvent(new CustomEvent("ihaleal:add-toast", { detail: { message, type } }));
  }
  const resetSecurityInputs = () => {
    setTxPassword("");
    setTxPin("");
    setTxOtp("");
    setTxRiskOtp("");
    setTxBiometricAck(false);
    setTxEsignAck(false);
    setTxNotifyAck(false);
    setTxInformedConsentAck(false);
    setSecurityStage("summary");
  };
  const dispatchTransactionNotifications = (actionLabel: string, amountTry: number) => {
    const amountText = `₺${amountTry.toLocaleString("tr-TR")}`;
    toastBid(`SMS teyit (mock): ${actionLabel} işlemi ${amountText} için iletildi.`, "info");
    toastBid(`E-posta teyit (mock): ${actionLabel} işlemi ${amountText} için iletildi.`, "info");
  };
  const openSecurityFlow = (
    payload: SecurityActionPayload,
    onConfirm: () => Promise<void> | void,
  ) => {
    pendingSecureActionRef.current = onConfirm;
    setSecurityAction(payload);
    resetSecurityInputs();
    setSecurityDialogOpen(true);
    if (newDeviceRisk) {
      toastBid("Yeni cihaz algılandı: ek doğrulama (risk OTP) zorunlu.", "warning");
    }
  };
  const confirmSecurityStep = async () => {
    if (!txPassword.trim() && txPin.trim().length < 4) {
      toastBid("İşlem şifresi veya en az 4 haneli PIN zorunlu.", "warning");
      return;
    }
    if (!/^\d{6}$/.test(txOtp.trim())) {
      toastBid("OTP/SMS kodu 6 haneli olmalı.", "warning");
      return;
    }
    if (!txNotifyAck) {
      toastBid("SMS + e-posta teyit onayını işaretleyin.", "warning");
      return;
    }
    if (!txInformedConsentAck) {
      toastBid("İşlem için 'okudum, anladım, kabul ediyorum' onayı zorunludur.", "warning");
      return;
    }
    if (!txBiometricAck) {
      toastBid("Biyometrik doğrulama adımını onaylayın (mock).", "warning");
      return;
    }
    if (user?.email && !txEsignAck) {
      toastBid("E-imza/e-onay kutusu zorunludur.", "warning");
      return;
    }
    if (newDeviceRisk && !/^\d{6}$/.test(txRiskOtp.trim())) {
      toastBid("Yeni cihaz için ek risk OTP (6 hane) girin.", "warning");
      return;
    }
    if (securityAction && user?.id) {
      const now = new Date();
      persistConsentAudit({
        listingId: id ?? "unknown-listing",
        action: securityAction.type,
        userId: user.id,
        acceptedAtIso: now.toISOString(),
        acceptedAtLocal: now.toLocaleString("tr-TR"),
        note: "Okudum, anladım, kabul ediyorum (işlem öncesi bilgilendirilmiş onay).",
        bidGateVersion: "v2.0-demo",
        taxConfigSignature: getTaxRuntimeConfigSignature(),
      });
    }
    const pending = pendingSecureActionRef.current;
    setSecurityDialogOpen(false);
    resetSecurityInputs();
    if (!pending) return;
    await pending();
    pendingSecureActionRef.current = null;
  };
  const scrollToContact = () => {
    navigate("/");
    window.setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const submitBidCore = async () => {
    if (auctionEndedVisual) {
      toastBid("Bu ihale sona ermiş.", "info");
      return;
    }
    const amount = parsePositiveTryFromInput(bidAmount);
    if (amount == null) {
      toastBid("Geçerli bir teklif tutarı girin (pozitif tam sayı, makul üst sınır içinde).", "error");
      return;
    }
    if (!user) {
      toastBid("Teklif için giriş yapın.", "warning");
      return;
    }
    if (isListingOnly) {
      const bidderMask = maskBidderName(
        user.email?.split("@")[0] || String(user.user_metadata?.full_name ?? "Alici"),
      );
      const offer = createStandardOffer({
        listingId: id ?? auction.id,
        bidderUserId: user.id,
        bidderMask,
        amountTry: amount,
        floorTry: standardFloorTry,
        ceilingTry: standardCeilingTry,
      });
      setStandardOffers(getStandardOffers(id ?? auction.id));
      if (offer.status === "rejected") {
        toastBid("Teklif kaydedildi fakat alt limit altında olduğu için satıcı reddetti.", "warning");
      } else if (offer.status === "countered") {
        toastBid(
          `Teklif özel olarak kaydedildi. Satıcı karşı teklif: ₺${(offer.counterAmountTry ?? 0).toLocaleString("tr-TR")}`,
          "info",
        );
      } else {
        toastBid("Özel teklif kaydedildi. İlan fiyatı sabit kalır, satıcı panelde karar verir.", "success");
      }
      dispatchTransactionNotifications("Özel teklif", amount);
      setShowBidDialog(false);
      setBidAmount("");
      return;
    }
    const minRequired = minNextBidTry(liveBid);
    if (amount < minRequired) {
      toastBid(`Teklif en az ₺${minRequired.toLocaleString("tr-TR")} olmalı.`, "warning");
      return;
    }
    if (isAuctionMode && bidDisabled) {
      toastBid("Önce AI raporunu onaylayın ve teminat (ön yetki) adımını tamamlayın.", "warning");
      return;
    }
    if (isAuctionMode && !isBidGateComplete(bidGateAck)) {
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
        dispatchTransactionNotifications("Teklif", amount);
        const nextSnapshot: MyBidSnapshot = { amountTry: amount, atIso: new Date().toISOString() };
        setMyBidSnapshot(nextSnapshot);
        if (id && user?.id) {
          localStorage.setItem(`ihaleal_my_bid_${id}_${user.id}`, JSON.stringify(nextSnapshot));
        }
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
    const demoSnapshot: MyBidSnapshot = { amountTry: amount, atIso: new Date().toISOString() };
    dispatchTransactionNotifications("Teklif", amount);
    setMyBidSnapshot(demoSnapshot);
    if (id && user?.id) {
      localStorage.setItem(`ihaleal_my_bid_${id}_${user.id}`, JSON.stringify(demoSnapshot));
    }
    setShowBidDialog(false);
    setBidAmount("");
  };

  const handleBid = async () => {
    const amount = parsePositiveTryFromInput(bidAmount);
    if (amount == null) {
      toastBid("Geçerli bir teklif tutarı girin (pozitif tam sayı, makul üst sınır içinde).", "error");
      return;
    }
    if (!user) {
      toastBid("Teklif için giriş yapın.", "warning");
      return;
    }
    openSecurityFlow(
      {
        type: "bid",
        amountTry: amount,
        listingTitle: auction.title,
      },
      async () => {
        await submitBidCore();
      },
    );
  };

  const bidIncrements = [10000, 50000, 100000, 250000, 500000];
  const effectiveCalcBid = Number.isFinite(calculatorBid) && calculatorBid > 0 ? calculatorBid : liveBid;
  const closing = estimateBuyerClosingCosts(effectiveCalcBid);
  const buyerTotals = calcBuyerTotal(effectiveCalcBid);
  const sellerTotals = calcSellerNet(effectiveCalcBid);
  const applyStandardDecision = (offerId: string, decision: "accepted" | "rejected" | "countered") => {
    if (!id || !isStandardSeller) return;
    const current = standardOffers.find((row) => row.id === offerId);
    const suggestedCounter =
      current != null
        ? Math.min(
            standardCeilingTry,
            Math.max(standardFloorTry, Math.round((current.amountTry + liveBid) / 2)),
          )
        : undefined;
    const updated = updateStandardOfferDecision({
      listingId: id,
      offerId,
      decision,
      counterAmountTry: decision === "countered" ? suggestedCounter : undefined,
      note:
        decision === "accepted"
          ? "Satıcı özel teklifi kabul etti."
          : decision === "rejected"
            ? "Satıcı özel teklifi reddetti."
            : `Satıcı karşı teklif döndü: ₺${(suggestedCounter ?? 0).toLocaleString("tr-TR")}`,
    });
    setStandardOffers(updated);
    toastBid(
      decision === "accepted"
        ? "Satıcı teklifi kabul etti (demo). Escrow/sözleşme çekirdeği aynı akıştan ilerler."
        : decision === "rejected"
          ? "Satıcı teklifi reddetti (demo)."
          : "Satıcı karşı teklif verdi (demo).",
      decision === "rejected" ? "warning" : "success",
    );
  };

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
        ? `Model fiyatın %${Math.abs(Number(priceDiffPercent))} altında olduğunu işaret ediyor; bölge ortalaması ₺${areaStats.avgPricePerSqm.toLocaleString("tr-TR")}/m².`
        : `Fiyat piyasa bandına yakın; talep endeksi ${areaStats.demandIndex}/100.`,
      confidence: isUnderpriced ? 88 : 72,
      tone: isUnderpriced ? "positive" : "neutral",
    },
    {
      id: "yield",
      title: "Getiri profili",
      body: `Tahmini kira getirisi %${areaStats.rentalYield}; amortisman ${Math.round(100 / Math.max(areaStats.rentalYield, 0.1))} yıl bandında.`,
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
  const detailedDescription = (() => {
    const raw = auction.description?.trim() ?? "";
    if (raw.length > 340 && raw.includes("\n")) return raw;

    const segmentNarrative =
      auction.category === "Ticari"
        ? "Ticari segmentte bu varlık, gelir üretimi ve kurumsal kiracı profili açısından dikkat çeken bir konumlanma sunuyor. Operasyonel kullanım kolaylığı ve bölgesel erişim avantajı, özellikle uzun vadeli kira odaklı yatırımcılar için dosyayı daha öngörülebilir hale getiriyor."
        : auction.category === "Arsa"
          ? "Arsa segmentinde bu dosya, geliştirme potansiyeli ve plan notu uyumu bakımından incelendiğinde güçlü bir proje zemini oluşturuyor. Emsal ve kullanım senaryosu doğru kurgulandığında, hem değer artışı hem de ortak geliştirme modelleri için esnek bir alan açıyor."
          : "Konut segmentinde bu ilan, günlük yaşam konforu ile yatırım dengesini bir araya getiriyor. Oturum amaçlı alıcı için erişim ve çevre avantajı sunarken, yatırım amaçlı alıcı için bölgesel talep ve satış hızı anlamında güçlü sinyaller üretiyor.";

    const mobilityHighlights = nearbyFacilities
      .filter((item) => item.type === "transport")
      .slice(0, 2)
      .map((item) => `${item.name} (${item.distance} m)`)
      .join(", ");
    const lifestyleHighlights = nearbyFacilities
      .filter((item) => item.type !== "transport")
      .slice(0, 2)
      .map((item) => `${item.name} (${item.distance} m)`)
      .join(", ");

    return [
      `${auction.location} lokasyonundaki bu ilan, mikro bölge dinamikleriyle birlikte okunduğunda güçlü bir karar zemini sunuyor. Son dönemdeki fiyat hareketleri ve talep ritmi, varlığın yalnızca bugünkü değerini değil orta vadeli konumunu da anlamayı mümkün kılıyor.`,
      `${segmentNarrative} ${auction.status === "live" ? "İhalenin canlı statüde olması, fiyat keşfinin gerçek rekabet içinde oluşmasını sağlıyor." : "Yaklaşan ihale statüsü ise teklif öncesi hazırlık ve due diligence için ek zaman yaratıyor."}`,
      `Yapısal tarafta ${propertyDetails.netSqm} m² net kullanım alanı, ${propertyDetails.roomCount} planı ve ${propertyDetails.heating} altyapısı öne çıkıyor. ${propertyDetails.deedStatus} tapu statüsü, ${propertyDetails.eligibility} uygunluk notu ve teknik özellik seti birlikte değerlendirildiğinde işlem öncesi risklerin önemli bölümü erken aşamada görünür hale geliyor.`,
      `Bölge verilerinde ortalama m² değeri ₺${areaStats.avgPricePerSqm.toLocaleString("tr-TR")} bandında. Talep endeksi ${areaStats.demandIndex}/100, yıllık değişim %${areaStats.priceChangeYearly} ve kira getirisi %${areaStats.rentalYield} seviyesinde; bu kombinasyon, hem değer koruma hem nakit akışı perspektifini aynı tabloda okumaya imkan tanıyor.`,
      `Ulaşım tarafında ${mobilityHighlights || "ana akslara yakın konum"}; yaşam ve hizmet tarafında ${lifestyleHighlights || "güçlü çevre bileşenleri"} dikkat çekiyor. Teklif akışında anti-sniping, maliyet hesaplayıcı ve canlı derinlik paneli birlikte çalıştığı için alıcı toplam yükümlülüğü teklif anında daha net görebiliyor; bu da karar kalitesini belirgin şekilde artırıyor.`,
    ].join("\n\n");
  })();

  return (
    <div ref={ref} className="min-h-screen pt-20 pb-16">
      <div className="glass-panel sticky top-16 z-40 rounded-none border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2"><ArrowLeft className="w-4 h-4" /> Geri</Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => id && toggleFavorite(id)} aria-label={saved ? "Favorilerden çıkar" : "Favorilere ekle"} className={`${saved ? "text-pink-400" : "text-slate-400"} hover:text-white`}><Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} /></Button>
            {id && <ShareButton title={auction?.title || ""} url={`/ilan/${id}`} />}
            <Button variant="ghost" size="sm" onClick={() => navigate(`/karsilastir?ids=${auction.id}`)} aria-label="Karşılaştırma listesine ekle" className="text-slate-400 hover:text-blue-400"><GitCompare className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <CinematicPropertyGallery
            images={safeGalleryImages}
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
              <p className="mb-4 rounded-lg border border-slate-200/80 bg-white/[0.02] px-3 py-2 text-xs text-slate-400">
                Bu sayfa, tekliften sözleşmeye tüm adımı tek ekranda şeffaflaştırır: kural seti, maliyet hesabı ve güven doğrulamaları birlikte gösterilir.
              </p>
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
              {isAuctionMode ? (
                <div className="mb-6 rounded-xl border border-sky-500/25 bg-sky-500/10 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-sky-100">İhale nasıl çalışır? (özet)</h3>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li>• Minimum artış kuralı sistem tarafından uygulanır; geçersiz teklif kabul edilmez.</li>
                    <li>• Son {ANTI_SNIPING_THRESHOLD_SECONDS} saniyede gelen geçerli teklifte süre {ANTI_SNIPING_EXTEND_SECONDS} saniye uzatılır (anti-sniping).</li>
                    <li>• Katılım teminatı hedefi: %{(BID_BOND_RATE * 100).toFixed(0)} blokaj / ön yetki modeli.</li>
                    <li>
                      • Komisyon yapısı: alıcı %{(runtimeTax.buyerCommissionRate * 100).toFixed(0)} + satıcı %{(runtimeTax.sellerCommissionRate * 100).toFixed(0)} (+KDV %{
                        (runtimeTax.vatRate * 100).toFixed(0)
                      }).
                    </li>
                  </ul>
                </div>
              ) : null}
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
                  { key: "virtualTour" as const, label: "Sanal Tur", icon: <Video className="w-4 h-4" /> },
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
                  <div><h3 className="text-lg font-bold text-white mb-3">Açıklama</h3><p className="text-slate-400 leading-relaxed whitespace-pre-line">{detailedDescription}</p></div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Hızlı Hesaplayıcılar</h4>
                      <p className="text-xs text-slate-300 mb-3">
                        Demo detayında kredi, vergi ve komisyon hesaplayıcılarına hızlı erişim.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="outline" className="border-teal-400/30 text-teal-100" onClick={() => navigate("/komisyon-hesaplayici")}>
                          <Calculator className="w-3.5 h-3.5 mr-1" /> Komisyon
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="border-teal-400/30 text-teal-100" onClick={() => navigate("/araclar/vergi-simulator")}>
                          <Receipt className="w-3.5 h-3.5 mr-1" /> Vergi
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="border-teal-400/30 text-teal-100" onClick={() => navigate("/fiyatlandirma")}>
                          <Percent className="w-3.5 h-3.5 mr-1" /> Fiyatlandırma
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Sponsorlu İçerik Alanı</h4>
                      <div className="space-y-2">
                        {detailSponsored.map((item) => (
                          <Link key={item.id} to={`/ilan/${item.id}`} className="block rounded-lg border border-amber-400/20 bg-black/20 px-3 py-2 text-xs text-slate-200 hover:border-amber-300/40">
                            <p className="font-semibold text-amber-100">{item.title}</p>
                            <p className="text-slate-400">{item.city} · {item.district}</p>
                          </Link>
                        ))}
                      </div>
                      <p className="mt-2 text-[10px] text-slate-400">{SPONSORED_DISCLOSURE}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4">
                      <h4 className="mb-2 text-sm font-semibold text-white">Tapu ve İmar Özeti</h4>
                      <div className="space-y-1.5 text-xs text-slate-400">
                        <p>Tapu durumu: <span className="text-slate-200">{propertyDetails.deedStatus}</span></p>
                        <p>İmar uygunluğu: <span className="text-slate-200">{propertyDetails.eligibility}</span></p>
                        <p>Resmi belge paketi: <span className="text-slate-200">{auction.officialDocumentsForBuyer ? "Alıcıya açılıyor (demo)" : "Eksik / doğrulama bekliyor"}</span></p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4">
                      <h4 className="mb-2 text-sm font-semibold text-white">Çevre Bilgisi (mock)</h4>
                      <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                        <div>
                          <p className="mb-1 font-semibold text-slate-300">Okul</p>
                          {nearbyHighlights.education.map((item) => <p key={item.name}>{item.name}</p>)}
                        </div>
                        <div>
                          <p className="mb-1 font-semibold text-slate-300">Ulaşım</p>
                          {nearbyHighlights.transport.map((item) => <p key={item.name}>{item.name}</p>)}
                        </div>
                        <div>
                          <p className="mb-1 font-semibold text-slate-300">Hastane</p>
                          {nearbyHighlights.health.map((item) => <p key={item.name}>{item.name}</p>)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <DetailItem icon={<Building className="w-5 h-5" />} label="Oda" value={propertyDetails.roomCount} />
                    <DetailItem icon={<Layers className="w-5 h-5" />} label="Net m²" value={`${propertyDetails.netSqm} m²`} />
                    <DetailItem icon={<Layers className="w-5 h-5" />} label="Kat" value={propertyDetails.floor} />
                    <DetailItem icon={<Building className="w-5 h-5" />} label="Bina Yaşı" value={propertyDetails.buildingAge} />
                  </div>
                  {auction.virtualTour && (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-sm font-semibold text-white">360° Sanal Tur</div>
                          <div className="text-xs text-slate-400">Bu mülkü sanal olarak gezebilirsiniz.</div>
                        </div>
                        <Badge variant="outline" className="border-cyan-400/40 bg-cyan-500/10 text-cyan-200">
                          Foto Tur
                        </Badge>
                        <Button size="sm" onClick={() => setShowVirtualTour(true)} className="ml-auto bg-gradient-to-r from-blue-500 to-teal-400 text-white">Sanal Turu Başlat</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "details" && (
                <div className="grid sm:grid-cols-2 gap-3 animate-fade-in">
                  {[
                    { label: "Oda + Salon", value: propertyDetails.roomCount },
                    { label: "Brüt m²", value: `${propertyDetails.grossSqm} m²` },
                    { label: "Net m²", value: `${propertyDetails.netSqm} m²` },
                    { label: "Bulunduğu Kat", value: propertyDetails.floor },
                    { label: "Toplam Kat", value: `${propertyDetails.totalFloors}` },
                    { label: "Bina Yaşı", value: `${propertyDetails.buildingAge} Yıl` },
                    { label: "Isıtma", value: propertyDetails.heating },
                    { label: "Cephe", value: propertyDetails.facade },
                    { label: "Banyo", value: `${propertyDetails.bathroom}` },
                    { label: "Balkon", value: propertyDetails.balcony ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
                    { label: "Asansör", value: propertyDetails.elevator ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
                    { label: "Otopark", value: propertyDetails.parking ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
                    { label: "Eşyalı", value: propertyDetails.furnished ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
                    { label: "Kullanım Durumu", value: propertyDetails.usingStatus },
                    { label: "Tapu Durumu", value: propertyDetails.deedStatus },
                    { label: "Uygunluk", value: propertyDetails.eligibility },
                  ].map((item) => (
                    <div key={item.label as string} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-slate-200/80"><span className="text-sm text-slate-500">{item.label}</span><span className="text-sm font-medium text-white">{item.value}</span></div>
                  ))}
                </div>
              )}
              {activeTab === "features" && (
                <div className="animate-fade-in">
                  <div className="flex flex-wrap gap-2">
                    {features.map((f) => <Badge key={f} variant="outline" className="border-slate-200 text-slate-300 px-3 py-1.5 text-sm"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> {f}</Badge>)}
                  </div>
                </div>
              )}
              {activeTab === "location" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Yakın Çevre</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {nearbyFacilities.map((f) => {
                        const icons: Record<string, JSX.Element> = {
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
                      title={`${auction.title} konum haritası`}
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
              {activeTab === "virtualTour" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Video className="h-5 w-5 text-cyan-300" />
                      <div>
                        <p className="text-sm font-semibold text-white">360° Sanal Tur (mock)</p>
                        <p className="text-xs text-slate-300">Panoramik gorunum ve fotograf odakli vitrin galerisi.</p>
                      </div>
                      <Button size="sm" onClick={() => setShowVirtualTour(true)} className="ml-auto bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                        Sanal turu aç
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900/60">
                    <img
                      src={safeGalleryImages[0]}
                      alt={`${auction.title} sanal tur onizleme`}
                      className="h-[280px] w-full object-cover md:h-[360px]"
                      loading="lazy"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {virtualTourCards.map((card) => (
                      <article key={card.id} className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-900/60">
                        <img src={card.image} alt={card.title} className="h-24 w-full object-cover md:h-28" loading="lazy" />
                        <div className="space-y-1.5 p-3">
                          <p className="text-xs font-semibold text-white">{card.title}</p>
                          <p className="text-[11px] text-slate-300">{card.location}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-cyan-200">{card.price}</span>
                            <Button type="button" size="sm" className="h-7 rounded-full px-3 text-[11px]" onClick={() => setShowVirtualTour(true)}>
                              İncele
                            </Button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    Fotograf vitrin kartlari yalnizca demo amaclidir; canli entegrasyonda dogrudan ilan medyasi acilir.
                  </p>
                </div>
              )}
              {activeTab === "priceHistory" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-wrap gap-2">
                    {(["1H", "1G", "1A", "1Y"] as const).map((range) => (
                      <Button
                        key={range}
                        type="button"
                        size="sm"
                        variant={priceRange === range ? "default" : "outline"}
                        className={
                          priceRange === range
                            ? "bg-blue-600 text-white hover:bg-blue-500"
                            : "border-slate-700 bg-slate-950/70 text-slate-300 hover:bg-slate-900"
                        }
                        onClick={() => setPriceRange(range)}
                      >
                        {range}
                      </Button>
                    ))}
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={rangePriceData}>
                        <defs><linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                        <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₺${v}M`} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                        <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fill="url(#priceGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4">
                    <h4 className="mb-3 text-sm font-semibold text-white">Bölge m² fiyat trendi (mock)</h4>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={regionTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="period" stroke="#71717a" fontSize={12} />
                          <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} />
                          <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                          <Line type="monotone" dataKey="sqm" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4">
                    <h4 className="mb-3 text-sm font-semibold text-white">Benzer satışlar (mock)</h4>
                    <div className="space-y-2">
                      {comparableSales.map((row) => (
                        <div key={row.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs">
                          <div>
                            <p className="font-semibold text-slate-200">{row.title}</p>
                            <p className="text-slate-500">{row.sqm} m² · kapanış {row.closedAt}</p>
                          </div>
                          <p className="font-bold text-emerald-300">₺{row.price.toLocaleString("tr-TR")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {priceHistory.map((p, i) => (
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
                            ? `Bu gayrimenkul AI değerleme modelimize göre %${Math.abs(Number(priceDiffPercent))} oranında değerinin altında fiyatlandırılmış. ${auction.location} bölgesinde ortalama m² fiyatı ₺${areaStats.avgPricePerSqm.toLocaleString("tr-TR")} iken, bu ilan ₺${auction.pricePerSqm.toLocaleString("tr-TR")} / m² fiyatla listeleniyor.`
                            : `Bu gayrimenkul AI değerleme modelimize göre piyasa ortalamasına yakın fiyatlandırılmış. Talep endeksi ${areaStats.demandIndex}/100.`}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <AIBadge label="Yatırım Skoru" value={`${auction.investmentScore}/100`} color={auction.investmentScore >= 80 ? "emerald" : auction.investmentScore >= 60 ? "blue" : "slate"} />
                        <AIBadge label="Kira Getirisi" value={`%${areaStats.rentalYield}`} color="sky" />
                        <AIBadge label="Talep Endeksi" value={`${areaStats.demandIndex}/100`} color="violet" />
                        <AIBadge label="Yıllık Artış" value={`%${areaStats.priceChangeYearly}`} color="amber" />
                      </div>
                      <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5 mt-3">
                        {MASTER_INFO_DISCLAIMER}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Bölge İstatistikleri — {auction.district}</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <StatBadge label="Ort. m² Fiyat" value={`₺${areaStats.avgPricePerSqm.toLocaleString("tr-TR")}`} />
                      <StatBadge label="Aylık Değişim" value={`%${areaStats.priceChangeMonthly}`} positive={areaStats.priceChangeMonthly > 0} />
                      <StatBadge label="Yıllık Değişim" value={`%${areaStats.priceChangeYearly}`} positive={areaStats.priceChangeYearly > 0} />
                      <StatBadge label="Ort. Satış Süresi" value={`${areaStats.avgDaysOnMarket} gün`} />
                      <StatBadge label="Aktif İlan" value={`${areaStats.supplyCount}`} />
                      <StatBadge label="Kira Getirisi" value={`%${areaStats.rentalYield}`} />
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
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">AI Tahmini (resmi ekspertiz değildir)</span><span className="text-blue-400 font-semibold">₺{auction.aiPredictedPrice.toLocaleString("tr-TR")}</span></div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400" style={{ width: `${Math.min((liveBid / auction.aiPredictedPrice) * 100, 100)}%` }} /></div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed border border-slate-200/80 rounded-lg p-2.5 bg-white/[0.02]">
                  {isListingOnly ? (
                    <>
                      Bu ilan <strong className="text-slate-400">standart ilan</strong> modundadır: fiyat sabittir, özel teklifler ilan fiyatını değiştirmez. Satıcı alt/üst limit bandında teklifleri kabul, ret veya karşı teklif ile yönetir.
                    </>
                  ) : (
                    <>
                      Teklif verenlerin <strong className="text-slate-400">kimlik bilgileri ilanda yer almaz</strong>. Teklifler platform tarafından size iletilir; kabul sonrası süreç ve sözleşme{" "}
                      <strong className="text-slate-400">ihaleal.com</strong> üzerinden yürütülür (üretim hedefi). Sahte veya oyun amaçlı teklif yasaktır; cezai şartlar sözleşmede.
                    </>
                  )}
                </p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                    Doğrulanmış satıcı
                  </span>
                  <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-cyan-100">
                    Doğrulanmış mülk
                  </span>
                  <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-amber-200">
                    {EXPERT_APPROVAL_PENDING_NOTE}
                  </span>
                </div>
                {isAuctionMode ? (
                  <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
                    <p className="rounded-lg border border-rose-400/35 bg-rose-500/10 px-2 py-1.5 text-rose-100">
                      Bu ilanda teklifiniz bağlayıcıdır, geri alınamaz ve ihale sonuna kadar geçerlidir.
                    </p>
                    <p className="font-semibold text-amber-100">Sürpriz yok: cayma/ceza ve süreler işlem öncesi</p>
                    <div className="grid gap-2 text-[11px] text-slate-200 md:grid-cols-2">
                      <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-2">
                        Cayma cezası: %{(WITHDRAWAL_PENALTY_RATE * 100).toFixed(0)} = %{(VICTIM_COMPENSATION_RATE * 100).toFixed(0)} mağdura + %{(PLATFORM_PENALTY_RATE * 100).toFixed(0)} + KDV platforma.
                      </div>
                      <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-2">
                        Kazanan ödeme süresi: <strong className="text-cyan-200">3 iş günü</strong>. Ödeme yoksa cayma, teminat iradı, yedek alıcı sırası.
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-slate-700">
                      <table className="min-w-full text-left text-[11px]">
                        <thead className="bg-slate-900/80 text-slate-300">
                          <tr>
                            <th className="px-2 py-1.5">Adım</th>
                            <th className="px-2 py-1.5">Süre / Kural</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-200">
                          <tr><td className="px-2 py-1.5">Kazanan ödeme</td><td className="px-2 py-1.5">3 iş günü</td></tr>
                          <tr><td className="px-2 py-1.5">Yedek alıcı #2</td><td className="px-2 py-1.5">3 iş günü öncelik</td></tr>
                          <tr><td className="px-2 py-1.5">Yedek alıcı #3</td><td className="px-2 py-1.5">3 iş günü öncelik</td></tr>
                          <tr><td className="px-2 py-1.5">Satıcı tapu süreci</td><td className="px-2 py-1.5">15–20 iş günü hedefi</td></tr>
                          <tr><td className="px-2 py-1.5">Satıcı cayması</td><td className="px-2 py-1.5">Satıcı güvencesi iradı + alıcı tazminat/iade önceliği</td></tr>
                          <tr><td className="px-2 py-1.5">Kaybeden iade</td><td className="px-2 py-1.5">24–48 saat hedefi</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2 text-cyan-100">
                      {backupBidders.length > 0 ? (
                        <>
                          Yedek alıcı listesi:{" "}
                          {backupBidders.map((row) => `${row.rank}. ${row.maskedBidder}`).join(" · ")} (sırayla 3’er iş günü).
                        </>
                      ) : (
                        <>Yedek alıcı listesi teklif akışı geldikçe 2. ve 3. sıradan otomatik oluşturulur (mock).</>
                      )}
                    </div>
                    <p className="text-[10px] text-amber-100/90">{EXPERT_APPROVAL_PENDING_NOTE}</p>
                  </div>
                ) : null}
                <div className="flex gap-2 flex-wrap">
                  {isListingOnly ? (
                    <Button
                      className="flex-1 min-w-[8rem] bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-bold h-11"
                      onClick={() => {
                        setBidAmount(String(Math.max(standardFloorTry, liveBid)));
                        setShowBidDialog(true);
                      }}
                    >
                      <TrendingUp className="w-4 h-4 mr-1.5" /> Özel teklif ver
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 min-w-[8rem] bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-bold h-11 disabled:opacity-40 disabled:grayscale"
                      disabled={auctionEndedVisual}
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
                  )}
                  {auction.dealType !== "rent" && effectiveBuyNowTry != null ? (
                    <Button
                      variant="outline"
                      className="border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/10 h-11 px-3 shrink-0"
                      disabled={buyNowDisabled}
                      title={
                        isListingOnly
                          ? "Standart ilanda hemen al: sözleşme ve ödeme adımlarına geçiş."
                          : buyNowDisabled
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
                        if (isListingOnly) {
                          navigate(`/ihale/${auction.id}/hemen-al`);
                          return;
                        }
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
                        setBuyNowAcceptPenaltyPolicy(false);
                        setHemenAlGateOpen(true);
                      }}
                    >
                      Hemen Al ₺{(effectiveBuyNowTry / 1e6).toFixed(2)}M
                    </Button>
                  ) : null}
                  {isAuctionMode && !isStandardSeller && user && reportApproved && !depositId ? (
                    <Button type="button" variant="secondary" className="h-11 px-3 bg-white/10 text-white shrink-0" onClick={() => setPreAuthOpen(true)}>
                      Blokaj (demo)
                    </Button>
                  ) : null}
                  {isAuctionMode && isStandardSeller && user && !sellerDepositId ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-11 px-3 bg-violet-500/20 text-violet-100 shrink-0"
                      onClick={() => setPreAuthSellerOpen(true)}
                    >
                      Satıcı güvencesi (demo)
                    </Button>
                  ) : null}
                  {!isListingOnly && auction.dealType !== "rent" ? (
                    <Button variant="outline" className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-11 px-3 shrink-0" onClick={() => navigate("/mortgage")} title="Kredi Hesapla">
                      <Calculator className="w-4 h-4" />
                    </Button>
                  ) : null}
                    <Button variant="outline" className="border-slate-200 text-slate-300 hover:text-white h-11 px-3" type="button" aria-label="İletişim formuna git" onClick={scrollToContact} title="İletişim"><MessageSquare className="w-4 h-4" /></Button>
                </div>
                {isAuctionMode ? (
                  <div className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-3">
                    <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-slate-400">
                      <span>Açık artırma teklif derinliği</span>
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden /> CANLI
                      </span>
                    </div>
                    <p className="mb-2 text-[11px] text-slate-400">
                      Kaynak: {publicBidTapeActive ? <code>auction_bid_public_tape</code> : "maskeli demo akış"} · Ham teklif satırı kullanılmaz.
                    </p>
                    <div className="mb-2 grid grid-cols-3 gap-2 text-[11px]">
                      <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-2">
                        <p className="text-slate-500">İzleyen</p>
                        <p className="mt-1 text-sm font-bold text-white">{watchers.toLocaleString("tr-TR")}</p>
                      </div>
                      <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-2">
                        <p className="text-slate-500">Teklif</p>
                        <p className="mt-1 text-sm font-bold text-white">{liveBidCount.toLocaleString("tr-TR")}</p>
                      </div>
                      <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-2">
                        <p className="text-slate-500">Son Teklif</p>
                        <p className="mt-1 text-sm font-bold text-emerald-300">₺{latestTapeBid.toLocaleString("tr-TR")}</p>
                      </div>
                    </div>
                    {myBidSnapshot ? (
                      <div className="mb-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2 text-xs">
                        <p className="font-semibold text-cyan-100">
                          Senin teklifin: ₺{myBidSnapshot.amountTry.toLocaleString("tr-TR")} ·{" "}
                          {myBidRank != null ? `${myBidRank}. sıradasın` : "Sıra hesaplanıyor"}
                        </p>
                        <p className={myBidStatus === "winning" ? "mt-1 text-emerald-200" : "mt-1 text-amber-200"}>
                          {myBidStatus === "winning"
                            ? "Kazanıyorsun"
                            : myBidStatus === "outbid"
                              ? "Teklifin geçildi"
                              : "Teklifin işleniyor"}
                          {" · "}
                          {watchers.toLocaleString("tr-TR")} kişi izliyor
                        </p>
                      </div>
                    ) : user ? (
                      <p className="mb-2 text-[11px] text-slate-500">
                        Henüz teklifin yok. İlk tekliften sonra konumun ve "geçildi/kazanıyorsun" durumu burada görünür.
                      </p>
                    ) : null}
                    <div className="space-y-1.5">
                      {orderDepthRows.map((row) => (
                        <div
                          key={row.id}
                          className={`flex items-center justify-between rounded-md border px-2 py-1.5 text-xs transition ${
                            flashBidId === row.id
                              ? "border-emerald-400/60 bg-emerald-500/15"
                              : "border-slate-800 bg-slate-950/60"
                          }`}
                        >
                          <div className="relative mr-2 flex-1 overflow-hidden rounded bg-slate-900/70 px-2 py-1">
                            <div
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500/35 to-transparent"
                              style={{ width: `${row.depthPct}%` }}
                              aria-hidden
                            />
                            <div className="relative z-10 flex items-center justify-between">
                              <span className="font-semibold text-slate-200">#{row.rank} {row.maskedBidder}</span>
                              <span className="text-slate-400">{row.at}</span>
                            </div>
                          </div>
                          <span className="font-bold text-white">₺{row.amount.toLocaleString("tr-TR")}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">
                      {liveBidCount.toLocaleString("tr-TR")} teklif · {watchers.toLocaleString("tr-TR")} izleyen ·
                      <span className="ml-1 inline-flex items-center gap-1 text-emerald-300">
                        <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden />CANLI
                      </span>
                    </p>
                    <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/60 p-2">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Canlı İşlem Akışı</p>
                      <div className="space-y-1.5">
                        {tradeEvents.slice(0, 5).map((event) => (
                          <div
                            key={event.id}
                            className={`flex items-center justify-between rounded-md border px-2 py-1.5 text-xs ${
                              event.tone === "sold" ? "border-amber-500/40 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/10"
                            }`}
                          >
                            <span className="font-semibold text-slate-200">{maskBidderName(event.bidder)}</span>
                            <span className="text-slate-400">{event.at}</span>
                            <span className={event.tone === "sold" ? "font-bold text-amber-200" : "font-bold text-emerald-200"}>
                              {event.tone === "sold" ? "SATILDI" : `₺${event.amount.toLocaleString("tr-TR")}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
                {isListingOnly ? (
                  <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-3">
                    <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-cyan-100">
                      <span>Standart İlan Pazarlık Masası</span>
                      <span>Özel</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-lg border border-cyan-500/25 bg-slate-950/70 p-2">
                        <p className="text-slate-500">İlan fiyatı</p>
                        <p className="mt-1 text-sm font-bold text-white">₺{liveBid.toLocaleString("tr-TR")}</p>
                      </div>
                      <div className="rounded-lg border border-cyan-500/25 bg-slate-950/70 p-2">
                        <p className="text-slate-500">Satıcı limit bandı</p>
                        <p className="mt-1 text-sm font-bold text-cyan-100">
                          ₺{standardFloorTry.toLocaleString("tr-TR")} - ₺{standardCeilingTry.toLocaleString("tr-TR")}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-300">
                      Standart ilanda teklifler özeldir: alıcı yalnızca kendi teklifini görür, satıcı tüm teklifleri görür. Vitrin fiyatı değişmez.
                    </p>
                    {isLightVerificationFlow ? (
                      <p className="mt-2 text-[11px] text-cyan-100">
                        Kademeli güvence: bu mod teminatsızdır; KYC + mülk doğrulama zorunludur. Hukuki süreç {EXPERT_APPROVAL_PENDING_NOTE.toLocaleLowerCase("tr-TR")}
                      </p>
                    ) : null}
                    <div className="mt-3 space-y-1.5">
                      {visibleStandardOffers.slice(0, 4).map((offer) => (
                        <div key={offer.id} className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-1.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-200">{offer.bidderMask}</span>
                            <span className="font-bold text-white">₺{offer.amountTry.toLocaleString("tr-TR")}</span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {offer.status === "pending"
                              ? "Satıcı değerlendirmesinde"
                              : offer.status === "accepted"
                                ? "Kabul edildi"
                                : offer.status === "rejected"
                                  ? "Reddedildi"
                                  : `Karşı teklif: ₺${(offer.counterAmountTry ?? 0).toLocaleString("tr-TR")}`}
                          </p>
                          {offer.status === "pending" && isStandardSeller ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => applyStandardDecision(offer.id, "accepted")}
                                className="rounded border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200"
                              >
                                Kabul
                              </button>
                              <button
                                type="button"
                                onClick={() => applyStandardDecision(offer.id, "rejected")}
                                className="rounded border border-rose-400/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200"
                              >
                                Ret
                              </button>
                              <button
                                type="button"
                                onClick={() => applyStandardDecision(offer.id, "countered")}
                                className="rounded border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200"
                              >
                                Karşı teklif
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                      {visibleStandardOffers.length === 0 ? (
                        <p className="text-[11px] text-slate-500">
                          {user ? "Görüntülenecek özel teklif yok." : "Özel teklifleri görmek için giriş yapın."}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <div className="pt-4 border-t border-slate-200/80 space-y-3">
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                    <div className="text-sm font-semibold text-white">{PLATFORM_LISTING_CONTACT.displayName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{PLATFORM_LISTING_CONTACT.roleLine}</div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{PLATFORM_LISTING_CONTACT.detailLine}</p>
                  </div>
                  <Button variant="outline" className="w-full border-slate-200 text-slate-300 hover:text-white gap-2 h-10" type="button" onClick={() => window.open("mailto:destek@ihaleal.com?subject=İlan%20talebi%20" + encodeURIComponent(auction.id), "_blank")}>
                    <Mail className="w-4 h-4" /> Talep oluştur (e-posta)
                  </Button>
                  <Button variant="outline" className="w-full border-slate-200 text-slate-300 hover:text-white gap-2 h-10" type="button" onClick={scrollToContact}>
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
                  <h4 className="text-sm font-semibold text-white">Komisyon ve Maliyet Hesaplayıcı</h4>
                  <Badge variant="outline" className="border-teal-500/20 text-teal-400 text-[10px] ml-auto">{feeBadgeLabel()}</Badge>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-slate-200/80 space-y-3">
                  <div>
                    <label htmlFor="detail-cost-basis" className="text-[11px] text-slate-500">
                      Hesaplama tutarı (₺)
                    </label>
                    <Input
                      id="detail-cost-basis"
                      inputMode="numeric"
                      value={String(effectiveCalcBid)}
                      onChange={(e) => {
                        const normalized = Number(e.target.value.replace(/[^\d]/g, ""));
                        setCalculatorBid(Number.isFinite(normalized) && normalized > 0 ? normalized : liveBid);
                      }}
                      className="mt-1 bg-slate-950 border-slate-200 text-white"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{isListingOnly ? "İlan tutarı (referans)" : "İhale / teklif tutarı (tahmini)"}</span>
                    </div>
                    <div className="text-lg font-bold text-white">₺{effectiveCalcBid.toLocaleString("tr-TR")}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Alıcı komisyonu</span><span className="text-slate-300 font-medium">₺{buyerTotals.commission.toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Alıcı KDV</span><span className="text-slate-300 font-medium">₺{buyerTotals.vatOnCommission.toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Tapu Harci (%{(runtimeTax.deedDutyRate * 100).toFixed(0)})</span><span className="text-slate-300 font-medium">₺{closing.deed.toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Döner Sermaye</span><span className="text-slate-300 font-medium">₺{closing.fixed.toLocaleString("tr-TR")}</span></div>
                    <div className="border-t border-slate-200/80 pt-2 flex justify-between font-semibold"><span className="text-teal-400">Alıcı toplam öder</span><span className="text-teal-400">₺{closing.total.toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Satıcı komisyon + KDV</span><span className="text-slate-400">₺{(sellerTotals.commission + sellerTotals.vatOnCommission).toLocaleString("tr-TR")}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Satıcı net (calcSellerNet)</span><span className="text-emerald-300">₺{sellerTotals.net.toLocaleString("tr-TR")}</span></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed px-0.5">{FEE_TEXTS.commissionMatrahLine()}</p>
                <p className="text-[10px] text-amber-200/90 leading-relaxed px-0.5">
                  Vergi notu: satış kazancınız vergiye tabi olabilir, mali müşavire danışın. 2026 referansı: kira istisnası ₺
                  {runtimeTax.rentalExemptionTry2026.toLocaleString("tr-TR")}, 5 yıl+ satış istisnası {runtimeTax.saleTaxFreeAfterYears} yıl,
                  yeniden değerleme %{Math.round(runtimeTax.revaluationRate2026 * 100)} (mali müşavir onayı bekliyor).
                </p>
                <button onClick={() => navigate("/ihale-kosullari")} className="text-xs text-slate-500 hover:text-teal-400 transition-colors flex items-center gap-1"><Percent className="w-3 h-3" /> Komisyon yapısını detaylı incele</button>
              </CardContent>
            </Card>

            <Card className={`bg-slate-900/50 border-slate-200/80 transition-all duration-700 delay-450 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <CardContent className="p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Hızlı Hesaplayıcılar</h4>
                  <p className="text-xs text-slate-400 mt-1">İlan detayından araçlara tek tık geçiş (demo).</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Button type="button" size="sm" variant="outline" className="justify-start border-slate-700 text-slate-200" onClick={() => navigate("/komisyon-hesaplayici")}>
                    <Calculator className="w-3.5 h-3.5 mr-2" /> Komisyon hesaplayıcı
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="justify-start border-slate-700 text-slate-200" onClick={() => navigate("/araclar/vergi-simulator")}>
                    <Receipt className="w-3.5 h-3.5 mr-2" /> Vergi simülatörü
                  </Button>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Sponsorlu İçerik Alanı</h4>
                  <div className="mt-2 space-y-2">
                    {detailSponsored.map((item) => (
                      <Link key={`sticky-${item.id}`} to={`/ilan/${item.id}`} className="block rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 hover:border-amber-400/40">
                        <p className="font-semibold text-amber-100">{item.title}</p>
                        <p className="text-slate-500">{item.city} · {item.district}</p>
                      </Link>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">{SPONSORED_DISCLOSURE}</p>
                </div>
              </CardContent>
            </Card>

            <InvestorTrustStrip className="mb-6" />

            <Card className={`bg-slate-900/50 border-slate-200/80 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  <h4 className="text-sm font-semibold text-white">Güven ve Uyum Göstergeleri</h4>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    KYC + mülk sahipliği doğrulama: sahte ilanı önleme katmanı.
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-500/10 px-2 py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                    Kademeli model: standart ilanda teminatsız/doğrulamalı, borsada çift taraflı teminat.
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2 py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-300 shrink-0" />
                    Simetri: alıcı cayarsa teminat riski, satıcı cayarsa satıcı güvencesi devreye girer (mock).
                  </div>
                  <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-1.5 text-amber-100">
                    {PSP_FLOW_DISCLAIMER} · {EXPERT_APPROVAL_PENDING_NOTE}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1.5">
                      <p className="text-slate-400">Alıcı teminatı</p>
                      <p className={buyerGuaranteeMissing ? "font-semibold text-amber-200" : "font-semibold text-emerald-300"}>
                        {isAuctionCollateralFlow ? (depositId ? "Hazır" : "Bekliyor") : "Gerekmiyor"}
                      </p>
                    </div>
                    <div className="rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1.5">
                      <p className="text-slate-400">Satıcı güvencesi</p>
                      <p className={sellerGuaranteeMissing ? "font-semibold text-amber-200" : "font-semibold text-emerald-300"}>
                        {isAuctionCollateralFlow ? (sellerDepositId ? "Hazır" : "Bekliyor") : "Gerekmiyor"}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-3">Not: nihai hukuki statü, sözleşme paketleri ve avukat incelemesiyle kesinleşir.</p>
              </CardContent>
            </Card>

            <Card className={`mt-4 bg-slate-900/50 border-slate-200/80 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-cyan-300" />
                  <h4 className="text-sm font-semibold text-white">Escrow & Float Yönetimi (mock)</h4>
                </div>
                <p className="text-xs text-cyan-100">{PSP_FLOW_DISCLAIMER}</p>
                <div className="grid gap-2 text-[11px] md:grid-cols-2">
                  <div className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-2">
                    <p className="text-slate-400">Bekleyen escrow float</p>
                    <p className="font-semibold text-cyan-200">₺{pendingEscrowFloatTry.toLocaleString("tr-TR")}</p>
                    <p className="mt-1 text-[10px] text-slate-500">Platform bakiyesinde tutulmaz; lisanslı PSP emanet hesabında izlenir.</p>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-2">
                    <p className="text-slate-400">Tapu devri sonrası serbest bırakma</p>
                    <p className="font-semibold text-emerald-200">
                      {demoBuyNowWon ? "Onaylandı: satıcıya net ödeme + komisyon kesintisi" : "Tapu devri onayı bekliyor"}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Devir onayıyla satıcı ödemesi tetiklenir; komisyon kalemi eşzamanlı mahsup edilir (mock akış).
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100">
                  İade prensibi: "geldiği yoldan geri" ({refundReferenceMethod}) + KYC eşleşme kontrolü (AML). Kaybeden teminat iadesi hedefi 24-48 saat, kusursuz öncelikli.
                </div>
                <div className="rounded-lg border border-violet-500/25 bg-violet-500/10 px-3 py-2 text-[11px] text-violet-100">
                  Mağdur %2 tazminat: gider pusulası referansı <strong>{compensationReceiptRef}</strong>, PSP dekontu ve doğrulanmış hesaba transfer (mükellef olmayan için gider pusulası akışı).
                </div>
                <p className="text-[10px] text-slate-500">{EXPERT_APPROVAL_PENDING_NOTE}</p>
              </CardContent>
            </Card>

            {isRent ? (
              <Card className={`mt-4 bg-slate-900/50 border-slate-200/80 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                <CardContent className="p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-white">Kiralama Koruma Akışı (kiraya veren + kiralayan)</h4>
                  <p className="text-xs text-slate-300">
                    Kira sözleşmesi, depozito escrow (lisanslı PSP), bir aylık kira komisyonu ve ödeme takibi iki tarafı birlikte koruyacak şekilde tasarlanır (mock).
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    <li>• Depozito emanet: platform parayı tutmaz, lisanslı escrow/PSP hesabında bloke kalır.</li>
                    <li>• Komisyon: kiralama başarıyla tamamlandığında 1 aylık kira + KDV referansı.</li>
                    <li>• Ödeme takibi: kiraya veren/kiralayan için gecikme, tahsilat ve iade adımları kayıtlı ilerler.</li>
                    <li>• İki taraf koruması: sözleşme ihlali ve depozito ihtilafında kayıt/kanıt akışı.</li>
                  </ul>
                  <p className="text-[11px] text-amber-200">
                    Kira istisnası 2026 referansı: ₺{runtimeTax.rentalExemptionTry2026.toLocaleString("tr-TR")} (mali müşavir teyidi gerekir).
                  </p>
                </CardContent>
              </Card>
            ) : null}

            {isDevrenFlow ? (
              <Card className={`mt-4 bg-slate-900/50 border-slate-200/80 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                <CardContent className="p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-white">Devren İşletme Koruma Akışı (devreden + devralan)</h4>
                  <p className="text-xs text-slate-300">
                    Devir sözleşmesi taslağı; ciro, kira, devir bedeli, ekipman/çalışan devri ve mevcut sözleşmelerin maddeli kontrolü ile iki tarafı korur (mock).
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    <li>• Finansal paket: ciro-kira-devir bedeli doğrulama + belge eşleştirme.</li>
                    <li>• Varlık devri: ekipman listesi, personel geçişi, marka/franchise hakları kontrolü.</li>
                    <li>• Sözleşme devri: kira sözleşmesi ve tedarik sözleşmelerinin devre uygunluk incelemesi.</li>
                    <li>• İki taraf koruması: gizli borç/haciz/sözleşme feshi risklerine karşı beyan + kayıt katmanı.</li>
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog open={securityDialogOpen} onOpenChange={setSecurityDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {securityStage === "summary" ? "2 aşamalı güvenli onay" : "Şifre + OTP doğrulama"}
            </DialogTitle>
          </DialogHeader>
          {securityAction ? (
            <div className="space-y-3">
              {securityStage === "summary" ? (
                <>
                  <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">
                    {securityAction.listingTitle} mülküne <strong>₺{securityAction.amountTry.toLocaleString("tr-TR")}</strong>{" "}
                    {securityAction.type === "buy_now" ? "Hemen Al" : "teklif"} işlemi başlatılıyor.
                  </div>
                  <p className="text-xs text-amber-100">
                    Cayma durumunda sözleşme taslağındaki %{(WITHDRAWAL_PENALTY_RATE * 100).toFixed(0)} ceza kuralı uygulanır.
                    {newDeviceRisk ? " Yeni cihaz algılandı; ek doğrulama zorunlu." : ""}
                  </p>
                  <p className="text-xs text-slate-400">
                    İşlem sonrası SMS + e-posta teyitleri otomatik gönderilir (mock). {EXPERT_APPROVAL_PENDING_NOTE}
                  </p>
                  <p className="text-[11px] text-cyan-100">
                    Bu adımda vereceğiniz "okudum, anladım, kabul ediyorum" onayı zaman damgası ile kayıt altına alınır (mock audit kaydı).
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Sözleşme/teklif verileri maskeleme ve erişim politikası ile korunur; reklam verenler kullanıcı verisine erişemez (RLS/rol bazlı taslak).
                  </p>
                </>
              ) : (
                <>
                  <Input
                    type="password"
                    value={txPassword}
                    onChange={(e) => setTxPassword(e.target.value)}
                    className="bg-slate-950 border-slate-200 text-white"
                    placeholder="İşlem şifresi (veya PIN)"
                  />
                  <Input
                    inputMode="numeric"
                    value={txPin}
                    onChange={(e) => setTxPin(e.target.value)}
                    className="bg-slate-950 border-slate-200 text-white"
                    placeholder="PIN (min 4 hane)"
                  />
                  <Input
                    inputMode="numeric"
                    value={txOtp}
                    onChange={(e) => setTxOtp(e.target.value)}
                    className="bg-slate-950 border-slate-200 text-white"
                    placeholder="OTP/SMS kodu (6 hane)"
                  />
                  {newDeviceRisk ? (
                    <Input
                      inputMode="numeric"
                      value={txRiskOtp}
                      onChange={(e) => setTxRiskOtp(e.target.value)}
                      className="bg-slate-950 border-amber-400/40 text-white"
                      placeholder="Yeni cihaz ek doğrulama kodu (6 hane)"
                    />
                  ) : null}
                  <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                    <Checkbox checked={txBiometricAck} onCheckedChange={(c) => setTxBiometricAck(c === true)} className="mt-0.5" />
                    <span>Mobil biyometrik/yüz doğrulama adımını tamamladım (mock).</span>
                  </label>
                  <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                    <Checkbox checked={txNotifyAck} onCheckedChange={(c) => setTxNotifyAck(c === true)} className="mt-0.5" />
                    <span>Bu işlem için SMS + e-posta teyitlerinin gönderileceğini kabul ediyorum.</span>
                  </label>
                  <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                    <Checkbox checked={txInformedConsentAck} onCheckedChange={(c) => setTxInformedConsentAck(c === true)} className="mt-0.5" />
                    <span>Okudum, anladım, kabul ediyorum (bilgilendirilmiş onay).</span>
                  </label>
                  {user?.email ? (
                    <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                      <Checkbox checked={txEsignAck} onCheckedChange={(c) => setTxEsignAck(c === true)} className="mt-0.5" />
                      <span>E-imza/e-onay: {user.email} adresiyle elektronik onayı veriyorum.</span>
                    </label>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-white/15 text-slate-200"
              onClick={() => {
                setSecurityDialogOpen(false);
                resetSecurityInputs();
                pendingSecureActionRef.current = null;
              }}
            >
              Vazgeç
            </Button>
            {securityStage === "summary" ? (
              <Button type="button" className="bg-gradient-to-r from-blue-500 to-teal-400 text-white" onClick={() => setSecurityStage("verify")}>
                Onayla ve doğrulamaya geç
              </Button>
            ) : (
              <Button type="button" className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white" onClick={() => void confirmSecurityStep()}>
                Şifre + OTP ile işlemi tamamla
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showBidDialog}
        onOpenChange={(open) => {
          setShowBidDialog(open);
          if (open) setBidGateAck(initialBidGateAck());
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-200 text-white sm:max-w-lg max-h-[min(90vh,640px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isListingOnly ? "Özel teklif ver" : isSealedOffer ? "Kapalı teklif ver" : isAuctionMode ? "Teklif ver" : "Teklif"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-[10px] text-amber-200/90 leading-relaxed rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2">
              {AUCTION_INFO_DISCLAIMER}
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Kimlik ve iletişim bilginiz ilan sahibine <strong className="text-slate-400">açıkça gösterilmez</strong>. Kabul ve sözleşme aşamasında süreç ihaleal.com üzerinden yürütülür (üretim hedefi; bu ekran demo).
            </p>
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-sm text-slate-400">{auction.title}</p>
              <p className="text-lg font-bold text-blue-400 mt-1">₺{liveBid.toLocaleString("tr-TR")}</p>
              {isListingOnly ? (
                <p className="mt-1 text-[11px] text-cyan-100">
                  Standart ilan fiyatı sabit: özel teklif aralığı ₺{standardFloorTry.toLocaleString("tr-TR")} - ₺{standardCeilingTry.toLocaleString("tr-TR")}
                </p>
              ) : null}
            </div>
            <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/10">
              <p className="text-xs text-slate-400 mb-1">Tahmini Toplam Maliyet (Komisyon + Harçlar Dahil)</p>
              <p className="text-sm font-bold text-teal-400">₺{estimateBuyerClosingCosts(liveBid).total.toLocaleString("tr-TR")}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Alıcı platform: fees.ts · tapu %{(runtimeTax.deedDutyRate * 100).toFixed(0)} + sabit masraf (demo)
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setBidAmount(String(Math.round(liveBid * 1.05)))}
                className="px-2 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-xs font-semibold text-cyan-100 transition-colors"
              >
                +%5
              </button>
              <button
                type="button"
                onClick={() => setBidAmount(String(Math.round(liveBid * 1.1)))}
                className="px-2 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-xs font-semibold text-cyan-100 transition-colors"
              >
                +%10
              </button>
              {bidIncrements.map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setBidAmount(String((isListingOnly ? standardFloorTry : liveBid) + inc))}
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
            {isAuctionMode ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-100">
                <p>
                  Teklifiniz için kartınızda{" "}
                  <strong className="text-amber-50">₺{(Math.round(liveBid * bidPreAuthRate * 100) / 100).toLocaleString("tr-TR")}</strong>{" "}
                  (teminat %{(bidPreAuthRate * 100).toFixed(0)}) bloke edilecektir.
                </p>
                <p className="mt-1">
                  Bu tutar <strong>çekilmez</strong>, yalnızca rezerve edilir. Kazanırsanız ödemeye sayılır; kazanmazsanız blokaj çözülür.
                </p>
                <p className="mt-1 text-[10px] text-amber-200/90">
                  {EXPERT_APPROVAL_PENDING_NOTE} · demo ön yetki simülasyonu.
                </p>
                {user && reportApproved && !depositId ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-2 h-8 bg-amber-500/20 text-amber-50 hover:bg-amber-500/30"
                    onClick={() => setPreAuthOpen(true)}
                  >
                    Kart blokesini şimdi başlat
                  </Button>
                ) : null}
              </div>
            ) : null}
            {isAuctionMode ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-black/20 p-3">
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-2 text-[11px] text-cyan-100">
                  <p className="font-semibold">Teklif süreç kuralları (özet)</p>
                  <ul className="mt-1.5 space-y-1 leading-snug text-cyan-50/90">
                    <li>• Borsa modunda teklif geri alınamaz; geçerlilik ihale sonuna kadardır.</li>
                    <li>• Standart modda teklif kabul öncesi geri alınabilir; kabul sonrası çekme cezası uygulanır.</li>
                    <li>• Fiyat değişimi: borsada açılış sonrası sabit; standartta düşürme serbest, aktif teklif varken yükseltme kısıtlıdır.</li>
                    <li>• Kazanan ödeme süresi 3 iş günü; süresi geçen işlemlerde cayma/teminat süreci devreye girer.</li>
                  </ul>
                </div>
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
            ) : (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-black/20 p-3">
                <p className="text-xs font-semibold text-white">Teklif süreç kuralları</p>
                <ul className="space-y-1 text-[11px] leading-snug text-slate-300">
                  <li>Standart teklif kabul öncesi geri alınabilir; kabul sonrası çekme cezası devreye girer.</li>
                  <li>Standart teklif geçerlilik süresi 48 saat, karşı teklif geçerlilik süresi 24 saattir.</li>
                  <li>Standart modda satıcı fiyat düşürebilir; aktif teklif varken fiyat yükseltme kısıtlıdır.</li>
                  <li>İşlem tamamlanmadan haksız çekilme, ilgili ceza/tazmin akışını tetikler (demo kural seti).</li>
                </ul>
                <label className="flex gap-3 text-left text-[11px] text-slate-300 leading-snug cursor-pointer">
                  <Checkbox
                    checked={standardRulesAccepted}
                    onCheckedChange={(v) => setStandardRulesAccepted(v === true)}
                    className="mt-0.5 border-white/25 data-[state=checked]:bg-blue-600"
                  />
                  <span>Bu kuralları okudum ve kabul ediyorum.</span>
                </label>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-end">
            <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => setShowBidDialog(false)}>
              Vazgeç
            </Button>
            <Button
              type="button"
              disabled={bidBusy || (isAuctionMode && !isBidGateComplete(bidGateAck)) || (!isAuctionMode && !standardRulesAccepted)}
              title={
                isAuctionMode && !isBidGateComplete(bidGateAck)
                  ? "Tüm onay kutularını işaretleyin"
                  : !isAuctionMode && !standardRulesAccepted
                    ? "Standart teklif kurallarını onaylayın"
                    : undefined
              }
              onClick={() => void handleBid()}
              className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold disabled:opacity-40"
            >
              {bidBusy
                ? "Gönderiliyor..."
                : isListingOnly
                  ? "Özel teklifi gönder"
                  : isSealedOffer
                    ? "Kapalı teklifi gönder"
                    : "Teklif Ver"}
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
              Teklifiniz için kartınızda{" "}
              <strong className="text-white">₺{(Math.round(liveBid * bidPreAuthRate * 100) / 100).toLocaleString("tr-TR")}</strong>{" "}
              (teminat %{(bidPreAuthRate * 100).toFixed(0)}) bloke edilecektir.
            </p>
            <p>Bu tutar çekilmez, yalnızca rezerve edilir. Kazanırsanız ödemeye sayılır; kazanmazsanız blokaj çözülür.</p>
            <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5">
              Gerçek kart tahsilatı yok; demo pre-auth simülasyonu çalışır. {EXPERT_APPROVAL_PENDING_NOTE}
            </p>
            <p className="text-[11px] text-slate-300">
              İade "geldiği yoldan geri" kuralıyla aynı kart/IBAN kanalına yönlenir; KYC eşleşmesi olmadan çıkış yapılmaz (AML taslağı).
            </p>
            <p>
              Cayma cezası taslağı: toplam %{(WITHDRAWAL_PENALTY_RATE * 100).toFixed(0)} (₺{totalPenaltyTry.toLocaleString("tr-TR")}) —
              mağdur tarafa %{(VICTIM_COMPENSATION_RATE * 100).toFixed(0)} tazminat (₺{victimCompensationTry.toLocaleString("tr-TR")}),
              platforma %{(PLATFORM_PENALTY_RATE * 100).toFixed(0)} + KDV (₺{platformPenaltyTry.toLocaleString("tr-TR")} + ₺{platformPenaltyVatTry.toLocaleString("tr-TR")}).
            </p>
            <p className="text-[11px] text-slate-400">
              Float görünümü yalnızca panelde raporlanır; fonlar platform hesabına geçmeden lisanslı escrow/PSP tarafında bekler.
            </p>
            <p className="text-[11px] text-amber-200/90">{EXPERT_APPROVAL_PENDING_NOTE}</p>
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

      <Dialog open={preAuthSellerOpen} onOpenChange={setPreAuthSellerOpen}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Satıcı güvencesi (simetrik, mock)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              Satıcı cayma riskine karşı güvence tutarı:{" "}
              <strong className="text-white">₺{(Math.round(liveBid * 0.01 * 100) / 100).toLocaleString("tr-TR")}</strong>
              {" "}(%1,0 referans).
            </p>
            <p>{PSP_FLOW_DISCLAIMER}</p>
            <p className="text-[11px] text-slate-300">
              Satıcı sözleşmeden haksız dönerse satıcı güvencesi irat sürecine girer; mağdur alıcıya tazminat, öncelikli iade ve ek zarar talebi kanalı açılır (mock akış).
            </p>
            <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5">
              {EXPERT_APPROVAL_PENDING_NOTE}
            </p>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Kart token (demo)</label>
              <Input value={cardToken} onChange={(e) => setCardToken(e.target.value)} className="bg-slate-950 border-slate-200 text-white" placeholder="test-ok veya test-fail" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => setPreAuthSellerOpen(false)}>
              Vazgeç
            </Button>
            <Button type="button" className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white" disabled={preAuthBusy} onClick={() => void runSellerPreAuth()}>
              {preAuthBusy ? "İşleniyor..." : "Satıcı güvencesini kaydet"}
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
            <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5">{AUCTION_INFO_DISCLAIMER}</p>
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
                <span>Yukarıdaki sözleşme ve koşul bağlantılarını inceledim; satılık Hemen Al&apos;ın aracı satış akışı olduğunu anlıyorum.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer text-xs">
                <Checkbox checked={buyNowAcceptMasak} onCheckedChange={(c) => setBuyNowAcceptMasak(c === true)} className="mt-0.5" />
                <span>MASAK / KYC ve şüpheli işlem prosedürüne uygun veri işlenmesini kabul ediyorum.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer text-xs">
                <Checkbox checked={buyNowAcceptCard} onCheckedChange={(c) => setBuyNowAcceptCard(c === true)} className="mt-0.5" />
                <span>Kart blokesi ve PSP kurallarını (3D Secure, capture) okudum.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer text-xs">
                <Checkbox checked={buyNowAcceptModule3} onCheckedChange={(c) => setBuyNowAcceptModule3(c === true)} className="mt-0.5" />
                <span>Hemen Al ihlal / kötüye kullanım uyarılarını okudum.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer text-xs">
                <Checkbox checked={buyNowAcceptPenaltyPolicy} onCheckedChange={(c) => setBuyNowAcceptPenaltyPolicy(c === true)} className="mt-0.5" />
                <span>
                  Cayma-ceza ve süre tablosunu işlem öncesi gördüm: %{(WITHDRAWAL_PENALTY_RATE * 100).toFixed(0)} ceza dağılımı (%2 mağdur, %3+KDV platform),
                  kazanan 3 iş günü, yedek alıcılar 3’er iş günü.
                </span>
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
                disabled={!(buyNowAcceptContracts && buyNowAcceptMasak && buyNowAcceptCard && buyNowAcceptModule3 && buyNowAcceptPenaltyPolicy)}
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
                ₺{(Math.round((effectiveBuyNowTry ?? 0) * 0.015 * 100) / 100).toLocaleString("tr-TR")}
              </strong>{" "}
              (Hemen Al bedeli üzerinden %1,5; PSP provizyonu).
            </p>
            <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5">
              Gercek odeme baglaninca 3D Secure zorunlu olur; simdi demo token ile on yetki simule edilir.
            </p>
            <p className="text-[11px] text-slate-300">
              Kaybeden veya kusursuz iptal iadesi aynı kart/IBAN kanalına 24-48 saat hedefiyle döner; doğrulanmamış hesaba iade yapılmaz (AML/KYC).
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
              {preAuthBusy ? "İşleniyor..." : "Blokajı başlat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBuyNowConfirm} onOpenChange={setShowBuyNowConfirm}>
        <DialogContent className="bg-slate-900 border-slate-200 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Hemen Al — işlemi tamamla</DialogTitle>
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
