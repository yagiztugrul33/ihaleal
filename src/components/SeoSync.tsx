import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applySeoToDocument } from "@/lib/seo";

export function SeoSync() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    applySeoToDocument(pathname, search);
  }, [pathname, search]);
  return null;
}
