import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TaxDisclaimerBanner } from "@/components/tax/TaxDisclaimerBanner";
import { taxSimulatorService } from "@/lib/tax/TaxSimulatorService";
import { getDefaultTaxSimulatorDeps } from "@/lib/tax/demoDeps";

export default function TaxSimulatorPage() {
  const [purchaseYm, setPurchaseYm] = useState("2021-06");
  const [buyTry, setBuyTry] = useState("1000000");
  const [saleTry, setSaleTry] = useState("2500000");
  const [area, setArea] = useState("");
  const [firstRes, setFirstRes] = useState(false);

  const deps = useMemo(() => getDefaultTaxSimulatorDeps(), []);

  const result = useMemo(() => {
    const declared = Math.max(0, Number(String(buyTry).replace(/\D/g, "")) || 0);
    const sale = Math.max(0, Number(String(saleTry).replace(/\D/g, "")) || 0);
    const areaM2 = area.trim() ? Math.max(0, Number(area.replace(/\D/g, "")) || 0) : undefined;
    try {
      return taxSimulatorService.estimate(
        {
          purchaseDate: purchaseYm,
          declaredPurchasePriceTry: declared || 1,
          expectedSalePriceTry: sale || 1,
          isFirstResidence: firstRes,
          areaM2: areaM2 && areaM2 > 0 ? areaM2 : undefined,
          propertyType: "konut",
        },
        deps
      );
    } catch {
      return null;
    }
  }, [purchaseYm, buyTry, saleTry, area, firstRes, deps]);

  return (
    <div className="container max-w-3xl py-10 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Calculator className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Vergi / harc simulatoru</h1>
          <p className="text-sm text-muted-foreground">
            TaxSimulatorService (Kimi ZIP) — tahmini matrah; resmi hesap degildir.
          </p>
        </div>
      </div>

      <TaxDisclaimerBanner />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Girdiler</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pur">Alis tarihi (YYYY-AA)</Label>
            <Input id="pur" value={purchaseYm} onChange={(e) => setPurchaseYm(e.target.value)} placeholder="2021-06" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Alan m2 (opsiyonel)</Label>
            <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="120" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buy">Tapu beyan alis (TRY)</Label>
            <Input id="buy" inputMode="numeric" value={buyTry} onChange={(e) => setBuyTry(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sale">Beklenen satis (TRY)</Label>
            <Input id="sale" inputMode="numeric" value={saleTry} onChange={(e) => setSaleTry(e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <Checkbox id="fr" checked={firstRes} onCheckedChange={(v) => setFirstRes(v === true)} />
            <Label htmlFor="fr" className="text-sm font-normal cursor-pointer">
              Konut tek ikamet / 150 m2 istisna potansiyeli (bilgilendirme)
            </Label>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ozet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid sm:grid-cols-2 gap-2">
              <p>
                <span className="text-muted-foreground">Tapu harci (satici payi):</span>{" "}
                <strong>{result.deedDuty.sellerShare.toLocaleString("tr-TR")} TL</strong>
              </p>
              <p>
                <span className="text-muted-foreground">GV (tahmini):</span>{" "}
                <strong>{result.capitalGainsTax.taxAmount.toLocaleString("tr-TR")} TL</strong>
                {result.capitalGainsTax.isFiveYearExempt && (
                  <span className="ml-2 text-xs text-emerald-600">(5 yil istisna uygulandi)</span>
                )}
              </p>
              <p>
                <span className="text-muted-foreground">Platform + KDV:</span>{" "}
                <strong>{result.platformFee.total.toLocaleString("tr-TR")} TL</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Saticiya tahmini net:</span>{" "}
                <strong>{result.netToSeller.estimatedNet.toLocaleString("tr-TR")} TL</strong>
              </p>
            </div>
            {result.warnings.length > 0 && (
              <ul className="list-disc pl-5 text-amber-800 dark:text-amber-200 space-y-1">
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">{result.disclaimer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
