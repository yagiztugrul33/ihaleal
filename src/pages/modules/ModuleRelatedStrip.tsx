import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export interface RelatedModuleCard {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export function ModuleRelatedStrip({ title = "İlgili modüller", modules }: { title?: string; modules: RelatedModuleCard[] }) {
  return (
    <section className="mod-related" aria-labelledby="mod-related-title">
      <h2 id="mod-related-title" className="mod-related__title">
        {title}
      </h2>
      <div className="mod-related__grid">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.href} to={m.href} className="mod-related__card">
              <span className="mod-related__icon" aria-hidden>
                <Icon className="h-5 w-5 text-sky-300" />
              </span>
              <div className="mod-related__body">
                <h3 className="mod-related__card-title">{m.title}</h3>
                <p className="mod-related__card-desc">{m.description}</p>
                <span className="mod-related__cta">
                  Modüle git
                  <ArrowRight className="rtl:rotate-180 h-3.5 w-3.5" aria-hidden />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
