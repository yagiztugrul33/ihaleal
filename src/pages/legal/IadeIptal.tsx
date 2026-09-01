import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, RefreshCw, AlertTriangle, Calendar, CheckCircle2, Mail, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LegalDisclaimer, LegalDraftBanner, LegalCitationStrip,
} from "@/components/legal/LegalDisclaimer";

export default function IadeIptal() {
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
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-1 text-xs text-[var(--metin-ikincil)] mb-3">
            <RefreshCw className="h-3.5 w-3.5" /> 14 Gün Cayma + İptal
          </p>
          <h1 className="text-3xl font-normal flex items-center gap-3">
            <RefreshCw className="h-7 w-7 text-[var(--metin-ikincil)]" />
            İade ve İptal Koşulları
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            6502 sayılı TKHK çerçevesinde premium üyelik + ek hizmet satın almalar için cayma + iptal + iade
            kuralları.
          </p>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <Calendar className="h-3 w-3" /> Son güncelleme: 01.06.2026
          </p>
        </div>

        <LegalDraftBanner />

        <article className="space-y-5">
          {/* 1. Premium Üyelik İptal */}
          <section className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-5 space-y-2">
            <h2 className="text-lg font-normal text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[var(--metin-ikincil)]" />
              1. Premium Üyelik İptali
            </h2>
            <ul className="text-sm text-slate-300 space-y-1.5 list-disc list-inside ms-2">
              <li><strong className="text-white">14 gün cayma hakkı (TKHK m. 48/4):</strong> Satın aldığınız aboneliği ilk 14 gün içinde
                hiçbir gerekçe göstermeden iade edebilirsiniz.</li>
              <li><strong className="text-white">İptal yöntemi:</strong> <button type="button" onClick={() => navigate("/uyelik")} className="text-[var(--metin-ikincil)] underline">/uyelik</button> sayfası → "Aboneliği iptal et"
                veya <a href="mailto:destek@ihaleal.com" className="text-[var(--metin-ikincil)] underline">destek@ihaleal.com</a>.</li>
              <li><strong className="text-white">İade süresi:</strong> bildirimin ulaşmasından itibaren <strong className="text-[var(--metin-ikincil)]">14 gün içinde</strong> aynı ödeme yoluyla iade edilir.</li>
              <li><strong className="text-white">Kısmen kullanım:</strong> yıllık abonelikte kullanılan günlere orantılı kesinti yapılır; tam ay başına ücret iade edilir.</li>
              <li><strong className="text-white">Otomatik yenileme durdurma:</strong> iptal sonrası mevcut dönem bitiminde otomatik olarak durur.</li>
            </ul>
          </section>

          {/* 2. PDF + Tek Seferlik (İSTİSNA) */}
          <section className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-5 space-y-2">
            <h2 className="text-lg font-normal text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[var(--metin-ikincil)]" />
              2. Tek Seferlik Dijital İçerik (PDF) — İSTİSNA
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Değerleme PDF, GES Analizi PDF, Hukuki Risk PDF gibi <strong className="text-[var(--metin-ikincil)]">tek seferlik dijital içerikler</strong>:
            </p>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside ms-2">
              <li>İndirildikten/görüntülendikten sonra <strong className="text-[var(--metin-ikincil)]">iade kapsamı dışı</strong> (TKHK 6502 m. 15/ğ).</li>
              <li>Satın alma öncesi bu istisnayı onaylayan kutu işaretlenir.</li>
              <li>İçeriğin <strong className="text-white">eksik/yanlış</strong> olduğu durumda — değiştirme/düzeltme veya tam iade hakkı saklıdır.</li>
            </ul>
          </section>

          {/* 3. Doping / Vitrin */}
          <section className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-normal text-white">3. Doping / Vitrin / Görünürlük Hizmetleri</h2>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside ms-2">
              <li>Aktif edilmemişse 14 gün cayma + tam iade.</li>
              <li>Aktif edildiyse <strong className="text-white">kullanılan günlere orantılı</strong> kesinti, kalan günler iade.</li>
              <li>Teknik nedenle hizmet sunulamazsa (sunucu kesintisi, vb.) tam iade veya uzatma.</li>
            </ul>
          </section>

          {/* 4. İhale ve Komisyon */}
          <section className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-normal text-white">4. İhale Sonucu Komisyon</h2>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside ms-2">
              <li>Komisyon yalnızca <strong className="text-[var(--metin-ikincil)]">kapanan ihalelerde</strong> doğar; iptal/cayma halinde komisyon iade edilir.</li>
              <li>Mülkün hukuki engelle satışın gerçekleşmemesi (ipotek/haciz, eksper raporu uyumsuz) durumunda komisyon iade.</li>
              <li>Detay: <button type="button" onClick={() => navigate("/komisyon")} className="text-[var(--metin-ikincil)] underline">/komisyon</button>.</li>
            </ul>
          </section>

          {/* 5. Hesap Silme */}
          <section className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-normal text-white">5. Hesap Silme + Veri Kaldırma</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Hesabınızı kalıcı silmek isterseniz — <a href="mailto:destek@ihaleal.com" className="text-[var(--metin-ikincil)] underline">destek@ihaleal.com</a>'a yazılı talep
              gönderebilirsiniz. KVKK çerçevesinde:
            </p>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside ms-2">
              <li>Verileriniz <strong className="text-white">30 gün içinde anonimleştirilir</strong>.</li>
              <li>Mali kayıtlar (faturalar) VUK 213 m. 253 gereği <strong className="text-white">10 yıl</strong> saklanır.</li>
              <li>İhale teklif geçmişi 5 yıl saklanır (BK ispat süresi).</li>
              <li>5651 sayılı kanun gereği erişim log'ları 6 ay – 2 yıl saklanır.</li>
            </ul>
          </section>

          {/* 6. Başvuru */}
          <section className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-5 space-y-2">
            <h2 className="text-lg font-normal text-white">6. İade Başvurusu Nasıl Yapılır?</h2>
            <ol className="text-sm text-slate-300 space-y-1.5 list-decimal list-inside ms-2">
              <li>"İade Talep Formu"nu doldurun (e-posta gövdesinde de olur).</li>
              <li>Bilgilendirme: ad-soyad, fatura no, sipariş tarihi, iade gerekçesi, IBAN.</li>
              <li><a href="mailto:destek@ihaleal.com" className="text-[var(--metin-ikincil)] underline">destek@ihaleal.com</a>'a gönderin.</li>
              <li>Başvurunuz 24 saat içinde onaylanır; iade 14 gün içinde tamamlanır.</li>
              <li>Sorun varsa 30 gün içinde Tüketici Hakem Heyeti / Tüketici Mahkemesi'ne başvurabilirsiniz.</li>
            </ol>
          </section>

          {/* 7. Şikayet */}
          <section className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-5 space-y-2">
            <h2 className="text-lg font-normal text-white">7. Şikayet ve Uyuşmazlık Çözümü</h2>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside ms-2">
              <li>İlk başvuru: <a href="mailto:destek@ihaleal.com" className="text-[var(--metin-ikincil)] underline">destek@ihaleal.com</a> (yanıt 24 saat).</li>
              <li>Çözülmezse: arabuluculuk (6325 sayılı kanun) ihtiyari.</li>
              <li>Tüketici Hakem Heyeti — TKHK 6502 m. 68 (yıllık parasal sınırlar dahilinde).</li>
              <li>Mahkeme: Tüketici Mahkemesi (Ankara — yetkili).</li>
            </ul>
          </section>

          <LegalCitationStrip
            items={[
              { kanun: "TKHK 6502", madde: "m. 48 / m. 15 / m. 68 / m. 73" },
              { kanun: "TBK 6098" },
              { kanun: "VUK 213", madde: "m. 253" },
              { kanun: "Arabuluculuk 6325" },
              { kanun: "KVKK 6698", madde: "m. 7" },
              { kanun: "5651" },
            ]}
          />

          <LegalDisclaimer compact context="Bu sayfa platform iade/iptal politikasını özetler. Somut uyuşmazlıkta avukat görüşü zorunludur." />

          <div className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-4 flex items-start gap-3">
            <Mail className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-normal text-slate-200 mb-1">İade + İptal İletişim</p>
              <p className="text-xs text-slate-400">
                <a href="mailto:destek@ihaleal.com" className="text-[var(--metin-ikincil)] underline">destek@ihaleal.com</a>
                {" · "}
                <button type="button" onClick={() => navigate("/uyelik")} className="text-[var(--metin-ikincil)] underline">/uyelik (panel)</button>
                {" · "}Tüketici Hakem Heyeti başvurusu için TC Ticaret Bakanlığı portali.
              </p>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
