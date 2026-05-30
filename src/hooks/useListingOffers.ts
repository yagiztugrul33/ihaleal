import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchBuyerOffers,
  fetchSellerOffers,
  submitListingOffer,
  updateOfferStatus,
} from "@/lib/offers/listingOffersClient";
import type { ListingOfferRow } from "@/lib/offers/listingOffers";

export function useBuyerOffers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<ListingOfferRow[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user?.id) {
      setOffers([]);
      return;
    }
    setLoading(true);
    try {
      setOffers(await fetchBuyerOffers(user.id));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { offers, loading, reload };
}

export function useSellerOffers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<ListingOfferRow[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user?.id) {
      setOffers([]);
      return;
    }
    setLoading(true);
    try {
      setOffers(await fetchSellerOffers(user.id));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { offers, loading, reload };
}

export function useSubmitOffer() {
  const [busy, setBusy] = useState(false);
  const submit = useCallback(
    async (input: Parameters<typeof submitListingOffer>[0]) => {
      setBusy(true);
      try {
        return await submitListingOffer(input);
      } finally {
        setBusy(false);
      }
    },
    [],
  );
  return { submit, busy };
}

export function useOfferActions(onDone?: () => void) {
  const [busy, setBusy] = useState(false);
  const act = useCallback(
    async (input: Parameters<typeof updateOfferStatus>[0]) => {
      setBusy(true);
      try {
        const res = await updateOfferStatus(input);
        if (res.ok) onDone?.();
        return res;
      } finally {
        setBusy(false);
      }
    },
    [onDone],
  );
  return { act, busy };
}
