/**
 * TaxDisclaimerBanner.tsx
 * İhaleAL — Vergi Simülatörü "Bilgilendirme / Tahmin" vs "Resmi Vergi" Ayrımı
 * Tüm vergi hesaplama ekranlarında zorunlu disclaimer banner.
 */
import { AlertTriangle, ShieldCheck } from "lucide-react";

export function TaxDisclaimerBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-2 text-xs text-[var(--metin-ikincil)] dark:border-[var(--cizgi)] dark:bg-[var(--zemin-yumusak)] dark:text-[var(--metin-ikincil)]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-normal">Bilgilendirme:</span>
          <span>Bu hesaplama tahmini ve bilgilendirme amaçlıdır. Resmi vergi hesabı değildir.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-4 text-sm text-[var(--metin-ikincil)] dark:border-[var(--cizgi)] dark:bg-[var(--zemin-yumusak)] dark:text-[var(--metin-ikincil)]">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-[var(--zemin-yumusak)] p-2 dark:bg-[var(--zemin-yumusak)]">
          <AlertTriangle className="h-5 w-5 text-[var(--metin-ikincil)] dark:text-[var(--metin-ikincil)]" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="font-normal">Bu Hesaplama Bilgilendirme Amaçlıdır</p>
          <p className="leading-relaxed text-[var(--metin-ikincil)] dark:text-[var(--metin-ikincil)]">
            Aşağıdaki hesaplama, mevcut mevzuat ve endeks verileri kullanılarak üretilmiş{" "}
            <strong>tahmini</strong> bir simülasyondur. Resmi vergi hesabı değildir.
          </p>
          <ul className="list-disc space-y-1 ps-4 text-[var(--metin-ikincil)] dark:text-[var(--metin-ikincil)]">
            <li>Kesin vergi yükümlülüğü için YMM (Yeminli Mali Müşavir) onayı gereklidir.</li>
            <li>Tapu harcı oranları belediye ve tapu sicil müdürlüğüne göre değişebilir.</li>
            <li>Yİ-ÜFE endeks verileri TÜİK kaynaklıdır; güncel olmayabilir.</li>
            <li>5 yıllık GV istisna kuralı için YMM kararı ve tapu sicil kaydı şarttır.</li>
          </ul>
          <div className="flex items-center gap-2 pt-1">
            <ShieldCheck className="h-4 w-4 text-[var(--metin-ikincil)] dark:text-[var(--metin-ikincil)]" />
            <span className="text-xs font-normal text-[var(--metin-ikincil)] dark:text-[var(--metin-ikincil)]">
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
    <div className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-4 text-sm text-[var(--metin-ikincil)] dark:border-[var(--cizgi)] dark:bg-[var(--zemin-yumusak)] dark:text-[var(--metin-ikincil)]">
      <div className="flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--metin-ikincil)] dark:text-[var(--metin-ikincil)]" />
        <div className="space-y-1">
          <p className="font-normal">e-Fatura & Muhasebe Bilgilendirmesi</p>
          <p className="text-[var(--metin-ikincil)] dark:text-[var(--metin-ikincil)]">
            Fatura satırları onaylı şablonlardan üretilir. "Komisyon" kelimesi yasaklıdır;
            fatura içeriği YMM + avukat onaylı şablon tablosundan gelir.
          </p>
          <p className="text-xs text-[var(--metin-ikincil)] dark:text-[var(--metin-ikincil)]">
            Teknokent KDV istisnası sadece onaylı sözleşme + proje kodu + aktif tax_profile ile uygulanır.
          </p>
        </div>
      </div>
    </div>
  );
}
