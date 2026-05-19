import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { PropertyRecord } from "@/types/property";

export default function IlanlarMapInner({ properties }: { properties: PropertyRecord[] }) {
  const center = useMemo((): [number, number] => {
    const first = properties.find((p) => p.latitude != null);
    return [first?.latitude ?? 39.0, first?.longitude ?? 35.0];
  }, [properties]);

  return (
    <MapContainer className="ilan-katalog__map" center={center} zoom={6} scrollWheelZoom>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OSM" />
      {properties.map((p) => {
        if (p.latitude == null || p.longitude == null) return null;
        return (
          <CircleMarker
            key={p.id}
            center={[p.latitude, p.longitude]}
            radius={6}
            pathOptions={{ color: "#0f172a", fillColor: "#38bdf8", fillOpacity: 0.85 }}
          >
            <Popup>
              <strong>{p.title}</strong>
              <br />
              <Link to={`/ilanlar/${p.id}`}>Detay</Link>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
