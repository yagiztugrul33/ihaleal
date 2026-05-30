import { useNearbyPOI } from "@/hooks/useNearbyPOI";
import { LoadingState } from "@/components/async/LoadingState";
import { MapPin } from "lucide-react";

type Props = {
  lat: number;
  lng: number;
};

export function ListingNearbyPoiSection({ lat, lng }: Props) {
  const transport = useNearbyPOI(lat, lng, "ulasim", 1200);
  const education = useNearbyPOI(lat, lng, "egitim", 1200);
  const health = useNearbyPOI(lat, lng, "saglik", 1200);
  const shop = useNearbyPOI(lat, lng, "ticaret", 1200);

  const groups = [
    { label: "Ulaşım", state: transport },
    { label: "Eğitim", state: education },
    { label: "Sağlık", state: health },
    { label: "Alışveriş", state: shop },
  ];

  const anyLoading = groups.some((g) => g.state.loading);
  const anyPoi = groups.some((g) => g.state.pois.length > 0);

  if (!anyLoading && !anyPoi) return null;

  return (
    <div className="mt-6">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Yakın POI (canlı)</h4>
      {anyLoading ? <LoadingState compact label="POI yükleniyor…" /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map(({ label, state }) =>
          state.pois.length > 0 ? (
            <div key={label} className="rounded-xl border border-slate-200/80 bg-white/[0.02] p-3">
              <p className="mb-2 text-xs font-semibold text-slate-400">{label}</p>
              <ul className="space-y-2">
                {state.pois.slice(0, 4).map((p) => (
                  <li key={p.id} className="flex items-start gap-2 text-sm text-slate-300">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
                    <span>
                      {p.name}
                      <span className="ml-1 text-xs text-slate-500">({Math.round(p.distanceM)} m)</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
