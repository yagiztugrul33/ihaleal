import { useCallback, useEffect, useState } from "react";
import { HandCoins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/async/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchOffersForListing } from "@/lib/offers/listingOffersClient";
import { useOfferActions } from "@/hooks/useListingOffers";
import {
  isOfferAmountVisible,
  maskOfferAmount,
  offerStatusLabel,
  type ListingOfferRow,
} from "@/lib/offers/listingOffers";

type Props = {
  listingId: string;
  className?: string;
};

function OfferRow({
  offer,
  viewerId,
  onDone,
}: {
  offer: ListingOfferRow;
  viewerId: string;
  onDone: () => void;
}) {
  const { act, busy } = useOfferActions(onDone);
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");
  const visible = isOfferAmountVisible(offer, viewerId, true);

  return (
    <li className="p-3 rounded-[10px] border border-white/10 bg-white/[0.02] text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500">
            {new Date(offer.created_at).toLocaleString("tr-TR")} · {offerStatusLabel(offer.status)}
            {offer.is_sealed ? " · Kapalı" : ""}
          </p>
        </div>
        <span className="font-normal text-white">
          {visible ? `₺${offer.amount_try.toLocaleString("tr-TR")}` : maskOfferAmount()}
        </span>
      </div>
      {(offer.status === "pending" || offer.status === "countered") && visible ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" size="sm" disabled={busy} className="h-8 bg-[var(--zemin-yumusak)]" onClick={() => void act({ offerId: offer.id, status: "accepted" })}>
            Kabul
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={busy} className="h-8 border-[var(--cizgi)] text-[var(--metin-ikincil)]" onClick={() => void act({ offerId: offer.id, status: "rejected" })}>
            Red
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={busy} className="h-8" onClick={() => setCounterOpen((v) => !v)}>
            Karşı teklif
          </Button>
        </div>
      ) : null}
      {counterOpen ? (
        <div className="mt-2 flex gap-2">
          <Input
            value={counterAmount}
            onChange={(e) => setCounterAmount(e.target.value)}
            placeholder="Karşı tutar (₺)"
            className="h-8 border-slate-700 bg-slate-900 text-white text-sm"
          />
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={() => {
              const n = Number(String(counterAmount).replace(/\D/g, ""));
              if (!Number.isFinite(n) || n <= 0) return;
              void act({ offerId: offer.id, status: "countered", counterAmountTry: n });
              setCounterOpen(false);
            }}
          >
            Gönder
          </Button>
        </div>
      ) : null}
    </li>
  );
}

export function ListingOffersSection({ listingId, className }: Props) {
  const { user } = useAuth();
  const [offers, setOffers] = useState<ListingOfferRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setOffers(await fetchOffersForListing(listingId));
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const hiddenSealed = offers.filter(
    (o) => o.is_sealed && user?.id && !isOfferAmountVisible(o, user.id, true) && o.status === "pending",
  ).length;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <HandCoins className="h-4 w-4 text-[var(--metin-ikincil)]" />
        <h4 className="text-sm font-normal text-white">Gelen teklifler</h4>
        <span className="text-xs text-slate-500 ms-auto">{offers.length} kayıt</span>
      </div>
      {hiddenSealed > 0 ? (
        <p className="mb-2 text-xs text-[var(--metin-ikincil)] rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-2 py-1.5">
          {hiddenSealed} kapalı teklif tutarı süre sonuna kadar gizli.
        </p>
      ) : null}
      {loading ? (
        <LoadingState compact label="Teklifler yükleniyor…" />
      ) : offers.length === 0 ? (
        <p className="text-xs text-slate-500">Henüz teklif yok.</p>
      ) : (
        <ul className="space-y-2">
          {offers.map((offer) => (
            <OfferRow key={offer.id} offer={offer} viewerId={user?.id ?? ""} onDone={() => void reload()} />
          ))}
        </ul>
      )}
    </div>
  );
}
