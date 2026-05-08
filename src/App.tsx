import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteSeo } from "@/components/RouteSeo";
import { Home } from "@/pages/Home";
import "./App.css";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { PageLoader } from "@/components/ui/PageLoader";
import { SEO_LANDING_PAGES } from "@/data/seoLandings";
import { KKA_HUB_PATH, KKA_STUDIO_PATH } from "@/lib/kkaHub";
import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";

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

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <ErrorBoundary>
      <Layout>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Yukleniyor...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/arama" element={<SearchResults />} />
            <Route path="/ihaleler" element={<LiveAuctions />} />
            <Route path="/ilanlar" element={<AuctionListPage />} />
            <Route path="/ilan/:id" element={<AuctionDetail />} />
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
              path="/nasil-calisir"
              element={
                <RouteSeo>
                  <NasilCalisir />
                </RouteSeo>
              }
            />
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
            <Route path="/emlakci-giris" element={<EmlakciGiris />} />
            <Route path="/araclar/vergi-simulator" element={<TaxSimulatorPage />} />
            <Route path="/araclar/finans-uyumluluk" element={<FinCompliancePlayground />} />
            <Route path="/degerleme" element={<ValuationTool />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
      </ErrorBoundary>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
