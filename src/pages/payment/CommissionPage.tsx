import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calculator, BookOpen, ScrollText, Info, CheckCircle2,
  TrendingUp, Wallet, Scale, Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calcCommissionBreakdown,
  COMMISSION_RATE,
  VAT_RATE,
} from "@/lib/fees";
import { formatTry } from "@/lib/pricingTiers";

export default function CommissionPage() {
  const navigate = useNavigate();
  const [saleStr, setSaleStr] = useState("5000000");
  const [bondPct, setBondPct] = useState(5);

  const saleTry = useMemo(() => Math.max(0, Number(saleStr.replace(/\D/g, "")) || 0), [saleStr]);
  const result = useMemo(() => calcCommissionBreakdown(saleTry), [saleTry]);
  const bondAmount = Math.round((saleTry * bondPct) / 100);
  const commissionPct = (COMMISSION_RATE * 100).toFixed(0); // %2
  const totalPct = (COMMISSION_RATE * 2 * 100).toFixed(0);  // %4
  const vatPct = (VAT_RATE * 100).toFixed(0);               // %20
  const grandTotal = result.totalCommission + result.totalVAT;

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-white gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-7 w-7 text-cyan-400" />
            Komisyon Hesabı + Teminat Blokajı
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            %{commissionPct} alıcı + %{commissionPct} satıcı = toplam %{totalPct} (KDV hariç matrah). KDV %{vatPct} komisyon
            üzerine ayrıca faturalanır. Ek olarak ihale teminat blokajı (provizyon).
          </p>
        </div>

        {/* KATMAN 1 — Eğitici */}
        <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/5 to-slate-900/40 p-5">
          <div className="flex items-start gap-3 mb-3">
            <BookOpen className="h-5 w-5 text-cyan-300 flex-shrink-0 mt-0.5" />
            <h2 className="text-base font-semibold text-white">Komisyon nasıl çalışıyor?</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            İhaleal komisyonu <strong className="text-cyan-200">tek oran, sabit ve şeffaf</strong>:
            alıcı ve satıcı her biri satış bedelinin %{commissionPct}'sini öder (toplam %{totalPct}).
            Yasal üst sınır <strong className="text-cyan-200">Taşınmaz Ticareti Yönetmeliği md.20'ye göre toplam %{totalPct}
            (KDV hariç)</strong> — model tam tavanda. KDV %{vatPct} komisyon üzerine ayrıca
            tahakkuk eder ve faturada ayrı kalem olarak gösterilir.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg border border-cyan-400/15 bg-slate-900/30 p-3">
              <p className="font-semibold text-cyan-300 mb-1 flex items-center gap-1">
                <Percent className="h-3 w-3" /> %{commissionPct}
              </p>
              <p className="text-slate-300">Alıcı komisyonu (satış bedelinden)</p>
            </div>
            <div className="rounded-lg border border-cyan-400/15 bg-slate-900/30 p-3">
              <p className="font-semibold text-cyan-300 mb-1 flex items-center gap-1">
                <Percent className="h-3 w-3" /> %{commissionPct}
              </p>
              <p className="text-slate-300">Satıcı komisyonu (satış bedelinden)</p>
            </div>
            <div className="rounded-lg border border-cyan-400/15 bg-slate-900/30 p-3">
              <p className="font-semibold text-cyan-300 mb-1 flex items-center gap-1">
                <Percent className="h-3 w-3" /> %{vatPct}
              </p>
              <p className="text-slate-300">KDV (komisyon üzerine, faturada ayrı)</p>
            </div>
          </div>
        </div>

        {/* KATMAN 2 — Form + Sonuç */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Calculator className="h-4 w-4 text-cyan-400" />
              Hesap Girdileri
            </h3>

            <div className="space-y-2">
              <Label className="text-slate-400">Satış tutarı (TL)</Label>
              <Input
                value={saleStr}
                onChange={(e) => setSaleStr(e.target.value)}
                placeholder="5000000"
              />
              <p className="text-[10px] text-slate-500">Örn: 5000000 = ₺5M</p>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400">Teminat oranı (%) — varsayılan 5</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={bondPct}
                onChange={(e) => setBondPct(Math.min(20, Math.max(1, Number(e.target.value) || 5)))}
              />
              <p className="text-[10px] text-slate-500">İhale teminatı (provizyon) — kredi kartı blokaj, faiz YOK</p>
            </div>

            <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-3">
              <p className="text-xs font-semibold text-amber-100 flex items-center gap-1.5">
                <Info className="h-3 w-3" /> Teminat Blokaj Modeli
              </p>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Teklif vermeden önce <strong>kredi kartı PROVİZYON</strong> ile teminat blokajı alınır. Hesabınıza para çekilmez —
                bankadan blokaj kalkar (ihale bitiminde). Faiz YOK, yasal model (6493 sayılı kanun + BKK).
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-slate-900/50 p-5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-400" />
              Hesap Sonucu
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400">Satış tutarı</span>
                <span className="text-white font-semibold">{formatTry(saleTry)}</span>
              </div>

              <div className="border-t border-slate-700 pt-3 space-y-2">
                <p className="text-xs text-emerald-300 font-semibold mb-1">Komisyon Dökümü</p>
                <div className="text-xs flex justify-between border-b border-slate-800 pb-1.5">
                  <div>
                    <p className="text-slate-300">Satıcı komisyonu</p>
                    <p className="text-[10px] text-slate-500">{formatTry(saleTry)} × %{commissionPct}</p>
                  </div>
                  <p className="text-white font-mono">{formatTry(result.sellerCommission)}</p>
                </div>
                <div className="text-xs flex justify-between border-b border-slate-800 pb-1.5">
                  <div>
                    <p className="text-slate-300">Alıcı komisyonu</p>
                    <p className="text-[10px] text-slate-500">{formatTry(saleTry)} × %{commissionPct}</p>
                  </div>
                  <p className="text-white font-mono">{formatTry(result.buyerCommission)}</p>
                </div>
                <div className="text-xs flex justify-between pb-1.5">
                  <div>
                    <p className="text-slate-300">KDV (%{vatPct})</p>
                    <p className="text-[10px] text-slate-500">Komisyon üzerine ayrı fatura</p>
                  </div>
                  <p className="text-white font-mono">{formatTry(result.totalVAT)}</p>
                </div>
              </div>

              <div className="border-t border-emerald-500/30 pt-3 flex justify-between items-baseline">
                <span className="text-emerald-300 font-semibold">Toplam Komisyon (KDV hariç)</span>
                <span className="text-2xl font-bold text-emerald-300">{formatTry(result.totalCommission)}</span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-emerald-200 font-semibold">Toplam (KDV dahil)</span>
                <span className="text-xl font-bold text-emerald-200">{formatTry(grandTotal)}</span>
              </div>

              <p className="text-[11px] text-slate-500 text-right">
                Efektif oran: %{saleTry > 0 ? ((result.totalCommission / saleTry) * 100).toFixed(2) : "0.00"} (matrah) +
                KDV %{saleTry > 0 ? ((result.totalVAT / saleTry) * 100).toFixed(2) : "0.00"}
              </p>

              <div className="border-t border-slate-700 pt-3 flex justify-between items-baseline">
                <span className="text-amber-300">Teminat Blokaj ({bondPct}%)</span>
                <span className="text-amber-300 font-bold">{formatTry(bondAmount)}</span>
              </div>
              <p className="text-[10px] text-slate-500">Provizyon — banka blokajı; hesaba çekilmez.</p>
            </div>
          </div>
        </div>

        {/* KATMAN 3 — Karşılaştırma */}
        <div className="rounded-2xl border border-violet-500/20 bg-slate-900/40 p-5">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-400" />
            Diğer platformlarla karşılaştırma
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[480px]">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="text-left py-2 pr-2 font-medium">Platform</th>
                  <th className="text-right py-2 px-2 font-medium">Satıcı Komisyon</th>
                  <th className="text-right py-2 px-2 font-medium">Alıcı Komisyon</th>
                  <th className="text-right py-2 pl-2 font-medium">Şeffaflık</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-2 font-semibold text-emerald-300">İhaleal (bizim)</td>
                  <td className="py-2 px-2 text-right text-emerald-200">%{commissionPct} sabit</td>
                  <td className="py-2 px-2 text-right text-emerald-200">%{commissionPct} sabit</td>
                  <td className="py-2 pl-2 text-right text-emerald-200">✅ Tek oran, KDV ayrı</td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-2">Geleneksel Emlakçı</td>
                  <td className="py-2 px-2 text-right">%2-3 (pazarlık)</td>
                  <td className="py-2 px-2 text-right">%2-3 (pazarlık)</td>
                  <td className="py-2 pl-2 text-right">⚠️ Pazarlık</td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-2 pr-2">Endeksa / Hepsiemlak</td>
                  <td className="py-2 px-2 text-right">Liste ücreti</td>
                  <td className="py-2 px-2 text-right">—</td>
                  <td className="py-2 pl-2 text-right">⚠️ Doping ek</td>
                </tr>
                <tr>
                  <td className="py-2 pr-2">Açık Artırma / İhale</td>
                  <td className="py-2 px-2 text-right">%3-5 (sabit)</td>
                  <td className="py-2 px-2 text-right">%1-2</td>
                  <td className="py-2 pl-2 text-right">⚠️ Karma</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            * Bilgilendirme — gerçek oranlar firmaya/satışa göre değişebilir.
          </p>
        </div>

        {/* KATMAN 4 — Güven + Yasal */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/40 p-5">
            <div className="flex items-start gap-2 mb-3">
              <ScrollText className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-0.5" />
              <h3 className="text-base font-semibold text-white">Komisyon Net Kuralları</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-emerald-200">Sadece kapanış üzerinden</strong> — iptal olursa komisyon alınmaz.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-emerald-200">KDV ayrı</strong> — komisyon matrah, KDV %{vatPct} üzerine; faturada ayrı kalem.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-emerald-200">Pazarlık yok</strong> — tüm kullanıcılara aynı sabit %{commissionPct}+%{commissionPct} oran.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-emerald-200">Yasal tavanda</strong> — toplam %{totalPct} matrah, Taşınmaz Ticareti Yönetmeliği üst sınırı.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-emerald-200">Ek ücret yok</strong> — listeleme, doping ayrı satılır; isteğe bağlı.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-slate-900/40 p-5">
            <div className="flex items-start gap-2 mb-3">
              <Scale className="h-5 w-5 text-violet-300 flex-shrink-0 mt-0.5" />
              <h3 className="text-base font-semibold text-white">Yasal Çerçeve</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <strong className="text-violet-200">Taşınmaz Ticareti Yönetmeliği md.20:</strong> Emlak komisyonu toplam %{totalPct} (KDV hariç) yasal üst sınır — alıcı-satıcı eşit paylaşım.
              </li>
              <li>
                <strong className="text-violet-200">6502 TKHK m. 35:</strong> Tüketici komisyon bilgisi açık ve önceden.
              </li>
              <li>
                <strong className="text-violet-200">6098 BK m. 207:</strong> Aracılık sözleşmesi yazılı yapılır.
              </li>
              <li>
                <strong className="text-violet-200">6493 Ödeme Kanunu:</strong> Komisyon tahsilatı + emanet hesap düzeni.
              </li>
              <li>
                <strong className="text-violet-200">213 VUK m. 230:</strong> Fatura kesim zamanı + içerik.
              </li>
              <li>
                <strong className="text-violet-200">Vergi Daireler Genel Tebliği:</strong> KDV uygulaması.
              </li>
            </ul>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 text-center pt-2 leading-relaxed">
          Bu hesap <strong>bilgilendirme</strong> amaçlıdır. Resmi fatura komisyon kapanışta SPK lisanslı eksper raporu + noter onayı sonrası kesilir.
        </p>
      </div>
    </main>
  );
}
