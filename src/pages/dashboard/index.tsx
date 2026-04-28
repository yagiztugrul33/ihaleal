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

function readSession(): unknown {
  try {
    return JSON.parse(localStorage.getItem("ihaleal_user") || "null");
  } catch {
    return null;
  }
}

export default function FlowDashboard() {
  const navigate = useNavigate();
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
      <div className="min-h-screen pt-32 flex justify-center text-slate-400" data-demo="true">
        Panel yükleniyor…
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-demo="true">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2">
          <ArrowLeft className="w-4 h-4" /> Ana sayfa
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-violet-400" />
            Hesap paneli
          </h1>
          <p className="text-sm text-slate-500 mt-1">Seçtiğiniz akışlara göre kısayollar (demo; backend yok).</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {flows.map((f) => (
            <Badge key={f} variant="outline" className="border-teal-500/30 text-teal-200">
              {FLOW_LABELS[f].title}
            </Badge>
          ))}
          <Button type="button" variant="ghost" size="sm" className="text-xs text-slate-500" onClick={() => navigate("/onboarding/akis")}>
            Akışları değiştir
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {perms.canCreateListing ? (
            <Card className="border-white/5 bg-slate-900/40">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Store className="w-5 h-5 text-cyan-400" />
                  İlanlarım
                </div>
                <p className="text-xs text-slate-500">Paket fiyatları `fees.ts` placeholder (§D-K8).</p>
                <Button type="button" className="w-full mt-1 bg-cyan-600/80 hover:bg-cyan-500 text-white" onClick={() => navigate("/sat-basla")}>
                  Satıcı merkezi
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {perms.canOpenAuction ? (
            <Card className="border-white/5 bg-slate-900/40">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Gavel className="w-5 h-5 text-blue-400" />
                  İhale aç
                </div>
                <p className="text-xs text-slate-500">Akış B — yetki ve evrak demo.</p>
                <Button type="button" className="w-full mt-1 bg-gradient-to-r from-blue-500 to-teal-400 text-white" onClick={() => navigate("/ihale-ac")}>
                  İhale oluştur
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {perms.canBid ? (
            <Card className="border-white/5 bg-slate-900/40">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white font-medium">
                  <ClipboardList className="w-5 h-5 text-amber-400" />
                  Tekliflerim / teminat
                </div>
                <p className="text-xs text-slate-500">Findeks, AML, bid bond — üretimde K3.</p>
                <Button type="button" variant="outline" className="w-full mt-1 border-amber-500/30 text-amber-100" onClick={() => navigate("/evraklar")}>
                  Evrak listesi
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-white/5 bg-slate-900/40">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white font-medium">
                <Heart className="w-5 h-5 text-pink-400" />
                Favoriler
              </div>
              <Button type="button" variant="outline" className="w-full mt-1 border-pink-500/30 text-pink-100" onClick={() => navigate("/favoriler")}>
                Favori ilanlar
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-slate-900/40">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white font-medium">
                <Search className="w-5 h-5 text-slate-300" />
                Kayıtlı aramalar
              </div>
              <Button type="button" variant="outline" className="w-full mt-1 border-white/15" onClick={() => navigate("/arama")}>
                Arama sayfası
              </Button>
            </CardContent>
          </Card>

          {flows.includes("auction_seller") ? (
            <Card className="border-white/5 bg-slate-900/40">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Shield className="w-5 h-5 text-teal-400" />
                  Yetki belgeleri
                </div>
                <Button type="button" variant="outline" className="w-full mt-1 border-teal-500/30 text-teal-100" onClick={() => navigate("/auth/edevis-mock")}>
                  e-Devlet (DEMO)
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-white/5 bg-slate-900/40">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white font-medium">
                <FileText className="w-5 h-5 text-slate-400" />
                Profil
              </div>
              <Button type="button" variant="outline" className="w-full mt-1 border-white/15" onClick={() => navigate("/profil")}>
                Hesap bilgileri
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/5 bg-slate-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400 mb-2">Yatırımcı portföy grafikleri (favoriler)</p>
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate("/dashboard/yatirimci")}>
              Portföy görünümüne git
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
