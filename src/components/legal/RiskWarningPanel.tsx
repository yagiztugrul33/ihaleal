import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, Info, AlertOctagon, CheckSquare, BookOpen, ChevronRight,
} from "lucide-react";
import {
  detectWarnings, severityColor, severityLabel,
  type ListingContext, type WarningSeverity,
} from "@/lib/legal/riskWarnings";

interface RiskWarningPanelProps {
  context: ListingContext;
  /** Header'ı sade tutar (form içine küçük gömme) */
  compact?: boolean;
  /** Sonuç boş ise hiç gösterme */
  hideIfEmpty?: boolean;
}

function severityIcon(s: WarningSeverity) {
  if (s === "info") return Info;
  if (s === "uyari") return AlertTriangle;
  return AlertOctagon;
}

function severityCls(s: WarningSeverity) {
  return {
    info: {
      border: "border-[var(--cizgi)]",
      bg: "bg-[var(--zemin-yumusak)]",
      text: "text-[var(--metin-ikincil)]",
      pill: "bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] border-[var(--cizgi)]",
    },
    uyari: {
      border: "border-[var(--cizgi)]",
      bg: "bg-[var(--zemin-yumusak)]",
      text: "text-[var(--metin-ikincil)]",
      pill: "bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] border-[var(--cizgi)]",
    },
    kritik: {
      border: "border-[var(--cizgi)]",
      bg: "bg-[var(--zemin-yumusak)]",
      text: "text-[var(--metin-ikincil)]",
      pill: "bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] border-[var(--cizgi)]",
    },
  }[s];
}

export function RiskWarningPanel({ context, compact, hideIfEmpty }: RiskWarningPanelProps) {
  const navigate = useNavigate();
  const warnings = useMemo(() => detectWarnings(context), [context]);

  if (warnings.length === 0) {
    if (hideIfEmpty) return null;
    return (
      <div className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3 flex items-start gap-2 text-sm">
        <Info className="h-4 w-4 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
        <p className="text-[var(--metin-ikincil)]">
          Mevcut bilgilere göre <strong>özel hukuki risk uyarısı yok</strong>.
          Tüm satım işlemlerinde noter onayı + tapu kontrolü standart şarttır.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${compact ? "" : "rounded-[20px] border border-slate-700 bg-slate-900/40 p-4"}`}>
      {!compact ? (
        <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
          <AlertTriangle className="h-5 w-5 text-[var(--metin-ikincil)]" />
          <h3 className="text-base font-normal text-white">
            Hukuki Risk Uyarıları ({warnings.length})
          </h3>
          <span className="ms-auto text-[10px] text-slate-500">İşlemi engellemez · bilgilendirir</span>
        </div>
      ) : null}

      {warnings.map((w) => {
        const Icon = severityIcon(w.severity);
        const cls = severityCls(w.severity);
        return (
          <div
            key={w.id}
            className={`rounded-[20px] border ${cls.border} ${cls.bg} p-4`}
            data-testid={`risk-warning-${w.id}`}
          >
            <div className="flex items-start gap-3 mb-2">
              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${cls.text}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="text-sm font-normal text-white">{w.baslik}</h4>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-normal ${cls.pill}`}>
                    {severityLabel(w.severity)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{w.aciklama}</p>
              </div>
            </div>

            <div className="ms-8 mt-2 space-y-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                Yapılacaklar Listesi
              </p>
              <ul className="space-y-1 text-xs">
                {w.checklist.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <ChevronRight className="rtl:rotate-180 h-3 w-3 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>

              {w.belgeNotu ? (
                <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-700/50">
                  📎 {w.belgeNotu}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700/50">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${cls.pill}`}>
                  📜 {w.mevzuat}
                </span>
                {w.cozucuLink ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/arastirma/hukuki-cozucu?senaryo=${w.cozucuLink}`)}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-2 py-0.5 text-[10px] text-[var(--metin-ikincil)] hover:bg-[var(--zemin-yumusak)]"
                  >
                    <BookOpen className="h-2.5 w-2.5" />
                    Hukuki Çözücüde detay
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}

      <p className="text-[10px] text-slate-500 italic pt-2 border-t border-slate-700/50">
        ⚠️ Bu uyarılar EĞİTİCİ niteliktedir; somut karar öncesi avukat + noter zorunlu (Avukatlık Kanunu 1136 m. 35).
        İhaleal işlemi durdurmaz, sadece bilgilendirir.
      </p>
    </div>
  );
}
