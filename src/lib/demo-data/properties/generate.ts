import { computeListingNumber } from "@/lib/listingNumber";
import type {
  CategoryKey,
  PropertyRecord,
  KonutDetay,
  OfisDetay,
  FabrikaDetay,
  OtelDetay,
  ArsaDetay,
  KompleBinaDetay,
  GesDetay,
  DevrenDetay,
  AvmMagazaDetay,
  DepoDetay,
} from "@/types/property";

const PHOTO_COUNT = 6;
const PHOTO_BASE = "/images/auction";

export const DEMO_PROPERTY_COUNT = 60;

type TaxonSlot = {
  category: CategoryKey;
  sub: string;
  type: string;
};

function slot(category: CategoryKey, sub: string, type: string): TaxonSlot {
  return { category, sub, type };
}

const DISTRIBUTION: TaxonSlot[] = [
  ...repeat(slot("konut", "daire", "apartman"), 4),
  ...repeat(slot("konut", "daire", "site"), 3),
  ...repeat(slot("konut", "daire", "dubleks"), 2),
  ...repeat(slot("konut", "villa", "mustakil"), 2),
  slot("konut", "villa", "ikiz"),
  slot("konut", "yazlik", "deniz"),
  slot("konut", "rezidans", "luks"),
  slot("konut", "rezidans", "servisli"),
  ...repeat(slot("ticari", "ofis", "a_sinif"), 3),
  ...repeat(slot("ticari", "ofis", "plaza_ofis"), 2),
  slot("ticari", "ofis", "coworking"),
  ...repeat(slot("ticari", "magaza", "cadde"), 2),
  slot("ticari", "magaza", "avm_ici"),
  slot("ticari", "avm", "unite"),
  ...repeat(slot("endustri", "fabrika", "uretim"), 3),
  slot("endustri", "fabrika", "montaj"),
  ...repeat(slot("endustri", "depo", "lojistik"), 2),
  slot("endustri", "depo", "soguk"),
  slot("endustri", "atolye", "imalat"),
  ...repeat(slot("konaklama", "otel", "butik"), 2),
  ...repeat(slot("konaklama", "otel", "resort"), 2),
  ...repeat(slot("konaklama", "otel", "sehir"), 2),
  slot("konaklama", "pansiyon", "butik_pansiyon"),
  slot("konaklama", "apart_otel", "suit"),
  ...repeat(slot("arsa", "konut_imari", "parsel"), 4),
  ...repeat(slot("arsa", "ticari_imari", "parsel"), 3),
  ...repeat(slot("arsa", "tarla", "sulama"), 2),
  slot("arsa", "tarla", "kuru"),
  ...repeat(slot("komple", "bina", "komple_bina"), 2),
  slot("komple", "site", "konut_sitesi"),
  slot("komple", "plaza", "ticari_plaza"),
  slot("altyapi", "ges", "arazi"),
  slot("altyapi", "ges", "cati"),
  slot("altyapi", "res", "ruzgar"),
  slot("devren", "isletme", "restoran"),
  slot("devren", "isletme", "cafe"),
];

