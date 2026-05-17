type Props = {
  quality: "high" | "partial" | "low";
  limitations?: string[];
};

const STYLES = {
  high: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  partial: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  low: "border-red-500/40 bg-red-500/10 text-red-200",
};

const LABELS = {
  high: "Veri kalitesi: Yuksek (PVGIS + iklim + rakim)",
  partial: "Veri kalitesi: Kismi — bazi API kaynaklari eksik",
  low: "Veri kalitesi: Dusuk — bolgesel varsayimlar kullaniliyor",
};

export function DataQualityBadge({ quality, limitations = [] }: Props) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs ${STYLES[quality]}`}>
      <p className="font-semibold">{LABELS[quality]}</p>
      {limitations.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5 opacity-90 list-disc list-inside">
          {limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
