import { useNavigate } from "react-router-dom";
import { Gavel, MapPin, Phone, Mail, Clock, BarChart3, GitCompare, ArrowUpRight, Calculator, Heart, Shield, FileText, HelpCircle, Users, Building2, Handshake, TrendingUp, Navigation, Trophy, Database, Target } from "lucide-react";
import { DemoDataCornerBadge } from "@/components/DemoDataCornerBadge";
import { isDemoData } from "@/lib/dataStrategy";

export function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-[#070c18] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Gavel className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ihaleal.com</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Turkiye'nin en guvenli gayrimenkul ihale platformu. AI destekli degerleme, seffaf surec, hizli satis.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-400">+90 212 123 45 67</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-400">info@ihaleal.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-400">Istanbul, Turkiye</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-400">09:00 - 18:00 (Hafta ici)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              <li><button onClick={() => navigate("/ihaleler")} className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> Ihaleler</button></li>
              <li><button onClick={() => navigate("/analiz")} className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5" /> AI Analiz</button></li>
              <li><button onClick={() => navigate("/karsilastir")} className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"><GitCompare className="w-3.5 h-3.5" /> Karsilastir</button></li>
              <li><button onClick={() => navigate("/mortgage")} className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"><Calculator className="w-3.5 h-3.5" /> Mortgage</button></li>
              <li><button onClick={() => navigate("/favoriler")} className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"><Heart className="w-3.5 h-3.5" /> Favoriler</button></li>
              <li><button onClick={() => navigate("/giris?profil=emlakci")} className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Emlakçı girişi</button></li>
              <li><button onClick={() => navigate("/emlakci-ortaklik")} className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2"><Handshake className="w-3.5 h-3.5" /> Emlakçı ortaklığı</button></li>
              <li><button onClick={() => navigate("/yasal/agency-contract")} className="text-sm text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> agency_contract (taslak)</button></li>
            </ul>
          </div>

          {/* Tools */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Araclar</h4>
            <ul className="space-y-2.5">
              <li className="relative" data-demo={isDemoData("footerNavEstimate") ? "true" : undefined}>
                {isDemoData("footerNavEstimate") ? <DemoDataCornerBadge /> : null}
                <button onClick={() => navigate("/analiz")} className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> Fiyat Tahmini</button>
              </li>
              <li><button onClick={() => navigate("/mortgage")} className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2"><Calculator className="w-3.5 h-3.5" /> Kredi Hesaplayici</button></li>
              <li><button onClick={() => navigate("/karsilastir")} className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2"><GitCompare className="w-3.5 h-3.5" /> Ilan Karsilastirma</button></li>
              <li><button onClick={() => navigate("/sehirler")} className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2"><Navigation className="w-3.5 h-3.5" /> Sehir Rehberi</button></li>
              <li><button onClick={() => navigate("/rehber")} className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5" /> Yardim</button></li>
              <li><button onClick={() => navigate("/araclar/vergi-simulator")} className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2"><Calculator className="w-3.5 h-3.5" /> Vergi simülatörü</button></li>
              <li><button onClick={() => navigate("/araclar/finans-uyumluluk")} className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Finans / uyumluluk</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Kurumsal & Hukuki</h4>
            <ul className="space-y-2.5">
              <li><button onClick={() => navigate("/karsilastir-rakipler")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Trophy className="w-3.5 h-3.5" /> Rakip Analizi</button></li>
              <li><button onClick={() => navigate("/ihale-kosullari")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Gavel className="w-3.5 h-3.5" /> Ihale Kosullari & Komisyon</button></li>
              <li><button onClick={() => navigate("/evraklar")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Katilim Evraklari</button></li>
              <li><button onClick={() => navigate("/kvkk")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Shield className="w-3.5 h-3.5" /> KVKK Aydinlatma Metni</button></li>
              <li><button onClick={() => navigate("/kullanim-kosullari")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Kullanım Koşulları</button></li>
              <li><button onClick={() => navigate("/gizlilik")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Shield className="w-3.5 h-3.5" /> Gizlilik Politikasi</button></li>
              <li><button onClick={() => navigate("/cerez-politikasi")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Cerez Politikasi</button></li>
              <li><button onClick={() => navigate("/mesafeli-satis-sozlesmesi")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Mesafeli Satış Sözleşmesi</button></li>
              <li><button onClick={() => navigate("/iade-iptal")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> İade ve İptal</button></li>
              <li><button onClick={() => navigate("/aydinlatma-metni")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Aydınlatma Metni</button></li>
              <li><button onClick={() => navigate("/iletisim")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Mail className="w-3.5 h-3.5" /> İletişim</button></li>
              <li><button onClick={() => navigate("/hakkimizda")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Users className="w-3.5 h-3.5" /> Hakkımızda</button></li>
              <li><button onClick={() => navigate("/sss")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><HelpCircle className="w-3.5 h-3.5" /> SSS</button></li>
              <li><button onClick={() => navigate("/guvenlik")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Shield className="w-3.5 h-3.5" /> Guvenlik Merkezi</button></li>
              <li><button onClick={() => navigate("/yedekleme")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Database className="w-3.5 h-3.5" /> Felaket Kurtarma</button></li>
              <li><button onClick={() => navigate("/ekspertiz")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><BarChart3 className="w-3.5 h-3.5" /> Uzman Gorusu & Ekspertiz</button></li>
              <li><button onClick={() => navigate("/degisiklikler")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Degisiklik Kayitlari</button></li>
              <li><button onClick={() => navigate("/reklam")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Target className="w-3.5 h-3.5" /> Reklam Kampanyasi</button></li>
              <li><button onClick={() => navigate("/anayasa-400")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> 400 madde anayasa</button></li>
              <li><button onClick={() => navigate("/nihai-anayasa")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Nihai sistem anayasası</button></li>
              <li><button onClick={() => navigate("/emlakci-giris")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Users className="w-3.5 h-3.5" /> Üç tip giriş (Kimi)</button></li>
              <li><button onClick={() => navigate("/yasal-cerceve")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Yasal cerceve (taslak)</button></li>
              <li><button onClick={() => navigate("/canliya-hazirlik")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Database className="w-3.5 h-3.5" /> Canliya hazirlik</button></li>
              <li><button onClick={() => navigate("/sat-basla")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Users className="w-3.5 h-3.5" /> Satıcı modu</button></li>
              <li><button onClick={() => navigate("/komisyon-modeli")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Target className="w-3.5 h-3.5" /> Komisyon modeli</button></li>
              <li className="relative" data-demo={isDemoData("footerNavEndeks") ? "true" : undefined}>
                {isDemoData("footerNavEndeks") ? <DemoDataCornerBadge /> : null}
                <button onClick={() => navigate("/veri-ve-endeks")} className="text-sm text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><BarChart3 className="w-3.5 h-3.5" /> İhaleal Endeksi</button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Bulten</h4>
            <p className="text-sm text-slate-400 mb-3">Yeni ihalelerden ilk siz haberdar olun.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="E-posta" className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white text-sm font-semibold transition-colors">Abone</button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© {year} ihaleal.com. Tum haklari saklidir.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">Yapay zeka destekli gayrimenkul platformu</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
