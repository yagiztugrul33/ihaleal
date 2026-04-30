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

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0a0f1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0 space-y-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2">
            <ArrowLeft className="w-4 h-4" /> Ana sayfa
          </Button>
          <nav className="rounded-2xl border border-white/10 bg-slate-900/40 p-2 space-y-1">
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
            Üyelikler: yıllık satıcı 5.000 TL, yıllık alıcı 1.000 TL (demo metin). Komisyon mahsuplu %4 + KDV hedefi — liste paketi satışı yoktur.
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
                ? "Bu bölüm demo — gerçek hesap verisi bağlandığında dolar."
                : "İhaleleriniz, teklifleriniz ve bildirim özetiniz (demo veri)."}
            </p>
          </div>

          {tabId ? (
            <Card className="bg-slate-900/50 border-white/5 border-dashed">
              <CardContent className="p-8 text-center text-slate-400 text-sm">
                <p className="mb-4">
                  {sectionTitle} içeriği yakında tamamlanacak. Bildirim ve mesaj demo akışları üst menüden kullanılabilir.
                </p>
                <Button type="button" variant="outline" className="border-white/15" onClick={() => navigate("/panel")}>
                  Panele dön
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-slate-900/50 border-white/5">
                  <CardContent className="p-5">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Aktif ihale (demo)</div>
                    <div className="text-3xl font-bold text-emerald-400 mt-1">{liveCount}</div>
                    <p className="text-xs text-slate-600 mt-2">Katalog genelinde canlı kayıt sayısı.</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-white/5">
                  <CardContent className="p-5">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Bekleyen teklifler</div>
                    <div className="text-3xl font-bold text-amber-400 mt-1">—</div>
                    <p className="text-xs text-slate-600 mt-2">Gerçek teklif akışı bağlandığında dolar.</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-white/5">
                  <CardContent className="p-5">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Üyelik süresi</div>
                    <div className="text-xl font-bold text-sky-400 mt-1">Yıllık</div>
                    <p className="text-xs text-slate-600 mt-2">Örnek — hesabınıza özel tarih backend ile güncellenir.</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-900/50 border-white/5">
                <CardContent className="p-5">
                  <h2 className="text-lg font-semibold text-white mb-3">Komisyon özeti (taslak)</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    İşlem komisyonu hedefi %4 + KDV (mahsup); emlakçı ortaklığında B2B fatura ile %2 pay (bilgilendirme). Güvenli ödeme havuzu ve mahsup formülü için{" "}
                    <button type="button" onClick={() => navigate("/komisyon-hesaplayici")} className="text-teal-400 hover:underline">
                      komisyon hesaplayıcı
                    </button>
                    .
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
