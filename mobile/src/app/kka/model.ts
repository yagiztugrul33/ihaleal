export type KkaPreviewInput = {
  parcelValueTry: string;
  shareRatioPct: string;
};

export function getDefaultKkaInput(): KkaPreviewInput {
  return {
    parcelValueTry: "18.000.000",
    shareRatioPct: "40",
  };
}

export function validateKkaInput(input: KkaPreviewInput): string | null {
  const parcel = Number(input.parcelValueTry.replace(/\./g, "").replace(",", "."));
  const ratio = Number(input.shareRatioPct.replace(",", "."));
  if (!Number.isFinite(parcel) || parcel <= 0) return "Arsa değeri 0'dan büyük olmalı.";
  if (!Number.isFinite(ratio) || ratio <= 0 || ratio > 100) return "Pay oranı %0-100 arasında olmalı.";
  return null;
}
