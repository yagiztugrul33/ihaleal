import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ShieldCheck, Lock, Mail, Calendar, Smartphone, Database,
  Eye, Globe, CheckCircle2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LegalDisclaimer, LegalDraftBanner, LegalCitationStrip,
} from "@/components/legal/LegalDisclaimer";

/**
 * Gizlilik Politikası — KVKK + GDPR + Apple App Privacy + Google Play Data Safety uyumlu.
 *
 * Apple/Google mobil mağaza şartı: "uygulama içinde erişilebilir" gizlilik politikası
 * + topladığımız veri kategorileri açık liste (App Store Privacy Label /
 * Google Play Data Safety formuyla bire-bir tutarlı olmalı).
 */

interface DataItem {
  kategori: string;
  veri: string;
  amac: string;
  paylasim: "yok" | "ucuncu_taraf" | "anonim_3rd";
  topla: boolean;
}

const DATA_INVENTORY: DataItem[] = [
  // İletişim
  { kategori: "İletişim", veri: "E-posta", amac: "Hesap + bildirim + destek", paylasim: "ucuncu_taraf", topla: true },
  { kategori: "İletişim", veri: "Telefon (isteğe bağlı)", amac: "2FA + iletişim", paylasim: "yok", topla: true },
  // Kimlik
  { kategori: "Kimlik", veri: "Ad + soyad", amac: "Hesap + KVKK", paylasim: "yok", topla: true },
  { kategori: "Kimlik", veri: "T.C. kimlik no", amac: "MASAK + KYC", paylasim: "ucuncu_taraf", topla: true },
  { kategori: "Kimlik", veri: "Profil fotoğrafı (isteğe bağlı)", amac: "Hesap görüntüleme", paylasim: "yok", topla: true },
  // Finansal
  { kategori: "Finansal", veri: "IBAN + banka bilgisi", amac: "Ödeme + iade", paylasim: "ucuncu_taraf", topla: true },
  { kategori: "Finansal", veri: "Ödeme/abonelik kaydı", amac: "Fatura + vergi", paylasim: "ucuncu_taraf", topla: true },
  { kategori: "Finansal", veri: "Findeks notu", amac: "Yalnızca talep üzerine", paylasim: "ucuncu_taraf", topla: false },
  // Konum
  { kategori: "Konum", veri: "Yaklaşık konum (IP bazlı il)", amac: "Bölge gösterimi", paylasim: "yok", topla: true },
  { kategori: "Konum", veri: "Hassas GPS konum", amac: "Mobil harita (rıza ile)", paylasim: "yok", topla: false },
  // Kullanım
  { kategori: "Kullanım", veri: "İhale teklif geçmişi", amac: "Hesap + ispat", paylasim: "yok", topla: true },
  { kategori: "Kullanım", veri: "Favori listesi + arama", amac: "Kişiselleştirme", paylasim: "yok", topla: true },
  { kategori: "Kullanım", veri: "Sayfa görüntüleme / analitik", amac: "İstatistik (Vercel Analytics — anonim)", paylasim: "anonim_3rd", topla: true },
  // Cihaz
  { kategori: "Cihaz", veri: "IP adresi + cihaz/tarayıcı", amac: "Güvenlik + 5651 log", paylasim: "yok", topla: true },
  { kategori: "Cihaz", veri: "Çerez (oturum + tercih)", amac: "Oturum + tema/dil", paylasim: "yok", topla: true },
  { kategori: "Cihaz", veri: "Push notification token", amac: "Bildirim (rıza ile)", paylasim: "ucuncu_taraf", topla: true },
  // Reklam
  { kategori: "Reklam", veri: "Reklam tanımlayıcı (IDFA/AAID)", amac: "TOPLANMIYOR", paylasim: "yok", topla: false },
  { kategori: "Reklam", veri: "Çapraz uygulama izleme", amac: "TOPLANMIYOR", paylasim: "yok", topla: false },
  // Özel nitelikli
  { kategori: "Özel Nitelikli", veri: "Sağlık + biyometrik + ceza", amac: "TOPLANMIYOR", paylasim: "yok", topla: false },
];

