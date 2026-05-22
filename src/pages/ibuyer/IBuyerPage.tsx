import { Banknote, RefreshCw } from "lucide-react";
import { SubmissionForm } from "@/components/ibuyer/SubmissionForm";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { useAuth } from "@/contexts/AuthContext";
import { ibuyerSubtitle } from "@/lib/ibuyerHub";
import { ROUTES } from "@/constants/routes";
import { IBUYER_DISCLAIMER, MASTER_INFO_DISCLAIMER } from "@/legal/platformDisclaimers";

export default function IBuyerPage() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen pt-24 pb-16 text-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            <Banknote className="h-3.5 w-3.5" /> iBuyer
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold">Anında Nakit Teklif</h1>
          <p className="mt-2 text-slate-400 max-w-2xl">{ibuyerSubtitle}</p>
        </div>
        <p className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <RefreshCw className="h-4 w-4" />
          Hukuki risk matrisi ile 72 saat geçerli teklif
        </p>
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100">
          <p>{IBUYER_DISCLAIMER}</p>
          <p className="mt-1">{MASTER_INFO_DISCLAIMER}</p>
        </div>
        <div className="mb-8 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-slate-300">
          <p>
            iBuyer akışı, mülkünü hızlı nakde çevirmek isteyen kullanıcı için operasyonu sadeleştirir. Klasik yöntemde günler süren
            ön görüşme, belge toplama ve teklif turu tek bir başvuru hattına indirilir; kullanıcı hangi adımda olduğunu anlık takip eder.
          </p>
          <p>
            Sistem değerleme, risk sinyali ve likidite parametrelerini birlikte yorumlar. Amaç en yüksek rakamı vaat etmek değil;
            sürdürülebilir ve kapanışa gidebilir bir teklif bandı üretmektir. Bu nedenle başvuru sonucunda verilen teklif, hukuki ve
            operasyonel kontrollerle birlikte değerlendirilir.
          </p>
          <p>
            Çıktılar demo modunda simülasyon niteliğindedir. Canlı uygulamada nihai bedel, yerinde ekspertiz, resmi belge doğrulaması ve
            sözleşme onayı sonrasında kesinleşir. Bu ekran karar öncesi hızlı çerçeve sunmak için tasarlanmıştır.
          </p>
        </div>

        {loading ? (
          <div
            data-testid="ibuyer-loading"
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 animate-pulse space-y-4"
          >
            <div className="h-4 w-1/3 rounded bg-slate-700" />
            <div className="h-10 rounded bg-slate-700" />
            <div className="h-10 rounded bg-slate-700" />
            <div className="h-10 w-1/2 rounded bg-slate-700" />
          </div>
        ) : user ? (
          <SubmissionForm />
        ) : (
          <RequireAuthGate redirectTo={ROUTES.IBUYER} />
        )}
      </section>
    </main>
  );
}
