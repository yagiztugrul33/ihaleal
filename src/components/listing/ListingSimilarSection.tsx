import { useNavigate } from "react-router-dom";
import type { Auction } from "@/types/auction";
import { ListingCoverImage } from "@/components/ListingCoverImage";
import { MapPin } from "lucide-react";

type Props = {
  currentId: string;
  catalog: Auction[];
  city?: string;
  category?: string;
  limit?: number;
};

export function ListingSimilarSection({ currentId, catalog, city, category, limit = 4 }: Props) {
  const navigate = useNavigate();
  const similar = catalog
    .filter((a) => a.id !== currentId)
    .filter((a) => (city ? a.city === city : true) || (category ? a.category === category : true))
    .slice(0, limit);

  if (similar.length === 0) return null;

  return (
    <section className="mt-10 border-t border-slate-200/80 pt-8">
      <h2 className="mb-4 text-lg font-bold text-white">Benzer ilanlar</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {similar.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => navigate(`/ilan/${a.id}`)}
            className="flex gap-3 rounded-xl border border-slate-200/80 bg-slate-900/30 p-3 text-left hover:border-blue-500/30"
          >
            <ListingCoverImage src={a.images[0]} alt={a.title} className="h-16 w-24 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-medium text-white">{a.title}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3" /> {a.district}, {a.city}
              </p>
              <p className="mt-1 text-sm font-semibold text-blue-400">
                ₺{a.currentBid.toLocaleString("tr-TR")}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
