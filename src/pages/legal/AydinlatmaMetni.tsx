import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, FileText, CheckCircle2, Mail, Calendar, ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LegalDisclaimer, LegalDraftBanner, LegalCitationStrip,
} from "@/components/legal/LegalDisclaimer";

export default function AydinlatmaMetni() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-white gap-2"
        >
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
        </Button>

        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-200 mb-3">
            <Shield className="h-3.5 w-3.5" /> KVKK 10. madde
          </p>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-7 w-7 text-blue-400" />
            Aydınlatma Metni (Kısa Özet)
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            6698 sayılı KVKK 10. maddesi — veri sorumlusu, işleme amacı ve hukuki sebepleri özet halinde.
            Detay için <button type="button" onClick={() => navigate("/kvkk")} className="text-blue-300 underline">KVKK Aydınlatma Metni (8 madde)</button>.
          </p>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <Calendar className="h-3 w-3" /> Son güncelleme: 01.06.2026
          </p>
        </div>

        <LegalDraftBanner />

        <article className="space-y-5">
          {/* 1. Veri sorumlusu */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">1. Veri Sorumlusu</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-blue-200">ihaleal.com</strong>, 6698 sayılı KVKK kapsamında veri sorumlusu sıfatıyla
              kişisel verilerinizi işler. Tam unvan, MERSIS ve adres bilgileri şirketleşme sonrası yayınlanır.
            </p>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Veri Sorumlusu Temsilcisi: <a href="mailto:kvkk@ihaleal.com" className="text-blue-300 underline">kvkk@ihaleal.com</a></li>
              <li>• Veri İhlali Bildirim: <a href="mailto:guvenlik@ihaleal.com" className="text-blue-300 underline">guvenlik@ihaleal.com</a></li>
            </ul>
          </section>

          {/* 2. Hangi veriler */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">2. İşlenen Kişisel Veri Kategorileri</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-blue-500/20 bg-slate-900/30 p-3">
                <p className="text-blue-300 font-semibold mb-1">Kimlik & İletişim</p>
                <p className="text-xs text-slate-300">Ad, soyad, T.C. kimlik no, e-posta, telefon, adres.</p>
              </div>
              <div className="rounded-lg border border-blue-500/20 bg-slate-900/30 p-3">
                <p className="text-blue-300 font-semibold mb-1">Finansal</p>
                <p className="text-xs text-slate-300">Banka/IBAN bilgisi, fatura adresi, ödeme kayıtları, abonelik durumu.</p>
              </div>
              <div className="rounded-lg border border-blue-500/20 bg-slate-900/30 p-3">
                <p className="text-blue-300 font-semibold mb-1">Platform Aktivitesi</p>
                <p className="text-xs text-slate-300">Teklif geçmişi, favoriler, arama kayıtları, ihale katılımları.</p>
              </div>
              <div className="rounded-lg border border-blue-500/20 bg-slate-900/30 p-3">
                <p className="text-blue-300 font-semibold mb-1">Teknik / Loglama</p>
                <p className="text-xs text-slate-300">IP, cihaz/tarayıcı, çerez, oturum bilgisi (5651 yükümlülüğü).</p>
              </div>
            </div>
            <p className="text-xs text-amber-200 mt-2">
              <strong>Özel nitelikli veri:</strong> sağlık, ceza mahkumiyeti, biyometrik vb. <strong>toplanmaz</strong>.
            </p>
          </section>

          {/* 3. Amaçlar */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">3. Veri İşleme Amaçları</h2>
            <ul className="text-sm text-slate-300 space-y-1.5 list-disc list-inside ms-2">
              <li>Üyelik + hesap yönetimi + güvenlik kontrolleri</li>
              <li>İhale + teklif + ödeme süreçlerinin yürütülmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi (5651, MASAK, VUK, KVKK)</li>
              <li>İletişim (bildirim, kampanya — açık rıza ile)</li>
              <li>Dolandırıcılık + AML + bot koruma</li>
              <li>İstatistik + iyileştirme (anonimleştirilmiş)</li>
            </ul>
          </section>

          {/* 4. Hukuki Sebepler */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">4. Hukuki Sebepler (KVKK m. 5)</h2>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside ms-2">
              <li><strong className="text-white">Sözleşme:</strong> üyelik + ihale + ödeme sözleşmesinin kurulması/ifası (m. 5/2-c).</li>
              <li><strong className="text-white">Yasal yükümlülük:</strong> VUK + MASAK + 5651 + KVKK (m. 5/2-ç).</li>
              <li><strong className="text-white">Meşru menfaat:</strong> platform güvenliği + dolandırıcılık önleme (m. 5/2-f).</li>
              <li><strong className="text-white">Açık rıza:</strong> pazarlama + 3. taraf paylaşım (m. 5/1).</li>
            </ul>
          </section>

          {/* 5. Aktarım */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">5. Veri Aktarımı (KVKK m. 8-9)</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Kişisel veriler yalnızca aşağıdaki amaçlarla ve yasal sınırlarda aktarılır:
            </p>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside ms-2">
              <li>Yasal merciler (mahkeme, savcılık, KVKK Kurulu — talep üzerine)</li>
              <li>Ödeme hizmet sağlayıcıları (iyzico / PayTR — sadece ödeme bilgisi)</li>
              <li>Findeks + bankalar (kredi/finansal uygunluk — kullanıcı talebi)</li>
              <li>Bulut altyapı (Supabase EU/Frankfurt — GDPR uyumlu)</li>
              <li>SMS / e-posta sağlayıcıları (doğrulama kodları)</li>
            </ul>
            <p className="text-xs text-blue-200 mt-2">
              <strong>Yurt dışı:</strong> Supabase EU bölgesi; KVKK 9. madde açık rıza/yeterli koruma şartı uyumlu.
            </p>
          </section>

          {/* 6. Haklarınız */}
          <section className="rounded-2xl border border-emerald-500/20 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              6. KVKK 11. Madde Haklarınız
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">Aşağıdaki haklarınızı kullanabilirsiniz:</p>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside ms-2">
              <li>Verilerin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse bilgi talep etme</li>
              <li>İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içi/yurt dışı aktarılan tarafları bilme</li>
              <li>Eksik/yanlış işlenmişse düzeltilmesini isteme</li>
              <li>Silinmesini / yok edilmesini isteme</li>
              <li>Aleyhe sonuç doğuran otomatik karar (profilleme) varsa itiraz</li>
              <li>Zarar görmüşse tazminat isteme</li>
            </ul>
            <p className="text-xs text-emerald-200 mt-2">
              Başvuru: <a href="mailto:kvkk@ihaleal.com" className="underline">kvkk@ihaleal.com</a>{" "}
              + yazılı dilekçe (Veri Sorumlusuna Başvuru Tebliği) — 30 gün içinde yanıtlanır.
            </p>
          </section>

          {/* 7. Saklama */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">7. Saklama Süresi</h2>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside ms-2">
              <li>Hesap aktif olduğu sürece + 30 gün anonimleştirme</li>
              <li>Mali kayıtlar: 10 yıl (VUK 213 m. 253)</li>
              <li>İhale teklif kayıtları: 5 yıl (BK ispat süresi)</li>
              <li>5651 erişim logları: 6 ay – 2 yıl</li>
              <li>Audit + güvenlik logları: 1 yıl</li>
            </ul>
          </section>

          {/* 8. Açık Rıza */}
          <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">8. Açık Rıza</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Açık rıza gerektiren işlemler (pazarlama bildirimi, 3. taraf aktarım) ÜYELİK sırasında
              <strong className="text-amber-200"> ayrı kutu ile</strong> alınır. ÜYE rızasını her zaman geri çekebilir
              (KVKK m. 5/1).
            </p>
            <p className="text-xs text-amber-200">
              <strong>Açık rıza verilmemesi:</strong> yalnızca pazarlama ve isteğe bağlı hizmetler için sonuç doğurur;
              temel platform kullanımına engel olmaz.
            </p>
          </section>

          <LegalCitationStrip
            items={[
              { kanun: "KVKK 6698", madde: "m. 5 / m. 8-9 / m. 10 / m. 11 / m. 12" },
              { kanun: "VUK 213", madde: "m. 253" },
              { kanun: "5651" },
              { kanun: "MASAK 5549" },
            ]}
          />

          <LegalDisclaimer compact context="KVKK detay metni için /kvkk sayfasını ziyaret edin." />

          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 flex items-start gap-3">
            <Mail className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-slate-200 mb-1">KVKK İletişim</p>
              <p className="text-xs text-slate-400">
                Veri başvurusu: <a href="mailto:kvkk@ihaleal.com" className="text-cyan-300 underline">kvkk@ihaleal.com</a>
                {" · "}Güvenlik olay: <a href="mailto:guvenlik@ihaleal.com" className="text-cyan-300 underline">guvenlik@ihaleal.com</a>
              </p>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
