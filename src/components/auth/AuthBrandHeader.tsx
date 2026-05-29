import { Link } from "react-router-dom";
import { BrandLockup, BRAND_SLOGAN } from "@/components/Logo";
import { cn } from "@/lib/utils";

type AuthBrandHeaderProps = {
  title: string;
  subtitle: string;
  className?: string;
  /** Kurumsal / müteahhit rozet satırı (isteğe bağlı) */
  badge?: React.ReactNode;
};

/**
 * OAuth / enterprise auth layout — centered brand lockup (WCAG 2.2 friendly hierarchy).
 */
export function AuthBrandHeader({ title, subtitle, className, badge }: AuthBrandHeaderProps) {
  return (
    <header className={cn("mb-6 flex flex-col items-center text-center", className)}>
      <Link
        to="/"
        className={cn(
          "mb-5 inline-flex rounded-xl no-underline",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        )}
        aria-label={`ihaleal.com — ${BRAND_SLOGAN}`}
      >
        <BrandLockup logoSize="lg" layout="stack" showSlogan tone="auth" />
      </Link>
      {badge ? <div className="mb-3">{badge}</div> : null}
      <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h1>
      <p className="mt-2 max-w-[22rem] text-sm leading-relaxed text-slate-400">{subtitle}</p>
    </header>
  );
}
