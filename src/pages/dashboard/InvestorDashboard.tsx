import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, TrendingUp, Target, MapPin, Wallet, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AUCTIONS } from "@/data/auctions";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { useFavorites } from "@/hooks/useFavorites";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartPanel,
  DashboardShell,
  EmptyState,
  MetricCard,
  CHART_COLORS,
  chartAxisFontSize,
  chartAxisStroke,
  chartGridStroke,
  chartTooltipStyle,
} from "@/components/enterprise";
import {
  INVESTOR_DEMO_OFFERS,
  INVESTOR_DEMO_WATCHLIST,
  INVESTOR_DEMO_TAX,
} from "@/data/portalDemo";

const INVESTOR_WORKFLOW = [
  {
    step: "1) Tarama ve kısa liste",
    detail: "İlanlar favoriye alınır, fiyat/risk/getiri eşikleriyle ilk filtreleme yapılır.",
  },
  {
    step: "2) Çoklu modül doğrulama",
    detail: "Değerleme, deprem, GES ve konum sinyalleri birlikte okunur.",
  },
  {
    step: "3) Teklif ve kapanış hazırlığı",
    detail: "Seçilen varlık için teklif aksiyonu başlatılır; evrak ve vergi ön notu tamamlanır.",
  },
] as const;

const INVESTOR_ACTIONS = [
  { label: "İlanları keşfet", to: "/ilanlar" },
  { label: "AI değerleme", to: "/degerleme" },
  { label: "Parsel zekası", to: "/modul/parsel-zekasi" },
  { label: "Borsa terminali", to: "/borsa" },
] as const;

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.05);
  const { favorites } = useFavorites();

  const favoriteAuctions = useMemo(() => AUCTIONS.filter((a) => favorites.includes(a.id)), [favorites]);

  const portfolioValue = favoriteAuctions.reduce((sum, a) => sum + a.currentBid, 0);
  const predictedValue = favoriteAuctions.reduce((sum, a) => sum + a.aiPredictedPrice, 0);
  const avgYield =
    favoriteAuctions.length > 0
      ? favoriteAuctions.reduce((sum, a) => sum + a.areaStats.rentalYield, 0) / favoriteAuctions.length
      : 0;
  const potentialGain = predictedValue - portfolioValue;
  const potentialGainPercent = portfolioValue > 0 ? ((potentialGain / portfolioValue) * 100).toFixed(1) : "0";

  const yieldData = useMemo(
    () => favoriteAuctions.map((a) => ({ name: a.district, yield: a.areaStats.rentalYield, score: a.investmentScore })),
    [favoriteAuctions],
  );

  const pieData = useMemo(() => {
    const typeMap = new Map<string, number>();
    favoriteAuctions.forEach((a) => {
      typeMap.set(a.category, (typeMap.get(a.category) || 0) + a.currentBid);
    });
    return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value: Math.round(value / 1000000) }));
  }, [favoriteAuctions]);

  const priceHistory = useMemo(() => {
    if (favoriteAuctions.length === 0) return [];
    const months = ["Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas"];
    return months.map((m, i) => {
      const base = portfolioValue;
      const growth = base * (0.015 * (i + 1));
      return { month: m, value: Math.round((base + growth) / 1000000) };
    });
  }, [portfolioValue, favoriteAuctions.length]);

  return (
    <div ref={ref}>
      <DashboardShell
        badge="Yatırımcı"
        title="Yatırımcı paneli"
        subtitle="Portföy performansı, AI tahminleri ve dağılım analitiği (demo veri)."
        back={
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2 text-slate-400">
            <ArrowLeft className="w-4 h-4" /> Panele dön
          </Button>
        }
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/analiz")} className="gap-2">
            <LayoutDashboard className="w-4 h-4" /> Piyasa analizi
          </Button>
        }
      >
        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
            <h2 className="text-sm font-semibold text-cyan-100">Neden bu panel?</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-200">
              Portföy, teklif, vergi ve risk özetini tek akışta toplar; yatırım kararını modüller arasında bölmez.
            </p>
          </article>
          <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <h2 className="text-sm font-semibold text-emerald-100">Araç seti</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-200">
              AI değerleme, GES, borsa ve deprem modülleri bağlı çalışır.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <button type="button" onClick={() => navigate("/degerleme")} className="rounded-full border border-emerald-300/50 px-2 py-0.5 text-emerald-100">AI değerleme</button>
              <button type="button" onClick={() => navigate("/arastirma/ges")} className="rounded-full border border-emerald-300/50 px-2 py-0.5 text-emerald-100">GES</button>
              <button type="button" onClick={() => navigate("/borsa")} className="rounded-full border border-emerald-300/50 px-2 py-0.5 text-emerald-100">Borsa</button>
              <button type="button" onClick={() => navigate("/modul/deprem-risk-haritasi")} className="rounded-full border border-emerald-300/50 px-2 py-0.5 text-emerald-100">Deprem</button>
            </div>
          </article>
          <article className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
            <h2 className="text-sm font-semibold text-violet-100">Örnek senaryo</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-200">
              Yatırımcı aynı gün değerleme, deprem ve GES analiziyle fırsatı puanlayıp borsa teklifine geçer.
            </p>
          </article>
        </section>
        <section className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-bold text-white">Nasıl çalışır?</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
            <article className="rounded-lg border border-white/10 p-3">
              <p className="font-semibold text-slate-100">1) Fırsat seçimi</p>
              <p className="mt-1 text-slate-400">İlanı favoriye al, değerleme/risk katmanını birlikte oku.</p>
            </article>
            <article className="rounded-lg border border-white/10 p-3">
              <p className="font-semibold text-slate-100">2) Senaryo analizi</p>
              <p className="mt-1 text-slate-400">Getiri, vergi ve konum verisini tek panelde kıyasla.</p>
            </article>
            <article className="rounded-lg border border-white/10 p-3">
              <p className="font-semibold text-slate-100">3) Teklif aksiyonu</p>
              <p className="mt-1 text-slate-400">Borsa/teklif adımına geç, karar zincirini kayıt altında tut.</p>
            </article>
          </div>
        </section>
        <section className="mb-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-lg font-bold text-white">Rol bazlı yatırım iş akışı</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {INVESTOR_WORKFLOW.map((item) => (
                <li key={item.step} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="font-semibold text-slate-100">{item.step}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <h2 className="text-lg font-bold text-emerald-100">Bağlı araç aksiyon panosu</h2>
            <p className="mt-2 text-sm text-slate-200">
              Karar öncesi kullanılan temel araçlar tek yerde toplanır; modüller arası geçişte bağlam kaybı azaltılır.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {INVESTOR_ACTIONS.map((action) => (
                <Button key={action.label} size="sm" variant="outline" onClick={() => navigate(action.to)} className="justify-start">
                  {action.label}
                </Button>
              ))}
            </div>
          </article>
        </section>

        {favoriteAuctions.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Portföyünüz boş"
            description="İlanları inceleyip favorilere ekleyerek kurumsal portföy görünümünüzü oluşturun."
            action={
              <Button onClick={() => navigate("/ilanlar")} className="btn-primary">
                İlanları keşfet
              </Button>
            }
          />
        ) : (
          <div
            className={`space-y-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricCard
                label="Portföy değeri"
                value={`₺${(portfolioValue / 1_000_000).toFixed(1)}M`}
                hint={`${favoriteAuctions.length} ilan`}
                icon={Wallet}
              />
              <MetricCard
                label="Tahmini değer"
                value={`₺${(predictedValue / 1_000_000).toFixed(1)}M`}
                trend={{ value: `+${potentialGainPercent}% AI`, positive: true }}
                icon={Target}
              />
              <MetricCard
                label="Ort. getiri"
                value={`%${avgYield.toFixed(1)}`}
                hint="Yıllık kira"
                icon={Percent}
              />
              <MetricCard
                label="Potansiyel"
                value={`₺${(potentialGain / 1_000_000).toFixed(1)}M`}
                hint="Tahmini fark"
                icon={TrendingUp}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <ChartPanel title="Portföy değer artışı" subtitle="Son 6 ay (tahmini)" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistory}>
                    <defs>
                      <linearGradient id="invArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                    <XAxis dataKey="month" stroke={chartAxisStroke} fontSize={chartAxisFontSize} />
                    <YAxis stroke={chartAxisStroke} fontSize={chartAxisFontSize} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="url(#invArea)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartPanel>
              <ChartPanel title="Kategori dağılımı" subtitle="Milyon TRY">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </RePieChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>

            <ChartPanel title="Getiri ve AI skoru" subtitle="İlçe bazlı" tall>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yieldData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                  <XAxis dataKey="name" stroke={chartAxisStroke} fontSize={10} />
                  <YAxis stroke={chartAxisStroke} fontSize={chartAxisFontSize} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="yield" name="Kira %" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="score" name="AI skor" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <div className="grid gap-6 lg:grid-cols-3">
              <section className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h2 className="mb-3 text-lg font-bold text-white">Tekliflerim (demo)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-slate-500 text-xs uppercase">
                      <tr>
                        <th className="pb-2">İlan</th>
                        <th className="pb-2">Tutar</th>
                        <th className="pb-2">Durum</th>
                        <th className="pb-2">Tarih</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {INVESTOR_DEMO_OFFERS.map((o) => (
                        <tr key={o.id} className="border-t border-white/5">
                          <td className="py-2 pr-2">{o.listing}</td>
                          <td className="py-2">₺{o.amount.toLocaleString("tr-TR")}</td>
                          <td className="py-2 capitalize">{o.status}</td>
                          <td className="py-2 text-slate-500">{o.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h2 className="mb-3 text-lg font-bold text-white">İzleme listesi</h2>
                <ul className="space-y-2 text-sm">
                  {INVESTOR_DEMO_WATCHLIST.map((w) => (
                    <li key={w.id} className="flex justify-between gap-2">
                      <span className="text-slate-300 truncate">{w.title}</span>
                      <span className={w.changePct >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {w.changePct >= 0 ? "+" : ""}
                        {w.changePct}%
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <h2 className="text-lg font-bold text-amber-100 mb-2">Vergi özeti (demo)</h2>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500">Tahmini kazanç</dt>
                  <dd className="font-semibold text-white">₺{INVESTOR_DEMO_TAX.estimatedGainTry.toLocaleString("tr-TR")}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">KDV</dt>
                  <dd>₺{INVESTOR_DEMO_TAX.kdvTry.toLocaleString("tr-TR")}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Damga</dt>
                  <dd>₺{INVESTOR_DEMO_TAX.damgaTry.toLocaleString("tr-TR")}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Net</dt>
                  <dd className="text-emerald-400 font-semibold">₺{INVESTOR_DEMO_TAX.netTry.toLocaleString("tr-TR")}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-slate-500">{INVESTOR_DEMO_TAX.note}</p>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-bold text-white">Portföy ilanları</h2>
              <div className="space-y-3">
                {favoriteAuctions.map((auction) => {
                  const upside = auction.aiPredictedPrice - auction.currentBid;
                  const upsidePercent = ((upside / auction.currentBid) * 100).toFixed(1);
                  return (
                    <div
                      key={auction.id}
                      className="card-luxury cursor-pointer !p-0 transition-all hover:border-blue-400/30"
                      onClick={() => navigate(`/ilan/${auction.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && navigate(`/ilan/${auction.id}`)}
                    >
                      <div className="flex flex-col gap-4 p-4 sm:flex-row">
                        <img
                          loading="lazy"
                          src={auction.images[0]}
                          alt=""
                          className="h-24 w-full shrink-0 rounded-xl object-cover sm:w-32"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-bold text-white">{auction.title}</h4>
                              <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                                {auction.location}
                              </div>
                            </div>
                            <Badge className={upside > 0 ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400" : "border-red-500/30 bg-red-500/15 text-red-400"}>
                              {upside > 0 ? "+" : ""}
                              {upsidePercent}%
                            </Badge>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2">
                              <div className="text-[10px] uppercase text-slate-500">Mevcut</div>
                              <div className="text-sm font-bold text-white">₺{(auction.currentBid / 1_000_000).toFixed(1)}M</div>
                            </div>
                            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2">
                              <div className="text-[10px] uppercase text-slate-500">Tahmini</div>
                              <div className="text-sm font-bold text-emerald-400">₺{(auction.aiPredictedPrice / 1_000_000).toFixed(1)}M</div>
                            </div>
                            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2">
                              <div className="text-[10px] uppercase text-slate-500">Getiri</div>
                              <div className="text-sm font-bold text-blue-400">%{auction.areaStats.rentalYield}</div>
                            </div>
                          </div>
                          <ListingDocumentFooter auction={auction} compact showTopRule={false} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-lg font-bold text-white">Kazanç / komisyon notu</h3>
          <p className="mt-2 text-sm text-slate-300">
            Bu panel yatırım karar desteği üretir; komisyon, vergi ve resmi mali kalemler işlem tipine göre ayrı hesaplanır. Nihai karar ve
            sözleşme sorumluluğu kullanıcıdadır.
          </p>
        </section>
        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-lg font-bold text-white">SSS</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
            <article>
              <p className="font-semibold text-slate-100">Bu panel canlı finansal tavsiye üretir mi?</p>
              <p className="text-slate-400 mt-1">Hayır. Demo/ön analiz çıktısı verir; yatırım kararı kullanıcı sorumluluğundadır.</p>
            </article>
            <article>
              <p className="font-semibold text-slate-100">Deprem ve değerleme skorları bağlı mı?</p>
              <p className="text-slate-400 mt-1">Evet, karar desteğinde birlikte okunur fakat resmi ekspertizin yerini tutmaz.</p>
            </article>
            <article>
              <p className="font-semibold text-slate-100">En iyi başlangıç akışı nedir?</p>
              <p className="text-slate-400 mt-1">Önce değerleme + risk analizi, sonra borsa teklif adımı önerilir.</p>
            </article>
          </div>
        </section>
        <section className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-5">
          <h3 className="text-lg font-bold text-cyan-100">CTA</h3>
          <p className="mt-2 text-sm text-slate-200">Önce değerleme + deprem + GES analizini tamamla, sonra teklif ekranına geç.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate("/degerleme")}>AI değerleme aç</Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/borsa")}>Borsa ekranına git</Button>
          </div>
        </section>
      </DashboardShell>
    </div>
  );
}
