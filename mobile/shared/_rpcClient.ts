/**
 * RPC istemci tipi + cast helper — mobile facade'lar için paylaşılan altyapı.
 *
 * Mimari karar (2026-05-28, _audit/AKSAM_PLANI.md): web `src/lib/*` facade'ları
 * `@/lib/supabase` browser-tabanlı client'ı kullanır; mobile'da fail eder. Mobile
 * facade'lar (depositRegister, buyNow, bidActions) bu dosyadaki `getRpcClient()`
 * üzerinden mobile authClient (SecureStore adapter) ile RPC çağırır.
 *
 * Cursor pushNotifications.ts paterninin generic + data-aware genişlemesi.
 *
 * Underscore prefix: `mobile/shared/index.ts` barrel'da re-export EDİLMEZ — internal
 * helper, mobile facade'lar tarafından doğrudan import edilir.
 */
import { getSupabaseClient } from '../src/app/(auth)/authClient';

export type RpcResponse<T> = {
  data: T | null;
  error: { message?: string; code?: string } | null;
};

export type RpcClientLike = {
  rpc: <T = unknown>(
    fn: string,
    params?: Record<string, unknown>,
  ) => Promise<RpcResponse<T>>;
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: unknown) => {
        maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
      };
    };
  };
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } | null };
      error?: unknown;
    }>;
  };
};

/**
 * Mobile authClient'ı RpcClientLike'a cast eder. Tip genişletme `as unknown as`
 * ile yapılır (Cursor pushNotifications.ts paterni). Çağıran try/catch ile
 * config_missing durumunu yakalayabilir (getSupabaseClient env eksikse throw eder).
 */
export async function getRpcClient(): Promise<RpcClientLike> {
  const client = await getSupabaseClient();
  return client as unknown as RpcClientLike;
}
