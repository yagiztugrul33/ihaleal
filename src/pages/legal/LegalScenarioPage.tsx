import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Info, Search, AlertTriangle, Scale, ScrollText,
  CheckCircle2, Mail, ChevronRight, Layers, FileText, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LegalDisclaimer, LegalDraftBanner, LegalCitationStrip,
} from "@/components/legal/LegalDisclaimer";
import {
  analyzeScenario, listScenarios, riskColor, riskLabel,
  sanitizeNumberInput, type ScenarioId, type ScenarioAnalysis,
} from "@/lib/legal/scenarioEngine";

export default function LegalScenarioPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ScenarioId | null>(null);
  const [valueStr, setValueStr] = useState("8000000");
  const [reservedHeirs, setReservedHeirs] = useState(2);
  const [hasPaperTrail, setHasPaperTrail] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");

  const scenarios = useMemo(() => listScenarios(), []);
  const filtered = useMemo(() => {
    if (!filterQuery) return scenarios;
    const q = filterQuery.toLowerCase();
    return scenarios.filter(
      (s) => s.title.toLowerCase().includes(q) || s.oneLineSummary.toLowerCase().includes(q),
    );
  }, [scenarios, filterQuery]);

  const analysis: ScenarioAnalysis | null = useMemo(() => {
    if (!selected) return null;
    try {
      return analyzeScenario({
        scenarioId: selected,
        propertyValueTry: sanitizeNumberInput(valueStr),
        reservedHeirCount: reservedHeirs,
        hasOfficialPaperTrail: hasPaperTrail,
        isFirstDegreeRelative: true,
      });
    } catch {
      return null;
    }
  }, [selected, valueStr, reservedHeirs, hasPaperTrail]);

  const tone = analysis ? riskColor(analysis.riskLevel) : "amber";
  const toneCls = {
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    rose: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  }[tone];

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-white gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>

        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 mb-3">
            <Scale className="h-3.5 w-3.5" /> Hukuki Senaryo Çözücü
          </p>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-cyan-400" />
            Hukuki Senaryo Çözücü
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            "Para baba veriyor tapu oğula" gibi karmaşık denklemleri çöz — risk skoru, açılabilecek davalar,
            vergi yükü ve güvenli yol haritası tek ekranda.
          </p>
        </div>

        <LegalDraftBanner />

        {/* KATMAN 1 — Eğitici */}
        <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/5 to-slate-900/40 p-5">
          <div className="flex items-start gap-3 mb-3">
            <BookOpen className="h-5 w-5 text-cyan-300 flex-shrink-0 mt-0.5" />
            <h2 className="text-base font-semibold text-white">Senaryo Çözücü ne işe yarar?</h2>
          </div>
          <p className="text-sm text-slate-300 mb-3 leading-relaxed">
            Gayrimenkul işlemlerinde karşılaşılan <strong className="text-cyan-200">10 tipik hukuki/vergisel
            denklem</strong> için ön analiz çıkarır. Hangi davalar açılabilir, hangi vergiler doğar, saklı pay etkisi
            nedir, riski azaltacak güvenli yol nedir — hepsi adım adım.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg border border-cyan-400/15 bg-slate-900/30 p-3">
              <p className="font-semibold text-cyan-300 mb-1">👤 Bireysel</p>
              <p className="text-slate-300">Aile içi devir, miras paylaşımı, boşanma → riskleri görmek.</p>
            </div>
            <div className="rounded-lg border border-cyan-400/15 bg-slate-900/30 p-3">
              <p className="font-semibold text-cyan-300 mb-1">🏗️ Müteahhit</p>
              <p className="text-slate-300">Kat karşılığı + ipotekli mülk + şirket üzerinden işlem.</p>
            </div>
            <div className="rounded-lg border border-cyan-400/15 bg-slate-900/30 p-3">
              <p className="font-semibold text-cyan-300 mb-1">🏢 Yatırımcı</p>
              <p className="text-slate-300">Vekaletle satım, yabancıya devir, ölünceye kadar bakma.</p>
            </div>
          </div>
        </section>

        {/* KATMAN 2 — Senaryo seçim */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-400" />
              10 Senaryo — Bir tanesini seç
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="search"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Ara — muvazaa, miras, vekalet..."
                className="w-full ps-9 pe-3 py-1.5 rounded-md border border-slate-700 bg-slate-900/60 text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                aria-label="Senaryo ara"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.map((s) => {
              const isActive = selected === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelected(s.id)}
                  className={`text-start rounded-xl border p-4 transition-colors ${isActive ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-400/30" : "border-slate-700 bg-slate-900/40 hover:bg-slate-900/60"}`}
                  aria-pressed={isActive}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                    {isActive && <CheckCircle2 className="h-4 w-4 text-cyan-300 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.oneLineSummary}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* PARAMETRELER (form) */}
        {selected ? (
          <section className="rounded-2xl border border-amber-500/20 bg-slate-900/40 p-5">
            <p className="text-xs font-semibold text-amber-300 mb-3 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> Senaryo parametreleri (analizi etkiler)
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <label className="space-y-1.5">
                <span className="text-slate-400 text-xs">Mülk değeri (TL)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={valueStr}
                  onChange={(e) => setValueStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-sm"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-slate-400 text-xs">Saklı paylı mirasçı sayısı (0-10)</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={reservedHeirs}
                  onChange={(e) => setReservedHeirs(Math.min(10, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={hasPaperTrail}
                  onChange={(e) => setHasPaperTrail(e.target.checked)}
                />
                <span className="text-xs text-slate-300">Banka transferi/resmi belge var</span>
              </label>
            </div>
          </section>
        ) : null}

        {/* KATMAN 3 — Analiz Sonucu */}
        {analysis ? (
          <section className="space-y-4">
            {/* RİSK ÖZET */}
            <div className={`rounded-2xl border ${toneCls.split(" ").slice(0, 2).join(" ")} p-5`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Analiz edilen senaryo</p>
                  <h3 className="text-lg font-bold text-white">{analysis.title}</h3>
                  <p className="text-xs text-slate-300 mt-1">{analysis.oneLineSummary}</p>
                </div>
                <div className="text-end">
                  <p className="text-[10px] text-slate-400 uppercase">Risk Skoru</p>
                  <p className="text-3xl font-bold">{analysis.riskScore}<span className="text-sm text-slate-400">/100</span></p>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold mt-1 ${toneCls}`}>
                    {riskLabel(analysis.riskLevel)}
                  </span>
                </div>
              </div>
              <div className="border-t border-slate-700/60 pt-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Hukuki nitelik:</strong> {analysis.hukukiNitelik}
                </p>
              </div>
            </div>

            {/* DAVALAR */}
            <div className="rounded-2xl border border-rose-500/20 bg-slate-900/40 p-5">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-300" />
                Açılabilecek Davalar ({analysis.davalar.length})
              </h3>
              <ul className="space-y-3">
                {analysis.davalar.map((d, i) => (
                  <li key={i} className="rounded-lg border border-slate-700 bg-slate-900/30 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-white">{d.isim}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${toneCls}`}>
                        {riskLabel(d.risk)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-1">{d.detay}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                      <span className="inline-flex items-center gap-0.5"><Scale className="h-2.5 w-2.5" /> {d.mevzuat}</span>
                      <span>·</span>
                      <span>Davacı: {d.davaci}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* VERGİLER */}
            <div className="rounded-2xl border border-amber-500/20 bg-slate-900/40 p-5">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-300" />
                Vergi Yükü ({analysis.vergiler.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[480px]">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-700">
                      <th className="text-start py-1.5 pe-2 font-medium">Vergi</th>
                      <th className="text-start py-1.5 px-2 font-medium">Oran</th>
                      <th className="text-start py-1.5 px-2 font-medium">Yükümlü</th>
                      <th className="text-start py-1.5 ps-2 font-medium">Mevzuat</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {analysis.vergiler.map((v, i) => (
                      <tr key={i} className="border-b border-slate-800/50 last:border-0">
                        <td className="py-2 pe-2 font-medium">{v.isim}</td>
                        <td className="py-2 px-2 text-amber-200">{v.oran}</td>
                        <td className="py-2 px-2 text-slate-400">{v.yukumlu}</td>
                        <td className="py-2 ps-2 text-violet-200 text-[10px]">{v.mevzuat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SAKLI PAY */}
            {analysis.sakliPayEtkisi ? (
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
                <p className="text-xs font-semibold text-violet-300 mb-1">📋 Saklı Pay Etkisi</p>
                <p className="text-sm text-slate-200 leading-relaxed">{analysis.sakliPayEtkisi}</p>
              </div>
            ) : null}

            {/* GÜVENLI YOL */}
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/40 p-5">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Güvenli Yol — Adım Adım ({analysis.guvenliYol.length} adım)
              </h3>
              <ol className="space-y-3">
                {analysis.guvenliYol.map((g) => (
                  <li key={g.step} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-200 text-sm font-bold flex items-center justify-center">
                      {g.step}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{g.eylem}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{g.sebep}</p>
                      {g.sure ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] text-emerald-300 mt-1">
                          ⏱️ {g.sure}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* AI YORUM */}
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-slate-900/40 p-5">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                Dikkat Çekilen Noktalar
              </h3>
              <ul className="space-y-2">
                {analysis.aiYorum.map((y, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <ChevronRight className="h-3.5 w-3.5 text-cyan-300 flex-shrink-0 mt-0.5" />
                    <span>{y}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* İÇTİHAT */}
            {analysis.ictihat && analysis.ictihat.length > 0 ? (
              <div className="rounded-2xl border border-violet-500/20 bg-slate-900/40 p-5">
                <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-violet-300" />
                  Yargıtay İçtihat Referansı (örnek)
                </h3>
                <ul className="space-y-2">
                  {analysis.ictihat.map((i, idx) => (
                    <li key={idx} className="rounded-lg border border-violet-500/20 bg-slate-900/30 p-3 text-xs">
                      <p className="font-mono text-violet-200">{i.daire} {i.karar}</p>
                      <p className="text-slate-300 mt-1 leading-relaxed">{i.ozet}</p>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-slate-500 italic mt-2">
                  * İçtihat referansları örnektir — somut karar için Yargıtay/Anayasa Mahkemesi resmi sitesinde teyit edilmelidir.
                </p>
              </div>
            ) : null}

            {/* KATMAN 4 — GÜVEN */}
            <LegalCitationStrip items={analysis.mevzuat} />

            <LegalDisclaimer
              context={`Bu analiz "${analysis.title}" senaryosu için kural tabanlı motorla üretilmiş ön analizdir. Somut karar öncesi avukat + mali müşavir + noter zorunlu.`}
            />
          </section>
        ) : (
          <div className="empty-state">
            <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p>Yukarıdan bir senaryo seçince analiz burada görünecek.</p>
          </div>
        )}

        {/* İletişim */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 flex items-start gap-3">
          <Mail className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-slate-200 mb-1">Hukuki Destek</p>
            <p className="text-xs text-slate-400">
              Bu modül EĞİTİCİ ön analiz sağlar. Avukat eşleştirme için
              {" "}<button type="button" onClick={() => navigate("/iletisim")} className="text-cyan-300 underline">iletişim</button>'e
              veya <a href="mailto:hukuk@ihaleal.com" className="text-cyan-300 underline">hukuk@ihaleal.com</a>'a yazabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
