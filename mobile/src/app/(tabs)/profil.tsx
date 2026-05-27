import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import {
  buildRadarPoints,
  getMapModule,
  requestLocationWithConsent,
  startRadarGeofencing,
  type RadarPoint,
} from '../../../features/location/locationRadar';
import {
  bindNotificationDeepLinking,
  registerPushTokenToSupabase,
  setupPushNotifications,
  unregisterPushTokenFromSupabase,
} from '../../../features/notifications/pushNotifications';
import {
  clearAuthSession,
  getBiometricOptIn,
  getStoredEmail,
  getSupabaseClient,
  setBiometricOptIn,
} from '../(auth)/authClient';

function formatKm(km: number): string {
  return `${km.toFixed(1)} km`;
}

export default function ProfilScreen() {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [email, setEmail] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [kvkkOptIn, setKvkkOptIn] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Konum radarı kapalı.');
  const [radarPoints, setRadarPoints] = useState<RadarPoint[]>([]);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushStatus, setPushStatus] = useState('Push token henüz alınmadı.');
  const mapModule = useMemo(() => getMapModule(), []);

  useEffect(() => {
    const dispose = bindNotificationDeepLinking();
    return () => dispose();
  }, []);

  useEffect(() => {
    void (async () => {
      const client = await getSupabaseClient();
      const { data } = await client.auth.getSession();
      setEmail(data.session?.user?.email ?? (await getStoredEmail()));
      setSessionReady(true);
      setBiometricEnabledState(await getBiometricOptIn());
    })();
  }, []);

  const onToggleBiometric = useCallback(async (value: boolean) => {
    setBiometricEnabledState(value);
    await setBiometricOptIn(value);
  }, []);

  const onSignOut = useCallback(async () => {
    await unregisterPushTokenFromSupabase();
    await clearAuthSession();
    router.replace('/(auth)/login');
  }, []);

  const onEnableRadar = useCallback(async () => {
    setLocationBusy(true);
    try {
      const result = await requestLocationWithConsent(kvkkOptIn);
      setLocationStatus(result.message);
      if (!result.ok || !result.coords) return;
      setUserCoords(result.coords);
      const points = buildRadarPoints(result.coords.latitude, result.coords.longitude);
      setRadarPoints(points.slice(0, 5));
      if (points[0]) {
        const geofenceResult = await startRadarGeofencing(points[0].id, points[0].latitude, points[0].longitude);
        setLocationStatus(`Radar aktif. ${geofenceResult}`);
      } else {
        setLocationStatus('Radar aktif ancak yakında fırsat bulunamadı.');
      }
    } finally {
      setLocationBusy(false);
    }
  }, [kvkkOptIn]);

  const onEnablePush = useCallback(async () => {
    setPushBusy(true);
    try {
      const setup = await setupPushNotifications();
      if (!setup.ok || !setup.token) {
        setPushStatus(setup.note);
        return;
      }
      const saveResult = await registerPushTokenToSupabase(setup.token);
      setPushStatus(`${setup.note} ${saveResult}`);
    } finally {
      setPushBusy(false);
    }
  }, []);

  const MapView = mapModule.moduleReady ? mapModule.MapView : null;
  const Marker = mapModule.moduleReady ? mapModule.Marker : null;
  const Circle = mapModule.moduleReady ? mapModule.Circle : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: palette.text }]}>Profil</Text>
        <Text style={[styles.note, { color: palette.textSecondary }]}>
          Auth, biyometrik, konum radarı, geofencing ve push merkezi
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kullanıcı</Text>
          {!sessionReady ? (
            <ActivityIndicator />
          ) : email ? (
            <Text style={styles.value}>{email}</Text>
          ) : (
            <Pressable style={styles.primaryBtn} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.primaryText}>Giriş Yap</Text>
            </Pressable>
          )}

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Biyometrik hızlı giriş</Text>
            <Switch
              value={biometricEnabled}
              onValueChange={onToggleBiometric}
              trackColor={{ false: '#475569', true: '#0ea5e9' }}
            />
          </View>

          <Pressable style={styles.secondaryBtn} onPress={onSignOut}>
            <Text style={styles.secondaryText}>Çıkış Yap</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Konum Radarı (KVKK onayı zorunlu)</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>KVKK konum opt-in</Text>
            <Switch value={kvkkOptIn} onValueChange={setKvkkOptIn} trackColor={{ false: '#475569', true: '#16a34a' }} />
          </View>
          <Pressable style={styles.primaryBtn} onPress={onEnableRadar} disabled={locationBusy}>
            {locationBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Radarı Çalıştır</Text>}
          </Pressable>
          <Text style={styles.status}>{locationStatus}</Text>
          {radarPoints.map((point) => (
            <View key={point.id} style={styles.listRow}>
              <Text style={styles.listTitle} numberOfLines={1}>
                {point.title}
              </Text>
              <Text style={styles.listMeta}>
                {point.city}/{point.district} · {formatKm(point.distanceKm)} · skor {point.score}
              </Text>
            </View>
          ))}

          {MapView && Marker && Circle && userCoords ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: userCoords.latitude,
                longitude: userCoords.longitude,
                latitudeDelta: 0.3,
                longitudeDelta: 0.3,
              }}>
              <Marker coordinate={userCoords} title="Sen" />
              {radarPoints.map((point) => (
                <Marker
                  key={`m-${point.id}`}
                  coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                  title={point.title}
                  description={`${point.city} · ${formatKm(point.distanceKm)}`}
                />
              ))}
              {radarPoints[0] ? (
                <Circle
                  center={{ latitude: radarPoints[0].latitude, longitude: radarPoints[0].longitude }}
                  radius={700}
                  fillColor="rgba(14,165,233,0.18)"
                  strokeColor="#0ea5e9"
                />
              ) : null}
            </MapView>
          ) : (
            <Text style={styles.status}>Harita için `react-native-maps` modülü/development build gerekir.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Push Bildirim</Text>
          <Pressable style={styles.primaryBtn} onPress={onEnablePush} disabled={pushBusy}>
            {pushBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Push Token Al</Text>}
          </Pressable>
          <Text style={styles.status}>{pushStatus}</Text>
          <Text style={styles.note}>
            Bildirim tipleri: yeni fırsat (konum bazlı), outbid, açık artırma bitiş. Bildirim tıklaması deep link ile ekrana taşınır.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(palette: (typeof Colors)[keyof typeof Colors]) {
  return StyleSheet.create({
    safe: { flex: 1 },
    container: { padding: Spacing.four, gap: Spacing.three, paddingBottom: 120 },
    title: { fontSize: 28, fontWeight: '700' },
    note: { fontSize: 13, lineHeight: 19 },
    card: {
      borderWidth: 1,
      borderColor: '#334155',
      borderRadius: 14,
      backgroundColor: '#0f172a',
      padding: Spacing.three,
      gap: Spacing.two,
    },
    cardTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: '700' },
    value: { color: '#cbd5e1', fontSize: 14 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
    rowLabel: { color: '#cbd5e1', fontSize: 13, flex: 1 },
    primaryBtn: {
      minHeight: 42,
      borderRadius: 12,
      backgroundColor: '#2563eb',
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryText: { color: '#fff', fontWeight: '700' },
    secondaryBtn: {
      minHeight: 40,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#475569',
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryText: { color: '#e2e8f0', fontWeight: '600' },
    status: { color: '#93c5fd', fontSize: 12, lineHeight: 18 },
    listRow: { borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 8 },
    listTitle: { color: '#f8fafc', fontSize: 13, fontWeight: '600' },
    listMeta: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
    map: { height: 240, borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  });
}
