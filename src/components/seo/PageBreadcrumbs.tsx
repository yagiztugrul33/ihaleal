import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { injectJsonLd, removeJsonLd } from "@/lib/seoStructuredData";
import { getShareUrlForPath } from "@/data/siteOrigin";

export type BreadcrumbCrumb = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbCrumb[];
  jsonLdId?: string;
  className?: string;
};

export function PageBreadcrumbs({ items, jsonLdId = "page-breadcrumb", className }: Props) {
  useEffect(() => {
    if (items.length === 0) return;
    const list = items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: getShareUrlForPath(item.href, "") } : {}),
    }));
    injectJsonLd(jsonLdId, {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: list,
    });
    return () => removeJsonLd(jsonLdId);
  }, [items, jsonLdId]);

  if (items.length === 0) return null;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <BreadcrumbItem key={`${item.label}-${i}`}>
              {last || !item.href ? (
                <BreadcrumbPage className="text-slate-400">{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.href} className="text-slate-500 hover:text-[var(--metin-ikincil)]">
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
              {!last ? <BreadcrumbSeparator /> : null}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
