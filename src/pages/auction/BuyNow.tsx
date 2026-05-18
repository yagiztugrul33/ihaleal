import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAuctionUuid } from "@/lib/auctionIds";
import {
  HEMEN_AL_CARD_BLOCK,
  HEMEN_AL_CONTRACT_LINKS,
  HEMEN_AL_DOCS_BLOCK,
  HEMEN_AL_GATE_INTRO,
  HEMEN_AL_MASAK_BLOCK,
} from "@/legal/hemenAlLansmanMetinleri";
import { MASTER_LEGAL_DISCLAIMER } from "@/legal/masterContractCheckboxTexts";

type LocState = {
  listingId?: string;
  depositId?: string;
} | null;

export default function BuyNow() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const st = location.state as LocState;
  const [status, setStatus] = useState<"idle" | "running" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  const listingId = st?.listingId;
  const depositId = st?.depositId;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setMessage("Hemen Al için giriş yapmalısınız.");
      return;
    }
    if (!isSupabaseConfigured() || !auctionId) {
      setMessage("Demo: Supabase yapılandırması veya ilan kimliği eksik — atomik akış devre dışı.");
      return;
    }
    if (!isAuctionUuid(auctionId) || !listingId || !depositId) {
      setMessage("Bu sayfa yalnızca Supabase kayıtlı ilan ve blokaj ile çalışır (UUID). Demo ilanlar için tam akış canlı veritabanında test edin.");
      return;
    }

    let cancelled = false;
    (async () => {
      setStatus("running");
      const { data: profile } = await supabase.from("profiles").select("kyc_status").eq("id", user.id).maybeSingle();
      if (cancelled) return;
      if (profile?.kyc_status !== "verified") {
        setStatus("err");
        setMessage("KYC doğrulaması gerekli. Profilinizde Kimlik doğrulama tamamlayın (demo: verified olmayabilir).");
        return;
      }

      const { data, error } = await supabase.rpc("execute_buy_now", {
        p_listing_id: listingId,
        p_deposit_id: depositId,
        p_idempotency_key: crypto.randomUUID(),
      });
      if (cancelled) return;
      if (error) {
        setStatus("err");
        setMessage(error.message);
        return;
      }
      const row = data as { status?: string; message?: string } | null;
      if (row?.status === "ok") {
        setStatus("ok");
        setMessage("Tebrikler! Satın alma isteği kaydedildi. Tapu süreci için ekibimiz sizi bilgilendirecek (MVP).");
        return;
      }
      if (row?.status === "duplicate") {
        setStatus("err");
        setMessage(row.message ?? "Yinelenen işlem.");
        return;
      }
      setStatus("err");
      setMessage(row?.message ?? "İşlem tamamlanamadı.");
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, auctionId, listingId, depositId]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>
        <div className="rounded-2xl border border-cyan-400/20 bg-white/90 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            Hemen Al
          </h1>
          <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5">{MASTER_LEGAL_DISCLAIMER}</p>
          <p className="text-sm text-slate-400 leading-relaxed">{HEMEN_AL_GATE_INTRO}</p>
          <div className="rounded-xl border border-slate-200 bg-white/[0.03] p-3 space-y-2 text-xs text-slate-400">
            <p className="font-semibold text-emerald-200">MASAK / AML</p>
            <p className="leading-relaxed">{HEMEN_AL_MASAK_BLOCK}</p>
            <p className="font-semibold text-cyan-200 pt-2">Kart güvenliği</p>
            <p className="leading-relaxed">{HEMEN_AL_CARD_BLOCK}</p>
            <p className="leading-relaxed pt-1">{HEMEN_AL_DOCS_BLOCK}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {HEMEN_AL_CONTRACT_LINKS.map((l) => (
                <Button key={l.href} type="button" variant="outline" size="sm" className="border-white/15 text-slate-200 text-xs h-8" onClick={() => navigate(l.href)}>
                  {l.label}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Atomik <code className="text-cyan-300/90 text-xs">execute_buy_now</code> RPC — blokaj ve rapor onayı ön koşulları sunucuda doğrulanır.
          </p>
          {status === "running" ? (
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              İşlem yapılıyor...
            </div>
          ) : null}
          {status === "ok" ? (
            <div className="flex gap-2 items-start text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              {message}
            </div>
          ) : null}
          {(status === "err" || (status === "idle" && message)) ? (
            <div className="flex gap-2 items-start text-amber-200 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
              {message}
            </div>
          ) : null}
          <p className="text-[11px] text-slate-600 leading-relaxed">
            MOCK / MVP: İlanın veritabanında <strong className="text-slate-500">active</strong> olması ve KYC&apos;nin verified görünmesi gerekir; aksi halde sunucu reddeder.
          </p>
        </div>
      </div>
    </div>
  );
}
