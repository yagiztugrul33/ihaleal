import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PropertyRecord } from "@/types/property";
import type { EarthquakeFacets, EarthquakeSubScore } from "@/types/property/earthquake";
import {
  ensureEarthquakeScore,
  generateEarthquakeNarrative,
} from "@/lib/property/earthquakeScore";
import { ScoreRing } from "@/components/ilan/detail/shared";
import { SubScoreBreakdownModal } from "@/components/property/SubScoreBreakdownModal";
import "@/styles/afet-disaster-hub.css";

export interface AfetDisasterHubProps {
  property: PropertyRecord;
}

type AfetTabId =
  | "genel"
  | "fay"
  | "zemin"
  | "yapi"
  | "kat"
  | "tahliye"
  | "acil"
  | "sigorta";

const TABS: { id: AfetTabId; label: string }[] = [
  { id: "genel", label: "Genel" },
  { id: "fay", label: "Fay haritasi" },
  { id: "zemin", label: "Zemin" },
  { id: "yapi", label: "Yapi sinifi" },
  { id: "kat", label: "Kat performansi" },
  { id: "tahliye", label: "Tahliye" },
  { id: "acil", label: "Acil ve toplanma" },
  { id: "sigorta", label: "Sigorta" },
];

type LatLngTuple = [number, number];

function centerOf(property: PropertyRecord): LatLngTuple {
  const lat = property.latitude ?? 41.015137;
  const lng = property.longitude ?? 28.97953;
  return [lat, lng];
}

function normCity(c?: string | null): string {
  if (!c) return "";
  return c.trim().toLocaleLowerCase("tr-TR");
}

function haversKm(a: LatLngTuple, b: LatLngTuple): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const h = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

interface AssemblyRow {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  capacity?: number;
}

/** Dinamik `react-leaflet` — sadece fay ve acil sekmelerinde yuklenir. */
function makeLazyFaultMap() {
  return lazy(async () => {
    await import("leaflet/dist/leaflet.css");
    const { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } = await import(
      "react-leaflet"
    );
    return {
      default: function FaultMap({
        center,
        data,
      }: {
        center: LatLngTuple;
        data: object | null;
      }) {
        if (!data) {
          return <div className="afet-hub__muted">GeoJSON bekleniyor…</div>;
        }
        return (
          <MapContainer
            className="afet-hub__map"
            center={center}
            zoom={10}
            scrollWheelZoom={false}
            attributionControl
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap katkilicilar"
            />
            <GeoJSON
              pane="overlayPane"
              data={data as never}
              style={{
                color: "#fbbf24",
                weight: 2,
                opacity: 0.9,
              }}
            />
            <CircleMarker
              center={center}
              radius={10}
              pathOptions={{
                color: "#0f172a",
                weight: 2,
                fillColor: "#22c55e",
                fillOpacity: 0.92,
              }}
            >
              <Popup>Ilan konumu</Popup>
            </CircleMarker>
          </MapContainer>
        );
      },
    };
  });
}

