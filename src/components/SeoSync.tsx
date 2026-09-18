import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applySeoToDocument } from "@/lib/seo";
import { injectJsonLd, removeJsonLd } from "@/lib/seoStructuredData";
import { SITE_ORIGIN } from "@/data/siteOrigin";

/** Site geneli, rota bağımsız — bir kez enjekte edilir. */
function injectSiteJsonLd() {
  injectJsonLd("site-organization", {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: "İhaleal",
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/ihaleal-logo.png`,
    sameAs: [],
  });
  injectJsonLd("site-website", {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    name: "İhaleal",
    url: SITE_ORIGIN,
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_ORIGIN}/arama?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });
}

export function SeoSync() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    applySeoToDocument(pathname, search);
  }, [pathname, search]);

  useEffect(() => {
    injectSiteJsonLd();
    return () => {
      removeJsonLd("site-organization");
      removeJsonLd("site-website");
    };
  }, []);

  return null;
}
