import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  FileStack,
  Gavel,
  Layers,
  MapPinned,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  computeKkaBuildingSummary,
  type KkaBuildingSummary,
  type KkaParselFormInput,
} from "@/lib/finance/kkaParselImarEngine";
import {
  formatKkaRollingHakedisContractBlock,
  kkaRollingHakedisLegalPrinciplesNoteTr,
} from "@/lib/finance/kkaRollingHakedisEngine";
import { fillKkaContractPlaceholders, KKA_STUDIO_CONTRACT_SECTIONS } from "@/lib/legal/kkaStudioContractBundle";
import { KKA_HUB_PATH } from "@/lib/kkaHub";
import { PdfExportButton } from "@/components/pdf/PdfExportButton";
import { downloadKkaResultPdf } from "@/lib/pdf/pdfBuilder";

function parseNum(s: string): number {
  const n = Number(String(s).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function buildContractCtx(
  form: Omit<KkaParselFormInput, "landAreaM2" | "ownerShareOfSellable" | "assumedNetUnitM2" | "emsalOverride" | "taksOverride" | "maxStoreysOverride"> & {
    landAreaM2: number;
    ownerShareOfSellable: number;
    assumedNetUnitM2: number;
    emsalOverride?: number;
    taksOverride?: number;
    maxStoreysOverride?: number;
  },
  summary: KkaBuildingSummary,
  hakedisTrancheCount: number,
): Record<string, string> {
  return {
    IL: form.il || "-",
    ILCE: form.ilce || "-",
    KOY: form.koy.trim() || "-",
    MAHALLE: form.mahalle.trim() || "-",
    ADA: form.ada.trim() || "-",
    PARSEL: form.parsel.trim() || "-",
    LAND_M2: form.landAreaM2.toLocaleString("tr-TR"),
    EMSAL: summary.effectiveEmsal.toFixed(2).replace(".", ","),
    TAKS: summary.effectiveTaks.toFixed(2).replace(".", ","),
    MAX_KAT: String(summary.effectiveMaxStoreys),
    KAT_TEORIK: String(summary.floorsFromEmsalTaks),
    KAT_UYGULANAN: String(summary.cappedFloorsBuildable),
    INSAAT_BRUT: Math.round(summary.grossConstructionRightM2).toLocaleString("tr-TR"),
    OWNER_PAY: (form.ownerShareOfSellable * 100).toFixed(0),
    OWNER_M2: Math.round(summary.ownerApproxSellableM2).toLocaleString("tr-TR"),
    DEV_M2: Math.round(summary.contractorApproxSellableM2).toLocaleString("tr-TR"),
    E_UNIT: String(form.assumedNetUnitM2),
    OWNER_UNITS: String(summary.ownerEquivalentUnits).replace(".", ","),
    MATCH_KEY: summary.profile.matchedKey,
    HAKEDIS_ROLLING_BLOCK: formatKkaRollingHakedisContractBlock(hakedisTrancheCount),
    HAKEDIS_TRANCHE_COUNT: String(hakedisTrancheCount),
    HAKEDIS_LEGAL_NOTE: kkaRollingHakedisLegalPrinciplesNoteTr(),
  };
}

export default function KkaParselStudioPage() {
  const navigate = useNavigate();
  const [il, setIl] = useState("İstanbul");
  const [ilce, setIlce] = useState("Kadıköy");
  const [koy, setKoy] = useState("");
  const [mahalle, setMahalle] = useState("");
  const [ada, setAda] = useState("15");
  const [parsel, setParsel] = useState("200");
  const [landM2Str, setLandM2Str] = useState("600");
  const [ownerSharePct, setOwnerSharePct] = useState(32);
  const [netUnitStr, setNetUnitStr] = useState("110");
  const [emsalOr, setEmsalOr] = useState("");
  const [taksOr, setTaksOr] = useState("");
  const [maxKatOr, setMaxKatOr] = useState("");
  const [summary, setSummary] = useState<KkaBuildingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contractsOpen, setContractsOpen] = useState(false);
  const [hakedisTrancheCount, setHakedisTrancheCount] = useState(4);

  const contractText = useMemo(() => {
    if (!summary) return "";
    const land = parseNum(landM2Str);
    const netU = parseNum(netUnitStr);
    const ctx = buildContractCtx(
      {
        il,
        ilce,
        koy,
        mahalle,
        ada,
        parsel,
        landAreaM2: land,
        ownerShareOfSellable: ownerSharePct / 100,
        assumedNetUnitM2: Number.isFinite(netU) && netU > 0 ? netU : 110,
        emsalOverride: parseOptional(emsalOr),
        taksOverride: parseOptional(taksOr),
        maxStoreysOverride: parseOptional(maxKatOr),
      },
      summary,
      hakedisTrancheCount,
    );
    return KKA_STUDIO_CONTRACT_SECTIONS.map(
      (s) => `=== ${s.title} ===\n\n${fillKkaContractPlaceholders(s.body, ctx)}`,
    ).join("\n\n");
  }, [summary, il, ilce, koy, mahalle, ada, parsel, landM2Str, ownerSharePct, netUnitStr, emsalOr, taksOr, maxKatOr, hakedisTrancheCount]);

  function parseOptional(s: string): number | undefined {
    const t = s.trim();
    if (!t) return undefined;
    const n = parseNum(t);
    return Number.isFinite(n) ? n : undefined;
  }

  function runCalculate() {
    setError(null);
    const land = parseNum(landM2Str);
    const netU = parseNum(netUnitStr);
    if (!Number.isFinite(land) || land <= 0) {
      setError("Gecerli bir arsa alani (m2) girin.");
      setSummary(null);
      return;
    }
    try {
      const input: KkaParselFormInput = {
        il,
        ilce,
        koy,
        mahalle,
        ada,
        parsel,
        landAreaM2: land,
        ownerShareOfSellable: ownerSharePct / 100,
        assumedNetUnitM2: Number.isFinite(netU) && netU > 0 ? netU : 110,
        emsalOverride: parseOptional(emsalOr),
        taksOverride: parseOptional(taksOr),
        maxStoreysOverride: parseOptional(maxKatOr),
      };
      setSummary(computeKkaBuildingSummary(input));
    } catch (e) {
      setSummary(null);
      setError(e instanceof Error ? e.message : "Hesaplama hatasi");
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(KKA_HUB_PATH)} className="text-slate-500 hover:text-slate-900 gap-2">
          <ArrowLeft className="w-4 h-4" /> Kat karsiligi modulune don
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <MapPinned className="h-8 w-8 text-emerald-400" />
              Ada / parsel ve imar stüdyosu
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Il, ilce, koy, mahalle, ada ve parsel bilgisi ile demo imar parametreleri eslestirilir; arsa m2 ve arsa sahibi payi
              uzerinden yaklasik insaat hakki, taban ust siniri ve kat adedi ust siniri hesaplanir. Resmi imar durumu, TKGM
              geometrisi ve muteahhit projesi olmadan baglayici sonuc uretilemez — bu ekran profesorluk düzeyinde cerceve ve
              kontrol listesi sunar, idari kayit yerine gecmez.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="outline" className="border-emerald-500/40 text-emerald-100" onClick={() => setContractsOpen(true)} disabled={!summary}>
              <FileStack className="w-4 h-4" />
              Sozlesme paketi (tek tik)
            </Button>
            <Button variant="outline" className="border-white/15" onClick={() => navigate("/komisyon-hesaplayici")}>
              <Scale className="w-4 h-4" /> Komisyon
            </Button>
          </div>
        </div>

        <Card className="border-amber-500/25 bg-amber-500/5">
          <CardContent className="p-4 text-xs text-amber-100/95 leading-relaxed">
            <strong className="font-semibold">Yasal uyari:</strong> 6306 sayili kanun, imar plani notlari, sit alanlari, kentsel
            donusum kararlari ve belediye mevzuati hesaplari kokten degistirebilir. Bu modul yalnizca ihaleal icinde egitim ve
            kabataslak hazirlik icindir; imza oncesi mutlaka imar muhendisi ve avukat ile dosya bazinda calisiniz.
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 bg-slate-900/50">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-cyan-400" />
                Parsel adresi
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-400">Il</Label>
                  <Input value={il} onChange={(e) => setIl(e.target.value)} className="bg-slate-950/80 border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400">Ilce</Label>
                  <Input value={ilce} onChange={(e) => setIlce(e.target.value)} className="bg-slate-950/80 border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400">Koy (opsiyonel)</Label>
                  <Input value={koy} onChange={(e) => setKoy(e.target.value)} className="bg-slate-950/80 border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400">Mahalle</Label>
                  <Input value={mahalle} onChange={(e) => setMahalle(e.target.value)} className="bg-slate-950/80 border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400">Ada</Label>
                  <Input value={ada} onChange={(e) => setAda(e.target.value)} className="bg-slate-950/80 border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400">Parsel</Label>
                  <Input value={parsel} onChange={(e) => setParsel(e.target.value)} className="bg-slate-950/80 border-slate-200" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400">Arsa yuzolcumu (m2, kabataslak)</Label>
                <Input value={landM2Str} onChange={(e) => setLandM2Str(e.target.value)} className="bg-slate-950/80 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Arsa sahibi satilabilir insaat payi: %{ownerSharePct}</Label>
                <input
                  type="range"
                  min={10}
                  max={55}
                  value={ownerSharePct}
                  onChange={(e) => setOwnerSharePct(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400">Varsayilan net konut birimi (m2)</Label>
                <Input value={netUnitStr} onChange={(e) => setNetUnitStr(e.target.value)} className="bg-slate-950/80 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Hakedis dilimi sayisi sozlesme taslagi: {hakedisTrancheCount}</Label>
                <input
                  type="range"
                  min={2}
                  max={8}
                  value={hakedisTrancheCount}
                  onChange={(e) => setHakedisTrancheCount(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Ilk hakedis tutari sonraki kismi kabul onayina kadar bloke; her yeni dilim onayinda bir onceki odenebilir. Son dilim kesin kabul / tapu zincirine bagli.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Emsal (KAKS) override</Label>
                  <Input placeholder="bos = profil" value={emsalOr} onChange={(e) => setEmsalOr(e.target.value)} className="bg-slate-950/80 border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">TAKS override</Label>
                  <Input placeholder="bos = profil" value={taksOr} onChange={(e) => setTaksOr(e.target.value)} className="bg-slate-950/80 border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Max kat override</Label>
                  <Input placeholder="bos = profil" value={maxKatOr} onChange={(e) => setMaxKatOr(e.target.value)} className="bg-slate-950/80 border-slate-200" />
                </div>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500" onClick={runCalculate}>
                Teknik ve imar ozetini hesapla
              </Button>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-slate-900/40">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
                Sonuc panosu
              </h2>
              {!summary ? (
                <p className="text-sm text-slate-500">Once hesapla dugmesine basin.</p>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="rounded-lg border border-slate-200 bg-black/20 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Imar profili</div>
                    <div className="text-white font-medium mt-1">{summary.profile.zoningLabel}</div>
                    <div className="text-xs text-slate-500 mt-2">
                      Kaynak: {summary.profile.resolutionSource} — anahtar: <code className="text-cyan-300">{summary.profile.matchedKey}</code>
                    </div>
                  </div>
                  <dl className="grid gap-2 text-slate-300">
                    <div className="flex justify-between gap-4">
                      <dt>Emsal (KAKS)</dt>
                      <dd className="text-white font-medium">{summary.effectiveEmsal.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>TAKS</dt>
                      <dd className="text-white font-medium">{summary.effectiveTaks.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Plan max kat</dt>
                      <dd className="text-white font-medium">{summary.effectiveMaxStoreys}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
                      <dt>Taban oturumu ust siniri (m2)</dt>
                      <dd className="text-emerald-200 font-semibold">{Math.round(summary.maxFootprintM2).toLocaleString("tr-TR")}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Brut insaat hakki kabullu (m2)</dt>
                      <dd className="text-emerald-200 font-semibold">{Math.round(summary.grossConstructionRightM2).toLocaleString("tr-TR")}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Emsal/TAKS teorik kat</dt>
                      <dd className="text-white">{summary.floorsFromEmsalTaks}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Uygulanan ust kat (min sinir)</dt>
                      <dd className="text-teal-200 font-bold text-lg">{summary.cappedFloorsBuildable}</dd>
                    </div>
                    {summary.storeysLimitedByHeight != null && (
                      <div className="flex justify-between gap-4 text-xs text-slate-500">
                        <dt>Yukseklik ile teorik kat</dt>
                        <dd>{summary.storeysLimitedByHeight}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
                      <dt>Arsa sahibi yaklasik satilabilir brut (m2)</dt>
                      <dd className="text-white font-medium">{Math.round(summary.ownerApproxSellableM2).toLocaleString("tr-TR")}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Muteahhit yaklasik satilabilir brut (m2)</dt>
                      <dd className="text-slate-400">{Math.round(summary.contractorApproxSellableM2).toLocaleString("tr-TR")}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Birim esdegeri ({netUnitStr} m2)</dt>
                      <dd className="text-teal-200 font-semibold">{summary.ownerEquivalentUnits} adet</dd>
                    </div>
                  </dl>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-amber-200/90">Uyari ve notlar</div>
                    <ul className="list-disc pl-4 text-xs text-slate-500 space-y-1">
                      {summary.profile.planNotes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                      {summary.warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="secondary" className="w-full border-slate-200" onClick={() => setContractsOpen(true)}>
                    <Gavel className="w-4 h-4" /> Tum sozlesme metinlerini goster
                  </Button>
                  {summary && (
                    <PdfExportButton
                      className="w-full"
                      label="KKA sonucunu PDF indir"
                      onExport={() =>
                        downloadKkaResultPdf({
                          address: `${mahalle}, ${ilce}, ${il}`,
                          landM2: parseNum(landM2Str),
                          ownerSharePct,
                          summaryLines: [
                            `Brut insaat hakki: ${Math.round(summary.grossConstructionRightM2).toLocaleString("tr-TR")} m²`,
                            `Arsa sahibi satilabilir: ${Math.round(summary.ownerApproxSellableM2).toLocaleString("tr-TR")} m²`,
                            `Birim esdegeri: ${summary.ownerEquivalentUnits} adet`,
                          ],
                        })
                      }
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="text-[11px] text-slate-600">
          Ek dokuman: repoda{" "}
          <code className="text-slate-500">docs/hukuk/KKA_SOZLESME_VE_KAZANC_PLANI_TASLAK.md</code>
        </p>
      </div>

      <Sheet open={contractsOpen} onOpenChange={setContractsOpen}>
        <SheetContent
          side="right"
          className="!w-full !max-w-[min(100vw,48rem)] overflow-y-auto border-l border-slate-200 bg-[#0b1020] text-slate-200 sm:!max-w-[48rem]"
        >
          <SheetHeader>
            <SheetTitle className="text-white">KKA sozlesme paketi (taslak)</SheetTitle>
            <SheetDescription className="text-slate-400">
              Asagidaki bolumleri tek tikla inceleyebilir veya kopyalayabilirsiniz. Imza oncesi avukat onayi zorunludur.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-2 pb-8">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/20"
              disabled={!contractText}
              onClick={() => void navigator.clipboard.writeText(contractText)}
            >
              Tumunu panoya kopyala
            </Button>
            {KKA_STUDIO_CONTRACT_SECTIONS.map((sec) => (
              <details key={sec.id} className="group rounded-lg border border-slate-200 bg-white/[0.03] open:bg-white/[0.05]">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-white list-none flex justify-between items-center">
                  {sec.title}
                  <span className="text-slate-500 text-xs group-open:rotate-90 transition-transform">&#8250;</span>
                </summary>
                <pre className="whitespace-pre-wrap px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-200/80 pt-3 font-sans">
                  {summary
                    ? fillKkaContractPlaceholders(
                        sec.body,
                        buildContractCtx(
                          {
                            il,
                            ilce,
                            koy,
                            mahalle,
                            ada,
                            parsel,
                            landAreaM2: parseNum(landM2Str),
                            ownerShareOfSellable: ownerSharePct / 100,
                            assumedNetUnitM2: Math.max(1, parseNum(netUnitStr) || 110),
                            emsalOverride: parseOptional(emsalOr),
                            taksOverride: parseOptional(taksOr),
                            maxStoreysOverride: parseOptional(maxKatOr),
                          },
                          summary,
                          hakedisTrancheCount,
                        ),
                      )
                    : "Once ana formdan hesaplama yapin."}
                </pre>
              </details>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
