import { Link } from "react-router-dom";
import { Home, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
}

export default function ErrorPage({ error, resetError }: ErrorPageProps) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-9xl font-bold text-red-300 dark:text-red-700">500</h1>
      <h2 className="text-3xl font-semibold mt-4">Bir Hata Oluştu</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-md mx-auto">
        Üzgünüz, beklenmedik bir sorun yaşadık. Lütfen tekrar deneyin.
      </p>
      {error?.message && <p className="text-xs text-gray-500 mt-2 font-mono">{error.message}</p>}
      <div className="flex gap-3 justify-center mt-8">
        <button
          type="button"
          onClick={resetError || (() => window.location.reload())}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          Tekrar Dene
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Home className="h-5 w-5" />
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
