import { Link } from "react-router-dom";
import { BrandLockup } from "@/components/Logo";
import { Search, Home as HomeIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 intelligence-page">
      <BrandLockup logoSize="lg" layout="stack" showSlogan />
      <h1 className="text-6xl font-normal mt-8 mb-4 text-white">404</h1>
      <p className="text-xl text-slate-400 mb-2 text-center max-w-md">
        Aradığınız sayfa bulunamadı veya taşınmış olabilir.
      </p>
      <p className="text-sm text-slate-500 mb-8 text-center max-w-md">
        Adresi kontrol edin veya aşağıdaki bağlantılardan devam edin.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-950 rounded-[10px] font-normal hover:bg-amber-400 transition-colors"
        >
          <HomeIcon className="h-4 w-4" />
          Ana sayfaya dön
        </Link>
        <Link
          to="/ilanlar"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] border border-white/15 text-slate-200 hover:bg-white/5"
        >
          İlanları gör
        </Link>
        <Link
          to="/arama"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] border border-white/15 text-slate-200 hover:bg-white/5"
        >
          <Search className="h-4 w-4" />
          Arama
        </Link>
      </div>
    </div>
  );
}
