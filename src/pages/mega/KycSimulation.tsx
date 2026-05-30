import { useRef, useState } from "react";
import { ShieldCheck, Upload, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KYC_SIMULATION_STEPS } from "@/data/mega/kycSimulation";
import { useAuth } from "@/contexts/AuthContext";
import { useKycStatus } from "@/hooks/useKycStatus";
import { submitKycViaEdge } from "@/lib/kyc/kycSubmitClient";
import { uploadFile, UploadUnavailableError } from "@/lib/uploadFile";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Link } from "react-router-dom";

type Phase = 0 | 1 | 2 | 3 | 4;

const STATUS_LABEL: Record<string, string> = {
  none: "Başlanmadı",
  pending: "Beklemede",
  in_review: "İncelemede",
  verified: "Doğrulandı",
  rejected: "Reddedildi",
  unknown: "Bilinmiyor",
};

export default function KycSimulationPage() {
  const { user } = useAuth();
  const { displayStatus, latestSubmission, loading: statusLoading, reload } = useKycStatus(user?.id ?? null);
  const [phase, setPhase] = useState<Phase>(0);
  const [otp, setOtp] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitOk, setSubmitOk] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function next() {
    setPhase((p) => (p < 4 ? ((p + 1) as Phase) : p));
  }

  const handleKycSubmit = async () => {
    if (!user || !idFile) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const uploaded = await uploadFile(idFile, {
        bucket: "project-docs",
        orgId: user.id,
        entityId: user.id,
        docKind: "kyc-identity",
      });
      const result = await submitKycViaEdge({
        subjectId: user.id,
        documents: [{ kind: "identity_document", storage_path: uploaded.path }],
        declaredData: { channel: "web_kyc_ui" },
      });
      if (!result.ok) {
        setSubmitError(result.detail ?? result.code);
        return;
      }
      setSubmitOk(true);
      await reload();
      next();
    } catch (e) {
      if (e instanceof UploadUnavailableError) {
        setSubmitError("Belge yüklemesi şu an kullanılamıyor (depolama veya oturum).");
      } else {
        setSubmitError(e instanceof Error ? e.message : "Gönderim başarısız");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-start gap-3">
          <div className="rounded-xl bg-sky-500/15 p-3 text-sky-400">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">KYC doğrulama</h1>
            <p className="mt-2 text-sm text-slate-400">
              Kimlik belgesi yükleme ve inceleme durumu. Oturum açık değilse adımlar simülasyon modunda kalır.
            </p>
          </div>
        </div>

        <Card className="mb-6 border-slate-700/50 bg-slate-900/40">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Hesap durumu</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {statusLoading ? "Yükleniyor…" : STATUS_LABEL[displayStatus] ?? displayStatus}
            </p>
            {latestSubmission ? (
              <p className="mt-1 text-xs text-slate-500">
                Son başvuru: {new Date(latestSubmission.createdAt).toLocaleString("tr-TR")} · {latestSubmission.status}
              </p>
            ) : null}
            {!user ? (
              <p className="mt-2 text-xs text-amber-200/90">
                Gerçek gönderim için{" "}
                <Link to="/giris" className="text-teal-400 underline">
                  giriş yapın
                </Link>
                .
              </p>
            ) : null}
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
          <Card className="border-slate-200 bg-slate-900/50">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-slate-400">{KYC_SIMULATION_STEPS[0].description}</p>
              <Button type="button" className="w-full" onClick={next}>
                Devam
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === 1 && (
          <Card className="border-slate-200 bg-slate-900/50">
            <CardContent className="space-y-4 p-6">
              <Label className="text-slate-300">SMS kodu (demo adım)</Label>
              <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6 hane" className="bg-slate-950 border-slate-200 text-white" />
              <Button type="button" className="w-full" onClick={() => otp.length === 6 && next()} disabled={otp.length !== 6}>
                Doğrula
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === 2 && (
          <Card className="border-slate-200 bg-slate-900/50">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-slate-400">{KYC_SIMULATION_STEPS[2].description}</p>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
              />
              <Button type="button" variant="outline" className="w-full gap-2 border-white/15" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" />
                {idFile ? idFile.name : "Kimlik belgesi seç (PDF/JPG/PNG)"}
              </Button>
              {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}
              <Button
                type="button"
                className="w-full gap-2"
                disabled={!idFile || submitting || !user || !isSupabaseConfigured()}
                onClick={() => void handleKycSubmit()}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Belgeyi gönder (kyc-submit)
              </Button>
              {!isSupabaseConfigured() ? (
                <p className="text-xs text-slate-500">Supabase yapılandırması yok — yalnızca demo adımları.</p>
              ) : null}
            </CardContent>
          </Card>
        )}

        {phase === 3 && (
          <Card className="border-slate-200 bg-slate-900/50">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-slate-400">{KYC_SIMULATION_STEPS[3].description}</p>
              <p className="text-sm text-slate-300">
                Durum: <strong>{STATUS_LABEL[displayStatus] ?? displayStatus}</strong>
                {submitOk ? " — başvuru sunucuya iletildi." : ""}
              </p>
              <Button type="button" className="w-full" onClick={next}>
                İncelemeyi tamamla
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === 4 && (
          <Card className="border-emerald-500/25 bg-emerald-950/20">
            <CardContent className="p-8 text-center">
              <p className="text-lg font-semibold text-white">
                {displayStatus === "verified" ? "KYC doğrulandı" : "Başvuru kaydedildi"}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {displayStatus === "verified"
                  ? "Teklif ve hemen-al işlemleri için uygun hesap."
                  : "İnceleme tamamlandığında profil durumu güncellenir."}
              </p>
              <Button type="button" variant="outline" className="mt-6" onClick={() => { setPhase(0); setOtp(""); setIdFile(null); setSubmitOk(false); }}>
                Yeniden başlat
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
