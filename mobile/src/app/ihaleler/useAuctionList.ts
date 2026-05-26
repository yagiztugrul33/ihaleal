import { useCallback, useEffect, useState } from "react";

import { fetchMockAuctions } from "./data";
import type { AuctionListItem } from "./types";

type State = {
  loading: boolean;
  error: string | null;
  data: AuctionListItem[];
};

const initialState: State = { loading: true, error: null, data: [] };

export function useAuctionList() {
  const [state, setState] = useState<State>(initialState);
  const [forceError, setForceError] = useState(false);

  const fetchRows = useCallback(async (): Promise<AuctionListItem[]> => {
    if (forceError) {
      throw new Error("Mock hata modu aktif.");
    }
    return fetchMockAuctions();
  }, [forceError]);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const rows = await fetchRows();
      setState({ loading: false, error: null, data: rows });
    } catch {
      setState({ loading: false, error: "İhale listesi yüklenemedi. Tekrar deneyin.", data: [] });
    }
  }, [fetchRows]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await fetchRows();
        if (!cancelled) setState({ loading: false, error: null, data: rows });
      } catch {
        if (!cancelled) {
          setState({ loading: false, error: "İhale listesi yüklenemedi. Tekrar deneyin.", data: [] });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchRows]);

  return {
    ...state,
    reload: load,
    forceError,
    toggleForceError: () => setForceError((prev) => !prev),
  };
}
