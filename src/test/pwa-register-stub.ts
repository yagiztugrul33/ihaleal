/** Vitest: `virtual:pwa-register` yerine no-op (SW üretimi yok). */
export function registerSW(_options?: {
  immediate?: boolean;
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
}) {}
