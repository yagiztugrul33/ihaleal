import { useState } from "react";
import { Bell, CheckCircle2, Info } from "lucide-react";
import { Link } from "react-router-dom";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: typeof Bell;
  unread?: boolean;
};

const ALL: NotificationItem[] = [
  { id: "1", title: "Yeni teklif", body: "Kadıköy 3+1 ilanınıza yeni teklif geldi.", time: "5 dk önce", icon: Bell, unread: true },
  { id: "2", title: "İhale sona erdi", body: "Ankara ticari plaza ihalesi kapandı.", time: "1 saat önce", icon: CheckCircle2 },
  { id: "3", title: "Fiyat düştü", body: "İzlediğiniz ilanda %2,1 fiyat düşüşü var.", time: "Dün", icon: Info },
  { id: "4", title: "KYC onaylandı", body: "Kimlik doğrulamanız tamamlandı.", time: "2 gün önce", icon: CheckCircle2 },
];

const TABS = [
  { id: "all" as const, label: "Tümü", items: ALL },
  { id: "unread" as const, label: "Okunmamış", items: ALL.filter((n) => n.unread) },
  { id: "system" as const, label: "Sistem", items: ALL.filter((n) => n.icon === Info) },
];

export default function BildirimlerPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];
  const hasItems = active.items.length > 0;
  return (
    <div className="min-h-screen bg-[#050b16] px-4 pb-16 pt-24 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Bildirimler</h1>
        <section className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3 text-xs text-slate-200">
            <p className="font-semibold text-cyan-100">Nedir?</p>
            <p className="mt-1">Teklif, operasyon, güvenlik ve sistem sinyallerini tek kutuda toplayan kullanıcı merkezi.</p>
          </article>
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-slate-200">
            <p className="font-semibold text-emerald-100">Neden?</p>
            <p className="mt-1">Kritik olayları kaçırmadan aksiyon almayı ve geri dönüş akışını hızlandırmayı sağlar.</p>
          </article>
          <article className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-3 text-xs text-slate-200">
            <p className="font-semibold text-violet-100">Demo etiketi</p>
            <p className="mt-1">Bu listede örnek bildirim kartları kullanılır; üretimde kullanıcı olaylarından beslenir.</p>
          </article>
        </section>
        <div className="mb-6 mt-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={tab === t.id ? "rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" : "rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300"}>
              {t.label} ({t.items.length})
            </button>
          ))}
        </div>
        {hasItems ? (
          <ul className="space-y-3">
            {active.items.map((n) => {
              const Icon = n.icon;
              return (
                <li key={n.id} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400"><Icon className="h-5 w-5" /></div>
                  <div><p className="font-semibold text-white">{n.title}</p><p className="text-sm text-slate-400">{n.body}</p><p className="text-xs text-slate-500">{n.time}</p></div>
                </li>
              );
            })}
          </ul>
        ) : (
          <article className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-center">
            <p className="text-sm text-slate-300">Bu sekmede henüz bildirim yok.</p>
            <p className="mt-1 text-xs text-slate-500">Yeni aktivite olduğunda burada görünecek.</p>
          </article>
        )}
        <section className="mt-6 grid gap-3 md:grid-cols-3 text-xs">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="font-semibold text-slate-100">Yöntem</p>
            <p className="mt-1 text-slate-300">Bildirimler olay türüne göre etiketlenir: teklif, sistem, güvenlik.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="font-semibold text-slate-100">Örnek</p>
            <p className="mt-1 text-slate-300">Yeni teklif bildirimi geldiğinde kullanıcı doğrudan ilgili ilana yönlendirilir.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="font-semibold text-slate-100">Kime göre</p>
            <p className="mt-1 text-slate-300">Bireysel ve kurumsal kullanıcı aynı merkezden farklı aksiyon kartı görür.</p>
          </article>
        </section>
        <section className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-slate-200">
          <p className="font-semibold text-amber-100">Dürüst sınır</p>
          <p className="mt-1">Bildirim akışı operasyon desteğidir; resmi tebligat veya sözleşmesel bildirim yerine geçmez.</p>
        </section>
        <section className="mt-4 flex flex-wrap gap-2">
          <Link to="/dashboard" className="rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
            Dashboard’a dön
          </Link>
          <Link to="/mesajlar" className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
            Mesaj merkezi
          </Link>
        </section>
        <section className="mt-6 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">Onboarding</p>
            <p className="mt-1">
              İlk girişte kullanıcıya bildirim tercihleri, kritik alarm türleri ve sessiz saat ayarı önerilir.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">Geri dönüş akışı</p>
            <p className="mt-1">
              Okunmamış kart seçildiğinde kullanıcı doğrudan ilgili ilan/mesaj/işlem ekranına yönlendirilir.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">Kime göre</p>
            <p className="mt-1">
              Bireysel kullanıcı teklif alarmı; kurumsal kullanıcı operasyon ve onay alarmını öncelikli görür.
            </p>
          </article>
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-xs text-slate-200">
            <p className="font-semibold text-cyan-100">CTA</p>
            <p className="mt-1">Bildirim tercihlerinizi profil ayarlarından güncelleyin, kritik kartları sabitleyin.</p>
          </article>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Örnek kullanım senaryosu</h3>
          <p className="mt-2">
            Kullanıcı favori ilan için fiyat düşüş bildirimi alır, tek tıkla ilana gider, teklif kartını günceller ve işlemi mesaj merkezinden takip eder.
          </p>
        </section>
        <section className="mt-4 rounded-xl border border-blue-500/25 bg-blue-500/10 p-4 text-xs text-slate-200">
          <h3 className="font-semibold text-blue-100">CTA</h3>
          <p className="mt-2">Bildirim merkezini günlük kontrol ederek yarım kalan adımları panel ve mesaj ekranında tamamlayın.</p>
          <p className="mt-2">Kritik bildirimleri sabitleyerek teklif, belge ve sözleşme akışını tek yerden takip edin.</p>
          <p className="mt-2">Aksiyon alınan bildirimleri arşivleyip okunmamış kuyruğunu temiz tutun.</p>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">Platform modülleri dili</p>
          <p className="mt-1">Bildirimler; sinyal, aksiyon, sınır ve takip adımı başlıklarıyla diğer modüllerle aynı terminolojiyi kullanır.</p>
        </section>
      </div>
    </div>
  );
}
