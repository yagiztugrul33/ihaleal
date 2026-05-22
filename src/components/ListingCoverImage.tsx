import { useEffect, useState } from "react";
import { LISTING_IMAGE_PLACEHOLDER, normalizeListingImageUrl } from "@/lib/listingImage";

type Props = {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export function ListingCoverImage({ src, alt, className, loading = "lazy" }: Props) {
  const [url, setUrl] = useState(() => normalizeListingImageUrl(src));
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setUrl(normalizeListingImageUrl(src));
    setLoaded(false);
    setErrored(false);
  }, [src]);

  return (
    <span className={`relative block overflow-hidden ${className ?? ""}`}>
      <img
        loading={loading}
        decoding="async"
        src={url}
        alt={alt}
        className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{
          background:
            "linear-gradient(135deg, rgba(14, 116, 144, 0.35) 0%, rgba(30, 64, 175, 0.35) 48%, rgba(15, 23, 42, 0.65) 100%)",
        }}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (url === LISTING_IMAGE_PLACEHOLDER) {
            setErrored(true);
            setLoaded(true);
            return;
          }
          setErrored(true);
          setUrl(LISTING_IMAGE_PLACEHOLDER);
        }}
      />
      {!loaded || errored ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/70 px-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-slate-100">
          Gorsel yok
        </span>
      ) : null}
    </span>
  );
}