function makeLazyAssemblyMap() {
  return lazy(async () => {
    await import("leaflet/dist/leaflet.css");
    const { MapContainer, TileLayer, CircleMarker, Popup } = await import("react-leaflet");
    return {
      default: function AssemblyMap({
        center,
        points,
      }: {
        center: LatLngTuple;
        points: AssemblyRow[];
      }) {
        return (
          <MapContainer
            className="afet-hub__map"
            center={center}
            zoom={12}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap katkilicilar"
            />
            <CircleMarker
              center={center}
              radius={10}
              pathOptions={{
                color: "#0f172a",
                weight: 2,
                fillColor: "#22c55e",
                fillOpacity: 0.95,
              }}
            >
              <Popup>Ilan konumu</Popup>
            </CircleMarker>
            {points.map((p) => (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={7}
                pathOptions={{
                  color: "#eab308",
                  weight: 2,
                  fillColor: "#fcd34d",
                  fillOpacity: 0.85,
                }}
              >
                <Popup>
                  <strong>{p.name}</strong>
                  <br />
                  Tahmini kapasite: {p.capacity ?? "—"}
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        );
      },
    };
  });
}

const LazyFaultMap = makeLazyFaultMap();
const LazyAssemblyMap = makeLazyAssemblyMap();

function facetBlock(title: string, rows: [string, string][]) {
  return (
    <section>
      <h3 className="afet-hub__muted" style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>
        {title}
      </h3>
      <dl className="afet-modal-inputs">
        {rows.map(([k, v]) => (
          <div key={k} className="afet-modal-input-row">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function pickSubscores(subs: EarthquakeSubScore[], ids: string[]) {
  const m = new Map(subs.map((s) => [s.id, s]));
  return ids.map((id) => m.get(id)).filter(Boolean) as EarthquakeSubScore[];
}

function SuspenseMap({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="afet-hub__lazy-fallback">Harita yukleniyor…</div>}>
      {children}
    </Suspense>
  );
}

export function AfetDisasterHub({ property }: AfetDisasterHubProps) {
  const faultFetchStarted = useRef(false);
  const assemblyFetchStarted = useRef(false);
  const [tab, setTab] = useState<AfetTabId>("genel");
  const [modalSub, setModalSub] = useState<EarthquakeSubScore | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [faultGeo, setFaultGeo] = useState<object | null>(null);
  const [assemblies, setAssemblies] = useState<AssemblyRow[]>([]);

  const payload = useMemo(() => ensureEarthquakeScore(property), [property]);
  const narrative = useMemo(
    () => generateEarthquakeNarrative(property, payload),
    [property, payload]
  );
  const center = useMemo(() => centerOf(property), [property]);

  useEffect(() => {
    if (tab !== "fay" || faultFetchStarted.current) return;
    faultFetchStarted.current = true;
    let cancelled = false;
    fetch("/geo/mta-faults-mock.geojson")
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setFaultGeo(j);
      })
      .catch(() => {
        if (!cancelled) setFaultGeo(null);
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  useEffect(() => {
    if (tab !== "acil" || assemblyFetchStarted.current) return;
    assemblyFetchStarted.current = true;
    let cancelled = false;
    fetch("/data/afad-assembly-mock.json")
      .then((r) => r.json())
      .then((raw: AssemblyRow[]) => {
        if (cancelled) return;
        const cn = normCity(property.city);
        const filtered = raw.filter((a) => {
          const an = normCity(a.city);
          if (cn && an && (an.includes(cn) || cn.includes(an))) return true;
          return haversKm([a.lat, a.lng], center) <= 35;
        });
        filtered.sort((a, b) => haversKm([a.lat, a.lng], center) - haversKm([b.lat, b.lng], center));
        setAssemblies(filtered.slice(0, 14));
      });
    return () => {
      cancelled = true;
    };
  }, [tab, property.city, center]);

  const openSubModal = useCallback((s: EarthquakeSubScore) => {
    setModalSub(s);
    setModalOpen(true);
  }, []);

  const f: EarthquakeFacets = payload.facets;

  const zeminSubs = pickSubscores(payload.subScores, ["zemin_sinifi"]);
  const yapiSubs = pickSubscores(payload.subScores, ["yapi_sinifi"]);
  const katSubs = pickSubscores(payload.subScores, ["kat_performansi", "bina_yasi"]);
  const tahliyeSubs = pickSubscores(payload.subScores, ["acil_cikis", "yangin_hatlar"]);
  const sigortaSubs = pickSubscores(payload.subScores, ["sigorta_dask"]);

  function renderBars(list: EarthquakeSubScore[]) {
    return (
      <div className="afet-hub__subs">
        {list.map((s) => (
          <button
            key={s.id}
            type="button"
            className="afet-hub__subcard"
            onClick={() => openSubModal(s)}
          >
            <div className="afet-hub__sub-meta">
              <span>{s.label}</span>
              <strong>{s.score}</strong>
            </div>
            <div className="afet-hub__bar" aria-hidden>
              <span style={{ width: `${Math.min(100, s.score)}%` }} />
            </div>
          </button>
        ))}
      </div>
    );
  }

  let panel: ReactNode = null;
  switch (tab) {
    case "genel":
      panel = (
        <>
          <div className="afet-hub__rings">
            <ScoreRing score={payload.composite} label="Deprem uygunlugu (demo)" size={128} />
            <div>
              <p style={{ margin: "0 0 0.5rem", fontWeight: 700 }}>
                {payload.bandLabelTR}
              </p>
              <p className="afet-hub__muted" style={{ margin: 0 }}>
                Fay mesafesi ~{f.faultDistanceKm} km • Toplanma yuruyusu ~{f.assemblyWalkMinutes}{" "}
                dk • Guncelleme {payload.updatedAtDemo}
              </p>
            </div>
          </div>
          <div className="afet-hub__subs">
            {payload.subScores.map((s) => (
              <button
                key={s.id}
                type="button"
                className="afet-hub__subcard"
                onClick={() => openSubModal(s)}
              >
                <div className="afet-hub__sub-meta">
                  <span>{s.label}</span>
                  <strong>{s.score}</strong>
                </div>
                <div className="afet-hub__bar">
                  <span style={{ width: `${Math.min(100, s.score)}%` }} />
                </div>
              </button>
            ))}
          </div>
          <div className="afet-hub__narrative">
            {narrative.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </>
      );
      break;
    case "fay":
      panel = (
        <>
          <p className="afet-hub__muted">
            MTA demo cizgisi: `/geo/mta-faults-mock.geojson`. Fay mesafe ~{f.faultDistanceKm} km.
          </p>
          <SuspenseMap>
            <LazyFaultMap center={center} data={faultGeo} />
          </SuspenseMap>
        </>
      );
      break;
    case "zemin":
      panel = (
        <>
          {facetBlock("Zemin ve risk ipuclari", [
            ["Zemin grubu", f.soilBand],
            ["Sıvılasmaya acik parsel", f.liquefactionFlag ? "Evet" : "Hayir"],
            ["Yumuşak kat / soft story", f.softStoryFlag ? "Isaretli" : "Yok"],
            ["Bolgesel tehlike", f.regionalHazard],
          ])}
          {renderBars(zeminSubs)}
        </>
      );
      break;
    case "yapi":
      panel = (
        <>
          {facetBlock("Yapi kabugu", [
            ["Tahmini sinif", f.seismicClassGuess],
            ["Görünür yüzey hasari", f.damageVisible],
            ["Guclendirme", f.reinforcement],
          ])}
          {renderBars(yapiSubs)}
          <p className="afet-hub__muted">
            Detay için ilgili kartlara basin; formul ve veri kalemleri acilir.
          </p>
        </>
      );
      break;
    case "kat":
      panel = (
        <>
          {facetBlock("Dikey tasima", [
            ["Dikey kat riski", f.verticalRisk],
            ["Bina yasi bandı", f.buildingAgeBand],
          ])}
          {renderBars(katSubs)}
        </>
      );
      break;
    case "tahliye":
      panel = (
        <>
          <p className="afet-hub__muted">
            Acilis ve yangin güzergahi demo skorlari; kritik çıkış ve hidrant bilgisi ilan kartinda
            teyit edilmelidir.
          </p>
          {renderBars(tahliyeSubs)}
        </>
      );
      break;
    case "acil":
      panel = (
        <>
          <p className="afet-hub__muted">
            AFAD demo toplanma noktalari `/data/afad-assembly-mock.json`; sehir ya da ≤35 km
            mesafe ile süzülür.
          </p>
          <ul className="afet-hub__assemble-list">
            {assemblies.map((a) => (
              <li key={a.id}>
                <strong>{a.name}</strong> • {Math.round(haversKm([a.lat, a.lng], center))} km
              </li>
            ))}
          </ul>
          <SuspenseMap>
            <LazyAssemblyMap center={center} points={assemblies} />
          </SuspenseMap>
        </>
      );
      break;
    case "sigorta":
      panel = (
        <>
          {facetBlock("Sigorta", [
            ["DASK kaydı (demo)", f.daskLikelyKnown ? "Olumlu" : "Tekrar kontrol"],
            ["Toplanma erisim dk", `${f.assemblyWalkMinutes}`],
          ])}
          {renderBars(sigortaSubs)}
          <ul className="afet-hub__muted" style={{ margin: 0, paddingLeft: "1.1rem" }}>
            <li>Guncel policenizi ve adres eslesmesini doğrulayın.</li>
            <li>Hasar bildirimi ve fotograf arsivi tutun.</li>
          </ul>
        </>
      );
      break;
    default:
      panel = null;
  }

  return (
    <div className="afet-hub">
      <div className="afet-hub__tabs" role="tablist" aria-label="Afet alt sekmeleri">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            className="afet-hub__tab"
            aria-selected={tab === t.id}
            data-state={tab === t.id ? "active" : "inactive"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="afet-hub__panel" role="tabpanel">
        {panel}
      </div>

      <SubScoreBreakdownModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        subScore={modalSub}
      />
    </div>
  );
}
