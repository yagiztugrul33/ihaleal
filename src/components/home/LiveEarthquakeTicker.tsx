import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Eq = { id: string; time: string; magnitude: number; place: string; depthKm?: number };
type DataSource = "edge" | "afad" | "demo";

const PLACE_POOL = [
  "Marmara Denizi",
  "Ege Denizi",
  "Akdeniz - Antalya Körfezi",
  "Bingöl - Karlıova",
  "Kahramanmaraş - Türkoğlu",
  "Van Gölü",
  "Muğla - Datça Açıkları",
  "Çanakkale - Ayvacık",
  "İzmir - Seferihisar",
  "Malatya - Doğanşehir",
  "Erzincan - Tercan",
  "Düzce - Gölyaka",
] as const;

function createSeededRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function realisticMagnitude(rng: () => number): number {
  const roll = rng();
  if (roll < 0.72) return Number((1.2 + rng() * 1.8).toFixed(1));
  if (roll < 0.93) return Number((3 + rng() * 1.6).toFixed(1));
  return Number((4.6 + rng() * 1.3).toFixed(1));
}

function buildRealisticDemoEvents(seedIso: string, count = 28): Eq[] {
  const seedBase = Number(seedIso.replace(/[^\d]/g, "").slice(0, 9)) || 20260520;
  const rng = createSeededRng(seedBase);
  const now = Date.now();
  let cursor = now - Math.floor((14 + rng() * 60) * 60_000);
  const events: Eq[] = [];
  for (let i = 0; i < count; i += 1) {
    const gapMinutes = Math.floor(6 + rng() * 210 + (i % 6 === 0 ? rng() * 180 : 0));
    cursor -= gapMinutes * 60_000;
    const place = PLACE_POOL[Math.floor(rng() * PLACE_POOL.length)] ?? "Türkiye";
    events.push({
      id: `eq-r-${i + 1}`,
      time: new Date(cursor).toISOString(),
      magnitude: realisticMagnitude(rng),
      place,
      depthKm: clamp(Math.round(4 + rng() * 34), 3, 40),
    });
  }
  return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

function looksTooSynthetic(events: Eq[]): boolean {
  if (events.length < 8) return false;
  const magnitudes = events.slice(0, 12).map((e) => Number(e.magnitude.toFixed(1)));
  const diffs = magnitudes.slice(1).map((m, i) => Number((m - magnitudes[i]).toFixed(1)));
  const mostlyFixedDelta = diffs.filter((d) => d === 0.3 || d === -0.3).length >= Math.max(6, diffs.length - 2);
  const times = events.slice(0, 12).map((e) => new Date(e.time).getTime());
  const gaps = times.slice(1).map((t, i) => Math.abs(Math.round((times[i] - t) / 60_000)));
  const dominantGap = gaps[0] ?? 0;
  const repetitiveGap = dominantGap > 0 && gaps.filter((g) => Math.abs(g - dominantGap) <= 2).length >= Math.max(6, gaps.length - 2);
  return mostlyFixedDelta || repetitiveGap;
}

function formatTr(iso: string): string {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function magnitudeClass(magnitude: number): "small" | "medium" | "large" {
  if (magnitude >= 4.5) return "large";
  if (magnitude >= 3) return "medium";
  return "small";
}

function asNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asStr(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function parseAfadDate(v: unknown): string | null {
  const text = asStr(v);
  if (!text) return null;
  const normalized = text.replace(" ", "T");
  const iso = new Date(normalized);
  return Number.isNaN(iso.getTime()) ? null : iso.toISOString();
}

function normalizeAfadEvent(raw: unknown, i: number): Eq | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const magnitude = asNum(rec.m ?? rec.mag ?? rec.magnitude);
  const place = asStr(rec.location ?? rec.lokasyon ?? rec.place ?? rec.city);
  const time = parseAfadDate(rec.date ?? rec.time ?? rec.eventDate);
  if (magnitude == null || !place || !time) return null;
  return {
    id: asStr(rec.eventID ?? rec.id) ?? `afad-${i + 1}`,
    time,
    magnitude,
    place,
    depthKm: asNum(rec.depth ?? rec.depthKm) ?? undefined,
  };
}

async function fetchAfadEvents(signal: AbortSignal): Promise<Eq[]> {
  const end = new Date();
  const start = new Date(end.getTime() - 2 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
    orderby: "timedesc",
    limit: "80",
    minmag: "1",
  });
  const url = `https://deprem.afad.gov.tr/apiv2/event/filter?${params.toString()}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`afad_http_${res.status}`);
  const payload = await res.json();
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.events) ? payload.events : [];
  const normalized = rows
    .map((row, i) => normalizeAfadEvent(row, i))
    .filter((x): x is Eq => Boolean(x))
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  if (normalized.length < 8) throw new Error("afad_insufficient_rows");
  return normalized;
}

function shouldUseSupabaseEdge(): boolean {
  const url = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
  const key = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();
  if (!url || !key) return false;
  if (url.includes("placeholder.supabase.co")) return false;
  if (!/^https?:\/\//i.test(url)) return false;
  return true;
}

async function fetchViaEdge(signal: AbortSignal): Promise<Eq[]> {
  const url = String(import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/$/, "");
  const key = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "");
  const res = await fetch(`${url}/functions/v1/earthquakes_latest`, {
    signal,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  if (!res.ok) throw new Error(`edge_http_${res.status}`);
  const payload = (await res.json()) as { ok?: boolean; events?: unknown[] };
  if (!payload?.ok || !Array.isArray(payload.events)) throw new Error("edge_invalid_payload");
  const normalized = payload.events
    .map((row, i) => normalizeAfadEvent(row, i))
    .filter((x): x is Eq => Boolean(x))
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  if (normalized.length < 8) throw new Error("edge_insufficient_rows");
  return normalized;
}

export function LiveEarthquakeTicker() {
  const [items, setItems] = useState<Eq[]>([]);
  const [source, setSource] = useState<DataSource>("demo");
  const reduced = useReducedMotion();

  useEffect(() => {
    let cancel = false;
    const controller = new AbortController();
    const fallbackToDemo = (seedIso: string) => {
      if (cancel) return;
      setSource("demo");
      setItems(buildRealisticDemoEvents(seedIso).slice(0, 18));
    };

    const load = async () => {
      try {
        if (shouldUseSupabaseEdge()) {
          const edgeRows = await fetchViaEdge(controller.signal);
          if (!cancel) {
            setSource("edge");
            setItems(edgeRows.slice(0, 18));
          }
          return;
        }
      } catch {
        // Edge route optional: fail-soft to open AFAD endpoint.
      }

      try {
        const afadRows = await fetchAfadEvents(controller.signal);
        if (!cancel) {
          setSource("afad");
          setItems(afadRows.slice(0, 18));
        }
        return;
      } catch {
        // Fall through to mock feed + realistic randomization.
      }

      try {
        const resp = await fetch("/data/kandilli-feed-mock.json", { signal: controller.signal });
        const data = (await resp.json()) as { events?: Eq[]; updated?: string };
        if (cancel || !data?.events) return;
        const sorted = [...data.events].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        const realistic =
          looksTooSynthetic(sorted) ? buildRealisticDemoEvents(data.updated ?? new Date().toISOString()) : sorted;
        setSource("demo");
        setItems(realistic.slice(0, 18));
      } catch {
        fallbackToDemo(new Date().toISOString());
      }
    };

    void load();
    return () => {
      cancel = true;
      controller.abort();
    };
  }, []);

  const displayItems = useMemo(() => items.slice(0, 14), [items]);

  return (
    <div className="home-eq-ticker" aria-label="Son deprem olayları şeridi">
      <div className="home-eq-ticker__label">
        <Activity className="h-4 w-4 text-orange-300" aria-hidden />
        <span>Canlı deprem bandı</span>
        {source === "edge" ? (
          <span className="home-eq-ticker__live-pill">AFAD/Kandilli (edge)</span>
        ) : source === "afad" ? (
          <span className="home-eq-ticker__live-pill">AFAD açık veri</span>
        ) : (
          <span className="home-eq-ticker__demo-pill">demo veri</span>
        )}
        <Link to="/modul/canli-deprem-takip" className="home-eq-ticker__cta">
          Modüle git →
        </Link>
      </div>
      <div className={`home-eq-ticker__track ${reduced ? "home-eq-ticker__track--static" : "home-eq-ticker__track--marquee"}`}>
        {!displayItems.length ? (
          <span className="home-eq-ticker__empty">Deprem verisi yükleniyor…</span>
        ) : (
          <div className="home-eq-ticker__marquee-lane">
            {[0, 1].map((copy) => (
              <div key={copy} className="home-eq-ticker__seq" aria-hidden={copy === 1 ? "true" : undefined}>
                {displayItems.map((e) => {
                  const level = magnitudeClass(e.magnitude);
                  return (
                    <span key={`${copy}-${e.id}`} className={`home-eq-ticker__event home-eq-ticker__event--${level}`}>
                      <strong className="home-eq-ticker__mag">M{e.magnitude.toFixed(1)}</strong>
                      <span className="home-eq-ticker__place">{e.place}</span>
                      <time className="home-eq-ticker__time">{formatTr(e.time)}</time>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
