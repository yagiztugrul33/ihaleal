import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function incrementListingView(listingId: string): Promise<void> {
  if (!isSupabaseConfigured() || !listingId) return;
  await supabase.rpc("increment_listing_view", { p_listing_id: listingId });
}
