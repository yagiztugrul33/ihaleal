import { Link, useParams } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ArrowLeft, Building2, MapPin, Star, MessageSquare, ShieldCheck, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { getRealtorBySlug } from "@/data/realtorsDemo";

export default function RealtorProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const r = slug ? getRealtorBySlug(slug) : undefined;
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewScore, setReviewScore] = useState("5");
  const [reviews, setReviews] = useState(r?.reviews ?? []);

  if (!r) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-24">
        <p className="mb-4 text-slate-400">Profil bulunamadı.</p>
        <Button asChild variant="outline">
          <Link to="/emlakciler">Listeye dön</Link>
        </Button>
      </div>
    );
  }

  const chartData = r.salesHistory.map((x) => ({
    ay: x.month.slice(5),
    adet: x.count,
    hacim: Math.round(x.volumeTry / 1_000_000),
  }));

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <Button variant="ghost" size="sm" className="gap-2 text-slate-400" asChild>
          <Link to="/emlakciler">
            <ArrowLeft className="h-4 w-4" /> Ortak emlakçılar
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="rounded-xl bg-violet-500/15 p-4 text-violet-400">
              <Building2 className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{r.companyName}</h1>
              <p className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">
                <BadgeCheck className="h-3.5 w-3.5" /> Doğrulanmış satıcı
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4" /> {r.city}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {r.specialties.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-white/10 text-slate-200">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-900/50 px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-400">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-2xl font-bold text-white">{r.rating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-slate-500">{r.reviewCount} değerlendirme (demo)</p>
            <Button
              type="button"
              className="mt-3 w-full gap-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white text-sm"
              onClick={() => setMsgOpen(true)}
            >
              <MessageSquare className="h-4 w-4" /> Mesaj gönder
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Kapanan işlem</p>
              <p className="mt-1 text-2xl font-bold text-white">{r.closedDeals}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">12 ay hacim (demo)</p>
              <p className="mt-1 text-2xl font-bold text-teal-300">₺{(r.volumeTry / 1e9).toFixed(2)}B</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Ortaklık modeli</p>
              <p className="mt-1 text-sm text-slate-300">B2B payı iş modeli ile uyumlu (bilgilendirme).</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-emerald-500/25 bg-emerald-500/10">
          <CardContent className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-100">
              <ShieldCheck className="h-4 w-4" /> Güvenli işlem rozetleri
            </h2>
            <div className="flex flex-wrap gap-2">
              {["Kimlik Doğrulandı", "Evrak Kontrolü", "Güvenli Ödeme Akışı", "Platform İçi Mesajlaşma"].map((badge) => (
                <span key={badge} className="rounded-full border border-emerald-300/35 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                  {badge}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-300">Rozetler demo/mock veridir; canlı ortamda doğrulama kayıtları ile güncellenir.</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-900/40">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Satış geçmişi (demo)</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="ay" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <Bar dataKey="adet" fill="#14b8a6" name="adet" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hacim" fill="#6366f1" name="hacim" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Yorumlar (demo)</h2>
          <div className="space-y-3">
            {reviews.map((rv, i) => (
              <Card key={i} className="border-slate-200 bg-slate-900/30">
                <CardContent className="p-5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-white">{rv.author}</span>
                    <span className="text-amber-400">{rv.score}/5</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{rv.text}</p>
                  <p className="mt-2 text-xs text-slate-600">{rv.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-slate-200 bg-slate-900/30">
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-white">Yorum bırak (demo)</h3>
            <p className="mt-1 text-xs text-slate-400">Bu form yalnızca mock değerlendirme akışını gösterir.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-[120px,1fr]">
              <Input value={reviewScore} onChange={(e) => setReviewScore(e.target.value)} placeholder="Puan (1-5)" />
              <Input value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Deneyiminizi yazın..." />
            </div>
            <Button
              type="button"
              className="mt-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
              onClick={() => {
                const numeric = Math.max(1, Math.min(5, Number(reviewScore) || 5));
                const text = reviewText.trim();
                if (!text) return;
                setReviews((prev) => [{ author: "Demo Kullanıcı", score: numeric, text, date: "Bugün · demo" }, ...prev].slice(0, 8));
                setReviewText("");
                setReviewScore("5");
              }}
            >
              Yorumu ekle
            </Button>
          </CardContent>
        </Card>

        <p className="text-xs leading-relaxed text-slate-600">{r.bio}</p>

        <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
          <DialogContent className="border-slate-200 bg-slate-900 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Mesaj gönder — {r.companyName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <p className="text-xs text-slate-400">
                Mesajlar platform kanalı üzerinden iletilir; doğrudan telefon paylaşımı yapılmaz (demo).
              </p>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Konu</label>
                <Input
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  placeholder="örn. Kadıköy ilanı hakkında"
                  className="bg-slate-950 border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Mesajınız</label>
                <Textarea
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder="Merhaba, ..."
                  rows={4}
                  className="bg-slate-950 border-slate-200 resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="border-white/15" onClick={() => setMsgOpen(false)}>
                Vazgeç
              </Button>
              <Button
                type="button"
                className="bg-gradient-to-r from-blue-500 to-teal-400 text-white"
                onClick={() => {
                  setMsgOpen(false);
                  setMsgSubject("");
                  setMsgBody("");
                  window.dispatchEvent(
                    new CustomEvent("ihaleal:add-toast", {
                      detail: { message: "Mesajınız demo kuyruğa alındı (simülasyon).", type: "success" },
                    })
                  );
                }}
              >
                Gönder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
