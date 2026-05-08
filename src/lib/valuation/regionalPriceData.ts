export type CityKey =
  | "istanbul"
  | "ankara"
  | "izmir"
  | "bursa"
  | "antalya"
  | "adana"
  | "konya"
  | "gaziantep"
  | "kocaeli"
  | "mugla";

export type TransactionType = "sale" | "rent";

export interface DistrictPrice {
  salePerM2: number;
  rentPerM2: number;
}

export interface CityPrice {
  key: CityKey;
  label: string;
  salePerM2: number;
  rentPerM2: number;
  districts?: Record<string, DistrictPrice>;
}

export const REGIONAL_PRICE_DATA: CityPrice[] = [
  {
    key: "istanbul",
    label: "Istanbul",
    salePerM2: 105_000,
    rentPerM2: 780,
    districts: {
      Besiktas: { salePerM2: 185_000, rentPerM2: 1_100 },
      Sisli: { salePerM2: 148_000, rentPerM2: 980 },
      Kadikoy: { salePerM2: 162_000, rentPerM2: 1_020 },
      Uskudar: { salePerM2: 132_000, rentPerM2: 900 },
      Bakirkoy: { salePerM2: 138_000, rentPerM2: 940 },
    },
  },
  {
    key: "ankara",
    label: "Ankara",
    salePerM2: 56_000,
    rentPerM2: 310,
    districts: {
      Cankaya: { salePerM2: 77_000, rentPerM2: 330 },
      Yenimahalle: { salePerM2: 61_000, rentPerM2: 295 },
      Etimesgut: { salePerM2: 53_000, rentPerM2: 270 },
      Kecioren: { salePerM2: 48_000, rentPerM2: 245 },
    },
  },
  {
    key: "izmir",
    label: "Izmir",
    salePerM2: 74_000,
    rentPerM2: 470,
    districts: {
      Konak: { salePerM2: 88_000, rentPerM2: 540 },
      Karsiyaka: { salePerM2: 96_000, rentPerM2: 590 },
      Bornova: { salePerM2: 83_000, rentPerM2: 500 },
      Buca: { salePerM2: 69_000, rentPerM2: 430 },
    },
  },
  {
    key: "bursa",
    label: "Bursa",
    salePerM2: 49_000,
    rentPerM2: 290,
    districts: {
      Nilufer: { salePerM2: 66_000, rentPerM2: 370 },
      Osmangazi: { salePerM2: 52_000, rentPerM2: 300 },
      Yildirim: { salePerM2: 44_000, rentPerM2: 255 },
    },
  },
  {
    key: "antalya",
    label: "Antalya",
    salePerM2: 71_000,
    rentPerM2: 460,
    districts: {
      Muratpasa: { salePerM2: 80_000, rentPerM2: 510 },
      Konyaalti: { salePerM2: 98_000, rentPerM2: 620 },
      Kepez: { salePerM2: 53_000, rentPerM2: 320 },
    },
  },
  {
    key: "adana",
    label: "Adana",
    salePerM2: 36_000,
    rentPerM2: 215,
    districts: {
      Seyhan: { salePerM2: 43_000, rentPerM2: 260 },
      Cukurova: { salePerM2: 49_000, rentPerM2: 300 },
      Yuregir: { salePerM2: 30_000, rentPerM2: 175 },
    },
  },
  {
    key: "konya",
    label: "Konya",
    salePerM2: 32_000,
    rentPerM2: 190,
    districts: {
      Selcuklu: { salePerM2: 40_000, rentPerM2: 240 },
      Meram: { salePerM2: 35_000, rentPerM2: 205 },
      Karatay: { salePerM2: 28_000, rentPerM2: 165 },
    },
  },
  {
    key: "gaziantep",
    label: "Gaziantep",
    salePerM2: 34_000,
    rentPerM2: 210,
    districts: {
      Sehitkamil: { salePerM2: 42_000, rentPerM2: 255 },
      Sahinbey: { salePerM2: 31_000, rentPerM2: 190 },
    },
  },
  {
    key: "kocaeli",
    label: "Kocaeli",
    salePerM2: 52_000,
    rentPerM2: 320,
    districts: {
      Izmit: { salePerM2: 60_000, rentPerM2: 360 },
      Gebze: { salePerM2: 58_000, rentPerM2: 350 },
      Basiskele: { salePerM2: 63_000, rentPerM2: 375 },
    },
  },
  {
    key: "mugla",
    label: "Mugla",
    salePerM2: 78_000,
    rentPerM2: 500,
    districts: {
      Bodrum: { salePerM2: 156_000, rentPerM2: 940 },
      Fethiye: { salePerM2: 92_000, rentPerM2: 620 },
      Marmaris: { salePerM2: 104_000, rentPerM2: 700 },
    },
  },
];

export const CITY_OPTIONS = REGIONAL_PRICE_DATA.map((item) => ({
  value: item.key,
  label: item.label,
}));

export function getCityByKey(city: CityKey): CityPrice | undefined {
  return REGIONAL_PRICE_DATA.find((item) => item.key === city);
}
