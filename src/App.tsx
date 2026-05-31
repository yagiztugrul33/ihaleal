import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteSeo } from "@/components/RouteSeo";
import { WebAnalytics } from "@/components/WebAnalytics";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { Home } from "@/pages/Home";
import "./App.css";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { LocalAuthGate } from "@/components/LocalAuthGate";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageLoader } from "@/components/ui/PageLoader";
import { SEO_LANDING_PAGES } from "@/data/seoLandings";
import { KKA_HUB_PATH, KKA_STUDIO_PATH } from "@/lib/kkaHub";
import {
  INTELLIGENCE_HUB_PATH,
  GES_ANALYSIS_PATH,
  PARCEL_INTELLIGENCE_PATH,
  LAND_INVESTMENT_PATH,
  WAR_ROOM_PATH,
} from "@/lib/intelligenceHub";
import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";
import { IBUYER_PATH } from "@/lib/ibuyerHub";
import { GES_LAND_PATH } from "@/lib/gesLandHub";
import { ROUTES } from "@/constants/routes";

const AuctionDetail    = lazy(() => import("@/pages/AuctionDetail"));
const Analytics        = lazy(() => import("@/pages/Analytics"));
const Compare          = lazy(() => import("@/pages/Compare"));
const Login            = lazy(() => import("@/pages/Login"));
const Register         = lazy(() => import("@/pages/Register"));
const Profile          = lazy(() => import("@/pages/Profile"));
const CreateAuction    = lazy(() => import("@/pages/CreateAuction"));
const Favorites        = lazy(() => import("@/pages/Favorites"));
const Mortgage         = lazy(() => import("@/pages/Mortgage"));
const KonutKredisiHesaplayici = lazy(() => import("@/pages/KonutKredisiHesaplayici"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const Guide            = lazy(() => import("@/pages/Guide"));
const MapPage          = lazy(() => import("@/pages/MapPage"));
const Dashboard          = lazy(() => import("@/pages/dashboard"));
const InvestorDashboard  = lazy(() => import("@/pages/dashboard/InvestorDashboard"));
const CitiesList       = lazy(() => import("@/pages/CitiesList"));
const CityGuide        = lazy(() => import("@/pages/CityGuide"));
const LegalKVKK        = lazy(() => import("@/pages/LegalKVKK"));
const LegalPrivacy     = lazy(() => import("@/pages/LegalPrivacy"));
const LegalAuctionTerms= lazy(() => import("@/pages/LegalAuctionTerms"));
const LegalCookies     = lazy(() => import("@/pages/LegalCookies"));
const Expertise          = lazy(() => import("@/pages/Expertise"));
const DocumentsRequired  = lazy(() => import("@/pages/DocumentsRequired"));
const SecurityCenter     = lazy(() => import("@/pages/SecurityCenter"));
const Changelog          = lazy(() => import("@/pages/Changelog"));
const CompetitorComparison = lazy(() => import("@/pages/CompetitorComparison"));
const DisasterRecovery   = lazy(() => import("@/pages/DisasterRecovery"));
const AdCampaign         = lazy(() => import("@/pages/AdCampaign"));
const SellerHub          = lazy(() => import("@/pages/SellerHub"));
const LegalFramework     = lazy(() => import("@/pages/LegalFramework"));
const OperationalReadiness = lazy(() => import("@/pages/OperationalReadiness"));
const BusinessModel        = lazy(() => import("@/pages/BusinessModel"));
const DataStrategy         = lazy(() => import("@/pages/DataStrategy"));
const SearchResults        = lazy(() => import("@/pages/SearchResults"));
const LiveAuctions         = lazy(() => import("@/pages/LiveAuctions"));
const FlowSelector         = lazy(() => import("@/pages/onboarding/FlowSelector"));
const EDevletAuth          = lazy(() => import("@/pages/auth/EDevletAuth"));
const BuyNow               = lazy(() => import("@/pages/auction/BuyNow"));
const AdminDashboard       = lazy(() => import("@/pages/admin/AdminDashboard"));
const YillikUyelik         = lazy(() => import("@/pages/membership/YillikUyelik"));
const HizmetBedelleri      = lazy(() => import("@/pages/services/HizmetBedelleri"));
const PreLaunch            = lazy(() => import("@/pages/PreLaunch"));
const IBuyerPage           = lazy(() => import("@/pages/ibuyer/IBuyerPage"));
const NotFound             = lazy(() => import("@/pages/NotFound"));
const CityLanding          = lazy(() => import("@/pages/CityLanding"));
const ProgrammaticSeoLanding = lazy(() => import("@/pages/ProgrammaticSeoLanding"));
const BorsaCityLanding = lazy(() => import("@/pages/BorsaCityLanding"));
const RehberArticlePage = lazy(() => import("@/pages/RehberArticlePage"));
const Iletisim             = lazy(() => import("@/pages/Iletisim"));
const About                = lazy(() => import("@/pages/About"));
const Kunye                = lazy(() => import("@/pages/Kunye"));
const Destek               = lazy(() => import("@/pages/Destek"));
const Aramalarim           = lazy(() => import("@/pages/Aramalarim"));
const Reports              = lazy(() => import("@/pages/Reports"));
const ReportDetail         = lazy(() => import("@/pages/ReportDetail"));
const UserPanel            = lazy(() => import("@/pages/UserPanel"));
const Messages             = lazy(() => import("@/pages/Messages"));
const Documents            = lazy(() => import("@/pages/Documents"));
const Settings             = lazy(() => import("@/pages/Settings"));
const RealtorsPage         = lazy(() => import("@/pages/Realtors"));
const RealtorProfilePage   = lazy(() => import("@/pages/RealtorProfile"));
const BlogIndex            = lazy(() => import("@/pages/mega/BlogIndex"));
const BlogPostPage         = lazy(() => import("@/pages/mega/BlogPost"));
const CommissionCalculator = lazy(() => import("@/pages/mega/CommissionCalculator"));
const KycSimulation        = lazy(() => import("@/pages/mega/KycSimulation"));
const LandEquityPage = lazy(() => import("@/pages/mega/LandEquityPage"));
const KkaParselStudioPage = lazy(() => import("@/pages/mega/KkaParselStudioPage"));
const IntelligenceHub = lazy(() => import("@/pages/intelligence/IntelligenceHub"));
const GesAnalysisPage = lazy(() => import("@/pages/intelligence/GesAnalysisPage"));
const GesLandEvaluationPage = lazy(() => import("@/pages/ges/GesLandEvaluationPage"));
const ParcelIntelligencePage = lazy(() => import("@/pages/intelligence/ParcelIntelligencePage"));
const LandInvestmentPage = lazy(() => import("@/pages/intelligence/LandInvestmentPage"));
const WarRoomPage = lazy(() => import("@/pages/intelligence/WarRoomPage"));
const RealtorPartnership = lazy(() => import("@/pages/mega/RealtorPartnership"));
const PasswordReset        = lazy(() => import("@/pages/auth/PasswordReset"));
const LegalMasterBrief     = lazy(() => import("@/pages/LegalMasterBrief"));
const AuctionListPage      = lazy(() => import("@/pages/AuctionListPage"));
const KullanimKosullari    = lazy(() => import("@/pages/legal/KullanimKosullari"));
const MesafeliSatisSozlesmesi = lazy(() => import("@/pages/legal/MesafeliSatisSozlesmesi"));
const IadeIptal            = lazy(() => import("@/pages/legal/IadeIptal"));
const AydinlatmaMetni      = lazy(() => import("@/pages/legal/AydinlatmaMetni"));
const SSSPage              = lazy(() => import("@/pages/SSS"));
const AgencyContractView   = lazy(() => import("@/pages/legal/AgencyContractView"));
const FraudDefenseArchitecturePage = lazy(() => import("@/pages/legal/FraudDefenseArchitecturePage"));
const SupabaseComplianceChecklistPage = lazy(() => import("@/pages/legal/SupabaseComplianceChecklistPage"));
const Anayasa400           = lazy(() => import("@/pages/Anayasa400"));
const NihaiAnayasa         = lazy(() => import("@/pages/NihaiAnayasa"));
const EmlakciGiris         = lazy(() => import("@/pages/EmlakciGiris"));
const TaxSimulatorPage     = lazy(() => import("@/pages/TaxSimulatorPage"));
const FinCompliancePlayground = lazy(() => import("@/pages/FinCompliancePlayground"));
const NasilCalisir          = lazy(() => import("@/pages/NasilCalisir"));
const ValuationTool         = lazy(() => import("@/pages/ValuationTool"));
const Corporate             = lazy(() => import("@/pages/Corporate"));
const CorporateContact      = lazy(() => import("@/pages/CorporateContact"));
const OrganizationDashboard = lazy(() =>
  import("@/features/organizations/OrganizationDashboard").then((m) => ({ default: m.OrganizationDashboard })),
);
// R12.1 — Borsa modülü (backup/blok1-borsa cherry-pick)
const BorsaPage              = lazy(() => import("@/pages/BorsaPage"));
const BorsaPortfolioPage     = lazy(() => import("@/pages/BorsaPortfolioPage"));
const BorsaAssetDetailPage   = lazy(() => import("@/pages/BorsaAssetDetailPage"));
const BorsaWatchlistPage     = lazy(() => import("@/pages/BorsaWatchlistPage"));
const BorsaDataAnalysisPage  = lazy(() => import("@/pages/BorsaDataAnalysisPage"));
const BorsaLayout = lazy(() =>
  import("@/components/borsa/BorsaLayout").then((m) => ({ default: m.BorsaLayout })),
);
// R12.2 — Hizmetler dropdown 7 sayfa (backup/blok1-borsa cherry-pick)
const EmlakciLanding         = lazy(() => import("@/pages/EmlakciLanding"));
const EmlakciPanelPage       = lazy(() => import("@/pages/portals/EmlakciPanelPage"));
const MuteahhitLanding       = lazy(() => import("@/pages/MuteahhitLanding"));
const MuteahhitPanelPage     = lazy(() => import("@/pages/portals/MuteahhitPanelPage"));
// R14 — Müteahhit Lansman Sprint
const MuteahhitOnayBekleniyor = lazy(() => import("@/pages/MuteahhitOnayBekleniyor"));
const MuteahhitYeniProjePage  = lazy(() => import("@/pages/MuteahhitYeniProjePage"));
const MuteahhitProjeDetayPage = lazy(() => import("@/pages/MuteahhitProjeDetayPage"));
const MuteahhitProjeKamuPage  = lazy(() => import("@/pages/MuteahhitProjeKamuPage"));
const LoyaltyProgramPage     = lazy(() => import("@/pages/LoyaltyProgramPage"));
const CampaignsPage          = lazy(() => import("@/pages/CampaignsPage"));
const InternationalInvestorPage = lazy(() => import("@/pages/InternationalInvestorPage"));
// R12.3 — Deprem modülü 2 sayfa (backup/blok1-borsa cherry-pick)
const BinaRiskSorguPage      = lazy(() => import("@/pages/modules/BinaRiskSorguPage"));
const DepremRiskHaritasiPage = lazy(() => import("@/pages/modules/DepremRiskHaritasiPage"));
// R12.5 — Deprem modülü 2 sayfa daha (canli takip + güçlendirme)
const CanliDepremTakipPage   = lazy(() => import("@/pages/modules/CanliDepremTakipPage"));
const GuclendirmeRehberiPage = lazy(() => import("@/pages/modules/GuclendirmeRehberiPage"));
// R12.14 Faz A-2 — Harita modülleri (4 sayfa)
const AfetRiskHaritasiPage       = lazy(() => import("@/pages/modules/AfetRiskHaritasiPage"));
const ParselZekasiPage           = lazy(() => import("@/pages/modules/ParselZekasiPage"));
const KentselDonusumPage         = lazy(() => import("@/pages/modules/KentselDonusumPage"));
const AfetToplanmaAlanlariPage   = lazy(() => import("@/pages/modules/AfetToplanmaAlanlariPage"));
// R12.14 Faz A-3 — Eğitim modülleri (10 ders)
const Ders1  = lazy(() => import("@/pages/modules/egitim/Ders1"));
const Ders2  = lazy(() => import("@/pages/modules/egitim/Ders2"));
const Ders3  = lazy(() => import("@/pages/modules/egitim/Ders3"));
const Ders4  = lazy(() => import("@/pages/modules/egitim/Ders4"));
const Ders5  = lazy(() => import("@/pages/modules/egitim/Ders5"));
const Ders6  = lazy(() => import("@/pages/modules/egitim/Ders6"));
const Ders7  = lazy(() => import("@/pages/modules/egitim/Ders7"));
const Ders8  = lazy(() => import("@/pages/modules/egitim/Ders8"));
const Ders9  = lazy(() => import("@/pages/modules/egitim/Ders9"));
const Ders10 = lazy(() => import("@/pages/modules/egitim/Ders10"));
// R12.14 Faz A-4 — İkincil modüller (16 sayfa)
const AileAcilPlanPage          = lazy(() => import("@/pages/modules/AileAcilPlanPage"));
const AirbnbPotansiyelPage      = lazy(() => import("@/pages/modules/AirbnbPotansiyelPage"));
const DepremCantasiPage         = lazy(() => import("@/pages/modules/DepremCantasiPage"));
const DepremEgitimiPage         = lazy(() => import("@/pages/modules/DepremEgitimiPage"));
const DepremSigortasiPage       = lazy(() => import("@/pages/modules/DepremSigortasiPage"));
const ImarSorguPage             = lazy(() => import("@/pages/modules/ImarSorguPage"));
const KomsulukRiskAnaliziPage   = lazy(() => import("@/pages/modules/KomsulukRiskAnaliziPage"));
const KrediPazaryeriPage        = lazy(() => import("@/pages/modules/KrediPazaryeriPage"));
const PortfoyYonetimiModulPage  = lazy(() => import("@/pages/modules/PortfoyYonetimiModulPage"));
const RenovasyonRoiPage         = lazy(() => import("@/pages/modules/RenovasyonRoiPage"));
const SigortaPazaryeriPage      = lazy(() => import("@/pages/modules/SigortaPazaryeriPage"));
const TatbikatRehberiPage       = lazy(() => import("@/pages/modules/TatbikatRehberiPage"));
const UzmanRandevuPage          = lazy(() => import("@/pages/modules/UzmanRandevuPage"));
const YapayZekaHasarTahminiPage = lazy(() => import("@/pages/modules/YapayZekaHasarTahminiPage"));
const YatirimOnerisiPage        = lazy(() => import("@/pages/modules/YatirimOnerisiPage"));
const YikilanBinalarArsiviPage  = lazy(() => import("@/pages/modules/YikilanBinalarArsiviPage"));
// R12.14 Faz A-5 — Değerleme + GES (deferred from A-4)
const DegerlemeModulPage    = lazy(() => import("@/pages/modules/DegerlemeModulPage"));
const GesAnaliziModulPage   = lazy(() => import("@/pages/modules/GesAnaliziModulPage"));

function App() {
  return (
    <LocaleProvider>
    <AuthProvider>
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-page)" }}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin mx-auto mb-4" />
              <p style={{ color: "var(--color-text-muted)" }}>Yükleniyor...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/arama" element={<SearchResults />} />
            <Route path="/ihaleler" element={<LiveAuctions />} />
            <Route path={ROUTES.AUCTIONS} element={<AuctionListPage />} />
            <Route path={ROUTES.ILANLAR} element={<Navigate to={ROUTES.AUCTIONS} replace />} />
            <Route path="/ilanlar" element={<Navigate to={ROUTES.AUCTIONS} replace />} />
            {/* PremiumCinematicHome kategoriler /ilanlar/<kategori> formatında link veriyor — catch-all redirect 404 önler */}
            <Route path="/ilanlar/:category" element={<Navigate to={ROUTES.AUCTIONS} replace />} />
            <Route path="/ilan/:id" element={<AuctionDetail />} />
            <Route path="/ihale/:id" element={<AuctionDetail />} />
            <Route path="/ihale/:auctionId/hemen-al" element={<BuyNow />} />
            <Route path="/analiz" element={<Analytics />} />
            <Route path="/karsilastir" element={<Compare />} />
            <Route path="/giris" element={<Login />} />
            <Route path="/kayit" element={<Register />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/kyc" element={<KycSimulation />} />
            <Route path="/ihale-ac" element={<CreateAuction />} />
            <Route path="/favoriler" element={<Favorites />} />
            <Route path="/mortgage" element={<Mortgage />} />
            <Route path="/konut-kredisi-hesaplayici" element={<KonutKredisiHesaplayici />} />
            <Route path="/bildirimler" element={<NotificationsPage />} />
            <Route path="/rehber" element={<Guide />} />
            <Route path="/rehber/:slug" element={<RehberArticlePage />} />
            <Route
              path={ROUTES.HOW_IT_WORKS}
              element={
                <RouteSeo>
                  <NasilCalisir />
                </RouteSeo>
              }
            />
            <Route path={ROUTES.NASIL_CALISIR} element={<Navigate to={ROUTES.HOW_IT_WORKS} replace />} />
            <Route path="/nasil-calisir" element={<Navigate to={ROUTES.HOW_IT_WORKS} replace />} />
            <Route path="/harita" element={<MapPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/yatirimci" element={<InvestorDashboard />} />
            <Route path="/sehirler" element={<CitiesList />} />
            <Route path="/sehir/:cityName" element={<CityGuide />} />
            <Route path="/kvkk" element={<LegalKVKK />} />
            <Route path="/gizlilik" element={<LegalPrivacy />} />
            <Route path="/ihale-kosullari" element={<LegalAuctionTerms />} />
            <Route path="/cerez-politikasi" element={<LegalCookies />} />
            <Route path="/kullanim-kosullari" element={<KullanimKosullari />} />
            <Route path="/mesafeli-satis-sozlesmesi" element={<MesafeliSatisSozlesmesi />} />
            <Route path="/iade-iptal" element={<IadeIptal />} />
            <Route path="/aydinlatma-metni" element={<AydinlatmaMetni />} />
            <Route path="/sss" element={<SSSPage />} />
            <Route path="/yasal/agency-contract" element={<AgencyContractView />} />
            <Route path="/yasal/dolandiricilik-savunmasi" element={<FraudDefenseArchitecturePage />} />
            <Route path="/yasal/supabase-uyum" element={<SupabaseComplianceChecklistPage />} />
            <Route path={PLATFORM_FRAMEWORK_PATH} element={<Anayasa400 />} />
            <Route path="/anayasa-400" element={<Navigate to={PLATFORM_FRAMEWORK_PATH} replace />} />
            <Route path="/anayasa" element={<Navigate to={PLATFORM_FRAMEWORK_PATH} replace />} />
            <Route path="/nihai-anayasa" element={<NihaiAnayasa />} />
            <Route path="/emlakci-giris" element={<LocalAuthGate><EmlakciGiris /></LocalAuthGate>} />
            <Route path="/araclar/vergi-simulator" element={<TaxSimulatorPage />} />
            <Route path="/araclar/finans-uyumluluk" element={<FinCompliancePlayground />} />
            <Route path="/degerleme" element={<ValuationTool />} />
            <Route path={ROUTES.SERVICES} element={<Corporate />} />
            <Route path={ROUTES.KURUMSAL} element={<Navigate to={ROUTES.SERVICES} replace />} />
            <Route path="/kurumsal" element={<Navigate to={ROUTES.SERVICES} replace />} />
            <Route path="/kurumsal/iletisim" element={<CorporateContact />} />
            <Route path="/kurumsal/dashboard" element={<OrganizationDashboard />} />
            <Route path="/valuation" element={<ValuationTool />} />
            <Route path="/ekspertiz" element={<Expertise />} />
            <Route path="/evraklar" element={<DocumentsRequired />} />
            <Route path="/guvenlik" element={<SecurityCenter />} />
            {/* Changelog: master kararı — public footer'da yer almayacak, route kaldırıldı (sayfa kodu duruyor, ileride admin/internal panelinde kullanılabilir) */}
            <Route path="/degisiklikler" element={<Navigate to="/" replace />} />
            <Route path="/karsilastir-rakipler" element={<CompetitorComparison />} />
            <Route path="/yedekleme" element={<DisasterRecovery />} />
            <Route path="/reklam" element={<AdCampaign />} />
            <Route path="/sat-basla" element={<SellerHub />} />
            <Route path="/yasal-cerceve" element={<LegalFramework />} />
            <Route path="/canliya-hazirlik" element={<OperationalReadiness />} />
            <Route path="/komisyon-modeli" element={<BusinessModel />} />
            <Route path="/veri-ve-endeks" element={<DataStrategy />} />
            {SEO_LANDING_PAGES.map((cfg) => (
              <Route key={cfg.path} path={cfg.path} element={<CityLanding />} />
            ))}
            <Route path="/satilik/:il" element={<ProgrammaticSeoLanding />} />
            <Route path="/satilik/:il/:segment" element={<ProgrammaticSeoLanding />} />
            <Route path="/satilik/:il/:segment/:tip" element={<ProgrammaticSeoLanding />} />
            <Route path="/kiralik/:il" element={<ProgrammaticSeoLanding />} />
            <Route path="/kiralik/:il/:segment" element={<ProgrammaticSeoLanding />} />
            <Route path="/kiralik/:il/:segment/:tip" element={<ProgrammaticSeoLanding />} />
            <Route path="/borsa/sehir/:il" element={<BorsaCityLanding />} />
            <Route path="/iletisim" element={<Iletisim />} />
            <Route path="/hakkimizda" element={<About />} />
            <Route path="/kunye" element={<Kunye />} />
            <Route path="/destek" element={<Destek />} />
            {/* Dalga 4-1: kayıtlı aramalar yönetim sayfası + /saved-searches alias */}
            <Route path="/aramalarim" element={<Aramalarim />} />
            <Route path="/saved-searches" element={<Navigate to="/aramalarim" replace />} />
            <Route path="/raporlar" element={<Reports />} />
            <Route path="/rapor/:id" element={<ReportDetail />} />
            <Route path="/panel" element={<UserPanel />} />
            <Route path="/panel/:tabId" element={<UserPanel />} />
            <Route path="/mesajlar" element={<Messages />} />
            <Route path="/belgeler" element={<Documents />} />
            <Route path="/ayarlar" element={<Settings />} />
            <Route path="/emlakciler" element={<RealtorsPage />} />
            <Route path="/emlakci/:slug" element={<RealtorProfilePage />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/komisyon-hesaplayici" element={<CommissionCalculator />} />
            <Route path={KKA_HUB_PATH} element={<LandEquityPage />} />
            <Route path={KKA_STUDIO_PATH} element={<KkaParselStudioPage />} />
            <Route
              path={INTELLIGENCE_HUB_PATH}
              element={
                <Suspense fallback={<PageLoader label="Araştırma yükleniyor…" />}>
                  <IntelligenceHub />
                </Suspense>
              }
            />
            <Route
              path={GES_ANALYSIS_PATH}
              element={
                <Suspense fallback={<PageLoader label="GES analizi yükleniyor…" />}>
                  <GesAnalysisPage />
                </Suspense>
              }
            />
            <Route
              path={PARCEL_INTELLIGENCE_PATH}
              element={
                <Suspense fallback={<PageLoader label="Parsel istihbaratı yükleniyor…" />}>
                  <ParcelIntelligencePage />
                </Suspense>
              }
            />
            <Route
              path={LAND_INVESTMENT_PATH}
              element={
                <Suspense fallback={<PageLoader label="Yatırım terminali yükleniyor…" />}>
                  <LandInvestmentPage />
                </Suspense>
              }
            />
            <Route
              path={WAR_ROOM_PATH}
              element={
                <Suspense fallback={<PageLoader label="War Room yükleniyor…" />}>
                  <WarRoomPage />
                </Suspense>
              }
            />
            <Route path="/emlakci-ortaklik" element={<RealtorPartnership />} />
            <Route path="/sifremi-unuttum" element={<PasswordReset />} />
            <Route path="/yasal-master-brief" element={<LegalMasterBrief />} />
            <Route path="/uyelik/yillik" element={<YillikUyelik />} />
            <Route path="/hizmet-bedelleri" element={<HizmetBedelleri />} />
            <Route path="/pre-launch" element={<PreLaunch />} />
            <Route path="/lansman" element={<PreLaunch />} />
            <Route
              path="/onboarding/akis"
              element={
                <RouteSeo>
                  <FlowSelector />
                </RouteSeo>
              }
            />
            <Route
              path="/auth/edevis-mock"
              element={
                <RouteSeo>
                  <EDevletAuth />
                </RouteSeo>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <Suspense fallback={<PageLoader label="Panel yükleniyor..." />}>
                    <AdminDashboard />
                  </Suspense>
                </AdminGuard>
              }
            />
            <Route
              path={IBUYER_PATH}
              element={
                <Suspense fallback={<PageLoader label="Anında teklif yükleniyor…" />}>
                  <IBuyerPage />
                </Suspense>
              }
            />
            <Route path={ROUTES.IBUYER_ALIAS} element={<Navigate to={ROUTES.IBUYER} replace />} />
            <Route path="/ibuyer" element={<Navigate to={ROUTES.IBUYER} replace />} />
            {/* R12.1 — Borsa modülü (backup/blok1-borsa cherry-pick) */}
            <Route
              path={ROUTES.BORSA}
              element={
                <Suspense fallback={<PageLoader label="Borsa shell yükleniyor..." />}>
                  <BorsaLayout />
                </Suspense>
              }
            >
              <Route
                index
                element={
                  <Suspense fallback={<PageLoader label="Borsa terminali yükleniyor..." />}>
                    <BorsaPage />
                  </Suspense>
                }
              />
              <Route
                path="varliklar"
                element={
                  <Suspense fallback={<PageLoader label="Varlık terminali yükleniyor..." />}>
                    <BorsaPage />
                  </Suspense>
                }
              />
              <Route
                path="izleme"
                element={
                  <Suspense fallback={<PageLoader label="İzleme terminali yükleniyor..." />}>
                    <BorsaWatchlistPage />
                  </Suspense>
                }
              />
              <Route
                path="veri"
                element={
                  <Suspense fallback={<PageLoader label="Veri terminali yükleniyor..." />}>
                    <BorsaDataAnalysisPage />
                  </Suspense>
                }
              />
              <Route
                path="portfoy"
                element={
                  <Suspense fallback={<PageLoader label="Borsa portföy yükleniyor..." />}>
                    <BorsaPortfolioPage />
                  </Suspense>
                }
              />
              <Route
                path="varlik/:id"
                element={
                  <Suspense fallback={<PageLoader label="Varlık detayı yükleniyor..." />}>
                    <BorsaAssetDetailPage />
                  </Suspense>
                }
              />
            </Route>
            {/* R12.2 — Hizmetler dropdown 7 sayfa (backup/blok1-borsa cherry-pick) */}
            <Route path="/emlakci" element={<EmlakciLanding />} />
            <Route path="/emlakci/panel" element={<EmlakciPanelPage />} />
            <Route path="/muteahhit" element={<MuteahhitLanding />} />
            <Route path="/muteahhit/panel" element={<ProtectedRoute><MuteahhitPanelPage /></ProtectedRoute>} />
            {/* R14 — Müteahhit Lansman Sprint */}
            <Route path="/muteahhit/onay-bekleniyor" element={<ProtectedRoute><MuteahhitOnayBekleniyor /></ProtectedRoute>} />
            <Route path="/muteahhit/yeni-proje" element={<ProtectedRoute><MuteahhitYeniProjePage /></ProtectedRoute>} />
            <Route path="/muteahhit/proje/:projectId" element={<ProtectedRoute><MuteahhitProjeDetayPage /></ProtectedRoute>} />
            {/* /proje/:projectId KAMU sayfasi — verified projeler anon erisime acik */}
            <Route path="/proje/:projectId" element={<MuteahhitProjeKamuPage />} />
            <Route path="/oduller" element={<LoyaltyProgramPage />} />
            <Route path="/kampanyalar" element={<CampaignsPage />} />
            <Route path="/uluslararasi" element={<InternationalInvestorPage />} />
            {/* R12.3 — Deprem modülü 2 sayfa (backup/blok1-borsa cherry-pick) */}
            <Route path="/modul/bina-risk-sorgu" element={<BinaRiskSorguPage />} />
            <Route path="/modul/deprem-risk-haritasi" element={<DepremRiskHaritasiPage />} />
            {/* R12.5 — Deprem modülü 2 sayfa daha */}
            <Route path="/modul/canli-deprem-takip" element={<CanliDepremTakipPage />} />
            <Route path="/modul/guclendirme-rehberi" element={<GuclendirmeRehberiPage />} />
            {/* R12.14 Faz A-2 — Harita modülleri (4 sayfa) */}
            <Route path="/modul/afet-risk-haritasi" element={<AfetRiskHaritasiPage />} />
            <Route path="/modul/parsel-zekasi" element={<ParselZekasiPage />} />
            <Route path="/modul/kentsel-donusum" element={<KentselDonusumPage />} />
            <Route path="/modul/afet-toplanma-alanlari" element={<AfetToplanmaAlanlariPage />} />
            {/* R12.14 Faz A-3 — Eğitim modülleri (10 ders) */}
            <Route path="/modul/deprem-egitimi/ders-1"  element={<Ders1 />} />
            <Route path="/modul/deprem-egitimi/ders-2"  element={<Ders2 />} />
            <Route path="/modul/deprem-egitimi/ders-3"  element={<Ders3 />} />
            <Route path="/modul/deprem-egitimi/ders-4"  element={<Ders4 />} />
            <Route path="/modul/deprem-egitimi/ders-5"  element={<Ders5 />} />
            <Route path="/modul/deprem-egitimi/ders-6"  element={<Ders6 />} />
            <Route path="/modul/deprem-egitimi/ders-7"  element={<Ders7 />} />
            <Route path="/modul/deprem-egitimi/ders-8"  element={<Ders8 />} />
            <Route path="/modul/deprem-egitimi/ders-9"  element={<Ders9 />} />
            <Route path="/modul/deprem-egitimi/ders-10" element={<Ders10 />} />
            {/* R12.14 Faz A-4 — İkincil modüller (16 sayfa) */}
            <Route path="/modul/aile-acil-plan"          element={<AileAcilPlanPage />} />
            <Route path="/modul/airbnb-potansiyel"       element={<AirbnbPotansiyelPage />} />
            <Route path="/modul/deprem-cantasi"          element={<DepremCantasiPage />} />
            <Route path="/modul/deprem-egitimi"          element={<DepremEgitimiPage />} />
            <Route path="/modul/deprem-sigortasi"        element={<DepremSigortasiPage />} />
            <Route path="/modul/imar-sorgu"              element={<ImarSorguPage />} />
            <Route path="/modul/komsuluk-risk-analizi"   element={<KomsulukRiskAnaliziPage />} />
            <Route path="/modul/kredi-pazaryeri"         element={<KrediPazaryeriPage />} />
            <Route path="/modul/portfoy-yonetimi"        element={<PortfoyYonetimiModulPage />} />
            <Route path="/modul/renovasyon-roi"          element={<RenovasyonRoiPage />} />
            <Route path="/modul/sigorta-pazaryeri"       element={<SigortaPazaryeriPage />} />
            <Route path="/modul/tatbikat-rehberi"        element={<TatbikatRehberiPage />} />
            <Route path="/modul/uzman-randevu"           element={<UzmanRandevuPage />} />
            <Route path="/modul/yapay-zeka-hasar-tahmini" element={<YapayZekaHasarTahminiPage />} />
            <Route path="/modul/yatirim-onerisi"         element={<YatirimOnerisiPage />} />
            <Route path="/modul/yikilan-binalar-arsivi"  element={<YikilanBinalarArsiviPage />} />
            {/* R12.14 Faz A-5 — Değerleme + GES analizi (deferred from A-4) */}
            <Route path="/modul/degerleme"    element={<DegerlemeModulPage />} />
            <Route path="/modul/ges-analizi"  element={<GesAnaliziModulPage />} />
            <Route path="*" element={<NotFound />} />
            </Route>
            <Route
              path={GES_LAND_PATH}
              element={
                <Suspense fallback={<PageLoader label="GES arazi degerlendirme yukleniyor..." />}>
                  <GesLandEvaluationPage />
                </Suspense>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <WebAnalytics />
      <InstallPrompt />
    </BrowserRouter>
    </AuthProvider>
    </LocaleProvider>
  );
}

export default App;
