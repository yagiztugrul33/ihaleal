import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { EarthquakeSubScore } from "@/types/property/earthquake";

export interface SubScoreBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subScore: EarthquakeSubScore | null;
}

export function SubScoreBreakdownModal({
  open,
  onOpenChange,
  subScore,
}: SubScoreBreakdownModalProps) {
  if (!subScore) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="afet-modal-overlay" />
        <Dialog.Content className="afet-modal-content" aria-describedby={undefined}>
          <div className="afet-modal-header">
            <Dialog.Title className="afet-modal-title">{subScore.label}</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="afet-modal-close" aria-label="Kapat">
                <X className="h-6 w-6" aria-hidden />
              </button>
            </Dialog.Close>
          </div>
          <p className="afet-modal-score">
            Alt skor: <strong>{subScore.score}</strong>
            <span className="afet-modal-weight"> / Ağırlık {subScore.weight}</span>
          </p>
          <p className="afet-modal-formula">{subScore.formula}</p>
          <p className="afet-modal-explain">{subScore.explanation}</p>
          {subScore.inputs?.length ? (
            <dl className="afet-modal-inputs">
              {subScore.inputs.map((i) => (
                <div key={i.label} className="afet-modal-input-row">
                  <dt>{i.label}</dt>
                  <dd>{i.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {subScore.improvementTips?.length ? (
            <div className="afet-modal-tips">
              <h3>İyileştirme önerileri</h3>
              <ul>
                {subScore.improvementTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
