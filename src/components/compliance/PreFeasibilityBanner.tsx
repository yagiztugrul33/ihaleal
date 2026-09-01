import { PRE_FEASIBILITY_DISCLAIMER_TR, PRE_FEASIBILITY_LABEL } from "@/lib/engineering/safeCalc";

type Props = { className?: string };

export function PreFeasibilityBanner({ className = "" }: Props) {
  return (
    <div
      className={`rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-4 py-3 text-sm text-[var(--metin-ikincil)] ${className}`}
      role="note"
    >
      <strong>{PRE_FEASIBILITY_LABEL}:</strong> {PRE_FEASIBILITY_DISCLAIMER_TR}
    </div>
  );
}