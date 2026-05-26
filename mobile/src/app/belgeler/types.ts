export type DocumentType = "kimlik" | "sozlesme" | "rapor" | "diger";

export type DocumentItem = {
  id: string;
  name: string;
  type: DocumentType;
  createdAtIso: string;
  sizeKb: number;
};
