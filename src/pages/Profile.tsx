import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Shield, CheckCircle2, Edit3, LogOut, Star, Heart, Bookmark, HandCoins, Bell, BellRing, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { stripForSession, dispatchAuthChanged, type StoredUser, type SessionUser } from "@/lib/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatSupabaseAuthError, sessionUserFromSupabaseUser } from "@/lib/supabaseAuthBridge";
import { useKycStatus } from "@/hooks/useKycStatus";
import { useSellerProfile } from "@/hooks/useSellerProfile";
import { useFavorites } from "@/hooks/useFavorites";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { useBuyerOffers } from "@/hooks/useListingOffers";
import { KycVerifiedBadge } from "@/components/trust/KycVerifiedBadge";

function readSession(): SessionUser | null {
  try {
    return JSON.parse(localStorage.getItem("ihaleal_user") || "null");
  } catch {
    return null;
  }
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(readSession);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [success, setSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  const { displayStatus: kycStatus } = useKycStatus(user?.id ?? null);
  const { profile: sellerStats } = useSellerProfile(user?.id ?? null);
  const kycVerified = kycStatus === "verified";
  const publicRating = sellerStats?.avgRating ?? user?.rating ?? 0;
  const reviewCount = sellerStats?.reviewCount ?? 0;
  // Dalga 4-3: hesabım özeti + bildirim tercihleri
  const { favorites } = useFavorites();
  const savedApi = useSavedSearches([]);
  const buyerOffers = useBuyerOffers();
  const pendingOffers = buyerOffers.offers.filter((o) => o.status === "pending" || o.status === "countered").length;
  type NotifyPrefs = { email: boolean; push: boolean; newMatches: boolean; bidUpdates: boolean };
  const NOTIFY_KEY = "ihaleal_notify_prefs";
  const [notifyPrefs, setNotifyPrefs] = useState<NotifyPrefs>({
    email: true,
    push: false,
    newMatches: true,
    bidUpdates: true,
  });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIFY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<NotifyPrefs>;
        setNotifyPrefs((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* sessiz */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFY_KEY, JSON.stringify(notifyPrefs));
    } catch {
      /* sessiz */
    }
  }, [notifyPrefs]);

  useEffect(() => {
    if (!user || user.authBackend !== "supabase" || !isSupabaseConfigured()) return;
    void supabase
      .from("profiles")
      .select("full_name, phone, email")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        if (data.full_name) setName(String(data.full_name));
        if (data.phone) setPhone(String(data.phone));
        if (data.email) setEmail(String(data.email));
      });
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Hesap Profili</h1>
          <p className="text-slate-400 mb-2">Profil bilgileri, KYC durumu ve satıcı puanını görmek için giriş yapın.</p>
          <Button onClick={() => navigate("/giris?next=/profil")} className="mt-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white">Giriş Yap</Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!user) return;
    setSaveError("");
    if (user.authBackend === "supabase" && isSupabaseConfigured()) {
      const { error } = await supabase.auth.updateUser({
        email: email.trim(),
        data: { name: name.trim(), phone: phone.trim() },
      });
      if (error) {
        setSaveError(formatSupabaseAuthError(error.message));
        return;
      }
      const { data: refreshed } = await supabase.auth.getUser();
      if (refreshed.user) {
        const session = sessionUserFromSupabaseUser(refreshed.user);
        setUser(session);
        localStorage.setItem("ihaleal_user", JSON.stringify(session));
        dispatchAuthChanged();
      }
      await supabase
        .from("profiles")
        .update({
          full_name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      setEditMode(false);
      setSuccess("Profil güncellendi!");
      setTimeout(() => setSuccess(""), 3000);
      return;
    }
    const users = JSON.parse(localStorage.getItem("ihaleal_users") || "[]") as StoredUser[];
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx < 0) return;
    const merged: StoredUser = { ...users[idx], name, email, phone };
    users[idx] = merged;
    localStorage.setItem("ihaleal_users", JSON.stringify(users));
    const session = stripForSession(merged);
    setUser(session);
    localStorage.setItem("ihaleal_user", JSON.stringify(session));
    dispatchAuthChanged();
    setEditMode(false);
    setSuccess("Profil güncellendi!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleLogout = async () => {
    if (user?.authBackend === "supabase" && isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("ihaleal_user");
    dispatchAuthChanged();
    navigate("/");
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="sr-only">Profil — {user.name}</h1>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6"><ArrowLeft className="w-4 h-4" /> Geri</Button>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-slate-900/50 border-slate-200/80 sticky top-24">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-sm text-slate-400">{user.email}</p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <KycVerifiedBadge verified={kycVerified} compact />
                  {!kycVerified ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 border-slate-600 text-xs"
                      onClick={() => navigate("/kyc")}
                    >
                      KYC başlat
                    </Button>
                  ) : null}
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm text-slate-400">
                    {publicRating > 0 ? `${publicRating.toFixed(1)} puan` : "Henüz puan yok"}
                    {reviewCount > 0 ? ` · ${reviewCount} yorum` : ""}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Üyelik</span><span className="text-white">{user.memberSince}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Açılan İhale</span><span className="text-white">{user.auctionsCreated}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Kazanılan</span><span className="text-white">{user.auctionsWon}</span></div>
                </div>
                <Button onClick={handleLogout} variant="outline" className="w-full mt-4 border-red-500/20 text-red-400 hover:bg-red-500/10 gap-2"><LogOut className="w-4 h-4" /> Çıkış Yap</Button>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            {saveError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{saveError}</div>}
            {success && <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><CheckCircle2 className="w-4 h-4" /><span className="text-sm">{success}</span></div>}
            <Card className="bg-slate-900/50 border-slate-200/80">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><Edit3 className="w-5 h-5 text-blue-400" /> Profil Bilgileri</h3>
                  <Button size="sm" variant="outline" onClick={() => setEditMode(!editMode)} className="border-slate-200 text-slate-300 hover:text-white">{editMode ? "İptal" : "Düzenle"}</Button>
                </div>
                <div className="space-y-4">
                  <div><label className="text-sm text-slate-400 mb-1.5 block">Ad Soyad</label>{editMode ? <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-950 border-slate-200 text-white" /> : <div className="p-3 rounded-lg bg-white/[0.03] text-white text-sm">{user.name}</div>}</div>
                  <div><label className="text-sm text-slate-400 mb-1.5 block">E-posta</label>{editMode ? <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-950 border-slate-200 text-white" /> : <div className="p-3 rounded-lg bg-white/[0.03] text-white text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" />{user.email}{user.verified && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}</div>}</div>
                  <div><label className="text-sm text-slate-400 mb-1.5 block">Telefon</label>{editMode ? <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-slate-950 border-slate-200 text-white" /> : <div className="p-3 rounded-lg bg-white/[0.03] text-white text-sm"><div className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-400" />{user.phone || "Belirtilmemiş"}</div><p className="text-[11px] text-slate-500 mt-2">Telefon numaranız ilanlarda gösterilmez; iletişim platform mesajları üzerinden yürür.</p></div>}</div>
                  {editMode && <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold">Değişiklikleri Kaydet</Button>}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-200/80">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-blue-400" /> Güvenlik</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]"><span className="text-sm text-white">E-posta Doğrulama</span><span className={`text-xs px-2 py-1 rounded-full ${user.verified ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{user.verified ? "Doğrulandı" : "Bekliyor"}</span></div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]"><span className="text-sm text-white">Telefon Doğrulama</span><span className="text-xs px-2 py-1 rounded-full bg-slate-500/20 text-slate-400">Yakında</span></div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]"><span className="text-sm text-white">İki Faktörlü Doğrulama</span><span className="text-xs px-2 py-1 rounded-full bg-slate-500/20 text-slate-400">Yakında</span></div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]"><span className="text-sm text-white">KYC (Kimlik) Doğrulama</span><span className={`text-xs px-2 py-1 rounded-full ${kycVerified ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{kycVerified ? "Doğrulandı" : "Bekliyor"}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Dalga 4-3: Hesabım Özeti */}
            <Card className="bg-slate-900/50 border-slate-200/80">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-blue-400" /> Hesabım Özeti
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link to="/favoriler" className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-rose-500/10 border border-transparent hover:border-rose-400/30 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-rose-400" />
                      <div>
                        <p className="text-xs text-slate-400">Favoriler</p>
                        <p className="text-lg font-bold text-white">{favorites.length}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-300 transition-colors" />
                  </Link>
                  <Link to="/aramalarim" className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-cyan-500/10 border border-transparent hover:border-cyan-400/30 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <Bookmark className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="text-xs text-slate-400">Kayıtlı arama</p>
                        <p className="text-lg font-bold text-white">{savedApi.loading ? "…" : savedApi.searches.length}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition-colors" />
                  </Link>
                  <Link to="/panel/tekliflerim" className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-amber-500/10 border border-transparent hover:border-amber-400/30 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <HandCoins className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-xs text-slate-400">Aktif tekliflerim</p>
                        <p className="text-lg font-bold text-white">{buyerOffers.loading ? "…" : pendingOffers}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300 transition-colors" />
                  </Link>
                  <Link to="/panel" className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-blue-500/10 border border-transparent hover:border-blue-400/30 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-400">Tüm panele git</p>
                        <p className="text-sm font-semibold text-white">/panel</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-300 transition-colors" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Dalga 4-3: Bildirim Tercihleri */}
            <Card className="bg-slate-900/50 border-slate-200/80">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <BellRing className="w-5 h-5 text-violet-400" /> Bildirim Tercihleri
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Tercihleriniz tarayıcıda saklanır. Sunucu tarafı bildirim entegrasyonu canlı sürümde
                  push token ile çalışır.
                </p>
                <div className="space-y-2">
                  {[
                    { key: "email" as const, label: "E-posta bildirimi", desc: "Yeni eşleşme, teklif, kabul/ret" },
                    { key: "push" as const, label: "Tarayıcı push", desc: "Anlık bildirimler" },
                    { key: "newMatches" as const, label: "Kayıtlı arama eşleşmesi", desc: "Yeni ilan kriterlerinize uyduğunda" },
                    { key: "bidUpdates" as const, label: "Teklif durum güncellemesi", desc: "Outbid / kazandın / karşı teklif" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-violet-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-white">{item.label}</p>
                          <p className="text-[11px] text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifyPrefs[item.key]}
                        onChange={(e) => setNotifyPrefs((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                        className="h-4 w-4 accent-violet-500 flex-shrink-0"
                        aria-label={item.label}
                      />
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
