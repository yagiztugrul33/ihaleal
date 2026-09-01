import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Phase = "intro" | "redirect" | "done";

/** Akış B (ihaleden satış) — e-Devlet yetki MOCK. Gerçek entegrasyon yok (§D-K6/K9). */
export default function EDevletAuth() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");

  useEffect(() => {
    if (phase !== "redirect") return;
    const t = window.setTimeout(() => setPhase("done"), 3000);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-demo="true">
      <div className="max-w-md mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2">
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
        </Button>
        <div className="rounded-[20px] border border-slate-200 bg-slate-900/60 p-6 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[var(--metin-ikincil)] mx-auto" />
          <h1 className="text-xl font-normal text-white">e-Devlet yetkisi (DEMO)</h1>
          {phase === "intro" && (
            <>
              <p className="text-sm text-slate-400">
                Gerçek yönlendirme yok. Bu sayfa yalnızca <strong className="text-white">Akış B</strong> (ihaleden satan) için ürün taslağıdır.
              </p>
              <Button className="w-full [background:var(--gradient-cta)] text-white" onClick={() => setPhase("redirect")}>
                e-Devlet&apos;e yönlendir (simülasyon)
              </Button>
            </>
          )}
          {phase === "redirect" && (
            <div className="py-6 space-y-3">
              <Loader2 className="w-10 h-10 text-[var(--metin-ikincil)] animate-spin mx-auto" />
              <p className="text-sm text-slate-300">e-Devlet&apos;e yönlendiriliyorsunuz…</p>
              <p className="text-xs text-slate-500">3 saniye sonra demo onay.</p>
            </div>
          )}
          {phase === "done" && (
            <div className="space-y-3">
              <p className="text-[var(--metin-ikincil)] font-normal">Yetki verildi (DEMO)</p>
              <p className="text-xs text-slate-500">Üretimde imza / vekalet / KEP akışı avukat onaylı olmalıdır.</p>
              <Button variant="outline" className="w-full border-white/15" onClick={() => navigate("/onboarding/akis")}>
                Akış seçimine dön
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
