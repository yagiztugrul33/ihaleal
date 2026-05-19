import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Home, Shield, UserCheck, type LucideIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { NasilCalisirJourney } from "@/data/nasilCalisirContent";

const JOURNEY_ICONS: Record<NasilCalisirJourney["icon"], LucideIcon> = {
  Home,
  UserCheck,
  Building2,
  Shield,
};

export function NasilCalisirBackNav() {
  return (
    <div className="pb-4">
      <Link
        to={ROUTES.HOW_IT_WORKS}
        className="inline-flex items-center gap-2 mb-4 -ml-2 text-sm font-medium"
        style={{ color: "var(--color-text-muted)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Nasıl çalışır ana sayfa
      </Link>
    </div>
  );
}

export function RelatedLinksBlock({
  title,
  links,
}: {
  title: string;
  links: { label: string; path: string; note?: string }[];
}) {
  return (
    <section className="mt-10">
      <h3 className="text-lg font-bold mb-4" style={{ color: "var(--color-text)" }}>
        {title}
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.path + link.label}
            to={link.path}
            className="flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm no-underline hover:border-blue-500/40 transition-colors"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            <span>
              {link.label}
              {link.note ? (
                <span className="block text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {link.note}
                </span>
              ) : null}
            </span>
            <ArrowRight className="w-4 h-4 shrink-0" style={{ color: "var(--color-primary)" }} />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function JourneyIcon({ icon }: { icon: NasilCalisirJourney["icon"] }) {
  const Icon = JOURNEY_ICONS[icon];
  return (
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
      style={{ background: "var(--color-bg-soft)", color: "var(--color-primary)" }}
    >
      <Icon className="w-7 h-7" />
    </div>
  );
}
