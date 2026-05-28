/**
 * Teklif gönderim facade — mobile-specific.
 *
 * Mimari karar (2026-05-28, _audit/AKSAM_PLANI.md): web `src/lib/placeBid.ts`
 * runtime'ı `@/lib/supabase` browser-tabanlı client kullanır; mobile'da fail eder.
 * Bu mobile facade:
 *   - Pure engine'leri `./borsa`'dan tüketir (validateBid + calculateProxyBid) —
 *     bunlar zaten web src/lib/borsa/auctionEngine ile aynı (re-export)
 *   - RPC runtime'ı mobile authClient (SecureStore adapter) ile yeniden implemente
 *     eder (getRpcClient + cast pattern)
 *
 * borsa.tsx tüketici uyumu: SubmitBidParams imzası KORUNDU (bidderId dahil).
 * `bidderId` RPC'ye gönderilmez (server `auth.uid()` enforce eder); sadece imza
 * geri-uyumluluğu için. Mevcut borsa.tsx K-B fix sonrası `session.user.id`
 * geçiriyor — bu pattern korunuyor.
 *
 * Hata eşleştirme: server place_bid RPC mesajları (Türkçe prosrc) regex'le
 * code'a çevrilir; çağıran (Cursor Adım 4'te UI) `result.code` üzerinden
 * KYC redirect / deposit yönlendirmesi / rate-limit feedback yapar.
 *
 * D-7 fix: önceki `setTimeout(250)` fake-success kaldırıldı; gerçek place_bid
 * RPC çağrısı (bond guard'lı — security bundle 20260527130100 sonrası).
 */
import { validateBid, calculateProxyBid, type BidValidationResult } from './borsa';
import { getRpcClient } from './_rpcClient';

// Tipi web .types modülünden re-export — future-proof, supabase YOK
export type { PlaceBidResult } from '@/lib/placeBid.types';

export type SubmitBidParams = {
  auctionId: string;
  /** Server `auth.uid()` enforce eder; bu parametre sadece geri-uyumluluk için. */
  bidderId: string;
  currentBid: number;
  newBid: number;
  minIncrement: number;
  userMaxProxy?: number;
  /** İstemci sabit anahtar; verilmezse facade üretir. */
  idempotencyKey?: string;
};

export type SubmitBidOutcome =
  | { ok: true; status: 'accepted'; finalAmount: number; proxy: boolean }
  | {
      ok: false;
      status: 'invalid';
      message: string;
      requiredMinimum: number;
      /** Detay sebep — Cursor UI handler'ları kullanır
       *  (deposit_required → deposit ekranına yönlendir;
       *   auth_required → giriş; rate_limited → bekleme süresi;
       *   bid_too_low → minimum vurgula; auction_ended → ihale kapandı;
       *   listing_not_found → ilan kayıp; config_missing → env eksik;
       *   rpc_error → genel sunucu hatası; preconditions_failed → diğer). */
      code?: string;
    };

