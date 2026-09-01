type Props = {
  quality: "high" | "partial" | "low";
  limitations?: string[];
};

const STYLES = {
  high: "border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]",
  partial: "border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]",
  low: "border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]",
};

const LABELS = {
  high: "Veri kalitesi: Yuksek (PVGIS + iklim + rakim)",
  partial: "Veri kalitesi: Kismi — bazi API kaynaklari eksik",
  low: "Veri kalitesi: Dusuk — bolgesel varsayimlar kullaniliyor",
};

export function DataQualityBadge({ quality, limitations = [] }: Props) {
  return (
    <div className={`rounded-[10px] border px-3 py-2 text-xs ${STYLES[quality]}`}>
      <p className="font-normal">{LABELS[quality]}</p>
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
