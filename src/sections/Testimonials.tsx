import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Quote } from "lucide-react";

const ITEMS = [
  {
    name: "Selin A.",
    role: "Yatırımcı · İstanbul",
    text: "Teklif süreci net; kimlik bilgisi ilanda görünmediği için daha rahat teklif verdim.",
  },
  {
    name: "Murat K.",
    role: "Satıcı · Ankara",
    text: "Şeffaf ücret çizelgesi ve mahsup mantığı komisyonu anlamayı kolaylaştırdı.",
  },
  {
    name: "Ebru Y.",
    role: "Alıcı · İzmir",
    text: "Harita ve çevre verisi ile karşılaştırma yapmak güzel; demo ortamında akışı denedik.",
  },
];

export function Testimonials() {
  const { ref, isVisible } = useScrollAnimation(0.12);

  return (
    <section className="relative py-24 lg:py-32 border-t border-white/10">
      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="section-heading mb-3">Kullanıcı yorumları</h2>
          <p className="section-subtitle max-w-2xl mx-auto text-sm">
            Demo deneyiminden öne çıkan geri bildirimler (tanıtım amaçlı).
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {ITEMS.map((t, i) => (
            <div
              key={t.name}
              className={`card-warm transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <Quote className="h-8 w-8 text-teal-500/60 mb-4" />
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{t.text}</p>
              <p className="mt-4 text-xs font-medium" style={{ color: "var(--color-text)" }}>{t.name}</p>
              <p className="text-[11px] text-slate-500">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
