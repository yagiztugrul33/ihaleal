import { Link } from "react-router-dom";
import { ArrowLeftRight, BadgePercent, Building2, Clock3, Gavel, HandCoins, History, Percent, RefreshCw, ScrollText } from "lucide-react";
import { estimatePortfolioTax } from "@/borsa/tax-estimate";
import { formatTry } from "@/lib/valuation/valuationEngine";
import { MASTER_INFO_DISCLAIMER, PHYSICAL_ASSET_ONLY_DISCLAIMER } from "@/legal/platformDisclaimers";

type PortfolioAsset = {
  id: string;
  title: string;
  purchasedAt: string;
  purchaseTry: number;
  currentTry: number;
  location: string;
};

const MOCK_PORTFOLIO: PortfolioAsset[] = [
  {
    id: "prop-001",
    title: "Kadıköy Merkez 3+1 Daire",
    purchasedAt: "2021-03-10",
    purchaseTry: 6_200_000,
    currentTry: 12_950_000,
    location: "Kadıköy / İstanbul",
  },
  {
    id: "prop-014",
    title: "Çeşme Marina Yakını Arsa",
    purchasedAt: "2018-07-20",
    purchaseTry: 4_750_000,
    currentTry: 18_300_000,
    location: "Çeşme / İzmir",
  },
];

const ACTIONS = [
  { key: "yeniden_ihale", label: "Yeniden İhale", icon: Gavel, mode: "auction" },
  { key: "sabit_satis", label: "Sabit Satış", icon: HandCoins, mode: "fixed" },
  { key: "kiraya_ver", label: "Kiraya Ver", icon: Building2, mode: "rent" },
  { key: "takasa_ac", label: "Takasa Aç", icon: ArrowLeftRight, mode: "trade-in" },
  { key: "devren", label: "Devren", icon: RefreshCw, mode: "transfer" },
] as const;

export default function BorsaPortfolioPage() {
  const totalPurchase = MOCK_PORTFOLIO.reduce((acc, item) => acc + item.purchaseTry, 0);
  const totalCurrent = MOCK_PORTFOLIO.reduce((acc, item) => acc + item.currentTry, 0);
  const pnl = totalCurrent - totalPurchase;
  const pnlPct = totalPurchase > 0 ? (pnl / totalPurchase) * 100 : 0;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <header className="rounded-2xl border border-slate-700/70 bg-slate-900/65 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Borsa Portföy</p>
          <h1 className="mt-1 text-2xl font-black text-white">Varlık Döngüsü ve Portföy Yönetimi</h1>
          <p className="mt-2 text-sm text-slate-300">
            Portföydeki fiziksel taşınmaz varlıklarınızı yeniden ihale, sabit satış, kiralama, takas ve devren akışlarına ön dolu olarak
            yönlendirebilirsiniz.
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            <p>{MASTER_INFO_DISCLAIMER}</p>
            <p className="mt-1">{PHYSICAL_ASSET_ONLY_DISCLAIMER}</p>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Portföy Alış</p>
            <p className="mt-1 text-2xl font-black text-white">{formatTry(totalPurchase)}</p>
          </article>
          <article className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Güncel Değer</p>
            <p className="mt-1 text-2xl font-black text-white">{formatTry(totalCurrent)}</p>
          </article>
          <article className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">K/Z</p>
            <p className={`mt-1 text-2xl font-black ${pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {pnl >= 0 ? "+" : ""}
              {formatTry(pnl)} ({pnlPct.toFixed(1)}%)
            </p>
          </article>
        </section>

        <section className="space-y-4">
          {MOCK_PORTFOLIO.map((asset) => {
            const tax = estimatePortfolioTax({
              purchaseTry: asset.purchaseTry,
              currentTry: asset.currentTry,
              purchasedAt: asset.purchasedAt,
              sellMode: "yeniden_ihale",
            });

            return (
              <article key={asset.id} className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-white">{asset.title}</h2>
                    <p className="text-sm text-slate-400">{asset.location}</p>
                  </div>
                  <Link
                    to={`/ilan/${asset.id}`}
                    className="rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"
                  >
                    Mülk Pasaportu
                  </Link>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-5">
                  {ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={action.key}
                        to={`/ihale-ac?source=portfoy&asset=${asset.id}&mode=${action.mode}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-950/70 px-2 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400/60 hover:text-cyan-100"
                      >
                        <Icon className="h-3.5 w-3.5" /> {action.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
                    <p className="mb-1 flex items-center gap-1 font-semibold text-white">
                      <Percent className="h-3.5 w-3.5 text-cyan-300" /> Vergi Ön Hesap
                    </p>
                    <p className="text-slate-300">Elde tutma: {tax.yearsHeld.toFixed(1)} yıl</p>
                    <p className="text-slate-300">Tapu harcı (%4): {formatTry(tax.titleDeedFeeTry)}</p>
                    <p className="text-slate-300">Değer artışı vergisi (tahmini): {formatTry(tax.estimatedValueGainTaxTry)}</p>
                    <p className="mt-1 text-[11px] text-amber-200">Not: Mali müşavire danışın.</p>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
                    <p className="mb-1 flex items-center gap-1 font-semibold text-white">
                      <History className="h-3.5 w-3.5 text-cyan-300" /> İşlem Geçmişi
                    </p>
                    <ul className="space-y-1 text-slate-300">
                      <li>03.04.2026 · Teklif güncellemesi</li>
                      <li>17.03.2026 · Tekrar-indirim rozeti eklendi</li>
                      <li>11.03.2026 · Evrak güncellemesi tamamlandı</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
                    <p className="mb-1 flex items-center gap-1 font-semibold text-white">
                      <ScrollText className="h-3.5 w-3.5 text-cyan-300" /> Mülk Pasaportu
                    </p>
                    <p className="text-slate-300">Durum: Doğrulandı · Kayıt no: {asset.id.toUpperCase()}</p>
                    <p className="text-slate-300">Son denetim: 5 gün önce</p>
                    <span className="mt-1 inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200">
                      Tekrar-indirim uygun
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
            <BadgePercent className="h-4 w-4 text-cyan-300" /> Fraksiyonel / Paylı Mülkiyet
          </p>
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-600 bg-slate-950/70 px-3 py-2 text-xs text-slate-400"
          >
            Yakında (yasal düzenleme sonrası)
          </button>
        </section>

        <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
          <Clock3 className="h-3.5 w-3.5" />
          Mock portföy verisi · canlıya çıkmadan önce hukuk + mali müşavir onayı gereklidir.
        </div>
      </div>
    </main>
  );
}
