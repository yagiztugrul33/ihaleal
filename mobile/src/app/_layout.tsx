import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
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
          name="moduller/index"
          options={{ headerShown: true, title: 'Modüller' }}
        />
        <Stack.Screen
          name="moduller/deprem/index"
          options={{ headerShown: true, title: 'Deprem Modülü' }}
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
