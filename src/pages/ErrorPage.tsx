import { Link } from "react-router-dom";
import { Home, RefreshCw } from "lucide-react";
import { BrandLockup } from "@/components/Logo";

interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
}

export default function ErrorPage({ error, resetError }: ErrorPageProps) {
  const onRetry = (): void => {
    if (resetError) resetError();
    else window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 py-16 text-center">
      <BrandLockup logoSize="md" layout="stack" showSlogan={false} />
      <h1 className="text-7xl sm:text-8xl font-normal text-[var(--metin-ikincil)] mt-6">500</h1>
      <h2 className="text-2xl sm:text-3xl font-normal mt-4 text-white">Bir sorun oluştu</h2>
      <p className="text-slate-400 mt-4 max-w-md mx-auto leading-relaxed">
        Sayfa yüklenirken beklenmedik bir hata oluştu. Lütfen tekrar deneyin; sorun sürerse ana sayfadan devam edin.
      </p>
      {import.meta.env.DEV && error?.message ? (
        <p className="text-xs text-slate-500 mt-3 font-mono max-w-lg break-words">{error.message}</p>
      ) : null}
      <div className="flex flex-wrap gap-3 justify-center mt-10">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] [background:var(--gradient-cta)] text-white font-normal hover:opacity-95 transition-opacity"
        >
          <RefreshCw className="h-5 w-5" />
          Tekrar Dene
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] border border-white/15 text-slate-200 hover:bg-white/5 transition-colors"
        >
          <Home className="h-5 w-5" />
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
