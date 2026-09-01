/** Taslak hukuki uyarı — profesyonel görüş değildir. */
export function AIRaporSorumluluk({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-[11px] text-slate-500 leading-relaxed border border-slate-200 rounded-[10px] px-3 py-2 bg-black/20">
        Bu çıktı <strong className="text-slate-400">bilgilendirme amaçlıdır</strong>; profesyonel ekspertiz veya hukuki tavsiye yerine geçmez (taslak).
      </p>
    );
  }
  return (
    <div className="rounded-[20px] border border-cyan-400/20 bg-cyan-500/5 p-4 space-y-2 text-sm text-slate-300 leading-relaxed">
      <p className="font-normal text-white text-base">AI raporu — sorumluluk reddi (taslak)</p>
      <p>
        Bu rapor bilgilendirme amaçlıdır ve <strong className="text-white">profesyonel ekspertiz veya hukuki tavsiye yerine geçmez</strong>. Gayrimenkul değerlemesi, tapu
        kayıtları, şerhler ve idari süreçler için yetkili kurumlar ve uzmanlar ile doğrulama yapılmalıdır.
      </p>
      <p className="text-xs text-slate-500">Metin taslaktır; yayın öncesi hukuk ve uyum ekibi tarafından güncellenmelidir.</p>
    </div>
  );
}
