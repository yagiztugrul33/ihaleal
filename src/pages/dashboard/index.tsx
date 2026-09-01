import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LayoutDashboard,
  Gavel,
  Store,
  Heart,
  Search,
  FileText,
  Shield,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FLOW_LABELS,
  mergedFlowPermissions,
  readUserFlowsFromStorage,
  type UserFlow,
} from "@/lib/userFlows";
import { useLocale } from "@/contexts/LocaleContext";

function readSession(): unknown {
  try {
    return JSON.parse(localStorage.getItem("ihaleal_user") || "null");
  } catch {
    return null;
  }
}

export default function FlowDashboard() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const d = t.dashboard;
  const [boot, setBoot] = useState<"loading" | "ready">("loading");
  const [flows, setFlows] = useState<UserFlow[]>([]);

  useEffect(() => {
    const u = readSession();
    if (!u) {
      navigate("/giris", { replace: true });
      return;
    }
    const f = readUserFlowsFromStorage();
    if (f.length === 0) {
      navigate("/onboarding/akis", { replace: true });
      return;
    }
    setFlows(f);
    setBoot("ready");
  }, [navigate]);

  useEffect(() => {
    const onFlows = () => {
      const u = readSession();
      if (!u) return;
      const f = readUserFlowsFromStorage();
      if (f.length) setFlows(f);
    };
    window.addEventListener("ihaleal-user-flows", onFlows);
    window.addEventListener("storage", onFlows);
    return () => {
      window.removeEventListener("ihaleal-user-flows", onFlows);
      window.removeEventListener("storage", onFlows);
    };
  }, []);

  const perms = useMemo(() => mergedFlowPermissions(flows), [flows]);

  if (boot === "loading") {
    return (
      <div className="min-h-screen px-4 pt-28 pb-16" data-demo="true">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="skeleton-shimmer h-8 w-48 rounded-[10px]" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="skeleton-shimmer h-28 rounded-[20px]" />
            <div className="skeleton-shimmer h-28 rounded-[20px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-demo="true">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {d.back}
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-normal text-white flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-violet-400" />
            {d.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{d.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {flows.map((f) => (
            <Badge key={f} variant="outline" className="border-teal-500/30 text-teal-200">
              {FLOW_LABELS[f].title}
            </Badge>
          ))}
          <Button type="button" variant="ghost" size="sm" className="text-xs text-slate-500" onClick={() => navigate("/onboarding/akis")}>
            {d.changeFlows}
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {perms.canCreateListing ? (
            <Card className="border-slate-200/80 bg-slate-900/40">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white font-normal">
                  <Store className="w-5 h-5 text-cyan-400" />
                  {d.cardListingsTitle}
                </div>
                <p className="text-xs text-slate-500">{d.cardListingsBody}</p>
                <Button type="button" className="w-full mt-1 bg-cyan-600/80 hover:bg-cyan-500 text-white" onClick={() => navigate("/sat-basla")}>
                  {d.cardListingsCta}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {perms.canOpenAuction ? (
            <Card className="border-slate-200/80 bg-slate-900/40">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white font-normal">
                  <Gavel className="w-5 h-5 text-blue-400" />
                  {d.cardAuctionTitle}
                </div>
                <p className="text-xs text-slate-500">{d.cardAuctionBody}</p>
                <Button type="button" className="w-full mt-1 [background:var(--gradient-cta)] text-white" onClick={() => navigate("/ihale-ac")}>
                  {d.cardAuctionCta}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {perms.canBid ? (
            <Card className="border-slate-200/80 bg-slate-900/40">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white font-normal">
                  <ClipboardList className="w-5 h-5 text-amber-400" />
                  {d.cardBidsTitle}
                </div>
                <p className="text-xs text-slate-500">{d.cardBidsBody}</p>
                <Button type="button" variant="outline" className="w-full mt-1 border-amber-500/30 text-amber-100" onClick={() => navigate("/evraklar")}>
                  {d.cardBidsCta}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-slate-200/80 bg-slate-900/40">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white font-normal">
                <Heart className="w-5 h-5 text-pink-400" />
                {d.cardFavoritesTitle}
              </div>
              <Button type="button" variant="outline" className="w-full mt-1 border-pink-500/30 text-pink-100" onClick={() => navigate("/favoriler")}>
                {d.cardFavoritesCta}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-slate-900/40">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white font-normal">
                <Search className="w-5 h-5 text-slate-300" />
                {d.cardSavedSearchTitle}
              </div>
              <Button type="button" variant="outline" className="w-full mt-1 border-white/15" onClick={() => navigate("/arama")}>
                {d.cardSavedSearchCta}
              </Button>
            </CardContent>
          </Card>

          {flows.includes("auction_seller") ? (
            <Card className="border-slate-200/80 bg-slate-900/40">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white font-normal">
                  <Shield className="w-5 h-5 text-teal-400" />
                  {d.cardAuthorityTitle}
                </div>
                <Button type="button" variant="outline" className="w-full mt-1 border-teal-500/30 text-teal-100" onClick={() => navigate("/auth/edevis-mock")}>
                  {d.cardAuthorityCta}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-slate-200/80 bg-slate-900/40">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white font-normal">
                <FileText className="w-5 h-5 text-slate-400" />
                {d.cardProfileTitle}
              </div>
              <Button type="button" variant="outline" className="w-full mt-1 border-white/15" onClick={() => navigate("/profil")}>
                {d.cardProfileCta}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200/80 bg-slate-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400 mb-2">{d.investorPortfolioNote}</p>
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate("/dashboard/yatırımci")}>
              {d.investorPortfolioCta}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

