import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, BellRing, CheckCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { useDevicePushSubscription } from "@/hooks/useDevicePushSubscription";
import { LoadingState, ErrorState, EmptyState } from "@/components/async";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { items, loading, error, reload, markRead, markAllRead, unreadCount } = useNotifications();
  const { prefs, loading: prefsLoading, save, busy } = useNotificationPreferences();
  const push = useDevicePushSubscription();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 gap-2 text-slate-500">
          <ArrowLeft className="rtl:rotate-180 h-4 w-4" /> Geri
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-white">
            <Bell className="h-7 w-7 text-violet-400" />
            Bildirimler
            {unreadCount > 0 ? (
              <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-sm font-normal text-violet-300">
                {unreadCount} okunmamış
              </span>
            ) : null}
          </h1>
          {unreadCount > 0 ? (
            <Button type="button" variant="outline" size="sm" className="gap-2 border-white/15" onClick={() => void markAllRead()}>
              <CheckCheck className="h-4 w-4" /> Tümünü okundu işaretle
            </Button>
          ) : null}
        </div>

        {loading ? <LoadingState label="Bildirimler yükleniyor…" /> : null}
        {!loading && error ? (
          <ErrorState message={error} onRetry={() => void reload()} className="mt-6" />
        ) : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Henüz bildirim yok"
            description="Teklif, favori ve hesap güncellemeleri burada listelenecek."
            className="mt-4"
          />
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <ul className="mt-6 space-y-2">
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => void markRead(n.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-start transition-colors ${
                    n.read
                      ? "border-slate-800 bg-slate-900/30 opacity-80"
                      : "border-violet-500/30 bg-violet-500/5"
                  }`}
                >
                  <div className="text-sm font-semibold text-white">{n.title}</div>
                  {n.body ? <p className="mt-1 text-xs text-slate-400">{n.body}</p> : null}
                  <p className="mt-2 text-[10px] text-slate-600">
                    {new Date(n.createdAt).toLocaleString("tr-TR")}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Web Push (cihaza bildirim) — Capacitor öncesi köprü */}
        <section className="mt-8 rounded-xl border border-cyan-500/20 bg-slate-900/40 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15">
              <BellRing className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-white">Cihaza bildirim (Push)</h2>
              <p className="mt-1 text-xs text-slate-400">
                Uygulama açık olmasa bile teklif, eşleşme ve ihale kapanış uyarısı al.
                {push.status === "unsupported" && " Bu tarayıcı desteklemiyor."}
                {push.status === "no-vapid" && " Sunucu anahtarı henüz yapılandırılmadı."}
                {push.status === "denied" && " İzin reddedildi — tarayıcı ayarlarından açabilirsin."}
                {push.error && ` Hata: ${push.error}`}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {push.status === "subscribed" ? (
                  <>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                      <Smartphone className="h-3 w-3" /> Aktif
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 text-xs"
                      onClick={() => void push.disable()}
                    >
                      Kapat
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => void push.enable()}
                    disabled={!push.canEnable}
                    className="[background:var(--gradient-cta)] text-xs text-white"
                  >
                    {push.status === "subscribing" ? "Etkinleştiriliyor…" : "Bildirimleri aç"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-white">Bildirim tercihleri</h2>
          <p className="mt-1 text-xs text-slate-500">Hangi bildirimleri almak istediğinizi seçin.</p>
          {prefsLoading || !prefs ? (
            <LoadingState compact className="mt-4" label="Tercihler yükleniyor…" />
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {(
                [
                  ["offerEnabled", "Teklif (yeni / kabul-red)"] as const,
                  ["searchMatchEnabled", "Kayıtlı arama eşleşmesi"] as const,
                  ["messageEnabled", "Yeni mesaj"] as const,
                  ["favoriteEnabled", "İlan favoriye alındı"] as const,
                  ["kycEnabled", "KYC durumu"] as const,
                  ["auctionEnabled", "İhale kazanıldı / kaybedildi"] as const,
                ] as const
              ).map(([key, label]) => (
                <li key={key} className="flex items-center justify-between gap-4">
                  <span className="text-slate-300">{label}</span>
                  <Switch
                    checked={prefs[key]}
                    disabled={busy}
                    onCheckedChange={(v) => void save({ [key]: v })}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
