import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteSeo } from "@/components/RouteSeo";
import "./App.css";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { LocalAuthGate } from "@/components/LocalAuthGate";
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

const Home             = lazy(() => import("@/pages/Home"));
const AuctionDetail    = lazy(() => import("@/pages/AuctionDetail"));
const Analytics        = lazy(() => import("@/pages/Analytics"));
const Compare          = lazy(() => import("@/pages/Compare"));
const Login            = lazy(() => import("@/pages/Login"));
const Register         = lazy(() => import("@/pages/Register"));
const Profile          = lazy(() => import("@/pages/Profile"));
const CreateAuction    = lazy(() => import("@/pages/CreateAuction"));
const Favorites        = lazy(() => import("@/pages/Favorites"));
const Mortgage         = lazy(() => import("@/pages/Mortgage"));
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
const Iletisim             = lazy(() => import("@/pages/Iletisim"));
const About                = lazy(() => import("@/pages/About"));
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
const IlanlarKatalog       = lazy(() => import("@/pages/IlanlarKatalog"));
const KullanimKosullari    = lazy(() => import("@/pages/legal/KullanimKosullari"));
const MesafeliSatisSozlesmesi = lazy(() => import("@/pages/legal/MesafeliSatisSozlesmesi"));
const IadeIptal            = lazy(() => import("@/pages/legal/IadeIptal"));
const AydinlatmaMetni      = lazy(() => import("@/pages/legal/AydinlatmaMetni"));
const SSSPage              = lazy(() => import("@/pages/SSS"));
const AgencyContractView   = lazy(() => import("@/pages/legal/AgencyContractView"));
const FraudDefenseArchitecturePage = lazy(() => import("@/pages/legal/FraudDefenseArchitecturePage"));
const SupabaseComplianceChecklistPage = lazy(() => import("@/pages/legal/SupabaseComplianceChecklistPage"));
const Anayasa400           = lazy(() => import("@/pages/Anayasa400"));
const AnayasaIhalealPage   = lazy(() => import("@/pages/AnayasaIhalealPage"));
const NihaiAnayasa         = lazy(() => import("@/pages/NihaiAnayasa"));
const EmlakciGiris         = lazy(() => import("@/pages/EmlakciGiris"));
const TaxSimulatorPage     = lazy(() => import("@/pages/TaxSimulatorPage"));
const FinCompliancePlayground = lazy(() => import("@/pages/FinCompliancePlayground"));
const NasilCalisir          = lazy(() => import("@/pages/NasilCalisir"));
const NasilCalisirJourneyPage = lazy(() => import("@/pages/NasilCalisirJourneyPage"));
const NasilCalisirStepPage = lazy(() => import("@/pages/NasilCalisirStepPage"));
const ValuationTool         = lazy(() => import("@/pages/ValuationTool"));
const Corporate             = lazy(() => import("@/pages/Corporate"));
const CorporateContact      = lazy(() => import("@/pages/CorporateContact"));
const OrganizationDashboard = lazy(() =>
  import("@/features/organizations/OrganizationDashboard").then((m) => ({ default: m.OrganizationDashboard })),
);
const EmlakciLanding = lazy(() => import("@/pages/EmlakciLanding"));
const EmlakciFeaturePage = lazy(() => import("@/pages/emlakci/EmlakciFeaturePage"));
const MuteahhitLanding = lazy(() => import("@/pages/MuteahhitLanding"));
const TakasPage = lazy(() => import("@/pages/takas/TakasPage"));
const TeklifAlPage = lazy(() => import("@/pages/TeklifAlPage"));
const KycPage = lazy(() => import("@/pages/KycPage"));
const BorsaPage = lazy(() => import("@/pages/BorsaPage"));
const BorsaPortfolioPage = lazy(() => import("@/pages/BorsaPortfolioPage"));
const KapaliTeklifPage = lazy(() => import("@/pages/marketing/KapaliTeklifPage"));
const YorumlarPage = lazy(() => import("@/pages/marketing/YorumlarPage"));
const DestekPage = lazy(() => import("@/pages/marketing/DestekPage"));
const FiyatlandirmaPage = lazy(() => import("@/pages/marketing/FiyatlandirmaPage"));
const ReelsPage = lazy(() => import("@/pages/marketing/ReelsPage"));
const PiyasaRaporlariPage = lazy(() => import("@/pages/marketing/PiyasaRaporlariPage"));
const EmlakciPanelPage = lazy(() => import("@/pages/portals/EmlakciPanelPage"));
const MuteahhitPanelPage = lazy(() => import("@/pages/portals/MuteahhitPanelPage"));
const SozlesmelerIndexPage = lazy(() => import("@/pages/legal/SozlesmelerIndexPage"));
const SozlesmeTemplatePage = lazy(() => import("@/pages/legal/SozlesmeTemplatePage"));
const BasindaBizPage = lazy(() => import("@/pages/marketing/BasindaBizPage"));
const BildirimlerPage = lazy(() => import("@/pages/BildirimlerPage"));
const IlanlarSegmentRouter = lazy(() => import("@/pages/ilan/IlanlarSegmentRouter"));
const ParselZekasiPage = lazy(() => import("@/pages/modules/ParselZekasiPage"));
const GesAnaliziModulPage = lazy(() => import("@/pages/modules/GesAnaliziModulPage"));
const DegerlemeModulPage = lazy(() => import("@/pages/modules/DegerlemeModulPage"));
const AirbnbPotansiyelPage = lazy(() => import("@/pages/modules/AirbnbPotansiyelPage"));
const RenovasyonRoiPage = lazy(() => import("@/pages/modules/RenovasyonRoiPage"));
const DepremRiskHaritasiPage = lazy(() => import("@/pages/modules/DepremRiskHaritasiPage"));
const BinaRiskSorguPage = lazy(() => import("@/pages/modules/BinaRiskSorguPage"));
const CanliDepremTakipPage = lazy(() => import("@/pages/modules/CanliDepremTakipPage"));
const AileAcilPlanPage = lazy(() => import("@/pages/modules/AileAcilPlanPage"));
const GuclendirmeRehberiPage = lazy(() => import("@/pages/modules/GuclendirmeRehberiPage"));
const ImarSorguPage = lazy(() => import("@/pages/modules/ImarSorguPage"));
const YatirimOnerisiPage = lazy(() => import("@/pages/modules/YatirimOnerisiPage"));
const PortfoyYonetimiModulPage = lazy(() => import("@/pages/modules/PortfoyYonetimiModulPage"));
const SigortaPazaryeriPage = lazy(() => import("@/pages/modules/SigortaPazaryeriPage"));
const KrediPazaryeriPage = lazy(() => import("@/pages/modules/KrediPazaryeriPage"));
const KentselDonusumPage = lazy(() => import("@/pages/modules/KentselDonusumPage"));
const AfetToplanmaAlanlariPage = lazy(() => import("@/pages/modules/AfetToplanmaAlanlariPage"));
const DepremCantasiPage = lazy(() => import("@/pages/modules/DepremCantasiPage"));
const DepremSigortasiPage = lazy(() => import("@/pages/modules/DepremSigortasiPage"));
const KomsulukRiskAnaliziPage = lazy(() => import("@/pages/modules/KomsulukRiskAnaliziPage"));
const TatbikatRehberiPage = lazy(() => import("@/pages/modules/TatbikatRehberiPage"));
const YapayZekaHasarTahminiPage = lazy(() => import("@/pages/modules/YapayZekaHasarTahminiPage"));
const DepremEgitimiPage = lazy(() => import("@/pages/modules/DepremEgitimiPage"));
const YikilanBinalarArsiviPage = lazy(() => import("@/pages/modules/YikilanBinalarArsiviPage"));
const UzmanRandevuPage = lazy(() => import("@/pages/modules/UzmanRandevuPage"));
const Ders1 = lazy(() => import("@/pages/modules/egitim/Ders1"));
const Ders2 = lazy(() => import("@/pages/modules/egitim/Ders2"));
const Ders3 = lazy(() => import("@/pages/modules/egitim/Ders3"));
const Ders4 = lazy(() => import("@/pages/modules/egitim/Ders4"));
const Ders5 = lazy(() => import("@/pages/modules/egitim/Ders5"));
const Ders6 = lazy(() => import("@/pages/modules/egitim/Ders6"));
const Ders7 = lazy(() => import("@/pages/modules/egitim/Ders7"));
const Ders8 = lazy(() => import("@/pages/modules/egitim/Ders8"));
const Ders9 = lazy(() => import("@/pages/modules/egitim/Ders9"));
const Ders10 = lazy(() => import("@/pages/modules/egitim/Ders10"));

