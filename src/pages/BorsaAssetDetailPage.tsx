import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Area,
  Bar,
  ComposedChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Bell, Clock3, FileText, Gavel, LineChart, ShieldCheck, Star } from "lucide-react";
import { INITIAL_MARKET_ASSETS, useLiveMarket } from "@/borsa/useLiveMarket";
import {
  ANTI_SNIPING_EXTEND_SECONDS,
  ANTI_SNIPING_THRESHOLD_SECONDS,
  BID_BOND_RATE,
  MIN_INCREMENT_TRY,
  calcBidBond,
} from "@/lib/fees";
import { placeBidRpc, parsePositiveTryFromInput } from "@/lib/placeBid";
import { preAuthorize } from "@/lib/payment";
import { buildOrderBook, maskBidder } from "@/lib/borsa/orderBook";
import { calculateProxyBid, shouldExtend, submitBidViaCore, validateBid } from "@/lib/borsa/auctionEngine";
import { PLATFORM_LEGAL_DEFINITION, PSP_FLOW_DISCLAIMER } from "@/legal/platformDisclaimers";
import "@/borsa/borsa.css";

type DetailTab = "detay" | "islem" | "degerleme" | "belgeler" | "benzer";
type RangeKey = "1g" | "7g" | "30g";

function formatTry(value: number): string {
  return `₺${Math.round(value).toLocaleString("tr-TR")}`;
}

