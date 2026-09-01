import {
  Banknote, RefreshCw, BookOpen, Zap, ShieldCheck, Clock, Info,
  CheckCircle2, ScrollText, Calculator, Scale, AlertTriangle, TrendingUp, Wallet,
} from "lucide-react";
import { SubmissionForm } from "@/components/ibuyer/SubmissionForm";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { useAuth } from "@/contexts/AuthContext";
import { ibuyerSubtitle } from "@/lib/ibuyerHub";
import { ROUTES } from "@/constants/routes";

export default function IBuyerPage() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen pt-24 pb-16 text-white">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* HEADER */}
        <div className="mb-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-1 text-xs text-[var(--metin-ikincil)]">
            <Banknote className="h-3.5 w-3.5" /> iBuyer
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-normal">Anında Nakit Teklif</h1>
          <p className="mt-2 text-slate-400 max-w-2xl">{ibuyerSubtitle}</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <RefreshCw className="h-4 w-4" />
            Hukuki risk matrisi ile 72 saat geçerli teklif
          </p>
        </div>

        {/* KATMAN 1 — EĞİTİCİ GİRİŞ: iBuyer nedir? */}
        <div className="rounded-[20px] border border-[var(--cizgi)] bg-slate-900/40 p-5">
          <div className="flex items-start gap-3 mb-3">
            <BookOpen className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
            <h2 className="text-base font-normal text-white">iBuyer / Anında Nakit Teklif nedir?</h2>
          </div>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            <strong className="text-[var(--metin-ikincil)]">iBuyer</strong> (instant buyer), evinizi piyasada aylarca satışa çıkarmadan
            <strong className="text-[var(--metin-ikincil)]"> 72 saat içinde nakit teklif</strong> almanızı sağlayan modeldir.
            Komisyon yok, pazarlık süreci yok, evinizi gezdirmek yok — eksper + sözleşme + tapuya gidiş.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-[10px] border border-[var(--cizgi)] bg-slate-900/30 p-3">
              <p className="font-normal text-[var(--metin-ikincil)] mb-1 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Nasıl Çalışır?
              </p>
              <p className="text-slate-300">
                Form doldur → AI ön değerleme → SPK eksper → 72 saat içinde nakit teklif sözleşmesi.
              </p>
            </div>
            <div className="rounded-[10px] border border-[var(--cizgi)] bg-slate-900/30 p-3">
              <p className="font-normal text-[var(--metin-ikincil)] mb-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Süreç (5 Gün)
              </p>
              <p className="text-slate-300">
                Gün 1: form. Gün 2: AI değerleme. Gün 3: eksper. Gün 4: teklif. Gün 5: tapu randevu.
              </p>
            </div>
            <div className="rounded-[10px] border border-[var(--cizgi)] bg-slate-900/30 p-3">
              <p className="font-normal text-[var(--metin-ikincil)] mb-1 flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5" /> Avantaj
              </p>
              <p className="text-slate-300">
                Hızlı nakit + komisyon yok + pazarlık yok. Acil borç/hac/iş için. Piyasa altı %5-10 fiyat.
              </p>
            </div>
          </div>
        </div>

        {/* KATMAN 2 — FORM ALANI İPUCU */}
        <div className="rounded-[20px] border border-[var(--cizgi)] bg-slate-900/40 p-4">
          <p className="text-xs font-normal text-[var(--metin-ikincil)] mb-2 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" /> Form alanları ne demek?
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <p>
              <strong className="text-[var(--metin-ikincil)]">Mülk künyesi:</strong> tapu il/ilçe/ada/parsel + bağımsız bölüm no
              + m² + oda. Tapu fotokopisi gerek.
            </p>
            <p>
              <strong className="text-[var(--metin-ikincil)]">KYC (Kimlik Doğrulama):</strong> T.C. kimlik + IBAN + tapu sahibi
              tam isim eşleşmesi (MASAK + 6493).
            </p>
            <p>
              <strong className="text-[var(--metin-ikincil)]">İpotek/şerh:</strong> tapu üzerinde aktif ipotek varsa banka onayı + fek;
              hac varsa icra dosyası bilgisi.
            </p>
            <p>
              <strong className="text-[var(--metin-ikincil)]">Beklenen tutar:</strong> piyasa tahmini — sistem AI ön değerleme yapar,
              SPK eksper nihai kararı verir.
            </p>
          </div>
        </div>

        {/* KATMAN 3 — AKILLI FORM + SONUÇ (mevcut SubmissionForm) */}
        {loading ? (
          <div
            data-testid="ibuyer-loading"
            className="rounded-[20px] border border-white/10 bg-white/[0.04] p-8 animate-pulse space-y-4"
          >
            <div className="h-4 w-1/3 rounded-[3px] bg-slate-700" />
            <div className="h-10 rounded-[3px] bg-slate-700" />
            <div className="h-10 rounded-[3px] bg-slate-700" />
            <div className="h-10 w-1/2 rounded-[3px] bg-slate-700" />
          </div>
        ) : user ? (
          <SubmissionForm />
        ) : (
          <RequireAuthGate redirectTo={ROUTES.IBUYER} />
        )}

        {/* KATMAN 3.5 — Örnek Teklif Aralığı (her zaman gösterilir, eğitim için) */}
        <div className="rounded-[20px] border border-[var(--cizgi)] bg-slate-900/40 p-5">
          <div className="flex items-start gap-2 mb-3">
            <Calculator className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
            <h3 className="text-base font-normal text-white">Örnek Teklif Aralığı (3+1, 110 m², Kadıköy)</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
              <p className="text-[var(--metin-ikincil)] font-normal mb-1">Kötümser (Hızlı)</p>
              <p className="text-2xl font-normal text-white">₺7.2M</p>
              <p className="text-slate-400 mt-1">Piyasanın %12 altı — 48 saat içinde nakit.</p>
            </div>
            <div className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
              <p className="text-[var(--metin-ikincil)] font-normal mb-1">Gerçekçi (Önerilen)</p>
              <p className="text-2xl font-normal text-white">₺7.8M</p>
              <p className="text-slate-400 mt-1">Piyasanın %5 altı — 72 saat içinde nakit.</p>
            </div>
            <div className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
              <p className="text-[var(--metin-ikincil)] font-normal mb-1">İyimser (Pazarlık)</p>
              <p className="text-2xl font-normal text-white">₺8.1M</p>
              <p className="text-slate-400 mt-1">Piyasayla aynı — eksper + müzakere sonrası.</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-700">
            * Örnek değerlerdir — gerçek teklif eksper raporu, ipotek/hac durumu ve piyasa endeksine göre değişir.
          </p>

          {/* Mülk tipine göre teklif aralığı tablosu */}
          <div className="mt-4 pt-4 border-t border-[var(--cizgi)]">
            <p className="text-xs font-normal text-[var(--metin-ikincil)] mb-3">📋 Mülk Tipine Göre Tipik Teklif Süre + Aralığı</p>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs min-w-[480px]">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-700">
                    <th className="text-start py-2 pe-2 font-normal">Mülk Tipi</th>
                    <th className="text-end py-2 px-2 font-normal">Teklif Süresi</th>
                    <th className="text-end py-2 px-2 font-normal">Tahmini İndirim</th>
                    <th className="text-end py-2 ps-2 font-normal">Ödeme</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-800/50">
                    <td className="py-2 pe-2">🏠 Konut (3+1, 100 m²)</td>
                    <td className="py-2 px-2 text-end">72 saat</td>
                    <td className="py-2 px-2 text-end text-[var(--metin-ikincil)]">%5-10 altı</td>
                    <td className="py-2 ps-2 text-end text-[var(--metin-ikincil)]">5 gün nakit</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-2 pe-2">🏡 Villa (200+ m²)</td>
                    <td className="py-2 px-2 text-end">5-7 gün</td>
                    <td className="py-2 px-2 text-end text-[var(--metin-ikincil)]">%8-15 altı</td>
                    <td className="py-2 ps-2 text-end text-[var(--metin-ikincil)]">7-10 gün nakit</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-2 pe-2">🏢 Ofis/Plaza katı</td>
                    <td className="py-2 px-2 text-end">7-14 gün</td>
                    <td className="py-2 px-2 text-end text-[var(--metin-ikincil)]">%10-18 altı</td>
                    <td className="py-2 ps-2 text-end text-[var(--metin-ikincil)]">10-14 gün</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-2 pe-2">🏪 Mağaza/Dükkan</td>
                    <td className="py-2 px-2 text-end">5-10 gün</td>
                    <td className="py-2 px-2 text-end text-[var(--metin-ikincil)]">%8-12 altı</td>
                    <td className="py-2 ps-2 text-end text-[var(--metin-ikincil)]">7-10 gün</td>
                  </tr>
                  <tr>
                    <td className="py-2 pe-2">🏭 Depo/Arsa</td>
                    <td className="py-2 px-2 text-end">10-21 gün</td>
                    <td className="py-2 px-2 text-end text-[var(--metin-ikincil)]">%15-25 altı</td>
                    <td className="py-2 ps-2 text-end text-[var(--metin-ikincil)]">14-21 gün</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 italic">
              Tablo İhaleal iBuyer ağı 2025-2026 ortalamalarıdır; bireysel teklif tapu/imar/ipotek durumuna göre revize edilir.
            </p>
          </div>
        </div>

        {/* KATMAN 4 — GÜVEN, METODOLOJİ, HUKUKİ SÜREÇ */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
            <ShieldCheck className="h-5 w-5 text-[var(--metin-ikincil)]" />
            <h2 className="text-lg font-normal text-white">Güven, Süreç ve Hukuki Çerçeve</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Veri Kaynakları */}
            <div className="rounded-[20px] border border-[var(--cizgi)] bg-slate-900/40 p-5">
              <div className="flex items-start gap-2 mb-3">
                <ScrollText className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-normal text-white">Değerleme Kaynakları</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[var(--metin-ikincil)]">SPK Lisanslı Eksper:</strong> nihai değerleme (m² rayiç + bölge primi).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[var(--metin-ikincil)]">TCMB Konut Fiyat Endeksi:</strong> bölge ortalama satış değeri.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[var(--metin-ikincil)]">Platform Kapanış Endeksi:</strong> ihalede gerçekleşen fiyatlar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[var(--metin-ikincil)]">Tapu + İmar Kayıtları:</strong> şerh, ipotek, hac, imar durum belgesi.</span>
                </li>
              </ul>
            </div>

            {/* Süreç 5 adım */}
            <div className="rounded-[20px] border border-[var(--cizgi)] bg-slate-900/40 p-5">
              <div className="flex items-start gap-2 mb-3">
                <Clock className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-normal text-white">5 Günlük Süreç</h3>
              </div>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
                <li><strong className="text-[var(--metin-ikincil)]">Gün 1 — Başvuru:</strong> form + tapu fotokopisi + KYC.</li>
                <li><strong className="text-[var(--metin-ikincil)]">Gün 2 — AI Ön Analiz:</strong> bölge endeks + benzer kapanışlar.</li>
                <li><strong className="text-[var(--metin-ikincil)]">Gün 3 — Eksper:</strong> SPK lisanslı, sahada + foto rapor.</li>
                <li><strong className="text-[var(--metin-ikincil)]">Gün 4 — Teklif:</strong> 3 senaryo (kötümser/gerçekçi/iyimser) + 72 saat geçerli.</li>
                <li><strong className="text-[var(--metin-ikincil)]">Gün 5 — Tapu:</strong> noter onayı + emanet ödeme + tapu devir.</li>
              </ol>
            </div>

            {/* Ödeme + Emanet Güvencesi */}
            <div className="rounded-[20px] border border-[var(--cizgi)] bg-slate-900/40 p-5 md:col-span-2">
              <div className="flex items-start gap-2 mb-3">
                <Wallet className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-normal text-white">Ödeme + Emanet (Escrow) Güvencesi</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-[10px] border border-[var(--cizgi)] bg-slate-900/30 p-3">
                  <p className="font-normal text-[var(--metin-ikincil)] mb-1">🏦 Banka Emanet Hesabı</p>
                  <p className="text-slate-300">
                    Nakit teklif tutarı, tapu devir gününe kadar lisanslı emanet hesapta tutulur.
                    Devir tamamlanmadan teslim edilmez.
                  </p>
                </div>
                <div className="rounded-[10px] border border-[var(--cizgi)] bg-slate-900/30 p-3">
                  <p className="font-normal text-[var(--metin-ikincil)] mb-1">📜 Sözleşme</p>
                  <p className="text-slate-300">
                    Noter onaylı satım sözleşmesi + 72 saat cayma hakkı (BK m. 207).
                    İpotek varsa banka fek belgesi şart.
                  </p>
                </div>
                <div className="rounded-[10px] border border-[var(--cizgi)] bg-slate-900/30 p-3">
                  <p className="font-normal text-[var(--metin-ikincil)] mb-1">🔐 KYC + MASAK</p>
                  <p className="text-slate-300">
                    Kimlik + IBAN + tapu sahibi eşleşmesi (6493 sayılı kanun) + suç gelirleri aklama
                    önleme (5549 sayılı).
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-5 md:col-span-2">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-normal text-white">Yasal Uyarı (Disclaimer)</h3>
              </div>
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-[var(--metin-ikincil)]">İhaleal:</strong> iBuyer alıcı değildir; SPK lisanslı eksper + alıcı
                  yatırımcı (kurumsal portföy / fon) ağına başvurunuzu iletir. Final teklif kararı eksper raporu
                  + alıcı onayına bağlıdır. Platform, teklif kabul/red yetkisine sahip değildir.
                </p>
                <p>
                  <strong className="text-[var(--metin-ikincil)]">İlgili Mevzuat:</strong> 6098 sayılı Türk Borçlar Kanunu
                  (satım + cayma), 4721 sayılı Türk Medeni Kanunu (tapu + ipotek), 6493 sayılı Ödeme ve Menkul Kıymet
                  Mutabakat Sistemleri (emanet hesap), 5549 sayılı MASAK Kanunu (KYC + temiz para),
                  KVKK 6698 (kişisel veri saklama).
                </p>
                <p className="text-slate-400 pt-2 border-t border-[var(--cizgi)]">
                  Teklif <strong className="text-[var(--metin-ikincil)]">72 saat</strong> geçerlidir; sonra eksper güncel raporu gerekir.
                  Eve gizli kusur (yapısal hasar, iskan eksiği, hukuki şerh) tespit edilirse teklif revize edilir veya iptal edilir.
                  Tüm satım işlemlerinde <strong className="text-[var(--metin-ikincil)]">tapu müdürlüğü + noter onayı zorunludur</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Güven rozetleri */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cizgi)] bg-slate-900/40 px-3 py-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--metin-ikincil)]" />
              SPK Ekspertiz uyumlu
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cizgi)] bg-slate-900/40 px-3 py-1">
              <TrendingUp className="h-3.5 w-3.5 text-[var(--metin-ikincil)]" />
              TCMB Endeksli
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cizgi)] bg-slate-900/40 px-3 py-1">
              <Wallet className="h-3.5 w-3.5 text-[var(--metin-ikincil)]" />
              Banka Emanet (6493)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cizgi)] bg-slate-900/40 px-3 py-1">
              <Scale className="h-3.5 w-3.5 text-[var(--metin-ikincil)]" />
              MASAK + KVKK uyumlu
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
