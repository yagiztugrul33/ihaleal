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
  Inbox,
  Bookmark,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SellerAnalyticsPanel } from "@/components/seller/SellerAnalyticsPanel";
import { OffersPanel } from "@/components/offers/OffersPanel";
import { UserPanelOverview } from "@/components/panel/UserPanelOverview";
import NotificationsPage from "@/pages/NotificationsPage";

const sidebar = [
  { to: "/panel", label: "Özet", icon: LayoutDashboard, end: true },
  { to: "/panel/profil", label: "Profil", icon: User },
  { to: "/panel/ihalelerim", label: "İhalelerim", icon: Gavel },
  { to: "/panel/tekliflerim", label: "Tekliflerim", icon: HandCoins },
  { to: "/panel/gelen-teklifler", label: "Gelen teklifler", icon: Inbox },
  { to: "/favoriler", label: "Favoriler", icon: Heart },
  { to: "/aramalarim", label: "Aramalarım", icon: Bookmark },
  { to: "/mesajlar", label: "Mesajlar", icon: MessageSquare },
  { to: "/panel/bildirimler", label: "Bildirimler", icon: Bell },
  { to: "/belgeler", label: "Belgelerim", icon: FolderOpen },
  { to: "/panel/komisyon", label: "Komisyon raporum", icon: PieChart },
  { to: "/ayarlar", label: "Ayarlar", icon: Settings },
] as const;

export default function UserPanel() {
  const navigate = useNavigate();
  const { tabId } = useParams<{ tabId?: string }>();

  const sectionTitle =
    tabId === "profil"
      ? "Profil"
      : tabId === "ihalelerim"
        ? "İhalelerim"
        : tabId === "tekliflerim"
          ? "Tekliflerim"
          : tabId === "gelen-teklifler"
            ? "Gelen teklifler"
            : tabId === "bildirimler"
              ? "Bildirimler"
              : tabId === "komisyon"
                ? "Komisyon raporum"
                : tabId === "ayarlar"
                  ? "Ayarlar"
                  : "Özet";

  return (
    <div className="min-h-screen pt-8 pb-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0 space-y-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground gap-2">
            <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Ana sayfa
          </Button>
          <nav className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-2 space-y-1">
            {sidebar.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={"end" in item ? item.end : false}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive ? "bg-[var(--zemin)] text-[var(--metin)] border border-[var(--cizgi)]" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-normal text-foreground flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-muted-foreground" />
              {sectionTitle}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Canlı tablolardan favori, teklif, bildirim ve satıcı analitiği.
            </p>
          </div>

          {tabId === "tekliflerim" ? (
            <Card>
              <CardContent className="p-5">
                <OffersPanel mode="buyer" />
              </CardContent>
            </Card>
          ) : tabId === "gelen-teklifler" ? (
            <Card>
              <CardContent className="p-5">
                <OffersPanel mode="seller" />
              </CardContent>
            </Card>
          ) : tabId === "bildirimler" ? (
            <NotificationsPage />
          ) : tabId === "profil" ? (
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-4">Profil bilgilerinizi düzenleyin.</p>
                <Button type="button" onClick={() => navigate("/profil")}>
                  Profil sayfasına git
                </Button>
              </CardContent>
            </Card>
          ) : tabId === "ihalelerim" ? (
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-4">Katıldığınız ve açtığınız ihaleler.</p>
                <Button type="button" variant="outline" className="border-border me-2" onClick={() => navigate("/ihaleler")}>
                  Aktif ihaleler
                </Button>
                <Button type="button" onClick={() => navigate("/ihale-ac")}>
                  İlan / ihale aç
                </Button>
              </CardContent>
            </Card>
          ) : tabId === "komisyon" ? (
            <Card>
              <CardContent className="p-5">
                <h2 className="text-lg font-normal mb-3">Komisyon özeti</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  İşlem komisyonu hedefi %4 + KDV (mahsup). Detay için{" "}
                  <button type="button" onClick={() => navigate("/komisyon-hesaplayici")} className="underline text-card-foreground hover:text-muted-foreground">
                    komisyon hesaplayıcı
                  </button>
                  .
                </p>
              </CardContent>
            </Card>
          ) : tabId === "ayarlar" ? (
            <Card>
              <CardContent className="p-5">
                <Button type="button" onClick={() => navigate("/ayarlar")}>
                  Hesap ayarları
                </Button>
              </CardContent>
            </Card>
          ) : (
            <UserPanelOverview />
          )}
        </div>
      </div>
    </div>
  );
}
