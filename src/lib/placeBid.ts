import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MIN_INCREMENT_TRY } from "@/lib/fees";
import type { PlaceBidResult } from "./placeBid.types";

// Tipi ayrı modülden re-export — mobile facade'lar transitive supabase resolve
// etmek zorunda kalmadan tipi kullanabilsin (mimari karar 2026-05-28).
export type { PlaceBidResult };

/** Makul üst sınır — taşkın / hatalı girişten RPC'yi korur */
const MAX_BID_TRY = 9_999_999_999_999;
const CLIENT_BID_MIN_INTERVAL_MS = 1200;
const lastBidAttemptByAuction = new Map<string, number>();

/**
 * Teklif tutarı girişi: binlik ayraçları temizler, pozitif tam sayı döner.
 */
export function parsePositiveTryFromInput(raw: string): number | null {
  const t = raw.trim();
  if (t.startsWith("-") || t.startsWith("−")) return null;
  const digits = t.replace(/\D/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n) || n <= 0 || n > MAX_BID_TRY) return null;
  return n;
}

function parseRpcPayload(data: unknown): Record<string, unknown> | null {
  if (data == null) return null;
  if (typeof data === "object" && !Array.isArray(data)) return data as Record<string, unknown>;
  if (typeof data === "string") {
    try {
      const o = JSON.parse(data) as unknown;
      return typeof o === "object" && o !== null && !Array.isArray(o) ? (o as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Sunucu tarafı `place_bid` RPC (idempotency + FOR UPDATE).
 * Demo/statik ilanlarda kullanılmaz; yalnızca gerçek UUID Supabase ihaleleri.
 */
export async function placeBidRpc(params: {
  auctionId: string;
  amountTry: number;
  /** Aynı istek tekrarında double-submit önlemek için istemci sabit anahtar üretebilir. */
  idempotencyKey?: string;
}): Promise<PlaceBidResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase yapılandırması eksik (.env.local)." };
  }
  if (!Number.isFinite(params.amountTry) || params.amountTry <= 0 || params.amountTry > MAX_BID_TRY) {
    return { ok: false, message: "Geçersiz veya çok büyük tutar." };
  }
  const now = Date.now();
  const lastTs = lastBidAttemptByAuction.get(params.auctionId) ?? 0;
  if (now - lastTs < CLIENT_BID_MIN_INTERVAL_MS) {
    return { ok: false, message: "Cok hizli tekrar denemesi algilandi. Lutfen kisa bir sure bekleyin." };
  }
  lastBidAttemptByAuction.set(params.auctionId, now);

  // UI/istemci savunmasi: self-bid'i erken kes.
  // Not: Esas kural sunucu/RPC tarafinda da zorunlu olmalidir.
  const { data: authData } = await supabase.auth.getUser();
  const bidderId = authData.user?.id ?? null;
  if (bidderId) {
    const { data: auctionRow } = await supabase
      .from("auctions")
      .select("listing_id")
      .eq("id", params.auctionId)
      .maybeSingle();
    const listingId = (auctionRow as { listing_id?: string } | null)?.listing_id ?? null;
    if (listingId) {
      const { data: listingRow } = await supabase
        .from("listings")
        .select("seller_id")
        .eq("id", listingId)
        .maybeSingle();
      const sellerId = (listingRow as { seller_id?: string } | null)?.seller_id ?? null;
      if (sellerId && sellerId === bidderId) {
        return { ok: false, message: "Kendi ilaniniza teklif veremezsiniz." };
      }
    }
  }

  const key = params.idempotencyKey ?? crypto.randomUUID();

  const { data, error } = await supabase.rpc("place_bid", {
    p_auction_id: params.auctionId,
    p_amount: params.amountTry,
    p_idempotency_key: key,
  });

  if (error) {
    return { ok: false, message: error.message, code: error.code };
  }

  const row = parseRpcPayload(data);
  if (!row) {
    return { ok: false, message: "Sunucu yanıtı okunamadı." };
  }

  const status = row.status;
  if (status === "ok") {
    const amt = row.amount;
    return { ok: true, status: "ok", amount: typeof amt === "number" ? amt : Number(amt) };
  }
  if (status === "duplicate") {
    return {
      ok: true,
      status: "duplicate",
      message: typeof row.message === "string" ? row.message : "Bu teklif zaten kayıtlı.",
    };
  }
  return {
    ok: false,
    message: typeof row.message === "string" ? row.message : "Teklif kabul edilmedi.",
  };
}

/** İstemci tarafı doğrulama — RPC ile aynı minimum artış (`fees.ts`). */
export function minNextBidTry(currentHighTry: number): number {
  const base = Number.isFinite(currentHighTry) ? currentHighTry : 0;
  return base + MIN_INCREMENT_TRY;
}
