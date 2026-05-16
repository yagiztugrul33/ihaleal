import { Link } from "react-router-dom";

const features = [
  { title: "Multi-Tenant Portfoy", desc: "Tum ofislerinizi tek panelden yonetin." },
  { title: "Rol Bazli Yetki", desc: "Owner, Admin, Manager, Agent, Viewer." },
  { title: "Toplu Ilan", desc: "CSV ile yuzlerce ilan yukleyin." },
  { title: "AI Fiyat", desc: "Piyasa karsilastirmasi ve guven araligi." },
  { title: "Analytics", desc: "Goruntulenme, lead ve donusum." },
  { title: "API", desc: "CRM entegrasyonu ve webhook." },
  { title: "Komisyon", desc: "Cok ofisli yapilarda seffaf split." },
  { title: "KYC", desc: "Mernis, Findeks, tapu dogrulama." },
];

const plans = [
  { name: "Free", price: "0 TL", suited: "Bireysel emlakci", features: ["5 ilan/ay", "Temel AI"] },
  { name: "Agency", price: "2.490 TL", suited: "Boutique ofis", features: ["100 ilan/ay", "Bulk upload"] },
  { name: "GYO", price: "7.490 TL", suited: "GYO ve gruplar", features: ["Sinirsiz ilan", "API"] },
  { name: "Enterprise", price: "Ozel", suited: "Re/Max, buyuk gruplar", features: ["SLA", "White-label"] },
];

export default function Corporate() {
  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-700">ihaleal Kurumsal</p>
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
            Turkiye&apos;nin seffaf gayrimenkul pazaryeri, kurumsal gucle.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Emlak ofisleri, GYO&apos;lar ve muteahhitler icin portfoy yonetimi ve AI fiyatlama.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/kurumsal/iletisim" className="rounded-lg bg-slate-900 px-6 py-3 text-sm text-white hover:bg-slate-800">
              Demo Talep Et
            </Link>
            <a href="#planlar" className="rounded-lg border border-slate-300 px-6 py-3 text-sm text-slate-700 hover:bg-slate-50">
              Planlari Incele
            </a>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-900">Kurumsal Ozellikler</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <article key={f.title} className="rounded-lg border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="planlar" className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-900">Fiyatlandirma</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => (
              <article key={p.name} className="rounded-lg border border-slate-200 bg-white p-6">
                <p className="text-sm uppercase text-slate-500">{p.name}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{p.price}</p>
                <p className="mt-1 text-xs text-slate-500">{p.suited}</p>
                <ul className="mt-4 space-y-1 text-sm text-slate-700">
                  {p.features.map((ft) => (
                    <li key={ft} className="flex gap-2">
                      <span className="text-emerald-600">+</span> {ft}
                    </li>
                  ))}
                </ul>
                <Link to="/kurumsal/iletisim" className="mt-6 block rounded-lg bg-slate-900 py-2.5 text-center text-sm text-white hover:bg-slate-800">
                  {p.name === "Enterprise" ? "Iletisime Gec" : "Basla"}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
