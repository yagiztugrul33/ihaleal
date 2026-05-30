import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type NotificationPreferences = {
  offerEnabled: boolean;
  searchMatchEnabled: boolean;
  messageEnabled: boolean;
  favoriteEnabled: boolean;
  kycEnabled: boolean;
  auctionEnabled: boolean;
};

const DEFAULT_PREFS: NotificationPreferences = {
  offerEnabled: true,
  searchMatchEnabled: true,
  messageEnabled: true,
  favoriteEnabled: true,
  kycEnabled: true,
  auctionEnabled: true,
};

function mapRow(row: Record<string, unknown>): NotificationPreferences {
  return {
    offerEnabled: Boolean(row.offer_enabled ?? true),
    searchMatchEnabled: Boolean(row.search_match_enabled ?? true),
    messageEnabled: Boolean(row.message_enabled ?? true),
    favoriteEnabled: Boolean(row.favorite_enabled ?? true),
    kycEnabled: Boolean(row.kyc_enabled ?? true),
    auctionEnabled: Boolean(row.auction_enabled ?? true),
  };
}

export async function fetchNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  if (!isSupabaseConfigured()) return DEFAULT_PREFS;
  const { data } = await supabase
    .from("notification_preferences")
    .select("offer_enabled, search_match_enabled, message_enabled, favorite_enabled, kyc_enabled, auction_enabled")
    .eq("user_id", userId)
    .maybeSingle();
  return data ? mapRow(data as Record<string, unknown>) : DEFAULT_PREFS;
}

export async function upsertNotificationPreferences(
  userId: string,
  prefs: Partial<NotificationPreferences>,
): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured()) return { ok: false };
  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: userId,
    offer_enabled: prefs.offerEnabled,
    search_match_enabled: prefs.searchMatchEnabled,
    message_enabled: prefs.messageEnabled,
    favorite_enabled: prefs.favoriteEnabled,
    kyc_enabled: prefs.kycEnabled,
    auction_enabled: prefs.auctionEnabled,
    updated_at: new Date().toISOString(),
  });
  return { ok: !error };
}
