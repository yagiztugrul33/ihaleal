/** Tam sayfa veya blok yükleme göstergesi — tema ile uyumlu. */
export function PageLoader({ label = "Yükleniyor..." }: { label?: string }) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 py-16">
      <div className="w-12 h-12 rounded-full border-4 border-[var(--cizgi)] border-t-transparent animate-spin" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
