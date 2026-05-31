import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { Contact } from "@/sections/Contact";

/**
 * Kurumsal iletişim sayfası — Dalga 4-4:
 * - Görünür h1 "İletişim" (eski sr-only kaldırıldı)
 * - Şirket konum kartı (özet)
 * - Google Maps embed (Şişli Astoria)
 * - Contact section (form + tel/mail/adres kartları)
 */
export default function Iletisim() {
  // Adres: Esentepe Mah. Büyükdere Cad. Astoria No: 127/6, Şişli/İstanbul
  // Google Maps embed (no API key required for basic place mode)
  const mapsQuery = encodeURIComponent("Astoria Esentepe Büyükdere Caddesi 127 Şişli Istanbul");
  const embedUrl = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Görünür h1 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 mb-3">
            <Mail className="h-3.5 w-3.5" /> İletişim
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Bize Ulaşın
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Sorularınız, talepleriniz veya iş birliği teklifleriniz için aşağıdaki kanallardan
            yararlanabilirsiniz. İş günü içinde 24 saat dönüş hedefliyoruz.
          </p>
        </div>

        {/* Hızlı temas kartları */}
        <div className="grid gap-3 sm:grid-cols-3 mb-8">
          <a
            href="mailto:info@ihaleal.com"
            className="rounded-2xl border border-cyan-400/25 bg-slate-900/40 p-4 hover:border-cyan-400/50 transition-colors flex items-start gap-3 group"
          >
            <Mail className="w-5 h-5 text-cyan-300 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 uppercase tracking-wider">E-posta</p>
              <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">info@ihaleal.com</p>
              <p className="text-[10px] text-slate-500 mt-1">İş günü 24h dönüş</p>
            </div>
          </a>
          <a
            href="tel:+905445327406"
            className="rounded-2xl border border-emerald-400/25 bg-slate-900/40 p-4 hover:border-emerald-400/50 transition-colors flex items-start gap-3 group"
          >
            <Phone className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Telefon</p>
              <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">0544 532 74 06</p>
              <p className="text-[10px] text-slate-500 mt-1">Hafta içi 09:00–18:00 (UTC+3)</p>
            </div>
          </a>
          <div className="rounded-2xl border border-amber-400/25 bg-slate-900/40 p-4 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Adres</p>
              <p className="text-sm font-semibold text-white">Şişli, İstanbul</p>
              <p className="text-[10px] text-slate-500 mt-1">Astoria Plaza Kapı 127 / 6</p>
            </div>
          </div>
        </div>

        {/* Şişli Astoria harita */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden mb-8">
          <div className="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" /> Ofis Konumu
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Esentepe Mah. Büyükdere Cad. Astoria, Kapı No: 127 Daire No: 6 · Şişli / İstanbul
              </p>
            </div>
            <a
              href={`https://www.google.com/maps?q=${mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs !text-cyan-200 hover:!text-cyan-100 hover:underline px-2 py-1 rounded-md bg-cyan-500/15 border border-cyan-400/40"
            >
              <Clock className="w-3 h-3" /> Yol tarifi al
            </a>
          </div>
          <div className="aspect-[16/9] sm:aspect-[21/9] bg-slate-800">
            <iframe
              src={embedUrl}
              title="ihaleal.com ofis konumu — Astoria, Şişli, İstanbul"
              loading="lazy"
              className="w-full h-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        {/* Contact section (mevcut form + kartlar) */}
        <Contact />
      </div>
    </div>
  );
}
