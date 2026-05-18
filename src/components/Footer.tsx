import { useNavigate } from "react-router-dom";
import { KKA_HUB_PATH, KKA_STUDIO_PATH, kkaHubNavLabel, kkaStudioNavLabel } from "@/lib/kkaHub";
import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";
import { Gavel, MapPin, Phone, Mail, Clock, BarChart3, GitCompare, Calculator, Heart, Shield, FileText, HelpCircle, Users, Building2, Handshake, TrendingUp, Navigation, Trophy, Database, Target, BadgePercent, Landmark, DraftingCompass, BookOpen } from "lucide-react";
import { DemoDataCornerBadge } from "@/components/DemoDataCornerBadge";
import { isDemoData } from "@/lib/dataStrategy";
import { isProdBuild, localAuthEnabled } from "@/lib/runtimeFlags";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";

export function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/15 bg-transparent relative overflow-x-hidden">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 min-w-0">
          {/* Brand */}
          <div className="lg:col-span-4 min-w-0">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Gavel className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-50">ihaleal.com</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed mb-5 font-medium">
              Türkiye&apos;nin en güvenli gayrimenkul ihale platformu. AI destekli değerleme, şeffaf süreç, hızlı satış.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">+90 212 123 45 67</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">info@ihaleal.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">İstanbul, Türkiye</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">09:00 - 18:00 (Hafta içi)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 min-w-0 break-words">
            <h4 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              <li><button onClick={() => navigate("/ihaleler")} className="text-sm text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> Ihaleler</button></li>
              <li><button onClick={() => navigate("/analiz")} className="text-sm text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5" /> AI Analiz</button></li>
              <li><button onClick={() => navigate("/karsilastir")} className="text-sm text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2"><GitCompare className="w-3.5 h-3.5" /> Karsilastir</button></li>
              <li>
                <button
                  onClick={() => navigate("/komisyon-modeli")}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2 w-full text-left"
                >
                  <BadgePercent className="w-3.5 h-3.5" /> Gelir modeli
                </button>
              </li>
              <li><button onClick={() => navigate("/mortgage")} className="text-sm text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2"><Calculator className="w-3.5 h-3.5" /> Mortgage</button></li>
              <li><button onClick={() => navigate("/favoriler")} className="text-sm text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2"><Heart className="w-3.5 h-3.5" /> Favoriler</button></li>
              <li><button onClick={() => navigate("/giris?profil=emlakci")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Emlakçı girişi</button></li>
              <li><button onClick={() => navigate("/emlakci-ortaklik")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><Handshake className="w-3.5 h-3.5" /> Emlakçı ortaklığı</button></li>
              <li><button onClick={() => navigate(INTELLIGENCE_HUB_PATH)} className="text-sm text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5" /> Araştırma terminali</button></li>
            </ul>
          </div>

          {/* Tools */}
          <div className="lg:col-span-2 min-w-0 break-words">
            <h4 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider">Araclar</h4>
            <ul className="space-y-2.5">
              <li className="relative" data-demo={isDemoData("footerNavEstimate") ? "true" : undefined}>
                {isDemoData("footerNavEstimate") ? <DemoDataCornerBadge /> : null}
                <button onClick={() => navigate("/analiz")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> Fiyat Tahmini</button>
              </li>
              <li><button onClick={() => navigate("/mortgage")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><Calculator className="w-3.5 h-3.5" /> Kredi Hesaplayici</button></li>
              <li><button onClick={() => navigate("/karsilastir")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><GitCompare className="w-3.5 h-3.5" /> Ilan Karsilastirma</button></li>
              <li><button onClick={() => navigate("/sehirler")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><Navigation className="w-3.5 h-3.5" /> Sehir Rehberi</button></li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/nasil-calisir")}
                  className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2 w-full text-left"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Nasıl çalışır
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/rehber")}
                  className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2 w-full text-left"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Platform rehberi
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/komisyon-hesaplayici")} className="text-sm text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <BadgePercent className="w-3.5 h-3.5" /> Komisyon hesaplayıcı
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate(KKA_HUB_PATH)} className="text-sm text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2 w-full text-left">
                  <Landmark className="w-3.5 h-3.5" /> {kkaHubNavLabel} (KKA)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate(KKA_STUDIO_PATH)} className="text-sm text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2 w-full text-left">
                  <DraftingCompass className="w-3.5 h-3.5" /> {kkaStudioNavLabel}
                </button>
              </li>
              <li><button onClick={() => navigate("/araclar/vergi-simulator")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><Calculator className="w-3.5 h-3.5" /> Vergi simülatörü</button></li>
              <li><button onClick={() => navigate("/araclar/finans-uyumluluk")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Finans / uyumluluk</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2 min-w-0 break-words">
            <h4 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider">Kurumsal & Hukuki</h4>
            <ul className="space-y-2.5">
              {!isProdBuild ? (
                <li><button onClick={() => navigate("/karsilastir-rakipler")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Trophy className="w-3.5 h-3.5" /> Rakip Analizi</button></li>
              ) : null}
              <li><button onClick={() => navigate("/ihale-kosullari")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Gavel className="w-3.5 h-3.5" /> Ihale Kosullari & Komisyon</button></li>
              <li><button onClick={() => navigate("/evraklar")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Katilim Evraklari</button></li>
              <li><button onClick={() => navigate("/kvkk")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Shield className="w-3.5 h-3.5" /> KVKK Aydinlatma Metni</button></li>
              <li><button onClick={() => navigate("/kullanim-kosullari")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Kullanım Koşulları</button></li>
              <li><button onClick={() => navigate("/gizlilik")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Shield className="w-3.5 h-3.5" /> Gizlilik Politikasi</button></li>
              <li><button onClick={() => navigate("/cerez-politikasi")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Cerez Politikasi</button></li>
              <li><button onClick={() => navigate("/mesafeli-satis-sozlesmesi")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Mesafeli Satış Sözleşmesi</button></li>
              <li><button onClick={() => navigate("/iade-iptal")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> İade ve İptal</button></li>
              <li><button onClick={() => navigate("/aydinlatma-metni")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Aydınlatma Metni</button></li>
              <li><button onClick={() => navigate("/iletisim")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Mail className="w-3.5 h-3.5" /> İletişim</button></li>
              <li><button onClick={() => navigate("/hakkimizda")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Users className="w-3.5 h-3.5" /> Hakkımızda</button></li>
              <li><button onClick={() => navigate("/sss")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><HelpCircle className="w-3.5 h-3.5" /> SSS</button></li>
              <li><button onClick={() => navigate("/güvenlik")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Shield className="w-3.5 h-3.5" /> Guvenlik Merkezi</button></li>
              {!isProdBuild ? (
                <>
                  <li><button onClick={() => navigate("/yasal/dolandiricilik-savunmasi")} className="text-sm text-slate-300 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Shield className="w-3.5 h-3.5" /> Dolandırıcılık savunması</button></li>
                  <li><button type="button" onClick={() => navigate("/yasal/supabase-uyum")} className="text-sm text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Database className="w-3.5 h-3.5" /> Supabase uyum listesi</button></li>
                </>
              ) : null}
              <li><button onClick={() => navigate("/yedekleme")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Database className="w-3.5 h-3.5" /> Felaket Kurtarma</button></li>
              <li><button onClick={() => navigate("/ekspertiz")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><BarChart3 className="w-3.5 h-3.5" /> Uzman Gorusu & Ekspertiz</button></li>
              <li><button onClick={() => navigate("/degisiklikler")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Degisiklik Kayitlari</button></li>
              <li><button onClick={() => navigate("/reklam")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Target className="w-3.5 h-3.5" /> Reklam Kampanyasi</button></li>
              <li><button onClick={() => navigate(PLATFORM_FRAMEWORK_PATH)} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Platform ve KİK çerçevesi</button></li>
              {!isProdBuild ? (
                <li><button onClick={() => navigate("/nihai-anayasa")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Nihai sistem anayasası</button></li>
              ) : null}
              {localAuthEnabled ? (
                <li><button onClick={() => navigate("/emlakci-giris")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Users className="w-3.5 h-3.5" /> Üç tip giriş (Kimi)</button></li>
              ) : null}
              {!isProdBuild ? (
                <>
                  <li><button onClick={() => navigate("/yasal-cerceve")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Yasal çerçeve (taslak)</button></li>
                  <li><button onClick={() => navigate("/canliya-hazirlik")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Database className="w-3.5 h-3.5" /> Canlıya hazırlık</button></li>
                </>
              ) : null}
              <li><button onClick={() => navigate("/sat-basla")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Users className="w-3.5 h-3.5" /> Satıcı modu</button></li>
              <li><button onClick={() => navigate("/komisyon-modeli")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Target className="w-3.5 h-3.5" /> Komisyon modeli</button></li>
              <li className="relative" data-demo={isDemoData("footerNavEndeks") ? "true" : undefined}>
                {isDemoData("footerNavEndeks") ? <DemoDataCornerBadge /> : null}
                <button onClick={() => navigate("/veri-ve-endeks")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><BarChart3 className="w-3.5 h-3.5" /> İhaleal Endeksi</button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2 min-w-0 break-words">
            <h4 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider">Bulten</h4>
            <p className="text-sm text-slate-300 mb-3">Yeni ihalelerden ilk siz haberdar olun.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="E-posta" className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white text-sm font-semibold transition-colors">Abone</button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">© {year} ihaleal.com. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">Yapay zeka destekli gayrimenkul platformu</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
