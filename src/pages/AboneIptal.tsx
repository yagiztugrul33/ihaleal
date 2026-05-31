/**
 * /abone/iptal — report_subscribers abonelikten çıkış sayfası.
 *
 * URL: /abone/iptal?token=<unsubscribe_token>
 * Mail'deki "abonelikten çık" linki bu sayfaya yönlendirir; sayfa
 * `unsubscribe_reports` RPC'sini çağırır → "Aboneliğiniz iptal edildi."
 *
 * Token yoksa veya geçersizse anlamlı hata. Tek tık iptal — kullanıcıya
 * onay sorulmaz (mail'den geldiği için niyet net).
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Loader2, ArrowRight, MailMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type Status = "idle" | "processing" | "ok" | "error" | "no-token" | "no-backend";

export default function AboneIptal() {
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
        "Backend yapılandırılmamış — abonelik iptali şu an uygulanamaz. Lütfen daha sonra tekrar deneyin.",
      );
      return;
    }
    setStatus("processing");
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase.rpc("unsubscribe_reports", {
          p_token: token,
        });
        if (!alive) return;
        if (error) {
          setStatus("error");
          setMessage(error.message || "Bir sorun oluştu.");
          return;
        }
        const result = (data ?? {}) as { status?: string; message?: string; deleted?: number };
        if (result.status === "ok") {
          setStatus("ok");
          setMessage(`Aboneliğiniz başarıyla iptal edildi.${result.deleted ? "" : ""}`);
        } else {
          setStatus("error");
          setMessage(result.message || "Token bulunamadı veya zaten iptal edilmiş.");
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
        <MailMinus className="mx-auto h-10 w-10 text-slate-400 mb-3" aria-hidden />
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
          ihaleal · Abonelik İptali
        </p>

        {status === "no-token" ? (
          <>
            <div className="mx-auto mt-6 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
              <AlertTriangle className="h-8 w-8 text-amber-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Geçersiz iptal bağlantısı</h1>
            <p className="mt-3 max-w-sm mx-auto text-sm text-slate-400 leading-relaxed">
              İptal bağlantısı bulunamadı veya bozuk. Lütfen e-postanızın altındaki
              "abonelikten çık" linkine tekrar tıklayın.
            </p>
          </>
        ) : status === "processing" ? (
          <>
            <div className="mx-auto mt-6 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-400/30 bg-slate-500/10">
              <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">İptal işleniyor…</h1>
            <p className="mt-3 max-w-sm mx-auto text-sm text-slate-400 leading-relaxed">
              Lütfen bekleyin, abonelik kaydınız siliniyor.
            </p>
          </>
        ) : status === "ok" ? (
          <>
            <div className="mx-auto mt-6 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Aboneliğiniz iptal edildi</h1>
            <p className="mt-3 max-w-sm mx-auto text-sm text-slate-300 leading-relaxed">
              {message || "Bundan sonra aylık endeks raporu maili almayacaksınız."}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Fikrinizi değiştirirseniz /raporlar sayfasından her zaman yeniden abone olabilirsiniz.
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white">İptal tamamlanamadı</h1>
            <p className="mt-3 max-w-sm mx-auto text-sm text-slate-400 leading-relaxed">
              {message || "Bağlantı süresi dolmuş veya zaten iptal edilmiş olabilir."}
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="accent">
            <Link to="/raporlar">
              Endeks raporları <ArrowRight className="ml-1.5 h-4 w-4" />
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
