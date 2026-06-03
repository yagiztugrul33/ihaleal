import { useEffect, useMemo, useState } from "react";
import { Gift, Megaphone, Timer } from "lucide-react";
import { Link } from "react-router-dom";

type Campaign = {
  id: string;
  title: string;
  subtitle: string;
  endAt: string;
  terms: string[];
};

const campaigns: Campaign[] = [
  {
    id: "zero-commission-first100",
    title: "Sıfır Komisyon İlk 100",
    subtitle: "İlk 100 doğrulanmış işlemde demo komisyon sıfırlama.",
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toISOString(),
    terms: ["KYC tamamlanmış hesap", "Sadece demo kampanya", "Canlı sözleşme öncesi teyit gerekir"],
  },
  {
    id: "new-member-bonus",
    title: "Yeni Üye Bonus Paketi",
    subtitle: "Kayıt + ilk teklif + ilk favori adımlarına bonus puan.",
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    terms: ["Tek hesapla bir kez", "Puanlar temsili", "Finansal taahhüt içermez"],
  },
  {
    id: "seasonal-opportunity",
    title: "Sezonsal Fırsat Haftası",
    subtitle: "Belirli bölgelerde öne çıkan ilan/rapor kampanyası.",
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    terms: ["Bölge bazlı farklılaşabilir", "Demo veriler kullanılır", "Koşullar güncellenebilir"],
  },
];

function remainText(endAt: string, nowMs: number): string {
  const diff = new Date(endAt).getTime() - nowMs;
  if (!Number.isFinite(diff) || diff <= 0) return "Sona erdi";
  const totalMin = Math.floor(diff / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  return `${d}g ${h}s ${m}dk`;
}

export default function CampaignsPage() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const highlighted = useMemo(() => campaigns[0], []);

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-16 pt-24 text-slate-100 lg:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="rounded-2xl border border-fuchsia-400/25 bg-gradient-to-r from-fuchsia-500/15 via-cyan-500/10 to-blue-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-fuchsia-300">Kampanyalar</p>
          <h1 className="mt-1 text-3xl font-black text-white">Promosyon & Kampanya Merkezi</h1>
          <p className="mt-2 text-sm text-slate-300">
            Aktif fırsatları tek ekranda görün, süresi bitmeden aksiyon alın. Kampanya içerikleri demo/temsili olup canlı koşullar sözleşme ile kesinleşir.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { k: "Aktif Kampanya", v: String(campaigns.length) },
              { k: "En Yakın Bitiş", v: remainText(campaigns[1]?.endAt ?? campaigns[0].endAt, now) },
              { k: "Hedef", v: "Daha hızlı dönüşüm" },
            ].map((metric) => (
              <article key={metric.k} className="rounded-xl border border-white/15 bg-slate-900/60 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">{metric.k}</p>
                <p className="mt-1 text-base font-bold text-white">{metric.v}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="inline-flex items-center gap-2 text-lg font-bold">
              <Megaphone className="h-5 w-5 text-cyan-300" />
              Öne Çıkan Kampanya
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              <Timer className="h-3.5 w-3.5" />
              {remainText(highlighted.endAt, now)}
            </span>
          </div>
          <h3 className="mt-2 text-xl font-bold text-white">{highlighted.title}</h3>
          <p className="mt-1 text-sm text-slate-300">{highlighted.subtitle}</p>
          <ul className="mt-3 list-disc space-y-1 ps-5 text-xs text-slate-200">
            <li>Koşulları başvuru öncesi kart detayından okuyun.</li>
            <li>Kampanya kombinasyonu ilan ve kullanıcı tipine göre değişebilir.</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/oduller" className="rounded-lg border border-cyan-300/60 bg-cyan-400/20 px-3 py-2 text-xs font-semibold text-cyan-100">
              Ödül merkezine git
            </Link>
            <Link to="/ihaleler" className="rounded-lg border border-slate-500 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-100">
              İhaleleri incele
            </Link>
            <Link to="/fiyatlandirma" className="rounded-lg border border-fuchsia-300/50 bg-fuchsia-500/10 px-3 py-2 text-xs font-semibold text-fuchsia-100">
              Planları karşılaştır
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-xl border border-slate-600/80 bg-gradient-to-b from-slate-900/80 to-slate-950/70 p-4 transition-transform duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
              <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-300">
                <Gift className="h-4 w-4" />
                Demo Campaign
              </p>
              <h3 className="mt-2 text-lg font-bold text-white">{campaign.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{campaign.subtitle}</p>
              <p className="mt-2 text-xs text-cyan-200">Süre: {remainText(campaign.endAt, now)}</p>
              <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                <p className="text-xs font-semibold text-slate-200">Koşullar</p>
                <ul className="mt-1 space-y-1 text-xs text-slate-400">
                  {campaign.terms.map((term) => (
                    <li key={term}>• {term}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
