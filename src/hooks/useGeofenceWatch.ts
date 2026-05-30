import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import { findNearbyListings, type GeofenceListing } from "@/lib/geofence/geofenceEngine";
import { fetchGeofencePrefs, insertGeofenceNotification } from "@/lib/geofence/geofenceClient";
import type { Auction } from "@/types/auction";

function toGeofenceListing(a: Auction): GeofenceListing | null {
  if (!Number.isFinite(a.mapLat) || !Number.isFinite(a.mapLng)) return null;
  const dealType = a.dealType ?? (a.category === "Kiralık" ? "rent" : "sale");
  return {
    id: a.id,
    auctionId: a.id,
    title: a.title,
    lat: a.mapLat,
    lng: a.mapLng,
    dealType,
    city: a.city,
    district: a.district,
  };
}

function showBrowserNotification(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/icon-192.png" });
  } catch {
    /* ignore */
  }
}

export function useGeofenceWatch() {
  const { user } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const catalogRef = useRef<GeofenceListing[]>([]);
  const busyRef = useRef(false);

  const loadCatalog = useCallback(async () => {
    const rows = await loadAllAuctionsForSearch();
    catalogRef.current = rows.map(toGeofenceListing).filter((x): x is GeofenceListing => x != null);
  }, []);

  const onPosition = useCallback(
    async (pos: GeolocationPosition) => {
      if (!user?.id || busyRef.current) return;
      busyRef.current = true;
      try {
        const prefs = await fetchGeofencePrefs(user.id);
        if (!prefs.enabled || !prefs.consentAt) return;

        const nearby = findNearbyListings(pos.coords.latitude, pos.coords.longitude, catalogRef.current, {
          radiusMeters: prefs.radiusMeters,
          dealFilter: prefs.dealFilter,
        });

        for (const item of nearby.slice(0, 3)) {
          const inserted = await insertGeofenceNotification({
            userId: user.id,
            listingId: item.id,
            auctionId: item.auctionId,
            title: item.title,
            district: item.district,
          });
          if (inserted) {
            window.dispatchEvent(
              new CustomEvent("ihaleal:add-toast", {
                detail: { message: `Yakınınızda: ${item.title}`, type: "info" },
              }),
            );
            if (prefs.browserPushEnabled) {
              showBrowserNotification("Yakınınızda ilan", `${item.district}: ${item.title}`);
            }
          }
        }
      } finally {
        busyRef.current = false;
      }
    },
    [user?.id],
  );

  useEffect(() => {
    if (!user?.id || typeof navigator === "undefined" || !navigator.geolocation) return;

    let cancelled = false;
    void (async () => {
      const prefs = await fetchGeofencePrefs(user.id);
      if (cancelled || !prefs.enabled || !prefs.consentAt) return;
      await loadCatalog();
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => void onPosition(pos),
        () => {},
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 20_000 },
      );
    })();

    return () => {
      cancelled = true;
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [user?.id, loadCatalog, onPosition]);
}
