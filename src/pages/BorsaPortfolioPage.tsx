import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, Landmark, Percent, Repeat2 } from "lucide-react";
import { BorsaShell } from "@/borsa/BorsaShell";
import { estimateTax } from "@/borsa/tax-estimate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PortfolioAsset = {
  id: string;
  code: string;
  title: string;
  acquiredAt: string;
  buyPrice: number;
  aiValue: number;
  ownershipHistory: Array<{ year: string; text: string; value: number }>;
};

const ASSETS: PortfolioAsset[] = [
  {
    id: "1",
    code: "KADIKÖY-D",
    title: "Kadikoy merkez daire",
    acquiredAt: "2021-06-12",
    buyPrice: 7_300_000,
    aiValue: 12_980_000,
    ownershipHistory: [
      { year: "2019", text: "Ilk satis", value: 4_900_000 },
      { year: "2021", text: "Ihaleal satin alimi", value: 7_300_000 },
      { year: "2026", text: "AI guncel deger", value: 12_980_000 },
    ],
  },
  {
    id: "2",
    code: "ÇEŞME-A",
    title: "Cesme arsa",
    acquiredAt: "2023-03-03",
    buyPrice: 13_450_000,
    aiValue: 18_600_000,
    ownershipHistory: [
      { year: "2018", text: "Tarla devri", value: 4_200_000 },
      { year: "2023", text: "Ihaleal satin alimi", value: 13_450_000 },
      { year: "2026", text: "AI guncel deger", value: 18_600_000 },
    ],
  },
  {
    id: "3",
    code: "LEVENT-O",
    title: "Levent ofis",
    acquiredAt: "2019-01-18",
    buyPrice: 34_200_000,
    aiValue: 41_300_000,
    ownershipHistory: [
      { year: "2017", text: "Sirket devri", value: 20_200_000 },
      { year: "2019", text: "Ihaleal satin alimi", value: 34_200_000 },
      { year: "2026", text: "AI guncel deger", value: 41_300_000 },
    ],
  },
];

function formatTry(value: number): string {
  return `₺${Math.round(value).toLocaleString("tr-TR")}`;
}

