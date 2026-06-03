/** Görünür "Demo" rozeti — `docs/DEMO_LABELING.md` Kural 2. Üst bileşen `isDemoData` ile sarmalamalı. */
export function DemoDataCornerBadge() {
  return (
    <span
      className="absolute top-1 end-1 z-10 text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded"
      aria-label="Bu veri demo amaçlıdır, gerçek piyasa verisi değildir"
    >
      Demo
    </span>
  );
}
