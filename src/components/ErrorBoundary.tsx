import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorPage from "@/pages/ErrorPage";
import { clientLogError } from "@/lib/clientLog";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/** PWA SW + lazy chunk migration safety:
 *  Yeni deploy sonrası eski cache hash'leri 404 → dinamik import patlar.
 *  İlk defa görüldüğünde: SW unregister + tüm cache temizle + tek sefer reload.
 *  Reload sonrası aynı hata gelirse "gerçek" hata gibi ErrorPage göster.
 */
const CHUNK_ERR_RX =
  /Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed|ChunkLoadError/i;
const CHUNK_RELOAD_FLAG = "__ihaleal_chunk_recovery_reloaded__";

function isChunkLoadError(error: Error | undefined): boolean {
  if (!error) return false;
  const blob = `${error.name} ${error.message} ${error.stack ?? ""}`;
  return CHUNK_ERR_RX.test(blob);
}

async function attemptChunkRecovery(): Promise<boolean> {
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_FLAG) === "1") return false;
    sessionStorage.setItem(CHUNK_RELOAD_FLAG, "1");

    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
    }
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
    }
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    clientLogError("ErrorBoundary", error, {
      hasStack: Boolean(info.componentStack),
      isChunkLoad: isChunkLoadError(error),
    });
    // PWA chunk migration safety — eski SW cache + yeni deploy paradoksu.
    if (isChunkLoadError(error)) {
      void attemptChunkRecovery();
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorPage
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }
    return this.props.children;
  }
}
