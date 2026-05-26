import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getContractBySlug } from "@/data/contractTemplates";
import NotFound from "@/pages/NotFound";

export default function SozlesmeTemplatePage() {
  const { slug } = useParams();
  const doc = slug ? getContractBySlug(slug) : undefined;
  if (!doc) return <NotFound />;
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" asChild><Link to="/yasal/sozlesmeler"><ArrowLeft className="h-4 w-4" /> Indeks</Link></Button>
        <h1 className="text-2xl font-bold text-white">{doc.title}</h1>
        <p className="text-slate-400 text-sm">{doc.summary}</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-cyan-200">Taraflar</p>
            <p className="mt-1 text-xs text-slate-300">{doc.parties.join(" · ")}</p>
          </article>
          <article className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-200">Madde adedi</p>
            <p className="mt-1 text-xs text-slate-300">{doc.clauses.length} temel madde</p>
          </article>
          <article className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-violet-200">Durum</p>
            <p className="mt-1 text-xs text-slate-300">Taslak (imza oncesi hukuk kontrolu)</p>
          </article>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Scale className="h-4 w-4 text-blue-300" /> Sablon okuma rehberi
          </h2>
          <ul className="mt-2 space-y-1 list-disc pl-5 text-xs text-slate-400">
            <li>Teminat, odeme, teslim ve cezai sart maddelerini dosya bazli rakamlarla guncelleyin.</li>
            <li>KYC/KVKK/AML maddeleri platform politikasi ve mevzuatla birlikte degerlendirilmelidir.</li>
            <li>Imza sirasinda son surum takibi (revizyon tarihi + taraf parafi) zorunlu tutulmalidir.</li>
          </ul>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs font-semibold text-slate-100">Nedir?</p>
            <p className="mt-1 text-xs text-slate-300">Bu sayfa, seçili sözleşme şablonunun madde bazlı çalışma versiyonunu gösterir.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs font-semibold text-slate-100">Neden?</p>
            <p className="mt-1 text-xs text-slate-300">Taraflar imza öncesi riskli maddeleri hızlıca tespit ederek revize edebilir.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs font-semibold text-slate-100">Kime göre</p>
            <p className="mt-1 text-xs text-slate-300">Hukuk, operasyon ve taraf temsilcilerinin ortak gözden geçirme ekranıdır.</p>
          </article>
        </div>

        {doc.clauses.map((cl) => (
          <section key={cl.heading} className="rounded-xl border border-white/10 p-4">
            <h2 className="font-semibold text-white">{cl.heading}</h2>
            <p className="mt-2 text-sm text-slate-400">{cl.body}</p>
          </section>
        ))}

        <section className="rounded-xl border border-slate-200 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-white">Örnek revizyon akışı</h2>
          <ol className="mt-2 list-decimal pl-5 text-xs text-slate-300 space-y-1">
            <li>Şablon maddeleri dosya verileriyle doldurulur.</li>
            <li>Riskli maddeler (cezai şart, ödeme, fesih, veri aktarımı) kırmızı bayrakla işaretlenir.</li>
            <li>Avukat revizyonu sonrası taraf parafı ve sürüm numarası güncellenir.</li>
            <li>Nihai imza seti evrak merkezine kilitlenir.</li>
          </ol>
        </section>

        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs text-slate-300">
          <p className="font-medium text-amber-200 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Durust sinir
          </p>
          <p className="mt-2">
            Bu metin baglayici hukuki gorus degildir. Nihai sozlesme, somut dosyanin riski ve taraf profiline gore avukat tarafindan
            duzenlenmelidir.
          </p>
          <p className="mt-2 text-emerald-200 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Hedef: anlasilir, denetlenebilir ve uyusmazlikta ispatlanabilir metin seti.
          </p>
        </div>
        <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 p-4 text-xs text-slate-200">
          <p className="font-semibold text-blue-100">CTA</p>
          <p className="mt-1">
            Bu şablonu işlem dosyanıza uyarlayın, hukuk revizyonunu tamamlayın ve imza öncesi son kontrol listesiyle kapatın.
          </p>
        </div>
        <section className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Ek kapanış kontrolü</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Taraf kimlik ve yetki doğrulaması tamamlanmadan imza adımı başlatılmaz.</li>
            <li>Ödeme/teminat maddeleri escrow süreciyle tutarlı olmalıdır.</li>
            <li>Veri işleme ve gizlilik maddeleri KVKK metniyle çelişmemelidir.</li>
            <li>Revizyon geçmişi, sürüm numarası ve onaylayan kişi bilgisi saklanmalıdır.</li>
            <li>Hukuk onayı olmadan “nihai sözleşme” etiketi kullanılamaz.</li>
          </ul>
        </section>
        <section className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Madde bazlı okuma yöntemi</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Önce taraf tanımı ve kapsam maddesi okunur.</li>
            <li>Ardından ödeme, teminat ve fesih maddeleri çapraz kontrol edilir.</li>
            <li>Veri işleme ve gizlilik maddeleri KVKK metniyle birlikte değerlendirilir.</li>
            <li>Uyuşmazlık ve yetkili merci maddeleri yerel mevzuata göre teyit edilir.</li>
            <li>Her değişiklikte revizyon tarihi ve değiştiren kişi bilgisi kayıtlanır.</li>
            <li>Son sürüm taraflara tek dosya halinde paylaşılır ve yazılı onay alınır.</li>
          </ul>
        </section>
        <section className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-xs text-slate-200">
          <h3 className="font-semibold text-emerald-100">Kime göre ve CTA</h3>
          <p className="mt-1">
            Bu ekran hukuk ekibi için revizyon yönetimi, operasyon için kapanış disiplini, kullanıcı için şeffaf sözleşme okuma adımıdır.
            İmza öncesi mutlaka avukat onayı alıp evrak merkezindeki sürümü kilitleyin.
          </p>
        </section>
        <section className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Nihai kontrol özeti</h3>
          <p className="mt-1">
            Şablon metin, işlem verileri ve yasal metinler arasında tutarlılık sağlandıktan sonra imza adımı açılmalıdır; aksi durumda sözleşme
            taslak statüsünde kalmalıdır.
          </p>
        </section>
        <section className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4 text-xs text-slate-300">
          <p>
            Nihai sürümdeki her madde, tarafların yükümlülüklerini açıkça göstermeli ve uyuşmazlık halinde ispatlanabilir şekilde
            kayıt altına alınmalıdır.
          </p>
          <p className="mt-2">Hukuk onayı alınmayan hiçbir sürüm “nihai” olarak işaretlenmemelidir.</p>
          <p className="mt-2">İmza öncesi son sürüm taraflarla yazılı olarak paylaşılmalıdır.</p>
        </section>
      </div>
    </div>
  );
}