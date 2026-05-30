import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const SESSION_PREFIX = "ihaleal_view_";

export function viewCountSessionKey(listingId: string): string {
  return `${SESSION_PREFIX}${listingId}`;
}

export function hasRecordedViewInSession(listingId: string): boolean {
  if (typeof sessionStorage === "undefined" || !listingId) return false;
  try {
    return sessionStorage.getItem(viewCountSessionKey(listingId)) === "1";
  } catch {
    return false;
  }
}

export function markViewRecordedInSession(listingId: string): void {
  if (typeof sessionStorage === "undefined" || !listingId) return;
  try {
    sessionStorage.setItem(viewCountSessionKey(listingId), "1");
  } catch {
    /* quota / private mode */
  }
}

export async function incrementListingView(listingId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !listingId) return false;
  if (hasRecordedViewInSession(listingId)) return false;

  const { error } = await supabase.rpc("increment_listing_view", { p_listing_id: listingId });
  if (error) return false;

  markViewRecordedInSession(listingId);
  return true;
}
