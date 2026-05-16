/**
 * Taslak metin — hukuki danışmanlık yerine geçmez.
 * Cayma ve kesinti politikası ürün koşullarında netleştirilmelidir.
 */
export function CaymaPolitikasi({
  accepted,
  onAcceptedChange,
}: {
  accepted: boolean;
  onAcceptedChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/[0.03] p-4 space-y-3 text-xs text-slate-400 leading-relaxed">
      <p className="text-sm font-semibold text-white">Cayma ve kesinti politikası (taslak)</p>
      <p>
        Ön yetkilendirme (blokaj) sonrası işlemden cayma halinde, platform ve ödeme kuruluşu masraflarını karşılamak üzere{" "}
        <strong className="text-slate-200">yaklaşık %10</strong> hizmet kesintisi ve kalan tutarın iadesi hedeflenir; kesin oranlar sözleşme ve ödeme sağlayıcı
        kurallarına bağlıdır.
      </p>
      <p>
        KVKK kapsamında kişisel verileriniz; kimlik doğrulama, ödeme riski, hukuka uygunluk ve denetim amaçlarıyla işlenebilir (taslak bilgilendirme). Ayrıntılı metin için{" "}
        <strong className="text-slate-300">aydınlatma ve açık rıza</strong> dokümanları güncellenecektir.
      </p>
      <label className="flex items-start gap-2 cursor-pointer text-slate-300">
        <input type="checkbox" checked={accepted} onChange={(e) => onAcceptedChange(e.target.checked)} className="mt-0.5 rounded border-white/20" />
        <span>Taslak cayma ve kesinti koşullarını okudum ve kabul ediyorum.</span>
      </label>
    </div>
  );
}
