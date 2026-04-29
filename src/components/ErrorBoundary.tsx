import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Üretimde Sentry vb. buraya bağlanır
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1e] px-6 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Bir hata oluştu</h2>
          <p className="text-slate-400 mb-6 max-w-md">
            Sayfayı yenileyin veya daha sonra tekrar deneyin. Sorun sürerse destek ile iletişime geçin.
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 text-white font-medium"
            onClick={() => window.location.reload()}
          >
            Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
