import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KYC_SIMULATION_STEPS } from "@/data/mega/kycSimulation";

type Phase = 0 | 1 | 2 | 3 | 4;

export default function KycSimulationPage() {
  const [phase, setPhase] = useState<Phase>(0);
  const [otp, setOtp] = useState("");

  function next() {
    setPhase((p) => (p < 4 ? ((p + 1) as Phase) : p));
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-start gap-3">
          <div className="rounded-xl bg-sky-500/15 p-3 text-sky-400">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">KYC simülasyonu</h1>
            <p className="mt-2 text-sm text-slate-400">
              Gerçek kimlik doğrulaması değildir. Üretimde kimlik sağlayıcı ve hukuki süreçler uygulanır.
            </p>
          </div>
        </div>

        <Card className="mb-6 border-violet-500/25 bg-violet-950/25">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-white">İki faktörlü doğrulama (2FA)</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Üretimde hesap güvenliği adımında TOTP (Authenticator) veya SMS tabanlı 2FA etkinleştirilebilir — bu simülasyonda yer tutucudur; gerçek doğrulama backend ve politikaya bağlıdır.
            </p>
          </CardContent>
        </Card>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {KYC_SIMULATION_STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                phase > i ? "bg-emerald-500/20 text-emerald-300" : phase === i ? "bg-blue-500/25 text-blue-200" : "bg-white/5 text-slate-500"
              }`}
            >
              {i + 1}. {s.title}
            </span>
          ))}
        </div>

        {phase === 0 && (
          <Card className="border-white/10 bg-slate-900/50">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-slate-400">{KYC_SIMULATION_STEPS[0].description}</p>
              <Button type="button" className="w-full" onClick={next}>
                Devam
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === 1 && (
          <Card className="border-white/10 bg-slate-900/50">
            <CardContent className="space-y-4 p-6">
              <Label className="text-slate-300">SMS kodu (demo)</Label>
              <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6 hane" className="bg-slate-950 border-white/10 text-white" />
              <Button type="button" className="w-full" onClick={() => otp.length === 6 && next()} disabled={otp.length !== 6}>
                Doğrula
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === 2 && (
          <Card className="border-white/10 bg-slate-900/50">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-slate-400">{KYC_SIMULATION_STEPS[2].description}</p>
              <Button type="button" className="w-full" onClick={next}>
                Uyumlu olarak işaretle (demo)
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === 3 && (
          <Card className="border-white/10 bg-slate-900/50">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-slate-400">{KYC_SIMULATION_STEPS[3].description}</p>
              <Button type="button" className="w-full" onClick={next}>
                İncelemeyi tamamla
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === 4 && (
          <Card className="border-emerald-500/25 bg-emerald-950/20">
            <CardContent className="p-8 text-center">
              <p className="text-lg font-semibold text-white">Simülasyon tamamlandı</p>
              <p className="mt-2 text-sm text-slate-400">Üretimde sonuçlar sistem kaydına ve saklama politikasına yazılır.</p>
              <Button type="button" variant="outline" className="mt-6" onClick={() => { setPhase(0); setOtp(""); }}>
                Yeniden başlat
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
