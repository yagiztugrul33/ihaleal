import { Link } from "react-router-dom";
import { Mail, MessageCircle, Phone, BookOpen } from "lucide-react";
import { PageShell } from "@/components/marketing/PageShell";

const CHANNELS = [
  {
    icon: Mail,
    title: "E-posta destek",
    desc: "Kurumsal ve bireysel talepler için 7/24 kayıt; iş günlerinde yanıt.",
    action: "destek@ihaleal.com",
    href: "mailto:destek@ihaleal.com",
  },
  {
    icon: MessageCircle,
    title: "Canlı sohbet",
    desc: "Platform içi asistan ve insan destek hattı (iş saatleri).",
    action: "Sohbeti başlat",
    href: "/iletisim",
  },
  {
    icon: Phone,
    title: "Kurumsal hat",
    desc: "GYO ve müteahhit hesapları için öncelikli telefon hattı.",
    action: "+90 (212) 000 00 00",
    href: "tel:+902120000000",
  },
  {
    icon: BookOpen,
    title: "Bilgi bankası",
    desc: "Sık sorulan sorular, rehberler ve video içerikler.",
    action: "SSS sayfasına git",
    href: "/sss",
  },
];

export default function DestekPage() {
  return (
    <PageShell
      badge="Destek"
      title="Size nasıl yardımcı olabiliriz?"
      subtitle="Teknik sorun, ihale süreci veya kurumsal entegrasyon konularında ekibimiz yanınızda."
    >
      <section className="py-10 grid gap-6 md:grid-cols-2">
        {CHANNELS.map((ch) => {
          const Icon = ch.icon;
          const isExternal = ch.href.startsWith("http") || ch.href.startsWith("mailto") || ch.href.startsWith("tel");
          const inner = (
            <>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--color-bg-soft)", color: "var(--color-primary)" }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
                {ch.title}
              </h2>
              <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
                {ch.desc}
              </p>
              <span className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                {ch.action} →
              </span>
            </>
          );
          return isExternal ? (
            <a key={ch.title} href={ch.href} className="card-warm block hover:-translate-y-1 transition-transform">
              {inner}
            </a>
          ) : (
            <Link key={ch.title} to={ch.href} className="card-warm block hover:-translate-y-1 transition-transform">
              {inner}
            </Link>
          );
        })}
      </section>
    </PageShell>
  );
}
