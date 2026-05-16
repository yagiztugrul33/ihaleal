import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type AuctionState = {
  id: string;
  current_price: number;
  current_winner: string | null;
  end_at: string;
  bid_count: number;
  status: string;
  updated_at: string;
};

type Options = { pollMs?: number; staleAfterMs?: number };

export function useAuctionState(auctionId: string, opts: Options = {}) {
  const pollMs = opts.pollMs ?? 5000;
  const staleAfterMs = opts.staleAfterMs ?? 15000;

  const [state, setState] = useState<AuctionState | null>(null);
  const [transport, setTransport] = useState<"realtime" | "polling" | "init">("init");
  const [error, setError] = useState<string | null>(null);

  const lastUpdateRef = useRef(Date.now());
  const mountedRef = useRef(true);

  const mapRow = (row: Record<string, unknown>): AuctionState => ({
    id: String(row.id),
    current_price: Number(row.current_high_bid_try ?? 0),
    current_winner: (row.current_high_bidder_id as string) ?? null,
    end_at: String(row.ends_at),
    bid_count: Number(row.bid_count ?? 0),
    status: String(row.status),
    updated_at: String(row.updated_at ?? row.ends_at ?? new Date().toISOString()),
  });

  const applyState = useCallback((next: AuctionState) => {
    setState((prev) => {
      if (prev && new Date(next.updated_at) < new Date(prev.updated_at)) return prev;
      return next;
    });
    lastUpdateRef.current = Date.now();
  }, []);

  const fetchOnce = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const { data, error: err } = await supabase
      .from("auctions")
      .select("id,current_high_bid_try,current_high_bidder_id,ends_at,bid_count,status,updated_at")
      .eq("id", auctionId)
      .single();
    if (err) {
      setError(err.message);
      return;
    }
    if (data && mountedRef.current) applyState(mapRow(data as Record<string, unknown>));
  }, [auctionId, applyState]);

  useEffect(() => {
    mountedRef.current = true;
    void fetchOnce();

    if (!isSupabaseConfigured()) return () => { mountedRef.current = false; };

    const channel = supabase
      .channel(`auction:${auctionId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "auctions", filter: `id=eq.${auctionId}` },
        (payload) => {
          if (!mountedRef.current) return;
          applyState(mapRow(payload.new as Record<string, unknown>));
          setTransport("realtime");
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setTransport("realtime");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setTransport("polling");
        }
      });

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [auctionId, fetchOnce, applyState]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const elapsed = Date.now() - lastUpdateRef.current;
      if (transport !== "realtime" || elapsed > staleAfterMs) {
        void fetchOnce();
        if (transport === "realtime" && elapsed > staleAfterMs) setTransport("polling");
      }
    }, pollMs);
    return () => clearInterval(id);
  }, [transport, pollMs, staleAfterMs, fetchOnce]);

  const placeBid = useCallback(async (amount: number) => {
    const idem = crypto.randomUUID();
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    if (!token) throw new Error("not_authenticated");

    const base = import.meta.env.VITE_SUPABASE_URL as string;
    const res = await fetch(`${base}/functions/v1/place-bid`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
        "idempotency-key": idem,
      },
      body: JSON.stringify({ auction_id: auctionId, amount }),
    });
    const body = await res.json();
    if (!res.ok || !body.ok) {
      const err = new Error(body.error ?? "bid_failed") as Error & { meta?: unknown };
      err.meta = body;
      throw err;
    }
    if (state) {
      applyState({
        ...state,
        current_price: body.new_current_price ?? amount,
        end_at: body.new_end_at ?? state.end_at,
        bid_count: state.bid_count + 1,
        updated_at: new Date().toISOString(),
      });
    }
    return body;
  }, [auctionId, state, applyState]);

  return { state, transport, error, placeBid, refresh: fetchOnce };
}
