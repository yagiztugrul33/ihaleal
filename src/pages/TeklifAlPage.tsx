import { Link } from "react-router-dom";
import { ArrowRight, Banknote, Gavel, LockKeyhole, Repeat } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";

const FLOW_OPTIONS = [
  {
    title: "Anında teklif (iBuyer)",
    subtitle: "OfferEngine ile 72 saat geçerli ön fiyat",
    detail:
      "Mülk + risk girdileri ile otomatik fiyat bandı oluşur. Yüksek riskte süreç hukuk incelemesine düşer.",
    to: "/aninda-teklif",
    icon: Banknote,
  },
  {
    title: "Kapalı teklif",
    subtitle: "Süre bitene kadar teklifler gizli",
    detail:
      "Kurumsal alımlarda fiyat manipülasyonunu azaltır. Süre sonunda sıralama raporu üretilir.",
    to: "/kapali-teklif",
    icon: LockKeyhole,
  },
  {
    title: "Açık artırma",
    subtitle: "Canlı teklif + anti-sniping koruması",
    detail:
      "İhale esnasında görünür fiyat keşfi sağlanır. Son saniye tekliflerinde süre otomatik uzatılır.",
    to: "/ihaleler",
    icon: Gavel,
  },
  {
    title: "Takas (matchEngine)",
    subtitle: "Mevcut mülkten hedef mülke eşleşme",
    detail:
      "Hedef kriterlere göre eşleşme skoru üretilir, iki taraf koruma onayları ile süreç ilerler.",
    to: "/takas",
    icon: Repeat,
  },
];

const FLOW_RULES = [
  {
    title: "Bağlayıcılık",
    detail: "Kapalı teklif ve açık artırma modunda süre/koşul disiplini standart ilana göre daha katıdır.",
  },
  {
    title: "Maliyet görünürlüğü",
    detail: "Komisyon, vergi ve operasyon maliyeti teklif adımından önce net gösterilmelidir.",
  },
  {
    title: "Risk kontrolü",
    detail: "Deprem, hukuki evrak ve satıcı doğrulaması geçmeden teklif süreci kapanışa taşınmaz.",
  },
] as const;

export default function TeklifAlPage() {
  const envReady = isSupabaseConfigured();
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold tracking-tight">Teklif al akış merkezi</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          İlan tipi ve işlem hedefine göre doğru teklif modelini seçin. Her akışta farklı risk/uygunluk
          adımları vardır; kullanıcıya aynı ekran içinde net şekilde gösterilir.
        </p>
        {!envReady ? (
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-100">
            Supabase ortamı olmadığı için teklif işlemleri demo modunda gösterilir. Akışlar boş ekran yerine açıklamalı fallback ile çalışır.
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {FLOW_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <article
                key={option.title}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="inline-flex items-center gap-2 text-xs text-cyan-200">
                  <Icon className="h-3.5 w-3.5" /> {option.subtitle}
                </p>
                <h2 className="mt-2 text-lg font-semibold">{option.title}</h2>
                <p className="mt-2 text-sm text-slate-300">{option.detail}</p>
                <Link to={option.to} className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-cyan-100">
                  Akışı aç <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>

        <section className="mt-8 rounded-xl border border-amber-400/25 bg-amber-500/10 p-4 text-xs text-amber-100">
          Dürüst sınır: Bu modüller işlem öncesi karar desteğidir; nihai fiyat/sözleşme/hukuki uygunluk canlı
          doğrulama ve uzman incelemesi sonrasında kesinleşir.
        </section>
        <section className="mt-6 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
            <h2 className="text-sm font-semibold text-cyan-100">Kime hangi model?</h2>
            <p className="mt-2 text-xs text-slate-200">Yatırımcı: açık artırma/kapalı teklif; satıcı: ilan+özel teklif; müteahhit: takas/kurumsal teklif.</p>
          </article>
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <h2 className="text-sm font-semibold text-emerald-100">Karar disiplini</h2>
            <p className="mt-2 text-xs text-slate-200">Önce ilan doğrulama, sonra maliyet/vergiler, en sonda teklif adımı ilerletilir.</p>
          </article>
          <article className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4">
            <h2 className="text-sm font-semibold text-violet-100">Bağlı araçlar</h2>
            <p className="mt-2 text-xs text-slate-200">AI değerleme, deprem risk ve emsal kıyas ekranlarıyla teklif kalitesi yükseltilir.</p>
          </article>
        </section>
        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-semibold text-slate-100">Hızlı işlem akışı</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-slate-300">
            <li>İlanı seç, uygun teklif modeli önerisini gör.</li>
            <li>Model bazlı koşulları (süre, gizlilik, bağlayıcılık) onayla.</li>
            <li>Maliyet ve risk kartlarını doğrula, ardından teklif gönder.</li>
            <li>Süreç kaydını panelde takip et; kapanışta sözleşme/evrak adımına geç.</li>
          </ol>
        </section>
        <section className="mt-6 grid gap-3 md:grid-cols-3">
          {FLOW_RULES.map((rule) => (
            <article key={rule.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="text-sm font-semibold text-slate-100">{rule.title}</h2>
              <p className="mt-2 text-xs text-slate-300">{rule.detail}</p>
            </article>
          ))}
        </section>
        <section className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-slate-200">
          <p className="font-semibold text-cyan-100">CTA</p>
          <p className="mt-1">
            Önce ilan detayındaki AI değerleme, deprem skoru ve emsal tablosunu doğrulayın; ardından uygun teklif modeline geçin.
          </p>
          <p className="mt-1">
            Teklif gönderimi sonrası tüm adımlar kayıt altına alınır ve rol panelinden izlenebilir.
          </p>
        </section>
      </section>
    </main>
  );
}
