import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, XCircle, Trophy, Target, Zap,
  BrainCircuit, Shield, BarChart3, Users, Globe, Clock,
  FileText, Star, AlertTriangle, TrendingUp, Lock, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { feeBadgeLabel } from "@/lib/fees";
import { RoadmapBanner } from "@/components/RoadmapBanner";

export default function CompetitorComparison() {
  const navigate = useNavigate();

  const competitors = [
    {
      name: "sahibinden.com",
      type: "İlan Platformu",
      marketShare: "%68",
      strengths: [
        "Çok büyük kullanıcı tabanı",
        "Sade ilan verme deneyimi",
        "Güçlü marka bilinirliği",
        "Emlakçı dostu arayüz",
        "İlan vitrinleme",
      ],
      weaknesses: [
        "İhale/açık artırma sistemi YOK",
        "AI değerleme YOK",
        "Bölge fiyat endeksi YOK",
        "Sanal tur entegrasyonu sınırlı",
        "Gayrimenkul özel güvenlik katmanı YOK",
        "Findeks entegrasyonu YOK",
        "KVKK odaklı evrak yönetimi YOK",
      ],
      color: "blue",
    },
    {
      name: "Tipik analiz & tahmin siteleri",
      type: "Statik rapor / tek kanallı model",
      marketShare: "—",
      strengths: [
        "Tekil PDF veya ekran tahmini",
        "Temel bölge karşılaştırması",
        "Hızlı ilk izlenim",
      ],
      weaknesses: [
        "Canlı ihale akışı ve teklif yoğunluğu YOK",
        "Teklif + likidite + evrak tek çatıda birleşmez",
        "İhaleal Endeksi gibi çok sinyalli birleşik skor YOK",
        "Satıcı–alıcı güven omurgası YOK",
        "Komisyon ve mahsup şeffaflığı YOK",
        "İlan karşılaştırma ve ihale takvimi YOK",
        "Yatırımcı paneli + ihale senaryosu YOK",
      ],
      color: "emerald",
    },
    {
      name: "emlakjet.com",
      type: "İlan Platformu",
      marketShare: "%8",
      strengths: [
        "Emlakçı odaklı CRM",
        "İlan yayınlama kolaylığı",
        "Portföy yönetimi",
        "Lead yönetimi",
      ],
      weaknesses: [
        "İhale sistemi YOK",
        "AI destekli değerleme YOK",
        "Bölge fiyat endeksi YOK",
        "Finansal entegrasyon YOK",
        "Ekspertiz servisi YOK",
        "Yatırım analizi YOK",
        "AML/KYC uyumu YOK",
      ],
      color: "amber",
    },
    {
      name: "hepsiemlak.com",
      type: "İlan Platformu",
      marketShare: "%5",
      strengths: [
        "Hepsiburada entegrasyonu",
        "Kredi başvurusu",
        "Geniş kategori",
      ],
      weaknesses: [
        "İhale sistemi YOK",
        "AI değerleme YOK",
        "Bölge endeksi YOK",
        "Yatırım skoru YOK",
        "Sanal tur YOK",
        "Ekspertiz raporu YOK",
        "Güvenlik katmanları YOK",
      ],
      color: "rose",
    },
    {
      name: "zingat.com",
      type: "İlan Platformu",
      marketShare: "%3",
      strengths: [
        "Kredi hesaplama",
        "Fiyat endeksi (sınırlı)",
        "Mobil uygulama",
      ],
      weaknesses: [
        "İhale sistemi YOK",
        "AI yatırım analizi YOK",
        "Bölge talep endeksi YOK",
        "Finansal doğrulama YOK",
        "AML/KYC YOK",
        "Ekspertiz servisi YOK",
        "Yatırımcı araçları YOK",
      ],
      color: "violet",
    },
  ];

  const ourAdvantages = [
    {
      icon: <BrainCircuit className="w-5 h-5" />,
      title: "AI destekli ihale ve pazarlama",
      desc: "İhaleal Endeksi, fiyat bandı ve ihale tek akışta; hedef gerçek alıcı–satıcı buluşturma (demoda örnek veri).",
      unique: true,
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Güven ve doğrulama çizgisi",
      desc: "Katılımcılarda Findeks, yetki ve evrak kontrolü, sözleşme paketi (üretim hedefi; altyapı yol haritası).",
      unique: true,
    },
    { icon: <FileText className="w-5 h-5" />, title: "Tam Evrak Yönetimi", desc: "5 kategori, 20+ zorunlu belge, AI OCR doğrulama, KVKK uyumlu", unique: true },
    { icon: <BarChart3 className="w-5 h-5" />, title: "Ekspertiz + İhaleal Endeksi", desc: "SPK uzmanı raporu + yapay zeka fiyat bandı + kira senaryosu tek vitrinde (hedef yol haritası).", unique: true },
    { icon: <Video className="w-5 h-5" />, title: "360° Sanal Tur", desc: "Matterport entegrasyonu ile gayrimenkul sanal gezisi", unique: false },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Komisyon hesaplayıcı",
      desc: `${feeBadgeLabel()} + tapu (fees.ts). Hedef: ilan/doping/reklam ücreti yok; yalnızca komisyon (+ kirada kiraya verenden 1 aylık kira çizgisi).`,
      unique: true,
    },
    { icon: <Users className="w-5 h-5" />, title: "Yatırımcı Dashboard", desc: "Portföy takibi, karşılaştırma, yatırım fırsatları listesi", unique: true },
    { icon: <Clock className="w-5 h-5" />, title: "İhale Takvimi", desc: "Yaklaşan ihaleler, hatırlatmalar, otomatik teklif artırma", unique: true },
    { icon: <Globe className="w-5 h-5" />, title: "İhaleal Endeksi + şehir rehberi", desc: "İl–ilçe bandı, talep yoğunluğu ve ihale akışına bağlı çoklu sinyal; statik rapordan daha gerçekçi karar zemini (demo veri).", unique: true },
    { icon: <Lock className="w-5 h-5" />, title: "Anti-Scraping Koruması", desc: "Bot koruması, veri kazıma önlemi, IP sınırlandırma", unique: true },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="bg-gradient-to-b from-blue-500/5 to-transparent border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6"><ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri</Button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl [background:var(--gradient-cta)] flex items-center justify-center"><Trophy className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-3xl font-bold text-white">Rakip Analizi & Farklarımız</h1>
              <p className="text-slate-400">Türkiye'nin gayrimenkul platformlarıyla kapsamlı karşılaştırma</p>
            </div>
          </div>
          <RoadmapBanner />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        {/* Özet Banner */}
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium mb-1">Emsalsiz Konumumuz</p>
              <p className="text-sm text-slate-400">Türkiye&apos;de <strong className="text-slate-300">hedef ürün vizyonu</strong> olarak AI destekli değerleme + canlı ihale + evrak akışı + güvenlik yol haritasını bir arada sunmayı amaçlayan platform ihaleal.com&apos;dur (rakiplerde ihale modülü yoktur iddiası pazarlama özeti; hukuki bağlayıcılık yoktur).</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium mb-1">Matris hakkında dürüst not</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Yeşil tiklerin bir kısmı <span className="text-slate-300">ürün modülü / arayüz ve yol haritası</span> anlamındadır.
                <span className="text-amber-300/90"> Findeks, e-Devlet, banka API, saatlik canlı veri, bankanın “AI araması”</span> gibi maddeler canlı ortamda yalnızca sözleşme + backend + kurum entegrasyonu ile mümkündür; bu demo sitede gerçek zamanlı API bağlantısı yoktur.
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h3 className="text-lg font-bold text-white mb-3">Rakiplerde olup bu front-end sürümde henüz olmayanlar</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex gap-2"><span className="text-slate-500 shrink-0">•</span><span><strong className="text-slate-300">sahibinden.com:</strong> On yıllık ilan stoğu, kurumsal ödeme ve mesajlaşma ekosistemi, native mobil uygulama ölçeği.</span></li>
              <li className="flex gap-2"><span className="text-slate-500 shrink-0">•</span><span><strong className="text-slate-300">Tipik analiz siteleri:</strong> Çoğunlukla tek rapor veya tek model; canlı ihale, likidite metrikleri ve İhaleal Endeksi’nin çok sinyalli birleşik görünümü yok.</span></li>
              <li className="flex gap-2"><span className="text-slate-500 shrink-0">•</span><span><strong className="text-slate-300">Genel:</strong> 7/24 SOC, anlık kurumsal WAF logları, hukuken bağlayıcı sözleşme seti (avukat onayı şart).</span></li>
            </ul>
          </CardContent>
        </Card>

        {/* Rakipler Tablosu */}
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h3 className="text-lg font-bold text-white mb-4">Rakip Platformlar ve Eksikleri</h3>
            <div className="space-y-4">
              {competitors.map((c) => (
                <div key={c.name} className="p-4 rounded-xl bg-white/[0.03] border border-slate-200/80">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${c.color}-500/10 flex items-center justify-center`}>
                        <Target className={`w-5 h-5 ${c.color === 'blue' ? 'text-blue-400' : c.color === 'emerald' ? 'text-emerald-400' : c.color === 'amber' ? 'text-amber-400' : c.color === 'rose' ? 'text-rose-400' : 'text-violet-400'}`} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white">{c.name}</span>
                        <span className="text-xs text-slate-500 ms-2">{c.type}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">Pazar: {c.marketShare}</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-emerald-400 font-medium mb-2 flex items-center gap-1"><Star className="w-3 h-3" /> Güçlü Yönleri</p>
                      <ul className="space-y-1">
                        {c.strengths.map((s) => (
                          <li key={s} className="flex items-start gap-1.5 text-xs text-slate-400"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-red-400 font-medium mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Eksikleri (Bizde Var)</p>
                      <ul className="space-y-1">
                        {c.weaknesses.map((w) => (
                          <li key={w} className="flex items-start gap-1.5 text-xs text-slate-400"><XCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bizim Avantajlarımız */}
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h3 className="text-lg font-bold text-white mb-4">ihaleal.com Avantajları</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ourAdvantages.map((a) => (
                <div key={a.title} className={`p-3 rounded-xl border ${a.unique ? 'bg-blue-500/5 border-blue-500/10' : 'bg-white/[0.03] border-slate-200/80'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`p-1.5 rounded-lg ${a.unique ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'}`}>{a.icon}</div>
                    <span className="text-sm font-medium text-white">{a.title}</span>
                    {a.unique && <Badge className="bg-amber-500/10 text-amber-400 text-[10px] border-0 ms-auto">Emsalsiz</Badge>}
                  </div>
                  <p className="text-xs text-slate-400">{a.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Özellik Matrisi */}
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5 overflow-x-auto">
            <h3 className="text-lg font-bold text-white mb-4">Özellik Karşılaştırma Matrisi</h3>
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200/80">
                  <th className="text-start py-2 px-3 text-slate-400 font-medium">Özellik</th>
                  <th className="text-center py-2 px-3 text-slate-400 font-medium">ihaleal.com</th>
                  <th className="text-center py-2 px-3 text-slate-400 font-medium">sahibinden</th>
                  <th className="text-center py-2 px-3 text-slate-400 font-medium">Tipik analiz siteleri</th>
                  <th className="text-center py-2 px-3 text-slate-400 font-medium">emlakjet</th>
                  <th className="text-center py-2 px-3 text-slate-400 font-medium">hepsiemlak</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["İhale / Açık Artırma", true, false, false, false, false],
                  ["AI Fiyat Tahmini", true, false, true, false, false],
                  ["İhaleal Endeksi (ihale + bölge)", true, false, false, false, false],
                  ["Yatırım Skoru", true, false, true, false, false],
                  ["Findeks (canlı API)", false, false, false, false, false],
                  ["Ekspertiz Raporu (modül / talep)", true, false, false, false, false],
                  ["360° Sanal tur (Matterport entegrasyonu)", false, false, false, false, false],
                  ["Mortgage Hesaplayıcı", true, false, false, false, true],
                  [`Komisyon Hesaplayıcı (${feeBadgeLabel()})`, true, false, false, false, false],
                  ["AML/KYC süreç tasarımı (modül)", true, false, false, false, false],
                  ["Kurumsal bot / anti-scraping (sunucu)", false, true, false, false, false],
                  ["Yatırımcı Dashboard (UI)", true, false, false, false, false],
                  ["İlan Karşılaştırma", true, false, false, false, false],
                  ["Şehir Rehberi (81 il)", true, false, false, false, false],
                  ["KVKK / evrak metinleri", true, false, false, false, false],
                  ["E-Devlet (canlı API)", false, false, false, false, false],
                  ["SMS / OTP tasarımı", true, false, false, false, false],
                  ["İhale Takvimi (UI)", true, false, false, false, false],
                  ["Mobil native app (Store)", false, true, true, true, true],
                  ["Milyonlarca aktif ilan stoğu", false, true, false, true, true],
                ].map(([feature, us, s, e, ej, h]) => (
                  <tr key={feature as string} className="border-b border-slate-200/80 hover:bg-white/[0.02]">
                    <td className="py-2 px-3 text-slate-300">{feature as string}</td>
                    <td className="py-2 px-3 text-center">{us ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}</td>
                    <td className="py-2 px-3 text-center">{s ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400/40 mx-auto" />}</td>
                    <td className="py-2 px-3 text-center">{e ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400/40 mx-auto" />}</td>
                    <td className="py-2 px-3 text-center">{ej ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400/40 mx-auto" />}</td>
                    <td className="py-2 px-3 text-center">{h ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400/40 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex gap-3 justify-center pt-4">
          <Button onClick={() => navigate("/")} className="[background:var(--gradient-cta)] text-white gap-2"><TrendingUp className="w-4 h-4" /> Ana sayfa — İhaleler</Button>
          <Button onClick={() => navigate("/evraklar")} variant="outline" className="border-slate-200 text-slate-300 hover:text-white gap-2"><FileText className="w-4 h-4" /> Evrakları İncele</Button>
        </div>
      </div>
    </div>
  );
}
