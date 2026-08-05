import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Percent,
  Ban,
  Bot,
  MessageSquare,
  Landmark,
  BadgePercent,
  Calculator,
  Handshake,
  GitCompare,
  TrendingUp,
  Wallet,
  ArrowRight,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  COMMISSION_ONLY_PRINCIPLES,
  THREE_MODES_AND_BROKERAGE_RULES,
  SELLER_SIDE_RATES,
  BUYER_SIDE_RATES,
  AI_ASSISTANT_SCOPE,
  SMS_FLOWS,
  PAYMENT_INTEGRATION,
} from "@/data/businessModel";
import {
  AGENT_SHARE_RATES,
  MEMBERSHIP_FEES,
  REALTOR_B2B_RATE,
  VAT_RATE,
  calcCommissionBreakdown,
  feeBadgeLabel,
} from "@/lib/fees";

const SCENARIO_SALES_TRY = [3_000_000, 5_000_000, 10_000_000] as const;

const JUMP_LINKS = [
  { id: "cta", label: "Hızlı erişim" },
  { id: "ozet", label: "Gelir özeti" },
  { id: "senaryolar", label: "Senaryo analizi" },
  { id: "emlakçı", label: "Emlakçı ağı" },
  { id: "mahsup", label: "Mahsup" },
  { id: "ilkeler", label: "İlkeler" },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function BusinessModel() {
  const navigate = useNavigate();
  const initialHash = useRef(typeof window !== "undefined" ? window.location.hash : "");

  useEffect(() => {
    const hash = initialHash.current.replace(/^#/, "");
    if (!hash) return;
    const t = window.setTimeout(() => scrollToId(hash), 150);
    return () => window.clearTimeout(t);
  }, []);

  const sellerMembership = MEMBERSHIP_FEES.seller_yearly;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6">
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Ana sayfa
        </Button>

        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 sm:p-8 mb-8 shadow-xl shadow-black/30">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
              <Building2 className="w-3.5 h-3.5" /> Emlakçı ağı & kurumsal ortaklar
            </span>
            <span className="inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-100">fees.ts ile uyumlu taslak</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">Gelir modeli — yalnızca başarılı işlem komisyonu</h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            Platform <strong className="text-white">gerçek alıcı ile gerçek satıcıyı</strong> (kiralıkta kiracı–kiraya veren) buluşturmayı hedefler.
            Gelir hedefi: <strong className="text-emerald-300">ilan vitrini, doping veya kullanıcıya satılan reklam ücreti yok</strong> — yalnızca kapanan işlemden komisyon.
            Kirada hedef: <strong className="text-emerald-300">kiraya verenden bir aylık kira + KDV</strong>. Aşağıdaki oranlar ve tablolar{" "}
            <strong className="text-amber-200">taslak</strong>; avukat ve muhasebe ile kesinleşir.
          </p>
        </div>

        <section id="cta" className="mb-8 scroll-mt-28">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => navigate("/komisyon-hesaplayici")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-2 shadow-lg shadow-emerald-900/40"
            >
              <Calculator className="w-5 h-5" /> Komisyon hesaplayıcı
              <ArrowRight className="rtl:rotate-180 w-4 h-4 opacity-80" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/emlakçı-ortaklik")}
              className="border-violet-500/40 text-violet-100 hover:bg-violet-500/15 gap-2"
            >
              <Handshake className="w-5 h-5" /> Emlakçı ortaklığı başvurusu
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/karsilastir-rakipler")} className="border-white/15 text-slate-200 gap-2">
              <GitCompare className="w-5 h-5" /> Rakip analizi
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Canlı hesap: matrah, KDV, kiralık/satılık ayrımı ve kat karşılığı satırı — <span className="text-slate-400">{feeBadgeLabel()}</span>
          </p>
        </section>

        <nav
          className="sticky top-[4.5rem] z-30 mb-8 -mx-1 px-1 py-2 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-md"
          aria-label="Sayfa bölümleri"
        >
          {JUMP_LINKS.map((j) => (
            <button
              key={j.id}
              type="button"
              onClick={() => scrollToId(j.id)}
              className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white/5 text-slate-300 hover:text-white hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-colors"
            >
              {j.label}
            </button>
          ))}
        </nav>

        <section id="ozet" className="scroll-mt-28 mb-10">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Gelir kanalları (özet)
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="bg-slate-900/60 border-emerald-500/20">
              <CardContent className="p-4">
                <div className="text-xs font-medium text-emerald-300/90 uppercase tracking-wide">Satılık</div>
                <p className="mt-2 text-sm text-slate-300 leading-snug">
                  İki taraflı modelde toplam <strong className="text-white">%4 komisyon matrahı</strong> (alıcı + satıcı payları) + KDV; işlem tutarı üzerinden hesaplanır.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-teal-500/20">
              <CardContent className="p-4">
                <div className="text-xs font-medium text-teal-300/90 uppercase tracking-wide">Kiralık</div>
                <p className="mt-2 text-sm text-slate-300 leading-snug">
                  Hedef: <strong className="text-white">yalnızca kiraya verenden</strong> 1 tam aylık kira + KDV (kiracıdan ilan ücreti yok — hedef).
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-violet-500/20">
              <CardContent className="p-4">
                <div className="text-xs font-medium text-violet-300/90 uppercase tracking-wide">Üyelik / hizmet</div>
                <p className="mt-2 text-sm text-slate-300 leading-snug">
                  Yıllık üyelik ve seçilen hizmet kalemleri <strong className="text-white">komisyondan mahsup</strong> edilir (politika üretimde netleşir).
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="senaryolar" className="scroll-mt-28 mb-10">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" /> Senaryo analizi (satış — demo dağılım)
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Tablo <code className="text-slate-400">calcCommissionBreakdown</code> ile üretilir. Emlakçı payı varsayılan olarak tam işbirliği oranı{" "}
            <strong className="text-slate-400">%{ (REALTOR_B2B_RATE * 100).toFixed(1)}</strong> (işlem tutarı üzerinden). Mahsup: örnek satıcı yıllık üyelik ₺
            {sellerMembership.toLocaleString("tr-TR")}.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-start text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-white/[0.03] text-slate-400">
                  <th className="p-3 font-medium">İşlem (₺)</th>
                  <th className="p-3 font-medium">Komisyon matrahı</th>
                  <th className="p-3 font-medium">KDV ({(VAT_RATE * 100).toFixed(0)}%)</th>
                  <th className="p-3 font-medium">Emlakçı payı (ör.)</th>
                  <th className="p-3 font-medium">Mahsup (üyelik)</th>
                  <th className="p-3 font-medium text-emerald-200">Platform net (matrah)</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {SCENARIO_SALES_TRY.map((sale) => {
                  const b = calcCommissionBreakdown(sale, sellerMembership, 0, REALTOR_B2B_RATE);
                  return (
                    <tr key={sale} className="border-b border-slate-200/80 hover:bg-white/[0.02]">
                      <td className="p-3 font-mono text-white">{sale.toLocaleString("tr-TR")}</td>
                      <td className="p-3">₺{b.totalCommission.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</td>
                      <td className="p-3">₺{b.totalVAT.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</td>
                      <td className="p-3">₺{b.agentShare.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</td>
                      <td className="p-3">₺{b.offsetMembership.toLocaleString("tr-TR")}</td>
                      <td className="p-3 text-emerald-200 font-medium">₺{Math.round(b.platformNet).toLocaleString("tr-TR")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            KDV tahsilatı ve muhasebe kaydı ayrı kolonda izlenir; “platform net” burada matrah üzerinden basit çıkarım — bilanço için finans onayı gerekir.
          </p>
        </section>

        <section id="emlakçı" className="scroll-mt-28 mb-10">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Handshake className="w-5 h-5 text-violet-400" /> Emlakçı ağı — pay kademeleri (işlem tutarı üzerinden)
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Ortak emlakçı modeli B2B faturalama ile uyumlu olacak şekilde tasarlanır. Aşağıdaki oranlar <code className="text-slate-500">AGENT_SHARE_RATES</code> ile
            aynıdır; operasyon hangi kademenin devreye girdiğini sözleşmede tanımlar.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {(
              [
                { key: "referral" as const, title: "Referans / yönlendirme", hint: "Tek yönlü getiri" },
                { key: "portfolio" as const, title: "Portföy paylaşımı", hint: "Orta katman işbirliği" },
                { key: "full" as const, title: "Tam işbirliği", hint: "Varsayılan ortaklık çizgisi" },
              ] as const
            ).map(({ key, title, hint }) => (
              <Card key={key} className={`bg-slate-900/50 border-slate-200 ${key === "full" ? "ring-1 ring-violet-500/30" : ""}`}>
                <CardContent className="p-4">
                  <div className="text-xs text-slate-500">{hint}</div>
                  <div className="mt-1 text-white font-semibold">{title}</div>
                  <div className="mt-3 text-2xl font-bold text-violet-200">%{ (AGENT_SHARE_RATES[key] * 100).toFixed(2)}</div>
                  <div className="text-[11px] text-slate-500 mt-1">işlem tutarı üzerinden (matrah)</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-violet-500/5 border-violet-500/20">
            <CardContent className="p-4 text-sm text-slate-400">
              <strong className="text-slate-200">Operasyon notu:</strong> Hak edişlerin işlem onayından sonra süreli havuzda tutulması (ör. Net-30 güvence), sürekli teminat ve
              fatura yükümlülüğü üretim politikasında tanımlanır — paneldeki komisyon özeti ve{" "}
              <button type="button" onClick={() => navigate("/nihai-anayasa")} className="text-violet-300 hover:underline">
                Nihai sistem anayasası
              </button>{" "}
              metinleri ile tutarlılık hedeflenir.
            </CardContent>
          </Card>
        </section>

        <section id="mahsup" className="scroll-mt-28 mb-10">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-teal-400" /> Mahsup ve tahsilat akışı
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-400">
            <li>İşlem bedeli ve komisyon matrahı tapu / sözleşme hattında kesinleşir.</li>
            <li>Yıllık üyelik ve kullanılan hizmet bedelleri komisyon matrahından düşülür (üst sınır ve sıra: politika).</li>
            <li>Emlakçı payı, tanımlı oran üzerinden düşülür; kalan platform matrahı ve KDV muhasebeleştirilir.</li>
            <li>Ödeme sağlayıcı / blokeli havuz üzerinden tahsilat; mutabakat raporu aylık üretim hedefi.</li>
            <li>Uyuşmazlıkta kayıtlı teklif ve iletişim logları delil çerçevesinde (yasal metin ayrı).</li>
          </ol>
        </section>

        <section id="ilkeler" className="scroll-mt-28">
          <Card className="bg-emerald-500/5 border-emerald-500/20 mb-8">
            <CardContent className="p-5">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-3"><Percent className="w-5 h-5 text-emerald-400" /> İlkeler</h2>
              <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
                {COMMISSION_ONLY_PRINCIPLES.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <Card className="bg-violet-500/5 border-violet-500/20 mb-8">
          <CardContent className="p-5">
            <h2 className="text-white font-semibold flex items-center gap-2 mb-3"><Ban className="w-5 h-5 text-violet-400" /> Üç mod: ilan, teklif al, ihale</h2>
            <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
              {THREE_MODES_AND_BROKERAGE_RULES.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Ban className="w-4 h-4 text-orange-400" /> Satıcı / kiraya veren</h3>
              <ul className="space-y-3 text-xs text-slate-400">
                {SELLER_SIDE_RATES.map((r) => (
                  <li key={r.type} className="border-b border-slate-200/80 pb-2">
                    <div className="text-slate-200 font-medium">{r.type}</div>
                    <div className="text-emerald-300 mt-0.5">{r.target}</div>
                    <div className="text-slate-600 mt-1">{r.note}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Percent className="w-4 h-4 text-blue-400" /> Alıcı / kiracı</h3>
              <ul className="space-y-3 text-xs text-slate-400">
                {BUYER_SIDE_RATES.map((r) => (
                  <li key={r.type} className="border-b border-slate-200/80 pb-2">
                    <div className="text-slate-200 font-medium">{r.type}</div>
                    <div className="text-blue-300 mt-0.5">{r.target}</div>
                    <div className="text-slate-600 mt-1">{r.note}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-slate-200/80 mb-6">
          <CardContent className="p-5">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-3"><Bot className="w-5 h-5 text-violet-400" /> Yapay zeka emlakçı (yol haritası)</h3>
            <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
              {AI_ASSISTANT_SCOPE.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-5">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-3"><MessageSquare className="w-5 h-5 text-amber-400" /> SMS akışları</h3>
              <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
                {SMS_FLOWS.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-5">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-3"><Landmark className="w-5 h-5 text-teal-400" /> Ödeme (Sahibinden benzeri hazırlık)</h3>
              <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
                {PAYMENT_INTEGRATION.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2 mt-10">
          <Button variant="outline" className="border-white/15 text-slate-200" onClick={() => navigate("/sat-basla")}>Satıcı modları</Button>
          <Button variant="outline" className="border-white/15 text-slate-200" onClick={() => navigate("/yasal-cerceve")}>Yasal çerçeve</Button>
          <Button variant="outline" className="border-white/15 text-slate-200" onClick={() => navigate("/canliya-hazirlik")}>Canlıya hazırlık</Button>
          <Button variant="outline" className="border-white/15 text-slate-200" onClick={() => navigate("/veri-ve-endeks")}>İhaleal Endeksi</Button>
          <Button variant="outline" className="border-emerald-500/30 text-emerald-200" onClick={() => navigate("/komisyon-hesaplayici")}>
            <Calculator className="w-4 h-4" /> Hesaplayıcıya dön
          </Button>
        </div>
      </div>
    </div>
  );
}
