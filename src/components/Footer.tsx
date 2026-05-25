import { useNavigate } from "react-router-dom";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { KKA_HUB_PATH, KKA_STUDIO_PATH } from "@/lib/kkaHub";
import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";
import { BrandLockup } from "@/components/Logo";
import { PLATFORM_LEGAL_DEFINITION, PSP_FLOW_DISCLAIMER } from "@/legal/platformDisclaimers";
import { isProdBuild } from "@/lib/runtimeFlags";

type FooterLink = { label: string; to: string };

function FooterColumn({
  title,
  links,
  onGo,
}: {
  title: string;
  links: FooterLink[];
  onGo: (to: string) => void;
}) {
  return (
    <div className="min-w-0">
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.to}>
            <button
              type="button"
              onClick={() => onGo(link.to)}
              className="text-left text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const corporateLinks: FooterLink[] = [
    { label: "Hakkımızda", to: "/hakkimizda" },
    { label: "İletişim", to: "/iletisim" },
    { label: "Güvenlik", to: "/guvenlik" },
    { label: "SSS", to: "/sss" },
    { label: "Reklam", to: "/reklam" },
  ];
  const legalLinks: FooterLink[] = [
    { label: "KVKK", to: "/kvkk" },
    { label: "Kullanım Koşulları", to: "/kullanim-kosullari" },
    { label: "Gizlilik Politikası", to: "/gizlilik" },
    { label: "Çerez Politikası", to: "/cerez-politikasi" },
    { label: "Mesafeli Satış Sözleşmesi", to: "/mesafeli-satis-sozlesmesi" },
    { label: "İade ve İptal", to: "/iade-iptal" },
  ];
  const platformLinks: FooterLink[] = [
    { label: "İhaleler", to: "/ihaleler" },
    { label: "Borsa", to: "/borsa" },
    { label: "Analiz", to: "/analiz" },
    { label: "Evraklar", to: "/evraklar" },
    { label: "Nasıl Çalışır", to: "/nasil-calisir" },
    { label: "Satıcı Modu", to: "/sat-basla" },
  ];
  const toolsLinks: FooterLink[] = [
    { label: "Komisyon Hesaplayıcı", to: "/komisyon-hesaplayici" },
    { label: "Vergi Simülatörü", to: "/araclar/vergi-simulator" },
    { label: "KKA Modülü", to: KKA_HUB_PATH },
    { label: "İmar Stüdyosu", to: KKA_STUDIO_PATH },
    { label: "Araştırma Terminali", to: INTELLIGENCE_HUB_PATH },
    { label: "Finans / Uyum", to: "/araclar/finans-uyumluluk" },
  ];
  const complianceLinks: FooterLink[] = [
    { label: "İhale Koşulları", to: "/ihale-kosullari" },
    { label: "Dolandırıcılık Savunması", to: "/yasal/dolandiricilik-savunmasi" },
    { label: "Platform ve KİK Çerçevesi", to: PLATFORM_FRAMEWORK_PATH },
    { label: "Değişiklik Kayıtları", to: "/degisiklikler" },
    { label: "Felaket Kurtarma", to: "/yedekleme" },
    { label: "Canlıya Hazırlık", to: "/canliya-hazirlik" },
    { label: "Nihai Sistem Anayasası", to: "/nihai-anayasa" },
    { label: "Yasal Çerçeve Taslağı", to: "/yasal-cerceve" },
  ];

  return (
    <footer className="relative overflow-x-hidden border-t border-border bg-card">
      <div className="relative mx-auto max-w-[1280px] px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <div className="min-w-0">
            <div className="mb-5 flex w-fit items-center rounded-xl bg-card px-2.5 py-2 ring-1 ring-border">
              <BrandLockup logoSize="lg" showSlogan sloganClassName="text-[10px] tracking-[0.2em] text-amber-200/90" />
            </div>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Türkiye&apos;nin gayrimenkul ticaret ve açık artırma platformu. AI destekli analiz, şeffaf süreç ve denetlenebilir ihale akışı.
            </p>
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-200/90">
              <p>{PLATFORM_LEGAL_DEFINITION}</p>
              <p className="mt-1">{PSP_FLOW_DISCLAIMER}</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +90 212 123 45 67</p>
              <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> info@ihaleal.com</p>
              <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> İstanbul, Türkiye</p>
              <p className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> 09:00 - 18:00 (Hafta içi)</p>
            </div>
          </div>

          <FooterColumn title="Kurumsal" links={corporateLinks} onGo={navigate} />
          <FooterColumn title="Hukuki" links={legalLinks} onGo={navigate} />
          <FooterColumn title="Platform" links={platformLinks} onGo={navigate} />
          <FooterColumn title="Araçlar" links={toolsLinks} onGo={navigate} />
        </div>

        {!isProdBuild ? (
          <div className="mt-8 rounded-xl border border-border bg-secondary/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Belgeler & Uyum</p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
              {complianceLinks.map((link) => (
                <button
                  key={link.to}
                  type="button"
                  onClick={() => navigate(link.to)}
                  className="text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {year} ihaleal.com. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Yapay zeka destekli gayrimenkul platformu</span>
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
