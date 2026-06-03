/**
 * Yakınımdaki İlanlar — tek seferlik tarayıcı geolocation ile mesafe-bazlı arama.
 *
 * Dürüstlük + KVKK:
 *  - İzin yalnız kullanıcı butona basınca istenir (sayfa açılışında SORULMAZ).
 *  - getCurrentPosition TEK SEFERLİK (watchPosition/sürekli takip YOK — o FAZ-2).
 *  - Konum SADECE component state'inde tutulur; localStorage/DB'ye YAZILMAZ.
 *  - Gerçek Haversine mesafesi (ilan mapLat/mapLng); sahte mesafe/sonuç YOK.
 *  - İzin reddi → nazik fallback (şehir seçimi), hata ekranı yok.
 *
 * Çekirdeğe sıfır dokunuş: yalnız okuma (catalog) + filtre + UI.
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, LocateFixed, Loader2, Navigation } from "lucide-react";
import type { Auction } from "@/types/auction";
import { haversineDistanceM } from "@/lib/geo/haversine";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

const RADII_KM = [5, 10, 25] as const;
type Status = "idle" | "locating" | "ready" | "denied" | "unavailable";

function formatTRY(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M ₺`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K ₺`;
  return `${v.toLocaleString("tr-TR")} ₺`;
}

export function NearbyListings({ catalog }: { catalog: Auction[] }) {
  const { t } = useLocale();
  const n = t.nearby;
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("idle");
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        // KVKK: konum yalnız state'te; hiçbir yere yazılmaz.
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setStatus("ready");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 0 },
    );
  };

  const withDistance = useMemo(() => {
    if (!pos) return [] as { a: Auction; km: number }[];
    return catalog
      .filter((a) => Number.isFinite(a.mapLat) && Number.isFinite(a.mapLng))
      .map((a) => ({ a, km: haversineDistanceM(pos.lat, pos.lng, a.mapLat, a.mapLng) / 1000 }))
      .sort((x, y) => x.km - y.km);
  }, [pos, catalog]);

  const results = useMemo(
    () => withDistance.filter((r) => r.km <= radiusKm),
    [withDistance, radiusKm],
  );

  const KmNumber = ({ value, digits = 0 }: { value: number; digits?: number }) => (
    // AR'da sayı + birim LTR akmalı.
    <span dir="ltr">
      {value.toFixed(digits)} {n.kmSuffix}
    </span>
  );

  return (
    <section className="mb-8 rounded-2xl border border-blue-500/20 bg-slate-900/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-blue-400" aria-hidden />
          <h2 className="text-lg font-semibold text-white">{n.resultsTitle}</h2>
        </div>
        {status === "idle" || status === "denied" || status === "unavailable" ? (
          <button
            type="button"
            onClick={requestLocation}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            <LocateFixed className="h-4 w-4" aria-hidden />
            {n.button}
          </button>
        ) : null}
        {status === "locating" ? (
          <span className="inline-flex items-center gap-2 text-sm text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {n.locating}
          </span>
        ) : null}
      </div>

      {/* Tanıtım + KVKK notu (idle) */}
      {status === "idle" ? (
        <p className="mt-2 text-sm text-slate-400">
          {n.intro} <span className="text-slate-500">· {n.privacyNote}</span>
        </p>
      ) : null}

      {/* İzin reddi / desteklenmiyor → nazik fallback (hata ekranı yok) */}
      {status === "denied" ? (
        <p className="mt-2 text-sm text-amber-200/90">{n.denied}</p>
      ) : null}
      {status === "unavailable" ? (
        <p className="mt-2 text-sm text-amber-200/90">{n.unavailable}</p>
      ) : null}

      {/* Sonuçlar (ready) */}
      {status === "ready" ? (
        <div className="mt-4">
          {/* Yarıçap seçici */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">{n.radiusLabel}:</span>
            {RADII_KM.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadiusKm(r)}
                className={cn(
                  "rounded-lg border px-3 py-1 text-xs font-semibold transition-colors",
                  radiusKm === r
                    ? "border-blue-400 bg-blue-500/15 text-blue-200"
                    : "border-slate-700 text-slate-400 hover:border-slate-500",
                )}
                aria-pressed={radiusKm === r}
              >
                <KmNumber value={r} />
              </button>
            ))}
            <span className="text-xs text-slate-500">
              · {n.countWithin.replace("{r}", String(radiusKm)).replace("{n}", String(results.length))}
            </span>
          </div>

          {results.length === 0 ? (
            <p className="rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
              {n.empty.replace("{r}", String(radiusKm))}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {results.map(({ a, km }) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => navigate(`/ilan/${a.id}`)}
                  className="group rounded-2xl border border-blue-500/25 bg-slate-900/40 text-start transition-all hover:border-blue-400/50 overflow-hidden"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
                    <img
                      loading="lazy"
                      src={a.images[0]}
                      alt={a.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute top-2 start-2">
                      <CountdownTimer endDate={a.endDate} status={a.status} size="sm" layout="compact" />
                    </div>
                    {/* Mesafe rozeti — sayı LTR */}
                    <div className="absolute bottom-2 end-2 rounded-full bg-blue-600/90 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                      <KmNumber value={km} digits={1} />
                    </div>
                  </div>
                  <div className="space-y-1.5 p-3">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">{a.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden />
                      <span className="truncate">{a.district}, {a.city}</span>
                    </div>
                    <div className="text-base font-bold text-blue-400" dir="ltr">{formatTRY(a.currentBid)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <p className="mt-3 text-[11px] text-slate-500">{n.privacyNote}</p>
        </div>
      ) : null}
    </section>
  );
}

export default NearbyListings;
