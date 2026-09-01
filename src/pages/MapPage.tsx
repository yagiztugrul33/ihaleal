import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { LatLngExpression, Map as LeafletMap } from "leaflet";
import { ArrowLeft, MapPin, SlidersHorizontal, X, Filter, Gavel, Eye, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import type { Auction } from "@/types/auction";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

// /arama ile aynı taksonomi — Dalga 1-1'de eklenen filtreler.
const PROPERTY_TYPES = [
  { key: "konut", label: "Konut", match: ["daire", "villa", "konut", "rezidans", "stüdyo", "ev"] },
  { key: "ticari", label: "Ticari", match: ["ofis", "dükkan", "iş yeri", "ticari", "plaza", "mağaza"] },
  { key: "arsa", label: "Arsa", match: ["arsa", "imar"] },
  { key: "tarla", label: "Tarla", match: ["tarla", "tarım"] },
  { key: "diger", label: "Diğer", match: [] },
] as const;
type PropertyType = (typeof PROPERTY_TYPES)[number]["key"];

const AUCTION_MODES = [
  { key: "auction", label: "Açık artırma", icon: Gavel },
  { key: "sealed_offers", label: "Kapalı teklif", icon: Eye },
  { key: "listing_only", label: "Sadece ilan", icon: Building2 },
] as const;
type AuctionMode = (typeof AUCTION_MODES)[number]["key"];

const AUCTION_STATUS = [
  { key: "live", label: "Devam eden", color: "#B42318" },
  { key: "upcoming", label: "Yaklaşan", color: "#1E40AF" },
  { key: "ended", label: "Biten", color: "#5F6B64" },
] as const;
type AuctionStatus = (typeof AUCTION_STATUS)[number]["key"];

function normalize(s: string) {
  return s.trim().toLowerCase();
}
function classifyType(category: string): PropertyType {
  const c = normalize(category);
  for (const t of PROPERTY_TYPES) if (t.match.some((m) => c.includes(m))) return t.key;
  return "diger";
}
function parseSet<T extends string>(v: string | null, valid: readonly T[]): T[] {
  if (!v) return [];
  return v.split(",").filter((x): x is T => (valid as readonly string[]).includes(x));
}
function parseNumber(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}
function formatTRY(v: number): string {
  if (v >= 1_000_000) return `₺${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₺${(v / 1_000).toFixed(0)}K`;
  return `₺${v.toLocaleString("tr-TR")}`;
}

/**
 * FitBounds — auctions değiştiğinde haritayı yeniden konumlandır.
 * Mevcut AuctionsMap pattern'ından reuse.
 */
function FitBounds({ points }: { points: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    void import("leaflet").then((L) => {
      const b = L.latLngBounds(points);
      map.fitBounds(b, { padding: [56, 56], maxZoom: 11 });
    });
  }, [map, points]);
  return null;
}

/**
 * Cluster + marker katmanı — leaflet.markercluster ile.
 * react-leaflet @5'in component API'sı yerine düşük seviye Leaflet API
 * (useMap + markerClusterGroup) kullanıyoruz — sürümler arası en kararlı yol.
 *
 * Popup: HTML string (Leaflet'ın native popup'ı) — React tree dışı,
 * cluster lib ile uyumlu.
 */
