import {
  AlertTriangle, Info, MapPin, ShieldCheck, Activity, Mountain, Layers,
} from "lucide-react";
import {
  getZoneRiskData, riskLevelLabel, riskGroupLabel,
  ZONE_RISK_DISCLAIMER, type RiskLevel,
} from "@/data/zoneRiskData";

interface ZoneRiskCardProps {
  province?: string;
  district?: string;
}

/** Risk seviyesi → renk sınıfı */
function levelClass(level: RiskLevel): string {
  switch (level) {
    case "low": return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
    case "medium": return "bg-amber-500/15 text-amber-200 border-amber-500/30";
    case "high": return "bg-orange-500/15 text-orange-200 border-orange-500/30";
    case "very_high": return "bg-rose-500/20 text-rose-200 border-rose-500/40";
    default: return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
}

export function ZoneRiskCard({ province, district }: ZoneRiskCardProps) {
  if (!province) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-400">
        <Info className="inline h-4 w-4 mr-1.5 text-cyan-400" />
        Risk bilgisi için önce <strong>il seçimi</strong> yapın.
      </div>
    );
  }

  const data = getZoneRiskData(province, district);

  // VERİ YOK → dürüst mesaj
  if (!data.known) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3 mb-2">
          <AlertTriangle className="h-5 w-5 text-amber-300 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-100 mb-1">
              Bu bölge için detaylı veri yok
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{data.note}</p>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 mt-2 border-t border-amber-500/20 pt-2">
          <strong>Dürüst sınır:</strong> Uydurma değer gösterilmez. Kesin analiz için parsel zemin etüdü + jeoloji mühendisi şart.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 space-y-3">
      {/* Başlık + kaynak etiketi */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cyan-400" />
            {data.province}
            {data.district && <span className="text-slate-400">/ {data.district}</span>}
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            <strong>Kaynak:</strong> {data.sourceLabel} · <strong>Çözünürlük:</strong> {data.resolution}
          </p>
        </div>
        {data.riskGroup !== undefined && (
          <span className={`text-[10px] font-semibold px-2 py-1 rounded border ${
            data.riskGroup === 1 ? "bg-rose-500/15 text-rose-200 border-rose-500/40"
              : data.riskGroup === 2 ? "bg-orange-500/15 text-orange-200 border-orange-500/40"
              : data.riskGroup === 3 ? "bg-amber-500/15 text-amber-200 border-amber-500/40"
              : "bg-emerald-500/15 text-emerald-200 border-emerald-500/40"
          }`}>
            AFAD Grup {data.riskGroup}
          </span>
        )}
      </div>

      {/* AFAD PGA */}
      {data.approxPgaG !== undefined && (
        <div className="rounded-md border border-slate-700 bg-slate-900/40 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Yaklaşık tepe yer ivmesi (PGA)
            </span>
            <span className="text-sm font-bold text-white">{data.approxPgaG.toFixed(2)} g</span>
          </div>
          <p className="text-[10px] text-slate-500">
            475 yıl dönüş periyodu (yıllık aşılma %10) — TDTH 2018. İl geneli ortalama; saha şartlarına göre değişir.
          </p>
        </div>
      )}

      {/* 3 RİSK KATMANI */}
      <div className="grid sm:grid-cols-3 gap-2">
        <div className={`rounded-md p-2.5 border ${levelClass(data.liquefactionRisk)}`}>
          <p className="text-[10px] uppercase tracking-wider opacity-80 mb-0.5 flex items-center gap-1">
            <Layers className="h-3 w-3" /> Sıvılaşma
          </p>
          <p className="text-sm font-semibold">{riskLevelLabel(data.liquefactionRisk)}</p>
        </div>
        <div className={`rounded-md p-2.5 border ${levelClass(data.landslideRisk)}`}>
          <p className="text-[10px] uppercase tracking-wider opacity-80 mb-0.5 flex items-center gap-1">
            <Mountain className="h-3 w-3" /> Heyelan
          </p>
          <p className="text-sm font-semibold">{riskLevelLabel(data.landslideRisk)}</p>
        </div>
        <div className={`rounded-md p-2.5 border ${levelClass(data.amplificationRisk)}`}>
          <p className="text-[10px] uppercase tracking-wider opacity-80 mb-0.5 flex items-center gap-1">
            <Activity className="h-3 w-3" /> Zemin Büyütme
          </p>
          <p className="text-sm font-semibold">{riskLevelLabel(data.amplificationRisk)}</p>
        </div>
      </div>

      {/* Risk grubu açıklama */}
      {data.riskGroup !== undefined && (
        <p className="text-[11px] text-slate-400">
          <ShieldCheck className="inline h-3 w-3 mr-1" />
          <strong>Risk grubu açıklaması:</strong> {riskGroupLabel(data.riskGroup)}
        </p>
      )}

      {/* Bölge notu */}
      {data.note && (
        <div className="rounded-md border border-cyan-500/30 bg-cyan-500/5 p-2.5">
          <p className="text-xs text-cyan-100 leading-relaxed">
            <Info className="inline h-3.5 w-3.5 mr-1" />
            {data.note}
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-700 pt-2 italic">
        {ZONE_RISK_DISCLAIMER}
      </div>
    </div>
  );
}
