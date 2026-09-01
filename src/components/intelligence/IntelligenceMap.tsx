import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export type IntelligenceMapLayer = {
  id: string;
  lat: number;
  lon: number;
  label: string;
  score?: number;
  kind: "parcel" | "risk" | "ges" | "opportunity";
};

type Props = {
  center: LatLngExpression;
  zoom?: number;
  layers: IntelligenceMapLayer[];
  activeLayerId?: string;
  className?: string;
};

const KIND_COLOR: Record<IntelligenceMapLayer["kind"], string> = {
  parcel: "#22d3ee",
  risk: "#f87171",
  ges: "#fbbf24",
  opportunity: "#34d399",
};

function FlyTo({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [map, center, zoom]);
  return null;
}

function IntelligenceMapInner({
  center,
  zoom = 11,
  layers,
  activeLayerId,
  className = "",
}: Props) {
  return (
    <div className={`rounded-[20px] overflow-hidden border border-white/10 bg-slate-950 ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", minHeight: 320, width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo center={center} zoom={zoom} />
        {layers.map((l) => (
          <CircleMarker
            key={l.id}
            center={[l.lat, l.lon]}
            radius={l.id === activeLayerId ? 14 : 10}
            pathOptions={{
              color: KIND_COLOR[l.kind],
              fillColor: KIND_COLOR[l.kind],
              fillOpacity: l.id === activeLayerId ? 0.85 : 0.5,
              weight: l.id === activeLayerId ? 3 : 2,
            }}
          >
            <Popup>
              <div className="text-slate-900 text-sm min-w-[160px]">
                <p className="font-normal">{l.label}</p>
                {l.score != null ? <p className="text-xs mt-1">Skor: {l.score}/100</p> : null}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export const IntelligenceMap = IntelligenceMapInner;
export default IntelligenceMapInner;
