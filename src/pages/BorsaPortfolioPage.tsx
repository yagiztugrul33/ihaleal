import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  BadgeCheck,
  BadgePercent,
  Building2,
  Clock3,
  Gavel,
  HandCoins,
  History,
  Lock,
  Percent,
  RefreshCw,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { estimatePortfolioTax } from "@/borsa/tax-estimate";
import { formatTry } from "@/lib/valuation/valuationEngine";
import { MASTER_INFO_DISCLAIMER, PHYSICAL_ASSET_ONLY_DISCLAIMER } from "@/legal/platformDisclaimers";
import { FxRef } from "@/components/FxRef";
import { useLocale } from "@/contexts/LocaleContext";
import { Eyebrow } from "@/components/ui/eyebrow";

type PortfolioAsset = {
  id: string;
  title: string;
  purchasedAt: string;
  purchaseTry: number;
  currentTry: number;
  location: string;
  segment: "konut" | "arsa" | "ticari" | "turizm";
};

const MOCK_PORTFOLIO: PortfolioAsset[] = [
  {
    id: "prop-001",
    title: "Kadıköy Merkez 3+1 Daire",
    purchasedAt: "2021-03-10",
    purchaseTry: 6_200_000,
    currentTry: 12_950_000,
    location: "Kadıköy / İstanbul",
    segment: "konut",
  },
  {
    id: "prop-014",
    title: "Çeşme Marina Yakını Arsa",
    purchasedAt: "2018-07-20",
    purchaseTry: 4_750_000,
    currentTry: 18_300_000,
    location: "Çeşme / İzmir",
    segment: "arsa",
  },
  {
    id: "prop-021",
    title: "Maslak A Sınıfı Ofis Katı",
    purchasedAt: "2020-11-18",
    purchaseTry: 14_600_000,
    currentTry: 24_200_000,
    location: "Sarıyer / İstanbul",
    segment: "ticari",
  },
];

const ACTIONS = [
  {
    key: "yeniden_ihale",
    label: "Borsaya Koy",
    icon: Gavel,
    mode: "auction",
    description: "Açık artırma moduna geçirir; rekabetle fiyat keşfi sağlar.",
  },
  {
    key: "sabit_satis",
    label: "Sabit Satış",
    icon: HandCoins,
    mode: "fixed",
    description: "Sabit fiyatla listeleme; teklif yerine doğrudan fiyat gösterilir.",
  },
  {
    key: "kiraya_ver",
    label: "Kiraya Ver",
    icon: Building2,
    mode: "rent",
    description: "Kira odaklı ilana çevirir; kiracı eşleştirme akışını açar.",
  },
  {
    key: "takasa_ac",
    label: "Takas",
    icon: ArrowLeftRight,
    mode: "trade-in",
    description: "Varlığı eşdeğer portföy ile takas senaryosuna alır.",
  },
  {
    key: "devren",
    label: "Devren",
    icon: RefreshCw,
    mode: "transfer",
    description: "Devren satış modeline geçirir; işletme devri odaklı akış açılır.",
  },
] as const;

