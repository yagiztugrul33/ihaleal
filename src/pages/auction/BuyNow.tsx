import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAuctionUuid } from "@/lib/auctionIds";

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
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white gap-2">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>
        <div className="rounded-2xl border border-cyan-400/20 bg-[#0c1629]/90 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <h1 className="text-xl font-bold text-white">Hemen Al</h1>
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
