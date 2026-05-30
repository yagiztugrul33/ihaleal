/**
 * /kunye — Yasal künye (TTK/MERSİS uyumlu, e-ticaret yönetmeliği gereği).
 * Bilgilendirme amaçlıdır; resmi sözleşmeler avukat tarafından düzenlenir.
 */
import { Link } from "react-router-dom";
import { Building2, FileText, Phone, Mail, MapPin, Hash } from "lucide-react";

export default function Kunye() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-7 h-7 text-cyan-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">Künye</h1>
        </div>
        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
          6563 Sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve TTK uyarınca
          işletme bilgileri. Bilgilendirme amaçlıdır; bağlayıcı resmi belgeler için
          ilgili sözleşme/avukat onayı esastır.
        </p>

        <section className="space-y-4">
          <div className="rounded-2xl border border-cyan-400/20 bg-slate-900/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-cyan-300" />
              <h2 className="text-lg font-semibold text-white">Şirket Bilgileri</h2>
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt className="text-slate-400">Unvan</dt>
              <dd className="text-slate-100 font-medium">
                İHALEAL GAYRİMENKUL VE İNŞAAT SAN. TİC. LTD. ŞTİ.
              </dd>
              <dt className="text-slate-400">Marka</dt>
              <dd className="text-slate-100">ihaleal.com</dd>
              <dt className="text-slate-400">Faaliyet</dt>
              <dd className="text-slate-100">
                Gayrimenkul ihale ve borsa platformu, AI değerleme, ilan/komisyon hizmetleri
              </dd>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-cyan-300" />
              <h2 className="text-lg font-semibold text-white">Adres</h2>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">
              Esentepe Mah. Büyükdere Cad. Astoria No: 127/6<br />
              Şişli / İstanbul / Türkiye
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-5 h-5 text-cyan-300" />
              <h2 className="text-lg font-semibold text-white">Yasal Numaralar</h2>
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt className="text-slate-400">Vergi Dairesi</dt>
              <dd className="text-slate-100">Zincirlikuyu V.D.</dd>
              <dt className="text-slate-400">Vergi Numarası</dt>
              <dd className="text-slate-100 font-mono">0911295729</dd>
              <dt className="text-slate-400">MERSİS</dt>
              <dd className="text-slate-100 font-mono text-xs">(yakında eklenecek)</dd>
              <dt className="text-slate-400">Ticaret Sicil No</dt>
              <dd className="text-slate-100 font-mono text-xs">(yakında eklenecek)</dd>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-cyan-300" />
              <h2 className="text-lg font-semibold text-white">Sorumlu Emlak Danışmanı</h2>
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt className="text-slate-400">Seviye</dt>
              <dd className="text-slate-100">Seviye 5</dd>
              <dt className="text-slate-400">Yeterlilik Belge No</dt>
              <dd className="text-slate-100 font-mono text-xs">YB0378 / 17UY0333-5/00/2056</dd>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-cyan-300" />
              <h2 className="text-lg font-semibold text-white">İletişim</h2>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-slate-200 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" /> info@ihaleal.com
              </p>
              <p className="text-slate-200 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" /> (yakında)
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Link to="/iletisim" className="text-cyan-300 underline hover:text-cyan-200">
                İletişim formu
              </Link>
              <Link to="/kvkk" className="text-cyan-300 underline hover:text-cyan-200">
                KVKK
              </Link>
              <Link to="/gizlilik" className="text-cyan-300 underline hover:text-cyan-200">
                Gizlilik
              </Link>
              <Link to="/destek" className="text-cyan-300 underline hover:text-cyan-200">
                Destek
              </Link>
            </div>
          </div>
        </section>

        <p className="text-slate-500 text-xs mt-8 leading-relaxed">
          * Bu sayfa 6563 Sayılı Kanun m.3 uyarınca işletme künye bilgilerini gösterir.
          Marka, unvan veya iletişim bilgilerinde değişiklik olduğunda güncellenir.
          Resmi sicil/SGK/MERSİS belgeleri için ilgili kurum portalları esas alınır.
        </p>
      </div>
    </div>
  );
}
