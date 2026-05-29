import { Link } from "react-router-dom";
import { BrandLockup } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 intelligence-page">
      <BrandLockup logoSize="lg" layout="stack" showSlogan />
      <h1 className="text-6xl font-bold mt-8 mb-4 text-white">404</h1>
      <p className="text-xl text-slate-400 mb-8 text-center max-w-md">
        Aradığınız sayfa bulunamadı.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-amber-500 text-slate-950 rounded-lg font-bold hover:bg-amber-400 transition-colors"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
