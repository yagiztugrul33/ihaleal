import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

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

function getExtraValue(key: string): string | undefined {
  const fromEnv = process.env[key];
  if (fromEnv?.trim()) return fromEnv;
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const raw = extra?.[key] ?? extra?.[key.toLowerCase()];
  return typeof raw === 'string' && raw.trim() ? raw : undefined;
}

function resolveSupabaseConfig(): { url: string; anon: string } {
  const url = getExtraValue('EXPO_PUBLIC_SUPABASE_URL') ?? getExtraValue('VITE_SUPABASE_URL') ?? '';
  const anon = getExtraValue('EXPO_PUBLIC_SUPABASE_ANON_KEY') ?? getExtraValue('VITE_SUPABASE_ANON_KEY') ?? '';
  if (!url || !anon) {
    throw new Error('Supabase env eksik. EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_ANON_KEY tanımlayın.');
  }
  return { url, anon };
}

let cachedClient: SupabaseClientLike | null = null;

export async function getSupabaseClient(): Promise<SupabaseClientLike> {
  if (cachedClient) return cachedClient;
  // eslint-disable-next-line no-eval
  const req = eval('require') as NodeRequire;
  const sdk = req('@supabase/supabase-js') as { createClient: (url: string, anon: string, options?: unknown) => SupabaseClientLike };
  const { url, anon } = resolveSupabaseConfig();
  cachedClient = sdk.createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return cachedClient;
}

export async function persistAuthSession(session: { access_token: string; refresh_token: string; user?: { email?: string } }) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.access_token);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refresh_token);
  if (session.user?.email) {
    await SecureStore.setItemAsync(USER_EMAIL_KEY, session.user.email);
  }
}

export async function hydrateAuthSession(): Promise<{ restored: boolean; email: string | null }> {
  const client = await getSupabaseClient();
  const access = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  const refresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!access || !refresh) {
    return { restored: false, email: await SecureStore.getItemAsync(USER_EMAIL_KEY) };
  }
  const { error } = await client.auth.setSession({ access_token: access, refresh_token: refresh });
  return { restored: !error, email: await SecureStore.getItemAsync(USER_EMAIL_KEY) };
}

export async function clearAuthSession(): Promise<void> {
  const client = await getSupabaseClient();
  await client.auth.signOut().catch(() => null);
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
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

