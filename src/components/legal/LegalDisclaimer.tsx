import { AlertTriangle, Scale, BookOpen } from "lucide-react";

/**
 * LegalDisclaimer — tüm hukuki içerikte tutarlı görünmesi için tek nokta.
 *
 * Doktrin (Avukatlık Kanunu 1136 m. 35): ihaleal danışmanlık VERMEZ. Bu metinler
 * "eğitici ön bilgi"; somut olay için **avukat + mali müşavir + noter** zorunlu.
 */

interface LegalDisclaimerProps {
  /** Kompakt mod (alt köşe banner) */
  compact?: boolean;
  /** Ekstra bağlam (örn "muvazaa analizi") */
  context?: string;
}

export function LegalDisclaimer({ compact, context }: LegalDisclaimerProps) {
  if (compact) {
    return (
      <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-100/90 flex items-start gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-amber-200">Eğitici bilgilendirme</strong> — hukuki tavsiye DEĞİLDİR.
          Somut karar öncesi <strong>avukat + mali müşavir + noter</strong> zorunlu (Avukatlık Kanunu 1136 m. 35).
          {context ? <> {context}</> : null}
        </p>
      </div>
    );
  }

  return (
    <div className="my-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-full bg-amber-500/20 p-2">
          <AlertTriangle className="h-5 w-5 text-amber-300" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Yasal Uyarı (Disclaimer)</h3>
          <p className="text-xs text-amber-200 mt-0.5">Bu içerik eğitici amaçlıdır, hukuki tavsiye DEĞİLDİR.</p>
        </div>
      </div>
      <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
        <p>
          <strong className="text-amber-200">ihaleal.com:</strong> bilgi ve aracılık platformudur;
          <strong className="text-white"> hukuki/mali danışmanlık VERMEZ </strong>
          (1136 sayılı Avukatlık Kanunu m. 35). Bu sayfadaki metin, şablon ve analizler{" "}
          <strong className="text-white">örnek/eğitici nitelikte</strong>; somut olay+kişi+bölgeye göre değişir.
        </p>
        <p>
          <strong className="text-amber-200">Karar verirken zorunlu:</strong>
        </p>
        <ul className="ms-4 list-disc text-xs space-y-1">
          <li><strong className="text-white">Baroya kayıtlı avukat</strong> — sözleşme + dava + risk analizi</li>
          <li><strong className="text-white">YMM/SMMM</strong> (Yeminli/Serbest Mali Müşavir) — vergi + denkleştirme + intikal</li>
          <li><strong className="text-white">Noter</strong> — resmi şekil zorunluluğu (tapu/vekalet/satış vaadi)</li>
          <li><strong className="text-white">SPK lisanslı eksper</strong> — değerleme + ekspertiz raporu</li>
        </ul>
        {context ? (
          <p className="text-xs text-amber-100 pt-2 border-t border-amber-500/20 mt-3">
            <strong>Bu sayfa bağlamı:</strong> {context}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Sayfa üstüne taslak/eğitici uyarı banner'ı */
export function LegalDraftBanner() {
  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2">
      <BookOpen className="h-4 w-4 text-amber-300 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-amber-100 leading-relaxed">
        <strong className="text-amber-200">TASLAK / EĞİTİCİ:</strong> bu metin örnek nitelikte; yasal yayın
        öncesi <strong>avukat onayı şarttır</strong>. Mevcut hali bilgilendirme amaçlıdır.
      </p>
    </div>
  );
}

/** Sayfa alt'ı + içtihat referansı (mevzuat şeridi) */
export function LegalCitationStrip({ items }: { items: Array<{ kanun: string; madde?: string }> }) {
  return (
    <div className="mt-6 pt-4 border-t border-slate-700 flex flex-wrap gap-2 items-center">
      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider">
        <Scale className="h-3 w-3" /> Referans Mevzuat
      </span>
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-slate-900/40 px-2 py-0.5 text-[10px] text-violet-200">
          {it.kanun}{it.madde ? ` ${it.madde}` : ""}
        </span>
      ))}
    </div>
  );
}
