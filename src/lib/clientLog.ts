/** Küçük istemci log yardımcısı: üretimde hassas ayrıntıları kullanıcıya sızdırmayın. */
export function clientLogError(
  scope: string,
  error: unknown,
  extra?: Record<string, string | number | boolean | undefined>
): void {
  const isDev = Boolean(import.meta.env.DEV);
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Bilinmeyen hata";

  if (isDev) {
    void extra;
    console.error(`[${scope}]`, msg, error, extra);
    return;
  }

  console.error(`[${scope}]`, { message: "İşlem sırasında bir hata oluştu", code: scope });
}