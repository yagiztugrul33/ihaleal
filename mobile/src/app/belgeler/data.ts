import type { DocumentItem } from "./types";

const now = Date.now();

export const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: "d-1",
    name: "Ekspertiz Özeti.pdf",
    type: "rapor",
    createdAtIso: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sizeKb: 820,
  },
  {
    id: "d-2",
    name: "Yetki Sözleşmesi.pdf",
    type: "sozlesme",
    createdAtIso: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
    sizeKb: 240,
  },
  {
    id: "d-3",
    name: "Kimlik Ön Yüz.jpg",
    type: "kimlik",
    createdAtIso: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
    sizeKb: 510,
  },
];

export async function fetchMockDocuments(forceError = false): Promise<DocumentItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 260));
  if (forceError) throw new Error("Mock error");
  return MOCK_DOCUMENTS;
}
