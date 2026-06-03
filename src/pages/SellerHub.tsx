import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Store, Gavel, GitBranch, FileSignature, Eye,
  Coins, Scale, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SELLER_MODES, PRICING_COMPARISON } from "@/data/sellerHubData";

const modeIcon: Record<string, ReactNode> = {
  browse: <Eye className="w-5 h-5" />,
  listing_only: <Store className="w-5 h-5" />,
  auction_only: <Gavel className="w-5 h-5" />,
  listing_then_auction: <GitBranch className="w-5 h-5" />,
  full_mandate: <FileSignature className="w-5 h-5" />,
};

export default function SellerHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6">
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Ana sayfa
        </Button>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Satıcı & alıcı modları</h1>
          <p className="text-slate-400 text-sm max-w-3xl">
            Sahibinden benzeri ilan, doğrudan ihale veya ikisi bir arada için <strong className="text-slate-200">basit kurgu</strong> aşağıdadır.
            e-Devlet yetkisi, Findeks ve banka doğrulaması <strong className="text-amber-400">canlı entegrasyon + avukat</strong> ile üretimde tamamlanır; bu sayfa ürün ve evrak rehberidir.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/15 text-sm text-slate-400 mb-6 leading-relaxed">
          <strong className="text-teal-200">Belge çizgisi:</strong> İlan oluştururken «Raporlar ve ekspertiz» kartında bölge fiyat raporu (PDF adı, demo), SPK ekspertiz PDF’i ve resmi belge beyanı —{" "}
          <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/ihale-ac")}>İlan aç</button>{" "}
          formu ile aynı üretim hedefi.
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button size="sm" variant="outline" className="border-teal-500/30 text-teal-200" onClick={() => navigate("/onboarding/akis")}>
            Akış seçimi (demo)
          </Button>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 mb-10">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Harici doğrulama veya AI ile yapılan kontroller tamamlandı mı?</strong> Evet: rakip matrisinde abartılı “API var” tikleri düzeltildi, kırık rota giderildi,
            güvenlik sayfasına demo uyarısı eklendi, video yolları <code className="text-slate-500">base: &apos;./&apos;</code> ile düzeltildi, hukuki iddialar yumuşatıldı.
            Hâlâ <strong className="text-amber-200">mümkün olmayan</strong> kısım: gerçek e-Devlet, Findeks, banka, FCM, yayın, blockchain — sunucu ve sözleşme olmadan kod tek başına yetmez.
          </p>
        </div>

        <div className="space-y-5 mb-14">
          {SELLER_MODES.map((m) => (
            <Card key={m.id} className="bg-slate-900/50 border-slate-200/80 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">{modeIcon[m.id]}</div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{m.title}</h2>
                      <p className="text-xs text-slate-500">{m.subtitle}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-teal-500/30 text-teal-300 text-[10px]">
                    UI + süreç taslağı
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mb-4">{m.uiSummary}</p>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium mb-2 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Adımlar</p>
                    <ul className="space-y-1.5 text-slate-400">
                      {m.steps.map((s) => (
                        <li key={s} className="flex gap-2"><span className="text-slate-600">•</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium mb-2">Evrak özeti</p>
                    <ul className="space-y-1.5 text-slate-400">
                      {m.documents.map((d) => (
                        <li key={d} className="flex gap-2"><span className="text-slate-600">•</span>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-4 border-t border-slate-200/80 pt-3">{m.legalNote}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-slate-900/50 border-emerald-500/15 mb-10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Gelir kalemleri (Sahibinden’e göre ucuz hedef — taslak)</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">{PRICING_COMPARISON.disclaimer}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="border-b border-slate-200 text-start text-slate-500 text-xs">
                    <th className="py-2 pe-3">Kalem</th>
                    <th className="py-2 pe-3 text-emerald-400">ihaleal (hedef)</th>
                    <th className="py-2 pe-3">Kıyas notu</th>
                    <th className="py-2">İş notu</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICING_COMPARISON.rows.map((r) => (
                    <tr key={r.label} className="border-b border-slate-200/80 text-slate-300">
                      <td className="py-3 pe-3 text-white font-medium">{r.label}</td>
                      <td className="py-3 pe-3 text-emerald-300">{r.ihaleal}</td>
                      <td className="py-3 pe-3 text-slate-500 text-xs">{r.sahibinden}</td>
                      <td className="py-3 text-xs text-slate-500">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="w-8 h-8 text-violet-400 shrink-0" />
              <div>
                <h3 className="text-white font-semibold">Hukuki şartname &amp; kurumsal ihale metni</h3>
                <p className="text-xs text-slate-500 mt-1">/ihale-kosullari ve /evraklar sayfaları — yayın öncesi baro revizyonu zorunlu.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="border-white/15 text-slate-200" onClick={() => navigate("/ihale-kosullari")}>
                İhale koşulları
              </Button>
              <Button size="sm" variant="outline" className="border-white/15 text-slate-200" onClick={() => navigate("/evraklar")}>
                Evrak listesi
              </Button>
              <Button size="sm" variant="outline" className="border-white/15 text-slate-200" onClick={() => navigate("/yasal-cerceve")}>
                Yasal çerçeve
              </Button>
              <Button size="sm" variant="outline" className="border-white/15 text-slate-200" onClick={() => navigate("/canliya-hazirlik")}>
                Canlıya hazırlık
              </Button>
              <Button size="sm" variant="outline" className="border-white/15 text-slate-200" onClick={() => navigate("/komisyon-modeli")}>
                Komisyon modeli
              </Button>
              <Button size="sm" variant="outline" className="border-white/15 text-slate-200" onClick={() => navigate("/veri-ve-endeks")}>
                İhaleal Endeksi
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-teal-400 text-white" onClick={() => navigate("/ihale-ac")}>
                İhale aç
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