export default function BorsaPortfolioPage() {
  const buyTotal = ASSETS.reduce((acc, x) => acc + x.buyPrice, 0);
  const aiTotal = ASSETS.reduce((acc, x) => acc + x.aiValue, 0);
  const gainPct = ((aiTotal - buyTotal) / Math.max(1, buyTotal)) * 100;

  return (
    <BorsaShell activeTab="portfoy" title="Portföy Terminali">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="borsa-card rounded-xl p-3">
          <p className="text-xs uppercase tracking-[0.13em] text-slate-400">Toplam Alis</p>
          <p className="mt-1 text-2xl font-black text-white">{formatTry(buyTotal)}</p>
        </div>
        <div className="borsa-card rounded-xl p-3">
          <p className="text-xs uppercase tracking-[0.13em] text-slate-400">Guncel AI Degeri</p>
          <p className="mt-1 text-2xl font-black text-cyan-200">{formatTry(aiTotal)}</p>
        </div>
        <div className="borsa-card rounded-xl p-3">
          <p className="text-xs uppercase tracking-[0.13em] text-slate-400">Getiri</p>
          <p className={cn("mt-1 text-2xl font-black", gainPct >= 0 ? "text-emerald-300" : "text-rose-300")}>
            {gainPct >= 0 ? "+" : ""}
            {gainPct.toFixed(2)}%
          </p>
        </div>
      </section>

      <section className="space-y-3">
        {ASSETS.map((asset) => {
          const tax = estimateTax({
            acquisitionDate: asset.acquiredAt,
            buyPrice: asset.buyPrice,
            currentValue: asset.aiValue,
          });
          const growthPct = ((asset.aiValue - asset.buyPrice) / Math.max(1, asset.buyPrice)) * 100;
          return (
            <article key={asset.id} className="borsa-card rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-cyan-200">{asset.code}</p>
                  <h2 className="text-lg font-black text-white">{asset.title}</h2>
                  <p className="text-xs text-slate-400">Alis: {new Date(asset.acquiredAt).toLocaleDateString("tr-TR")}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Alis {formatTry(asset.buyPrice)}</p>
                  <p className="text-sm font-semibold text-cyan-200">AI {formatTry(asset.aiValue)}</p>
                  <p className={cn("text-sm font-bold", growthPct >= 0 ? "text-emerald-300" : "text-rose-300")}>
                    Deger Artisi {growthPct >= 0 ? "+" : ""}
                    {growthPct.toFixed(2)}%
                  </p>
                  <p className="mt-1 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                    Tekrar-indirim: %1.5
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-5">
                {[
                  { key: "yeniden-ihale", label: "Yeniden Ihale" },
                  { key: "sabit-sat", label: "Sabit Sat" },
                  { key: "kiraya-ver", label: "Kiraya Ver" },
                  { key: "takasa-ac", label: "Takasa Ac" },
                  { key: "devren", label: "Devren" },
                ].map((action) => (
                  <Button key={action.key} asChild variant="outline" className="border-slate-600 bg-slate-900/70 text-slate-200">
                    <Link
                      to={`/ihale-ac?source=borsa&asset=${asset.id}&action=${action.key}&price=${asset.aiValue}`}
                      className="justify-between"
                    >
                      {action.label} <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                ))}
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                    <Percent className="h-3.5 w-3.5" /> Vergi On-Hesap
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className={tax.fiveYearExempt ? "text-emerald-300" : "text-amber-300"}>
                      {tax.fiveYearExempt
                        ? "5 yil muafiyet kosulu saglandi."
                        : `${tax.monthsUntilExempt} ay sonra 5 yil muafiyet kosulu dolacak.`}
                    </p>
                    <p className="text-slate-300">Deger artisi: {formatTry(tax.valueGain)}</p>
                    <p className="text-slate-300">Tahmini deger artis vergisi: {formatTry(tax.estimatedValueGainTax)}</p>
                    <p className="text-slate-300">Tapu harci (%4): {formatTry(tax.deedDuty)}</p>
                    {tax.swapWarning ? <p className="text-amber-200">{tax.swapWarning}</p> : null}
                    <p className="text-[11px] text-slate-500">Tahmini hesap: mali musavire danisin.</p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Islem Gecmisi / Mulk Pasaportu</p>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {asset.ownershipHistory.map((entry) => (
                      <p key={`${asset.id}-${entry.year}`}>
                        {entry.year}: {entry.text} - {formatTry(entry.value)}
                      </p>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded border border-slate-700 px-2 py-1">Tapu ozeti</div>
                    <div className="rounded border border-slate-700 px-2 py-1">Imar belgesi</div>
                    <div className="rounded border border-slate-700 px-2 py-1">Deprem raporu</div>
                    <div className="rounded border border-slate-700 px-2 py-1">Ekspertiz dosyasi</div>
                  </div>
                  <Button asChild variant="ghost" className="mt-2 h-8 px-2 text-cyan-200">
                    <Link to={`/ilan/${asset.id}`}>
                      <FileText className="mr-1.5 h-3.5 w-3.5" /> Mulk pasaportunu ac
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="borsa-card rounded-xl p-3 text-xs text-slate-300">
        <p className="mb-1 inline-flex items-center gap-2 font-semibold text-cyan-200">
          <Landmark className="h-3.5 w-3.5" /> Portfoy dongusu notu
        </p>
        <p>
          Portfoydeki varliklarin yeniden ihale, sabit satis, kiraya verme, takas ve devren akislarina gecisi mevcut ilan olusturma akisini on-dolu parametrelerle cagirir.
        </p>
        <p className="mt-1 inline-flex items-center gap-2 text-emerald-200">
          <Repeat2 className="h-3.5 w-3.5" /> Ihaleal tekrar satis indirimi: %1.5 gosterimi aktif.
        </p>
      </section>
    </BorsaShell>
  );
}
