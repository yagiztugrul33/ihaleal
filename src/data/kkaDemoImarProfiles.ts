/**
 * Demo imar / parsel ornekleri — gercek TKGM veya belediye verisi degildir.
 */

export type DemoImarRow = {
  key: string;
  zoningLabel: string;
  emsal: number;
  taks: number;
  maxStoreysReg: number;
  typicalFloorHeightM: number;
  maxBuildingHeightM?: number;
  planNotes: string[];
};

export const DEFAULT_KKA_IMAR_KEY = "*|*|*|*";

export const KKA_DEMO_IMAR_ROWS: DemoImarRow[] = [
  {
    key: DEFAULT_KKA_IMAR_KEY,
    zoningLabel: "Bilinmeyen bolge — varsayilan egitim parametreleri",
    emsal: 0.35,
    taks: 0.25,
    maxStoreysReg: 8,
    typicalFloorHeightM: 3.1,
    maxBuildingHeightM: 28,
    planNotes: [
      "Resmi imar durumu sorgulanmadan bu degerler kullanilmamalidir.",
      "Belediye imar plani, siginak ve yol genisligi hesabi degistirebilir.",
    ],
  },
  {
    key: "istanbul|kadikoy|*|*",
    zoningLabel: "Konut alani (ornek Kadikoy cercevesi — demo)",
    emsal: 1.25,
    taks: 0.35,
    maxStoreysReg: 7,
    typicalFloorHeightM: 3.15,
    maxBuildingHeightM: 22.5,
    planNotes: ["Karma yapi ve cephe geri cekme notlari plan lehtarinda aranmalidir."],
  },
  {
    key: "istanbul|kadikoy|15|200",
    zoningLabel: "Konut + ticaret alti (parsel ozel demo)",
    emsal: 1.45,
    taks: 0.38,
    maxStoreysReg: 8,
    typicalFloorHeightM: 3.2,
    maxBuildingHeightM: 26,
    planNotes: ["Bu ada/parsel satiri yalnizca senaryo eslemesi icindir."],
  },
  {
    key: "ankara|cankaya|*|*",
    zoningLabel: "Konut alani (ornek Cankaya cercevesi — demo)",
    emsal: 0.95,
    taks: 0.3,
    maxStoreysReg: 6,
    typicalFloorHeightM: 3.05,
    maxBuildingHeightM: 21,
    planNotes: ["Otopark zorunlulugu ve yesil alan kotusu ayrica hesaplanmalidir."],
  },
  {
    key: "ankara|cankaya|7|11",
    zoningLabel: "Konut (parsel ozel demo)",
    emsal: 1.05,
    taks: 0.32,
    maxStoreysReg: 7,
    typicalFloorHeightM: 3.1,
    planNotes: ["Cankaya ornekleme; ada/parsel eslesmesi demo amaclidir."],
  },
];
