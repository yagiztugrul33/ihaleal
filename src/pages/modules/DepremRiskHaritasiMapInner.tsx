import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  MapPin,
  Navigation,
  Search,
  Siren,
  Hospital,
  Home,
  Mountain,
  Waves,
  ExternalLink,
} from "lucide-react";
import { MapContainer, TileLayer, Polyline, Polygon, CircleMarker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { ModuleTag } from "./ModuleShell";

type LayersState = Record<"fault" | "earthquakes" | "soil" | "listings" | "assembly" | "hospitals", boolean>;

type EqEvent = { id: string; lat: number; lng: number; magnitude: number; place: string; time: string };

const CENTER_DEF: LatLngExpression = [39.1, 35.05];
const ZOOM_DEF = 6;

const MOCK_FAULTS: [number, number][][] = [
  [
    [41.08, 28.94],
    [40.92, 30.82],
    [40.2, 32.58],
    [39.1, 35.92],
    [38.0, 38.82],
    [37.2, 40.92],
    [36.92, 36.54],
    [36.2, 35.94],
    [35.4, 35.94],
    [36.92, 32.94],
    [38.4, 30.94],
    [40.2, 29.94],
    [41.08, 28.94],
  ],
  [
    [38.94, 27.92],
    [38.3, 28.94],
    [37.5, 30.94],
    [37.0, 31.94],
    [36.4, 32.94],
    [36.94, 27.94],
    [37.94, 26.92],
    [38.84, 27.94],
    [38.94, 27.92],
  ],
];

const MOCK_SOIL: { id: string; ring: [number, number][]; label: string; zoneClass: string }[] = [
  {
    id: "z-soft-ist",
    label: "Dolgu ve zayıf sıkışmış zemin özeti",
    zoneClass: "Z3 göstergesi benzeri",
    ring: [
      [41.12, 28.94],
      [41.12, 29.42],
      [40.92, 29.62],
      [40.74, 29.06],
      [40.86, 28.62],
      [41.12, 28.94],
    ],
  },
  {
    id: "z-marmara",
    label: "Çöküntü alüvyon hakimi",
    zoneClass: "Z2 göstergesi benzeri",
    ring: [
      [40.98, 27.94],
      [40.94, 28.58],
      [40.5, 28.58],
      [40.54, 27.94],
      [40.98, 27.94],
    ],
  },
  {
    id: "z-izmir-korfez",
    label: "Körfez yumuşak zemin bağlamı",
    zoneClass: "Z3 göstergesi benzeri",
    ring: [
      [38.48, 27.06],
      [38.52, 27.62],
      [38.2, 27.74],
      [38.06, 27.42],
      [38.48, 27.06],
    ],
  },
];

const ADDRESS_PRESETS: { q: string; label: string; target: LatLngExpression; zoom: number }[] = [
  { q: "kadikoy", label: "İstanbul — Kadıköy Moda sahili", target: [40.986, 29.026], zoom: 12 },
  { q: "kartal pendik", label: "İstanbul — Kartal / Pendik bağlantısı", target: [40.894, 29.216], zoom: 12 },
  { q: "izmir bayraklı", label: "İzmir — Bayraklı", target: [38.466, 27.174], zoom: 12 },
  { q: "ankara cayyolu", label: "Ankara — Çayyolu", target: [39.888, 32.684], zoom: 12 },
  { q: "bursa nilufer", label: "Bursa — Nilüfer", target: [40.198, 28.974], zoom: 12 },
  { q: "van edremit", label: "Van — Edremit", target: [38.446, 43.294], zoom: 11 },
];

const MOCK_LISTINGS: { id: string; lat: number; lng: number; title: string; riskTag: number }[] = [
  { id: "il-1", lat: 40.986, lng: 29.02, title: "Sahilyolu dubleks rezidans", riskTag: 82 },
  { id: "il-2", lat: 37.068, lng: 27.218, title: "Bodrum bağ evi tasarımlı yazlık", riskTag: 74 },
  { id: "il-3", lat: 38.432, lng: 27.144, title: "Körfez manzaralı karma kullanım", riskTag: 78 },
  { id: "il-4", lat: 36.892, lng: 30.712, title: "Lara hattında yüksek katlı blok", riskTag: 71 },
  { id: "il-5", lat: 39.942, lng: 32.842, title: "Etimesgut sıra konut kümesi", riskTag: 69 },
];

const MOCK_ASSEMBLY = [
  { id: "a1", lat: 40.97, lng: 28.94, name: "Bahçelievler güvenlik toplanma ekseni göstergesi" },
  { id: "a2", lat: 38.44, lng: 27.18, name: "Konak sahil parkı sığınır alanı — demo bağlantılı" },
  { id: "a3", lat: 36.892, lng: 30.712, name: "Antalya sığınır parkı yaya bağlantılı geçiş" },
  { id: "a4", lat: 37.068, lng: 37.384, name: "Gaziantep kent sığınır yayılım düğümü" },
  { id: "a5", lat: 41.052, lng: 28.974, name: "Kâğıthane sığınır parkı örnek nokta" },
];

const MOCK_HOSPITALS = [
  { id: "h1", lat: 41.006, lng: 28.974, name: "Eğitim Araştırma — demo bağlı erişim" },
  { id: "h2", lat: 41.058, lng: 29.012, name: "Bölgesel yoğun bakım tesisi örnek bağlantılı" },
  { id: "h3", lat: 38.464, lng: 27.196, name: "Körfez erişimi acil tesisi göstergesi" },
];

function FitOnce({ nonce }: { nonce?: number }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timeout = window.setTimeout(() => map.invalidateSize(), 380);
    return () => window.clearTimeout(timeout);
  }, [map, nonce]);
  return null;
}

