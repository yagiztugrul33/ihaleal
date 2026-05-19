import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Eq = { id: string; time: string; magnitude: number; place: string };

function formatTr(iso: string): string {
  try {
    return new Intl.DateTimeFormat("tr-TR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
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
        setItems(sorted.slice(0, 16));
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);

  const text = useMemo(() => {
    if (!items.length) return "Deprem verisi yükleniyor…";
    return items.map((e) => `M${e.magnitude.toFixed(1)} · ${e.place} · ${formatTr(e.time)}`).join("   •   ");
  }, [items]);

  return (
    <div className="home-eq-ticker" aria-label="Son deprem olayları şeridi">
      <div className="home-eq-ticker__label">
        <Activity className="h-4 w-4 text-orange-300" aria-hidden />
        <span>Canlı deprem bandı (demo veri)</span>
        <Link to="/modul/canli-deprem-takip" className="home-eq-ticker__cta">
          Modüle git →
        </Link>
      </div>
      <div className={`home-eq-ticker__track ${reduced ? "home-eq-ticker__track--static" : "home-eq-ticker__track--marquee"}`}>
        <span className="home-eq-ticker__text">{text}</span>
        <span className="home-eq-ticker__text" aria-hidden="true">
          {text}
        </span>
      </div>
    </div>
  );
}
