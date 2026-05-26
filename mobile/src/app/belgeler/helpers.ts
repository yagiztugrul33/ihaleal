import type { DocumentType } from "./types";

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDocumentSize(sizeKb: number): string {
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${sizeKb.toFixed(0)} KB`;
}

export function docTypeLabel(type: DocumentType): string {
  if (type === "kimlik") return "Kimlik";
  if (type === "sozlesme") return "Sözleşme";
  if (type === "rapor") return "Rapor";
  return "Diğer";
}
