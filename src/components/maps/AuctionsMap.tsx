import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { Link } from "react-router-dom";
import type { Auction } from "@/types/auction";
import "leaflet/dist/leaflet.css";

function FitBounds({ points }: { points: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    void import("leaflet").then((L) => {
      const b = L.latLngBounds(points);
      map.fitBounds(b, { padding: [48, 48], maxZoom: 11 });
    });
  }, [map, points]);
  return null;
}

type Props = {
  auctions: Auction[];
  className?: string;
};

export default function AuctionsMap({ auctions, className = "" }: Props) {
  const points: LatLngExpression[] = auctions.map((a) => [a.mapLat, a.mapLng]);

  const center: LatLngExpression =
    points.length > 0 ? points[Math.floor(points.length / 2)] : [39.0, 35.0];

  return (
    <div className={`rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40 ${className}`}>
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: "min(70vh, 560px)", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.length > 0 ? <FitBounds points={points} /> : null}
        {auctions.map((a) => (
          <CircleMarker
            key={a.id}
            center={[a.mapLat, a.mapLng]}
            radius={10}
            pathOptions={{
              color: a.status === "live" ? "#ef4444" : a.status === "upcoming" ? "#38bdf8" : "#64748b",
              fillColor: "#3b82f6",
              fillOpacity: 0.55,
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-[200px] text-slate-900">
                <div className="font-semibold text-sm mb-1 line-clamp-2">{a.title}</div>
                <div className="text-xs text-slate-600 mb-2">{a.location}</div>
                <div className="text-sm font-bold text-blue-700">
                  ₺{a.currentBid.toLocaleString("tr-TR")}
                </div>
                <Link to={`/ilan/${a.id}`} className="text-xs text-teal-600 font-medium mt-2 inline-block underline">
                  İlan detayı
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
