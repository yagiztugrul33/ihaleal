import { Link } from "react-router-dom";
import PremiumCinematicHome from "@/sections/PremiumCinematicHome";

export default function Home() {
  return (
    <>
      <PremiumCinematicHome />
      <section className="px-4 py-14">
        <div className="mx-auto max-w-6xl rounded-2xl border border-cyan-500/25 bg-slate-900/60 p-6">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Gayrimenkul borsası: ilk adım paneli</h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
            Güçlü hero + değer önerisi + güven + modül kartları tek yerde. Bu katman, yatırımcı/arsa sahibi/danışman akışını hızlı başlatmak için eklendi.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Link to="/borsa" className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">Borsa terminali</Link>
            <Link to="/degerleme" className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">AI değerleme</Link>
            <Link to="/modul/deprem-risk-haritasi" className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">Deprem risk</Link>
            <Link to="/arastirma/ges" className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">GES analizi</Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Dürüst sınır: Modüller ön analiz sağlar; resmi ekspertiz, hukuk ve finans onayı olmadan bağlayıcı işlem yapılmaz.
          </p>
        </div>
      </section>
    </>
  );
}
