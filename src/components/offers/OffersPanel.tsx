import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/async/LoadingState";
import { Button } from "@/components/ui/button";
import { useBuyerOffers, useOfferActions, useSellerOffers } from "@/hooks/useListingOffers";
import {
  isOfferAmountVisible,
  maskOfferAmount,
  offerStatusLabel,
  type ListingOfferRow,
} from "@/lib/offers/listingOffers";

type Props = {
  mode: "buyer" | "seller";
};

function OfferAmount({
  offer,
  viewerId,
  viewerIsSeller,
}: {
  offer: ListingOfferRow;
  viewerId: string;
  viewerIsSeller: boolean;
}) {
  const visible = isOfferAmountVisible(offer, viewerId, viewerIsSeller);
  if (!visible) return <span className="text-[var(--metin-ikincil)]">{maskOfferAmount()}</span>;
  return <span className="text-white font-normal">₺{offer.amount_try.toLocaleString("tr-TR")}</span>;
}

function SellerActions({
  offer,
  onDone,
}: {
  offer: ListingOfferRow;
  onDone: () => void;
}) {
  const { act, busy } = useOfferActions(onDone);
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");
  if (offer.status !== "pending" && offer.status !== "countered") return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy}
          className="h-8 bg-[var(--zemin-yumusak)] text-white"
          onClick={() => void act({ offerId: offer.id, status: "accepted" })}
        >
          Kabul
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          className="h-8 border-[var(--cizgi)] text-[var(--metin-ikincil)]"
          onClick={() => void act({ offerId: offer.id, status: "rejected" })}
        >
          Red
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} className="h-8" onClick={() => setCounterOpen((v) => !v)}>
          Karşı teklif
        </Button>
      </div>
      {counterOpen ? (
        <div className="flex gap-2">
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
    </div>
  );
}

export function OffersPanel({ mode }: Props) {
  const { user } = useAuth();
  const buyer = useBuyerOffers();
  const seller = useSellerOffers();
  const data = mode === "buyer" ? buyer : seller;

  if (!user) {
    return (
      <p className="text-sm text-slate-400">
        Teklifleri görmek için <Link to="/giris" className="text-[var(--metin-ikincil)] underline">giriş yapın</Link>.
      </p>
    );
  }

  if (data.loading) return <LoadingState compact label="Teklifler yükleniyor…" />;

  const offers = data.offers;
  const sealedHiddenCount =
    mode === "seller"
      ? offers.filter(
          (o) =>
            o.is_sealed &&
            !isOfferAmountVisible(o, user.id, true) &&
            o.status === "pending",
        ).length
      : 0;

  return (
    <div className="space-y-4">
      {mode === "seller" && sealedHiddenCount > 0 ? (
        <p className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-2 text-xs text-[var(--metin-ikincil)]">
          {sealedHiddenCount} kapalı teklif süresi dolana kadar tutarı gizli — yalnız adet görünür.
        </p>
      ) : null}
      {offers.length === 0 ? (
        <p className="text-sm text-slate-400">
          {mode === "buyer" ? "Henüz teklifiniz yok." : "İlanlarınıza gelen teklif yok."}
        </p>
      ) : (
        <ul className="divide-y divide-white/5 rounded-[20px] border border-white/10">
          {offers.map((offer) => (
            <li key={offer.id} className="p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-normal text-white">{offer.listing_title ?? "İlan"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(offer.created_at).toLocaleString("tr-TR")} · {offerStatusLabel(offer.status)}
                    {offer.is_sealed ? " · Kapalı" : ""}
                  </p>
                </div>
                <OfferAmount offer={offer} viewerId={user.id} viewerIsSeller={mode === "seller"} />
              </div>
              {offer.counter_amount_try ? (
                <p className="mt-1 text-xs text-[var(--metin-ikincil)]">
                  Karşı teklif: ₺{offer.counter_amount_try.toLocaleString("tr-TR")}
                </p>
              ) : null}
              {mode === "seller" ? <SellerActions offer={offer} onDone={() => void seller.reload()} /> : null}
              {mode === "buyer" ? (
                <Link to={`/ilan/${offer.listing_id}`} className="mt-2 inline-block text-xs text-[var(--metin-ikincil)] underline">
                  İlanı aç
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
