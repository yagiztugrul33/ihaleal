import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export type AssemblyPoint = {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  capacity: number;
  areaSqm: number;
  water: boolean;
  toilet: boolean;
};

function FlyTo({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.75 });
  }, [map, center, zoom]);
  return null;
}

export default function AfetToplanmaMapInner({
  points,
  userPoint,
  routeLine,
  selectedId,
  flyCenter,
  flyZoom,
}: {
  points: AssemblyPoint[];
  userPoint: LatLngExpression | null;
  routeLine: LatLngExpression[] | null;
  selectedId?: string | null;
  flyCenter?: LatLngExpression | null;
  flyZoom?: number;
}) {
  const center = useMemo<LatLngExpression>(() => flyCenter ?? [39.1, 35.05], [flyCenter]);

  return (
    <div className="mod-map-frame mod-map-frame--fullscreen">
      <MapContainer center={center} zoom={flyZoom ?? 6} className="h-full min-h-[min(72vh,42rem)] w-full" scrollWheelZoom>
        <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {flyCenter && flyZoom != null ? <FlyTo center={flyCenter} zoom={flyZoom} /> : null}
        {routeLine && routeLine.length >= 2 ? (
          <Polyline positions={routeLine} pathOptions={{ color: "#38bdf8", weight: 4, dashArray: "8 6" }} />
        ) : null}
        {userPoint ? (
          <CircleMarker center={userPoint} radius={9} pathOptions={{ color: "#fff", fillColor: "#f97316", fillOpacity: 0.9, weight: 2 }}>
            <Popup>Konumunuz (adres araması)</Popup>
          </CircleMarker>
        ) : null}
        {points.map((p) => {
          const selected = p.id === selectedId;
          return (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={selected ? 10 : 6}
              pathOptions={{
                color: selected ? "#fff" : "#22d3ee",
                fillColor: selected ? "#0ea5e9" : "#0891b2",
                fillOpacity: 0.85,
                weight: selected ? 2.5 : 1.5,
              }}
            >
              <Popup>
                <strong>{p.name}</strong>
                <br />
                Kapasite: {p.capacity} kişi
                <br />
                Alan: {p.areaSqm} m²
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
