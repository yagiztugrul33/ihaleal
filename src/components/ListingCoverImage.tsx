import { useEffect, useState } from "react";
import { LISTING_IMAGE_PLACEHOLDER, normalizeListingImageUrl } from "@/lib/listingImage";
import { ImageIcon } from "lucide-react";

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
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-blue-950/60">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-200">
            <ImageIcon className="h-3.5 w-3.5" aria-hidden />
            Yükleniyor
          </span>
        </span>
      ) : null}
    </span>
  );
}
