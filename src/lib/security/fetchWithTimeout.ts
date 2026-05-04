/**
 * Ağ asılı kalmasini ve sınırsız bekleme kaynak tüketimini azaltmak için fetch sarmalayıcısı.
 */
export function createFetchWithTimeout(timeoutMs: number): typeof fetch {
  return (input, init) => {
    const ctrl = new AbortController();

    const outer = init?.signal;
    const onOuterAbort = () => ctrl.abort(outer?.reason);
    if (outer) {
      if (outer.aborted) {
        ctrl.abort(outer.reason);
      } else {
        outer.addEventListener("abort", onOuterAbort, { once: true });
      }
    }

    const timer = window.setTimeout(() => {
      ctrl.abort(new DOMException(`İstek zaman aşımı (${timeoutMs} ms)`, "AbortError"));
    }, timeoutMs);

    return fetch(input, { ...init, signal: ctrl.signal }).finally(() => {
      window.clearTimeout(timer);
      outer?.removeEventListener("abort", onOuterAbort);
    });
  };
}