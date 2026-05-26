import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Calculator, FileText, Landmark, MapPinned, Shield } from "lucide-react";
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
import { computeKkaBuildingSummary } from "@/lib/finance/kkaParselImarEngine";

type PoolMode = "c2c" | "single" | "dual";
type KkaUsul = "istanbul" | "ankara";

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
  const [usul, setUsul] = useState<KkaUsul>("istanbul");

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
  const usulImar = useMemo(() => {
    try {
      return computeKkaBuildingSummary({
        il: usul === "istanbul" ? "İstanbul" : "Ankara",
        ilce: usul === "istanbul" ? "Kadıköy" : "Çankaya",
        koy: "",
        mahalle: "",
        ada: "15",
        parsel: "200",
        landAreaM2: 1000,
        ownerShareOfSellable: 0.3,
        assumedNetUnitM2: 110,
      });
    } catch {
      return null;
    }
  }, [usul]);

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
              Rayiç üzerinden hizmet havuzu (v2.3) ve basit konut hak ediş projeksiyonu. Gerçek sözleşmeler, imar ve mutabakat
              avukat + eksper ile belirlenir; bu ekran ürün ve eğitim amaçlıdır.
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

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
            <h2 className="text-sm font-semibold text-cyan-100">Nedir?</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-200">
              Kat karşılığı sürecinde pay, komisyon ve hakediş etkilerini tek panelde modelleyen yatırım ön analiz ekranı.
            </p>
          </article>
          <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <h2 className="text-sm font-semibold text-emerald-100">Yöntem</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-200">
              `masterFinancialEngine`, `kkaHakEdisEngine` ve rolling blokaj modeli birlikte değerlendirilir.
            </p>
          </article>
          <article className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
            <h2 className="text-sm font-semibold text-violet-100">Dürüst sınır</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-200">
              Bu ekran demo/ön analizdir; resmi sözleşme, imar ve mali onay olmadan bağlayıcı karar üretilmez.
            </p>
          </article>
        </section>

        <Card className="border-blue-500/25 bg-blue-500/5">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-white">Ankara / İstanbul usulü imar referansı</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setUsul("istanbul")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${usul === "istanbul" ? "border-blue-400 bg-blue-500/20 text-white" : "border-slate-200 text-slate-400"}`}
              >
                İstanbul usulü
              </button>
              <button
                type="button"
                onClick={() => setUsul("ankara")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${usul === "ankara" ? "border-blue-400 bg-blue-500/20 text-white" : "border-slate-200 text-slate-400"}`}
              >
                Ankara usulü
              </button>
            </div>
            {usulImar ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-slate-200">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-slate-400">KAKS (emsal)</p>
                  <p className="mt-1 font-semibold">{usulImar.effectiveEmsal.toFixed(2)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-slate-400">TAKS</p>
                  <p className="mt-1 font-semibold">{usulImar.effectiveTaks.toFixed(2)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-slate-400">Gabari / Hmax</p>
                  <p className="mt-1 font-semibold">{usulImar.profile.maxBuildingHeightM} m</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-slate-400">Kat üst sınırı</p>
                  <p className="mt-1 font-semibold">{usulImar.cappedFloorsBuildable}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-amber-500/25 bg-amber-500/5">
          <CardContent className="p-4 text-xs text-amber-100/90">
            Fatura ve Teknokent yönlendirmeleri yalnızca{" "}
            <code className="text-amber-200">docs/hukuk/FINANCE_TAX_BILLING_CORE_RULES_TASLAK.md</code> ve{" "}
            <code className="text-amber-200">InvoiceComposer</code> çerçevesinde; YMM + avukat onayı olmadan üretim faturası
            kesilmez. Örnek satır adı: {INVOICE_LINE_DESCRIPTION_CANDIDATES.saasLicense.slice(0, 64)}…
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
            <h2 className="text-lg font-semibold text-white">Müteahhit hakedişi: yuvarlanan blokaj</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              İlk hakediş tutarı ödeme emanet hesabında kalır; sonraki hakediş raporu / kısmi kabul onaylandığında bir önceki dilim ödenebilir hale gelir.
              Son dilim kesin kabul veya tapu zincirine bağlanır. TBK iyi niyet ve orantılılık ilkesi gözetilir; cezai şart değildir. Metin avukat taslağıdır.
            </p>
            <div className="space-y-2">
              <Label className="text-slate-400">Hakediş dilimi sayısı: {hakedisTrancheCount}</Label>
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

        <Card className="border-emerald-500/20 bg-slate-900/40">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">12 örnek arsa vitrin</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="rounded-lg border border-white/10 p-3 text-sm">
                  <p className="font-medium text-white">Parsel #{i + 1}</p>
                  <p className="text-slate-400 mt-1">{420 + i * 85} m² · Konut imar</p>
                  <p className="text-emerald-300 mt-1">₺{(6_500_000 + i * 1_100_000).toLocaleString("tr-TR")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold text-white">Örnek senaryo + SSS</h2>
          <p className="mt-2 text-sm text-slate-300">
            Örnek: 8M TL rayiçte tek emlakçı senaryosunda havuz dağılımı, hakediş blokajı ve taraf yükü birlikte okunur.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
            <article>
              <p className="font-semibold text-slate-100">İlk adım ne olmalı?</p>
              <p className="mt-1 text-slate-400">Önce KKA Studio ile parsel/imar kontrolü, sonra havuz hesabı.</p>
            </article>
            <article>
              <p className="font-semibold text-slate-100">Canlı kararda tek başına yeterli mi?</p>
              <p className="mt-1 text-slate-400">Hayır. Hukuk, mühendislik ve mali müşavir onayı zorunludur.</p>
            </article>
            <article>
              <p className="font-semibold text-slate-100">By-pass nasıl engellenir?</p>
              <p className="mt-1 text-slate-400">İşlem bazlı kayıtlı akış ve sözleşme şartlarıyla platform dışı kısa yol azaltılır.</p>
            </article>
          </div>
        </section>

        <p className="text-[11px] text-slate-500">
          Sözleşme taslağı: repoda <code className="text-slate-400">docs/hukuk/KKA_SOZLESME_VE_KAZANC_PLANI_TASLAK.md</code>.
        </p>
      </div>
    </div>
  );
}
