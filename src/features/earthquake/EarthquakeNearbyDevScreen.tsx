import { useState } from "react";
import { AfadEarthquakeFeedGateway } from "./afadFeedGateway";
import { createEarthquakeMonitorService } from "./earthquakeMonitorService";
import { MockPropertyLocationProvider } from "./mockPropertyRepository";
import type { EarthquakeMonitorSnapshot } from "./types";

/**
 * Standalone dev screen for Faz-1 skeleton.
 * No navigation/push integration; can be wired in Faz-2.
 */
export default function EarthquakeNearbyDevScreen() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<EarthquakeMonitorSnapshot | null>(null);

  const monitor = createEarthquakeMonitorService({
    feedGateway: new AfadEarthquakeFeedGateway(),
    propertyProvider: new MockPropertyLocationProvider(),
    thresholdKm: 50,
  });

  const runCheck = async () => {
    setBusy(true);
    setError(null);
    try {
      const next = await monitor.checkOnce();
      setSnapshot(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deprem feed kontrolu basarisiz.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100">
      <section className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">Earthquake Nearby Skeleton</p>
        <h1 className="mt-1 text-2xl font-black">Yakininda deprem oldu (dev)</h1>
        <p className="mt-2 text-sm text-slate-300">
          Bu ekran erken uyari sistemi degildir. Kamu deprem feed'i poll edilip tasinmazlara mesafe filtresi uygulanir.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => void runCheck()}
            className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
            disabled={busy}
          >
            {busy ? "Kontrol ediliyor..." : "Feed kontrol et"}
          </button>
        </div>

        {error ? (
          <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
        ) : null}

        {snapshot ? (
          <div className="mt-5 space-y-3">
            <p className="text-xs text-slate-400">
              Son kontrol: {snapshot.checkedAtIso} · Feed olay: {snapshot.recentEvents.length} · Esik: {snapshot.thresholdKm} km
            </p>
            {snapshot.nearbyHits.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-300">
                Esik icinde deprem bulunmadi.
              </p>
            ) : (
              <ul className="space-y-2">
                {snapshot.nearbyHits.map((hit) => (
                  <li key={`${hit.event.id}:${hit.property.id}`} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm">
                    <p className="font-semibold text-slate-100">
                      {hit.property.title} · {hit.distanceKm} km
                    </p>
                    <p className="text-slate-300">
                      M{hit.event.magnitude.toFixed(1)} · {hit.event.locationName} · {new Date(hit.event.occurredAtIso).toLocaleString("tr-TR")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}

