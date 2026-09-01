import { memo } from "react";
import type { Auction } from "@/types/auction";
import { FileText, Landmark, Scale } from "lucide-react";

/** İlan kartı altı: piyasa raporu, ekspertiz, resmi belgeler, taahhüt — tam akış ilan detayında. */
function ListingDocumentFooterInner({
  auction,
  compact = false,
  showTopRule = true,
}: {
  auction: Auction;
  compact?: boolean;
  /** Kart içinde üst çizgi zaten varsa false verin (çift çizgi olmasın). */
  showTopRule?: boolean;
}) {
  const hasMarketPdf = Boolean(auction.marketReportPdfName?.trim());
  const expertiseDeclared = auction.expertiseRequired === true || Boolean(auction.expertisePdfName?.trim());
  const hasExpertisePdf = Boolean(auction.expertisePdfName?.trim());
  const officialOk = auction.officialDocumentsForBuyer === true;
  const commitmentOk =
    (auction.commitmentFloorTRY != null && auction.commitmentCeilingTRY != null) ||
    auction.bindingCommitmentAccepted === true;

  const text = compact ? "text-[9px]" : "text-[10px]";
  const icon = compact ? "w-2.5 h-2.5 shrink-0" : "w-3 h-3 shrink-0";

  const Chip = ({
    ok,
    warn,
    label,
    Icon,
  }: {
    ok: boolean;
    warn?: boolean;
    label: string;
    Icon: typeof FileText;
  }) => (
    <span
      role="status"
      aria-label={`${label}: ${ok ? "tamam" : warn ? "eksik veya bekleniyor" : "ilan detayında"}`}
      className={`inline-flex items-center gap-0.5 rounded-[3px] px-1.5 py-0.5 font-normal border ${text} ${
        ok
          ? "bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] border-[var(--cizgi)]"
          : warn
            ? "bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] border-[var(--cizgi)]"
            : "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border-[var(--color-border)]"
      }`}
    >
      <Icon className={icon} aria-hidden />
      {label}
    </span>
  );

  return (
    <div
      role="region"
      aria-label="İlan belge ve rapor özeti: piyasa raporu, ekspertiz, resmi belge, taahhüt"
      className={`flex flex-wrap gap-1 ${compact ? "mt-2" : "mt-3"} ${showTopRule ? "pt-2.5 border-t border-slate-200/80" : "pt-1"}`}
      title="Belge ve rapor özeti — tam içerik ilan detayında"
    >
      <Chip ok={hasMarketPdf} label="Piyasa raporu" Icon={FileText} />
      <Chip ok={hasExpertisePdf} warn={expertiseDeclared && !hasExpertisePdf} label="Ekspertiz" Icon={Scale} />
      <Chip ok={officialOk} label="Resmi belge" Icon={Landmark} />
      {commitmentOk ? (
        <span
          role="status"
          aria-label="Taahhüt limiti veya onay kayıtlı"
          className={`inline-flex items-center rounded-[3px] px-1.5 py-0.5 font-normal border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] ${text}`}
        >
          Taahhüt
        </span>
      ) : null}
    </div>
  );
}

export const ListingDocumentFooter = memo(ListingDocumentFooterInner);
