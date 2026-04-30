/** Gayrimenkul / ihale kaydı UUID mi (Supabase satırı)? Demo ilanlar genelde string slug kullanır. */
export const AUCTION_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isAuctionUuid(id: string | undefined): boolean {
  return typeof id === "string" && AUCTION_UUID_RE.test(id);
}
