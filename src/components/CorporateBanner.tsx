import { Link } from "react-router-dom";

export function CorporateBanner() {
  return (
    <section className="border-y border-slate-200 bg-gradient-to-r from-slate-50 to-white py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Kurumsal Çözümler
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Emlak Ofisleri, GYO&apos;lar ve Müteahhitler için
              <br className="hidden md:block" />
              Türkiye&apos;nin İlk Şeffaf İhale Pazaryeri
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Portföyünüzü yönetin, ekip üyelerinizi davet edin, AI destekli fiyatlama ile
              ilanlarınızı optimize edin.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/kurumsal" className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
                Kurumsal Çözümleri Keşfet
              </Link>
              <Link to="/kurumsal/iletisim" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Görüşme Talep Et
              </Link>
            </div>
          </div>
          <div className="hidden md:flex md:flex-col md:items-end md:gap-2">
            <p className="text-xs text-slate-500">Güvenen kurumsal hesaplar</p>
            <div className="flex items-center gap-6 opacity-60">
              <span className="text-lg font-semibold text-slate-600">RE/MAX</span>
              <span className="text-lg font-semibold text-slate-600">Akfen GYO</span>
              <span className="text-lg font-semibold text-slate-600">Tahincioğlu</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
