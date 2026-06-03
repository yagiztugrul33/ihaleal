import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Gavel, ShieldCheck, CreditCard, FileText, Mail, MessageSquare, Clock, Users, BarChart3, TrendingUp, Calculator, Heart, Search, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { formatBidBondPercent, FEES } from "@/lib/fees";
import { REAL_ESTATE_GUIDES } from "@/data/realEstateGuides";

const FAQS = [
  {
    category: "Genel",
    items: [
      { q: "ihaleal.com nedir?", a: "ihaleal.com, Türkiye icin gayrimenkul ilani ve ihale deneyimi sunan platformdur. Yapay zeka destekli degerleme, şeffaf teklif cizgisi ve güvenli odeme hedefi ile kullanicilara uygun firsatlar icin tek adres olarak konumlanir." },
      { q: "Nasil uye olabilirim?", a: "Ana sayfadan Kayit Ol butonuna tiklayarak, ad, soyad, e-posta ve telefon bilgilerinizle ucretsiz uye olabilirsiniz. Uyeliginizi e-posta adresinize gelen link ile aktive edebilirsiniz." },
      { q: "ihaleal.com güvenli mi?", a: "Evet. Teklif ve iletisim cizgisi sifreli kanallar uzerinden tasarlanmistir. Kisisel veriler KVKK odakli saklanir; baglanti SSL ile korunur. Odeme ve PCI iddialari uretim matrisinde netlestirilir ( simdilik demo)." },
    ]
  },
  {
    category: "Teklif Verme",
    items: [
      { q: "Nasil teklif verebilirim?", a: "Ilan detay sayfasinda Teklif Ver butonuna tiklayarak, minimum artis miktari kadar veya uzerinde bir tutar girebilirsiniz. 10.000 TRY, 50.000 TRY, 100.000 TRY, 250.000 TRY ve 500.000 TRY hizli artis butonlarini kullanabilirsiniz." },
      { q: "Teklifim geri alinabilir mi?", a: "Hayir, verilen teklifler baglayicidir ve geri alinamaz. Lutfen teklif vermeden once ilan detaylarini ve AI analiz raporunu dikkatle inceleyin." },
      { q: "En yuksek teklif nasil belirlenir?", a: "Ihale bitis saatinde en yuksek teklifi veren kazanan ilan edilir. Son dakika teklifleri icin otomatik 5 dakika uzatma uygulanir." },
    ]
  },
  {
    category: "Odeme ve Sozlesme",
    items: [
      {
        q: "Kazandigim ihalede odeme nasil yapilir?",
        a: `Ihaleyi kazandiginizda ${formatBidBondPercent()} kapora odemesi yapmaniz gerekir (fees.ts). Kalan tutar ${FEES.refundWindowDays} gun icinde tamamlanmalidir (taslak). Tum odemeler escrow hesap uzerinden güvenle gerceklestirilir.`,
      },
      { q: "Kredi kullanabilir miyim?", a: "Evet, tum ilanlarimiz banka kredisine uygundur. Mortgage hesaplayicimiz ile aylik taksit tutarlarinizi onceden hesaplayabilirsiniz." },
      { q: "Tapu devri nasil gerceklesir?", a: "Ihaleyi kazanan alici, odemelerin tamamlanmasinin ardindan ilgili tapu mudurlugunde resmi devretme islemi gerceklestirir. Platformumuz hukuki sureclerde size rehberlik saglar." },
    ]
  },
  {
    category: "Yapay Zeka ve Analiz",
    items: [
      { q: "AI degerleme nasil calisiyor?", a: "Yapay zeka modelimiz, milyonlarca gercek satis verisi, bolge istatistikleri, piyasa trendleri ve gayrimenkul ozelliklerini analiz ederek fiyat tahmini ve yatırım skoru uretir." },
      { q: "Fiyat tahminleri ne kadar dogru?", a: "AI tahminlerimiz gecmis verilere gore %85-90 dogruluk oranina sahiptir. Ancak gayrimenkul piyasasi dalgalanmalara aciktir ve tahminler kesinlik icermez." },
      { q: "Kira getirisi nasil hesaplanir?", a: "Bolgedeki ortalama kira bedelleri, doluluk oranlari ve isletme giderleri analiz edilerek brut ve net kira getirisi hesaplanir. Getiri simulatoreumuz ile kendi parametrelerinizi test edebilirsiniz." },
    ]
  },
];

