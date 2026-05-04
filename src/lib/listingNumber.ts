/**
 * Insan okunur ilan numarasi: ILN-{ISO hafta yili}-W{hafta}-{6 hex}
 * Sonek yalnizca `id` ile turetildigi icin ayni ilan her zaman ayni soneki alir.
 * Hafta etiketi: `endDate` ile hizalanir (kapanis haftasi); uretimde sabit numara icin DB'de saklayin.
 */

function fnv1a32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** ISO 8601 hafta (Pazartesi baslangic). */
export function getIsoWeekAndYear(d: Date): { weekYear: number; week: number } {
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const weekYear = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { weekYear, week };
}

function hexSuffixFromId(id: string, len: number): string {
  const h = fnv1a32(`ihaleal|${id}`);
  return h.toString(16).padStart(8, "0").slice(-len).toUpperCase();
}

export function computeListingNumber(id: string, endDateIso: string): string {
  const d = Number.isFinite(Date.parse(endDateIso)) ? new Date(endDateIso) : new Date();
  const { weekYear, week } = getIsoWeekAndYear(d);
  return `ILN-${weekYear}-W${String(week).padStart(2, "0")}-${hexSuffixFromId(id, 6)}`;
}

export function getListingNumber(auction: { id: string; listingNumber?: string; endDate: string }): string {
  if (auction.listingNumber?.trim()) return auction.listingNumber.trim();
  return computeListingNumber(auction.id, auction.endDate);
}

/** Haftalik ihale takvimi — urun ozeti (yasal metin degil). */
export const WEEKLY_AUCTION_SLOT_TR =
  "Her Carsamba 18:00 TRT (hedef slot; yonetici takviminde netlestirilir).";

export const WEEKLY_AUCTION_POLICY_TR = [
  "Acik artirma ve kapali teklif kapanislari haftada bir ana oturumda toplanir; ara teklifler ilan bazinda kurallarda.",
  "Yeni ilanlar haftalik oturuma yetisme cut-off tarihi ilan formunda gosterilir (hedef).",
  "Anti-sniping ve teminat: fees.ts referansi tum oturumlarda gecerli.",
].join(" ");

export const LISTING_NUMBER_LEGEND_TR =
  "Her ilanin benzersiz numarasi vardir: ILN-YIL-WHAFTA-6HEX. Kart ve detayda gorunur; musteri hizmeti ve sozlesmede bu numara kullanilir.";
