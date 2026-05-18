import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export interface PageShellProps {
  badge?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  cta?: { label: string; to: string };
  className?: string;
}

export function PageShell({ badge, title, subtitle, children, cta, className = "" }: PageShellProps) {
  return (
    <div className={`min-h-screen pt-20 pb-16 ${className}`}>
      <section className="hero-warm py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center relative z-10">
          {badge ? <span className="badge-corp mb-4 inline-block">{badge}</span> : null}
          <h1
            className="text-3xl md:text-5xl font-bold leading-tight tracking-tight"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-5 max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              {subtitle}
            </p>
          ) : null}
          {cta ? (
            <div className="mt-8">
              <Link to={cta.to} className="btn-primary">
                {cta.label}
              </Link>
            </div>
          ) : null}
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </div>
  );
}
