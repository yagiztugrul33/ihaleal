/** Demo metrics for portal dashboards (UTF-8, no BOM). */

export const EMLAKCI_DEMO_STATS = {
  activeListings: 24,
  totalViews30d: 18420,
  leads30d: 67,
  conversionPct: 3.6,
  aiUsed: 142,
  aiQuota: 200,
  pendingKyc: 2,
  openDisputes: 0,
};

export const EMLAKCI_DEMO_LISTINGS = [
  { id: "demo-1", title: "Kadıköy Moda 3+1 deniz manzaralı", price: 12_500_000, status: "aktif" },
  { id: "demo-2", title: "Beşiktaş Levent ofis katı", price: 28_000_000, status: "aktif" },
  { id: "demo-3", title: "Bodrum Yalıkavak villa", price: 45_000_000, status: "teklif" },
  { id: "demo-4", title: "Ankara Çankaya arsa", price: 8_200_000, status: "taslak" },
];

export const MUTEAHHIT_DEMO_STATS = {
  activeProjects: 6,
  kkaParsels: 4,
  pendingHakedis: 2,
  escrowTry: 18_400_000,
  completionPct: 72,
};

export const MUTEAHHIT_DEMO_PROJECTS = [
  { id: "p1", name: "Ataşehir KKA — 48 daire", stage: "kaba inşaat", progress: 68 },
  { id: "p2", name: "İzmir Bornova — 24 daire", stage: "ruhsat", progress: 22 },
  { id: "p3", name: "Bursa Nilüfer — 36 daire", stage: "teslim", progress: 94 },
];

export const INVESTOR_DEMO_OFFERS = [
  { id: "o1", listing: "Üsküdar tarihi konak", amount: 9_800_000, status: "beklemede", date: "2026-05-12" },
  { id: "o2", listing: "Antalya Lara rezidans", amount: 6_200_000, status: "kabul", date: "2026-05-08" },
  { id: "o3", listing: "İstanbul GES arazi", amount: 14_500_000, status: "reddedildi", date: "2026-05-01" },
];

export const INVESTOR_DEMO_WATCHLIST = [
  { id: "w1", title: "Çeşme Alaçatı yazlık", changePct: 4.2 },
  { id: "w2", title: "Esenyurt yeni proje", changePct: -1.1 },
  { id: "w3", title: "Ankara Oran arsa", changePct: 2.8 },
];

export const INVESTOR_DEMO_TAX = {
  estimatedGainTry: 1_240_000,
  kdvTry: 186_000,
  damgaTry: 42_000,
  netTry: 1_012_000,
  note: "Demo vergi özeti — üretimde YMM ve avukat onayı gerekir.",
};
