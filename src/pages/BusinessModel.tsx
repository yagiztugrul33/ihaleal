import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Percent, Ban, Bot, MessageSquare, Landmark,
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

export default function BusinessModel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Ana sayfa
        </Button>

        <h1 className="text-2xl font-bold text-white mb-2">İhale Al — yalnızca komisyon (hedef iş modeli)</h1>
        <p className="text-sm text-slate-400 mb-8">
          Platform <strong className="text-slate-200">gerçek alıcı ile gerçek satıcıyı</strong> (ve kiralıkta kiracı–kiraya veren) buluşturmayı hedefler:{" "}
          <strong className="text-slate-200">Yapay zeka destekli gayrimenkul platformu</strong> olarak fiyat ve bölge değerlendirmesi, değerleme çizgisi, katılımcılarda Findeks ve evrak ile yetki doğrulama, sözleşme paketi (üretim yol haritası).
          Gelir hedefi: <strong className="text-teal-300">yalnızca başarılı işlem komisyonu</strong> — ilan vitrini, doping veya kullanıcıya satılan reklam ücreti yok. Kirada: <strong className="text-teal-300">yalnızca kiraya verenden bir aylık kira + KDV</strong> (hedef).
          Aşağıdaki oranlar <strong className="text-amber-200">taslak</strong>; avukat + muhasebe ile kesinleşir.
        </p>

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
          <Card className="bg-slate-900/50 border-white/5">
            <CardContent className="p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Ban className="w-4 h-4 text-orange-400" /> Satıcı / kiraya veren</h3>
              <ul className="space-y-3 text-xs text-slate-400">
                {SELLER_SIDE_RATES.map((r) => (
                  <li key={r.type} className="border-b border-white/5 pb-2">
                    <div className="text-slate-200 font-medium">{r.type}</div>
                    <div className="text-emerald-300 mt-0.5">{r.target}</div>
                    <div className="text-slate-600 mt-1">{r.note}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-white/5">
            <CardContent className="p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Percent className="w-4 h-4 text-blue-400" /> Alıcı / kiracı</h3>
              <ul className="space-y-3 text-xs text-slate-400">
                {BUYER_SIDE_RATES.map((r) => (
                  <li key={r.type} className="border-b border-white/5 pb-2">
                    <div className="text-slate-200 font-medium">{r.type}</div>
                    <div className="text-blue-300 mt-0.5">{r.target}</div>
                    <div className="text-slate-600 mt-1">{r.note}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-white/5 mb-6">
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
          <Card className="bg-slate-900/50 border-white/5">
            <CardContent className="p-5">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-3"><MessageSquare className="w-5 h-5 text-amber-400" /> SMS akışları</h3>
              <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
                {SMS_FLOWS.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-white/5">
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
        </div>
      </div>
    </div>
  );
}