const CITIES: {
  city: string;
  districts: string[];
  lat: number;
  lng: number;
}[] = [
  { city: "İstanbul", districts: ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Ataşehir"], lat: 41.01, lng: 28.97 },
  { city: "Ankara", districts: ["Çankaya", "Yenimahalle", "Keçiören"], lat: 39.93, lng: 32.85 },
  { city: "İzmir", districts: ["Karşıyaka", "Bornova", "Konak"], lat: 38.42, lng: 27.14 },
  { city: "Antalya", districts: ["Muratpaşa", "Konyaaltı", "Lara"], lat: 36.89, lng: 30.71 },
  { city: "Bodrum", districts: ["Yalıkavak", "Gümbet", "Bitez"], lat: 37.03, lng: 27.43 },
  { city: "Çeşme", districts: ["Alaçatı", "Ilıca", "Dalyan"], lat: 38.32, lng: 26.3 },
  { city: "Bursa", districts: ["Nilüfer", "Osmangazi", "Yıldırım"], lat: 40.19, lng: 29.06 },
  { city: "Eskişehir", districts: ["Odunpazarı", "Tepebaşı"], lat: 39.78, lng: 30.52 },
  { city: "Trabzon", districts: ["Ortahisar", "Akçaabat"], lat: 41.0, lng: 39.72 },
  { city: "Adana", districts: ["Seyhan", "Çukurova", "Yüreğir"], lat: 37.0, lng: 35.32 },
  { city: "Hatay", districts: ["Antakya", "Defne", "İskenderun"], lat: 36.2, lng: 36.16 },
];

const AUCTION_INDICES = new Set([0, 1, 9, 24, 39]);
const SEALED_INDICES = new Set([2, 3, 4]);
const TRADE_INDICES = new Set([5, 6]);

const KONUT_TITLES = [
  "Deniz manzaralı ferah daire",
  "Metro yakını yenilenmiş konut",
  "Site içi güvenlikli aile dairesi",
  "Cadde cepheli yatırımlık daire",
  "Bahçe katı dubleks konut",
  "Boğaz hattına yakın lüks daire",
  "Prestij rezidansta servisli daire",
  "Yazlık konforunda döşeli daire",
];

const TICARI_TITLES = [
  "Ana cadde üzeri kiracılı dükkan",
  "Plaza katında A sınıfı ofis",
  "AVM içi yüksek footfall ünite",
  "Coworking uyumlu modern ofis",
  "Kurumsal kiralamaya uygun ofis",
];

const ENDUSTRI_TITLES = [
  "OSB içi üretim tesisi",
  "Lojistik depo ve yükleme rampası",
  "Soğuk hava deposu yatırımı",
  "Montaj hattı hazır fabrika",
  "Yüksek tavanlı imalat atölyesi",
];

const KONAKLAMA_TITLES = [
  "Butik otel — yüksek doluluk",
  "Resort konseptli sahil oteli",
  "Şehir merkezinde iş oteli",
  "Apart otel suit birimleri",
  "Aile pansiyonu devralmaya hazır",
];

const ARSA_TITLES = [
  "İmarlı konut arsası — köşe parsel",
  "Ticari imarlı yatırım parseli",
  "Sulamalı tarla — tarımsal ruhsatlı",
  "Karma kullanım potansiyelli arsa",
  "Ada parseli — ifraz mümkün",
];

const KOMPLE_TITLES = [
  "Kiracılı komple bina paketi",
  "Konut sitesi yönetim birimi",
  "Ticari plaza tam kat portföyü",
];

const ALTYAPI_TITLES = [
  "Arazi GES — bağlantı anlaşmalı",
  "Çatı GES kurulum alanı",
  "Rüzgar santrali geliştirme sahası",
];

const DEVREN_TITLES = [
  "Devren restoran — ciro hazır",
  "Devren kafe — merkezi lokasyon",
];

function repeat(item: TaxonSlot, count: number): TaxonSlot[] {
  return Array.from({ length: count }, () => ({ ...item }));
}

function padId(n: number): string {
  return `prop-${String(n).padStart(3, "0")}`;
}

function hashSeed(seq: number): number {
  let h = Math.imul(seq, 2654435761) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 2246822519) >>> 0;
  return h >>> 0;
}

function roundMoney(n: number, step = 50_000): number {
  return Math.max(step, Math.round(n / step) * step);
}

function photosFor(seq: number): string[] {
  return Array.from({ length: PHOTO_COUNT }, (_, i) => {
    const idx = ((seq - 1 + i) % PHOTO_COUNT) + 1;
    return `${PHOTO_BASE}-${idx}.jpg`;
  });
}

function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString();
}

function pickTitle(slot: TaxonSlot, seq: number): string {
  const pools: Partial<Record<CategoryKey, string[]>> = {
    konut: KONUT_TITLES,
    ticari: TICARI_TITLES,
    endustri: ENDUSTRI_TITLES,
    konaklama: KONAKLAMA_TITLES,
    arsa: ARSA_TITLES,
    komple: KOMPLE_TITLES,
    altyapi: ALTYAPI_TITLES,
    devren: DEVREN_TITLES,
  };
  const pool = pools[slot.category] ?? KONUT_TITLES;
  return pool[(seq - 1) % pool.length];
}

