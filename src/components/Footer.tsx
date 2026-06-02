import { useNavigate } from "react-router-dom";
import { BrandLockup } from "@/components/Logo";
import { KKA_HUB_PATH, KKA_STUDIO_PATH, kkaHubNavLabel, kkaStudioNavLabel } from "@/lib/kkaHub";
import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";
import { Gavel, MapPin, Phone, Mail, Clock, BarChart3, GitCompare, Calculator, Heart, Shield, FileText, HelpCircle, Users, Building2, Handshake, TrendingUp, Navigation, Trophy, Database, Target, BadgePercent, Landmark, DraftingCompass, BookOpen, Globe, Scale } from "lucide-react";
import { DemoDataCornerBadge } from "@/components/DemoDataCornerBadge";
import { isDemoData } from "@/lib/dataStrategy";
import { isProdBuild, localAuthEnabled } from "@/lib/runtimeFlags";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";
import { useLocale } from "@/contexts/LocaleContext";
import type { Locale } from "@/i18n/messages";

export function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const { locale, setLocale, t } = useLocale();
  const f = t.footer;
  const pickLocale = (next: Locale) => setLocale(next);

  return (
    <footer className="border-t border-white/15 bg-transparent relative overflow-x-hidden">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 min-w-0">
          {/* Brand */}
          <div className="lg:col-span-4 min-w-0">
            <div className="mb-5">
              <BrandLockup logoSize="md" layout="inline" showSlogan />
            </div>
            <p className="text-sm text-slate-200 leading-relaxed mb-5 font-medium">
              {f.tagline}
            </p>
            {/* Yasal şirket iletişim bloğu — 6563 Sayılı Kanun gereği işletme künyesi.
                AR (rtl) sayfasında bile LTR (Latin metin + sayı + URL) korunur — yasal
                künye TR resmi metin olduğu için BiDi karışıklığı yaşanmasın. */}
            {/* Vergi no/dairesi sadece /kunye sayfasında; footer'da müşteri etkileşim odaklı bilgi. */}
            <address className="not-italic space-y-2.5" dir="ltr">
              <p className="text-xs font-semibold text-slate-200 leading-snug uppercase tracking-wide">
                İHALEAL GAYRİMENKUL VE İNŞAAT
                <br className="hidden sm:inline" />
                SAN. TİC. LTD. ŞTİ.
              </p>
              <a
                href="tel:+905445327406"
                className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-blue-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>0544 532 74 06</span>
              </a>
              <a
                href="mailto:info@ihaleal.com"
                className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-blue-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>info@ihaleal.com</span>
              </a>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300 leading-relaxed">
                  Esentepe Mah. Büyükdere Cad. Astoria,
                  <br />
                  Kapı No: 127 Daire No: 6, Şişli / İstanbul
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{f.workingHours}</span>
              </div>
            </address>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 min-w-0 break-words">
            <h4 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider">{f.colPlatform}</h4>
            <ul className="space-y-2.5">
              <li><button onClick={() => navigate("/ihaleler")} className="text-sm text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> {f.auctionsLink}</button></li>
              <li><button onClick={() => navigate("/analiz")} className="text-sm text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5" /> {f.aiAnalysis}</button></li>
              <li><button onClick={() => navigate("/karsilastir")} className="text-sm text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2"><GitCompare className="w-3.5 h-3.5" /> {f.compare}</button></li>
              <li>
                <button
                  onClick={() => navigate("/komisyon-modeli")}
                  className="text-sm text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2 w-full text-start"
                >
                  <BadgePercent className="w-3.5 h-3.5" /> {f.revenueModel}
                </button>
              </li>
              <li><button onClick={() => navigate("/mortgage")} className="text-sm text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2"><Calculator className="w-3.5 h-3.5" /> {f.mortgage}</button></li>
              <li><button onClick={() => navigate("/favoriler")} className="text-sm text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2"><Heart className="w-3.5 h-3.5" /> {f.favorites}</button></li>
              <li><button onClick={() => navigate("/giris?profil=emlakçı")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><Users className="w-3.5 h-3.5" /> {f.realtorLoginFooter}</button></li>
              <li><button onClick={() => navigate("/emlakçı-ortaklik")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><Handshake className="w-3.5 h-3.5" /> {f.realtorPartnership}</button></li>
              <li><button onClick={() => navigate(INTELLIGENCE_HUB_PATH)} className="text-sm text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5" /> {f.researchTerminal}</button></li>
            </ul>
          </div>

          {/* Tools */}
          <div className="lg:col-span-2 min-w-0 break-words">
            <h4 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider">{f.colTools}</h4>
            <ul className="space-y-2.5">
              <li className="relative" data-demo={isDemoData("footerNavEstimate") ? "true" : undefined}>
                {isDemoData("footerNavEstimate") ? <DemoDataCornerBadge /> : null}
                <button onClick={() => navigate("/analiz")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> {f.priceEstimate}</button>
              </li>
              <li><button onClick={() => navigate("/mortgage")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><Calculator className="w-3.5 h-3.5" /> {f.loanCalculator}</button></li>
              <li><button onClick={() => navigate("/karsilastir")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><GitCompare className="w-3.5 h-3.5" /> {f.listingCompare}</button></li>
              <li><button onClick={() => navigate("/sehirler")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><Navigation className="w-3.5 h-3.5" /> {f.cityGuide}</button></li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/nasil-calisir")}
                  className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2 w-full text-start"
                >
                  <BookOpen className="w-3.5 h-3.5" /> {f.howItWorksFooter}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/rehber")}
                  className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2 w-full text-start"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> {f.platformGuide}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/komisyon-hesaplayici")} className="text-sm text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <BadgePercent className="w-3.5 h-3.5" /> {f.commissionCalc}
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
              <li><button onClick={() => navigate("/araclar/vergi-simulator")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><Calculator className="w-3.5 h-3.5" /> {f.taxSimulator}</button></li>
              <li><button onClick={() => navigate("/araclar/finans-uyumluluk")} className="text-sm text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> {f.financeCompliance}</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2 min-w-0 break-words">
            <h4 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider">{f.colCorporateLegal}</h4>
            <ul className="space-y-2.5">
              {!isProdBuild ? (
                <li><button onClick={() => navigate("/karsilastir-rakipler")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Trophy className="w-3.5 h-3.5" /> Rakip Analizi</button></li>
              ) : null}
              <li><button onClick={() => navigate("/yasal")} className="text-sm text-violet-300 hover:text-violet-200 transition-colors cursor-pointer flex items-center gap-2 w-full text-start font-semibold"><Scale className="w-3.5 h-3.5" /> {f.legalHub}</button></li>
              <li><button onClick={() => navigate("/ihale-kosullari")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><Gavel className="w-3.5 h-3.5" /> {f.auctionTermsCommission}</button></li>
              <li><button onClick={() => navigate("/evraklar")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><FileText className="w-3.5 h-3.5" /> {f.participationDocs}</button></li>
              <li><button onClick={() => navigate("/kvkk")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><Shield className="w-3.5 h-3.5" /> {f.kvkkInfo}</button></li>
              <li><button onClick={() => navigate("/kullanim-kosullari")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><FileText className="w-3.5 h-3.5" /> {f.termsOfUse}</button></li>
              <li><button onClick={() => navigate("/gizlilik")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><Shield className="w-3.5 h-3.5" /> {f.privacyPolicy}</button></li>
              <li><button onClick={() => navigate("/cerez-politikasi")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><FileText className="w-3.5 h-3.5" /> {f.cookiePolicy}</button></li>
              <li><button onClick={() => navigate("/mesafeli-satis-sozlesmesi")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><FileText className="w-3.5 h-3.5" /> {f.distanceSaleAgreement}</button></li>
              <li><button onClick={() => navigate("/iade-iptal")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><FileText className="w-3.5 h-3.5" /> {f.refundCancellation}</button></li>
              <li><button onClick={() => navigate("/aydinlatma-metni")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><FileText className="w-3.5 h-3.5" /> {f.disclosure}</button></li>
              <li><button onClick={() => navigate("/iletisim")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><Mail className="w-3.5 h-3.5" /> {f.contactFooter}</button></li>
              <li><button onClick={() => navigate("/hakkimizda")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><Users className="w-3.5 h-3.5" /> {f.aboutUs}</button></li>
              <li><button onClick={() => window.open("/sitemap.xml", "_blank", "noopener,noreferrer")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><Navigation className="w-3.5 h-3.5" /> {f.sitemap}</button></li>
              <li><button onClick={() => navigate("/sss")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><HelpCircle className="w-3.5 h-3.5" /> {f.faqFooter}</button></li>
              <li><button onClick={() => navigate("/güvenlik")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><Shield className="w-3.5 h-3.5" /> {f.securityCenter}</button></li>
              {!isProdBuild ? (
                <>
                  <li><button onClick={() => navigate("/yasal/dolandiricilik-savunmasi")} className="text-sm text-slate-300 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Shield className="w-3.5 h-3.5" /> Dolandırıcılık savunması</button></li>
                  <li><button type="button" onClick={() => navigate("/yasal/supabase-uyum")} className="text-sm text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Database className="w-3.5 h-3.5" /> Supabase uyum listesi</button></li>
                </>
              ) : null}
              <li><button onClick={() => navigate("/yedekleme")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Database className="w-3.5 h-3.5" /> Felaket Kurtarma</button></li>
              <li><button onClick={() => navigate("/ekspertiz")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><BarChart3 className="w-3.5 h-3.5" /> Uzman Gorusu & Ekspertiz</button></li>
              <li><button onClick={() => navigate("/reklam")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Target className="w-3.5 h-3.5" /> Reklam Kampanyasi</button></li>
              {/* Platform ve KİK çerçevesi + Nihai sistem anayasası iç doküman —
                  prod kullanıcı/SEO görünmez; route hala iç ekip için açık. */}
              {!isProdBuild ? (
                <>
                  <li><button onClick={() => navigate(PLATFORM_FRAMEWORK_PATH)} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Platform ve KİK çerçevesi</button></li>
                  <li><button onClick={() => navigate("/nihai-anayasa")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Nihai sistem anayasası</button></li>
                </>
              ) : null}
              {localAuthEnabled ? (
                <li><button onClick={() => navigate("/emlakçı-giris")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Users className="w-3.5 h-3.5" /> Üç tip giriş (Kimi)</button></li>
              ) : null}
              {!isProdBuild ? (
                <>
                  <li><button onClick={() => navigate("/yasal-cerceve")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><FileText className="w-3.5 h-3.5" /> Yasal çerçeve (taslak)</button></li>
                  <li><button onClick={() => navigate("/canliya-hazirlik")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-left"><Database className="w-3.5 h-3.5" /> Canlıya hazırlık</button></li>
                </>
              ) : null}
              <li><button onClick={() => navigate("/sat-basla")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><Users className="w-3.5 h-3.5" /> {f.sellerMode}</button></li>
              <li><button onClick={() => navigate("/komisyon-modeli")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><Target className="w-3.5 h-3.5" /> {f.commissionModel}</button></li>
              <li className="relative" data-demo={isDemoData("footerNavEndeks") ? "true" : undefined}>
                {isDemoData("footerNavEndeks") ? <DemoDataCornerBadge /> : null}
                <button onClick={() => navigate("/veri-ve-endeks")} className="text-sm text-slate-300 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2 w-full text-start"><BarChart3 className="w-3.5 h-3.5" /> {f.ihalealIndex}</button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2 min-w-0 break-words">
            <h4 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider">{f.colNewsletter}</h4>
            <p className="text-sm text-slate-300 mb-3">{f.newsletterDesc}</p>
            <div className="flex gap-2">
              <input type="email" placeholder={f.newsletterPlaceholder} className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white text-sm font-semibold transition-colors">{f.newsletterSubmit}</button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/15 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400" dir="ltr">
            © {year} ihaleal.com. <span dir="auto">{f.allRightsReserved}</span>
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {/* Dil seçici — Navbar'dakine ek olarak mobile + desktop her zaman görünür. */}
            <div
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-slate-900/50 px-1 py-0.5"
              role="group"
              aria-label={f.langLabel}
            >
              <Globe className="ms-1.5 h-3 w-3 text-slate-500" aria-hidden />
              <button
                type="button"
                onClick={() => pickLocale("tr")}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  locale === "tr"
                    ? "bg-blue-500/20 text-blue-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                aria-pressed={locale === "tr"}
              >
                TR
              </button>
              <button
                type="button"
                onClick={() => pickLocale("en")}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  locale === "en"
                    ? "bg-blue-500/20 text-blue-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                aria-pressed={locale === "en"}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => pickLocale("ru")}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  locale === "ru"
                    ? "bg-blue-500/20 text-blue-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                aria-pressed={locale === "ru"}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => pickLocale("ar")}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  locale === "ar"
                    ? "bg-blue-500/20 text-blue-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                aria-pressed={locale === "ar"}
              >
                AR
              </button>
            </div>
            <span className="text-xs text-slate-400">
              {f.taglineShort}
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
