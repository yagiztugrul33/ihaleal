/** Görünür "Demo" rozeti — `docs/DEMO_LABELING.md` Kural 2. Üst bileşen `isDemoData` ile sarmalamalı. */
export function DemoDataCornerBadge() {
  return (
    <span
      className="absolute top-1 end-1 z-10 text-[10px] px-1.5 py-0.5 bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] rounded-[3px]"
      aria-label="Bu veri demo amaçlıdır, gerçek piyasa verisi değildir"
    >
      Demo
    </span>
  );
}
