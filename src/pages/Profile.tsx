import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Shield, CheckCircle2, Edit3, LogOut, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { stripForSession, dispatchAuthChanged, type StoredUser, type SessionUser } from "@/lib/auth";

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

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Giriş yapmanız gerekiyor.</p>
          <Button onClick={() => navigate("/giris")} className="mt-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white">Giriş Yap</Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!user) return;
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

  const handleLogout = () => {
    localStorage.removeItem("ihaleal_user");
    dispatchAuthChanged();
    navigate("/");
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2 mb-6"><ArrowLeft className="w-4 h-4" /> Geri</Button>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-slate-900/50 border-white/5 sticky top-24">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-sm text-slate-400">{user.email}</p>
                <div className="flex items-center justify-center gap-1 mt-2"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><span className="text-sm text-slate-400">{user.rating || 0} Puan</span></div>
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Üyelik</span><span className="text-white">{user.memberSince}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Açılan İhale</span><span className="text-white">{user.auctionsCreated}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Kazanılan</span><span className="text-white">{user.auctionsWon}</span></div>
                </div>
                <Button onClick={handleLogout} variant="outline" className="w-full mt-4 border-red-500/20 text-red-400 hover:bg-red-500/10 gap-2"><LogOut className="w-4 h-4" /> Çıkış Yap</Button>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            {success && <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><CheckCircle2 className="w-4 h-4" /><span className="text-sm">{success}</span></div>}
            <Card className="bg-slate-900/50 border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><Edit3 className="w-5 h-5 text-blue-400" /> Profil Bilgileri</h3>
                  <Button size="sm" variant="outline" onClick={() => setEditMode(!editMode)} className="border-white/10 text-slate-300 hover:text-white">{editMode ? "İptal" : "Düzenle"}</Button>
                </div>
                <div className="space-y-4">
                  <div><label className="text-sm text-slate-400 mb-1.5 block">Ad Soyad</label>{editMode ? <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-950 border-white/10 text-white" /> : <div className="p-3 rounded-lg bg-white/[0.03] text-white text-sm">{user.name}</div>}</div>
                  <div><label className="text-sm text-slate-400 mb-1.5 block">E-posta</label>{editMode ? <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-950 border-white/10 text-white" /> : <div className="p-3 rounded-lg bg-white/[0.03] text-white text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" />{user.email}{user.verified && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}</div>}</div>
                  <div><label className="text-sm text-slate-400 mb-1.5 block">Telefon</label>{editMode ? <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-slate-950 border-white/10 text-white" /> : <div className="p-3 rounded-lg bg-white/[0.03] text-white text-sm flex items-center gap-2"><Phone className="w-4 h-4 text-blue-400" />{user.phone || "Belirtilmemiş"}</div>}</div>
                  {editMode && <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold">Değişiklikleri Kaydet</Button>}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-white/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-blue-400" /> Güvenlik</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]"><span className="text-sm text-white">E-posta Doğrulama</span><span className={`text-xs px-2 py-1 rounded-full ${user.verified ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{user.verified ? "Doğrulandı" : "Bekliyor"}</span></div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]"><span className="text-sm text-white">Telefon Doğrulama</span><span className="text-xs px-2 py-1 rounded-full bg-slate-500/20 text-slate-400">Yakında</span></div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]"><span className="text-sm text-white">İki Faktörlü Doğrulama</span><span className="text-xs px-2 py-1 rounded-full bg-slate-500/20 text-slate-400">Yakında</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
