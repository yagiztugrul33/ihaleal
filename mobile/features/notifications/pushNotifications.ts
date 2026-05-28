import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

import { getSupabaseClient } from '../../src/app/(auth)/authClient';

const PUSH_TOKEN_KEY = 'ihaleal_mobile_push_token';

type RpcClientLike = {
  rpc: (
    fn: string,
    params?: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message?: string; code?: string } | null }>;
};

type PushSetupResult = {
  ok: boolean;
  token?: string;
  note: string;
};

export async function setupPushNotifications(): Promise<PushSetupResult> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('ihaleal-main', {
      name: 'İhaleal Bildirimleri',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 200, 250],
      lightColor: '#2563eb',
      sound: 'default',
    });
  }

  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) {
    return { ok: false, note: 'Bildirim izni verilmedi.' };
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return {
    ok: true,
    token: tokenData.data,
    note: 'Push token alındı. FCM/APNs için EAS development build zorunlu.',
  };
}

function extractRpcPayloadError(data: unknown): string | null {
  const row =
    Array.isArray(data) && data.length > 0
      ? data[0]
      : data;
  if (!row || typeof row !== 'object') return null;
  const payload = row as Record<string, unknown>;
  if (payload.status !== 'error') return null;
  const message = payload.message;
  return typeof message === 'string' && message.trim().length > 0
    ? message
    : 'Sunucu islem durumunu hata olarak bildirdi.';
}

export async function registerPushTokenToSupabase(token: string): Promise<string> {
  try {
    const client = (await getSupabaseClient()) as unknown as RpcClientLike;
    const appVersion = Constants.expoConfig?.version ?? 'unknown';
    const deviceLabel = `${Platform.OS}-${String(Platform.Version ?? 'unknown')}`;
    const { data, error } = await client.rpc('register_push_token', {
      p_token: token,
      p_platform: Platform.OS,
      p_device_label: deviceLabel,
      p_app_version: appVersion,
    });
    if (error) {
      return `Push token RPC hatası: ${error.message ?? 'bilinmeyen hata'}`;
    }
    const payloadError = extractRpcPayloadError(data);
    if (payloadError) {
      return `Push token payload hatası: ${payloadError}`;
    }
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token).catch(() => null);
    return 'Push token kaydı tamamlandı.';
  } catch {
    return 'Push token kaydı başarısız oldu.';
  }
}

export async function unregisterPushTokenFromSupabase(token?: string): Promise<string> {
  try {
    const resolvedToken = token ?? (await SecureStore.getItemAsync(PUSH_TOKEN_KEY));
    if (!resolvedToken) return 'Çıkışta kaldırılacak push token bulunamadı.';

    const client = (await getSupabaseClient()) as unknown as RpcClientLike;
    let response = await client.rpc('unregister_push_token', { token: resolvedToken });
    if (response.error) {
      // Backward compatibility: some deployments expose p_token parameter.
      response = await client.rpc('unregister_push_token', { p_token: resolvedToken });
    }
    if (response.error) {
      return `Push token kaldırılamadı: ${response.error.message ?? 'bilinmeyen hata'}`;
    }
    const payloadError = extractRpcPayloadError(response.data);
    if (payloadError) {
      return `Push token payload hatası: ${payloadError}`;
    }
    await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY).catch(() => null);
    return 'Push token kaldırıldı.';
  } catch {
    return 'Push token kaldırma çağrısı başarısız oldu.';
  }
}

type InternalPushRoute = '/(tabs)/profil' | `/ilan/${string}`;

function resolveNotificationRoute(type?: string, listingId?: string): InternalPushRoute | null {
  if ((type === 'outbid' || type === 'auction_end') && listingId) {
    return `/ilan/${listingId}`;
  }
  if (type === 'new_opportunity') {
    return '/(tabs)/profil';
  }
  return null;
}

export function bindNotificationDeepLinking(navigateToRoute: (route: InternalPushRoute) => void): () => void {
  let sub: { remove: () => void } | null = null;
  void (async () => {
    sub = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const type = response?.notification?.request?.content?.data?.type as string | undefined;
      const listingId = response?.notification?.request?.content?.data?.listingId as string | undefined;
      const route = resolveNotificationRoute(type, listingId);
      if (route) {
        navigateToRoute(route);
      }
    });
  })();
  return () => sub?.remove();
}

