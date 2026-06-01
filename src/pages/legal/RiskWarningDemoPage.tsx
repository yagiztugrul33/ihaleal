import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, AlertTriangle, Settings, BookOpen, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskWarningPanel } from "@/components/legal/RiskWarningPanel";
import {
  LegalDisclaimer, LegalDraftBanner,
} from "@/components/legal/LegalDisclaimer";

export default function RiskWarningDemoPage() {
  const navigate = useNavigate();
  const [birthYear, setBirthYear] = useState<number>(1955);
  const [isUnderGuardianship, setIsUnderGuardianship] = useState(false);
  const [isInherited, setIsInherited] = useState(false);
  const [isFirstDegree, setIsFirstDegree] = useState(false);
  const [hasLien, setHasLien] = useState(false);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-white gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>

        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-200 mb-3">
            <AlertTriangle className="h-3.5 w-3.5" /> Riskli Satış Uyarı Sistemi
          </p>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 text-amber-400" />
            Hukuki Risk Uyarı Sistemi
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            İlan ekleme + ihale işlemi sırasında otomatik tetiklenen hukuki risk uyarıları.
            Bu sayfa <strong className="text-white">canlı simülasyon</strong>: kontrolleri değiştir, panel anında güncellenir.
          </p>
        </div>

        <LegalDraftBanner />

        {/* KATMAN 1 — Eğitici */}
        <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/5 to-slate-900/40 p-5">
          <div className="flex items-start gap-3 mb-3">
            <BookOpen className="h-5 w-5 text-cyan-300 flex-shrink-0 mt-0.5" />
            <h2 className="text-base font-semibold text-white">Uyarı sistemi nasıl çalışır?</h2>
          </div>
          <p className="text-sm text-slate-300 mb-3 leading-relaxed">
            Satıcının yaşı, ipotek durumu, miras geçişi, aile ilişkisi gibi
            <strong className="text-cyan-200"> ilan parametrelerine bakar</strong>,
            risk taşıyan durumları tespit eder ve <strong className="text-cyan-200">belge kontrol listesi</strong> sunar.
            <strong className="text-white"> İşlem engellenmez</strong> — sadece bilgilendirme.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            {[
              { ic: "65+", tip: "Sağlık kurulu raporu önerisi" },
              { ic: "Vesayet", tip: "Sulh Hukuk izni zorunlu" },
              { ic: "Miras", tip: "Tüm mirasçı + intikal kontrolü" },
              { ic: "Aile", tip: "Muvazaa/saklı pay uyarısı" },
              { ic: "İpotek/Haciz", tip: "TKGM + fek belgesi" },
            ].map((c) => (
              <div key={c.ic} className="rounded-lg border border-cyan-400/15 bg-slate-900/30 p-3">
                <p className="font-semibold text-cyan-300 mb-1">{c.ic}</p>
                <p className="text-slate-300">{c.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* KATMAN 2 — Form (simülasyon kontrolleri) */}
        <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4 text-violet-400" />
            Simülasyon — İlan bilgileri
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <label className="space-y-1.5">
              <span className="text-slate-400 text-xs">Satıcı doğum yılı</span>
              <input
                type="number"
                min={1900}
                max={2026}
                value={birthYear}
                onChange={(e) => setBirthYear(parseInt(e.target.value, 10) || 1955)}
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-sm"
              />
              <span className="text-[10px] text-slate-500">
                Bugün ({2026}) için tahmini yaş: {2026 - birthYear}
              </span>
            </label>
            <div className="space-y-2 pt-5">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnderGuardianship}
                  onChange={(e) => setIsUnderGuardianship(e.target.checked)}
                />
                <span className="text-slate-300">Vesayet altında</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInherited}
                  onChange={(e) => setIsInherited(e.target.checked)}
                />
                <span className="text-slate-300">Miras yoluyla edinilmiş</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFirstDegree}
                  onChange={(e) => setIsFirstDegree(e.target.checked)}
                />
                <span className="text-slate-300">1. derece akrabaya devir</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLien}
                  onChange={(e) => setHasLien(e.target.checked)}
                />
                <span className="text-slate-300">Tapuda ipotek/haciz/şerh var</span>
              </label>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic mt-3 pt-3 border-t border-slate-700/60">
            Bu kontroller gerçek ilan formunda tek tek toplanır; bu sayfa demo'dur.
          </p>
        </section>

        {/* KATMAN 3 — Uyarı paneli (canlı) */}
        <section>
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-amber-400" />
            Tetiklenen Uyarılar
          </h2>
          <RiskWarningPanel
            context={{
              sellerBirthYear: birthYear,
              todayYear: 2026,
              isUnderGuardianship,
              isInherited,
              isFirstDegreeFamilyTransfer: isFirstDegree,
              hasMortgageOrLien: hasLien,
            }}
          />
        </section>

        {/* KATMAN 4 — Güven */}
        <LegalDisclaimer
          context="Bu uyarı sistemi otomatik kural tabanlıdır. Tüm satım işlemleri öncesi avukat + noter zorunlu; uyarıların bulunmaması işlemin risksiz olduğu anlamına gelmez."
        />
      </div>
    </main>
  );
}
