import { lazy, Suspense } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { Auction } from "@/types/auction";
import { resolveListingCoords } from "@/lib/geo/cityCenters";
import { LoadingState } from "@/components/async/LoadingState";
import "leaflet/dist/leaflet.css";

type DetailMapProps = {
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  className?: string;
};

export function ListingDetailMap({ lat, lng, title, subtitle, className = "" }: DetailMapProps) {
  const center: LatLngExpression = [lat, lng];
  return (
    <div className={`rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 ${className}`}>
      <MapContainer center={center} zoom={14} style={{ height: "16rem", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={center}
          radius={12}
          pathOptions={{ color: "#3b82f6", fillColor: "#60a5fa", fillOpacity: 0.7, weight: 2 }}
        >
          <Popup>
            <div className="min-w-[160px] text-slate-900">
              <div className="font-semibold text-sm">{title}</div>
              {subtitle ? <div className="text-xs text-slate-600 mt-1">{subtitle}</div> : null}
            </div>
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}

const AuctionsMapLazy = lazy(() => import("@/components/maps/AuctionsMap"));

type ListMapProps = {
  auctions: Auction[];
  className?: string;
};

export function AuctionsMapPanel({ auctions, className }: ListMapProps) {
  const withCoords = auctions.map((a) => {
    const { lat, lng } = resolveListingCoords(a.mapLat, a.mapLng, a.city);
    return { ...a, mapLat: lat, mapLng: lng };
  });

  return (
    <Suspense fallback={<LoadingState compact label="Harita yükleniyor…" className="min-h-[320px]" />}>
      <AuctionsMapLazy auctions={withCoords} className={className} />
    </Suspense>
  );
}

export { resolveListingCoords };
