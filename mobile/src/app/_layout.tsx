import { useEffect, useMemo, useState } from 'react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { useColorScheme } from 'react-native';
import type { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseClient } from './(auth)/authClient';

const AUTH_ROUTES = new Set(['login', 'register', 'reset-password']);
const PROTECTED_ROUTES = new Set([
  'profil',
  'bildirimler',
  'mesajlar',
  'favoriler',
  'belgeler',
  'ihale',
  'ihaleler',
  'ilan',
  'analiz',
  'uluslararasi',
  'borsa-detay',
]);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [authReady, setAuthReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const topRoute = useMemo(() => {
    const visibleSegments = segments.filter((segment) => !segment.startsWith('(') && !segment.endsWith(')'));
    return visibleSegments[0] ?? '';
  }, [segments]);

  const isAuthRoute = AUTH_ROUTES.has(topRoute);
  const isProtectedRoute = PROTECTED_ROUTES.has(topRoute);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      try {
        const client = (await getSupabaseClient()) as unknown as SupabaseClient;
        const { data } = await client.auth.getSession();
        if (!active) return;
        setIsSignedIn(Boolean(data.session));
        setAuthReady(true);

        const authListener = client.auth.onAuthStateChange((_event, session) => {
          setIsSignedIn(Boolean(session));
        });
        unsubscribe = () => authListener.data.subscription.unsubscribe();
      } catch {
        if (!active) return;
        setIsSignedIn(false);
        setAuthReady(true);
      }
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (isProtectedRoute && !isSignedIn) {
      router.replace('/(auth)/login');
      return;
    }
    if (isAuthRoute && isSignedIn) {
      router.replace('/(tabs)/profil');
    }
  }, [authReady, isAuthRoute, isProtectedRoute, isSignedIn, router]);

  if (!authReady) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="ihaleler/index"
          options={{ headerShown: true, title: 'Canlı İhaleler' }}
        />
        <Stack.Screen
          name="ilan/[id]"
          options={{ headerShown: true, title: 'İlan Detayı' }}
        />
        <Stack.Screen
          name="ihale/[id]"
          options={{ headerShown: true, title: 'İhale Detayı' }}
        />
        <Stack.Screen
          name="ihale/[id]/teklif"
          options={{ headerShown: true, title: 'Teklif Ver' }}
        />
        <Stack.Screen
          name="ihale/[id]/hemen-al"
          options={{ headerShown: true, title: 'Hemen Al' }}
        />
        <Stack.Screen
          name="ihale/[id]/kapali-teklif"
          options={{ headerShown: true, title: 'Kapalı Teklif' }}
        />
        <Stack.Screen
          name="borsa-detay/index"
          options={{ headerShown: true, title: 'Borsa Detay' }}
        />
        <Stack.Screen
          name="borsa-detay/izleme"
          options={{ headerShown: true, title: 'İzleme Listesi' }}
        />
        <Stack.Screen
          name="borsa-detay/veri"
          options={{ headerShown: true, title: 'Veri / Endeks' }}
        />
        <Stack.Screen
          name="borsa-detay/portfoy"
          options={{ headerShown: true, title: 'Portföy' }}
        />
        <Stack.Screen
          name="moduller/index"
          options={{ headerShown: true, title: 'Modüller' }}
        />
        <Stack.Screen
          name="moduller/deprem/index"
          options={{ headerShown: true, title: 'Deprem Modülü' }}
        />
        <Stack.Screen
          name="araclar/index"
          options={{ headerShown: true, title: 'Finansal Araçlar' }}
        />
        <Stack.Screen
          name="analiz/tapu/index"
          options={{ headerShown: true, title: 'Tapu -> AI' }}
        />
        <Stack.Screen
          name="analiz/ilan/index"
          options={{ headerShown: true, title: 'İlan -> AI' }}
        />
        <Stack.Screen
          name="icerik/index"
          options={{ headerShown: true, title: 'Hukuki / İçerik' }}
        />
        <Stack.Screen
          name="icerik/[slug]"
          options={{ headerShown: true, title: 'İçerik Detayı' }}
        />
        <Stack.Screen
          name="bildirimler/index"
          options={{ headerShown: true, title: 'Bildirimler' }}
        />
        <Stack.Screen
          name="mesajlar/index"
          options={{ headerShown: true, title: 'Mesajlar' }}
        />
        <Stack.Screen
          name="favoriler/index"
          options={{ headerShown: true, title: 'Favoriler' }}
        />
        <Stack.Screen
          name="belgeler/index"
          options={{ headerShown: true, title: 'Belgeler' }}
        />
        <Stack.Screen
          name="sehirler/index"
          options={{ headerShown: true, title: 'Şehir Rehberi' }}
        />
        <Stack.Screen
          name="uluslararasi/index"
          options={{ headerShown: true, title: 'Uluslararası' }}
        />
      </Stack>
    </ThemeProvider>
  );
}
