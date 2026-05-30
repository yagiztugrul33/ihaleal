import { useState } from "react";
import { HandCoins } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useSubmitOffer } from "@/hooks/useListingOffers";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  referencePrice: number;
  onSubmitted?: () => void;
};

export function ListingOfferDialog({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  referencePrice,
  onSubmitted,
}: Props) {
  const [amount, setAmount] = useState(String(Math.round(referencePrice * 0.95)));
  const [isSealed, setIsSealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { submit, busy } = useSubmitOffer();

  const handleSubmit = async () => {
    setError(null);
    const amountTry = Number(String(amount).replace(/\D/g, ""));
    if (!Number.isFinite(amountTry) || amountTry <= 0) {
      setError("Geçerli bir tutar girin.");
      return;
    }
    const sealedUntil = isSealed
      ? new Date(Date.now() + 7 * 86_400_000).toISOString()
      : null;
    const res = await submit({ listingId, amountTry, isSealed, sealedUntil });
    if (!res.ok) {
      setError(res.error ?? "Teklif gönderilemedi.");
      return;
    }
    onOpenChange(false);
    onSubmitted?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 border-slate-200/80 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5 text-amber-400" />
            Teklif / pazarlık
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-400 line-clamp-2">{listingTitle}</p>
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Teklif tutarı (₺)</label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              className="border-slate-700 bg-slate-900 text-white"
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer">
            <Checkbox checked={isSealed} onCheckedChange={(v) => setIsSealed(v === true)} />
            <span>
              Kapalı teklif — tutar süre sonuna kadar satıcıya gizli kalır (yalnız teklif sayısı görünür).
            </span>
          </label>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <p className="text-[11px] text-slate-500">
            Bu akış açık artırma teklifinden ayrıdır; mevcut ihale motorunu etkilemez.
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600">
            İptal
          </Button>
          <Button type="button" disabled={busy} onClick={() => void handleSubmit()} className="bg-amber-500 text-slate-950">
            {busy ? "Gönderiliyor…" : "Teklif gönder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
