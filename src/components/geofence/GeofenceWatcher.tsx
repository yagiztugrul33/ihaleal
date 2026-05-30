import { useGeofenceWatch } from "@/hooks/useGeofenceWatch";

/** Aktif geofence izleme — Layout altında sessiz çalışır. */
export function GeofenceWatcher() {
  useGeofenceWatch();
  return null;
}
