import { lazy, Suspense, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/async/LoadingState";

const MapPolygonSearchInner = lazy(() => import("./MapPolygonSearchInner"));

type Props = {
  onPolygonComplete: (coords: [number, number][]) => void;
  onClear: () => void;
};

export function MapPolygonSearch({ onPolygonComplete, onClear }: Props) {
  const [expanded, setExpanded] = useState(false);

  const handleComplete = useCallback(
    (coords: [number, number][]) => {
      onPolygonComplete(coords);
      setExpanded(false);
    },
    [onPolygonComplete],
  );

  if (!expanded) {
    return (
      <Button type="button" variant="outline" size="sm" className="border-white/15" onClick={() => setExpanded(true)}>
        Haritada alan çiz
      </Button>
    );
  }

  return (
    <div className="rounded-[20px] border border-white/10 bg-slate-900/50 p-3">
      <p className="mb-2 text-xs text-slate-400">Haritaya tıklayarak köşe noktaları ekleyin; en az 3 nokta gerekir.</p>
      <Suspense fallback={<LoadingState compact label="Harita yükleniyor…" />}>
        <MapPolygonSearchInner onComplete={handleComplete} />
      </Suspense>
      <div className="mt-2 flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => { onClear(); setExpanded(false); }}>
          İptal
        </Button>
      </div>
    </div>
  );
}
