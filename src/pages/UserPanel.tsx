import { useEffect, useMemo, useState } from "react";
import { useNavigate, NavLink, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Gavel,
  HandCoins,
  Heart,
  MessageSquare,
  Bell,
  FolderOpen,
  PieChart,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEMO_AUCTION_CATALOG } from "@/data/demoAuctionCatalog";
import { DEMO_NOTIFICATIONS } from "@/data/notificationsDemo";
import { Input } from "@/components/ui/input";
import { resolveListingDetailPath } from "@/lib/listingRoutes";

const sidebar = [
  { to: "/panel", label: "Özet", icon: LayoutDashboard, end: true },
  { to: "/panel/profil", label: "Profil", icon: User },
  { to: "/panel/ihalelerim", label: "İhalelerim", icon: Gavel },
  { to: "/panel/tekliflerim", label: "Tekliflerim", icon: HandCoins },
  { to: "/favoriler", label: "Favoriler", icon: Heart },
  { to: "/mesajlar", label: "Mesajlar", icon: MessageSquare },
  { to: "/panel/bildirimler", label: "Bildirimler", icon: Bell },
  { to: "/belgeler", label: "Belgelerim", icon: FolderOpen },
  { to: "/panel/komisyon", label: "Komisyon raporum", icon: PieChart },
  { to: "/ayarlar", label: "Ayarlar", icon: Settings },
] as const;