function paylasimLabel(p: DataItem["paylasim"]) {
  if (p === "yok") return { txt: "Paylaşılmaz", cls: "text-[var(--metin-ikincil)]" };
  if (p === "anonim_3rd") return { txt: "Anonim (3rd party)", cls: "text-[var(--metin-ikincil)]" };
  return { txt: "Hizmet sağlayıcı", cls: "text-[var(--metin-ikincil)]" };
}

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const toplanan = DATA_INVENTORY.filter((d) => d.topla);
  const toplanmayan = DATA_INVENTORY.filter((d) => !d.topla);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-white gap-2"
        >
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
        </Button>

        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-1 text-xs text-[var(--metin-ikincil)] mb-3">
            <ShieldCheck className="h-3.5 w-3.5" /> KVKK + GDPR + App Store/Play Uyumlu
          </p>
          <h1 className="text-3xl md:text-4xl font-normal flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-[var(--metin-ikincil)]" />
            Gizlilik Politikası
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            ihaleal.com gizlilik taahhüdü — web + iOS + Android için tek metin. Apple App Privacy +
            Google Play Data Safety formlarıyla birebir tutarlı.
          </p>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <Calendar className="h-3 w-3" /> Son güncelleme: 01.06.2026 · Versiyon 2.0
          </p>
        </div>

        <LegalDraftBanner />

        <article className="space-y-5">
          {/* 1. Taahhüt */}
          <section className="rounded-[20px] border border-[var(--cizgi)] bg-slate-900/40 p-5">
            <h2 className="text-lg font-normal text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--metin-ikincil)]" />
              1. Gizlilik Taahhüdümüz
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              ihaleal.com kullanıcılarının gizliliğini en üst düzeyde korumayı taahhüt eder. Tüm kişisel ve finansal veriler
              <strong className="text-white"> AES-256 + TLS 1.3</strong> ile şifrelenir. Verileriniz{" "}
              <strong className="text-[var(--metin-ikincil)]">izniniz olmadan üçüncü taraflarla pazarlama amacıyla paylaşılmaz</strong>.
              Reklam tanımlayıcı (IDFA/AAID) <strong className="text-[var(--metin-ikincil)]">TOPLANMAZ</strong>.
            </p>
          </section>

          {/* 2. APP PRIVACY ENVANTERİ — KRİTİK */}
          <section className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-5">
            <h2 className="text-lg font-normal text-white mb-3 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[var(--metin-ikincil)]" />
              2. Veri Envanteri (App Privacy / Data Safety)
            </h2>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              Aşağıda topladığımız ve <strong className="text-[var(--metin-ikincil)]">TOPLAMADIĞIMIZ</strong> veriler{" "}
              <strong className="text-white">Apple App Store Privacy Label</strong> ve{" "}
              <strong className="text-white">Google Play Data Safety</strong> formlarıyla birebir aynıdır.
            </p>

            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs min-w-[600px]">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-700">
                    <th className="text-start py-2 pe-2 font-normal">Toplanır?</th>
                    <th className="text-start py-2 px-2 font-normal">Kategori</th>
                    <th className="text-start py-2 px-2 font-normal">Veri</th>
                    <th className="text-start py-2 px-2 font-normal">Amaç</th>
                    <th className="text-start py-2 ps-2 font-normal">Paylaşım</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {toplanan.map((d, i) => {
                    const p = paylasimLabel(d.paylasim);
                    return (
                      <tr key={`y-${i}`} className="border-b border-slate-800/50">
                        <td className="py-2 pe-2"><CheckCircle2 className="h-3.5 w-3.5 text-[var(--metin-ikincil)] inline" /></td>
                        <td className="py-2 px-2 font-normal text-[var(--metin-ikincil)]">{d.kategori}</td>
                        <td className="py-2 px-2">{d.veri}</td>
                        <td className="py-2 px-2 text-slate-400">{d.amac}</td>
                        <td className={`py-2 ps-2 ${p.cls}`}>{p.txt}</td>
                      </tr>
                    );
                  })}
                  {toplanmayan.map((d, i) => (
                    <tr key={`n-${i}`} className="border-b border-slate-800/50 opacity-60">
                      <td className="py-2 pe-2"><XCircle className="h-3.5 w-3.5 text-[var(--metin-ikincil)] inline" /></td>
                      <td className="py-2 px-2 font-normal text-slate-400">{d.kategori}</td>
                      <td className="py-2 px-2 line-through">{d.veri}</td>
                      <td className="py-2 px-2 text-[var(--metin-ikincil)]">{d.amac}</td>
                      <td className="py-2 ps-2 text-slate-500">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 italic">
              Çapraz uygulama izleme YOK · Reklam tanımlayıcı YOK · Özel nitelikli veri (sağlık/biyometrik) YOK.
            </p>
          </section>

          {/* 3. Veri Güvenliği */}
          <section className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-5">
            <h2 className="text-lg font-normal text-white mb-3 flex items-center gap-2">
              <Lock className="h-5 w-5 text-[var(--metin-ikincil)]" />
              3. Teknik Güvenlik Önlemleri
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-300">
              {[
                "TLS 1.3 + HSTS",
                "AES-256 veritabanı şifreleme",
                "2FA desteği (TOTP)",
                "reCAPTCHA bot koruması",
                "Düzenli pentest + güvenlik denetimi",
                "İhlal halinde 72 saat KVKK bildirimi",
                "Supabase RLS (row-level security)",
                "Sealed teklif maskeleme (anonim)",
              ].map((g) => (
                <li key={g} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--metin-ikincil)] flex-shrink-0" /> {g}
                </li>
              ))}
            </ul>
          </section>

          {/* 4. Çerez */}
          <section className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-5">
            <h2 className="text-lg font-normal text-white mb-3 flex items-center gap-2">
              <Database className="h-5 w-5 text-[var(--metin-ikincil)]" />
              4. Çerez (Cookie) ve Yerel Depolama
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              Detaylı çerez listesi:{" "}
              <button type="button" onClick={() => navigate("/cerez-politikasi")} className="text-[var(--metin-ikincil)] underline">
                Çerez Politikası
              </button>
            </p>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
                <p className="font-normal text-[var(--metin-ikincil)] mb-1">Zorunlu</p>
                <p className="text-slate-300">Oturum + güvenlik. Reddedilemez.</p>
              </div>
              <div className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
                <p className="font-normal text-[var(--metin-ikincil)] mb-1">Analitik (Anonim)</p>
                <p className="text-slate-300">Vercel Analytics — IP maskelenir, cross-site izleme yok.</p>
              </div>
              <div className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
                <p className="font-normal text-[var(--metin-ikincil)] mb-1">Reklam çerezi YOK</p>
                <p className="text-slate-300">Google Ads / Facebook Pixel / 3rd party reklam tracker yok.</p>
              </div>
            </div>
          </section>

          {/* 5. Veri Silme */}
          <section className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-5">
            <h2 className="text-lg font-normal text-white mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5 text-[var(--metin-ikincil)]" />
              5. Veri Silme + Hesap Kapatma (KVKK m. 7)
            </h2>
            <ul className="text-sm text-slate-300 space-y-1.5 list-disc list-inside ms-2">
              <li>Hesap silme talebiniz <strong className="text-white">30 gün içinde</strong> işlenir ve anonimleştirilir.</li>
              <li>Mali kayıtlar yasal süreler boyunca saklanır (VUK 213 m. 253 — <strong className="text-white">10 yıl</strong>).</li>
              <li>İhale teklif kayıtları 5 yıl (BK ispat süresi).</li>
              <li>5651 sayılı kanun gereği erişim logları 6 ay – 2 yıl.</li>
              <li>Web: <button type="button" onClick={() => navigate("/uyelik")} className="text-[var(--metin-ikincil)] underline">/uyelik</button> → "Aboneliği iptal et" → e-posta talebi.</li>
              <li>Mobil: Hesap silme isteği uygulama içinde <strong className="text-white">Ayarlar → Hesap → Sil</strong> (Apple/Google şartı).</li>
              <li>İletişim: <a href="mailto:kvkk@ihaleal.com" className="text-[var(--metin-ikincil)] underline">kvkk@ihaleal.com</a></li>
            </ul>
          </section>

          {/* 6. Çocuklar */}
          <section className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-5">
            <h2 className="text-lg font-normal text-white mb-3">6. Çocukların Verileri (COPPA + KVKK)</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              ihaleal.com <strong className="text-white">18 yaş altı kullanıcılara hizmet vermez</strong>. Üyelik sırasında
              fiil ehliyet kontrolü yapılır (TMK m. 10). Çocuğa ait veri yanlışlıkla toplanmışsa
              <a href="mailto:kvkk@ihaleal.com" className="text-[var(--metin-ikincil)] underline"> kvkk@ihaleal.com</a>'a bildirin —
              30 gün içinde silinir.
            </p>
          </section>

          {/* 7. Mobil / Uygulama */}
          <section className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-5">
            <h2 className="text-lg font-normal text-white mb-3 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[var(--metin-ikincil)]" />
              7. Mobil Uygulama (iOS + Android)
            </h2>
            <ul className="text-sm text-slate-300 space-y-1.5 list-disc list-inside ms-2">
              <li><strong className="text-[var(--metin-ikincil)]">Konum izni:</strong> sadece harita/bölge görüntüleme için, isteğe bağlı.</li>
              <li><strong className="text-[var(--metin-ikincil)]">Bildirim izni:</strong> teklif + ihale uyarısı, isteğe bağlı.</li>
              <li><strong className="text-[var(--metin-ikincil)]">Kamera/galeri:</strong> ilan fotoğrafı yükleme için, isteğe bağlı.</li>
              <li><strong className="text-[var(--metin-ikincil)]">Apple App Tracking Transparency:</strong> izleme izni İSTENMEZ — toplanmıyor.</li>
              <li><strong className="text-[var(--metin-ikincil)]">Google Advertising ID:</strong> kullanılmaz.</li>
              <li><strong className="text-[var(--metin-ikincil)]">Çocuk koruma:</strong> 17+ yaş derecelendirme (finansal işlem).</li>
            </ul>
          </section>

          {/* 8. Yurt dışı */}
          <section className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-5">
            <h2 className="text-lg font-normal text-white mb-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-[var(--metin-ikincil)]" />
              8. Veri Aktarımı (Yurt İçi + Yurt Dışı)
            </h2>
            <ul className="text-sm text-slate-300 space-y-1.5 list-disc list-inside ms-2">
              <li><strong className="text-white">Supabase EU (Frankfurt):</strong> GDPR + KVKK yeterli koruma.</li>
              <li><strong className="text-white">Vercel (CDN):</strong> statik dosya — kişisel veri yok.</li>
              <li><strong className="text-white">iyzico / PayTR (TR):</strong> ödeme bilgisi — yurt içi.</li>
              <li><strong className="text-white">Apple / Google:</strong> push token + abonelik (mobil) — KVKK 9. madde açık rıza.</li>
              <li>KVKK 9. madde dışında yurt dışı aktarım YAPILMAZ.</li>
            </ul>
          </section>

          {/* 9. Değişiklik */}
          <section className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-5">
            <h2 className="text-lg font-normal text-white mb-3">9. Politika Değişikliği</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Bu politika güncellenirse <strong className="text-white">30 gün öncesinden</strong> e-posta + uygulama içi bildirim
              ile haber verilir. Değişikliği kabul etmemeniz halinde hesabınızı kapatma hakkınız vardır.
            </p>
          </section>

          <LegalCitationStrip
            items={[
              { kanun: "KVKK 6698", madde: "m. 5, 7, 8, 9, 11, 12" },
              { kanun: "GDPR EU 2016/679" },
              { kanun: "MASAK 5549" },
              { kanun: "VUK 213", madde: "m. 253" },
              { kanun: "5651" },
              { kanun: "App Store Review 5.1" },
              { kanun: "Google Play Data Safety" },
              { kanun: "Apple ATT" },
            ]}
          />

          <LegalDisclaimer
            compact
            context="Gizlilik politikası KVKK + GDPR + Apple App Privacy + Google Play Data Safety formlarıyla tutarlıdır. Avukat onayı + yasal yayın gerekli."
          />

          <div className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-4 flex items-start gap-3">
            <Mail className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-normal text-slate-200 mb-1">Gizlilik + Veri Başvuru</p>
              <p className="text-xs text-slate-400">
                <a href="mailto:kvkk@ihaleal.com" className="text-[var(--metin-ikincil)] underline">kvkk@ihaleal.com</a>
                {" · "}Güvenlik olay: <a href="mailto:guvenlik@ihaleal.com" className="text-[var(--metin-ikincil)] underline">guvenlik@ihaleal.com</a>
                {" · "}Hesap silme: web ve mobil ayarlar.
              </p>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
