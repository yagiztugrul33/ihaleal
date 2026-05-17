import { Navigate } from "react-router-dom";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";

export default function LandInvestmentPage() {
  return <Navigate to={INTELLIGENCE_HUB_PATH} replace />;
}
