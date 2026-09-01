import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Instagram, Youtube, Video, Target, TrendingUp, Users,
  DollarSign, BarChart3, Play, Calendar, Hash, Globe, Sparkles,
  ChevronRight, Heart, Share2, MessageCircle, Eye, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicAsset } from "@/lib/publicAsset";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FEES } from "@/lib/fees";
import { RoadmapBanner } from "@/components/RoadmapBanner";

export default function AdCampaign() {
  const navigate = useNavigate();

  /** CLOUD K16=B sonrası: ana tanıtım `ihaleal-tanitim.mp4`; reels `public/videos/` dosya adlarıyla eşleşir. */
  const heroStock = "ihaleal-tanitim.mp4";
  const reels = [
    { id: 1, file: "ihaleal-tanitim.mp4", title: "Platform Tanıtımı", duration: "5s", goal: "Bilinirlik", copy: "Yapay zeka destekli gayrimenkul platformu: ihale veya kapalı teklif, güvenli eşleşme. Yalnızca komisyon #ihaleal #gayrimenkul #yapayzeka" },
    { id: 2, file: "reels-02-ai-analiz.mp4", title: "AI Analiz", duration: "5s", goal: "Eğitim", copy: "Fiyat bandı, bölge verisi, yatırım skoru; değerleme ve Findeks çizgisi (hedef) #ai #gayrimenkul #yatırım" },
    { id: 3, file: "reels-03-ihale.mp4", title: "İhale Süreci", duration: "5s", goal: "Dönüşüm", copy: "Teklif ver, kazan, tapunu al! Şeffaf ve güvenli ihale deneyimi #ihale #açıkartırma #emlak" },
    { id: 4, file: "reels-04-güvenlik.mp4", title: "Güvenlik", duration: "5s", goal: "Güven", copy: "Findeks, SMS, Banka API, AML/KYC. Sahibinden kadar güvenli #güvenlik #findeks #banka" },
    { id: 5, file: "reels-05-ekspertiz.mp4", title: "Ekspertiz", duration: "5s", goal: "Hizmet", copy: "SPK lisanslı değerleme uzmanlarından ekspertiz raporu #ekspertiz #değerleme #spk" },
    { id: 6, file: "reels-06-mobil.mp4", title: "Mobil Deneyim", duration: "5s", goal: "Kullanım", copy: "Telefonundan ihalelere katıl, teklif ver, AI analiz yap #mobil #app #telefon" },
    { id: 7, file: "reels-07-yatırımci.mp4", title: "Yatırımcılar", duration: "5s", goal: "Niche", copy: "Portföyünü takip et, karşılaştır, en iyi fırsatları yakala #yatırım #portföy #kira" },
    { id: 8, file: "reels-08-ilkev.mp4", title: "İlk Ev", duration: "5s", goal: "Emotional", copy: "Hayalindeki eve ihale ile sahip ol! Mortgage + ekspertiz + güvenlik #ilkev #ev #mortgage" },
    { id: 9, file: "reels-09-emlakçı.mp4", title: "Emlakçılar", duration: "5s", goal: "B2B", copy: `Mülklerini ihale ile hızlı ve değerinde sat! %${(FEES.sellerCommissionRate * 100).toFixed(0)} komisyon (fees.ts) #emlakçı #ajans #komisyon` },
    { id: 10, file: "reels-10-reklam.mp4", title: "Reklam Jingle", duration: "5s", goal: "Viral", copy: "ihaleal.com - Yapay Zeka Destekli İhale Platformu #ihaleal #reklam #viral" },
    { id: 11, file: "reels-01-tanitim.mp4", title: "İhale (A/B varyant)", duration: "5s", goal: "Meta test", copy: "Aynı mesaj farklı kanca — reklam panelinde A/B test için ikinci kreatif #ihale #abtest" },
    { id: 12, file: "reels-02-ai-analiz.mp4", title: "AI Analiz (A/B varyant)", duration: "5s", goal: "Meta test", copy: "İhaleal Endeksi + yatırım skoru vurgusu — YouTube Shorts’ta ikinci başlık #ai #yatırım" },
  ];

  const strategy = [
    { platform: "Instagram Reels", budget: "₺15.000/ay", audience: "25-45 yaş, İstanbul/Ankara/İzmir, ilgi: emlak, yatırım", goal: "Bilinirlik + Etkileşim", format: "5-12 sn videolar, günlük 2 paylaşım" },
    { platform: "Instagram Stories", budget: "₺8.000/ay", audience: "Aktif hikaye izleyiciler, geri dönüşüm hedefi", goal: "Swipe-up trafik", format: "Anket, quiz, swipe-up link, countdown sticker" },
    { platform: "YouTube Shorts", budget: "₺12.000/ay", audience: "Geniş demografik, arama odaklı", goal: "Eğitim + SEO", format: "5-12 sn, alt yazılı, SEO başlıklar" },
    { platform: "YouTube TrueView", budget: "₺20.000/ay", audience: "Gayrimenkul araması yapanlar, skip edilebilir", goal: "Dönüşüm", format: "15-30 sn pre-roll, CTA butonlu" },
    { platform: "LinkedIn Ads", budget: "₺10.000/ay", audience: "Kurumsal, yatırımcı, emlakçı, 30-55 yaş", goal: "B2B Lead", format: "Sponsorlu içerik, InMail, carousel" },
    { platform: "Google Ads (Search)", budget: "₺25.000/ay", audience: "Aktif arama: 'gayrimenkul ihale', 'emlak açık artırma'", goal: "Yüksek Intent Dönüşüm", format: "Responsive search ads, remarketing" },
    { platform: "TikTok", budget: "₺10.000/ay", audience: "Genç yatırımcılar, 22-35 yaş, trend takipçileri", goal: "Viral bilinirlik", format: "Trend müzik + property transition, influencer" },
    { platform: "Meta Retargeting", budget: "₺12.000/ay", audience: "Site ziyaretçileri, sepet bırakanlar, teklif vermeyenler", goal: "Dönüşüm artırma", format: "Dinamik ürün reklamları, lookalike" },
  ];

  const calendar = [
    { week: "Hafta 1", focus: "Bilinirlik", action: "Reels 1-3 yayınla, Instagram Stories anketi, Google Search kampanyası başlat" },
    { week: "Hafta 2", focus: "Eğitim", action: "Reels 4-6 yayınla, YouTube Shorts SEO optimizasyonu, blog içerikleri" },
    { week: "Hafta 3", focus: "Dönüşüm", action: "Reels 7-8 yayınla, LinkedIn B2B kampanyası, retargeting pixel aktif" },
    { week: "Hafta 4", focus: "Viral & Tekrar", action: "Reels 9-10 yayınla, TikTok influencer, en iyi performanslı içerik boost" },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="bg-gradient-to-b from-pink-500/5 to-transparent border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6"><ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri</Button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center"><Target className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-3xl font-normal text-white">Reklam Kampanya Planı</h1>
              <p className="text-slate-400">Sosyal medya, dijital reklam ve influencer stratejisi</p>
            </div>
          </div>
          <RoadmapBanner />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        {/* Bütçe Özeti */}
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h3 className="text-lg font-normal text-white mb-4">Aylık Reklam Bütçesi Özeti</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-[20px] bg-white/[0.03] border border-slate-200/80 text-center">
                <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                <div className="text-lg font-normal text-white">₺112.000</div>
                <div className="text-xs text-slate-500">Toplam Aylık</div>
              </div>
              <div className="p-3 rounded-[20px] bg-white/[0.03] border border-slate-200/80 text-center">
                <Eye className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
                <div className="text-lg font-normal text-white">2.5M+</div>
                <div className="text-xs text-slate-500">Tahmini Erişim</div>
              </div>
              <div className="p-3 rounded-[20px] bg-white/[0.03] border border-slate-200/80 text-center">
                <Users className="w-5 h-5 text-violet-400 mx-auto mb-1.5" />
                <div className="text-lg font-normal text-white">15.000+</div>
                <div className="text-xs text-slate-500">Tahmini Dönüşüm</div>
              </div>
              <div className="p-3 rounded-[20px] bg-white/[0.03] border border-slate-200/80 text-center">
                <TrendingUp className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                <div className="text-lg font-normal text-white">%1.35</div>
                <div className="text-xs text-slate-500">Tahmini CTR</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Stratejisi */}
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h3 className="text-lg font-normal text-white mb-4">Platform Bazlı Strateji</h3>
            <div className="space-y-3">
              {strategy.map((s) => (
                <div key={s.platform} className="p-3 rounded-[20px] bg-white/[0.03] border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-normal text-white">{s.platform}</span>
                    <Badge variant="outline" className="border-blue-500/20 text-blue-400 text-[10px]">{s.budget}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">Hedef Kitle: {s.audience}</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px] border-0">{s.goal}</Badge>
                    <span className="text-[10px] text-slate-500">{s.format}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 10 Video Reels */}
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h3 className="text-lg font-normal text-white flex items-center gap-2 mb-4"><Video className="w-5 h-5 text-pink-400" /> 12 Hazır Kreatif (10 özgün + 2 A/B varyant, Reels / Shorts)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {reels.map((r) => (
                <div key={r.id} className="p-3 rounded-[20px] bg-white/[0.03] border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-normal text-white">{r.id}. {r.title}</span>
                    <Badge variant="outline" className="border-pink-500/20 text-pink-400 text-[10px]">{r.duration}</Badge>
                  </div>
                  <div className="protected-media">
                    <video src={publicAsset(`videos/${r.file}`)} className="w-full rounded-[10px] mb-2" controls playsInline preload="metadata" />
                  </div>
                  <div className="flex items-center gap-1.5 mb-1"><Hash className="w-3 h-3 text-slate-500" /><span className="text-[10px] text-slate-500">{r.goal}</span></div>
                  <p className="text-xs text-slate-400">{r.copy}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* YouTube 60 sn ana film (storyboard — tek dosyada birleştirme post-prod) */}
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h3 className="text-lg font-normal text-white flex items-center gap-2 mb-3"><Youtube className="w-5 h-5 text-red-500" /> YouTube / Meta — 60 saniyelik ana tanıtım (plan)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Kaynak görüntü: <code className="text-slate-400">ihaleal-tanitim.mp4</code> (`public/videos/`). 60 sn kesim için ek kreatifler (K6) sonrası birleştirilebilir.
            </p>
            <div className="rounded-[20px] overflow-hidden border border-slate-200 bg-black/40 protected-media">
              <video src={publicAsset(`videos/${heroStock}`)} className="w-full max-h-[220px] object-cover" controls playsInline preload="metadata" />
            </div>
            <p className="text-[11px] text-slate-600 mt-2">Dosyayı Windows’ta açamıyorsanız VLC kullanın veya <code className="text-slate-500">CALISTIR.bat</code> ile siteyi çalıştırıp /reklam sayfasından oynatın.</p>
          </CardContent>
        </Card>

        {/* 4 Haftalık Takvim */}
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h3 className="text-lg font-normal text-white flex items-center gap-2 mb-4"><Calendar className="w-5 h-5 text-amber-400" /> 4 Haftalık İçerik Takvimi</h3>
            <div className="space-y-3">
              {calendar.map((c) => (
                <div key={c.week} className="flex items-start gap-3 p-3 rounded-[20px] bg-white/[0.03] border border-slate-200/80">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 text-xs font-normal text-amber-400">{c.week.replace("Hafta ", "")}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-normal text-white">{c.week}</span>
                      <Badge className="bg-blue-500/10 text-blue-400 text-[10px] border-0">{c.focus}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">{c.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hashtag & SEO */}
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h3 className="text-lg font-normal text-white flex items-center gap-2 mb-4"><Hash className="w-5 h-5 text-sky-400" /> Hashtag ve Anahtar Kelime Stratejisi</h3>
            <div className="flex flex-wrap gap-2">
              {["#ihaleal", "#gayrimenkul", "#emlak", "#yapayzeka", "#ai", "#yatırım", "#konut", "#villa", "#ofis", "#arsa", "#ihale", "#açıkartırma", "#fiyatAnalizi", "#sahibinden", "#hepsiemlak", "#emlakjet", "#mortgage", "#kredii", "#tapu", "#istanbul", "#ankara", "#izmir", "#bodrum", "#antalya", "#fırsat", "#lüks", "#prestij", "#emlakçı", "#ajans", "#portföy", "#kira", "#getiri", "#ekspertiz", "#değerleme", "#spk", "#findeks", "#güvenlik", "#teklif", "#kazan", "#ilk_ev"].map((tag) => (
                <Badge key={tag} variant="outline" className="border-slate-600 text-slate-400 text-xs">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center pt-4">
          <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white gap-2"><Globe className="w-4 h-4" /> Siteye Dön</Button>
        </div>
      </div>
    </div>
  );
}
