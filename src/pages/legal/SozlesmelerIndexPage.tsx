import { Link } from "react-router-dom";
import { AlertTriangle, FileText, ShieldCheck } from "lucide-react";
import { CONTRACT_TEMPLATES } from "@/data/contractTemplates";

export default function SozlesmelerIndexPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">Sozlesme sablonlari</h1>
          <p className="text-sm text-slate-400">
            Bu ekran, ihale, emlakcilik, kat karsiligi ve veri isleme sureclerinde kullanilan temel sablonlari bir araya getirir.
            Metinler on bilgilendirme amacli taslaktir; nihai imza seti icin avukat onayi zorunludur.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-200">1) Secim</p>
            <p className="mt-1 text-xs text-slate-300">Isleme uygun sablonu secin (ihale, KKA, gizlilik vb.).</p>
          </article>
          <article className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-cyan-200">2) Uyarlama</p>
            <p className="mt-1 text-xs text-slate-300">Taraf, oran, sure ve teminat kosullarini dosya bazli netlestirin.</p>
          </article>
          <article className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-violet-200">3) Hukuk kontrolu</p>
            <p className="mt-1 text-xs text-slate-300">Imza oncesi hukuk + mali mustavir kontrol listesi tamamlanir.</p>
          </article>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold text-slate-100">Nedir / Neden</h2>
            <p className="mt-2 text-xs text-slate-300">
              Sözleşme merkezi; işlem türüne göre hangi şablonun hangi sırayla kullanılacağını netleştirir. Amaç, yanlış şablon kullanımı
              kaynaklı ihtilafları azaltmak ve tüm taraflar için ispatlanabilir bir belge zinciri kurmaktır.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold text-slate-100">Yöntem (açıklamalı)</h2>
            <ul className="mt-2 list-disc pl-5 text-xs text-slate-300 space-y-1">
              <li>İşlem tipi seçilir (ihale, temsil, veri işleme, KKA vb.).</li>
              <li>Taraf rolleri ve sorumlulukları şablona işlenir.</li>
              <li>Ödeme/teminat/cezai şart maddeleri dosya bazlı güncellenir.</li>
              <li>Avukat onayı sonrası imza sürecine alınır.</li>
            </ul>
          </article>
        </div>

        <ul className="space-y-3">
          {CONTRACT_TEMPLATES.map((c) => (
            <li key={c.slug}>
              <Link
                to={"/yasal/sozlesmeler/" + c.slug}
                className="flex flex-col gap-2 rounded-xl border border-white/10 p-4 text-white transition-colors hover:border-teal-500/30 hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-teal-400" />
                  <span className="font-medium">{c.title}</span>
                </div>
                <p className="text-xs text-slate-400">{c.summary}</p>
                <p className="text-[11px] text-slate-500">
                  Taraflar: {c.parties.join(" · ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
            <h3 className="text-sm font-semibold text-cyan-100">Örnek</h3>
            <p className="mt-2 text-xs text-slate-200">
              Satıcı + emlakçı + platform üçlü işleminde önce agency contract, ardından işlem özel sözleşmesi, en sonda KVKK/aydınlatma
              ekleri ile imza dosyası tamamlanır.
            </p>
          </article>
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <h3 className="text-sm font-semibold text-emerald-100">Kime göre</h3>
            <p className="mt-2 text-xs text-slate-200">
              Hukuk ekibi için revizyon görünürlüğü, operasyon ekibi için evrak sırası, kullanıcı için anlaşılır ve şeffaf işlem deneyimi sunar.
            </p>
          </article>
        </div>

        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs text-slate-300">
          <p className="flex items-center gap-2 font-medium text-amber-200">
            <AlertTriangle className="h-4 w-4" /> Durust sinir
          </p>
          <p className="mt-2">
            Sablonlar otomatik hukuki gorus yerine gecmez. Ozellikle teminat, escrow, KYC, cezai sart, tahkim ve veri isleme maddeleri
            somut dosyada avukat tarafindan guncellenmelidir.
          </p>
          <p className="mt-2 flex items-center gap-2 text-emerald-200">
            <ShieldCheck className="h-4 w-4" /> Hedef: anlasilir, denetlenebilir ve platform politikasiyla tutarli metin seti.
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 p-4 text-xs text-slate-200">
          <p className="font-semibold text-blue-100">CTA</p>
          <p className="mt-2">
            Şablon seçimini tamamlayın, her sözleşme için sorumlu hukuk kişisini atayın ve imza öncesi son sürüm kontrolünü kapatın.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Ek rehber</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Her şablon için zorunlu ekler (evrak, ekspertiz, KVKK) kontrol edilmelidir.</li>
            <li>Dosya bazlı risk notları sözleşme revizyonuna işlenmelidir.</li>
            <li>İmza sonrası sürüm arşivi ve erişim yetkileri merkezi olarak saklanmalıdır.</li>
            <li>Uyuşmazlıkta ispat zinciri için işlem zaman damgaları korunmalıdır.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Sözleşme türleri ne işe yarar?</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Temsil/agency: rol ve komisyon sınırlarını netleştirir.</li>
            <li>İşlem sözleşmeleri: ödeme, teslim, fesih ve sorumluluk çerçevesi kurar.</li>
            <li>Veri/KVKK ekleri: kişisel veri işleme sınırını ve taraf yükümlülüğünü tanımlar.</li>
            <li>Uyum ekleri: denetim ve delil zincirinin korunmasını sağlar.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Son adım kontrolü</h3>
          <p className="mt-2">
            Her sözleşme türü için “zorunlu evrak + hukuk onayı + sürüm numarası” üçlüsü tamamlanmadan imza sürecine geçilmemelidir.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4 text-xs text-slate-300">
          <p>
            Sözleşme indeksinin amacı, işlemi hızlandırırken hukuki kaliteyi düşürmemektir; bu nedenle her şablon için nihai karar mercii
            hukuk ekibidir.
          </p>
        </div>
      </div>
    </div>
  );
}