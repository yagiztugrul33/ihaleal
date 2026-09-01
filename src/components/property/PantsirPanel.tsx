import { useMemo, useState } from "react";
import { Shield, Building2, GraduationCap, Heart, Activity, MapPin, Bus, Landmark, ShoppingBag, Coffee } from "lucide-react";
import { getPantsirSnapshot, type PantsirPOI } from "@/lib/demo-data/pantsir-mock";
import { NeighborhoodScoreCard } from "./NeighborhoodScoreCard";
import { useNearbyPOI, type NearbyPOICategory } from "@/hooks/useNearbyPOI";

interface Props {
  listingId: string;
  lat?: number | null;
  lng?: number | null;
}

const CATEGORY_LABELS: Record<PantsirPOI["category"], { label: string; Icon: typeof Heart }> = {
  saglik: { label: "Sağlık", Icon: Heart },
  egitim: { label: "Eğitim", Icon: GraduationCap },
  devlet: { label: "Devlet", Icon: Landmark },
  ticaret: { label: "Ticaret", Icon: ShoppingBag },
  ulasim: { label: "Ulaşım", Icon: Bus },
  sosyal: { label: "Sosyal", Icon: Coffee },
};

const POI_CATEGORIES: NearbyPOICategory[] = ["saglik", "egitim", "devlet", "ticaret", "ulasim", "sosyal"];

function scoreFromCount(count: number, max = 12): number {
  return Math.min(100, Math.round((count / max) * 100));
}

