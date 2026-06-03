import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, ScrollText, Scale, Mail, ShieldCheck,
  Calendar, RefreshCw, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LegalDisclaimer, LegalDraftBanner, LegalCitationStrip,
} from "@/components/legal/LegalDisclaimer";

export default function MesafeliSatisSozlesmesi() {
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
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 mb-3">
            <FileText className="h-3.5 w-3.5" /> Üyelik & Abonelik Sözleşmesi
          </p>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ScrollText className="h-7 w-7 text-emerald-400" />
            Mesafeli Satış ve Üyelik Sözleşmesi
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            6502 sayılı Tüketicinin Korunması Hakkında Kanun (TKHK) çerçevesinde — premium üyelik, ek hizmet
            satın alma ve dijital içerik abonelikleri için.
          </p>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Son güncelleme: 01.06.2026 · Versiyon 2.0
          </p>
        </div>

        <LegalDraftBanner />

        <article className="space-y-5">
          {/* MADDE 1 — Taraflar */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">1. Taraflar</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-emerald-200">SATICI / HİZMET SAĞLAYICI:</strong> ihaleal.com (yayın
              öncesi şirket bilgileri eklenecektir — Vergi No / MERSIS / Ticaret Sicil No / Adres).
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-emerald-200">ALICI / ÜYE:</strong> Platforma kayıt olan ve premium üyelik
              veya ek hizmet satın alan gerçek/tüzel kişi. ALICI 18 yaşını doldurmuş ve fiil ehliyetine sahip olmalıdır
              (TMK m. 10).
            </p>
            <p className="text-xs text-slate-500 italic">
              Tarafların elektronik ortamda verdiği onay, 5070 sayılı kanun çerçevesinde geçerli irade beyanıdır.
            </p>
          </section>

          {/* MADDE 2 — Konu */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">2. Sözleşmenin Konusu</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              İşbu sözleşme, ALICI'nın ihaleal.com platformu üzerinden seçtiği:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 ms-2">
              <li><strong className="text-white">Premium üyelik paketleri</strong> (Yatırımcı / Emlak Başlangıç / Emlak Pro / Kurumsal)</li>
              <li><strong className="text-white">Tek seferlik dijital içerik</strong> (Değerleme PDF, GES Analizi PDF, Hukuki Risk PDF, vb.)</li>
              <li><strong className="text-white">İlan görünürlük hizmetleri</strong> (Doping, Vitrin, Öne Çıkan İhale)</li>
              <li><strong className="text-white">Ek ilan kontörü</strong> (Bireysel limit aşımında)</li>
            </ul>
            <p className="text-sm text-slate-300 leading-relaxed">
              hizmetlerinin elektronik ortamda satın alınması, kullanımı, iadesi ve fesih koşullarını düzenler.
            </p>
          </section>

          {/* MADDE 3 — Fiyat ve Ödeme */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">3. Fiyat, KDV ve Ödeme</h2>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5 ms-2">
              <li>Güncel fiyat listesi <button type="button" onClick={() => navigate("/fiyatlandirma")} className="text-emerald-300 underline">/fiyatlandirma</button> sayfasında yayınlanır.</li>
              <li>Listelenen tutarlar <strong className="text-white">KDV dahil</strong>'dir (VUK 213 m. 230).</li>
              <li>Aylık aboneliklerde ödeme her ay otomatik tahsil edilir; yıllıkta peşin ve %20 indirim uygulanır.</li>
              <li>ALICI'nın mevcut aboneliği <strong className="text-white">12 ay boyunca</strong> fiyatı sabit kalır (sonraki yenilemede güncel fiyat geçerlidir; 30 gün öncesinde bildirim yapılır).</li>
              <li>Ödeme yöntemi: 3D Secure kredi/banka kartı (iyzico / PayTR). Havale/EFT kurumsal pakette geçerlidir.</li>
              <li>Faturalar elektronik ortamda gönderilir (e-Arşiv / e-Fatura) — VUK 213 ve 526 sayılı GVK Genel Tebliği uyumlu.</li>
            </ul>
          </section>

          {/* MADDE 4 — Cayma Hakkı (KRITİK) */}
          <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-amber-300" />
              4. Cayma Hakkı (14 Gün)
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              ALICI, sözleşmenin imzalandığı tarihten itibaren <strong className="text-amber-200">14 gün içinde</strong> hiçbir gerekçe göstermeden ve cezai şart ödemeden cayma hakkına sahiptir
              (TKHK 6502 m. 48/4).
            </p>
            <ul className="text-sm text-slate-300 list-disc list-inside ms-2 space-y-1">
              <li>Cayma için <a href="mailto:destek@ihaleal.com" className="text-amber-300 underline">destek@ihaleal.com</a> adresine yazılı bildirim yeterlidir.</li>
              <li>ALICI'nın ödediği tutar, cayma bildiriminin ulaşmasından itibaren <strong className="text-white">14 gün içinde</strong> aynı ödeme yoluyla iade edilir.</li>
              <li>Yıllık abonelikte ALICI hizmeti kullanmadıysa tam iade; kısmen kullandıysa kullanılan günlere orantılı kesinti uygulanır.</li>
            </ul>
            <p className="text-xs text-amber-100 mt-2 pt-2 border-t border-amber-500/20 italic">
              <AlertTriangle className="inline h-3 w-3 me-1" />
              <strong>İSTİSNA:</strong> Bir kez indirildikten/görüntülendikten sonra niteliği gereği iade edilemez sayılan
              tek seferlik dijital içerikler (PDF raporlar) — TKHK 6502 m. 15. ALICI satın almadan önce bu istisnayı açık şekilde onaylar.
            </p>
          </section>

          {/* MADDE 5 — Hizmet sunumu */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">5. Hizmet Sunumu</h2>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5 ms-2">
              <li>Premium üyelik ödeme onayı sonrası <strong className="text-white">anında aktive</strong> edilir; hesabınızda görüntülenir.</li>
              <li>Aylık abonelik 30 gün, yıllık 365 gün geçerlidir. Yenileme tarihinden 7 gün önce hatırlatma e-postası gönderilir.</li>
              <li>Tek seferlik dijital içerikler (PDF) satın alımdan sonra hesabınıza eklenir; istediğiniz zaman indirebilirsiniz.</li>
              <li>Doping, vitrin gibi görünürlük ürünleri belirtilen süre boyunca aktif kalır.</li>
              <li>Hizmet kalitesi en az %99.5 uptime hedefiyle sağlanır; %99'un altına düşerse bir sonraki dönem ücretsiz olur (SLA).</li>
            </ul>
          </section>

          {/* MADDE 6 — Fesih ve İptal */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">6. Fesih, İptal ve Yenileme</h2>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5 ms-2">
              <li><strong className="text-white">ALICI tek taraflı fesih:</strong> İstediği zaman üyeliği iptal edebilir. İptal anında abonelik süresi sonuna kadar haklar korunur; otomatik yenileme durur.</li>
              <li><strong className="text-white">SATICI tek taraflı fesih:</strong> Yalnızca ALICI'nın sözleşme + Kullanım Koşulları ihlali durumunda (sahte teklif, bot kullanımı, MASAK ihlali, vb.) — yazılı bildirim + 7 gün makul süre tanınır.</li>
              <li><strong className="text-white">Otomatik yenileme:</strong> ALICI iptal etmedikçe abonelik otomatik yenilenir. 7 gün öncesinde uyarı e-postası gönderilir.</li>
              <li><strong className="text-white">Hesap silme:</strong> ALICI hesabını silebilir; KVKK çerçevesinde verileri 30 gün içinde anonimleştirilir (mali kayıtlar VUK 213 m. 253 uyarınca 10 yıl saklanır).</li>
            </ul>
          </section>

          {/* MADDE 7 — Yükümlülükler */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">7. Tarafların Yükümlülükleri</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-emerald-500/20 bg-slate-900/30 p-3">
                <p className="text-emerald-300 font-semibold mb-1">SATICI</p>
                <ul className="text-slate-300 text-xs list-disc list-inside space-y-0.5">
                  <li>Hizmeti süresinde + kalitesinde sunmak</li>
                  <li>Verileri KVKK çerçevesinde işlemek</li>
                  <li>SLA + uptime taahhüdü</li>
                  <li>Şikayet + cayma işlemini 14 gün içinde sonuçlandırmak</li>
                </ul>
              </div>
              <div className="rounded-lg border border-blue-500/20 bg-slate-900/30 p-3">
                <p className="text-blue-300 font-semibold mb-1">ALICI</p>
                <ul className="text-slate-300 text-xs list-disc list-inside space-y-0.5">
                  <li>Doğru kayıt bilgileri vermek</li>
                  <li>Ödemeyi zamanında yapmak</li>
                  <li>Şifreyi gizli tutmak (hesap güvenliği)</li>
                  <li>Yasak davranışlardan kaçınmak (sahte teklif, bot, vb.)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* MADDE 8 — Hizmet Bedeli ve Komisyon */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">8. Komisyon (Aracılık Hizmeti)</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Premium üyeliğe ek olarak — gerçekleşen ihale satışlarında kademeli komisyon alınır
              (sadece kapanışta; iptal olursa komisyon doğmaz):
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 ms-2">
              <li>₺0 – ₺3M arası: <strong className="text-emerald-200">%3</strong></li>
              <li>₺3M – ₺10M arası: <strong className="text-cyan-200">%2.5</strong></li>
              <li>₺10M üzeri: <strong className="text-blue-200">%2</strong></li>
              <li>Komisyon üzerine <strong className="text-white">KDV %20</strong> ek olarak fatura edilir.</li>
            </ul>
            <p className="text-xs text-slate-500 italic">
              Detaylı hesap için <button type="button" onClick={() => navigate("/komisyon")} className="text-emerald-300 underline">/komisyon</button> sayfasını ziyaret edin.
            </p>
          </section>

          {/* MADDE 9 — Sorumluluk Sınırı */}
          <section className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-300" />
              9. Sorumluluk Sınırı
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-rose-200">ihaleal.com</strong> bir <strong className="text-white">aracı/bilgi platformudur</strong>; ilanlardaki bilgilerin doğruluğundan, ihale konusu mülklerin
              hukuki/teknik durumundan, taraflar arasındaki sözleşmenin ifasından <strong className="text-white">DOĞRUDAN SORUMLU DEĞİLDİR</strong>.
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 ms-2">
              <li>ALICI/SATICI'lar arasındaki anlaşmazlıklar arabuluculuk + Tüketici Hakem Heyeti + mahkemede çözülür.</li>
              <li>SATICI'nın sorumluluğu yıllık üyelik bedeli + son ay komisyon toplamı ile sınırlıdır (ağır kusur halinde TBK 115 uygulanır).</li>
              <li>Mücbir sebep + üçüncü kişi fiilleri (Supabase/Vercel kesintisi, vb.) için sorumluluk doğmaz.</li>
            </ul>
          </section>

          {/* MADDE 10 — KVKK */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">10. KVKK ve Veri İşleme</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              ALICI'nın kişisel verileri 6698 sayılı KVKK çerçevesinde işlenir.
              Detaylı bilgi için <button type="button" onClick={() => navigate("/kvkk")} className="text-emerald-300 underline">KVKK Aydınlatma Metni</button> + <button type="button" onClick={() => navigate("/gizlilik")} className="text-emerald-300 underline">Gizlilik Politikası</button>'ndan yararlanın.
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 ms-2">
              <li>Veriler Supabase EU (Frankfurt) bölgesinde saklanır — GDPR uyumlu.</li>
              <li>Veri sızıntısı halinde 72 saat içinde KVKK Kurulu + etkilenen kullanıcılara bildirim yapılır (KVKK 12. m.).</li>
              <li>Saklama: hesap aktifken + 30 gün; mali kayıtlar 10 yıl (VUK 213 m. 253).</li>
            </ul>
          </section>

          {/* MADDE 11 — Uyuşmazlık */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">11. Uyuşmazlık Çözümü ve Yetkili Mahkeme</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sözleşmeden kaynaklanan uyuşmazlıklarda taraflar önce arabuluculuğa başvurabilir (6325 sayılı kanun).
              Çözüm sağlanamazsa:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 ms-2">
              <li>Tüketici işlemlerinde — yıllık parasal sınırlar dahilinde <strong className="text-white">Tüketici Hakem Heyetleri</strong>.</li>
              <li>Üzeri için <strong className="text-white">Tüketici Mahkemeleri</strong> (TKHK 6502 m. 73).</li>
              <li>Ticari uyuşmazlıklarda <strong className="text-white">Ankara Mahkemeleri ve İcra Daireleri</strong> yetkilidir.</li>
            </ul>
          </section>

          {/* MADDE 12 — Yürürlük */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-bold text-white">12. Yürürlük ve Değişiklik</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              İşbu sözleşme ALICI'nın elektronik onayı ile yürürlüğe girer; SATICI tarafından güncellenirse
              ALICI'ya en az <strong className="text-white">30 gün önce</strong> bildirim yapılır. ALICI değişikliği
              kabul etmezse sözleşmeyi feshetme hakkına sahiptir.
            </p>
            <p className="text-xs text-slate-500 italic">
              Bu sözleşme 12 maddeden ibarettir. Elektronik ortamda imzalı kopya ALICI'ya e-posta ile gönderilir.
            </p>
          </section>

          {/* Güvenceler */}
          <section className="rounded-2xl border border-emerald-500/20 bg-slate-900/40 p-5">
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Güvenceler
            </h3>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              {[
                "14 gün ücretsiz cayma (TKHK)",
                "İstediğin zaman iptal — sözleşme yok",
                "12 ay fiyat sabit (mevcut abone)",
                "KVKK + 6493 uyumlu emanet",
                "3D Secure + SSL + KVKK",
                "%99.5 uptime SLA",
                "30 gün hesap silme + anonimleştirme",
                "Şikayet 14 gün içinde sonuçlandırılır",
              ].map((g) => (
                <span key={g} className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" /> {g}
                </span>
              ))}
            </div>
          </section>

          <LegalCitationStrip
            items={[
              { kanun: "TKHK 6502", madde: "m. 48 / m. 15 / m. 73" },
              { kanun: "TBK 6098", madde: "m. 115" },
              { kanun: "TMK 4721", madde: "m. 10" },
              { kanun: "KVKK 6698", madde: "m. 12" },
              { kanun: "VUK 213", madde: "m. 230 / m. 253" },
              { kanun: "Avukatlık 1136", madde: "m. 35" },
              { kanun: "Arabuluculuk 6325" },
              { kanun: "5070 e-imza" },
            ]}
          />

          <LegalDisclaimer
            context="Bu sözleşme metni ihaleal.com'un mevcut hizmet modeline göre hazırlanmış TASLAKtır. Yasal yayın öncesi baroya kayıtlı avukat tarafından gözden geçirilmesi ŞARTtır."
          />

          {/* İletişim */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 flex items-start gap-3">
            <Mail className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-slate-200 mb-1">Sözleşme + İade İletişim</p>
              <p className="text-xs text-slate-400">
                <a href="mailto:destek@ihaleal.com" className="text-cyan-300 underline">destek@ihaleal.com</a>
                {" · "}
                <a href="mailto:hukuk@ihaleal.com" className="text-cyan-300 underline">hukuk@ihaleal.com</a>
                {" · "}İade başvuruları: yazılı talep + IBAN.
              </p>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
