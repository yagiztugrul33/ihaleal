import { useEffect, useState } from "react";
import { LISTING_IMAGE_PLACEHOLDER } from "@/lib/listingImage";

type Props = {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

function normalizeImageUrl(input: string): string {
  const raw = String(input ?? "").trim();
  if (!raw) return LISTING_IMAGE_PLACEHOLDER;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  if (raw.startsWith("/")) return raw;
  return `/${raw.replace(/^\.?\//, "")}`;
}

export function ListingCoverImage({ src, alt, className, loading = "lazy" }: Props) {
  const [url, setUrl] = useState(() => normalizeImageUrl(src));

  useEffect(() => {
    setUrl(normalizeImageUrl(src));
  }, [src]);

  return (
    <img
      loading={loading}
      src={url}
      alt={alt}
      className={className}
      onError={() => setUrl((u) => (u === LISTING_IMAGE_PLACEHOLDER ? u : LISTING_IMAGE_PLACEHOLDER))}
    />
  );
}
