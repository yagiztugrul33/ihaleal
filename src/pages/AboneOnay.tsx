/**
 * /abone/onay — report_subscribers double opt-in onay sayfası.
 *
 * URL: /abone/onay?token=<confirmation_token>
 * Mail'deki onay linki bu sayfaya yönlendirir; sayfa `confirm_subscription`
 * RPC'sini çağırır → "Aboneliğiniz onaylandı ✅" gösterir.
 *
 * Token yoksa veya geçersizse anlamlı hata mesajı.
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Loader2, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type Status = "idle" | "checking" | "ok" | "error" | "no-token" | "no-backend";

export default function AboneOnay() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || params.get("t") || "";
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      return;
    }
    if (!isSupabaseConfigured()) {
      setStatus("no-backend");
      setMessage(
        "Backend yapılandırılmamış — onay işlemi şu an uygulanamaz. Lütfen daha sonra tekrar deneyin.",
      );
      return;
    }
    setStatus("checking");
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase.rpc("confirm_subscription", {
          p_token: token,
        });
        if (!alive) return;
        if (error) {
          setStatus("error");
          setMessage(error.message || "Bir sorun oluştu.");
          return;
        }
        const result = (data ?? {}) as { status?: string; message?: string };
        if (result.status === "ok") {
          setStatus("ok");
          setMessage(result.message || "Aboneliğiniz başarıyla onaylandı.");
        } else {
          setStatus("error");
          setMessage(result.message || "Token bulunamadı veya zaten onaylı.");
        }
      } catch (e) {
        if (!alive) return;
        setStatus("error");
        setMessage(String(e).slice(0, 200));
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 pt-24">
      <div className="w-full max-w-md text-center">
        <Mail className="mx-auto h-10 w-10 text-violet-400 mb-3" aria-hidden />
        <p className="text-xs uppercase tracking-wider text-violet-300/70 font-semibold">
          ihaleal · Aylık Endeks Raporu
        </p>

        {status === "no-token" ? (
          <>
            <div className="mx-auto mt-6 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
              <AlertTriangle className="h-8 w-8 text-amber-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Geçersiz onay bağlantısı</h1>
            <p className="mt-3 max-w-sm mx-auto text-sm text-slate-400 leading-relaxed">
              Onay bağlantısı bulunamadı veya bozuk. Lütfen e-postanızdaki linke tekrar tıklayın
              veya /raporlar sayfasından yeniden abone olun.
            </p>
          </>
        ) : status === "checking" ? (
          <>
            <div className="mx-auto mt-6 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/10">
              <Loader2 className="h-8 w-8 text-violet-300 animate-spin" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Aboneliğiniz onaylanıyor…</h1>
            <p className="mt-3 max-w-sm mx-auto text-sm text-slate-400 leading-relaxed">
              Lütfen bekleyin, sunucuyla doğrulama yapılıyor.
            </p>
          </>
        ) : status === "ok" ? (
          <>
            <div className="mx-auto mt-6 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Aboneliğiniz onaylandı ✅</h1>
            <p className="mt-3 max-w-sm mx-auto text-sm text-slate-300 leading-relaxed">
              {message ||
                "Bundan sonra her ayın başında yeni endeks raporları e-postanıza gelecek."}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Aboneliğinizi tek tıkla bırakmak için maillerin altındaki "abonelikten çık" linkini
              kullanın.
            </p>
          </>
        ) : status === "no-backend" ? (
          <>
            <div className="mx-auto mt-6 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-500/30 bg-slate-500/10">
              <AlertTriangle className="h-8 w-8 text-slate-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Servis geçici olarak ulaşılamıyor</h1>
            <p className="mt-3 max-w-sm mx-auto text-sm text-slate-400 leading-relaxed">
              {message}
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mt-6 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10">
              <AlertTriangle className="h-8 w-8 text-rose-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Onay tamamlanamadı</h1>
            <p className="mt-3 max-w-sm mx-auto text-sm text-slate-400 leading-relaxed">
              {message ||
                "Bağlantı süresi dolmuş olabilir veya zaten onaylanmış olabilirsiniz. /raporlar sayfasından tekrar abone olun."}
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="accent">
            <Link to="/raporlar">
              Endeks raporları <ArrowRight className="ms-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="border-white/15 text-slate-200">
            Ana sayfa
          </Button>
        </div>
      </div>
    </div>
  );
}