export default function BorsaPortfolioPage() {
  const { t } = useLocale();
  const b = t.borsa;
  const [confirmAction, setConfirmAction] = useState<{
    asset: PortfolioAsset;
    action: (typeof ACTIONS)[number];
  } | null>(null);

  const totalPurchase = MOCK_PORTFOLIO.reduce((acc, item) => acc + item.purchaseTry, 0);
  const totalCurrent = MOCK_PORTFOLIO.reduce((acc, item) => acc + item.currentTry, 0);
  const pnl = totalCurrent - totalPurchase;
  const pnlPct = totalPurchase > 0 ? (pnl / totalPurchase) * 100 : 0;

  const trendData = [0.82, 0.87, 0.9, 0.93, 0.98, 1.02, 1.06].map((m, i) => ({
    idx: i + 1,
    value: Math.round(totalCurrent * m),
  }));

  const groupedSegments = new Map<string, number>();
  MOCK_PORTFOLIO.forEach((item) => {
    groupedSegments.set(item.segment, (groupedSegments.get(item.segment) ?? 0) + item.currentTry);
  });
  const segmentData = [...groupedSegments.entries()].map(([name, value]) => ({ name, value }));

  const groupedRegions = new Map<string, number>();
  MOCK_PORTFOLIO.forEach((item) => {
    const city = item.location.split("/")[1]?.trim() ?? "Türkiye";
    groupedRegions.set(city, (groupedRegions.get(city) ?? 0) + item.currentTry);
  });
  const regionData = [...groupedRegions.entries()].map(([name, value]) => ({ name, value }));

  return (
    <main className="w-full bg-background px-4 py-6 text-foreground lg:px-8 2xl:px-12">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <section className="grid gap-2 rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3 text-xs text-[var(--metin-ikincil)] md:grid-cols-4">
          <div className="inline-flex items-center gap-1.5 rounded-[3px] border border-[var(--cizgi)] px-2 py-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Escrow korumalı
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-[3px] border border-[var(--cizgi)] px-2 py-1">
            <BadgeCheck className="h-3.5 w-3.5" /> KYC doğrulanmış
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-[3px] border border-[var(--cizgi)] px-2 py-1">
            <ScrollText className="h-3.5 w-3.5" /> {b.auditableLog}
          </div>
          <div className="inline-flex items-center justify-between gap-2 rounded-[3px] border border-[var(--cizgi)] px-2 py-1">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> {b.encrypted}
            </span>
            <Link to="/guvenlik" className="text-[var(--metin)] underline underline-offset-2">
              {b.howSecure}
            </Link>
          </div>
        </section>

        <header className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-4">
          <Eyebrow>{b.portfolioEyebrow}</Eyebrow>
          <h1 className="mt-1 text-2xl font-normal text-foreground">{b.portfolioTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {b.portfolioDesc}
          </p>
          <div className="mt-3 rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin)] px-3 py-2 text-xs text-[var(--metin-ikincil)]">
            <p>{MASTER_INFO_DISCLAIMER}</p>
            <p className="mt-1">{PHYSICAL_ASSET_ONLY_DISCLAIMER}</p>
          </div>
        </header>

        <section className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3 transition hover:border-[var(--metin-ikincil)]">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{b.totalPurchase}</p>
              <p className="mt-1 text-2xl font-normal text-foreground" dir="ltr">{formatTry(totalPurchase)}</p>
              <FxRef amountTry={totalPurchase} variant="block" />
            </article>
            <article className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3 transition hover:border-[var(--metin-ikincil)]">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{b.currentValue}</p>
              <p className="mt-1 text-2xl font-normal text-foreground" dir="ltr">{formatTry(totalCurrent)}</p>
              <FxRef amountTry={totalCurrent} variant="block" />
            </article>
            <article className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3 transition hover:border-[var(--metin-ikincil)]">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{b.pnlLabel}</p>
              <p className="mt-1 text-2xl font-normal" style={{ color: pnl >= 0 ? "var(--metrik-yesil)" : "var(--sinyal-turuncu)" }}>
                {pnl >= 0 ? "+" : ""}
                {formatTry(pnl)} ({pnlPct.toFixed(1)}%)
              </p>
              <FxRef amountTry={pnl} variant="block" />
            </article>
          </div>
          <article className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
            <p className="text-[11px] font-normal uppercase tracking-[0.14em] text-[var(--metin-ikincil)]">{b.portfolioTrend}</p>
            <div className="mt-2 h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <Tooltip formatter={(value: number) => [formatTry(value), b.tooltipValue]} labelFormatter={(label) => `${b.periodPrefix} ${label}`} />
                  <Line dataKey="value" stroke="#eeeeee" strokeWidth={2.3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <article className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
            <p className="text-[11px] font-normal uppercase tracking-[0.14em] text-[var(--metin-ikincil)]">{b.distributionSegment}</p>
            <div className="mt-2 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={segmentData} dataKey="value" nameKey="name" outerRadius={78} fill="#8a8380" />
                  <Tooltip formatter={(value: number) => formatTry(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
              {segmentData.map((item) => (
                <span key={item.name} className="rounded-[3px] border border-border bg-secondary px-2 py-1">
                  {item.name.toLocaleUpperCase("tr-TR")}: {formatTry(item.value)}
                </span>
              ))}
            </div>
          </article>
          <article className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
            <p className="text-[11px] font-normal uppercase tracking-[0.14em] text-[var(--metin-ikincil)]">{b.distributionRegion}</p>
            <div className="mt-2 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={regionData} dataKey="value" nameKey="name" outerRadius={78} fill="#c7c2be" />
                  <Tooltip formatter={(value: number) => formatTry(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
              {regionData.map((item) => (
                <span key={item.name} className="rounded-[3px] border border-border bg-secondary px-2 py-1">
                  {item.name}: {formatTry(item.value)}
                </span>
              ))}
            </div>
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
            const perf = asset.currentTry - asset.purchaseTry;
            const perfPct = (perf / Math.max(1, asset.purchaseTry)) * 100;

            return (
              <article key={asset.id} className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3 transition hover:border-[var(--metin-ikincil)]">
                <div className="grid gap-3 lg:grid-cols-[90px_minmax(0,1fr)]">
                  <div className="flex h-20 items-center justify-center rounded-[10px] border border-border bg-secondary text-[var(--metin-ikincil)]">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-normal text-foreground">{asset.title}</h2>
                        <p className="text-sm text-muted-foreground">{asset.location}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-[3px] border border-[var(--cizgi)] px-2 py-0.5 text-[11px]" style={{ color: "var(--metrik-yesil)" }}>
                          <BadgeCheck className="h-3 w-3" /> {b.verified}
                        </span>
                        <Link
                          to={`/ilan/${asset.id}`}
                          className="rounded-[3px] border border-[var(--cizgi)] px-3 py-1.5 text-xs font-normal text-[var(--metin)] hover:bg-[var(--zemin)]"
                        >
                          Mülk Pasaportu
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-[10px] border border-border bg-secondary p-2 text-xs text-slate-300">
                        Alış: <strong className="text-white">{formatTry(asset.purchaseTry)}</strong>
                      </div>
                      <div className="rounded-[10px] border border-border bg-secondary p-2 text-xs text-slate-300">
                        Güncel: <strong className="text-white">{formatTry(asset.currentTry)}</strong>
                      </div>
                      <div className="rounded-[10px] border border-border bg-secondary p-2 text-xs">
                        <span className="text-slate-300">Performans: </span>
                        <strong style={{ color: perf >= 0 ? "var(--metrik-yesil)" : "var(--sinyal-turuncu)" }}>
                          {perf >= 0 ? "+" : ""}
                          {formatTry(perf)} ({perfPct.toFixed(1)}%)
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-5">
                  {ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.key}
                        type="button"
                        title={action.description}
                        onClick={() => setConfirmAction({ asset, action })}
                        className="inline-flex items-center justify-center gap-2 rounded-[3px] border border-border bg-secondary px-2 py-2 text-xs font-normal text-muted-foreground hover:border-[var(--metin-ikincil)] hover:text-[var(--metin)]"
                      >
                        <Icon className="h-3.5 w-3.5" /> {action.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Tek mod kuralı: <strong className="text-slate-200">Borsaya Koy</strong> seçildiğinde açık artırma akışı önceliklenir.
                </p>

                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  <div className="rounded-[10px] border border-border bg-secondary/80 p-3 text-sm">
                    <p className="mb-1 flex items-center gap-1 font-normal text-foreground">
                      <Percent className="h-3.5 w-3.5 text-[var(--metin-ikincil)]" /> Vergi Ön Hesap
                    </p>
                    <p className="text-muted-foreground">Elde tutma: {tax.yearsHeld.toFixed(1)} yıl</p>
                    <p className="text-muted-foreground">Tapu harcı (%4): {formatTry(tax.titleDeedFeeTry)}</p>
                    <p className="text-muted-foreground">Değer artışı vergisi (tahmini): {formatTry(tax.estimatedValueGainTaxTry)}</p>
                    <p className="mt-1 text-[11px] text-[var(--metin-ikincil)]">Not: Mali müşavire danışın.</p>
                  </div>
                  <div className="rounded-[10px] border border-slate-700 bg-slate-950/60 p-3 text-sm">
                    <p className="mb-1 flex items-center gap-1 font-normal text-white">
                      <History className="h-3.5 w-3.5 text-[var(--metin-ikincil)]" /> İşlem Geçmişi
                    </p>
                    <ul className="space-y-1 text-slate-300">
                      <li>03.04.2026 · Değer güncellemesi</li>
                      <li>17.03.2026 · Varlık pasaportu doğrulaması</li>
                      <li>11.03.2026 · Belge paketi yenilendi</li>
                    </ul>
                  </div>
                  <div className="rounded-[10px] border border-slate-700 bg-slate-950/60 p-3 text-sm">
                    <p className="mb-1 flex items-center gap-1 font-normal text-white">
                      <ScrollText className="h-3.5 w-3.5 text-[var(--metin-ikincil)]" /> Mülk Pasaportu
                    </p>
                    <p className="text-slate-300">Durum: Doğrulandı · Kayıt no: {asset.id.toUpperCase()}</p>
                    <p className="text-slate-300">Son denetim: 5 gün önce</p>
                    <span className="mt-1 inline-flex rounded-[3px] border border-[var(--cizgi)] px-2 py-0.5 text-[11px]" style={{ color: "var(--metrik-yesil)" }}>
                      Kurumsal uyum tamam
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
          <p className="mb-1 flex items-center gap-2 text-sm font-normal text-white">
            <BadgePercent className="h-4 w-4 text-[var(--metin-ikincil)]" /> Fraksiyonel / Paylı Mülkiyet
          </p>
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-[3px] border border-slate-600 bg-slate-950/70 px-3 py-2 text-xs text-slate-400"
          >
            Yakında (yasal düzenleme sonrası)
          </button>
        </section>

        <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
          <Clock3 className="h-3.5 w-3.5" />
          Mock portföy verisi · canlıya çıkmadan önce hukuk + mali müşavir onayı gereklidir.
        </div>
      </div>

      {confirmAction ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4">
          <div className="w-full max-w-lg rounded-[10px] border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--metin-ikincil)]">Aksiyon Onayı</p>
            <h3 className="mt-1 text-lg font-normal text-foreground">
              {confirmAction.action.label} · {confirmAction.asset.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{confirmAction.action.description}</p>
            <p className="mt-2 text-xs text-[var(--metin-ikincil)]">
              Bu adım demo yönlendirme üretir; çekirdek ödeme/escrow/KYC akışı değiştirilmez.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-[3px] border border-slate-600 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300"
              >
                Vazgeç
              </button>
              <Link
                to={`/ihale-ac?source=portfoy&asset=${confirmAction.asset.id}&mode=${confirmAction.action.mode}`}
                className="rounded-[3px] border border-[var(--cizgi)] px-3 py-1.5 text-xs font-normal text-[var(--metin)] hover:bg-[var(--zemin-yumusak)]"
                onClick={() => setConfirmAction(null)}
              >
                Akışı Başlat
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