function dispatchToast(message: string, type: "success" | "error" | "info" = "info"): void {
  window.dispatchEvent(new CustomEvent("ihaleal:add-toast", { detail: { message, type } }));
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default function BorsaAssetDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data } = useLiveMarket();
  const [range, setRange] = useState<RangeKey>("7g");
  const [activeTab, setActiveTab] = useState<DetailTab>("detay");
  const [bidInput, setBidInput] = useState("");
  const [maxBidInput, setMaxBidInput] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [myWatchlist, setMyWatchlist] = useState<string[]>([]);
  const [mockTrades, setMockTrades] = useState<Array<{ at: string; price: number; qty: number; side: "buy" | "sell" }>>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("borsa_watchlist_ids");
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setMyWatchlist(Array.isArray(parsed) ? parsed : []);
    } catch {
      setMyWatchlist([]);
    }
  }, []);

  const asset = useMemo(
    () => data.find((item) => item.id === id) ?? INITIAL_MARKET_ASSETS.find((item) => item.id === id) ?? INITIAL_MARKET_ASSETS[0],
    [data, id],
  );

  const title = `${asset.property} (${asset.code})`;
  const high24 = Math.round(asset.price * (1 + Math.abs(asset.changePct) / 160));
  const low24 = Math.round(asset.price * (1 - Math.abs(asset.changePct) / 180));
  const open24 = Math.round(asset.price / Math.max(0.5, 1 + asset.changePct / 100));
  const close24 = Math.round(asset.price);

  const countdown = useMemo(() => {
    const mins = Math.max(1, asset.remainingMin);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}s ${m}dk`;
  }, [asset.remainingMin]);

  const chartData = useMemo(() => {
    const points = range === "1g" ? 24 : range === "7g" ? 42 : 60;
    return Array.from({ length: points }, (_, idx) => {
      const wave = Math.sin((idx / points) * Math.PI * 2.3);
      const drift = range === "30g" ? idx * 0.0009 : range === "7g" ? idx * 0.0014 : idx * 0.002;
      const price = Math.max(1, Math.round(asset.price * (0.97 + drift + wave * 0.015)));
      const volume = Math.max(5, Math.round(asset.volume * (0.8 + Math.cos(idx / 3) * 0.18)));
      return { t: idx + 1, price, volume };
    });
  }, [asset.price, asset.volume, range]);

  const movingAvg = useMemo(
    () =>
      chartData.map((point, idx, arr) => {
        const from = Math.max(0, idx - 4);
        const windowSlice = arr.slice(from, idx + 1);
        const avg = windowSlice.reduce((acc, row) => acc + row.price, 0) / windowSlice.length;
        return { ...point, ma: Math.round(avg) };
      }),
    [chartData],
  );

  const orderBookLevels = useMemo(() => {
    const seed = Array.from({ length: 10 }, (_, level) => {
      const step = (level + 1) * 7_500;
      const bidPrice = Math.max(1, asset.price - step);
      const askPrice = asset.price + step;
      const bidQty = Math.max(1, Math.round(asset.volume / (12 + level * 1.2)));
      const askQty = Math.max(1, Math.round(asset.volume / (13 + level * 1.3)));
      return [
        { bidder: `${asset.code}-B${level + 1}`, price: bidPrice, quantity: bidQty, side: "bid" as const },
        { bidder: `${asset.code}-A${level + 1}`, price: askPrice, quantity: askQty, side: "ask" as const },
      ];
    }).flat();
    const book = buildOrderBook(seed);
    const maxLen = Math.max(book.bids.length, book.asks.length);
    return Array.from({ length: maxLen }, (_, idx) => ({
      level: idx + 1,
      bidPrice: book.bids[idx]?.price ?? 0,
      bidQty: book.bids[idx]?.quantity ?? 0,
      bidCum: book.bids[idx]?.cumulativeQuantity ?? 0,
      askPrice: book.asks[idx]?.price ?? 0,
      askQty: book.asks[idx]?.quantity ?? 0,
      askCum: book.asks[idx]?.cumulativeQuantity ?? 0,
      bidder: maskBidder(`${asset.code}${idx + 1}`),
    }));
  }, [asset.code, asset.price, asset.volume]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const side: "buy" | "sell" = Math.random() > 0.4 ? "buy" : "sell";
      const delta = Math.round(asset.price * (Math.random() * 0.003 + 0.0008));
      const price = side === "buy" ? asset.price + delta : asset.price - delta;
      const qty = Math.max(1, Math.round(asset.volume / 30 + Math.random() * 12));
      setMockTrades((prev) =>
        [
          {
            at: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            price,
            qty,
            side,
          },
          ...prev,
        ].slice(0, 18),
      );
    }, 2600);
    return () => window.clearInterval(interval);
  }, [asset.price, asset.volume]);

  const bidAmount = parsePositiveTryFromInput(bidInput);
  const maxBidAmount = parsePositiveTryFromInput(maxBidInput);
  const highestBid = orderBookLevels[0]?.bidPrice ?? asset.price;
  const minimumIncrement = Math.max(MIN_INCREMENT_TRY, Math.round(highestBid * 0.001));
  const bidFloor = highestBid + minimumIncrement;
  const proxyOpeningBid = maxBidAmount ? calculateProxyBid(highestBid, maxBidAmount, minimumIncrement) : null;
  const effectiveBidAmount = Math.max(bidAmount ?? 0, proxyOpeningBid ?? 0);
  const bidBond = effectiveBidAmount > 0 ? calcBidBond(effectiveBidAmount) : 0;
  const endAt = Date.now() + Math.max(1, asset.remainingMin) * 60_000;
  const extendedEndAt = shouldExtend(
    endAt,
    Date.now(),
    {
      thresholdMinutes: Math.max(1, Math.round(ANTI_SNIPING_THRESHOLD_SECONDS / 60)),
      extensionMinutes: Math.max(1, Math.round(ANTI_SNIPING_EXTEND_SECONDS / 60)),
      mode: "extend",
    },
  );
  const softCloseEnabled = extendedEndAt > endAt;

  const handlePlaceBid = async () => {
    if (!bidAmount) {
      setActionMessage({ tone: "error", text: "Teklif tutarı girmelisiniz." });
      dispatchToast("Teklif tutarı girmelisiniz.", "error");
      return;
    }
    const validation = validateBid(highestBid, bidAmount, minimumIncrement);
    if (!validation.valid) {
      setActionMessage({ tone: "error", text: validation.error });
      dispatchToast(validation.error, "error");
      return;
    }
    if (maxBidAmount && maxBidAmount < bidAmount) {
      setActionMessage({ tone: "error", text: "Maksimum teklif, başlangıç teklifinden düşük olamaz." });
      dispatchToast("Maksimum teklif, başlangıç teklifinden düşük olamaz.", "error");
      return;
    }
    if (maxBidAmount && maxBidAmount < validation.requiredMinimum) {
      setActionMessage({ tone: "error", text: `Maksimum teklif en az ${formatTry(validation.requiredMinimum)} olmalıdır.` });
      dispatchToast(`Maksimum teklif en az ${formatTry(validation.requiredMinimum)} olmalıdır.`, "error");
      return;
    }
    if (!agree) {
      setActionMessage({ tone: "error", text: "Teklif kurallarını onaylamalısınız." });
      dispatchToast("Teklif kurallarını onaylamalısınız.", "error");
      return;
    }

    const amountForCore = Math.max(bidAmount, proxyOpeningBid ?? bidAmount);

    setBusy(true);
    try {
      const preAuth = await preAuthorize({
        amountTRY: bidBond,
        cardToken: "demo-card-token",
        buyerId: "demo-user",
        listingId: id,
        context: "bid",
      });
      if (!preAuth.success) {
        setActionMessage({ tone: "error", text: `Kart blokajı başarısız: ${preAuth.error ?? "Bilinmeyen hata."}` });
        dispatchToast(`Kart blokajı başarısız: ${preAuth.error ?? "Bilinmeyen hata."}`, "error");
        return;
      }

      // Core teklif akisi sadece cagrilir; cekirdek degistirilmez.
      const result = await submitBidViaCore({
        placeBid: async ({ auctionId, amount }) => placeBidRpc({ auctionId, amountTry: amount }),
        auctionId: id,
        bidderId: "demo-user",
        amount: amountForCore,
        marketingMode: "auction",
        liveSession: true,
      });
      if (result.ok) {
        setActionMessage({
          tone: "success",
          text:
            result.status === "duplicate"
              ? result.message
              : `Çekirdek çağrı gönderildi: ${formatTry(amountForCore)} · Kart blokajı hazır (${preAuth.preAuthRef ?? "ref"})`,
        });
        dispatchToast(
          result.status === "duplicate"
            ? result.message
            : `Teklif iletildi: ${formatTry(amountForCore)} · Blokaj: ${formatTry(bidBond)}`,
          "success",
        );
      } else {
        setActionMessage({ tone: "error", text: `Çekirdek yanıtı: ${result.message}` });
        dispatchToast(result.message, "error");
      }
    } catch (error) {
      setActionMessage({ tone: "error", text: `Hata: ${(error as Error).message || "Teklif gönderilemedi."}` });
      dispatchToast((error as Error).message || "Teklif gönderilemedi.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleWatch = () => {
    const next = myWatchlist.includes(asset.id) ? myWatchlist.filter((x) => x !== asset.id) : [...myWatchlist, asset.id];
    setMyWatchlist(next);
    localStorage.setItem("borsa_watchlist_ids", JSON.stringify(next));
    dispatchToast(myWatchlist.includes(asset.id) ? "İzleme listesinden kaldırıldı." : "İzleme listesine eklendi.", "info");
  };

  return (
    <main className="w-full space-y-4 px-4 py-4 text-slate-100 lg:px-8 2xl:px-12">
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-200">Varlık Detay · Demo Veri</p>
            <h1 className="mt-1 text-2xl font-black text-white lg:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-slate-300">
              Lokasyon: {asset.region.toUpperCase("tr-TR")} · Tip: Açık artırma gayrimenkul varlığı
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-white">{formatTry(asset.price)}</p>
            <p className={`text-sm font-bold ${asset.changePct >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {asset.changePct >= 0 ? "+" : ""}
              {asset.changePct.toFixed(2)}%
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-lg border border-border bg-secondary p-2 text-xs text-slate-300">24s Yüksek: <strong className="text-white">{formatTry(high24)}</strong></div>
          <div className="rounded-lg border border-border bg-secondary p-2 text-xs text-slate-300">24s Düşük: <strong className="text-white">{formatTry(low24)}</strong></div>
          <div className="rounded-lg border border-border bg-secondary p-2 text-xs text-slate-300">Açılış/Kapanış: <strong className="text-white">{formatTry(open24)} / {formatTry(close24)}</strong></div>
          <div className="rounded-lg border border-border bg-secondary p-2 text-xs text-slate-300">Hacim: <strong className="text-white">{asset.volume.toLocaleString("tr-TR")}</strong></div>
          <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-2 text-xs text-amber-100">
            Sayaç: <strong>{countdown}</strong> · Anti-sniping soft-close aktif (son {Math.round(ANTI_SNIPING_THRESHOLD_SECONDS / 60)} dk teklifte +{Math.round(ANTI_SNIPING_EXTEND_SECONDS / 60)} dk)
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(310px,1fr)_minmax(0,1.35fr)_minmax(320px,1fr)]">
        <article className="borsa-card rounded-xl p-3">
          <h2 className="mb-3 text-sm font-black uppercase tracking-[0.12em] text-slate-200">Emir Defteri (Order Book)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left uppercase tracking-[0.1em] text-slate-400">
                <tr>
                  <th className="pb-2">Alış</th>
                  <th className="pb-2">Lot</th>
                  <th className="pb-2">Küm.</th>
                  <th className="pb-2">Satış</th>
                  <th className="pb-2">Lot</th>
                  <th className="pb-2">Küm.</th>
                  <th className="pb-2">Teklifçi</th>
                </tr>
              </thead>
              <tbody>
                {orderBookLevels.map((row) => (
                  <tr key={row.level} className="border-t border-slate-800/80">
                    <td className="py-1.5 text-emerald-300">{row.bidPrice ? formatTry(row.bidPrice) : "-"}</td>
                    <td className="py-1.5 text-slate-300">{row.bidQty.toLocaleString("tr-TR")}</td>
                    <td className="py-1.5 text-slate-400">{row.bidCum.toLocaleString("tr-TR")}</td>
                    <td className="py-1.5 text-rose-300">{row.askPrice ? formatTry(row.askPrice) : "-"}</td>
                    <td className="py-1.5 text-slate-300">{row.askQty.toLocaleString("tr-TR")}</td>
                    <td className="py-1.5 text-slate-400">{row.askCum.toLocaleString("tr-TR")}</td>
                    <td className="py-1.5 text-slate-400">{row.bidder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">KVKK gereği teklifçi kimlikleri maskelenir (`A***z`).</p>
        </article>

        <article className="borsa-card rounded-xl p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.12em] text-slate-200">Fiyat Grafiği</h2>
            <div className="flex gap-1">
              {(["1g", "7g", "30g"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`rounded border px-2 py-1 text-[11px] font-semibold ${range === key ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-100" : "border-slate-700 bg-slate-900/60 text-slate-400"}`}
                  onClick={() => setRange(key)}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={movingAvg} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="t" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="p" stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `₺${Math.round(v / 1_000_000)}M`} />
                <YAxis yAxisId="v" orientation="right" stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number, name) =>
                    name === "volume" ? [value.toLocaleString("tr-TR"), "Hacim"] : [formatTry(value), name === "ma" ? "MA(5)" : "Fiyat"]
                  }
                  labelFormatter={(label) => `Periyot ${label}`}
                />
                <Area yAxisId="p" dataKey="price" type="monotone" stroke="#22d3ee" fill="#06b6d4" fillOpacity={0.15} />
                <Line yAxisId="p" dataKey="ma" type="monotone" stroke="#facc15" dot={false} />
                <Bar yAxisId="v" dataKey="volume" fill="#334155" barSize={6} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Grafik: geçmiş teklif/işlem akışından türetilmiş demo seri (MA + hacim).</p>
        </article>

        <article className="borsa-card rounded-xl p-3">
          <h2 className="mb-3 text-sm font-black uppercase tracking-[0.12em] text-slate-200">Teklif Paneli</h2>
          <div className="space-y-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-amber-500/50 bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-100">
                Anti-sniping / Soft close
              </span>
              <span className="text-[11px] text-slate-300">
                Son dakikada teklif gelirse süre otomatik uzar
                {softCloseEnabled ? " (bu oturumda tetiklenebilir)." : "."}
              </span>
            </div>
            <div className="rounded-md border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-100">
              Bid Increment kuralı: minimum artış <strong>{formatTry(minimumIncrement)}</strong> · Geçerli taban teklif{" "}
              <strong>{formatTry(bidFloor)}</strong>.
            </div>
            <label className="block text-slate-300">Teklif Tutarı (min {formatTry(bidFloor)})</label>
            <input
              value={bidInput}
              onChange={(e) => setBidInput(e.target.value)}
              placeholder="örn. 15.500.000"
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <label className="block text-slate-300">Maksimum Teklif (Proxy Bid)</label>
            <input
              value={maxBidInput}
              onChange={(e) => setMaxBidInput(e.target.value)}
              placeholder="örn. 16.000.000"
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <p className="rounded-md border border-slate-700/70 bg-slate-900/70 p-2 text-slate-300">
              Sistem sizin için minimum artışlarla teklif verir (maksimum teklifinize kadar).
              {proxyOpeningBid ? ` İlk otomatik adım: ${formatTry(proxyOpeningBid)}.` : ""}
            </p>
            <div className="rounded-md border border-amber-500/35 bg-amber-500/10 p-2 text-amber-100">
              Teklifiniz için kartınızda <strong>{formatTry(bidBond)}</strong> (%{Math.round(BID_BOND_RATE * 100)} teminat)
              bloke edilecektir.
            </div>
            <ul className="space-y-1 text-slate-300">
              <li>• Teklif geri alınamaz ve bağlayıcıdır (açık artırma kuralı).</li>
              <li>• Order book tabanına göre min artış {formatTry(minimumIncrement)} ile ilerler.</li>
              <li>
                • Soft close kuralı: son {Math.round(ANTI_SNIPING_THRESHOLD_SECONDS / 60)} dakika içinde teklif gelirse süre +
                {Math.round(ANTI_SNIPING_EXTEND_SECONDS / 60)} dakika uzar.
              </li>
              <li>• Demo kaydıdır; gerçek işlemler çekirdek+PSP ile yürür.</li>
            </ul>
            <label className="flex items-center gap-2 text-slate-200">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              Teklif kurallarını okudum, işlemin bağlayıcı olduğunu kabul ediyorum.
            </label>
            <p className="rounded-md border border-rose-500/35 bg-rose-500/10 px-2 py-1.5 text-[11px] text-rose-100">
              Onay kutusu işaretlenmeden teklif gönderilemez. Teklifiniz hukuki ve finansal yükümlülük doğurur.
            </p>
            <button
              type="button"
              disabled={busy || !agree}
              onClick={handlePlaceBid}
              className="w-full rounded-md border border-emerald-400/50 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Gönderiliyor..." : "Teklif Ver (çekirdek çağrı)"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/ihale/${asset.id}/hemen-al`)}
              className="w-full rounded-md border border-cyan-400/45 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100"
            >
              Hemen Al
            </button>
            <button
              type="button"
              onClick={handleWatch}
              className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm font-semibold text-slate-200"
            >
              {myWatchlist.includes(asset.id) ? "İzlemeden Çıkar" : "İzle"}
            </button>
            {!isUuid(id) ? (
              <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-100">
                Bu demo varlık ID&apos;si UUID olmadığı için çekirdek RPC canlı kayıt döndürmeyebilir; yine de çekirdek çağrı akışı tetiklenir.
              </p>
            ) : null}
            {actionMessage ? (
              <p
                data-testid="bid-action-message"
                className={`rounded-md border px-2 py-1.5 text-[11px] ${
                  actionMessage.tone === "success"
                    ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-100"
                    : actionMessage.tone === "error"
                      ? "border-rose-500/35 bg-rose-500/10 text-rose-100"
                      : "border-cyan-500/35 bg-cyan-500/10 text-cyan-100"
                }`}
              >
                {actionMessage.text}
              </p>
            ) : null}
          </div>
        </article>
      </section>

      <section className="borsa-card rounded-xl p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            { id: "detay", label: "Mülk Detayı", icon: FileText },
            { id: "islem", label: "İşlem Geçmişi", icon: Clock3 },
            { id: "degerleme", label: "Emsal & Değerleme", icon: LineChart },
            { id: "belgeler", label: "Belgeler", icon: ShieldCheck },
            { id: "benzer", label: "Benzer Varlıklar", icon: Star },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DetailTab)}
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold ${activeTab === tab.id ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-100" : "border-slate-700 bg-slate-900/60 text-slate-300"}`}
            >
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "detay" ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm text-slate-200">
            <div className="rounded-lg border border-border bg-secondary p-2.5">Brüt/Net m²: <strong>165 / 148</strong></div>
            <div className="rounded-lg border border-border bg-secondary p-2.5">Kat: <strong>8 / 15</strong></div>
            <div className="rounded-lg border border-border bg-secondary p-2.5">Tapu: <strong>Kat mülkiyeti</strong></div>
            <div className="rounded-lg border border-border bg-secondary p-2.5">İmar Notu: <strong>Ticaret + Konut</strong></div>
            <div className="rounded-lg border border-border bg-secondary p-2.5">Deprem Skoru: <strong>78/100</strong></div>
            <div className="rounded-lg border border-border bg-secondary p-2.5">Belge Durumu: <strong>Doğrulandı</strong></div>
          </div>
        ) : null}

        {activeTab === "islem" ? (
          <div className="space-y-2">
            {mockTrades.map((trade, idx) => (
              <div key={`${trade.at}-${idx}`} className="grid grid-cols-[100px_1fr_auto_auto] gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs">
                <span className="text-slate-400">{trade.at}</span>
                <span className={trade.side === "buy" ? "text-emerald-300" : "text-rose-300"}>{trade.side === "buy" ? "ALIŞ" : "SATIŞ"}</span>
                <span className="text-white">{formatTry(trade.price)}</span>
                <span className="text-slate-300">{trade.qty} lot</span>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "degerleme" ? (
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-secondary p-3 text-sm text-slate-300">
              <p className="font-semibold text-white">AI Emsal Bandı (Demo)</p>
              <p className="mt-1">Bölge emsal aralığı: {formatTry(asset.price * 0.93)} - {formatTry(asset.price * 1.08)}</p>
              <p className="mt-1">Likidite skoru: 72/100 · Talep: Yüksek</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary p-3 text-sm text-slate-300">
              <p className="font-semibold text-white">Yatırım Notu</p>
              <p className="mt-1">Fiyat, 7g ortalama üst bandına yakın. Açık artırma rekabetinde son dakikada soft-close uzatması beklenebilir.</p>
            </div>
          </div>
        ) : null}

        {activeTab === "belgeler" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {["Tapu Kaydı", "Ekspertiz PDF", "İmar Durumu", "Deprem Raporu"].map((doc) => (
              <div key={doc} className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-slate-200">
                {doc} · <span className="text-emerald-300">Hazır (demo)</span>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "benzer" ? (
          <div className="grid gap-2 md:grid-cols-3">
            {INITIAL_MARKET_ASSETS.filter((item) => item.id !== asset.id)
              .slice(0, 3)
              .map((item) => (
                <Link
                  key={item.id}
                  to={`/borsa/varlik/${item.id}`}
                  className="rounded-lg border border-border bg-secondary p-3 text-sm text-slate-200 hover:border-cyan-400/50"
                >
                  <p className="font-semibold">{item.code}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.property}</p>
                  <p className="mt-2 font-bold text-white">{formatTry(item.price)}</p>
                </Link>
              ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-amber-100">
        <p>{PLATFORM_LEGAL_DEFINITION}</p>
        <p className="mt-1">{PSP_FLOW_DISCLAIMER}</p>
        <p className="mt-1">Demo veri ve simülasyon ekranıdır; gerçek işlemde çekirdek teklif/ödeme kuralları geçerlidir.</p>
      </section>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Gavel className="h-3.5 w-3.5" />
        Borsa derin ekranı aktif · Auto-extend eşik: {Math.round(ANTI_SNIPING_THRESHOLD_SECONDS / 60)} dk · Ek süre: {Math.round(ANTI_SNIPING_EXTEND_SECONDS / 60)} dk
        <Bell className="ml-2 h-3.5 w-3.5" />
        İzleme ve uyarı akışı demo modda çalışır.
      </div>
    </main>
  );
}
