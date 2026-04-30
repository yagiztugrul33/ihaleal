export type DocCategory = "tapu" | "kyc" | "ekspertiz" | "sozlesme";

export type DocStatus = "bekliyor" | "yuklendi" | "inceleniyor" | "onaylandi" | "reddedildi";

export type VaultDocument = {
  id: string;
  category: DocCategory;
  label: string;
  status: DocStatus;
  fileName?: string;
  updatedAt?: string;
  note?: string;
};

export const DOC_CATEGORY_LABEL: Record<DocCategory, string> = {
  tapu: "Tapu / mülkiyet özeti",
  kyc: "KYC / kimlik",
  ekspertiz: "Ekspertiz raporu",
  sozlesme: "Ön sözleşme taslağı",
};

export const DEMO_VAULT_DOCUMENTS: VaultDocument[] = [
  {
    id: "d1",
    category: "tapu",
    label: "Tapu özeti (PDF)",
    status: "onaylandi",
    fileName: "tapu-ozet-demo.pdf",
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "d2",
    category: "kyc",
    label: "Kimlik ve adres beyanı",
    status: "inceleniyor",
    fileName: "kyc-paket-demo.zip",
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "d3",
    category: "ekspertiz",
    label: "SPK uyumlu ekspertiz",
    status: "yuklendi",
    fileName: "ekspertiz-2026-demo.pdf",
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    note: "Uzman incelemesi sırada.",
  },
  {
    id: "d4",
    category: "sozlesme",
    label: "Ön satış çerçeve metni",
    status: "bekliyor",
  },
];
