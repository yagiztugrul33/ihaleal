import { useEffect, useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/async/LoadingState";
import { fetchAvmPriceEstimate, type AvmEstimateResult } from "@/lib/ai/aiPriceEstimateClient";

type Props = {
  city: string;
  district: string;
  areaM2: number;
  listingPrice?: number;
};

export function AvmEstimateSection({ city, district, areaM2, listingPrice }: Props) {
  const [result, setResult] = useState<AvmEstimateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    void fetchAvmPriceEstimate({ city, district, areaM2 })
      .then((row) => {
        if (!alive) return;
        if (!row) {
          setError("AVM tahmini şu an alınamadı.");
          setResult(null);
          return;
        }
        setResult(row);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [city, district, areaM2]);

  return (
    <Card className="border-violet-500/25 bg-violet-500/5">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-300" />
          <h3 className="text-sm font-semibold text-white">Otomatik değer tahmini (AVM)</h3>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400 flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
          Bu değer yalnızca tahminidir; bağlayıcı veya resmi SPK ekspertiz raporu değildir. Yatırım kararı için uzman görüşü alın.
        </p>
        {loading ? <LoadingState compact label="AVM hesaplanıyor…" /> : null}
        {!loading && error ? <p className="text-sm text-slate-400">{error}</p> : null}
        {!loading && result ? (
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-slate-500">Tahmini band</p>
              <p className="font-semibold text-white">
                ₺{result.low.toLocaleString("tr-TR")} – ₺{result.high.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-slate-500">Merkez tahmin</p>
              <p className="font-semibold text-violet-200">₺{result.point.toLocaleString("tr-TR")}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-slate-500">Güven / örnek</p>
              <p className="font-semibold text-slate-200">
                %{Math.round(result.confidence * 100)} · n={result.sampleSize}
              </p>
            </div>
          </div>
        ) : null}
        {listingPrice && result ? (
          <p className="text-xs text-slate-500">
            İlan fiyatı: ₺{listingPrice.toLocaleString("tr-TR")} · AVM farkı:{" "}
            {listingPrice > result.point ? "üstünde" : listingPrice < result.point ? "altında" : "yakın"}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
