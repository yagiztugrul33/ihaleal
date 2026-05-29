// R13.4 Pantsir — Konum bazlı emlak istihbarat paneli (mock veri sürümü)
// Master vizyon: kullanıcı ilan açtığında 5 ana skor + yakın POI özet
// Gerçek API entegrasyonu R13.2'de (OSM Overpass + Supabase Edge)

import { useMemo, useState } from "react";
import { Shield, Building2, GraduationCap, Heart, Activity, MapPin, Bus, Landmark, ShoppingBag, Coffee } from "lucide-react";
import { getPantsirSnapshot, type PantsirPOI } from "@/lib/demo-data/pantsir-mock";
import { NeighborhoodScoreCard } from "./NeighborhoodScoreCard";

interface Props {
  listingId: string;
}

const CATEGORY_LABELS: Record<PantsirPOI["category"], { label: string; Icon: typeof Heart }> = {
  saglik: { label: "Sağlık", Icon: Heart },
  egitim: { label: "Eğitim", Icon: GraduationCap },
  devlet: { label: "Devlet", Icon: Landmark },
  ticaret: { label: "Ticaret", Icon: ShoppingBag },
  ulasim: { label: "Ulaşım", Icon: Bus },
  sosyal: { label: "Sosyal", Icon: Coffee },
};

export function PantsirPanel({ listingId }: Props) {
  const [activeTab, setActiveTab] = useState<PantsirPOI["category"]>("saglik");
  const snapshot = useMemo(() => getPantsirSnapshot(listingId), [listingId]);

  const visiblePOIs = snapshot.poiList.filter((p) => p.category === activeTab);

  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-6 flex items-start gap-3">
        <Shield className="h-7 w-7 text-cyan-400" aria-hidden />
        <div>
          <h2 className="text-2xl font-black text-white">İstihbarat Paneli</h2>
          <p className="mt-1 text-sm text-slate-400">
            Konum bazlı çoklu katman değerlendirme — mock veri (R13.4 iskelet). Gerçek API entegrasyonu R13.2'de.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {snapshot.scores.map((s) => (
          <NeighborhoodScoreCard key={s.key} label={s.label} score={s.score} detail={s.detail} />
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-slate-700/40 bg-slate-900/40 p-3 sm:grid-cols-4">
        <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 px-3 py-2">
          <GraduationCap className="h-4 w-4 text-blue-400" />
          <div>
            <div className="text-xs text-slate-400">Okul</div>
            <div className="text-lg font-bold text-white">{snapshot.poiSummary.okul}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 px-3 py-2">
          <Heart className="h-4 w-4 text-red-400" />
          <div>
            <div className="text-xs text-slate-400">Hastane</div>
            <div className="text-lg font-bold text-white">{snapshot.poiSummary.hastane}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 px-3 py-2">
          <ShoppingBag className="h-4 w-4 text-emerald-400" />
          <div>
            <div className="text-xs text-slate-400">Market</div>
            <div className="text-lg font-bold text-white">{snapshot.poiSummary.market}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 px-3 py-2">
          <Bus className="h-4 w-4 text-violet-400" />
          <div>
            <div className="text-xs text-slate-400">Metro</div>
            <div className="text-lg font-bold text-white">{snapshot.poiSummary.metro}</div>
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
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/35" : "text-slate-500 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          );
        })}
      </div>

      <ul className="space-y-2">
        {visiblePOIs.map((poi, idx) => (
          <li
            key={`${poi.name}-${idx}`}
            className="flex items-center justify-between rounded-xl border border-slate-700/30 bg-slate-900/40 px-4 py-3 transition hover:border-cyan-400/30"
          >
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-cyan-400" aria-hidden />
              <span className="text-sm text-slate-200">{poi.name}</span>
            </div>
            <div className="text-xs text-slate-500">
              <span className="rounded bg-slate-800/60 px-2 py-0.5 mr-2 text-slate-300">{poi.direction}</span>
              {poi.distanceM < 1000 ? `${poi.distanceM} m` : `${(poi.distanceM / 1000).toFixed(1)} km`}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <p className="text-[11px] text-amber-200/90 leading-relaxed">
          ⚠️ Bu bilgiler mock veridir. R13.2'de OSM Overpass API ile gerçek POI verisine geçiş yapılacaktır.
          Skorlar bilgilendirme amaçlıdır; resmi MEB/EGM/TÜİK kaynağı değildir.
        </p>
      </div>

      <Activity className="hidden" aria-hidden />
      <Building2 className="hidden" aria-hidden />
    </section>
  );
}

export default PantsirPanel;
