/**
 * TaxDisclaimerBanner.tsx
 * İhaleAL — Vergi Simülatörü "Bilgilendirme / Tahmin" vs "Resmi Vergi" Ayrımı
 * Tüm vergi hesaplama ekranlarında zorunlu disclaimer banner.
 */
import { AlertTriangle, ShieldCheck } from "lucide-react";

export function TaxDisclaimerBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium">Bilgilendirme:</span>
          <span>Bu hesaplama tahmini ve bilgilendirme amaçlıdır. Resmi vergi hesabı değildir.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
          <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-300" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="font-semibold">Bu Hesaplama Bilgilendirme Amaçlıdır</p>
          <p className="leading-relaxed text-amber-800 dark:text-amber-200">
            Aşağıdaki hesaplama, mevcut mevzuat ve endeks verileri kullanılarak üretilmiş{" "}
            <strong>tahmini</strong> bir simülasyondur. Resmi vergi hesabı değildir.
          </p>
          <ul className="list-disc space-y-1 pl-4 text-amber-700 dark:text-amber-300">
            <li>Kesin vergi yükümlülüğü için YMM (Yeminli Mali Müşavir) onayı gereklidir.</li>
            <li>Tapu harcı oranları belediye ve tapu sicil müdürlüğüne göre değişebilir.</li>
            <li>Yİ-ÜFE endeks verileri TÜİK kaynaklıdır; güncel olmayabilir.</li>
            <li>5 yıllık GV istisna kuralı için YMM kararı ve tapu sicil kaydı şarttır.</li>
          </ul>
          <div className="flex items-center gap-2 pt-1">
            <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
              İhaleAL platformu vergi danışmanlığı yapmaz; sorumluluk kullanıcıya aittir.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InvoiceDisclaimerBanner() {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100">
      <div className="flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="space-y-1">
          <p className="font-semibold">e-Fatura & Muhasebe Bilgilendirmesi</p>
          <p className="text-blue-800 dark:text-blue-200">
            Fatura satırları onaylı şablonlardan üretilir. "Komisyon" kelimesi yasaklıdır;
            fatura içeriği YMM + avukat onaylı şablon tablosundan gelir.
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Teknokent KDV istisnası sadece onaylı sözleşme + proje kodu + aktif tax_profile ile uygulanır.
          </p>
        </div>
      </div>
    </div>
  );
}
