import { Suspense, lazy } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { RouteSeo } from "@/components/RouteSeo";
import { Home } from "@/pages/Home";
import "./App.css";

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
const FlowSelector         = lazy(() => import("@/pages/onboarding/FlowSelector"));
const EDevletAuth          = lazy(() => import("@/pages/auth/EDevletAuth"));

function App() {
  return (
    <HashRouter>
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
            <Route path="/ilan/:id" element={<AuctionDetail />} />
            <Route path="/analiz" element={<Analytics />} />
            <Route path="/karsilastir" element={<Compare />} />
            <Route path="/giris" element={<Login />} />
            <Route path="/kayit" element={<Register />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/ihale-ac" element={<CreateAuction />} />
            <Route path="/favoriler" element={<Favorites />} />
            <Route path="/mortgage" element={<Mortgage />} />
            <Route path="/rehber" element={<Guide />} />
            <Route path="/harita" element={<MapPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/yatirimci" element={<InvestorDashboard />} />
            <Route path="/sehirler" element={<CitiesList />} />
            <Route path="/sehir/:cityName" element={<CityGuide />} />
            <Route path="/kvkk" element={<LegalKVKK />} />
            <Route path="/gizlilik" element={<LegalPrivacy />} />
            <Route path="/ihale-kosullari" element={<LegalAuctionTerms />} />
            <Route path="/cerez-politikasi" element={<LegalCookies />} />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
}

export default App;
