import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

type PushSetupResult = {
  ok: boolean;
  token?: string;
  note: string;
};

async function getNotificationsModule(): Promise<any | null> {
  try {
    // eslint-disable-next-line no-eval
    const req = eval('require') as NodeRequire;
    return req('expo-notifications');
  } catch {
    return null;
  }
}

export async function setupPushNotifications(): Promise<PushSetupResult> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return {
      ok: false,
      note: 'expo-notifications eksik. `npx expo install expo-notifications` ve development build gerekir.',
    };
  }

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

export async function registerPushTokenToSupabase(token: string): Promise<string> {
  try {
    // eslint-disable-next-line no-eval
    const req = eval('require') as NodeRequire;
    const sdk = req('@supabase/supabase-js') as any;
    const Constants = req('expo-constants') as any;
    const extra = Constants.expoConfig?.extra ?? {};
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.EXPO_PUBLIC_SUPABASE_URL ?? '';
    const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
    if (!url || !anon) return 'Supabase env eksik, token yerelde tutuldu.';
    const client = sdk.createClient(url, anon, { auth: { persistSession: false } });
    const { error } = await client.from('device_push_tokens').upsert({
      token,
      platform: Platform.OS,
      app: 'ihaleal-mobile',
      updated_at: new Date().toISOString(),
    });
    if (error) return `Token kaydı başarısız: ${error.message}`;
    return 'Push token Supabase kaydı tamam.';
  } catch {
    return 'Push token kaydı atlandı (supabase-js veya tablo eksik).';
  }
}

export function bindNotificationDeepLinking(): () => void {
  let sub: { remove: () => void } | null = null;
  void (async () => {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;
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

