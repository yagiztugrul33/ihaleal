import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Gavel, ShieldCheck, CreditCard, FileText, Mail, MessageSquare, Clock, Users, BarChart3, TrendingUp, Calculator, Heart, Search, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { formatBidBondPercent, FEES } from "@/lib/fees";

const FAQS = [
  {
    category: "Genel",
    items: [
      { q: "ihaleal.com nedir?", a: "ihaleal.com, Türkiye için gayrimenkul ilanı ve ihale deneyimi sunan platformdur. Yapay zeka destekli değerleme, şeffaf teklif çizgisi ve güvenli ödeme hedefi ile kullanıcılara uygun fırsatlar için tek adres olarak konumlanır." },
      { q: "Nasıl üye olabilirim?", a: "Ana sayfadan Kayıt Ol butonuna tıklayarak, ad, soyad, e-posta ve telefon bilgilerinizle ücretsiz üye olabilirsiniz. Üyeliğinizi e-posta adresinize gelen link ile aktive edebilirsiniz." },
      { q: "ihaleal.com güvenli mi?", a: "Teklif ve iletişim hatları şifreli bağlantı üzerinden yürütülür; kayıtlar denetlenebilir işlem günlüğü ile izlenir. Kişisel veri süreçleri KVKK yükümlülükleriyle uyumlu biçimde yönetilir. Canlıya geçişte operasyonel güvenlik kontrolleri ve erişim katmanları kademeli olarak devreye alınır." },
    ]
  },
  {
    category: "Teklif Verme",
    items: [
      { q: "Nasıl teklif verebilirim?", a: "İlan detay sayfasında Teklif Ver butonuna tıklayarak, minimum artış miktarı kadar veya üzerinde bir tutar girebilirsiniz. 10.000 TRY, 50.000 TRY, 100.000 TRY, 250.000 TRY ve 500.000 TRY hızlı artış butonlarını kullanabilirsiniz." },
      { q: "Teklifim geri alınabilir mi?", a: "Hayır, verilen teklifler bağlayıcıdır ve geri alınamaz. Lütfen teklif vermeden önce ilan detaylarını ve AI analiz raporunu dikkatle inceleyin." },
      { q: "En yüksek teklif nasıl belirlenir?", a: "İhale bitiş saatinde en yüksek teklifi veren kazanan ilan edilir. Son dakika teklifleri için otomatik 5 dakika uzatma uygulanır." },
    ]
  },
  {
    category: "Ödeme ve Sözleşme",
    items: [
      {
        q: "Kazandığım ihalede ödeme nasıl yapılır?",
        a: `İhaleyi kazanan alıcı için kapora oranı ${formatBidBondPercent()} olarak uygulanır. Kalan tutar ${FEES.refundWindowDays} gün içinde sözleşme akışına göre tamamlanır. Ödeme süreçleri, ilan koşulları ve yürürlükteki hukuki çerçeve ile birlikte ilerletilir.`,
      },
      { q: "Kredi kullanabilir miyim?", a: "Evet, tüm ilanlarımız banka kredisine uygundur. Mortgage hesaplayıcımız ile aylık taksit tutarlarınızı önceden hesaplayabilirsiniz." },
      { q: "Tapu devri nasıl gerçekleşir?", a: "İhaleyi kazanan alıcı, ödemelerin tamamlanmasının ardından ilgili tapu müdürlüğünde resmi devir işlemini gerçekleştirir. Platformumuz hukuki süreçlerde size rehberlik sağlar." },
    ]
  },
  {
    category: "Yapay Zeka ve Analiz",
    items: [
      { q: "AI değerleme nasıl çalışıyor?", a: "Yapay zeka modelimiz, milyonlarca gerçek satış verisi, bölge istatistikleri, piyasa trendleri ve gayrimenkul özelliklerini analiz ederek fiyat tahmini ve yatırım skoru üretir." },
      { q: "Fiyat tahminleri ne kadar doğru?", a: "AI tahminlerimiz geçmiş verilere göre %85-90 doğruluk oranına sahiptir. Ancak gayrimenkul piyasası dalgalanmalara açıktır ve tahminler kesinlik içermez." },
      { q: "Kira getirisi nasıl hesaplanır?", a: "Bölgedeki ortalama kira bedelleri, doluluk oranları ve işletme giderleri analiz edilerek brüt ve net kira getirisi hesaplanır. Getiri simülatörümüz ile kendi parametrelerinizi test edebilirsiniz." },
    ]
  },
];

const QUICK_LINKS = [
  { icon: <Gavel className="w-5 h-5" />, label: "İhaleler", desc: "Tüm aktif ihaleleri görüntüleyin", color: "text-blue-400", path: "/ihaleler" },
  { icon: <BarChart3 className="w-5 h-5" />, label: "AI Analiz", desc: "Piyasa istatistikleri ve öngörüler", color: "text-violet-400", path: "/analiz" },
  { icon: <Calculator className="w-5 h-5" />, label: "Mortgage", desc: "Kredi hesaplayıcı ve planlama", color: "text-amber-400", path: "/mortgage" },
  { icon: <TrendingUp className="w-5 h-5" />, label: "Fırsatlar", desc: "AI seçilmiş yatırım fırsatları", color: "text-emerald-400", path: "/analiz" },
];

export default function Guide() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div ref={ref} className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-2 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Geri
          </Button>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground md:text-4xl">
            <HelpCircle className="w-8 h-8 text-blue-400" />
            Yardım Merkezi ve Rehber
          </h1>
          <p className="mt-2 text-muted-foreground">Sıkça sorulan sorular ve platform kullanım rehberi.</p>
        </div>

        {/* Quick Links */}
        <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {QUICK_LINKS.map((link) => (
            <Card key={link.label} className="cursor-pointer border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30" onClick={() => navigate(link.path)}>
              <div className={`${link.color} mb-2`}>{link.icon}</div>
              <div className="text-sm font-semibold text-foreground">{link.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{link.desc}</div>
            </Card>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className={`space-y-6 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {FAQS.map((section) => (
            <div key={section.category}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                {section.category === "Genel" && <Globe className="w-5 h-5 text-blue-400" />}
                {section.category === "Teklif Verme" && <Gavel className="w-5 h-5 text-orange-400" />}
                {section.category === "Ödeme ve Sözleşme" && <CreditCard className="w-5 h-5 text-emerald-400" />}
                {section.category === "Yapay Zeka ve Analiz" && <Star className="w-5 h-5 text-violet-400" />}
                {section.category}
              </h2>
              <div className="space-y-2">
                {section.items.map((faq, idx) => {
                  const key = `${section.category}-${idx}`;
                  const isOpen = openFaq === key;
                  return (
                    <div key={key} className="overflow-hidden rounded-xl border border-border">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : key)}
                        className={`w-full p-4 text-left transition-colors ${isOpen ? "bg-secondary/60" : "hover:bg-secondary/40"} flex items-center justify-between`}
                      >
                        <span className="text-sm font-medium text-foreground">{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                      </button>
                      {isOpen && (
                        <div className="border-t border-border px-4 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">
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
        <div className={`mt-10 rounded-2xl border border-border bg-card p-6 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="mb-1 text-lg font-bold text-foreground">Cevabini bulamadiniz mi?</h3>
              <p className="text-sm text-muted-foreground">Uzman ekibimiz size yardimci olmaktan memnuniyet duyar.</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="mailto:destek@ihaleal.com" className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground transition-all hover:bg-secondary/80 hover:text-foreground">
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
