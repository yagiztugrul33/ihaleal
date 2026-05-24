export type StandardOfferStatus = "pending" | "accepted" | "rejected" | "countered";

export type StandardOffer = {
  id: string;
  listingId: string;
  bidderUserId: string;
  bidderMask: string;
  amountTry: number;
  createdAt: string;
  status: StandardOfferStatus;
  counterAmountTry?: number;
  note?: string;
};

const KEY_PREFIX = "ihaleal_standard_offers_";

function storageKey(listingId: string): string {
  return `${KEY_PREFIX}${listingId}`;
}

function readRaw(listingId: string): StandardOffer[] {
  try {
    const raw = localStorage.getItem(storageKey(listingId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row) => row && typeof row === "object") as StandardOffer[];
  } catch {
    return [];
  }
}

function writeRaw(listingId: string, offers: StandardOffer[]): void {
  localStorage.setItem(storageKey(listingId), JSON.stringify(offers));
}

export function getStandardOffers(listingId: string): StandardOffer[] {
  return readRaw(listingId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function createStandardOffer(params: {
  listingId: string;
  bidderUserId: string;
  bidderMask: string;
  amountTry: number;
  floorTry?: number;
  ceilingTry?: number;
}): StandardOffer {
  const { listingId, bidderUserId, bidderMask, amountTry, floorTry, ceilingTry } = params;
  const now = new Date().toISOString();

  let status: StandardOfferStatus = "pending";
  let counterAmountTry: number | undefined;
  let note: string | undefined;

  if (typeof floorTry === "number" && amountTry < floorTry) {
    status = "rejected";
    note = "Satıcı alt limitinin altında kaldığı için reddedildi.";
  } else if (typeof ceilingTry === "number" && amountTry > ceilingTry) {
    status = "countered";
    counterAmountTry = ceilingTry;
    note = "Satıcı üst limit üzerinden karşı teklif döndü.";
  } else {
    note = "Satıcı değerlendirmesinde (özel teklif).";
  }

  const offer: StandardOffer = {
    id: `${listingId}-${Date.now()}`,
    listingId,
    bidderUserId,
    bidderMask,
    amountTry,
    createdAt: now,
    status,
    counterAmountTry,
    note,
  };

  const next = [offer, ...readRaw(listingId)];
  writeRaw(listingId, next);
  return offer;
}

export function updateStandardOfferDecision(params: {
  listingId: string;
  offerId: string;
  decision: StandardOfferStatus;
  counterAmountTry?: number;
  note?: string;
}): StandardOffer[] {
  const next = readRaw(params.listingId).map((row) => {
    if (row.id !== params.offerId) return row;
    return {
      ...row,
      status: params.decision,
      counterAmountTry:
        params.decision === "countered" ? params.counterAmountTry ?? row.counterAmountTry : undefined,
      note: params.note ?? row.note,
    };
  });
  writeRaw(params.listingId, next);
  return next;
}
