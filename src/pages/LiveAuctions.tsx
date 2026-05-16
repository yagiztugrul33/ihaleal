import { Auctions } from "@/sections/Auctions";

/** Tam sayfa “Canlı İhaleler” — Navbar ile uyumlu; içerik `Auctions` bölümünü kullanır. */
export default function LiveAuctions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pt-16">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Canlı İhaleler</h1>
        <p className="mt-3 text-slate-400 max-w-2xl text-base sm:text-lg leading-relaxed">
          Güncel gayrimenkul ve yatırım fırsatlarına göz atın. AI değerleme çubuğu, güncel teklif ve katılımcı bilgisi ile kartları inceleyin.
        </p>
      </header>
      <Auctions hideIntro layout="page" />
    </div>
  );
}