const QUICK_LINKS = [
  { icon: <Gavel className="w-5 h-5" />, label: "Ihaleler", desc: "Tum aktif ihaleleri goruntuleyin", color: "text-blue-400", path: "/" },
  { icon: <BarChart3 className="w-5 h-5" />, label: "AI Analiz", desc: "Piyasa istatistikleri ve ongoruler", color: "text-violet-400", path: "/analiz" },
  { icon: <Calculator className="w-5 h-5" />, label: "Mortgage", desc: "Kredi hesaplayici ve planlama", color: "text-amber-400", path: "/mortgage" },
  { icon: <TrendingUp className="w-5 h-5" />, label: "Firsatlar", desc: "AI secilmis yatırım firsatlari", color: "text-emerald-400", path: "/analiz" },
];

export default function Guide() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div ref={ref} className="min-h-screen pt-24 pb-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-2">
            <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-blue-400" />
            Yardim Merkezi ve Rehber
          </h1>
          <p className="text-slate-400 mt-2">Sikca sorulan sorular ve platform kullanim rehberi.</p>
        </div>

        {/* Gayrimenkul rehberleri */}
        <div className={`mb-10 transition-all duration-700 delay-75 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-lg font-bold text-white mb-4">Gayrimenkul rehberleri</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {REAL_ESTATE_GUIDES.map((g) => (
              <Card
                key={g.slug}
                className="bg-slate-900/50 border-slate-200/80 p-4 hover:border-blue-500/30 cursor-pointer transition-all"
                onClick={() => navigate(`/rehber/${g.slug}`)}
              >
                <div className="text-sm font-semibold text-white">{g.title}</div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-2">{g.summary}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {QUICK_LINKS.map((link) => (
            <Card key={link.label} className="bg-slate-900/50 border-slate-200/80 p-4 hover:border-slate-200 cursor-pointer transition-all hover:-translate-y-0.5" onClick={() => navigate(link.path)}>
              <div className={`${link.color} mb-2`}>{link.icon}</div>
              <div className="text-sm font-semibold text-white">{link.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{link.desc}</div>
            </Card>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className={`space-y-6 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {FAQS.map((section) => (
            <div key={section.category}>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {section.category === "Genel" && <Globe className="w-5 h-5 text-blue-400" />}
                {section.category === "Teklif Verme" && <Gavel className="w-5 h-5 text-orange-400" />}
                {section.category === "Odeme ve Sozlesme" && <CreditCard className="w-5 h-5 text-emerald-400" />}
                {section.category === "Yapay Zeka ve Analiz" && <Star className="w-5 h-5 text-violet-400" />}
                {section.category}
              </h2>
              <div className="space-y-2">
                {section.items.map((faq, idx) => {
                  const key = `${section.category}-${idx}`;
                  const isOpen = openFaq === key;
                  return (
                    <div key={key} className="rounded-xl border border-slate-200/80 overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : key)}
                        className={`w-full flex items-center justify-between p-4 text-start transition-colors ${isOpen ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                      >
                        <span className="text-sm font-medium text-white">{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-sm text-slate-400 leading-relaxed border-t border-slate-200/80 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Banner */}
        <div className={`mt-10 p-6 rounded-2xl bg-slate-900/50 border border-slate-200/80 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Cevabini bulamadiniz mi?</h3>
              <p className="text-sm text-slate-400">Uzman ekibimiz size yardimci olmaktan memnuniyet duyar.</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="mailto:destek@ihaleal.com" className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2">
                <Mail className="w-4 h-4" /> E-posta
              </a>
              <a href="tel:+902121234567" className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-sm text-white font-semibold transition-all flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Bize Ulasin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
