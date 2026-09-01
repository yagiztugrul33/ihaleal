import { Eye, Heart, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/enterprise";
import { useSellerAnalytics } from "@/hooks/useSellerAnalytics";
import { LoadingState } from "@/components/async/LoadingState";

export function SellerAnalyticsPanel() {
  const { data, loading, error } = useSellerAnalytics();

  if (loading) return <LoadingState compact label="Analitik yükleniyor…" />;
  if (error) {
    return <p className="text-sm text-[var(--metin-ikincil)]">{error}</p>;
  }
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Toplam görüntülenme" value={data.totalViews.toLocaleString("tr-TR")} icon={Eye} />
        <MetricCard label="Favori" value={String(data.totalFavorites)} icon={Heart} />
        <MetricCard label="Mesaj" value={String(data.totalMessages)} icon={MessageSquare} />
      </div>
      {data.listings.length > 0 ? (
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-normal text-white">İlan bazlı özet</h3>
            <ul className="divide-y divide-white/5 text-sm">
              {data.listings.slice(0, 8).map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span className="text-slate-200 line-clamp-1">{row.title}</span>
                  <span className="text-xs text-slate-400 shrink-0">
                    {row.viewCount} gör · {row.favoriteCount} fav · {row.messageCount} mesaj
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
