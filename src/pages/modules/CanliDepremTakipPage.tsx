import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Filter, Layers, RefreshCw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { ModuleDataTable, ModulePanel, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";
import { Slider } from "@/components/ui/slider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
// R12.5 — Premium ticker mount (anasayfadan modül sayfaya taşındı)
import { LiveEarthquakeTicker } from "@/components/home/LiveEarthquakeTicker";

type EqEvent = {
  id: string;
  time: string;
  magnitude: number;
  depthKm: number;
  lat: number;
  lng: number;
  place: string;
  affectedProvinces: string[];
};

type WindowKey = "24h" | "7d" | "30d";

const HISTORICAL = [
  { year: 1939, name: "Erzincan (M≈7,8)", impact: "Kuzey Anadolu Fay Zonu üzerinde alan genişliği yaratan yıkım; merkezi planlama deprem güvenliğini güçlendirdi." },
  { year: 1944, name: "Bolu–Gerede (M≈7,2)", impact: "Kuzey sıra segmentinin yeniden sıralanması ve altyapı hatlarının topluca gözden geçirilmesi." },
  { year: 1967, name: "Mudurnu", impact: "Kırsal yerleşimlerde sığınak gereksinimi ve güçlendirme planlarının gündeme alınması." },
  { year: 1975, name: "Lice", impact: "Doğu segmentinde yığma yapı stoku ve sıvamasız taşıyıcı düğüm risklerinin bilinçlenmesi." },
  { year: 1976, name: "Çaldıran–Doğubayazıt", impact: "Sınır yakası yerleşimlerde sığınak ve su enerjisi hatlarının afet uyumuna çekilmesi." },
  { year: 1992, name: "Erzincan bağlantılı segmentler", impact: "Kent içi sıvama gereksinimi; deprem tehlike haritalarının pratik kullanıma girmesi." },
  {
    year: 1995,
    name: "Dinar",
    impact: "Kırsal ve kentsel sığınak alanı seçimi ile barınma ve yaşam güvenliği hattında öncelik sırası.",
  },
  {
    year: 1999,
    name: "17 Ağustos ve 12 Kasım",
    impact: "Bağ kirisi, perde uyumu ve bütünlük denetimi yasallaştı; sıvasız müdahalelerin tehlikeli olduğu yaygın kabul gördü.",
  },
  { year: 2003, name: "Bingöl", impact: "Eğitim binalarında geniş koridorlar ve sığınır geçişlerinin tasarımla birlikte düşünülmesi." },
  { year: 2011, name: "Van", impact: "Kırsal sığınak taşıması ve sıra halinde sığınak kayıtlarının sıkılaştırılması gereksinimi." },
  {
    year: 2020,
    name: "Elazığ (Sivrice)",
    impact: "Acil yakıt ve sığınak rotası planlamasında senaryolu hazırlığın kritik olduğunun görülmesi.",
  },
  {
    year: 2023,
    name: "Kahramanmaraş merkezli dizi depremleri",
    impact: "Bölgesel güçlendirme önceliği, sığınak planının güncellenmesi ve sıvama gereksiniminin öne çıkarılması.",
  },
] as const;

function withinWindow(isoTime: string, key: WindowKey): boolean {
  const t = new Date(isoTime).getTime();
  if (!Number.isFinite(t)) return false;
  const now = Date.now();
  const day = 86400000;
  const spans: Record<WindowKey, number> = { "24h": day, "7d": 7 * day, "30d": 30 * day };
  return now - t <= spans[key];
}

function formatNice(iso: string): string {
  try {
    return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function CanliDepremTakipPage() {
  const [windowKey, setWindowKey] = useState<WindowKey>("7d");
  const [magMin, setMagMin] = useState<number[]>([2.8]);
  const [events, setEvents] = useState<EqEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    void fetch("/data/kandilli-feed-mock.json")
      .then((r) => r.json())
      .then((data: { events?: EqEvent[] }) => {
        if (cancel || !data.events) return;
        setEvents(data.events);
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [refreshNonce]);

  const filtered = useMemo(() => {
    const m = magMin[0] ?? 2.5;
    return events.filter((e) => e.magnitude >= m && withinWindow(e.time, windowKey));
  }, [events, magMin, windowKey]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()),
    [filtered],
  );

  const tickerText = useMemo(() => {
    if (!sorted.length) return "Seçilen aralıkta olay yok — filtreleri gevşetin veya veri çekimini yenileyin.";
    return sorted
      .slice(0, 14)
      .map((e) => `M${e.magnitude.toFixed(1)} · ${e.place} · ${formatNice(e.time)}`)
      .join("   •   ");
  }, [sorted]);

  const chartData = useMemo(() => {
    const bins: Record<string, number> = {};
    for (const e of sorted) {
      const key = e.magnitude >= 5 ? "5+" : e.magnitude >= 4 ? "4–4,9" : e.magnitude >= 3 ? "3–3,9" : "<3";
      bins[key] = (bins[key] ?? 0) + 1;
    }
    return Object.entries(bins).map(([range, sayi]) => ({ range, sayi }));
  }, [sorted]);

  const stats = [
    {
      label: "Filtre sonrası olay sayısı",
      value: String(sorted.length),
      hint:
        windowKey === "24h"
          ? "Son 24 saat + M eşik"
          : windowKey === "7d"
            ? "Son 7 gün + M eşik"
            : "Son 30 gün + M eşik",
    },
    {
      label: "En yüksek büyüklük",
      value: sorted.length ? `M${Math.max(...sorted.map((s) => s.magnitude)).toFixed(1)}` : "—",
      hint: "Listelenen olayların en büyük M değeri",
    },
    {
      label: "Ortalama büyüklük",
      value: sorted.length ? (sorted.reduce((a, s) => a + s.magnitude, 0) / sorted.length).toFixed(2) : "—",
      hint: "Derinlik ayrımı yoktur — grafik özeti için uygundur",
    },
    {
      label: "Ham kayıt",
      value: loading ? "yükleniyor" : `${events.length} gözlem`,
      hint: "public/data/kandilli-feed-mock.json",
    },
  ];

  return (
    <ModuleShell
      title="Canlı Deprem Takibi"
      subtitle="/data/kandilli-feed-mock.json akışından yüklenen olayları 24 saat, 7 gün veya 30 gün seçili pencerede; büyüklük eşikli filtre ile listeler. Aşağıda 1939–2023 arası tarih özeti zaman çizgisidir."
      badge="Gerçek Zaman Bildirimi"
      icon={Layers}
      iconAccent="text-amber-200"
    >
      <div className="mb-4">
        <LiveEarthquakeTicker />
      </div>
      <div className="sticky top-14 z-[40] mx-[-0.25rem] mb-6 overflow-hidden rounded-xl border border-orange-400/35 bg-orange-950/45 px-3 py-3 shadow-lg backdrop-blur-md sm:mx-0">
        <div className="flex items-center gap-3 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden /> Canlı bant özeti
        </div>
        <div className={`deprem-ticker-track mt-2 ${prefersReducedMotion ? "deprem-ticker-track--static" : "deprem-ticker-track--marquee"}`} aria-live="polite">
          <span className="deprem-ticker-text">{tickerText}</span>
          <span className="deprem-ticker-text" aria-hidden="true">{tickerText}</span>
        </div>
      </div>

      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Zaman aralığı ve büyüklük filtresi">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["24h", "Son 24 saat"],
                  ["7d", "Son 7 gün"],
                  ["30d", "Son 30 gün"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    windowKey === k ? "bg-sky-600 text-white" : "border border-white/15 bg-white/5 text-slate-300"
                  }`}
                  onClick={() => setWindowKey(k)}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10"
                onClick={() => {
                  setRefreshNonce((n) => n + 1);
                  window.dispatchEvent(
                    new CustomEvent("ihaleal:add-toast", { detail: { message: "Veri yeniden yükleniyor.", type: "info" } }),
                  );
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Yenile
              </button>
            </div>
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Filter className="h-4 w-4 text-sky-300" aria-hidden />
                Büyüklük alt eşik (M ≥
                {(magMin[0] ?? 2.8).toFixed(1)})
              </label>
              <Slider value={magMin} min={2} max={6.5} step={0.1} onValueChange={setMagMin} />
              <p className="mt-3 text-xs text-slate-500">
                Küçük olayları filtrelemeniz bildirilen sayıları azaltır. Resmi uyarı için AFAD ve Kandilli duyurularını
                mutlaka izleyin; bu liste yalnızca deneme verisidir.
              </p>
            </div>
          </div>
        </ModulePanel>

        <ModulePanel title="Sonuç listesi ve büyüklük dağılımı">
          <ModuleStatGrid stats={stats} />
          {loading ? (
            <div className="rounded-lg border border-white/12 bg-black/35 p-6 text-center text-sm text-slate-400">Yükleniyor…</div>
          ) : (
            <>
              <ModuleDataTable
                caption="Filtrelenmiş deprem olayları"
                columns={[
                  { key: "time", header: "Tarih – saat", render: (r) => formatNice(r.time) },
                  { key: "mag", header: "M", render: (r) => `M${r.magnitude.toFixed(1)}` },
                  { key: "depth", header: "Derinlik", render: (r) => `${r.depthKm.toFixed(1)} km` },
                  {
                    key: "place",
                    header: "Yer",
                    render: (r) => (
                      <span className="text-sky-300">
                        {r.place}
                        {r.affectedProvinces?.length ? ` · (${r.affectedProvinces.slice(0, 2).join(", ")})` : ""}
                      </span>
                    ),
                  },
                ]}
                rows={sorted.slice(0, 40).map((e) => ({ ...e, id: e.id }))}
              />
              <div className="mod-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="range" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", fontSize: 12 }} />
                    <Bar dataKey="sayi" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </ModulePanel>
      </div>

      <ModulePanel title="Önemli depremler — kronolojik özet (1939–2023+)" action={<CalendarClock className="h-4 w-4 text-slate-400" aria-hidden />}>
        <div className="grid gap-3 md:grid-cols-2">
          {HISTORICAL.map((ev) => (
            <article
              key={ev.year}
              className="rounded-xl border border-white/10 bg-slate-950/45 p-4 text-sm leading-relaxed text-slate-300"
            >
              <header className="mb-2 flex flex-wrap items-baseline gap-2">
                <ModuleTag tone="risk">{ev.year}</ModuleTag>
                <strong className="text-white">{ev.name}</strong>
              </header>
              <p>{ev.impact}</p>
            </article>
          ))}
        </div>
      </ModulePanel>
    </ModuleShell>
  );
}
