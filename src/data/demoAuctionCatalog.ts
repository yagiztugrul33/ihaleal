import { AUCTIONS } from "@/data/auctions";
import type { Auction } from "@/types/auction";

/** Ürün hedefi: 100+ gerçekçi demo kayıt. */
export const DEMO_CATALOG_SIZE = 120;

const PLACES: { city: string; district: string }[] = [
  { city: "İstanbul", district: "Kadıköy" },
  { city: "İstanbul", district: "Beşiktaş" },
  { city: "İstanbul", district: "Şişli" },
  { city: "İstanbul", district: "Üsküdar" },
  { city: "İstanbul", district: "Bakırköy" },
  { city: "İstanbul", district: "Ataşehir" },
  { city: "Ankara", district: "Çankaya" },
  { city: "Ankara", district: "Yenimahalle" },
  { city: "Ankara", district: "Keçiören" },
  { city: "İzmir", district: "Konak" },
  { city: "İzmir", district: "Karşıyaka" },
  { city: "İzmir", district: "Bornova" },
  { city: "Antalya", district: "Muratpaşa" },
  { city: "Antalya", district: "Konyaaltı" },
  { city: "Bursa", district: "Osmangazi" },
  { city: "Bursa", district: "Nilüfer" },
  { city: "Adana", district: "Seyhan" },
  { city: "Kocaeli", district: "İzmit" },
  { city: "Mersin", district: "Yenişehir" },
  { city: "Konya", district: "Selçuklu" },
  { city: "Gaziantep", district: "Şehitkamil" },
  { city: "Kayseri", district: "Melikgazi" },
  { city: "Eskişehir", district: "Odunpazarı" },
  { city: "Trabzon", district: "Ortahazar" },
  { city: "Balıkesir", district: "Karesi" },
  { city: "Muğla", district: "Bodrum" },
  { city: "Muğla", district: "Fethiye" },
  { city: "Aydın", district: "Efeler" },
  { city: "Tekirdağ", district: "Süleymanpaşa" },
];

function hashSeed(seq: number): number {
  let h = Math.imul(seq, 2654435761) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 2246822519) >>> 0;
  return h >>> 0;
}

function roundMoney(n: number, step = 50_000): number {
  return Math.max(step, Math.round(n / step) * step);
}

function cloneAuction(src: Auction): Auction {
  return JSON.parse(JSON.stringify(src)) as Auction;
}

/** Demo gayrimenkul envanteri: özgün lokasyon ve deterministik fiyat çarpanı (tek kaynak). */
function buildDemoAuctionCatalog(): Auction[] {
  const base = AUCTIONS as Auction[];
  const out: Auction[] = base.map((a) => cloneAuction(a));
  const nBase = base.length;

  for (let seq = nBase + 1; seq <= DEMO_CATALOG_SIZE; seq++) {
    const src = base[(seq - 1) % nBase];
    const row = cloneAuction(src);
    const place = PLACES[(seq - 2) % PLACES.length];
    const hs = hashSeed(seq);
    const factor = 0.58 + (hs % 75) / 100;

    row.id = String(seq);
    row.city = place.city;
    row.district = place.district;
    row.location = `${place.city}, ${place.district}`;
    row.category = (["Konut", "Konut", "Ticari", "Konut", "Arsa"] as const)[seq % 5];

    const pref = (["Metro yakını", "Cadde cepheli", "Site içi", "Denize yakın", "Prestij lokasyon"] as const)[hs % 5];
    row.title = `${place.district} · ${pref} ${String(row.category).toLowerCase()} · ilan ${seq}`;

    row.currentBid = roundMoney(row.currentBid * factor);
    row.startingBid = roundMoney(Math.min(row.startingBid * factor, row.currentBid * 0.92));
    row.estimatedValue = roundMoney(row.estimatedValue * factor);
    row.aiPredictedPrice = roundMoney(row.aiPredictedPrice * factor);
    row.pricePerSqm = Math.max(8000, Math.round(row.pricePerSqm * factor));
    row.bidderCount = Math.min(92, 8 + (hs % 40));

    const stRotate = seq % 7;
    if (stRotate === 0 || stRotate === 5) row.status = "ended";
    else if (stRotate === 3 || stRotate === 6) row.status = "upcoming";
    else row.status = "live";

    const daysAhead = (hs % 14) + 1;
    row.endDate = new Date(Date.now() + 86400000 * daysAhead).toISOString();

    row.investmentScore = Math.min(97, Math.max(52, row.investmentScore + (hs % 11) - 5));

    out.push(row);
  }

  return out;
}

export const DEMO_AUCTION_CATALOG = buildDemoAuctionCatalog();
