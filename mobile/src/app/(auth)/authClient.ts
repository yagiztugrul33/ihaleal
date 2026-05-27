import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

const ACCESS_TOKEN_KEY = 'ihaleal_mobile_access_token';
const REFRESH_TOKEN_KEY = 'ihaleal_mobile_refresh_token';
const USER_EMAIL_KEY = 'ihaleal_mobile_user_email';
const BIOMETRIC_OPT_IN_KEY = 'ihaleal_mobile_biometric_opt_in';

type SupabaseClientLike = {
  auth: {
    signInWithPassword: (input: { email: string; password: string }) => Promise<{ data: any; error: any }>;
    signUp: (input: { email: string; password: string; options?: Record<string, unknown> }) => Promise<{ data: any; error: any }>;
    resetPasswordForEmail: (email: string, options?: Record<string, unknown>) => Promise<{ data: any; error: any }>;
    setSession: (session: { access_token: string; refresh_token: string }) => Promise<{ data: any; error: any }>;
    getSession: () => Promise<{ data: { session: any }; error: any }>;
    signOut: () => Promise<{ error: any }>;
  };
};

type SupabaseStorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

function getEnvValue(key: 'EXPO_PUBLIC_SUPABASE_URL' | 'EXPO_PUBLIC_SUPABASE_ANON_KEY'): string | undefined {
  const fromEnv =
    key === 'EXPO_PUBLIC_SUPABASE_URL'
      ? process.env.EXPO_PUBLIC_SUPABASE_URL
      : process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (fromEnv?.trim()) return fromEnv;
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const lowered = key.toLowerCase();
  const raw = extra?.[key] ?? extra?.[lowered];
  return typeof raw === 'string' && raw.trim() ? raw : undefined;
}

function resolveSupabaseConfig(): { url: string; anon: string } {
  const url = getEnvValue('EXPO_PUBLIC_SUPABASE_URL') ?? '';
  const anon = getEnvValue('EXPO_PUBLIC_SUPABASE_ANON_KEY') ?? '';
  if (!url || !anon) {
    throw new Error('Supabase env eksik. EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_ANON_KEY tanımlayın.');
  }
  return { url, anon };
}

let cachedClient: SupabaseClientLike | null = null;

const secureStoreAdapter: SupabaseStorageAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

export async function getSupabaseClient(): Promise<SupabaseClientLike> {
  if (cachedClient) return cachedClient;
  const { url, anon } = resolveSupabaseConfig();
  cachedClient = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: secureStoreAdapter,
    },
  }) as unknown as SupabaseClientLike;
  return cachedClient;
}

export async function persistAuthSession(session: Session) {
  const client = (await getSupabaseClient()) as unknown as SupabaseClient;
  const { error } = await client.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (!error && session.user?.email) {
    await SecureStore.setItemAsync(USER_EMAIL_KEY, session.user.email);
  }
}

export async function hydrateAuthSession(): Promise<{ restored: boolean; email: string | null }> {
  const client = (await getSupabaseClient()) as unknown as SupabaseClient;
  const { data } = await client.auth.getSession();
  const hasSession = Boolean(data.session);
  if (!hasSession) {
    return { restored: false, email: await SecureStore.getItemAsync(USER_EMAIL_KEY) };
  }
  const refreshed = await client.auth.refreshSession();
  if (refreshed.error) {
    await client.auth.signOut().catch(() => null);
    await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
    return { restored: false, email: null };
  }
  return { restored: true, email: refreshed.data.session?.user?.email ?? (await SecureStore.getItemAsync(USER_EMAIL_KEY)) };
}

export async function clearAuthSession(): Promise<void> {
  const client = (await getSupabaseClient()) as unknown as SupabaseClient;
  await client.auth.signOut().catch(() => null);
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY).catch(() => null);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => null);
  await SecureStore.deleteItemAsync(USER_EMAIL_KEY).catch(() => null);
}

export async function setBiometricOptIn(enabled: boolean): Promise<void> {
  if (enabled) {
    await SecureStore.setItemAsync(BIOMETRIC_OPT_IN_KEY, '1');
  } else {
    await SecureStore.deleteItemAsync(BIOMETRIC_OPT_IN_KEY);
  }
}

export async function getBiometricOptIn(): Promise<boolean> {
  return (await SecureStore.getItemAsync(BIOMETRIC_OPT_IN_KEY)) === '1';
}

export async function getStoredEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(USER_EMAIL_KEY);
}

