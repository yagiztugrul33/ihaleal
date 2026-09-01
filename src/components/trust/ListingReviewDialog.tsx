import { useState } from "react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  reviewedId: string;
  onSubmitted?: () => void;
};

export function ListingReviewDialog({ open, onOpenChange, listingId, reviewedId, onSubmitted }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!isSupabaseConfigured() || !user?.id) {
      setError("Değerlendirme için giriş yapmanız gerekir.");
      return;
    }
    if (user.id === reviewedId) {
      setError("Kendi profilinize puan veremezsiniz.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: insertErr } = await supabase.from("listing_reviews").insert({
      listing_id: listingId,
      reviewer_id: user.id,
      reviewed_id: reviewedId,
      rating,
      comment: comment.trim() || null,
    });
    setBusy(false);
    if (insertErr) {
      setError("Değerlendirme kaydedilemedi. Daha önce puan vermiş olabilirsiniz.");
      return;
    }
    onOpenChange(false);
    setComment("");
    setRating(5);
    onSubmitted?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 border-slate-200/80 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>İşlem sonrası değerlendirme</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm text-slate-400 mb-2">Puan (1–5)</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="rounded-[10px] p-2 hover:bg-white/5"
                  aria-label={`${n} yıldız`}
                >
                  <Star
                    className={`h-6 w-6 ${n <= rating ? "fill-amber-400 text-[var(--metin-ikincil)]" : "text-slate-600"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Yorum (isteğe bağlı)</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Deneyiminizi kısaca paylaşın…"
              className="bg-slate-900 border-slate-700 text-white min-h-[88px]"
              maxLength={500}
            />
          </div>
          {error ? <p className="text-sm text-[var(--metin-ikincil)]">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600">
            İptal
          </Button>
          <Button type="button" disabled={busy} onClick={() => void submit()} className="bg-[var(--zemin-yumusak)] text-white">
            {busy ? "Kaydediliyor…" : "Gönder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
