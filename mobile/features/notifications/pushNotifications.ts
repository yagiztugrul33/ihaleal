import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';

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

export async function registerPushTokenToSupabase(token: string, userId: string | null): Promise<string> {
  try {
    const extra = Constants.expoConfig?.extra ?? {};
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.EXPO_PUBLIC_SUPABASE_URL ?? '';
    const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
    if (!url || !anon) return 'Supabase env eksik, token yerelde tutuldu.';
    if (!userId) return 'Push token kaydı atlandı: aktif user session bulunamadı.';
    // TODO(core-api): device_push_tokens tablosu + RPC hazır olunca burada güvenli backend çağrısı açılacak.
    void token;
    return 'Push token kaydı geçici olarak devre dışı (çekirdek tablo/RPC hazır değil).';
  } catch {
    return 'Push token kaydı atlandı (güvenli fail).';
  }
}

export function bindNotificationDeepLinking(): () => void {
  let sub: { remove: () => void } | null = null;
  void (async () => {
    sub = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const type = response?.notification?.request?.content?.data?.type as string | undefined;
      const listingId = response?.notification?.request?.content?.data?.listingId as string | undefined;
      if (type === 'outbid' && listingId) {
        void Linking.openURL(`ihaleal://ilan/${listingId}`);
      } else if (type === 'auction_end' && listingId) {
        void Linking.openURL(`ihaleal://ilan/${listingId}`);
      } else if (type === 'new_opportunity') {
        void Linking.openURL('ihaleal://(tabs)/profil');
      }
    });
  })();
  return () => sub?.remove();
}

