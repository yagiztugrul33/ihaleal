import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type DistrictRow = { name: string; avgPrice: number; growth: number; type: string };

const CITY_CENTER: Record<string, [number, number]> = {
  Istanbul: [41.015137, 28.97953],
  Ankara: [39.933365, 32.859741],
  Izmir: [38.423734, 27.142826],
  Antalya: [36.896891, 30.713323],
  Bursa: [40.182571, 29.066523],
  Mugla: [37.215377, 28.363573],
};

function priceColor(avg: number, minP: number, maxP: number): string {
  if (maxP <= minP) return "#3b82f6";
  const t = (avg - minP) / (maxP - minP);
  if (t < 0.33) return "#22c55e";
  if (t < 0.66) return "#eab308";
  return "#B42318";
}

function positionsForCity(center: [number, number], districts: DistrictRow[]): [number, number][] {
  const n = districts.length || 1;
  return districts.map((_, i) => {
    const angle = (i / n) * Math.PI * 2;
    const r = 0.045 + (i % 3) * 0.004;
    return [center[0] + Math.cos(angle) * r * 0.85, center[1] + Math.sin(angle) * r * 1.1] as [number, number];
  });
}

function FitBounds({ points }: { points: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    void import("leaflet").then((L) => {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 12 });
    });
  }, [map, points]);
  return null;
}

type Props = {
  cityKey: string;
  districts: DistrictRow[];
  title?: string;
};

export default function CityDistrictHeatmap({ cityKey, districts, title = "İlçe — İhaleal Endeksi haritası (demo konumlar)" }: Props) {
  const center = CITY_CENTER[cityKey];
  const coords = useMemo(() => (center ? positionsForCity(center, districts) : []), [center, districts]);

  const { minP, maxP } = useMemo(() => {
    const prices = districts.map((d) => d.avgPrice);
    return { minP: Math.min(...prices), maxP: Math.max(...prices) };
  }, [districts]);

  const points: LatLngExpression[] = coords.map(([lat, lng]) => [lat, lng]);

  if (!center || districts.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/40 mb-8">
      <div className="px-4 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <span className="text-xs text-slate-500">Renk: düşük→yüksek m² fiyat (demo)</span>
      </div>
      <MapContainer center={center} zoom={11} style={{ height: "380px", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap katkıcıları'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {districts.map((d, i) => {
          const [lat, lng] = coords[i];
          const fill = priceColor(d.avgPrice, minP, maxP);
          return (
            <CircleMarker
              key={d.name}
              center={[lat, lng]}
              radius={14}
              pathOptions={{ color: "#0f172a", fillColor: fill, fillOpacity: 0.72, weight: 2 }}
            >
              <Popup>
                <div className="text-slate-900 text-sm">
                  <div className="font-bold">{d.name}</div>
                  <div className="text-xs text-slate-600">{d.type}</div>
                  <div className="mt-1 font-semibold">₺{d.avgPrice.toLocaleString("tr-TR")} / m²</div>
                  <div className="text-xs text-emerald-700">Yıllık artış %{d.growth}</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