function buildComparables(seq: number, basePrice: number, city: string): Record<string, unknown>[] {
  return [1, 2, 3].map((k) => {
    const h = hashSeed(seq * 10 + k);
    const factor = 0.82 + (h % 35) / 100;
    return {
      id: padId(((seq + k) % DEMO_PROPERTY_COUNT) + 1),
      title: `${city} benzer ilan ${k}`,
      priceTry: roundMoney(basePrice * factor),
      sqm: 80 + (h % 220),
      distanceKm: Number((0.4 + (h % 12) / 10).toFixed(1)),
      similarity: Number((0.78 + (h % 20) / 100).toFixed(2)),
    };
  });
}

function resolveSqm(slot: TaxonSlot, h: number): number {
  if (slot.category === "konut") {
    if (slot.sub === "villa") return 180 + (h % 260);
    if (slot.sub === "rezidans") return 95 + (h % 180);
    if (slot.sub === "yazlik") return 80 + (h % 170);
    return 80 + (h % 170);
  }
  if (slot.category === "ticari") return 70 + (h % 360);
  if (slot.category === "endustri") return 650 + (h % 2900);
  if (slot.category === "konaklama") return 380 + (h % 2300);
  if (slot.category === "arsa" || slot.category === "altyapi") return 900 + (h % 11500);
  if (slot.category === "komple") return 900 + (h % 5200);
  if (slot.category === "devren") return 60 + (h % 380);
  return 100 + (h % 240);
}

function resolveUnitPrice(slot: TaxonSlot, h: number): number {
  if (slot.category === "konut") return 55_000 + (h % 125) * 1_000;
  if (slot.category === "ticari") return 45_000 + (h % 110) * 1_000;
  if (slot.category === "endustri") return 20_000 + (h % 55) * 1_000;
  if (slot.category === "konaklama") return 60_000 + (h % 120) * 1_000;
  if (slot.category === "arsa") return 4_000 + (h % 40) * 1_000;
  if (slot.category === "altyapi") return 3_000 + (h % 26) * 1_000;
  if (slot.category === "komple") return 32_000 + (h % 90) * 1_000;
  if (slot.category === "devren") return 25_000 + (h % 65) * 1_000;
  return 35_000 + (h % 80) * 1_000;
}

function buildBids(propertyId: string, seq: number, start: number, current: number): Record<string, unknown>[] {
  const count = 4 + (hashSeed(seq) % 5);
  const bids: Record<string, unknown>[] = [];
  let amount = start;
  for (let i = 0; i < count; i++) {
    const step = roundMoney(25_000 + (hashSeed(seq + i) % 8) * 25_000, 25_000);
    amount = Math.min(current, amount + step);
    bids.push({
      id: `bid-${propertyId}-${i + 1}`,
      bidder: `Teklifçi ${((hashSeed(seq + i * 3) % 90) + 10)}`,
      amountTry: amount,
      timestamp: isoDaysFromNow(-(count - i)),
    });
  }
  return bids;
}

function buildSealedOffers(seq: number, floor: number): Record<string, unknown>[] {
  return [1, 2, 3, 4].map((k) => ({
    id: `sealed-${padId(seq)}-${k}`,
    amountTry: roundMoney(floor * (0.92 + k * 0.02)),
    submittedAt: isoDaysFromNow(-k * 2),
    maskedBidder: `Kapalı-${k}`,
  }));
}

function buildTradeOffer(seq: number): Record<string, unknown> {
  return {
    id: `trade-${padId(seq)}-1`,
    targetType: "REAL_ESTATE",
    cashDifferenceTry: roundMoney(150_000 + (hashSeed(seq) % 20) * 50_000),
    offeredListingId: padId(((seq + 17) % DEMO_PROPERTY_COUNT) + 1),
    status: "PENDING",
    createdAt: isoDaysFromNow(-3),
  };
}

