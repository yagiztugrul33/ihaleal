import { useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { LatLngExpression, Layer } from "leaflet";
import "leaflet/dist/leaflet.css";

type ZoneProps = {
  id: string;
  city: string;
  district: string;
  status: string;
  program: string;
  riskScore: number;
  households: number;
  yearDeclared: number;
};

function FlyTo({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [map, center, zoom]);
  return null;
}

const STATUS_COLOR: Record<string, string> = {
  riskli_alan: "#f87171",
  yenileme: "#fbbf24",
  rezerv: "#38bdf8",
};

export default function KentselDonusumMapInner({
  highlightId,
  flyCenter,
  flyZoom,
}: {
  highlightId?: string | null;
  flyCenter?: LatLngExpression | null;
  flyZoom?: number;
}) {
  const [geo, setGeo] = useState<FeatureCollection<Geometry, ZoneProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/kentsel-donusum-bolgeleri.json")
      .then((r) => r.json())
      .then((data: FeatureCollection<Geometry, ZoneProps>) => {
        if (!cancelled) setGeo(data);
      })
      .catch(() => {
        if (!cancelled) setGeo(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const style = useMemo(
    () => (feature?: { properties?: ZoneProps }) => {
      const id = feature?.properties?.id;
      const status = feature?.properties?.status ?? "yenileme";
      const selected = id && id === highlightId;
      return {
        color: selected ? "#fff" : STATUS_COLOR[status] ?? "#94a3b8",
        weight: selected ? 3 : 1.5,
        fillColor: STATUS_COLOR[status] ?? "#64748b",
        fillOpacity: selected ? 0.45 : 0.28,
      };
    },
    [highlightId],
  );

  const onEach = (feature: Feature<Geometry, ZoneProps>, layer: Layer) => {
    const p = feature.properties;
    if (!p) return;
    layer.bindPopup(
      `<strong>${p.district}</strong> (${p.city})<br/>Program: ${p.program}<br/>Risk skoru: ${p.riskScore}<br/>Hane: ${p.households}`,
    );
  };

  return (
    <div className="mod-map-frame">
      <MapContainer center={[39.1, 35.05]} zoom={6} className="h-full min-h-[22rem] w-full" scrollWheelZoom>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {flyCenter && flyZoom != null ? <FlyTo center={flyCenter} zoom={flyZoom} /> : null}
        {geo ? <GeoJSON data={geo} style={style} onEachFeature={onEach} /> : null}
      </MapContainer>
    </div>
  );
}
