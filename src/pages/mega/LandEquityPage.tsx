import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Building2, Calculator, FileText, Landmark, MapPinned, Shield,
  BookOpen, ScrollText, Scale, AlertTriangle, CheckCircle2, Info, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { distributeLandEquityCommission } from "@/lib/masterFinancialEngine";
import { computeKkaOwnerHakEdisProjection, type KkaScenarioId } from "@/lib/finance/kkaHakEdisEngine";
import { buildKkaRollingHakedisRows, kkaRollingHakedisLegalPrinciplesNoteTr } from "@/lib/finance/kkaRollingHakedisEngine";
import { INVOICE_LINE_DESCRIPTION_CANDIDATES } from "@/lib/finance/billingConfig";
import { KKA_STUDIO_PATH } from "@/lib/kkaHub";

type PoolMode = "c2c" | "single" | "dual";

function poolToInput(
  valueTry: number,
  mode: PoolMode,
  ownerNoterKabul: boolean,
): Parameters<typeof distributeLandEquityCommission>[0] {
  return {
    expertOrParcelValueTry: valueTry,
    isIndividual: mode === "c2c",
    hasOneAgent: mode === "single",
    hasTwoAgents: mode === "dual",
    landShareAgreement: { ownerAcceptsCommission: ownerNoterKabul },
  };
}

