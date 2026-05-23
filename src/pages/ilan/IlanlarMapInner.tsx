import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { PropertyRecord } from "@/types/property";
import { getPropertyPrice } from "@/types/property";

export default function IlanlarMapInner({ properties }: { properties: PropertyRecord[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const center = useMemo((): [number, number] => {
    const first = properties.find((p) => p.latitude != null);
    return [first?.latitude ?? 39.0, first?.longitude ?? 35.0];
  }, [properties]);

  const selected = useMemo(
    () => properties.find((p) => p.id === selectedId) ?? null,
    [properties, selectedId],
  );

  const points = useMemo(
    () =>
      properties.filter(
        (p): p is PropertyRecord & { latitude: number; longitude: number } =>
          p.latitude != null && p.longitude != null,
      ),
    [properties],
  );

  const formatShortTry = (price: number | undefined) => {
    if (!price || price <= 0) return "Fiyat yok";
    return `₺${(price / 1_000_000).toFixed(1)}M`;
  };

  return (
    <div className="ilan-katalog__map-wrap">
      <MapContainer className="ilan-katalog__map" center={center} zoom={6} scrollWheelZoom>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OSM" />
        {points.map((p) => {
          const price = getPropertyPrice(p);
          const isSelected = p.id === selectedId;
          const markerIcon = L.divIcon({
            className: "ilan-katalog__price-pin-wrap",
            html: `<button class="ilan-katalog__price-pin ${isSelected ? "is-selected" : ""}" type="button">${formatShortTry(price)}</button>`,
            iconSize: [84, 30],
            iconAnchor: [42, 24],
          });
          return (
            <Marker
              key={p.id}
              position={[p.latitude, p.longitude]}
              icon={markerIcon}
              eventHandlers={{ click: () => setSelectedId(p.id) }}
            />
          );
        })}
      </MapContainer>
      <div className="ilan-katalog__map-preview">
        {selected ? (
          <article className="ilan-katalog__map-preview-card">
            <p className="ilan-katalog__map-preview-id">{selected.id.toUpperCase()}</p>
            <h3>{selected.title}</h3>
            <p>{selected.district}, {selected.city}</p>
            <div className="ilan-katalog__map-preview-row">
              <span>{formatShortTry(getPropertyPrice(selected))}</span>
              <Link to={`/ilan/${selected.id}`}>Önizlemeyi aç</Link>
            </div>
          </article>
        ) : (
          <p className="ilan-katalog__map-preview-empty">Pin seçin: ilan kartı önizlemesi burada açılır.</p>
        )}
      </div>
    </div>
  );
}