function FlyToChoice({ dest, zoom }: { dest: LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(dest, zoom, { animate: true, duration: 1.05 });
  }, [map, dest, zoom]);
  return null;
}

export default function DepremRiskHaritasiMapInner() {
  const [layersState, setLayersState] = useState<LayersState>({
    fault: true,
    earthquakes: true,
    soil: true,
    listings: true,
    assembly: true,
    hospitals: true,
  });

  const [search, setSearch] = useState("");
  const [fly, setFly] = useState<{ dest: LatLngExpression; zoom: number }>({ dest: CENTER_DEF, zoom: ZOOM_DEF });
  const [nonce, setNonce] = useState(0);
  const [events, setEvents] = useState<EqEvent[]>([]);

  useEffect(() => {
    let cancel = false;
    void fetch("/data/kandilli-feed-mock.json")
      .then((r) => r.json())
      .then(
        (data: {
          events?: { id: string; lat: number; lng: number; magnitude: number; place: string; time: string }[];
        }) => {
          if (cancel || !data.events) return;
          const mapped = data.events.map((e) => ({
            id: e.id,
            lat: e.lat,
            lng: e.lng,
            magnitude: e.magnitude,
            place: e.place,
            time: e.time,
          }));
          setEvents(mapped.slice(0, 48));
        },
      )
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);

  const resolvedSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const goSearch = () => {
    const hit = ADDRESS_PRESETS.find((p) => resolvedSearch.includes(p.q));
    if (hit) {
      setFly({ dest: hit.target, zoom: hit.zoom });
      setNonce((v) => v + 1);
      return;
    }
    window.dispatchEvent(
      new CustomEvent("ihaleal:add-toast", {
        detail: {
          message: "Demo adres sözlüğünde eşleşme yok. Kadıköy, Bayraklı veya Çayyolu deneyebilirsiniz.",
          type: "warning",
        },
      }),
    );
    setFly({ dest: CENTER_DEF, zoom: ZOOM_DEF });
  };

  const toggle = (key: keyof LayersState) => {
    setLayersState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sizeClass = "min-h-[min(78vh,880px)] w-full";

  return (
    <div
      className={`deprem-risk-map-shell relative overflow-hidden rounded-[20px] border border-white/10 bg-slate-950 ${sizeClass}`}
    >
      <MapContainer center={CENTER_DEF} zoom={ZOOM_DEF} className={`z-0 h-full ${sizeClass}`} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitOnce nonce={nonce} />
        <FlyToChoice dest={fly.dest} zoom={fly.zoom} />

        {layersState.fault
          ? MOCK_FAULTS.map((line, idx) => (
              <Polyline key={`f-${idx}`} positions={line} pathOptions={{ color: "#fda4af", weight: 2, opacity: 0.88 }} />
            ))
          : null}

        {layersState.soil
          ? MOCK_SOIL.map((z) => (
              <Polygon
                key={z.id}
                positions={z.ring}
                pathOptions={{
                  fillColor: "#fcd34d",
                  fillOpacity: 0.08,
                  color: "#fcd34d",
                  weight: 1.15,
                }}
              >
                <Popup className="!text-sm">
                  <strong>{z.label}</strong>
                  <br />
                  Gösterge zonlaması özeti: <em>{z.zoneClass}</em>
                </Popup>
              </Polygon>
            ))
          : null}

        {layersState.earthquakes
          ? events.map((eq) => {
              const radius = Math.max(4.5, (eq.magnitude - 2) * 4);
              return (
                <CircleMarker
                  key={eq.id}
                  center={[eq.lat, eq.lng]}
                  radius={radius}
                  pathOptions={{ fillColor: "#f97316", color: "#fde68a", weight: 1, fillOpacity: 0.8 }}
                >
                  <Popup className="!text-xs">
                    <strong>M{eq.magnitude.toFixed(1)}</strong>
                    {" · "}
                    {eq.place}
                    <br />
                    Büyütme amaçlı boyut seçimi yapılmıştır; derinlık parametresi özette yer alır.
                  </Popup>
                </CircleMarker>
              );
            })
          : null}

        {layersState.listings
          ? MOCK_LISTINGS.map((l) => (
              <CircleMarker
                key={l.id}
                center={[l.lat, l.lng]}
                radius={7}
                pathOptions={{ fillColor: "#22d3ee", color: "#0f172a", weight: 1.22, fillOpacity: 0.85 }}
              >
                <Popup className="!text-xs">
                  <strong>{l.title}</strong>
                  <br />
                  İhaleal deprem skoru çıktısı: <em>{l.riskTag}</em>/100 (senaryolu özet bağlamıdır).
                  <Link
                    className="mt-2 block font-normal text-[var(--metin-ikincil)] underline"
                    to={`/ilanlar?depremMin=${Math.max(68, Math.floor(l.riskTag - 4))}`}
                  >
                    Uygun ilanları listele →
                  </Link>
                </Popup>
              </CircleMarker>
            ))
          : null}

        {layersState.assembly
          ? MOCK_ASSEMBLY.map((a) => (
              <CircleMarker
                key={a.id}
                center={[a.lat, a.lng]}
                radius={8}
                pathOptions={{ fillColor: "#34d399", color: "#064e3b", weight: 1.32, fillOpacity: 0.87 }}
              >
                <Popup className="!text-xs">
                  <strong>Toplanma</strong>
                  <br />
                  {a.name}
                </Popup>
              </CircleMarker>
            ))
          : null}

        {layersState.hospitals
          ? MOCK_HOSPITALS.map((h) => (
              <CircleMarker
                key={h.id}
                center={[h.lat, h.lng]}
                radius={7}
                pathOptions={{ fillColor: "#a78bfa", color: "#312e81", weight: 1.28, fillOpacity: 0.89 }}
              >
                <Popup className="!text-xs">
                  <strong>Acil tesis sıralaması bağlamı</strong>
                  <br />
                  {h.name}
                  <small className="mt-2 block opacity-85">
                    Resmi bildirilmiş rotaları izleyerek ambulans ve yaya sığışını birlikte düşünün.
                  </small>
                </Popup>
              </CircleMarker>
            ))
          : null}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[500] flex flex-col justify-between p-3 sm:p-4">
        <div className="pointer-events-auto flex flex-col gap-3 sm:max-w-sm">
          <div className="rounded-[20px] border border-white/15 bg-slate-950/82 p-4 backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2 text-sm font-normal text-white">
              <Search className="h-4 w-4 text-[var(--metin-ikincil)]" aria-hidden />
              Demo adres arama kümesi
            </div>
            <label className="sr-only" htmlFor="adr-search-input">
              Konum ara
            </label>
            <div className="flex gap-2">
              <input
                id="adr-search-input"
                type="text"
                className="min-w-0 flex-1 rounded-[10px] border border-white/15 bg-black/38 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Örn: Kadıköy Moda..."
                onKeyDown={(ev) => {
                  if (ev.key === "Enter") goSearch();
                }}
              />
              <button type="button" className="mod-btn-primary shrink-0 px-3 text-xs" onClick={goSearch}>
                <Navigation className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <p className="mt-3 text-[0.72rem] leading-relaxed text-slate-400">
              Küme sözcükleri kadar özgün tanıma destekliyoruz fakat doğrudan Nominatim çağrısı yapılmamaktadır; üretilen
              uç bağlantıların her biri güvenilir teyit gerektiren senaryoda tutulmuş olup güvenilir resmi bildirimin
              altını çizer.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ADDRESS_PRESETS.slice(0, 4).map((p) => (
                <button
                  key={p.q}
                  type="button"
                  className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[0.68rem] text-[var(--metin-ikincil)] hover:bg-white/10"
                  onClick={() => {
                    setSearch(p.label);
                    setFly({ dest: p.target, zoom: p.zoom });
                    setNonce((v) => v + 1);
                  }}
                >
                  {p.label.split(" — ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-white/15 bg-slate-950/82 p-4 backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2 text-sm font-normal text-white">
              <Layers className="h-4 w-4 text-[var(--metin-ikincil)]" aria-hidden />
              Katman kısayolları
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(
                [
                  ["fault", "Fay düğümleri (temsil)", Mountain, layersState.fault],
                  ["earthquakes", "Deprem olayları (mock)", Waves, layersState.earthquakes],
                  ["soil", "Zemin özet zonları", MapPin, layersState.soil],
                  ["listings", "İlan seçkisi", Home, layersState.listings],
                  ["assembly", "AFAD sığınır parkı özeti", Siren, layersState.assembly],
                  ["hospitals", "Hastane yaklaşımı bağlamı", Hospital, layersState.hospitals],
                ] as const
              ).map(([key, label, Icon, on]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(key)}
                  className={`flex items-center gap-2 rounded-[20px] border px-2.5 py-2 text-start transition ${
                    on ? "border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]" : "border-white/10 bg-black/30 text-slate-400"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <Link
              to="/ilanlar?depremMin=70"
              className="mt-4 flex items-center justify-center gap-2 rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-2 text-center text-sm font-normal text-[var(--metin-ikincil)] hover:bg-[var(--zemin-yumusak)]"
            >
              Deprem filtresini 70+ ile aç
              <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="pointer-events-none flex justify-end">
          <div className="pointer-events-auto max-w-md rounded-[20px] border border-white/12 bg-slate-950/75 px-4 py-3 text-[0.72rem] leading-relaxed text-slate-300 backdrop-blur-md">
            <div className="flex items-start gap-2">
              <ModuleTag tone="warn">Yönetsel bildirici</ModuleTag>
            </div>
            <p className="mt-2">
              Poligonların ve yörüngelerin konumsal doğruluğu tanıtıma yönelik olup hakiki risk kabulleri için güncel AFAD /
              TKGM ve bağlı düzen çıktılarını mutlaka eş zamanlı doğrulayın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
