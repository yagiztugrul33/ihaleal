import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DEMO_REALTORS } from "@/data/realtorsDemo";

export default function RealtorsPage() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string>("all");

  const cities = useMemo(() => [...new Set(DEMO_REALTORS.map((r) => r.city))].sort(), []);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return DEMO_REALTORS.filter((r) => {
      if (city !== "all" && r.city !== city) return false;
      if (!ql) return true;
      return `${r.companyName} ${r.city}`.toLowerCase().includes(ql);
    });
  }, [q, city]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-violet-500/15 p-3 text-violet-400">
              <Building2 className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold text-white">Ortak emlakçılar</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              {DEMO_REALTORS.length} demo profil — puan, işlem hacmi ve yorumlar tanıtım içindir; bağlayıcı ticari taahhüt değildir.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ofis veya şehir ara..."
              className="w-full min-w-[200px] border-slate-200 bg-slate-900/60 text-white sm:w-64"
            />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-900 px-3 py-2 text-sm text-white"
              aria-label="Şehir filtresi"
            >
              <option value="all">Tüm şehirler</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <Card key={r.slug} className="border-slate-200 bg-slate-900/40 transition-colors hover:border-teal-500/25">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold leading-snug text-white">{r.companyName}</h2>
                  <span className="flex shrink-0 items-center gap-1 text-amber-400">
                    <Star className="h-4 w-4 fill-current" /> {r.rating.toFixed(1)}
                  </span>
                </div>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" /> {r.city}
                </p>
                <p className="line-clamp-2 text-sm text-slate-400">{r.bio}</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.specialties.map((s) => (
                    <Badge key={s} variant="outline" className="border-white/15 text-[11px] text-slate-400">
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
                  <span>{r.closedDeals} işlem (demo)</span>
                  <span>₺{(r.volumeTry / 1e9).toFixed(2)}B hacim</span>
                </div>
                <Link
                  to={`/emlakçı/${r.slug}`}
                  className="inline-flex w-full justify-center rounded-lg bg-white/5 py-2 text-sm font-medium text-teal-300 hover:bg-teal-500/10"
                >
                  Profili gör
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {rows.length === 0 ? <p className="py-16 text-center text-slate-500">Sonuç yok.</p> : null}
        <section className="mt-8 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Nedir / neden</h3>
            <p className="mt-2">Ortak emlakçı sayfası, yatırımcı ile danışman arasında güvenli ilk temas katmanı oluşturur.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">İçerik</h3>
            <p className="mt-2">Şehir, uzmanlık, işlem hacmi ve yorum sinyalleri aynı kartta görünür; hızlı ön eleme yapılır.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Örnek</h3>
            <p className="mt-2">İstanbul ticari ofis arayan kullanıcı, şehir filtresiyle yüksek hacimli uzman danışmanı seçer.</p>
          </article>
        </section>
        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Kime göre</h3>
            <p className="mt-2">
              Bireysel kullanıcı güvenilir danışman arar, kurumsal kullanıcı ise uzmanlık dağılımı ve portföy uyumuna göre seçim yapar.
            </p>
          </article>
          <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-slate-200">
            <h3 className="font-semibold text-amber-100">Dürüst sınır + CTA</h3>
            <p className="mt-2">
              Bu liste tanıtım ve demo sinyali sunar; nihai çalışma kararı sözleşme ve bağımsız değerlendirme ile verilmelidir.
            </p>
            <p className="mt-2">CTA: Profili inceleyin, kısa görüşme planlayın ve işlem kapsamını yazılı olarak netleştirin.</p>
          </article>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Onboarding ve geri dönüş</h3>
          <p className="mt-2">
            Yeni kullanıcı ilk eşleşmeyi bu ekran üzerinden yapar; geri dönen kullanıcı son görüştüğü danışmana doğrudan dönerek teklif
            sürecini hızlandırır.
          </p>
        </section>
        <section className="mt-4 rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-xs text-slate-200">
          <h3 className="font-semibold text-cyan-100">CTA</h3>
          <p className="mt-2">Uygun danışmanı seçin, kısa plan görüşmesi yapın ve süreç sorumluluklarını yazılı netleştirin.</p>
        </section>
      </div>
    </div>
  );
}