function RedirectHowItWorksPreservingQuery() {
  const { search } = useLocation();
  return <Navigate to={`${ROUTES.HOW_IT_WORKS}${search}`} replace />;
}

function RedirectHowItWorksSubpath({ segment }: { segment: "yol" | "adim" }) {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to={ROUTES.HOW_IT_WORKS} replace />;
  return <Navigate to={`${ROUTES.HOW_IT_WORKS}/${segment}/${slug}`} replace />;
}

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
            <Route
              path="/borsa"
              element={
                <Suspense fallback={<PageLoader label="Borsa terminali yükleniyor..." />}>
                  <BorsaPage />
                </Suspense>
              }
            />
            <Route
              path="/borsa/portfoy"
              element={
                <Suspense fallback={<PageLoader label="Borsa portföy yükleniyor..." />}>
                  <BorsaPortfolioPage />
                </Suspense>
              }
            />
            <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/arama" element={<SearchResults />} />
            <Route path="/ihaleler" element={<LiveAuctions />} />
            <Route path={ROUTES.AUCTIONS} element={<AuctionListPage />} />
            <Route path={ROUTES.ILANLAR} element={<IlanlarKatalog />} />
            <Route path="/ilanlar" element={<IlanlarKatalog />} />
            <Route path="/ilanlar/turizm" element={<Navigate to="/ilanlar/konaklama" replace />} />
            <Route path="/ilanlar/ges" element={<Navigate to="/ilanlar/altyapi" replace />} />
            <Route path="/ilanlar/:kategori/:alt/:tip" element={<IlanlarSegmentRouter />} />
            <Route path="/ilanlar/:kategori/:alt" element={<IlanlarSegmentRouter />} />
            <Route path="/ilanlar/:kategori" element={<IlanlarSegmentRouter />} />
            <Route path="/ilan/:id" element={<AuctionDetail />} />
            <Route path="/teklif-al" element={<TeklifAlPage />} />
            <Route path="/kapali-teklif" element={<KapaliTeklifPage />} />
            <Route path="/emlakci" element={<EmlakciLanding />} />
            <Route path="/emlakci/panel" element={<EmlakciPanelPage />} />
            <Route path="/emlakci/ozellikler/:slug" element={<EmlakciFeaturePage />} />
            <Route path="/muteahhit" element={<MuteahhitLanding />} />
            <Route path="/muteahhit/panel" element={<MuteahhitPanelPage />} />
            <Route path="/takas" element={<TakasPage />} />
            <Route path="/kyc" element={<KycPage />} />
            <Route path="/yorumlar" element={<YorumlarPage />} />
            <Route path="/destek" element={<DestekPage />} />
            <Route path="/reels" element={<ReelsPage />} />
            <Route path="/piyasa-raporlari" element={<PiyasaRaporlariPage />} />
            <Route path="/kat-karsiligi-arsa" element={<LandEquityPage />} />
            <Route path="/yasal/sozlesmeler" element={<SozlesmelerIndexPage />} />
            <Route path="/yasal/sozlesmeler/:slug" element={<SozlesmeTemplatePage />} />
            <Route path="/fiyatlandirma" element={<FiyatlandirmaPage />} />
            <Route path="/bildirimler" element={<BildirimlerPage />} />
            <Route path="/yatirimci/panel" element={<InvestorDashboard />} />
            <Route path="/yasal/guvenlik" element={<SecurityCenter />} />
            <Route path="/kurumsal/basinda-biz" element={<BasindaBizPage />} />
            <Route path="/ihale/:id" element={<AuctionDetail />} />
            <Route path="/ihale/:auctionId/hemen-al" element={<BuyNow />} />
            <Route path="/analiz" element={<Analytics />} />
            <Route path="/karsilastir" element={<Compare />} />
            <Route path="/giris" element={<Login />} />
            <Route path="/kayit" element={<Register />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/ihale-ac" element={<CreateAuction />} />
            <Route path="/favoriler" element={<Favorites />} />
            <Route path="/mortgage" element={<Mortgage />} />
            <Route path="/rehber" element={<Guide />} />
            <Route
              path={ROUTES.HOW_IT_WORKS}
              element={
                <RouteSeo>
                  <NasilCalisir />
                </RouteSeo>
              }
            />
            <Route
              path={`${ROUTES.HOW_IT_WORKS}/yol/:slug`}
              element={
                <RouteSeo>
                  <NasilCalisirJourneyPage />
                </RouteSeo>
              }
            />
            <Route
              path={`${ROUTES.HOW_IT_WORKS}/adim/:slug`}
              element={
                <RouteSeo>
                  <NasilCalisirStepPage />
                </RouteSeo>
              }
            />
            <Route path={ROUTES.NASIL_CALISIR} element={<RedirectHowItWorksPreservingQuery />} />
            <Route path="/nasil-calisir" element={<RedirectHowItWorksPreservingQuery />} />
            <Route path="/nasil-calisir/yol/:slug" element={<RedirectHowItWorksSubpath segment="yol" />} />
            <Route path="/nasil-calisir/adim/:slug" element={<RedirectHowItWorksSubpath segment="adim" />} />
            <Route path="/harita" element={<MapPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/yatirimci" element={<InvestorDashboard />} />
            <Route path="/sehirler" element={<CitiesList />} />
            <Route path="/sehir/:cityName" element={<CityGuide />} />
            <Route path="/bolge" element={<Navigate to="/sehirler" replace />} />
            <Route path="/bolge/:cityName" element={<Navigate to="/sehir/:cityName" replace />} />
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
            <Route path="/anayasa" element={<AnayasaIhalealPage />} />
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
            <Route path="/degisiklikler" element={<Changelog />} />
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
            <Route path="/iletisim" element={<Iletisim />} />
            <Route path="/hakkimizda" element={<About />} />
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
            <Route path="/modul/parsel-zekasi" element={<ParselZekasiPage />} />
            <Route path="/modul/ges-analizi" element={<GesAnaliziModulPage />} />
            <Route path="/modul/degerleme" element={<DegerlemeModulPage />} />
            <Route path="/modul/airbnb-potansiyeli" element={<AirbnbPotansiyelPage />} />
            <Route path="/modul/renovasyon-roi" element={<RenovasyonRoiPage />} />
            <Route path="/modul/afet-risk-haritasi" element={<Navigate to="/modul/deprem-risk-haritasi" replace />} />
            <Route path="/modul/deprem-risk-haritasi" element={<DepremRiskHaritasiPage />} />
            <Route path="/modul/bina-risk-sorgu" element={<BinaRiskSorguPage />} />
            <Route path="/modul/canli-deprem-takip" element={<CanliDepremTakipPage />} />
            <Route path="/modul/aile-acil-plan" element={<AileAcilPlanPage />} />
            <Route path="/modul/guclendirme-rehberi" element={<GuclendirmeRehberiPage />} />
            <Route path="/modul/imar-sorgu" element={<ImarSorguPage />} />
            <Route path="/modul/yatirim-onerisi" element={<YatirimOnerisiPage />} />
            <Route path="/modul/portfoy-yonetimi" element={<PortfoyYonetimiModulPage />} />
            <Route path="/modul/sigorta-pazaryeri" element={<SigortaPazaryeriPage />} />
            <Route path="/modul/kredi-pazaryeri" element={<KrediPazaryeriPage />} />
            <Route path="/modul/kentsel-donusum" element={<KentselDonusumPage />} />
            <Route path="/modul/afet-toplanma-alanlari" element={<AfetToplanmaAlanlariPage />} />
            <Route path="/modul/deprem-cantasi" element={<DepremCantasiPage />} />
            <Route path="/modul/deprem-sigortasi" element={<DepremSigortasiPage />} />
            <Route path="/modul/komsuluk-risk-analizi" element={<KomsulukRiskAnaliziPage />} />
            <Route path="/modul/tatbikat-rehberi" element={<TatbikatRehberiPage />} />
            <Route path="/modul/yapay-zeka-hasar-tahmini" element={<YapayZekaHasarTahminiPage />} />
            <Route path="/modul/deprem-egitimi" element={<DepremEgitimiPage />} />
            <Route path="/modul/deprem-egitimi/ders-1" element={<Ders1 />} />
            <Route path="/modul/deprem-egitimi/ders-2" element={<Ders2 />} />
            <Route path="/modul/deprem-egitimi/ders-3" element={<Ders3 />} />
            <Route path="/modul/deprem-egitimi/ders-4" element={<Ders4 />} />
            <Route path="/modul/deprem-egitimi/ders-5" element={<Ders5 />} />
            <Route path="/modul/deprem-egitimi/ders-6" element={<Ders6 />} />
            <Route path="/modul/deprem-egitimi/ders-7" element={<Ders7 />} />
            <Route path="/modul/deprem-egitimi/ders-8" element={<Ders8 />} />
            <Route path="/modul/deprem-egitimi/ders-9" element={<Ders9 />} />
            <Route path="/modul/deprem-egitimi/ders-10" element={<Ders10 />} />
            <Route path="/modul/yikilan-binalar-arsivi" element={<YikilanBinalarArsiviPage />} />
            <Route path="/modul/uzman-randevu" element={<UzmanRandevuPage />} />
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
    </BrowserRouter>
    </AuthProvider>
    </LocaleProvider>
  );
}

export default App;
