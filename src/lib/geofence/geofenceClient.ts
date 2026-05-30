import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type GeofencePrefsRow = {
  enabled: boolean;
  consentAt: string | null;
  radiusMeters: number;
  dealFilter: "all" | "sale" | "rent";
  browserPushEnabled: boolean;
};

const DEFAULT: GeofencePrefsRow = {
  enabled: false,
  consentAt: null,
  radiusMeters: 800,
  dealFilter: "all",
  browserPushEnabled: true,
};

export async function fetchGeofencePrefs(userId: string): Promise<GeofencePrefsRow> {
  if (!isSupabaseConfigured()) return DEFAULT;
  const { data } = await supabase
    .from("user_geofence_preferences")
    .select("enabled, consent_at, radius_meters, deal_filter, browser_push_enabled")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return DEFAULT;
  return {
    enabled: Boolean(data.enabled),
    consentAt: data.consent_at ? String(data.consent_at) : null,
    radiusMeters: Number(data.radius_meters ?? 800),
    dealFilter: (data.deal_filter as GeofencePrefsRow["dealFilter"]) ?? "all",
    browserPushEnabled: Boolean(data.browser_push_enabled ?? true),
  };
}

export async function upsertGeofencePrefs(
  userId: string,
  patch: Partial<GeofencePrefsRow> & { consentAt?: string | null },
): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured()) return { ok: false };
  const current = await fetchGeofencePrefs(userId);
  const next = { ...current, ...patch };
  const { error } = await supabase.from("user_geofence_preferences").upsert({
    user_id: userId,
    enabled: next.enabled,
    consent_at: next.consentAt,
    radius_meters: next.radiusMeters,
    deal_filter: next.dealFilter,
    browser_push_enabled: next.browserPushEnabled,
    updated_at: new Date().toISOString(),
  });
  return { ok: !error };
}

export async function insertGeofenceNotification(input: {
  userId: string;
  listingId: string;
  auctionId: string;
  title: string;
  district: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error: logErr } = await supabase.from("geofence_alert_log").insert({
    user_id: input.userId,
    listing_id: input.listingId,
  });
  if (logErr) {
    if (logErr.code === "23505") return false;
    return false;
  }

  const { error } = await supabase.from("notifications").insert({
    user_id: input.userId,
    type: "geofence_nearby",
    channel: "in_app",
    payload: {
      title: "Yakınınızda ilan",
      body: `${input.district}: ${input.title}`,
      listingId: input.listingId,
      auctionId: input.auctionId,
    },
    state: "pending",
  });
  return !error;
}
