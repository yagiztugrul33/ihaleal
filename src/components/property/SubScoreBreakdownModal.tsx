import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { SubScoreBreakdown } from "@/types/property/disaster";

export interface SubScoreBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subScore: SubScoreBreakdown | null;
}

const IMPROVEMENT_HINTS: Record<string, string[]> = {
  faultProximity: ["Zemin etudu ve mikro bolgeleme raporu alin.", "Fay mesafesi yuksekse guclendirme planlayin."],
  retrofit: ["Statik performans raporu hazirlayin.", "Kat malikleri kurulu karari alin."],
  insurance: ["DASK ve konut policesi tutarini guncelleyin."],
};

export function SubScoreBreakdownModal({ open, onOpenChange, subScore }: SubScoreBreakdownModalProps) {
  if (!subScore) return null;
  const tips = IMPROVEMENT_HINTS[subScore.key] ?? ["Bagimsiz muhendis ile teyit edin.", "Belge arsivi olusturun."];
  const inputRows = Object.entries(subScore.inputs).map(([k, v]) => ({ label: k, value: String(v) }));
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="afet-modal-overlay" />
        <Dialog.Content className="afet-modal-content" aria-describedby={undefined}>
          <div className="afet-modal-header">
            <Dialog.Title className="afet-modal-title">{subScore.labelTr}</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="afet-modal-close" aria-label="Kapat"><X className="h-6 w-6" aria-hidden /></button>
            </Dialog.Close>
          </div>
          <p className="afet-modal-score">Ham skor: <strong>{subScore.score}</strong><span className="afet-modal-weight"> / Agirlik %{Math.round(subScore.weight * 100)} = {subScore.weightedPoints} puan</span></p>
          <p className="afet-modal-formula">{subScore.formulaTr}</p>
          <p className="afet-modal-explain">{subScore.explanationTr}</p>
          {inputRows.length ? (
            <dl className="afet-modal-inputs">{inputRows.map((i) => (<div key={i.label} className="afet-modal-input-row"><dt>{i.label}</dt><dd>{i.value}</dd></div>))}</dl>
          ) : null}
          <div className="afet-modal-tips"><h3>Iyilestirme onerileri</h3><ul>{tips.map((t) => <li key={t}>{t}</li>)}</ul></div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}