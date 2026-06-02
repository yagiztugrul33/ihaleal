import { Link } from "react-router-dom";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calcMortgagePayment, formatTry } from "@/lib/mortgageCalc";
import { FxRef } from "@/components/FxRef";
import { useMemo } from "react";

type Props = {
  priceTry: number;
  className?: string;
};

export function ListingMortgageWidget({ priceTry, className = "" }: Props) {
  const estimate = useMemo(() => {
    if (priceTry <= 0) return null;
    const principal = Math.round(priceTry * 0.8);
    return calcMortgagePayment(principal, 2.89, 120);
  }, [priceTry]);

  if (priceTry <= 0) return null;

  const href = `/konut-kredisi-hesaplayici?amount=${encodeURIComponent(String(Math.round(priceTry * 0.8)))}`;

  return (
    <div className={`rounded-xl border border-teal-500/25 bg-teal-500/5 p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-100 flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Bu ilan için kredi hesapla
          </p>
          {estimate ? (
            <p className="mt-1 text-xs text-slate-400">
              %80 finansman, 120 ay, %2,89 aylık faiz tahmini:{" "}
              <span className="text-teal-300 font-medium" dir="ltr">{formatTry(estimate.monthlyPayment)}/ay</span>
              <FxRef amountTry={estimate.monthlyPayment} variant="compact" className="ms-1 text-[11px] text-amber-300/80" />
            </p>
          ) : null}
          <p className="mt-2 text-[10px] text-slate-500">Bilgilendirme amaçlı; banka onayı gerekir.</p>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0 border-teal-500/30 text-teal-200">
          <Link to={href}>Hesapla</Link>
        </Button>
      </div>
    </div>
  );
}