export default function LandEquityPage() {
  const navigate = useNavigate();
  const [parcelStr, setParcelStr] = useState("8000000");
  const [poolMode, setPoolMode] = useState<PoolMode>("single");
  const [ownerNoterKabul, setOwnerNoterKabul] = useState(false);
  const [unitsStr, setUnitsStr] = useState("4");
  const [priceStr, setPriceStr] = useState("8500000");
  const [scenario, setScenario] = useState<KkaScenarioId>("realistic");
  const [hakedisTrancheCount, setHakedisTrancheCount] = useState(4);

  const parcelTry = Math.max(0, Number(String(parcelStr).replace(/\D/g, "")) || 0);
  const ownerUnits = Math.max(0, Number(String(unitsStr).replace(/\D/g, "")) || 0);
  const unitPriceTry = Math.max(0, Number(String(priceStr).replace(/\D/g, "")) || 0);

  const commissionPool = useMemo(() => {
    if (parcelTry <= 0) return null;
    try {
      return distributeLandEquityCommission(poolToInput(parcelTry, poolMode, ownerNoterKabul));
    } catch {
      return null;
    }
  }, [parcelTry, poolMode, ownerNoterKabul]);

  const hak = useMemo(() => {
    if (ownerUnits <= 0 || unitPriceTry <= 0) return null;
    try {
      return computeKkaOwnerHakEdisProjection({
        ownerIndependentUnits: ownerUnits,
        expectedUnitSaleTry: unitPriceTry,
        scenario,
      });
    } catch {
      return null;
    }
  }, [ownerUnits, unitPriceTry, scenario]);

  const rollingHakedis = useMemo(() => buildKkaRollingHakedisRows(hakedisTrancheCount), [hakedisTrancheCount]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Landmark className="h-8 w-8 text-emerald-400" />
              Kat karşılığı arsa
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              "Arsamı kat karşılığı versem ne alırım?" — arsa sahibi/müteahhit pay dağılımı,
              hak ediş projeksiyonu, imar hakkı hesabı. Eğitim + ön analiz amaçlıdır.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="bg-emerald-600/90 hover:bg-emerald-500 text-white border border-emerald-400/30"
              onClick={() => navigate(KKA_STUDIO_PATH)}
            >
              <MapPinned className="w-4 h-4" />
              Ada / parsel ve imar stüdyosu
            </Button>
            <Button variant="outline" className="border-white/15" onClick={() => navigate("/komisyon-hesaplayici")}>
              <Calculator className="w-4 h-4" /> Komisyon hesaplayıcı
            </Button>
            <Button variant="outline" className="border-white/15" onClick={() => navigate("/araclar/vergi-simulator")}>
              Vergi simülatörü
            </Button>
            <Button variant="outline" className="border-violet-500/30 text-violet-200" onClick={() => navigate("/araclar/finans-uyumluluk")}>
              <Shield className="w-4 h-4" /> Finans / uyumluluk
            </Button>
          </div>
        </div>

        <Card className="border-amber-500/25 bg-amber-500/5">
          <CardContent className="p-4 text-xs text-amber-100/90">
            Fatura ve Teknokent yönlendirmeleri yalnızca{" "}
            <code className="text-amber-200">docs/hukuk/FINANCE_TAX_BILLING_CORE_RULES_TASLAK.md</code> ve{" "}
            <code className="text-amber-200">InvoiceComposer</code> çerçevesinde; YMM + avukat onayı olmadan üretim faturası
            kesilmez. Örnek satır adı: {INVOICE_LINE_DESCRIPTION_CANDIDATES.saasLicense.slice(0, 64)}…
          </CardContent>
        </Card>

        {/* KATMAN 1 — Eğitici giriş (kat karşılığı nedir?) */}
        <Card className="border-cyan-400/20 bg-gradient-to-br from-cyan-500/5 to-slate-900/40">
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <BookOpen className="h-5 w-5 text-cyan-300 flex-shrink-0 mt-0.5" />
              <h2 className="text-base font-semibold text-white">Kat karşılığı nedir?</h2>
            </div>
            <p className="text-sm text-slate-300 mb-3 leading-relaxed">
              Arsa sahibi arsasını müteahhide verir; müteahhit kendi parasıyla bina yapar,
              <strong className="text-cyan-200"> bağımsız bölümlerin (daire) bir kısmı arsa sahibinin olur</strong>,
              kalanı müteahhidin. Sözleşme genelde "%40-50 arsa sahibi / %50-60 müteahhit" oranında kurulur.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-cyan-400/15 bg-slate-900/30 p-3">
                <p className="font-semibold text-cyan-300 mb-1">📋 Oran Belirleme</p>
                <p className="text-slate-300">
                  Arsa değeri + imar hakkı + bölge talebi × müteahhit kâr marjı. İstanbul merkez %50/50,
                  taşra %35/65 tipik.
                </p>
              </div>
              <div className="rounded-lg border border-cyan-400/15 bg-slate-900/30 p-3">
                <p className="font-semibold text-cyan-300 mb-1">📜 Sözleşme Türü</p>
                <p className="text-slate-300">
                  Düz arsa payı / hisse karşılığı / inşaat hak ediş ödeme. Noter onaylı + tapu şerhi şart.
                </p>
              </div>
              <div className="rounded-lg border border-cyan-400/15 bg-slate-900/30 p-3">
                <p className="font-semibold text-cyan-300 mb-1">⚠️ Ana Riskler</p>
                <p className="text-slate-300">
                  Müteahhit iflas, gecikme cezası, teminat senet, kalite düşüşü, imar değişimi.
                  Avukat + eksper şart.
                </p>
              </div>
            </div>

            {/* Somut örnek pay dağılımı (Endeksa-style real numbers) */}
            <div className="mt-4 rounded-lg border border-emerald-400/20 bg-gradient-to-br from-emerald-500/5 to-slate-900/40 p-4">
              <p className="text-xs font-semibold text-emerald-300 mb-3 flex items-center gap-1.5">
                📊 Somut Örnek (Kadıköy / Caddebostan, 800 m² arsa)
              </p>
              <div className="grid sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-slate-500 mb-0.5">Arsa rayiç</p>
                  <p className="text-white font-bold text-base">₺48M</p>
                  <p className="text-slate-500 text-[10px]">(800 × ₺60K/m²)</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Emsal × m²</p>
                  <p className="text-white font-bold text-base">2.0 × 800</p>
                  <p className="text-slate-500 text-[10px]">= 1.600 m² inşaat</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Daire sayısı</p>
                  <p className="text-white font-bold text-base">16 daire</p>
                  <p className="text-slate-500 text-[10px]">(100 m² ortalama)</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Tahmini değer</p>
                  <p className="text-white font-bold text-base">₺128M</p>
                  <p className="text-slate-500 text-[10px]">(daire ortalama ₺8M)</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-400/20 grid sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded border border-emerald-400/30 bg-emerald-500/10 p-2.5">
                  <p className="text-emerald-300 font-semibold mb-1">🏘️ Arsa Sahibi (%50)</p>
                  <p className="text-white text-sm">8 daire = ₺64M</p>
                  <p className="text-slate-400 text-[11px]">Hak ediş 36 ay dilimli — son dilim tapu devirde.</p>
                </div>
                <div className="rounded border border-cyan-400/30 bg-cyan-500/10 p-2.5">
                  <p className="text-cyan-300 font-semibold mb-1">🏗️ Müteahhit (%50)</p>
                  <p className="text-white text-sm">8 daire = ₺64M (brüt)</p>
                  <p className="text-slate-400 text-[11px]">İnşaat maliyeti ~₺36M, brüt kâr ~₺28M (%44).</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 italic">
                * Örnek senaryo — gerçek oran ekspertiz + müzakere + bölge talebine göre değişir.
              </p>
            </div>

            {/* 3 şehir kat karşılığı pay oranı karşılaştırma */}
            <div className="mt-4 rounded-lg border border-cyan-400/20 bg-slate-900/40 p-4">
              <p className="text-xs font-semibold text-cyan-300 mb-3 flex items-center gap-1.5">
                🏘️ 3 Şehir Pay Oranı Karşılaştırma — Aynı arsa, farklı bölge
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[480px]">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-700">
                      <th className="text-left py-1.5 pr-2 font-medium">Bölge</th>
                      <th className="text-right py-1.5 px-2 font-medium">Arsa m² Rayiç</th>
                      <th className="text-right py-1.5 px-2 font-medium">Tipik Pay</th>
                      <th className="text-right py-1.5 px-2 font-medium">Süre</th>
                      <th className="text-right py-1.5 pl-2 font-medium">Talep</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    <tr className="border-b border-slate-800/50">
                      <td className="py-2 pr-2">
                        <p className="text-white font-medium">İstanbul / Kadıköy</p>
                        <p className="text-[10px] text-slate-500">A+ konum</p>
                      </td>
                      <td className="py-2 px-2 text-right text-emerald-300">₺55-75K</td>
                      <td className="py-2 px-2 text-right font-bold text-emerald-300">%50 / %50</td>
                      <td className="py-2 px-2 text-right">28-36 ay</td>
                      <td className="py-2 pl-2 text-right text-emerald-200">Çok yüksek</td>
                    </tr>
                    <tr className="border-b border-slate-800/50">
                      <td className="py-2 pr-2">
                        <p className="text-white font-medium">İzmir / Bornova</p>
                        <p className="text-[10px] text-slate-500">B+ konum</p>
                      </td>
                      <td className="py-2 px-2 text-right text-cyan-300">₺22-32K</td>
                      <td className="py-2 px-2 text-right font-bold text-cyan-300">%42 / %58</td>
                      <td className="py-2 px-2 text-right">24-30 ay</td>
                      <td className="py-2 pl-2 text-right text-cyan-200">Yüksek</td>
                    </tr>
                    <tr className="border-b border-slate-800/50">
                      <td className="py-2 pr-2">
                        <p className="text-white font-medium">Antalya / Konyaaltı</p>
                        <p className="text-[10px] text-slate-500">Turizm ağırlıklı</p>
                      </td>
                      <td className="py-2 px-2 text-right text-amber-300">₺28-40K</td>
                      <td className="py-2 px-2 text-right font-bold text-amber-300">%45 / %55</td>
                      <td className="py-2 px-2 text-right">22-28 ay</td>
                      <td className="py-2 pl-2 text-right text-amber-200">Mevsimsel</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-2">
                        <p className="text-white font-medium">Konya / Selçuklu</p>
                        <p className="text-[10px] text-slate-500">Taşra büyüme</p>
                      </td>
                      <td className="py-2 px-2 text-right text-slate-300">₺6-12K</td>
                      <td className="py-2 px-2 text-right font-bold text-slate-300">%35 / %65</td>
                      <td className="py-2 px-2 text-right">18-24 ay</td>
                      <td className="py-2 pl-2 text-right text-slate-400">Orta</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 italic">
                * Pay oranları platform kapanış endeksi + bölge KKA sözleşmeleri ortalamasıdır.
                Talep + imar + müteahhit rekabeti yüksek bölgelerde arsa sahibi payı artar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* KATMAN 2 ipucu — form alanları açıklama */}
        <Card className="border-amber-400/20 bg-slate-900/40">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> Form alanları ne demek?
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <p>
                <strong className="text-amber-200">Arsa değeri</strong>: SPK ekspertizi veya bölge
                emsal değeri (m² × rayiç). Belirsizse bölge ortalaması.
              </p>
              <p>
                <strong className="text-amber-200">İmar (KAKS/Emsal)</strong>: arsa m² × emsal =
                inşaat hakkı m². Örn. 1000 m² arsa × 2 emsal = 2000 m² inşaat.
              </p>
              <p>
                <strong className="text-amber-200">Birim daire fiyatı</strong>: tamamlandığında
                bölge ortalama satış değeri (Endeksa/TCMB).
              </p>
              <p>
                <strong className="text-amber-200">Senaryo (gerçekçi/iyimser/kötümser)</strong>:
                bölge talep + inşaat süresi + faiz dalgalanması varsayımı.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-emerald-500/20 bg-slate-900/40">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
                Hizmet havuzu (rayiç matrah)
              </h2>
              <div className="space-y-2">
                <Label className="text-slate-400">Arsa rayiç / ekspertiz matrahı (TL)</Label>
                <Input value={parcelStr} onChange={(e) => setParcelStr(e.target.value)} className="bg-slate-950/80 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Emlakçı havuz senaryosu</Label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["c2c", "C2C (emlakçı yok)"],
                      ["single", "Tek emlakçı"],
                      ["dual", "Çift emlakçı"],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPoolMode(v)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
                        poolMode === v ? "border-emerald-400 bg-emerald-500/20 text-white" : "border-slate-200 text-slate-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="noter" checked={ownerNoterKabul} onCheckedChange={(c) => setOwnerNoterKabul(c === true)} />
                <label htmlFor="noter" className="text-sm text-slate-300 cursor-pointer">
                  Arsa sahibi noterde komisyon kabulü (pay yükü — motor kurallarına göre)
                </label>
              </div>
              {commissionPool ? (
                <dl className="space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <dt>İhaleal (havuz)</dt>
                    <dd className="font-medium text-white">₺{commissionPool.platformTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Emlakçı havuzu</dt>
                    <dd className="font-medium text-white">₺{commissionPool.agentPoolTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <dt>Müteahhit matrah</dt>
                    <dd>₺{commissionPool.contractorTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <dt>Arsa sahibi matrah</dt>
                    <dd>₺{commissionPool.ownerTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <dt>KDV</dt>
                    <dd className="text-white">₺{commissionPool.totalKdvTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-200">
                    <dt>Toplam (KDV dahil)</dt>
                    <dd>₺{commissionPool.totalWithKdvTry.toLocaleString("tr-TR")}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-xs text-amber-200/90">Geçerli bir rayiç tutarı girin.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-teal-500/20 bg-slate-900/40">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-white">Konut hak ediş (örnekleme)</h2>
              <div className="space-y-2">
                <Label className="text-slate-400">Arsa sahibine yazılan bağımsız konut adedi</Label>
                <Input value={unitsStr} onChange={(e) => setUnitsStr(e.target.value)} className="bg-slate-950/80 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Birim satış fiyatı (TL, tahmini)</Label>
                <Input value={priceStr} onChange={(e) => setPriceStr(e.target.value)} className="bg-slate-950/80 border-slate-200" />
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["pessimistic", "Kötümser"],
                    ["realistic", "Gerçekçi"],
                    ["optimistic", "İyimser"],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setScenario(v)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
                      scenario === v ? "border-teal-400 bg-teal-500/20 text-white" : "border-slate-200 text-slate-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {hak ? (
                <dl className="space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <dt>Nominal brüt (birim × adet)</dt>
                    <dd className="text-white font-medium">₺{hak.nominalGrossTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Senaryo sonrası</dt>
                    <dd className="text-teal-200 font-semibold">₺{hak.scenarioAdjustedTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-2">{hak.notes}</p>
                </dl>
              ) : (
                <p className="text-xs text-amber-200/90">Adet ve birim fiyat girin.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-cyan-500/25 bg-slate-900/40">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-white">Muteahhit hakedisi: yuvarlanan blokaj</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ilk hakedis tutari odeme emanet hesabinda kalir; sonraki hakedis raporu / kismi kabul onaylandiginda bir onceki dilim odenebilir hale gelir.
              Son dilim kesin kabul veya tapu zincirine baglanir. TBK iyiniyet ve orantilik; cezai sart degildir. Metin avukat taslagidir.
            </p>
            <div className="space-y-2">
              <Label className="text-slate-400">Hakedis dilimi sayisi: {hakedisTrancheCount}</Label>
              <input
                type="range"
                min={2}
                max={8}
                value={hakedisTrancheCount}
                onChange={(e) => setHakedisTrancheCount(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">{kkaRollingHakedisLegalPrinciplesNoteTr()}</p>
            <ul className="space-y-3 text-xs text-slate-300 list-none border-t border-slate-200 pt-3">
              {rollingHakedis.map((row) => (
                <li key={row.trancheIndex} className="rounded-lg border border-slate-200 bg-black/20 p-3">
                  <div className="font-semibold text-cyan-200">Dilim {row.trancheIndex}</div>
                  <div className="mt-1 text-slate-400">{row.retentionUntilTr}</div>
                  <div className="mt-1 text-slate-500">{row.becomesPayableWhenTr}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="border-white/15" onClick={() => navigate("/komisyon-modeli")}>
            <FileText className="w-4 h-4" /> Gelir modeli
          </Button>
        </div>

        <p className="text-[11px] text-slate-500">
          Sözleşme taslağı: repoda <code className="text-slate-400">docs/hukuk/KKA_SOZLESME_VE_KAZANC_PLANI_TASLAK.md</code>.
        </p>

        {/* KATMAN 4 — Güven, metodoloji, hukuki süreç, disclaimer */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Güven, Metodoloji ve Hukuki Süreç</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Veri Kaynakları */}
            <Card className="border-emerald-500/20 bg-slate-900/40">
              <CardContent className="p-5">
                <div className="flex items-start gap-2 mb-3">
                  <ScrollText className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                  <h3 className="text-base font-semibold text-white">Veri Kaynakları</h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-emerald-200">İmar Müdürlüğü:</strong> ada/parsel KAKS, emsal, yükseklik, çekme.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-emerald-200">SPK Lisanslı Ekspertiz:</strong> arsa rayiç değeri (m² bazında).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-emerald-200">TCMB Konut Fiyat Endeksi:</strong> bölge ortalama satış rakamı.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-emerald-200">Platform Kapanış Endeksi:</strong> bölge KKA sözleşmelerinden çıkan gerçekleşen oran ortalaması.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-emerald-200">Resmî Yayın:</strong> 3194 İmar Kanunu, 6306 Kentsel Dönüşüm, BK Sözleşme hükümleri.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Hesap Yöntemi */}
            <Card className="border-cyan-500/20 bg-slate-900/40">
              <CardContent className="p-5">
                <div className="flex items-start gap-2 mb-3">
                  <Calculator className="h-5 w-5 text-cyan-300 flex-shrink-0 mt-0.5" />
                  <h3 className="text-base font-semibold text-white">Hesap Yöntemi</h3>
                </div>
                <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
                  <li><strong className="text-cyan-200">İnşaat Hakkı:</strong> Arsa m² × Emsal (KAKS) = toplam inşaat m².</li>
                  <li><strong className="text-cyan-200">Brüt Satış:</strong> İnşaat m² × bölge m² satış fiyatı (TCMB endeksli).</li>
                  <li><strong className="text-cyan-200">Müteahhit Maliyeti:</strong> inşaat m² × birim maliyet (kaba + ince + ruhsat + finansman).</li>
                  <li><strong className="text-cyan-200">Pay Oranı:</strong> (Arsa değeri + imar primi) / (Brüt satış − müteahhit kâr marjı %18-25).</li>
                  <li><strong className="text-cyan-200">Senaryo Düzeltmesi:</strong> +/- %10 (iyimser/kötümser) — bölge talep ve faiz dalgalanması.</li>
                </ol>
                <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-700">
                  Sonuç <strong className="text-cyan-200">ön analiz</strong> niteliğindedir; nihai oran müteahhit teklifi + avukat müzakeresine bağlıdır.
                </p>
              </CardContent>
            </Card>

            {/* Resmi Süreç */}
            <Card className="border-violet-500/20 bg-slate-900/40 md:col-span-2">
              <CardContent className="p-5">
                <div className="flex items-start gap-2 mb-3">
                  <Scale className="h-5 w-5 text-violet-300 flex-shrink-0 mt-0.5" />
                  <h3 className="text-base font-semibold text-white">Resmî Süreç (8 Adım)</h3>
                </div>
                <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <li className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                    <div className="font-semibold text-violet-300 mb-1">1. İmar Sorgu</div>
                    <p className="text-slate-300">Belediye imar müdürlüğü: ada/parsel imar planı, KAKS, çekme mesafesi.</p>
                  </li>
                  <li className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                    <div className="font-semibold text-violet-300 mb-1">2. Proje Hazırlık</div>
                    <p className="text-slate-300">Mimar avan proje + statik + mekanik + elektrik. SPK ekspertiz raporu.</p>
                  </li>
                  <li className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                    <div className="font-semibold text-violet-300 mb-1">3. Yapı Ruhsatı</div>
                    <p className="text-slate-300">Belediye yapı ruhsatı + onaylı proje (3194 sayılı İmar Kanunu m. 21-22).</p>
                  </li>
                  <li className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                    <div className="font-semibold text-violet-300 mb-1">4. KKA Sözleşmesi</div>
                    <p className="text-slate-300">Noter onaylı kat karşılığı sözleşme + tapuya şerh (BK m. 207, TMK m. 1011).</p>
                  </li>
                  <li className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                    <div className="font-semibold text-violet-300 mb-1">5. Teminat</div>
                    <p className="text-slate-300">Müteahhit teminat senedi / banka teminat mektubu + kefil — temerrüt koruması.</p>
                  </li>
                  <li className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                    <div className="font-semibold text-violet-300 mb-1">6. İnşaat</div>
                    <p className="text-slate-300">Kaba + ince yapı + ruhsat denetim. Yapı denetim firması düzenli rapor.</p>
                  </li>
                  <li className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                    <div className="font-semibold text-violet-300 mb-1">7. Hak Ediş</div>
                    <p className="text-slate-300">Dilim dilim teslim — yuvarlanan blokaj (her dilim, sonrakini açar).</p>
                  </li>
                  <li className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                    <div className="font-semibold text-violet-300 mb-1">8. Tapu Devri</div>
                    <p className="text-slate-300">Kat irtifakı → kat mülkiyeti → arsa sahibi payı tapuya devir (TMK m. 705).</p>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="border-amber-500/30 bg-amber-500/5 md:col-span-2">
              <CardContent className="p-5">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <h3 className="text-base font-semibold text-white">Yasal Uyarı (Disclaimer)</h3>
                </div>
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p>
                    Bu sayfadaki tüm hesaplamalar <strong className="text-amber-200">eğitim ve ön analiz amaçlı</strong> olup
                    yasal bağlayıcılığı yoktur. KKA bir taşınmaz hukuku işlemidir;
                    <strong className="text-amber-200"> mutlaka SPK lisanslı eksper, avukat ve mali müşavir desteği alın</strong>.
                  </p>
                  <p>
                    <strong className="text-amber-200">İlgili Mevzuat:</strong> 3194 sayılı İmar Kanunu (yapılaşma + emsal),
                    6306 sayılı Kentsel Dönüşüm Kanunu (riskli yapı + dönüşüm), 6098 sayılı Türk Borçlar Kanunu (sözleşme + temerrüt),
                    4721 sayılı Türk Medeni Kanunu (tapu + ayni hak), 3402 sayılı Kadastro Kanunu.
                  </p>
                  <p className="text-slate-400 pt-2 border-t border-amber-500/20">
                    <strong className="text-amber-200">İhaleal:</strong> bilgi platformudur; KKA tarafı değildir.
                    Sözleşme imzası, teminat onayı, tapu işlemi tamamen taraflar ve avukat sorumluluğundadır.
                    Veri yanlışlığı + senaryo sapması durumunda platform sorumluluk almaz.
                    Tüm KKA işlemlerinde <strong className="text-amber-200">noter onayı + tapu şerhi zorunludur</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kanıt + güven rozeti şeridi */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-slate-900/40 px-3 py-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              SPK Ekspertiz uyumlu
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-slate-900/40 px-3 py-1">
              <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
              TCMB Endeksli
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-slate-900/40 px-3 py-1">
              <Scale className="h-3.5 w-3.5 text-violet-400" />
              3194 + 6306 + BK uyumlu
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-slate-900/40 px-3 py-1">
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              Noter + Tapu şart
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
