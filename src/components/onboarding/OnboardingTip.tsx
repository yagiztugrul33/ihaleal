import { useState } from "react";
import { Link } from "react-router-dom";
import { X, Compass } from "lucide-react";

const STORAGE_KEY = "ihaleal_onboarding_dismissed";
// CookieConsent ile AYNI anahtar — iki bildirimin sırasını bu belirliyor.
const COOKIE_KEY = "ihaleal_cookie_consent_v1";

export function OnboardingTip() {
  // Karar ILK render'da veriliyor. Daha once useState(false) + useEffect ile aciliyordu;
  // ipucu ilk boyamadan SONRA eklenince ana sayfa 168px asagi kayiyor ve CLS'in tamamini
  // (0.186) bu tek kayma uretiyordu. Uygulama saf istemci tarafi (Vite SPA) oldugu icin
  // localStorage render aninda okunabilir.
  //
  // SIRALI GOSTERIM: cerez karari verilmemisse bu ipucu HIC render edilmez.
  // Ekran goruntusuyle dogrulandi — ikisi ayni anda cikinca 375px'te ilk ekranin
  // neredeyse tamami iki bildirimle doluyor ve gercek icerik gorunmuyordu.
  // Once cerez karari, sonraki ziyarette ipucu. Geciktirme DEGIL, ilk render'da
  // karar: sonradan DOM'a eklemek yukaridaki CLS sorununu geri getirirdi.
  const [visible, setVisible] = useState(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return false;
      return Boolean(localStorage.getItem(COOKIE_KEY));
    } catch {
      return false;
    }
  });

  if (!visible) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
      <div className="mb-4 flex flex-col gap-3 rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Compass className="h-5 w-5 shrink-0 text-[var(--metin-ikincil)] mt-0.5" />
          <div>
            <p className="text-sm font-normal text-white">İlk adımlar</p>
            <p className="text-xs text-slate-300 mt-0.5">
              İlanları keşfedin, favorilere ekleyin veya{" "}
              <Link to="/arama" className="text-[var(--metin-ikincil)] underline">
                arama kaydedin
              </Link>{" "}
              — yeni eşleşmelerde bildirim alırsınız.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link to="/ilanlar" className="rounded-[10px] bg-[var(--zemin-yumusak)] px-3 py-1.5 text-xs font-normal text-white hover:bg-[var(--zemin-yumusak)]">
            İlanları gör
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-[10px] border border-white/15 px-2 py-1.5 text-xs text-slate-300 hover:bg-white/5"
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, "1");
              setVisible(false);
            }}
          >
            <X className="h-3.5 w-3.5" /> Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