function buildTypeDetails(slot: TaxonSlot, seq: number, sqm: number): Record<string, unknown> {
  const h = hashSeed(seq);
  switch (slot.category) {
    case "konut": {
      const d: KonutDetay = {
        roomCount: ["2+1", "3+1", "4+1", "5+2"][(seq - 1) % 4],
        livingRoomCount: 1,
        bathroomCount: 1 + (h % 2),
        netSqm: Math.round(sqm * 0.88),
        grossSqm: sqm,
        floor: `${(h % 12) + 1}. Kat`,
        totalFloors: 8 + (h % 10),
        buildingAge: ["0-5", "6-10", "11-20"][(seq - 1) % 3],
        heatingType: "Merkezi (Doğalgaz)",
        facade: "Güney / Batı",
        balcony: true,
        elevator: true,
        parking: true,
        furnished: seq % 3 === 0,
        siteName: seq % 2 === 0 ? "Panorama Residence" : undefined,
        siteFeeTry: seq % 2 === 0 ? 2800 + (h % 5) * 200 : undefined,
        duesTry: 1200 + (h % 6) * 150,
        eligibleForCredit: true,
      };
      return d as Record<string, unknown>;
    }
    case "ticari": {
      if (slot.sub === "avm" || slot.sub === "magaza") {
        const d: AvmMagazaDetay = {
          netSqm: sqm,
          grossSqm: Math.round(sqm * 1.12),
          floorLevel: `${(h % 3) + 1}. Kat`,
          mallName: slot.sub === "avm" ? "Metropol AVM" : undefined,
          anchorNeighbor: h % 2 === 0,
          turnoverRent: true,
          monthlyRentTry: roundMoney(85_000 + (h % 15) * 10_000),
          camChargeTry: 12_000 + (h % 4) * 2000,
          frontageM: 8 + (h % 10),
          signageRights: true,
        };
        return d as Record<string, unknown>;
      }
      const d: OfisDetay = {
        netSqm: sqm,
        grossSqm: Math.round(sqm * 1.08),
        floor: `${(h % 18) + 2}. Kat`,
        totalFloors: 22,
        classRating: "A",
        divisible: h % 2 === 0,
        fitOut: "fitted",
        annualRentTry: roundMoney(sqm * 4200),
        occupancyRate: 72 + (h % 25),
        parkingRatio: 1 / 45,
      };
      return d as Record<string, unknown>;
    }
    case "endustri": {
      if (slot.sub === "depo") {
        const d: DepoDetay = {
          warehouseSqm: sqm,
          officeSqm: Math.round(sqm * 0.06),
          clearHeightM: 10 + (h % 4),
          dockCount: 2 + (h % 4),
          coldStorage: slot.type === "soguk",
          truckAccess: true,
          osbZone: "Organize Sanayi",
          annualRentTry: roundMoney(sqm * 900),
        };
        return d as Record<string, unknown>;
      }
      const d: FabrikaDetay = {
        productionSqm: sqm,
        officeSqm: Math.round(sqm * 0.05),
        ceilingHeightM: 9 + (h % 3),
        powerKva: 400 + (h % 12) * 50,
        craneCapacityTon: 5 + (h % 8),
        loadingDockCount: 2 + (h % 3),
        osbZone: "OSB Batı",
        environmentalPermit: true,
        fireApproval: true,
        tenantName: h % 3 === 0 ? "Demo Sanayi A.Ş." : undefined,
        annualRentTry: roundMoney(sqm * 1100),
      };
      return d as Record<string, unknown>;
    }
    case "konaklama": {
      const d: OtelDetay = {
        starRating: slot.type === "resort" ? 5 : slot.type === "butik" ? 4 : 3,
        roomCount: 18 + (h % 80),
        bedCount: 40 + (h % 120),
        occupancyRate: 58 + (h % 35),
        brandName: slot.type === "resort" ? "Ege Resort" : "Şehir Konak",
        licenseNo: `TURSAB-${10000 + h}`,
        restaurant: true,
        spa: slot.type === "resort",
        conferenceRooms: 1 + (h % 4),
        annualRevenueTry: roundMoney(8_000_000 + h * 120_000),
        ebitdaTry: roundMoney(1_200_000 + h * 40_000),
        managementContract: h % 2 === 0,
      };
      return d as Record<string, unknown>;
    }
    case "arsa": {
      const d: ArsaDetay = {
        landSqm: sqm,
        imarDurumu: slot.sub === "tarla" ? "Tarım" : "Konut / Ticari",
        emsal: slot.sub === "tarla" ? 0 : 1.2 + (h % 8) / 10,
        gabari: slot.sub === "tarla" ? 0 : 12.5 + (h % 6),
        kaks: slot.sub === "tarla" ? 0 : 0.4 + (h % 5) / 10,
        taks: slot.sub === "tarla" ? 0 : 0.25 + (h % 4) / 100,
        roadFrontageM: 12 + (h % 30),
        cornerParcel: h % 3 === 0,
        ifraz: h % 4 === 0,
        tevhit: false,
        planNoteUrl: "/docs/demo-imar-notu.pdf",
      };
      return d as Record<string, unknown>;
    }
    case "komple": {
      const d: KompleBinaDetay = {
        totalSqm: sqm,
        unitCount: 6 + (h % 24),
        floorCount: 4 + (h % 8),
        occupancyRate: 70 + (h % 28),
        annualRentTry: roundMoney(sqm * 3200),
        elevatorCount: 2 + (h % 3),
        parkingSpots: 10 + (h % 40),
        mixedUse: slot.sub === "plaza",
        tenantMix: ["Perakende", "Ofis", "F&B"].slice(0, 1 + (h % 3)),
      };
      return d as Record<string, unknown>;
    }
    case "altyapi": {
      const d: GesDetay = {
        installedCapacityMw: slot.sub === "res" ? undefined : 2.5 + (h % 18) / 10,
        panelCount: slot.sub === "ges" ? 1200 + h * 3 : undefined,
        annualProductionMwh: 4200 + h * 12,
        gridConnection: true,
        feedInTariff: "YEKDEM",
        landLeaseYears: 25,
        ppaSigned: h % 2 === 0,
        inverterBrand: "Huawei / SMA",
        commissioningDate: "2022-06-15",
      };
      return d as Record<string, unknown>;
    }
    case "devren": {
      const d: DevrenDetay = {
        businessName: slot.type === "restoran" ? "Meyhane 1924" : "Kahve Durağı",
        sector: slot.type === "restoran" ? "Restoran" : "Kafe",
        monthlyRevenueTry: roundMoney(420_000 + h * 8000),
        monthlyProfitTry: roundMoney(95_000 + h * 3000),
        employeeCount: 6 + (h % 14),
        leaseRemainingMonths: 24 + (h % 36),
        equipmentIncluded: true,
        brandRights: slot.type === "cafe",
        franchiseFeeTry: slot.type === "cafe" ? roundMoney(250_000) : undefined,
        transferReason: "Lokasyon değişikliği",
      };
      return d as Record<string, unknown>;
    }
    default:
      return {};
  }
}

