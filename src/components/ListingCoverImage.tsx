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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUrl(normalizeImageUrl(src));
    setLoaded(false);
  }, [src]);

  return (
    <img
      loading={loading}
      decoding="async"
      src={url}
      alt={alt}
      className={`${className ?? ""} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(14, 116, 144, 0.35) 0%, rgba(30, 64, 175, 0.35) 48%, rgba(15, 23, 42, 0.65) 100%)",
      }}
      onLoad={() => setLoaded(true)}
      onError={() => setUrl((u) => (u === LISTING_IMAGE_PLACEHOLDER ? u : LISTING_IMAGE_PLACEHOLDER))}
    />
  );
}
