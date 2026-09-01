import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale, ShieldAlert, Gavel, FileText, Link2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FRAUD_DEFENSE_PAGE_DISCLAIMER,
  FRAUD_LITIGATION_PILLARS,
} from "@/legal/fraudDefenseFramework";
import { REAL_ESTATE_RISK_ATLAS } from "@/legal/realEstateRiskAtlas";

export default function FraudDefenseArchitecturePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2">
          <ArrowLeft className="rtl:rotate-180 h-4 w-4" /> Geri
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-normal uppercase tracking-wide text-rose-400/90">Hukuki risk mimarisi</p>
            <h1 className="text-2xl font-normal text-white mt-1">Dolandiricilik ve dava risklerine karsi savunma</h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Uc kagit, sahte ilan, teklif manipulasyonu, platform disi kapora ve aradan cikma, lansman on-satisinda teknik sartname ile
              ilan uyumu, para birligi, MASAK, KVKK ve sureklilik riskleri; platformun ayakta kalmasi ve kullaniciya güven vermesi icin urun
              + hukuk + teknik kontrollerin ozeti. Baglayici danismanlik degildir.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="outline" size="sm" className="border-white/15 text-slate-200" onClick={() => navigate("/yasal-master-brief")}>
              <FileText className="w-4 h-4 me-1" /> Master brief
            </Button>
            <Button variant="outline" size="sm" className="border-white/15 text-slate-200" onClick={() => navigate("/yasal-cerceve")}>
              <Scale className="w-4 h-4 me-1" /> Yasal cerceve
            </Button>
            <Button variant="outline" size="sm" className="border-teal-500/30 text-teal-100" onClick={() => navigate("/güvenlik")}>
              <ShieldAlert className="w-4 h-4 me-1" /> Guvenlik merkezi
            </Button>
          </div>
        </div>

        <Card className="border-amber-500/25 bg-amber-500/10">
          <CardContent className="flex gap-3 p-4 text-xs text-slate-300 leading-relaxed">
            <Gavel className="w-5 h-5 shrink-0 text-amber-400" />
            <p>{FRAUD_DEFENSE_PAGE_DISCLAIMER}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-900/40">
          <CardContent className="p-5 text-sm text-slate-400 space-y-2">
            <p className="font-normal text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-400" />
              Hizli baglantilar
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={() => navigate("/ihale-kosullari")}>
                Ihale kosullari / AML
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={() => navigate("/evraklar")}>
                Evraklar
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={() => navigate("/kvkk")}>
                KVKK
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={() => navigate("/yedekleme")}>
                BCP / yedekleme
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={() => navigate("/yasal/supabase-uyum")}>
                Supabase RLS / audit
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={() => navigate("/yasal/agency-contract")}>
                agency_contract
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {FRAUD_LITIGATION_PILLARS.map((p) => (
            <Card key={p.id} className="border-slate-200 bg-slate-900/50">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{p.id}</span>
                  <h2 className="text-lg font-normal text-white">{p.title}</h2>
                </div>
                <div>
                  <p className="text-xs font-normal text-rose-200/90 mb-1">Tehdit</p>
                  <ul className="list-disc ps-5 text-sm text-slate-400 space-y-1">
                    {p.threats.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-normal text-slate-500 mb-1">Hukuki referans (ozet)</p>
                  <ul className="list-disc ps-5 text-xs text-slate-500 space-y-1">
                    {p.legalAnchors.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-normal text-emerald-200/90 mb-1">Onlem (urun / operasyon)</p>
                  <ul className="list-disc ps-5 text-sm text-slate-300 space-y-1">
                    {p.controls.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-normal text-cyan-200/80 mb-1">Delil / denetim izi</p>
                  <p className="text-xs text-slate-500">{p.evidenceArtifacts.join(" · ")}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-[20px] border border-emerald-500/20 bg-emerald-950/20 p-5 space-y-2">
          <h2 className="text-lg font-normal text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden />
            Gayrimenkul, miras, imar ve ticaret (geniş atlas)
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Emlak ekosisteminde sik gorulen dava hatlari: miras ve paydas zinciri, imar / 6306, ipotek-serh, TBK edimleri, TTK aracilik,
            lansman on-satisi ve teknik sartname ile ilan uyumu, platform baypasi, iflas ve yabanci edinimi. Asagidaki maddeler bilgilendirme
            taslagi olup somut dosyada avukat ile netlestirilir.
          </p>
        </div>

        <div className="space-y-6">
          {REAL_ESTATE_RISK_ATLAS.map((p) => (
            <Card key={p.id} className="border-emerald-500/15 bg-slate-900/40">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-600/90">{p.id}</span>
                  <h3 className="text-base font-normal text-white">{p.title}</h3>
                </div>
                <div>
                  <p className="text-xs font-normal text-rose-200/90 mb-1">Tehdit</p>
                  <ul className="list-disc ps-5 text-sm text-slate-400 space-y-1">
                    {p.threats.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-normal text-slate-500 mb-1">Hukuki referans (ozet)</p>
                  <ul className="list-disc ps-5 text-xs text-slate-500 space-y-1">
                    {p.legalAnchors.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-normal text-emerald-200/90 mb-1">Onlem (urun / operasyon)</p>
                  <ul className="list-disc ps-5 text-sm text-slate-300 space-y-1">
                    {p.controls.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-normal text-cyan-200/80 mb-1">Delil / denetim izi</p>
                  <p className="text-xs text-slate-500">{p.evidenceArtifacts.join(" · ")}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-[11px] text-slate-600 text-center pb-8">
          Kod referansi: <code className="text-slate-500">src/legal/fraudDefenseFramework.ts</code>,{" "}
          <code className="text-slate-500">src/legal/realEstateRiskAtlas.ts</code> — ilan kartlarinda{" "}
          <code className="text-slate-500">INTEGRITY_RULES_SUMMARY</code> ile birlestirilir.
        </p>
      </div>
    </div>
  );
}