function buildOne(seq: number, slot: TaxonSlot): PropertyRecord {
  const id = padId(seq);
  const h = hashSeed(seq);
  const place = CITIES[(seq - 1) % CITIES.length];
  const district = place.districts[(seq - 1) % place.districts.length];
  const neighborhood = ["Merkez", "Yeni Mahalle", "Sahil", "İş Merkezi"][(seq - 1) % 4];
  const sqm = resolveSqm(slot, h);
  const price = roundMoney(sqm * resolveUnitPrice(slot, h));
  const startingBid = roundMoney(price * 0.88);
  const currentBid = roundMoney(price * 0.94);
  const endDate = isoDaysFromNow(3 + (h % 21));
  const isAuction = AUCTION_INDICES.has(seq - 1);
  const isSealed = SEALED_INDICES.has(seq - 1);
  const isTrade = TRADE_INDICES.has(seq - 1);

  let marketingMode: PropertyRecord["marketingMode"] = "listing_only";
  if (isAuction) marketingMode = "auction";
  else if (isSealed) marketingMode = "sealed_offers";

  const dealType: PropertyRecord["dealType"] =
    isTrade || slot.category === "devren" ? "transfer" : seq % 11 === 0 ? "rent" : "sale";

  const title = `${district} — ${pickTitle(slot, seq)}`;
  const slug = `${slot.category}-${district.toLowerCase().replace(/\s+/g, "-")}-${seq}`;
  const operationModeText =
    marketingMode === "auction"
      ? "canlı ihale"
      : marketingMode === "sealed_offers"
        ? "kapalı teklif"
        : "doğrudan ilan";
  const longDescription = [
    `${place.city} ${district} bölgesinde konumlanan bu ${slot.sub} ilanı, ${operationModeText} akışıyla yönetilecek şekilde hazırlanmıştır. Lokasyonun ana ulaşım akslarına yakınlığı, günlük kullanım kolaylığını artırırken yatırım tarafında da likidite avantajı sağlar.`,
    `Mülk tarafında toplam ${sqm} m² ölçek, ${dealType === "rent" ? "kiralama" : "satış"} hedefi için dengeli bir kullanım profili sunar. Yapı ve alan detayları, ekspertiz referansı ve doküman paketine uyumlu biçimde tek panelde görülebilir; alıcı veya kiracı kararını verirken eksik bilgiyle ilerlemez.`,
    `Çevre bileşenlerinde okul, hastane, AVM ve toplu taşıma noktalarına erişim avantajı bulunur. Bu dağılım sadece oturum amaçlı kullanıcılar için değil, düzenli getiri veya uzun vadeli değer artışı arayan yatırımcı profili için de sürdürülebilir bir senaryo üretir.`,
    `Fiyatlama tarafında bölge emsalleri ve demo AI bandı birlikte değerlendirilir. Bu yaklaşım, satıcı beklentisini piyasa gerçekleriyle hizalarken alıcıya da müzakere ve teklif kararında daha ölçülebilir bir çerçeve sunar.`,
    `İşlem akışında iletişim ve belge paylaşımı platform içinde kalır; nihai hukuki kesinlik sözleşme seti ve resmi doğrulama adımlarıyla tamamlanır. Demo ortamda tüm içerik bilgilendirme amaçlıdır, canlı ödeme ve resmi devir adımları üretim süreçlerine bağlıdır.`,
  ].join("\n\n");

  const aiValuation = {
    estimatedValueTry: price,
    lowTry: roundMoney(price * 0.9),
    highTry: roundMoney(price * 1.08),
    confidence: 0.72 + (h % 25) / 100,
    methodology: "Çoklu regresyon + bölge endeksi (demo)",
    updatedAt: isoDaysFromNow(-1),
  };

  const details: Record<string, unknown> = {
    ...buildTypeDetails(slot, seq, sqm),
    comparables: buildComparables(seq, price, place.city),
    aiValuation,
    auctionEndDate: endDate,
    tags: ["demo", slot.category, slot.sub],
    nearbyHighlights: [
      { name: "Metro / toplu taşıma", type: "transport", distanceM: 350 + (h % 900) },
      { name: "Hastane", type: "health", distanceM: 800 + (h % 1200) },
      { name: "AVM", type: "shopping", distanceM: 600 + (h % 1500) },
    ],
  };

  if (isAuction) {
    details.bids = buildBids(id, seq, startingBid, currentBid);
    details.auctionStatus = "live";
  }
  if (isSealed) {
    details.sealedOffers = buildSealedOffers(seq, startingBid);
    details.sealedDeadline = endDate;
  }
  if (isTrade) {
    details.tradeEligible = true;
    details.tradeOffers = [buildTradeOffer(seq)];
  }

  const record: PropertyRecord = {
    id,
    title,
    listingNumber: computeListingNumber(id, endDate),
    slug,
    description: longDescription,
    shortDescription: `${district} · ${sqm} m² · ${dealType === "rent" ? "Kiralık" : dealType === "transfer" ? "Devren" : "Satılık"}`,
    status: "active",
    createdAt: isoDaysFromNow(-30 - (h % 60)),
    updatedAt: isoDaysFromNow(-2),
    publishedAt: isoDaysFromNow(-25),
    ownerId: `owner-${(h % 12) + 1}`,
    agencyId: `agency-${(h % 5) + 1}`,
    country: "Türkiye",
    city: place.city,
    district,
    neighborhood,
    address: `${neighborhood} Mah. Demo Cad. No:${10 + (h % 90)}`,
    postalCode: String(34000 + (h % 9000)),
    latitude: place.lat + (h % 100) / 1000,
    longitude: place.lng + (h % 100) / 1000,
    mapZoom: 14,
    parcelNo: `${(h % 80) + 1}`,
    blockNo: `${(h % 12) + 1}`,
    ada: `${100 + (h % 400)}`,
    pafta: `${2000 + (h % 500)}`,
    grossSqm: sqm,
    netSqm: Math.round(sqm * 0.9),
    landSqm: slot.category === "arsa" ? sqm : Math.round(sqm * 1.4),
    balconySqm: slot.category === "konut" ? 8 + (h % 40) : undefined,
    gardenSqm: slot.category === "konut" ? 0 + (h % 120) : undefined,
    roomCount: slot.category === "konut" ? ["2+1", "3+1", "4+1"][(seq - 1) % 3] : undefined,
    livingRoomCount: slot.category === "konut" ? 1 : undefined,
    bathroomCount: 1 + (h % 3),
    bedroomCount: slot.category === "konut" ? 2 + (h % 4) : undefined,
    floor: slot.category === "konut" ? `${(h % 10) + 1}. Kat` : undefined,
    totalFloors: 5 + (h % 20),
    buildingAge: ["0-5", "6-10", "11-20", "20+"][(seq - 1) % 4],
    ceilingHeightM: slot.category === "endustri" ? 9 + (h % 4) : 2.7 + (h % 3) / 10,
    facade: "Güney",
    orientation: "Güneydoğu",
    buildingType: slot.category === "konut" ? "Betonarme" : "Çelik / Betonarme",
    constructionType: "Betonarme karkas",
    heatingType: "Merkezi doğalgaz",
    coolingType: "VRF",
    insulation: "Dış cephe mantolama",
    earthquakeClass: "1B",
    elevator: slot.category !== "arsa",
    elevatorCount: slot.category === "komple" ? 2 : 1,
    parking: true,
    parkingSpots: 1 + (h % 4),
    indoorParking: h % 2 === 0,
    outdoorParking: true,
    balcony: slot.category === "konut",
    furnished: seq % 4 === 0,
    usageStatus: ["empty", "tenant", "owner"][(seq - 1) % 3] as PropertyRecord["usageStatus"],
    earthquakeRiskZone: "2. derece",
    floodRisk: h % 7 === 0,
    landslideRisk: false,
    fireCompartment: slot.category === "endustri" || slot.category === "komple",
    emergencyExit: true,
    sprinklerSystem: slot.category === "endustri",
    disasterInsurance: true,
    electricity: true,
    threePhasePower: slot.category === "endustri" || slot.category === "altyapi",
    powerKva: slot.category === "endustri" ? 250 + (h % 20) * 25 : 63,
    naturalGas: true,
    water: true,
    sewage: true,
    fiberInternet: true,
    generator: slot.category === "ticari" || slot.category === "komple",
    solarReady: slot.category === "altyapi" || h % 5 === 0,
    craneCapacityTon: slot.category === "endustri" ? 5 + (h % 10) : undefined,
    loadingDock: slot.category === "endustri",
    truckAccess: slot.category === "endustri",
    seaView: ["Antalya", "Bodrum", "Çeşme", "İzmir"].includes(place.city) && h % 2 === 0,
    cityView: true,
    forestView: place.city === "Trabzon" || place.city === "Eskişehir",
    greenAreaRatio: 15 + (h % 40),
    noiseLevel: (["low", "medium", "high"] as const)[h % 3],
    airQualityIndex: 42 + (h % 35),
    carbonFootprintKg: 1800 + h * 3,
    leedLevel: seq % 9 === 0 ? "Gold" : undefined,
    breeamLevel: seq % 11 === 0 ? "Very Good" : undefined,
    siteName: slot.category === "konut" ? "Demo Park Sitesi" : undefined,
    siteFeeTry: slot.category === "konut" ? 2500 + (h % 8) * 300 : undefined,
    security24h: true,
    concierge: slot.category === "konut" || slot.category === "konaklama",
    pool: slot.category === "konaklama" || (slot.category === "konut" && h % 3 === 0),
    gym: slot.category === "konut" && h % 2 === 0,
    playground: slot.category === "konut",
    socialFacilities: ["Güvenlik", "Otopark", "Sosyal alan"],
    nearbySchools: ["Anadolu Lisesi", "İlkokul"],
    nearbyHospitals: ["Özel Hastane", "Devlet Hastanesi"],
    nearbyTransport: ["Metro", "Metrobüs", "İskele"],
    titleDeedType: "Kat m²lkiyeti",
    occupancyPermit: true,
    zoningStatus: slot.category === "arsa" ? "İmarlı" : "Yapı kullanma",
    easement: false,
    mortgage: h % 5 === 0,
    lien: false,
    sharedOwnership: false,
    katIrtifaki: slot.category === "arsa",
    tapuDurumu: "Tapu hazır",
    eligibleForCredit: dealType === "sale",
    expertiseRequired: price > 5_000_000,
    expertiseDate: isoDaysFromNow(-40),
    expertiseValueTry: roundMoney(price * 0.98),
    expertisePdfUrl: "/docs/demo-ekspertiz.pdf",
    marketReportPdfUrl: "/docs/demo-piyasa-raporu.pdf",
    appraiserName: "Demo SPK Eksper A.Ş.",
    spkLicenseNo: `SPK-${8000 + (h % 500)}`,
    images: photosFor(seq),
    heroImage: photosFor(seq)[0],
    videoUrl: "/media/demo-tanitim.mp4",
    virtualTourUrl: "https://momento360.com/e/demo-tour",
    floorPlanUrls: ["/docs/demo-kat-plani.pdf"],
    droneVideoUrl: "/media/demo-drone.mp4",
    documentUrls: ["/docs/demo-tapu-ozet.pdf", "/docs/demo-imar.pdf"],
    aiPredictedPriceTry: roundMoney(price * 1.02),
    aiConfidence: 0.7 + (h % 28) / 100,
    aiInvestmentScore: 55 + (h % 42),
    aiPricePerSqm: Math.round((price * 1.02) / sqm),
    aiTags: ["yüksek talep", "metro yakını", "yatırımlık"].slice(0, 1 + (h % 3)),
    aiSummary: "Bölge endeksi üstü talep; fiyat bandı istikrarlı (demo analiz).",
    aiRiskFlags: h % 6 === 0 ? ["deprem güçlendirme önerisi"] : [],
    viewCount: 120 + h * 3,
    favoriteCount: 8 + (h % 40),
    inquiryCount: 2 + (h % 15),
    bidCount: isAuction ? (details.bids as unknown[]).length : isSealed ? 4 : 0,
    lastViewedAt: isoDaysFromNow(-1),
    featured: seq % 8 === 0,
    boostLevel: seq % 10 === 0 ? 2 : 0,
    dealType,
    marketingMode,
    currency: "TRY",
    priceTry: dealType === "sale" || dealType === "transfer" ? price : undefined,
    rentTry: dealType === "rent" ? roundMoney(28_000 + (h % 30) * 2000) : undefined,
    depositTry: dealType === "rent" ? roundMoney(56_000) : undefined,
    duesTry: 900 + (h % 12) * 100,
    pricePerSqmTry: Math.round(price / sqm),
    buyNowPriceTry: isAuction ? roundMoney(currentBid * 1.06) : undefined,
    startingBidTry: isAuction || isSealed ? startingBid : undefined,
    currentBidTry: isAuction ? currentBid : undefined,
    commitmentFloorTry: roundMoney(startingBid * 0.95),
    commitmentCeilingTry: roundMoney(price * 1.05),
    negotiable: !isAuction,
    contactViaPlatform: true,
    taxonomy: {
      category: slot.category,
      sub: slot.sub,
      type: slot.type,
      variant: slot.sub,
    },
    details,
  };

  return record;
}

/** 60 zengin demo gayrimenkul kaydı üretir (prop-001 … prop-060). */
export function buildDemoProperties(): PropertyRecord[] {
  if (DISTRIBUTION.length !== DEMO_PROPERTY_COUNT) {
    throw new Error(
      `Demo distribution must have ${DEMO_PROPERTY_COUNT} slots, got ${DISTRIBUTION.length}`
    );
  }
  return DISTRIBUTION.map((slot, index) => buildOne(index + 1, slot));
}
