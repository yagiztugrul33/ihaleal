import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
