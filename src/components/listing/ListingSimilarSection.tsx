import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Auction } from "@/types/auction";
import { ListingCoverImage } from "@/components/ListingCoverImage";
import { LoadingState } from "@/components/async/LoadingState";
import { MapPin } from "lucide-react";
import {
  fetchSimilarListings,
  pickSimilarFromCatalog,
  type SimilarListingItem,
} from "@/lib/listingSimilar";

type Props = {
  currentId: string;
  catalog: Auction[];
  city?: string;
  district?: string;
  category?: string;
  priceTry: number;
  limit?: number;
};

export function ListingSimilarSection({
  currentId,
  catalog,
  city,
  district,
  category,
  priceTry,
  limit = 4,
}: Props) {
  const navigate = useNavigate();
  const [items, setItems] = useState<SimilarListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"live" | "catalog">("catalog");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    void fetchSimilarListings({ currentId, city, district, category, priceTry, limit })
      .then((rows) => {
        if (!alive) return;
        if (rows.length > 0) {
          setItems(rows);
          setSource("live");
          return;
        }
        setItems(pickSimilarFromCatalog(catalog, currentId, { city, category, priceTry }, limit));
        setSource("catalog");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [currentId, catalog, city, district, category, priceTry, limit]);

  if (loading) {
    return (
      <section className="mt-10 border-t border-slate-200/80 pt-8">
        <LoadingState compact label="Benzer ilanlar yükleniyor…" />
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="mt-10 border-t border-slate-200/80 pt-8">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-normal text-white">Benzer ilanlar</h2>
        <span className="text-[10px] uppercase tracking-wider text-slate-500">
          {source === "live" ? "Canlı sorgu" : "Katalog eşleşmesi"}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => navigate(`/ilan/${a.id}`)}
            className="flex gap-3 rounded-[20px] border border-slate-200/80 bg-slate-900/30 p-3 text-start hover:border-blue-500/30"
          >
            <ListingCoverImage
              src={a.image ?? ""}
              alt={a.title}
              className="h-16 w-24 shrink-0 rounded-[10px] object-cover"
            />
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-normal text-white">{a.title}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3" aria-hidden />
                {[a.district, a.city].filter(Boolean).join(", ")}
              </p>
              <p className="mt-1 text-sm font-normal text-blue-400">₺{a.price.toLocaleString("tr-TR")}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
