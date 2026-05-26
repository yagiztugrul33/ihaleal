import { Link } from "react-router-dom";
import { ArrowRight, Banknote, Gavel, LockKeyhole, Repeat } from "lucide-react";

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

export default function TeklifAlPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold tracking-tight">Teklif al akış merkezi</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          İlan tipi ve işlem hedefine göre doğru teklif modelini seçin. Her akışta farklı risk/uygunluk
          adımları vardır; kullanıcıya aynı ekran içinde net şekilde gösterilir.
        </p>

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
      </section>
    </main>
  );
}