function parseRpcRow(data: unknown): Record<string, unknown> | null {
  if (data == null) return null;
  if (typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  if (typeof data === 'string') {
    try {
      const o = JSON.parse(data) as unknown;
      return typeof o === 'object' && o !== null && !Array.isArray(o)
        ? (o as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  return null;
}

function readString(row: Record<string, unknown>, key: string): string | undefined {
  const v = row[key];
  return typeof v === 'string' ? v : undefined;
}

function readNumber(row: Record<string, unknown>, key: string): number | undefined {
  const v = row[key];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim().length > 0) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/**
 * Mobile-side bid submission — pure validation + gerçek place_bid RPC.
 *
 * 1. validateBid (pure) → minimum increment / duplicate / underflow erken çıkış
 * 2. calculateProxyBid (pure) → finalAmount (proxy max ile karşılaştır)
 * 3. place_bid RPC → server bond guard + idempotency + anti-sniping
 * 4. Sonuç eşleştirme → SubmitBidOutcome (borsa.tsx geri-uyumlu)
 */
export async function submitBid(params: SubmitBidParams): Promise<SubmitBidOutcome> {
  // 1) Pure local validation
  const validation: BidValidationResult = validateBid(
    params.currentBid,
    params.newBid,
    params.minIncrement,
  );
  if (!validation.valid) {
    return {
      ok: false,
      status: 'invalid',
      message: validation.error,
      requiredMinimum: validation.requiredMinimum,
      code: 'validation',
    };
  }

  // 2) Proxy bid (pure)
  let finalAmount = params.newBid;
  let proxy = false;
  if (params.userMaxProxy && params.userMaxProxy > params.newBid) {
    finalAmount = calculateProxyBid(params.newBid, params.userMaxProxy, params.minIncrement);
    proxy = finalAmount > params.newBid;
  }

  // 3) RPC (D-7 fix: setTimeout(250) fake-success KALKTI)
  let client;
  try {
    client = await getRpcClient();
  } catch (e) {
    return {
      ok: false,
      status: 'invalid',
      message:
        e instanceof Error
          ? e.message
          : 'Supabase yapılandırması eksik. EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_ANON_KEY tanımlayın.',
      requiredMinimum: 0,
      code: 'config_missing',
    };
  }

  const key = params.idempotencyKey ?? crypto.randomUUID();
  const { data, error } = await client.rpc('place_bid', {
    p_auction_id: params.auctionId,
    p_amount: finalAmount,
    p_idempotency_key: key,
  });

  if (error) {
    return {
      ok: false,
      status: 'invalid',
      message: error.message ?? 'Sunucu hatası.',
      requiredMinimum: 0,
      code: error.code ?? 'rpc_error',
    };
  }

  const row = parseRpcRow(data);
  if (!row) {
    return {
      ok: false,
      status: 'invalid',
      message: 'Sunucu yanıtı okunamadı.',
      requiredMinimum: 0,
      code: 'rpc_error',
    };
  }

  const status = readString(row, 'status');
  const message = readString(row, 'message');
  const code = readString(row, 'code');

  if (status === 'ok') {
    const amt = readNumber(row, 'amount') ?? finalAmount;
    return { ok: true, status: 'accepted', finalAmount: amt, proxy };
  }

  if (status === 'duplicate') {
    // Web parite: duplicate başarılı sayılır (kayıt zaten var, UX 'accepted')
    return { ok: true, status: 'accepted', finalAmount, proxy };
  }

  // Hata eşleştirme — code öncelikli (bond guard 'deposit_required' code'lu döner)
  if (code === 'deposit_required') {
    return {
      ok: false,
      status: 'invalid',
      message: message ?? 'Teklif vermeden önce teminat (ön yetki) zorunlu.',
      requiredMinimum: 0,
      code: 'deposit_required',
    };
  }

  // Mesaj-tabanlı eşleştirme (server place_bid prosrc Türkçe mesajları)
  if (message && /çok sık deneme/i.test(message)) {
    return { ok: false, status: 'invalid', message, requiredMinimum: 0, code: 'rate_limited' };
  }
  if (message && /ihale bulunamadı/i.test(message)) {
    return { ok: false, status: 'invalid', message, requiredMinimum: 0, code: 'listing_not_found' };
  }
  if (message && /(ihale aktif değil|ihale bitti)/i.test(message)) {
    return { ok: false, status: 'invalid', message, requiredMinimum: 0, code: 'auction_ended' };
  }
  if (message && /teklif çok düşük/i.test(message)) {
    return {
      ok: false,
      status: 'invalid',
      message,
      requiredMinimum: params.currentBid + params.minIncrement,
      code: 'bid_too_low',
    };
  }
  if (message && /giriş yapmalısınız/i.test(message)) {
    return { ok: false, status: 'invalid', message, requiredMinimum: 0, code: 'auth_required' };
  }

  return {
    ok: false,
    status: 'invalid',
    message: message ?? 'Teklif kabul edilmedi.',
    requiredMinimum: 0,
    code: 'preconditions_failed',
  };
}