export default function UserPanel() {
  const navigate = useNavigate();
  const { tabId } = useParams<{ tabId?: string }>();
  const liveCount = DEMO_AUCTION_CATALOG.filter((a) => a.status === "live").length;
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem("ihaleal_profile_demo");
      if (raw) return JSON.parse(raw) as { fullName: string; phone: string; city: string; role: string; bio: string };
    } catch {
      // ignore
    }
    return { fullName: "Demo Kullanıcı", phone: "+90 5xx xxx xx xx", city: "İstanbul", role: "Yatırımcı", bio: "Gayrimenkul odaklı uzun vadeli yatırım ilgisi." };
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const watchedAuctions = useMemo(() => DEMO_AUCTION_CATALOG.slice(0, 3), []);
  const bidRows = useMemo(
    () =>
      watchedAuctions.map((a, idx) => ({
        id: `${a.id}-bid`,
        title: a.title,
        myBid: a.currentBid - (idx + 1) * 50_000,
        currentBid: a.currentBid,
        status: idx === 0 ? "leading" : "outbid",
      })),
    [watchedAuctions],
  );

  useEffect(() => {
    if (!profileSaved) return;
    const t = window.setTimeout(() => setProfileSaved(false), 1800);
    return () => window.clearTimeout(t);
  }, [profileSaved]);

  const sectionTitle =
    tabId === "profil"
      ? "Profil"
      : tabId === "ihalelerim"
        ? "İhalelerim"
        : tabId === "tekliflerim"
          ? "Tekliflerim"
          : tabId === "bildirimler"
            ? "Bildirimler"
            : tabId === "komisyon"
              ? "Komisyon raporum"
              : tabId === "ayarlar"
                ? "Ayarlar"
                : "Özet";

  const renderTabContent = () => {
    if (tabId === "profil") {
      return (
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Profil Bilgileri</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-slate-500">Ad soyad</label>
                <Input value={profile.fullName} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} className="bg-slate-950 border-slate-200 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Telefon</label>
                <Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="bg-slate-950 border-slate-200 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Şehir</label>
                <Input value={profile.city} onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))} className="bg-slate-950 border-slate-200 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Rol</label>
                <Input value={profile.role} onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))} className="bg-slate-950 border-slate-200 text-white" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Kısa bio</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                className="w-full rounded-md border border-slate-200 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="bg-gradient-to-r from-blue-500 to-teal-400 text-white"
                onClick={() => {
                  localStorage.setItem("ihaleal_profile_demo", JSON.stringify(profile));
                  setProfileSaved(true);
                }}
              >
                Profili kaydet
              </Button>
              {profileSaved ? <span className="text-xs text-emerald-400">Kaydedildi</span> : null}
            </div>
          </CardContent>
        </Card>
      );
    }
    if (tabId === "tekliflerim") {
      return (
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">Tekliflerim</h2>
            {bidRows.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz teklifiniz bulunmuyor. İhale detayından teklif vererek başlayın.</p>
            ) : (
              bidRows.map((row) => (
                <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200/80 bg-white/[0.02] px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-white">{row.title}</p>
                    <p className="text-xs text-slate-500">Teklifim: ₺{row.myBid.toLocaleString("tr-TR")} · Güncel: ₺{row.currentBid.toLocaleString("tr-TR")}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${row.status === "leading" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                    {row.status === "leading" ? "Öndesin" : "Teklifin geçildi"}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      );
    }
    if (tabId === "ihalelerim") {
      return (
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">İzlediğim İhaleler</h2>
            {watchedAuctions.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200/80 bg-white/[0.02] px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-white">{row.title}</p>
                  <p className="text-xs text-slate-500">{row.location} · ₺{row.currentBid.toLocaleString("tr-TR")}</p>
                </div>
                <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={() => navigate(resolveListingDetailPath(row.id))}>
                  Detaya git
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }
    if (tabId === "bildirimler") {
      return (
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">Bildirimler</h2>
            {DEMO_NOTIFICATIONS.map((n) => (
              <div key={n.id} className="rounded-lg border border-slate-200/80 bg-white/[0.02] px-3 py-2">
                <p className="text-sm font-medium text-white">{n.title}</p>
                <p className="text-xs text-slate-500">{n.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }
    if (tabId === "komisyon") {
      return (
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-6 space-y-2 text-sm text-slate-400">
            <h2 className="text-lg font-semibold text-white">Komisyon Raporu</h2>
            <p>Son 30 gün işlem hacmi: ₺12.450.000</p>
            <p>Tahmini platform komisyonu (mahsup öncesi): ₺498.000</p>
            <p>Detaylı simülasyon için komisyon hesaplayıcıya geçebilirsiniz.</p>
            <Button type="button" size="sm" className="mt-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white" onClick={() => navigate("/komisyon-hesaplayici")}>
              Komisyon hesaplayıcı
            </Button>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0 space-y-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2">
            <ArrowLeft className="w-4 h-4" /> Ana sayfa
          </Button>
          <nav className="rounded-2xl border border-slate-200 bg-slate-900/40 p-2 space-y-1">
            {sidebar.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={"end" in item ? item.end : false}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive ? "bg-blue-500/20 text-white border border-blue-500/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <p className="text-xs text-slate-600 px-1 leading-relaxed">
            Üyelikler: yıllık satıcı 5.000 TL, yıllık alıcı 1.000 TL. Komisyon mahsuplu %4 + KDV modeli geçerlidir; liste paketi satışı yoktur.
          </p>
        </aside>

        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-blue-400" />
              {sectionTitle}
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              {tabId
                ? "Bu bölüm, hesap operasyonlarını merkez sayfalarla birlikte yönetmeniz için optimize edilmiştir."
                : "İhaleleriniz, teklifleriniz ve bildirim özetiniz tek panelde sunulur."}
            </p>
          </div>

          {tabId ? (
            <>
              {renderTabContent() ?? (
                <Card className="bg-slate-900/50 border-slate-200/80 border-dashed">
                  <CardContent className="p-8 text-center text-slate-400 text-sm space-y-3">
                    <p>{sectionTitle} için temel ayarlar bu sürümde merkezi sayfalarda sunuluyor.</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={() => navigate("/ayarlar")}>
                        Ayarlar
                      </Button>
                      <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={() => navigate("/belgeler")}>
                        Belgeler
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-slate-900/50 border-slate-200/80">
                  <CardContent className="p-5">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Aktif ihale</div>
                    <div className="text-3xl font-bold text-emerald-400 mt-1">{liveCount}</div>
                    <p className="text-xs text-slate-600 mt-2">Katalog genelinde canlı kayıt sayısı.</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-200/80">
                  <CardContent className="p-5">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Bekleyen teklifler</div>
                    <div className="text-3xl font-bold text-amber-400 mt-1">0</div>
                    <p className="text-xs text-slate-600 mt-2">Henüz aktif teklifiniz yok. İhale detayından ilk teklifinizi verin.</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-200/80">
                  <CardContent className="p-5">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Üyelik süresi</div>
                    <div className="text-xl font-bold text-sky-400 mt-1">Yıllık</div>
                    <p className="text-xs text-slate-600 mt-2">Örnek — hesabınıza özel tarih backend ile güncellenir.</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-900/50 border-slate-200/80">
                <CardContent className="p-5">
                  <h2 className="text-lg font-semibold text-white mb-3">Komisyon özeti</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    İşlem komisyonu hedefi %4 + KDV (mahsup); emlakçı ortaklığında B2B fatura ile %2 pay (bilgilendirme). Güvenli ödeme havuzu ve mahsup formülü için{" "}
                    <button type="button" onClick={() => navigate("/komisyon-hesaplayici")} className="text-teal-400 hover:underline">
                      komisyon hesaplayıcı
                    </button>
                    .
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" size="sm" className="bg-gradient-to-r from-blue-500 to-teal-400 text-white" onClick={() => navigate("/ihaleler")}>
                      Sonraki adım: Uygun ihale seç
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={() => navigate("/favoriler")}>
                      Favorilerimi aç
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
