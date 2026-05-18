import { PRE_FEASIBILITY_DISCLAIMER_TR, PRE_FEASIBILITY_LABEL } from "@/lib/engineering/safeCalc";

type Props = { className?: string };

export function PreFeasibilityBanner({ className = "" }: Props) {
  return (
    <div
      className={`rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-50 ${className}`}
      role="note"
    >
      <strong>{PRE_FEASIBILITY_LABEL}:</strong> {PRE_FEASIBILITY_DISCLAIMER_TR}
    </div>
  );
}