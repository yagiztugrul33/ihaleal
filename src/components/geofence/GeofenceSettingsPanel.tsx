import { useCallback, useEffect, useState } from "react";
import { MapPin, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { fetchGeofencePrefs, upsertGeofencePrefs, type GeofencePrefsRow } from "@/lib/geofence/geofenceClient";
import { LoadingState } from "@/components/async/LoadingState";

const RADIUS_OPTIONS = [500, 800, 1000, 1500];

export function GeofenceSettingsPanel() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<GeofencePrefsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const reload = useCallback(async () => {
    if (!user?.id) {
      setPrefs(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setPrefs(await fetchGeofencePrefs(user.id));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = async (patch: Partial<GeofencePrefsRow>) => {
    if (!user?.id || !prefs) return;
    setBusy(true);
    const next = { ...prefs, ...patch };
    const res = await upsertGeofencePrefs(user.id, next);
    if (res.ok) setPrefs(next);
    setBusy(false);
  };

  const enableGeofence = async () => {
    if (!user?.id || !consentChecked) return;
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    await save({ enabled: true, consentAt: new Date().toISOString() });
  };

  if (!user) {
    return <p className="text-sm text-slate-400">Konum bildirimi için giriş yapın.</p>;
  }

  if (loading || !prefs) return <LoadingState compact label="Konum tercihleri…" />;

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3 text-xs text-slate-300 leading-relaxed">
        <Shield className="inline h-3.5 w-3.5 me-1 text-[var(--metin-ikincil)]" />
        Konumunuz yalnızca cihazınızda işlenir; sunucuya ham GPS koordinatı gönderilmez. Yakın ilan eşleşmesi
        tarayıcıda hesaplanır. KVKK kapsamında açık rıza gereklidir.
      </div>

      <div className="flex items-center gap-2">
        <input
          id="geofence-consent"
          type="checkbox"
          checked={consentChecked || Boolean(prefs.consentAt)}
          onChange={(e) => setConsentChecked(e.target.checked)}
          className="rounded-[3px] border-white/20"
        />
        <Label htmlFor="geofence-consent" className="text-sm text-slate-300">
          Konum tabanlı ilan bildirimlerine izin veriyorum
        </Label>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-normal text-white flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--metin-ikincil)]" /> Geofence bildirimi
          </p>
          <p className="text-xs text-slate-500">Mahalle yakınındaki kiralık/satılık ilanlar</p>
        </div>
        <Switch
          checked={prefs.enabled}
          disabled={busy || (!prefs.consentAt && !consentChecked)}
          onCheckedChange={(v) => {
            if (v) void enableGeofence();
            else void save({ enabled: false });
          }}
        />
      </div>

      <div>
        <Label className="text-xs text-slate-500">Yarıçap</Label>
        <select
          value={prefs.radiusMeters}
          disabled={busy}
          onChange={(e) => void save({ radiusMeters: Number(e.target.value) })}
          className="mt-1 w-full rounded-[10px] border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
        >
          {RADIUS_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r} m
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label className="text-xs text-slate-500">İlan tipi</Label>
        <select
          value={prefs.dealFilter}
          disabled={busy}
          onChange={(e) =>
            void save({ dealFilter: e.target.value as GeofencePrefsRow["dealFilter"] })
          }
          className="mt-1 w-full rounded-[10px] border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
        >
          <option value="all">Tümü</option>
          <option value="sale">Satılık</option>
          <option value="rent">Kiralık</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">Tarayıcı push bildirimi</span>
        <Switch
          checked={prefs.browserPushEnabled}
          disabled={busy}
          onCheckedChange={(v) => void save({ browserPushEnabled: v })}
        />
      </div>

      <Button type="button" variant="outline" size="sm" className="border-white/15" disabled={busy} onClick={() => void reload()}>
        Tercihleri yenile
      </Button>
    </div>
  );
}
