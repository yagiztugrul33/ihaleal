import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Droplets,
  HeartHandshake,
  MapPin,
  Navigation,
  Search,
  Users,
  Toilet,
} from "lucide-react";
import type { LatLngExpression } from "leaflet";
import { ModulePanel, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";
import { ModuleRelatedStrip } from "./ModuleRelatedStrip";
import type { RelatedModuleCard } from "./ModuleRelatedStrip";
import type { AssemblyPoint } from "./AfetToplanmaMapInner";
import { ShieldCheck, Activity } from "lucide-react";

const AfetToplanmaMapInner = lazy(() => import("./AfetToplanmaMapInner"));

const ADDRESS_PRESETS: { q: string; label: string; lat: number; lng: number; city: string; household: number }[] = [
  { q: "kadikoy", label: "İstanbul Kadıköy", lat: 40.99, lng: 29.03, city: "Istanbul", household: 4 },
  { q: "umraniye", label: "İstanbul Ümraniye", lat: 41.03, lng: 29.11, city: "Istanbul", household: 5 },
  { q: "cankaya", label: "Ankara Çankaya", lat: 39.9, lng: 32.85, city: "Ankara", household: 3 },
  { q: "bornova", label: "İzmir Bornova", lat: 38.46, lng: 27.23, city: "Izmir", household: 4 },
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function walkMinutes(km: number): number {
  return Math.round((km / 4.5) * 60);
}

const RELATED: RelatedModuleCard[] = [
  { title: "Aile Acil Planı", description: "Toplanma ve iletişim planını tamamlayın.", href: "/modul/aile-acil-plan", icon: HeartHandshake },
  { title: "Deprem Risk Haritası", description: "Fay ve zemin katmanları.", href: "/modul/deprem-risk-haritasi", icon: Activity },
  { title: "Bina Risk Sorgusu", description: "Yapı özet skoru.", href: "/modul/bina-risk-sorgu", icon: ShieldCheck },
];

export default function AfetToplanmaAlanlariPage() {
  const [allPoints, setAllPoints] = useState<AssemblyPoint[]>([]);
  const [cityFilter, setCityFilter] = useState("all");
  const [minCapacity, setMinCapacity] = useState(0);
  const [maxDistanceKm, setMaxDistanceKm] = useState(15);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<(typeof ADDRESS_PRESETS)[0] | null>(ADDRESS_PRESETS[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/afad-assembly-mock.json")
      .then((r) => r.json())
      .then((data: AssemblyPoint[]) => setAllPoints(data))
      .catch(() => setAllPoints([]));
  }, []);

  const cities = useMemo(() => {
    const set = new Set(allPoints.map((p) => p.city));
    return ["all", ...Array.from(set).sort()];
  }, [allPoints]);

  const searchAddress = useCallback(() => {
    const q = query.trim().toLowerCase();
    const hit = ADDRESS_PRESETS.find((p) => p.q.includes(q) || p.label.toLowerCase().includes(q)) ?? ADDRESS_PRESETS[0];
    setUser(hit);
    setSelectedId(null);
  }, [query]);

  const nearest = useMemo(() => {
    if (!user || allPoints.length === 0) return [];
    const withDist = allPoints
      .map((p) => ({
        ...p,
        km: haversineKm(user.lat, user.lng, p.lat, p.lng),
        walkMin: walkMinutes(haversineKm(user.lat, user.lng, p.lat, p.lng)),
      }))
      .filter((p) => {
        if (cityFilter !== "all" && p.city !== cityFilter) return false;
        if (p.capacity < minCapacity) return false;
        if (p.km > maxDistanceKm) return false;
        return true;
      })
      .sort((a, b) => a.km - b.km)
      .slice(0, 5);
    return withDist;
  }, [user, allPoints, cityFilter, minCapacity, maxDistanceKm]);

  const mapPoints = useMemo(() => {
    if (nearest.length > 0) return nearest;
    return allPoints.filter((p) => (cityFilter === "all" ? true : p.city === cityFilter)).slice(0, 80);
  }, [nearest, allPoints, cityFilter]);

  const routeLine = useMemo<LatLngExpression[] | null>(() => {
    if (!user || nearest.length === 0) return null;
    const first = nearest[0];
    return [
      [user.lat, user.lng],
      [first.lat, first.lng],
    ];
  }, [user, nearest]);

  const insufficient = user != null && nearest.length > 0 && nearest[0].capacity < user.household * 25;

  const stats = useMemo(
    () => [
      { label: "Toplam alan (mock)", value: String(allPoints.length), hint: "AFAD seçkisi" },
      { label: "Filtrelenen il", value: cityFilter === "all" ? "Tümü" : cityFilter, hint: "Harita" },
      { label: "En yakın mesafe", value: nearest[0] ? `${nearest[0].km.toFixed(1)} km` : "—", hint: "Kuş uçuşu" },
      { label: "Yürüme süresi", value: nearest[0] ? `~${nearest[0].walkMin} dk` : "—", hint: "4,5 km/s" },
    ],
    [allPoints.length, cityFilter, nearest],
  );

  const flyCenter: LatLngExpression | null = user ? [user.lat, user.lng] : null;
  const flyZoom = user ? 12 : 6;

  return (
    <ModuleShell
      title="Afet Toplanma Alanları"
      subtitle="210 mock toplanma noktası üzerinde il, kapasite ve mesafe filtreleri; adrese göre en yakın beş alan ve yürüyüş rotası."
      icon={MapPin}
      iconAccent="text-cyan-300"
      badge="AFAD Toplanma GIS"
    >
      <ModuleStatGrid stats={stats} />

      <div className="mod-map-fullpage mod-no-print">
        <ModulePanel title="Tam ekran toplanma haritası">
          <div className="mb-4 grid gap-3 lg:grid-cols-4">
            <div>
              <label htmlFor="at-il">İl filtresi</label>
              <select id="at-il" className="mt-1 w-full" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "Tüm iller" : c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="at-kap">Min. kapasite</label>
              <select id="at-kap" className="mt-1 w-full" value={minCapacity} onChange={(e) => setMinCapacity(Number(e.target.value))}>
                <option value={0}>Tümü</option>
                <option value={500}>500+</option>
                <option value={900}>900+</option>
                <option value={1200}>1200+</option>
              </select>
            </div>
            <div>
              <label htmlFor="at-mes">Maks. mesafe (km)</label>
              <input
                id="at-mes"
                type="range"
                min={2}
                max={30}
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="mt-2 w-full"
              />
              <span className="text-xs text-slate-500">{maxDistanceKm} km</span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                searchAddress();
              }}
            >
              <label htmlFor="at-adres">Adres araması</label>
              <div className="mt-1 flex gap-2">
                <input id="at-adres" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Mahalle, ilçe" />
                <button type="submit" className="mod-btn-primary shrink-0 px-3">
                  <Search className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </form>
          </div>

          {insufficient ? (
            <div className="mod-alert mod-alert--warn mb-4" role="alert">
              <AlertTriangle className="mb-1 inline h-4 w-4" aria-hidden /> Seçilen hane sayısı için en yakın alanın kapasitesi
              yetersiz görünüyor. Alternatif ilçe veya ikinci en yakın noktayı değerlendirin.
            </div>
          ) : null}

          <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">Harita yükleniyor…</div>}>
            <AfetToplanmaMapInner
              points={mapPoints}
              userPoint={user ? [user.lat, user.lng] : null}
              routeLine={routeLine}
              selectedId={selectedId}
              flyCenter={flyCenter}
              flyZoom={flyZoom}
            />
          </Suspense>

          <div className="mod-sticky-cta">
            <p className="text-sm text-slate-300">
              <Navigation className="me-1 inline h-4 w-4 text-sky-400" aria-hidden />
              Aile acil planınızı toplanma noktası ile eşleştirin.
            </p>
            <Link to="/modul/aile-acil-plan" className="mod-btn-primary">
              <HeartHandshake className="h-4 w-4" aria-hidden />
              Acil plan modülü
            </Link>
          </div>
        </ModulePanel>
      </div>

      <ModulePanel title="En yakın beş toplanma alanı">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {nearest.length === 0 ? (
            <p className="text-sm text-slate-500">Filtreleri gevşetin veya adres araması yapın.</p>
          ) : (
            nearest.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`mod-assembly-card text-start ${selectedId === p.id ? "mod-assembly-card--selected" : ""}`}
                onClick={() => setSelectedId(p.id)}
              >
                <p className="font-semibold text-slate-100">{p.name}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {p.km.toFixed(1)} km · ~{p.walkMin} dk yürüyüş
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <ModuleTag tone={p.capacity >= 900 ? "ok" : "warn"}>
                    <Users className="me-0.5 inline h-3 w-3" aria-hidden />
                    {p.capacity}
                  </ModuleTag>
                  {p.water ? (
                    <ModuleTag tone="ok">
                      <Droplets className="me-0.5 inline h-3 w-3" aria-hidden />
                      Su
                    </ModuleTag>
                  ) : null}
                  {p.toilet ? (
                    <ModuleTag tone="ok">
                      <Toilet className="me-0.5 inline h-3 w-3" aria-hidden />
                      WC
                    </ModuleTag>
                  ) : null}
                </div>
              </button>
            ))
          )}
        </div>
      </ModulePanel>

      <ModuleRelatedStrip modules={RELATED} />
    </ModuleShell>
  );
}
