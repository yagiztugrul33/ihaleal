import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Eq = { id: string; time: string; magnitude: number; place: string; depthKm?: number };

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

export function LiveEarthquakeTicker() {
  const [items, setItems] = useState<Eq[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    let cancel = false;
    void fetch("/data/kandilli-feed-mock.json")
      .then((r) => r.json())
      .then((data: { events?: Eq[] }) => {
        if (cancel || !data.events) return;
        const sorted = [...data.events].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        const realistic = looksTooSynthetic(sorted)
          ? buildRealisticDemoEvents(data.updated ?? new Date().toISOString())
          : sorted;
        setItems(realistic.slice(0, 18));
      })
      .catch(() => {
        if (cancel) return;
        setItems(buildRealisticDemoEvents(new Date().toISOString()).slice(0, 18));
      });
    return () => {
      cancel = true;
    };
  }, []);

  const displayItems = useMemo(() => items.slice(0, 14), [items]);

  return (
    <div className="home-eq-ticker" aria-label="Son deprem olayları şeridi">
      <div className="home-eq-ticker__label">
        <Activity className="h-4 w-4 text-orange-300" aria-hidden />
        <span>Canlı deprem bandı</span>
        <span className="home-eq-ticker__demo-pill">demo veri</span>
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