export function PantsirPanel({ listingId, lat, lng }: Props) {
  const [activeTab, setActiveTab] = useState<PantsirPOI["category"]>("saglik");
  const mockSnapshot = useMemo(() => getPantsirSnapshot(listingId), [listingId]);

  const hasCoords = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
  const saglik = useNearbyPOI(hasCoords ? lat : null, hasCoords ? lng : null, "saglik", 1200);
  const egitim = useNearbyPOI(hasCoords ? lat : null, hasCoords ? lng : null, "egitim", 1200);
  const devlet = useNearbyPOI(hasCoords ? lat : null, hasCoords ? lng : null, "devlet", 1200);
  const ticaret = useNearbyPOI(hasCoords ? lat : null, hasCoords ? lng : null, "ticaret", 1200);
  const ulasim = useNearbyPOI(hasCoords ? lat : null, hasCoords ? lng : null, "ulasim", 1200);
  const sosyal = useNearbyPOI(hasCoords ? lat : null, hasCoords ? lng : null, "sosyal", 1200);

  const liveByCat: Record<PantsirPOI["category"], typeof saglik> = {
    saglik,
    egitim,
    devlet,
    ticaret,
    ulasim,
    sosyal,
  };

  const anyLive = hasCoords && POI_CATEGORIES.some((c) => liveByCat[c].pois.length > 0);
  const anyLiveLoading = hasCoords && POI_CATEGORIES.some((c) => liveByCat[c].loading);

  const scores = useMemo(() => {
    if (!anyLive) return mockSnapshot.scores;
    const counts = {
      konum: ulasim.pois.length + ticaret.pois.length,
      egitim: egitim.pois.length,
      guvenlik: devlet.pois.length,
      ses: sosyal.pois.length,
      saglik: saglik.pois.length,
    };
    return [
      { key: "konum" as const, label: "Konum", score: scoreFromCount(counts.konum), detail: `${counts.konum} ulaşım/ticaret POI` },
      { key: "egitim" as const, label: "Eğitim", score: scoreFromCount(counts.egitim), detail: `${counts.egitim} okul/kurs` },
      { key: "guvenlik" as const, label: "Kamu", score: scoreFromCount(counts.guvenlik), detail: `${counts.guvenlik} kamu noktası` },
      { key: "ses" as const, label: "Sosyal", score: scoreFromCount(counts.ses), detail: `${counts.ses} sosyal tesis` },
      { key: "saglik" as const, label: "Sağlık", score: scoreFromCount(counts.saglik), detail: `${counts.saglik} sağlık POI` },
    ];
  }, [anyLive, mockSnapshot.scores, saglik.pois.length, egitim.pois.length, devlet.pois.length, sosyal.pois.length, ulasim.pois.length, ticaret.pois.length]);

  const activeLivePois = useMemo(() => {
    switch (activeTab) {
      case "saglik":
        return saglik.pois;
      case "egitim":
        return egitim.pois;
      case "devlet":
        return devlet.pois;
      case "ticaret":
        return ticaret.pois;
      case "ulasim":
        return ulasim.pois;
      case "sosyal":
        return sosyal.pois;
    }
  }, [activeTab, saglik.pois, egitim.pois, devlet.pois, ticaret.pois, ulasim.pois, sosyal.pois]);

  const visiblePOIs: PantsirPOI[] = useMemo(() => {
    if (anyLive) {
      return activeLivePois.slice(0, 8).map((p) => ({
        name: p.name,
        category: activeTab,
        direction: "K",
        distanceM: Math.round(p.distanceM),
      }));
    }
    return mockSnapshot.poiList.filter((p) => p.category === activeTab);
  }, [anyLive, activeTab, activeLivePois, mockSnapshot.poiList]);

  const poiSummary = anyLive
    ? {
        okul: egitim.pois.length,
        hastane: saglik.pois.length,
        market: ticaret.pois.length,
        metro: ulasim.pois.length,
      }
    : mockSnapshot.poiSummary;

  return (
    <section className="rounded-[20px] border border-cyan-400/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-6 flex items-start gap-3">
        <Shield className="h-7 w-7 text-cyan-400" aria-hidden />
        <div>
          <h2 className="text-2xl font-normal text-white">İstihbarat Paneli</h2>
          <p className="mt-1 text-sm text-slate-400">
            {anyLive
              ? "Canlı yakın POI verisi (nearby-poi edge) ile hesaplanan skorlar."
              : anyLiveLoading
                ? "Canlı POI yükleniyor…"
                : "Konum yok veya POI alınamadı — önizleme skorları gösteriliyor."}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {scores.map((s) => (
          <NeighborhoodScoreCard key={s.key} label={s.label} score={s.score} detail={s.detail} />
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-[20px] border border-slate-700/40 bg-slate-900/40 p-3 sm:grid-cols-4">
        <div className="flex items-center gap-2 rounded-[10px] bg-slate-800/40 px-3 py-2">
          <GraduationCap className="h-4 w-4 text-blue-400" />
          <div>
            <div className="text-xs text-slate-400">Okul</div>
            <div className="text-lg font-normal text-white">{poiSummary.okul}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-[10px] bg-slate-800/40 px-3 py-2">
          <Heart className="h-4 w-4 text-red-400" />
          <div>
            <div className="text-xs text-slate-400">Sağlık</div>
            <div className="text-lg font-normal text-white">{poiSummary.hastane}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-[10px] bg-slate-800/40 px-3 py-2">
          <ShoppingBag className="h-4 w-4 text-emerald-400" />
          <div>
            <div className="text-xs text-slate-400">Ticaret</div>
            <div className="text-lg font-normal text-white">{poiSummary.market}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-[10px] bg-slate-800/40 px-3 py-2">
          <Bus className="h-4 w-4 text-violet-400" />
          <div>
            <div className="text-xs text-slate-400">Ulaşım</div>
            <div className="text-lg font-normal text-white">{poiSummary.metro}</div>
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 border-b border-slate-700/40 pb-2">
        {(Object.keys(CATEGORY_LABELS) as PantsirPOI["category"][]).map((cat) => {
          const { label, Icon } = CATEGORY_LABELS[cat];
          const active = cat === activeTab;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveTab(cat)}
              className={`flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-sm font-normal transition ${
                active ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/35" : "text-slate-500 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          );
        })}
      </div>

      <ul className="space-y-2">
        {visiblePOIs.length === 0 ? (
          <li className="text-sm text-slate-500 px-2">Bu kategoride yakın POI bulunamadı.</li>
        ) : (
          visiblePOIs.map((poi, idx) => (
            <li
              key={`${poi.name}-${idx}`}
              className="flex items-center justify-between rounded-[20px] border border-slate-700/30 bg-slate-900/40 px-4 py-3 transition hover:border-cyan-400/30"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-cyan-400" aria-hidden />
                <span className="text-sm text-slate-200">{poi.name}</span>
              </div>
              <div className="text-xs text-slate-500">
                {anyLive ? null : <span className="rounded-[3px] bg-slate-800/60 px-2 py-0.5 me-2 text-slate-300">{poi.direction}</span>}
                {poi.distanceM < 1000 ? `${poi.distanceM} m` : `${(poi.distanceM / 1000).toFixed(1)} km`}
              </div>
            </li>
          ))
        )}
      </ul>

      {!anyLive ? (
        <div className="mt-4 rounded-[20px] border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            Kesin konum veya canlı POI yoksa önizleme skorları gösterilir. Harita koordinatı olan ilanlarda nearby-poi edge kullanılır.
          </p>
        </div>
      ) : null}

      <Activity className="hidden" aria-hidden />
      <Building2 className="hidden" aria-hidden />
    </section>
  );
}

export default PantsirPanel;
