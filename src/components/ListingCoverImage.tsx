import { useEffect, useState } from "react";
import { LISTING_IMAGE_PLACEHOLDER } from "@/lib/listingImage";

type Props = {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export function ListingCoverImage({ src, alt, className, loading = "lazy" }: Props) {
  const [url, setUrl] = useState(src);

  useEffect(() => {
    setUrl(src);
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