function ClusterLayer({ auctions }: { auctions: Auction[] }) {
  const map = useMap();
  useEffect(() => {
    let alive = true;
    type ClusterLayer = { addLayer(l: unknown): void; clearLayers(): void };
    let cluster: ClusterLayer | null = null;
    void Promise.all([
      import("leaflet"),
      import("leaflet.markercluster"),
      import("leaflet.markercluster/dist/MarkerCluster.css"),
      import("leaflet.markercluster/dist/MarkerCluster.Default.css"),
    ]).then(([leafletMod]) => {
      if (!alive) return;
      // leaflet.markercluster L objesini augment eder; tip için cast.
      const L = leafletMod as unknown as {
        markerClusterGroup: (opts: Record<string, unknown>) => ClusterLayer;
        circleMarker: (latlng: LatLngExpression, opts: Record<string, unknown>) => {
          bindPopup: (html: string) => unknown;
        };
        default?: unknown;
      };
      cluster = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 60,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
      });
      for (const a of auctions) {
        const color =
          a.status === "live" ? "#B42318" :
          a.status === "upcoming" ? "#1E40AF" : "#5F6B64";
        const m = L.circleMarker([a.mapLat, a.mapLng], {
          radius: 10,
          color,
          fillColor: "#1E40AF",
          fillOpacity: 0.6,
          weight: 2,
        });
        const statusLabel =
          a.status === "live" ? "Canlı" : a.status === "upcoming" ? "Yaklaşan" : "Bitti";
        const modeLabel =
          a.marketingMode === "sealed_offers" ? "Kapalı teklif" :
          a.marketingMode === "listing_only" ? "Sadece ilan" : "Açık artırma";
        const safeTitle = (a.title || "").slice(0, 70).replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const safeDist = `${a.district || ""}, ${a.city || ""}`.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const safeImg = (a.images?.[0] || "").replace(/"/g, "&quot;");
        m.bindPopup(`
          <div style="min-width:220px;color:#1e2a24;font-family:system-ui,-apple-system,sans-serif">
            ${safeImg ? `<img src="${safeImg}" style="width:100%;height:110px;object-fit:cover;border-radius:6px;margin-bottom:8px" alt="">` : ""}
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
              <span style="font-size:10px;background:${color}33;color:${color};padding:2px 6px;border-radius:4px;font-weight:600">${statusLabel}</span>
              <span style="font-size:10px;background:#fbf6e9;color:#9A6700;padding:2px 6px;border-radius:4px;font-weight:600">${modeLabel}</span>
            </div>
            <div style="font-weight:600;font-size:13px;line-height:1.3;margin-bottom:4px">${safeTitle}</div>
            <div style="font-size:11px;color:#5F6B64;margin-bottom:6px">${safeDist}</div>
            <div style="font-size:15px;font-weight:700;color:#1E40AF">₺${a.currentBid.toLocaleString("tr-TR")}</div>
            <a href="/ilan/${a.id}" style="display:inline-block;margin-top:10px;font-size:12px;color:#1E40AF;font-weight:600;text-decoration:underline">İlan detayına git →</a>
          </div>
        `);
        (cluster as unknown as { addLayer(l: unknown): void }).addLayer(m);
      }
      (map as unknown as LeafletMap & { addLayer(l: unknown): void }).addLayer(cluster);
    }).catch(() => {
      /* cluster lib yüklenemezse sessiz geç; harita yine çalışır */
    });
    return () => {
      alive = false;
      if (cluster) {
        try {
          (map as unknown as LeafletMap & { removeLayer(l: unknown): void }).removeLayer(cluster);
        } catch {
          /* unmount yarışı */
        }
      }
    };
  }, [map, auctions]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [catalog, setCatalog] = useState<Auction[]>(() => getLocalAndStaticAuctions());
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setCatalogLoading(true);
    void loadAllAuctionsForSearch()
      .then((rows) => {
        if (alive) setCatalog(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setCatalogLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const ptypes = parseSet<PropertyType>(params.get("ptype"), PROPERTY_TYPES.map((x) => x.key));
  const modes = parseSet<AuctionMode>(params.get("mode"), AUCTION_MODES.map((x) => x.key));
  const statuses = parseSet<AuctionStatus>(params.get("status"), AUCTION_STATUS.map((x) => x.key));
  const priceMin = parseNumber(params.get("pmin"));
  const priceMax = parseNumber(params.get("pmax"));
  const city = (params.get("city") || "").trim();

  const cityOptions = useMemo(() => {
    const set = new Set(catalog.map((a) => a.city).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr-TR"));
  }, [catalog]);

  const filtered = useMemo(() => {
    let rows = catalog;
    if (ptypes.length > 0) rows = rows.filter((a) => ptypes.includes(classifyType(a.category)));
    if (modes.length > 0) {
      rows = rows.filter((a) => {
        const m = a.marketingMode ?? (a.negotiationMode === "sealed_offer" ? "sealed_offers" : "auction");
        return modes.includes(m as AuctionMode);
      });
    }
    if (statuses.length > 0) rows = rows.filter((a) => statuses.includes(a.status as AuctionStatus));
    if (priceMin !== undefined) rows = rows.filter((a) => a.currentBid >= priceMin);
    if (priceMax !== undefined) rows = rows.filter((a) => a.currentBid <= priceMax);
    if (city) rows = rows.filter((a) => a.city === city);
    // Geçerli koordinatlı olanlar (mapLat/mapLng undefined olabilir)
    return rows.filter((a) => Number.isFinite(a.mapLat) && Number.isFinite(a.mapLng));
  }, [catalog, ptypes, modes, statuses, priceMin, priceMax, city]);

  const points: LatLngExpression[] = filtered.map((a) => [a.mapLat, a.mapLng]);
  const center: LatLngExpression =
    points.length > 0 ? points[Math.floor(points.length / 2)] : [39.0, 35.0];

  const patchParams = (patch: Record<string, string | undefined>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(patch)) {
        if (!v) next.delete(k);
        else next.set(k, v);
      }
      return next;
    }, { replace: true });
  };

  const toggleSetParam = <T extends string>(name: string, current: T[], value: T) => {
    const set = new Set<T>(current);
    if (set.has(value)) set.delete(value); else set.add(value);
    patchParams({ [name]: set.size > 0 ? Array.from(set).join(",") : undefined });
  };

  const activeFilterCount =
    ptypes.length + modes.length + statuses.length +
    (priceMin !== undefined ? 1 : 0) + (priceMax !== undefined ? 1 : 0) + (city ? 1 : 0);

  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="min-h-screen pt-20 pb-8 bg-slate-950">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white gap-2">
              <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
            </Button>
            <h1 className="text-xl md:text-2xl font-normal text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[var(--metin-ikincil)]" /> Harita Üzerinden Arama
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>{filtered.length} ilan</span>
            {catalogLoading ? <span className="text-xs text-slate-500">(yükleniyor…)</span> : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setFiltersOpen((v) => !v)}
              className="gap-1.5 lg:hidden"
              aria-expanded={filtersOpen}
              aria-controls="map-filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filtre {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          {/* Sol filtre overlay (sticky desktop, collapse mobile) */}
          <aside
            id="map-filters"
            className={cn(
              "rounded-[20px] border border-white/10 bg-slate-900/60 backdrop-blur p-4 space-y-4 text-sm text-slate-200 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto",
              filtersOpen ? "block" : "hidden lg:block",
            )}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-normal uppercase tracking-wider text-xs text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Filtreler
              </h2>
              {activeFilterCount > 0 ? (
                <button type="button" onClick={clearAll} className="text-[10px] text-[var(--metin-ikincil)] hover:text-white uppercase tracking-wider">
                  <X className="w-3 h-3 inline" /> Temizle
                </button>
              ) : null}
            </div>

            <section>
              <h3 className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Mülk Tipi</h3>
              <div className="space-y-1">
                {PROPERTY_TYPES.map((t) => (
                  <label key={t.key} className="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={ptypes.includes(t.key)}
                      onChange={() => toggleSetParam<PropertyType>("ptype", ptypes, t.key)}
                      className="h-3.5 w-3.5 accent-[var(--metin-ikincil)]"
                    />
                    <span className="text-xs">{t.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">İl</h3>
              <select
                value={city}
                onChange={(e) => patchParams({ city: e.target.value || undefined })}
                className="w-full text-xs rounded-[3px] border border-white/10 bg-slate-950 px-2 py-1.5 text-white"
                aria-label="İl"
              >
                <option value="">Tüm iller</option>
                {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </section>

            <section>
              <h3 className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Fiyat (₺)</h3>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="number"
                  min={0}
                  step={100000}
                  value={priceMin ?? ""}
                  onChange={(e) => patchParams({ pmin: e.target.value || undefined })}
                  placeholder="Min"
                  className="text-xs rounded-[3px] border border-white/10 bg-slate-950 px-2 py-1.5 text-white"
                  aria-label="Minimum fiyat"
                />
                <input
                  type="number"
                  min={0}
                  step={100000}
                  value={priceMax ?? ""}
                  onChange={(e) => patchParams({ pmax: e.target.value || undefined })}
                  placeholder="Max"
                  className="text-xs rounded-[3px] border border-white/10 bg-slate-950 px-2 py-1.5 text-white"
                  aria-label="Maksimum fiyat"
                />
              </div>
            </section>

            <section>
              <h3 className="text-[10px] uppercase tracking-wider text-[var(--metin-ikincil)] mb-1.5 flex items-center gap-1">
                <Gavel className="w-3 h-3" /> İhale Tipi
              </h3>
              <div className="space-y-1">
                {AUCTION_MODES.map((m) => (
                  <label key={m.key} className="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={modes.includes(m.key)}
                      onChange={() => toggleSetParam<AuctionMode>("mode", modes, m.key)}
                      className="h-3.5 w-3.5 accent-[var(--metin-ikincil)]"
                    />
                    <m.icon className="w-3 h-3 opacity-70" />
                    <span className="text-xs">{m.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Durum</h3>
              <div className="space-y-1">
                {AUCTION_STATUS.map((s) => (
                  <label key={s.key} className="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={statuses.includes(s.key)}
                      onChange={() => toggleSetParam<AuctionStatus>("status", statuses, s.key)}
                      className="h-3.5 w-3.5 accent-[var(--metin-ikincil)]"
                    />
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs">{s.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-700/50 leading-relaxed">
              Marker rengi: <span style={{ color: "var(--durum-hata)" }}>kırmızı = canlı</span> ·{" "}
              <span style={{ color: "var(--vurgu)" }}>mavi = yaklaşan</span> ·{" "}
              <span style={{ color: "var(--metin-ikincil)" }}>gri = biten</span>
            </div>
          </aside>

          {/* Sağ: Harita */}
          <div className="rounded-[20px] overflow-hidden border border-white/10 bg-slate-900/40" data-testid="map-container">
            <MapContainer
              center={center}
              zoom={6}
              style={{ height: "calc(100vh - 8rem)", minHeight: 480, width: "100%" }}
              scrollWheelZoom
              key={`${filtered.length}-key`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filtered.length > 0 ? <FitBounds points={points} /> : null}
              <ClusterLayer auctions={filtered} />
            </MapContainer>
            {filtered.length === 0 && !catalogLoading ? (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="pointer-events-auto rounded-[20px] border border-[var(--cizgi)] bg-slate-950/85 backdrop-blur px-5 py-4 text-center text-sm text-[var(--metin-ikincil)] max-w-xs">
                  <p className="font-normal mb-1">Bu kriterlere uyan ilan yok</p>
                  <p className="text-xs text-slate-400 mb-3">Filtreleri biraz gevşetmeyi deneyin.</p>
                  <button type="button" onClick={clearAll} className="text-xs px-3 py-1 rounded-[3px] bg-[var(--zemin-yumusak)] hover:bg-[var(--zemin)] text-[var(--metin)] font-normal">
                    Filtreleri Temizle
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Pop-up linkleri için: Leaflet popup html'i tarayıcıda <a href=> ile yeni sekme açmaz; aynı sekmede /ilan/:id'e gider — SPA route yakalar.
            (Bu sayfanın altında özet bilgi notu) */}
        <p className="text-[11px] text-slate-500 mt-3 text-center max-w-2xl mx-auto leading-relaxed">
          Marker'a tıklayın → pop-up'tan "İlan detayı" linkine basın. Cluster (numaralı yuvarlak)
          uzaklaştırınca toplanır, yaklaşınca açılır.
        </p>
      </div>
    </div>
  );
}
