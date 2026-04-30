import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { DEMO_AUCTION_CATALOG } from "@/data/demoAuctionCatalog";
import "leaflet/dist/leaflet.css";

/** Analytics CITY_DATA anahtarları (İngilizce) → demo katalog şehir adları */
const CITY_SLUG_TO_TR: Record<string, string> = {
  Istanbul: "İstanbul",
  Ankara: "Ankara",
  Izmir: "İzmir",
  Antalya: "Antalya",
  Bursa: "Bursa",
  Mugla: "Muğla",
};

function jitter(id: string, axis: 0 | 1): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 997;
  const k = axis === 0 ? h % 11 : (h * 7) % 11;
  return (k - 5) * 0.0018;
}

type Props = {
  analyticsCitySlug: string;
  maxPins?: number;
};

export default function SimilarListingsMap({ analyticsCitySlug, maxPins = 18 }: Props) {
  const cityTr = CITY_SLUG_TO_TR[analyticsCitySlug] ?? analyticsCitySlug;

  const rows = useMemo(
    () => DEMO_AUCTION_CATALOG.filter((a) => a.city === cityTr).slice(0, maxPins),
    [cityTr, maxPins]
  );

  const center: [number, number] =
    rows[0] ? [rows[0].mapLat, rows[0].mapLng] : [39.1, 35.2];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-950/40 p-6 text-sm text-slate-400">
        Bu şehir için demo katalogda kayıt yok; analiz filtresinde başka şehir seçin.
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10">
      <MapContainer center={center} zoom={11} style={{ height: "320px", width: "100%" }} scrollWheelZoom>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OSM" />
        {rows.map((a) => (
          <CircleMarker
            key={a.id}
            center={[a.mapLat + jitter(a.id, 0), a.mapLng + jitter(a.id, 1)]}
            radius={9}
            pathOptions={{ color: "#1e293b", fillColor: "#38bdf8", fillOpacity: 0.65, weight: 2 }}
          >
            <Popup>
              <div className="text-slate-900 text-xs max-w-[220px]">
                <div className="font-semibold line-clamp-2">{a.title}</div>
                <div className="text-slate-600 mt-1">{a.district}</div>
                <div className="font-bold text-blue-700 mt-1">₺{a.currentBid.toLocaleString("tr-TR")}</div>
                <Link className="text-teal-600 underline mt-1 inline-block" to={`/ilan/${a.id}`}>
                  Detay
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <p className="text-xs text-slate-500 px-3 py-2 bg-slate-950/40 border-t border-white/5">
        AI benzer ilan gösterimi (demo): seçilen şehre göre katalogdan örnek konumlar; pinler çakışmayı azaltmak için hafif kaydırmalıdır.
      </p>
    </div>
  );
}
