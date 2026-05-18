import { Lock, EyeOff, Shield, Clock, Users, FileCheck, Scale, Gavel } from "lucide-react";
import { PageShell } from "@/components/marketing/PageShell";

const DEMO_CARDS = [
  { title: "Teklif A", amount: "₺4.850.000", rank: "1.", icon: Gavel },
  { title: "Teklif B", amount: "₺4.720.000", rank: "2.", icon: Scale },
  { title: "Teklif C", amount: "₺4.690.000", rank: "3.", icon: FileCheck },
  { title: "Teklif D", amount: "Gizli", rank: "—", icon: EyeOff },
  { title: "Teklif E", amount: "Gizli", rank: "—", icon: Lock },
  { title: "Teklif F", amount: "Gizli", rank: "—", icon: Shield },
  { title: "Süre", amount: "48 saat", rank: "Aktif", icon: Clock },
  { title: "Katılımcı", amount: "12 firma", rank: "Onaylı", icon: Users },
];

export default function KapaliTeklifPage() {
  return (
    <PageShell
      badge="Kapalı teklif"
      title="Şeffaf kapalı ihale süreci"
      subtitle="Teklifler süre dolana kadar rakiplere açılmaz. Süre sonunda sıralama ve kazanan otomatik belirlenir; tüm adımlar denetim izinde tutulur."
      cta={{ label: "İhalelere git", to: "/ilanlar" }}
    >
      <section className="py-12 grid gap-6 md:grid-cols-2">
        <article className="card-warm">
          <h2 className="text-xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            Nasıl çalışır?
          </h2>
          <ol className="space-y-3 text-sm list-decimal list-inside" style={{ color: "var(--color-text-muted)" }}>
            <li>İlan sahibi kapalı teklif modunu açar ve bitiş süresini belirler.</li>
            <li>Katılımcılar tekliflerini şifreli kanaldan iletir; rakipler tutarı görmez.</li>
            <li>Süre sonunda sistem teklifleri sıralar ve ilan sahibine rapor sunar.</li>
            <li>Kazanan seçildikten sonra sözleşme ve KYC adımları başlatılır.</li>
          </ol>
        </article>
        <article className="card-warm">
          <h2 className="text-xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            Neden kapalı teklif?
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <li>✓ Fiyat savaşını ve son dakika manipülasyonunu azaltır</li>
            <li>✓ Kurumsal satın alma prosedürlerine uygundur</li>
            <li>✓ Denetlenebilir kayıt ve hukuki delil zinciri</li>
            <li>✓ Müteahhit ve GYO ihalelerinde yaygın model</li>
          </ul>
        </article>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "var(--color-text)" }}>
          Demo ihale kartları
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="card-warm transition-all hover:-translate-y-1 hover:border-[rgba(96,165,250,0.35)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                  <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
                    {c.rank}
                  </span>
                </div>
                <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                  {c.title}
                </p>
                <p className="text-lg font-bold mt-1" style={{ color: "var(--color-primary)" }}>
                  {c.amount}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
