import type { PropertyRecord } from "@/types/property";
import { getPropertyKind } from "./kind";

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) >>> 0;
  return h;
}

export interface PropertyUiExtras {
  riskScore: number;
  liquidityMonths: number;
  personas: string[];
  highlights: string[];
  concerns: string[];
  neighborhoodSummary: string;
  monthlyExpenseTry: number;
  grossYieldPct: number;
  rentEstimateTry: number;
  projection5y: { year: number; value: number }[];
  nearbyPois: { type: string; name: string; distanceM: number; walkMin: number }[];
  earthquakeHistory: { date: string; magnitude: number; distanceKm: number }[];
  comparables: { id: string; title: string; priceTry: number; sqm: number }[];
  personaTags: { label: string; icon: string }[];
  fakeBidHonesty: number[];
}

const PERSONA_POOL = [
  { label: "İlk ev alıcısı", icon: "home" },
  { label: "Yatırımcı (kira)", icon: "trending" },
  { label: "Aile (çocuklu)", icon: "users" },
  { label: "Pet-friendly", icon: "paw" },
  { label: "Yaşlı erişilebilir", icon: "accessibility" },
];

export function getPropertyUiExtras(p: PropertyRecord): PropertyUiExtras {
  const h = hash(p.id);
  const d = (p.details ?? {}) as Record<string, unknown>;
  const price = p.priceTry ?? p.currentBidTry ?? p.aiPredictedPriceTry ?? 8_000_000;
  const sqm = p.grossSqm ?? p.netSqm ?? 100;
  const rent = p.rentTry ?? Math.round((price * 0.004) / 1000) * 1000;
  const comparablesRaw = (d.comparables as PropertyUiExtras["comparables"]) ?? [];
  const metroNear = Boolean((d.metroNear as boolean | undefined) ?? p.nearbyTransport?.length);

  const personas = PERSONA_POOL.filter((_, i) => (h >> i) & 1).map((x) => x.label);
  if (personas.length < 2) {
    personas.push("Yatırımcı (kira)", "Aile (çocuklu)");
  }

  const highlights = [
    metroNear ? "Metroya yakın" : `${p.city} merkez konum`,
    p.elevator ? "Asansörlü bina" : undefined,
    p.fiberInternet ? "Fiber internet altyapısı" : undefined,
    p.eligibleForCredit ? "Krediye uygun tapu" : undefined,
    p.seaView ? "Deniz manzarası" : undefined,
    p.security24h ? "7/24 güvenlikli site" : undefined,
  ].filter((x): x is string => Boolean(x));

  while (highlights.length < 5) {
    highlights.push(
      ["Yüksek talep bölgesi", "Metro 8 dk yürüme", "Yeni iş merkezi yakını", "Düşük aidat", "SPK ekspertiz hazır"][
        highlights.length % 5
      ],
    );
  }

  const concerns = [
    p.mortgage ? "Aktif ipotek kaydı var" : undefined,
    p.floodRisk ? "Sel riski bölgesi" : undefined,
    (p.aiRiskFlags?.length ?? 0) > 0 ? p.aiRiskFlags![0] : undefined,
    p.buildingAge === "20+" ? "Bina yaşı yüksek, renovasyon gerekebilir" : undefined,
  ].filter((x): x is string => Boolean(x));

  while (concerns.length < 3) {
    concerns.push(
      ["Aidat artış trendi", "Otopark sınırı", "Ana cadde gürültüsü"][concerns.length % 3],
    );
  }

  const nearbyPois = [
    { type: "metro", name: "Metro / Metrobüs", distanceM: 350 + (h % 900), walkMin: 5 + (h % 12) },
    { type: "bus", name: "Otobüs durağı", distanceM: 120 + (h % 400), walkMin: 2 + (h % 5) },
    { type: "school", name: (p.nearbySchools?.[0] as string) ?? "İlkokul", distanceM: 500 + (h % 800), walkMin: 7 + (h % 10) },
    { type: "hospital", name: (p.nearbyHospitals?.[0] as string) ?? "Özel hastane", distanceM: 900 + (h % 1200), walkMin: 12 + (h % 8) },
    { type: "market", name: "Market zinciri", distanceM: 200 + (h % 500), walkMin: 3 + (h % 4) },
    { type: "park", name: "Şehir parkı", distanceM: 400 + (h % 600), walkMin: 6 + (h % 6) },
    { type: "afad", name: "AFAD birimi", distanceM: 2500 + (h % 3000), walkMin: 0 },
    { type: "fire", name: "İtfaiye", distanceM: 1800 + (h % 2000), walkMin: 0 },
  ];

  const projection5y = [0, 1, 2, 3, 4, 5].map((y) => ({
    year: new Date().getFullYear() + y,
    value: Math.round(price * Math.pow(1.04 + (h % 8) / 100, y)),
  }));

  return {
    riskScore: 18 + (h % 55),
    liquidityMonths: 2 + (h % 10),
    personas,
    highlights: highlights.slice(0, 5),
    concerns: concerns.slice(0, 3),
    neighborhoodSummary: `${p.district} mahallesinde ${getPropertyKind(p)} segmentinde talep istikrarlı. ${p.aiSummary ?? "AI özet (demo)."}`,
    monthlyExpenseTry: (p.duesTry ?? 1200) + (p.siteFeeTry ?? 0) + Math.round(price * 0.00012),
    grossYieldPct: Math.round(((rent * 12) / price) * 1000) / 10,
    rentEstimateTry: rent,
    projection5y,
    nearbyPois,
    earthquakeHistory: [
      { date: "2023-02-06", magnitude: 7.7, distanceKm: 280 + (h % 120) },
      { date: "2020-01-24", magnitude: 6.8, distanceKm: 45 + (h % 30) },
    ],
    comparables: comparablesRaw.length
      ? comparablesRaw.map((c) => ({
          id: String(c.id),
          title: String(c.title),
          priceTry: Number(c.priceTry),
          sqm: Number(c.sqm),
        }))
      : Array.from({ length: 5 }, (_, i) => ({
          id: `prop-${String(((hash(p.id) + i) % 60) + 1).padStart(3, "0")}`,
          title: `${p.city} emsal ${i + 1}`,
          priceTry: Math.round(price * (0.85 + i * 0.04)),
          sqm: sqm + i * 12,
        })),
    personaTags: PERSONA_POOL.filter((_, i) => (h >> i) & 1 || i < 3),
    fakeBidHonesty: [92, 88, 95, 78, 91, 85, 90],
  };
}
