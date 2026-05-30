import { useEffect, useRef, useState } from "react";
import { MapContainer, Polygon, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: LatLngExpression = [39.0, 35.0];
const DEFAULT_ZOOM = 6;

function ClickCapture({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPolygonSearchInner({
  onComplete,
}: {
  onComplete: (coords: [number, number][]) => void;
}) {
  const [points, setPoints] = useState<[number, number][]>([]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const addPoint = (lat: number, lng: number) => {
    if (!mounted.current) return;
    setPoints((prev) => [...prev, [lat, lng]]);
  };

  return (
    <div>
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="h-64 w-full rounded-lg">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCapture onClick={addPoint} />
        {points.length >= 3 ? (
          <Polygon
            positions={points.map(([lat, lng]) => [lat, lng] as LatLngExpression)}
            pathOptions={{ color: "#3b82f6", fillOpacity: 0.2 }}
          />
        ) : null}
      </MapContainer>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-slate-500">{points.length} nokta</span>
        <Button type="button" size="sm" variant="outline" disabled={points.length < 3} onClick={() => onComplete(points)}>
          Alanı uygula
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setPoints([])}>
          Sıfırla
        </Button>
      </div>
    </div>
  );
}
