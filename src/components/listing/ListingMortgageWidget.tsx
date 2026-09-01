import { Link } from "react-router-dom";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calcMortgagePayment, formatTry } from "@/lib/mortgageCalc";
import { FxRef } from "@/components/FxRef";
import { useMemo } from "react";
import { useLocale } from "@/contexts/LocaleContext";

type Props = {
  priceTry: number;
  className?: string;
};

export function ListingMortgageWidget({ priceTry, className = "" }: Props) {
  const { t } = useLocale();
  const lv = t.loanValuation;
  const estimate = useMemo(() => {
    if (priceTry <= 0) return null;
    const principal = Math.round(priceTry * 0.8);
    return calcMortgagePayment(principal, 2.89, 120);
  }, [priceTry]);

  if (priceTry <= 0) return null;

  const href = `/konut-kredisi-hesaplayici?amount=${encodeURIComponent(String(Math.round(priceTry * 0.8)))}`;

  return (
    <div className={`rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-normal text-[var(--metin-ikincil)] flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            {lv.widgetTitle}
          </p>
          {estimate ? (
            <p className="mt-1 text-xs text-slate-400">
              <span dir="ltr">80% · 120 · 2.89%</span> {lv.widgetEstimate}{" "}
              <span className="text-[var(--metin-ikincil)] font-normal" dir="ltr">{formatTry(estimate.monthlyPayment)}/{lv.monthlyInstallment.toLowerCase().split(" ")[0]}</span>
              <FxRef amountTry={estimate.monthlyPayment} variant="compact" className="ms-1 text-[11px] text-[var(--metin-ikincil)]" />
            </p>
          ) : null}
          <p className="mt-2 text-[10px] text-slate-500">{lv.widgetBankNote}</p>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0 border-[var(--cizgi)] text-[var(--metin-ikincil)]">
          <Link to={href}>{lv.widgetCalculate}</Link>
        </Button>
      </div>
    </div>
  );
}
