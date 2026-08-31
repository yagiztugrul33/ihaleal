import { useCallback, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Sparkles, Video, X } from "lucide-react";
import { ListingCoverImage } from "@/components/ListingCoverImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { gallerySlide, luxurySpring } from "@/lib/motion/presets";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type GalleryBadge = {
  label: ReactNode;
  className?: string;
};

type CinematicPropertyGalleryProps = {
  images: string[];
  title: string;
  badges?: GalleryBadge[];
  aiPredictedPrice?: number;
  liveBid?: number;
  investmentScore?: number;
  onVirtualTour?: () => void;
  hasVirtualTour?: boolean;
};

export function CinematicPropertyGallery({
  images,
  title,
  badges = [],
  aiPredictedPrice,
  liveBid,
  investmentScore,
  onVirtualTour,
  hasVirtualTour,
}: CinematicPropertyGalleryProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchStart = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => {
      setDirection(delta);
      setIndex((prev) => {
        const next = prev + delta;
        if (next < 0) return images.length - 1;
        if (next >= images.length) return 0;
        return next;
      });
    },
    [images.length],
  );

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(diff) > 50) go(diff > 0 ? -1 : 1);
    touchStart.current = null;
  };

  const discountPct =
    aiPredictedPrice && liveBid && aiPredictedPrice > liveBid
      ? (((aiPredictedPrice - liveBid) / aiPredictedPrice) * 100).toFixed(1)
      : null;

  return (
    <>
      <div
        className="property-gallery-cinematic relative -mx-4 sm:mx-0 sm:rounded-2xl overflow-hidden mb-8 border border-white/10 shadow-2xl shadow-black/40"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <motion.div
          className="absolute inset-0 pointer-events-none z-[2] bg-gradient-to-tr from-blue-600/10 via-transparent to-cyan-400/5"
          aria-hidden
          animate={reduced ? undefined : { opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="relative h-[min(72vh,520px)] sm:h-[min(68vh,560px)] md:h-[500px] lg:h-[560px] bg-[#081120]"
          layout
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={index}
              custom={direction}
              variants={reduced ? undefined : gallerySlide}
              initial={reduced ? false : "enter"}
              animate="center"
              exit={reduced ? undefined : "exit"}
              transition={reduced ? { duration: 0 } : luxurySpring}
              className="absolute inset-0"
            >
              <ListingCoverImage
                src={images[index]}
                alt={`${title} — görsel ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-[#081120] via-[#081120]/40 to-transparent pointer-events-none"
            initial={false}
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-blue-950/30 to-transparent pointer-events-none" />

          <motion.div
            className="absolute top-4 start-4 end-4 flex flex-wrap gap-2 z-10"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {badges.map((b, i) => (
              <Badge key={i} className={b.className ?? "bg-slate-800/90 text-white border-white/15"}>
                {b.label}
              </Badge>
            ))}
          </motion.div>

          {(discountPct || investmentScore != null) && (
            <motion.div
              className="absolute top-4 end-4 z-10 glass-panel px-3 py-2 max-w-[200px]"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <motion.div
                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300/90"
                animate={reduced ? undefined : { opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3" aria-hidden />
                AI değerleme
              </motion.div>
              {discountPct ? (
                <p className="text-sm font-bold text-emerald-300 mt-0.5">%{discountPct} altında</p>
              ) : null}
              {investmentScore != null ? (
                <p className="text-xs text-slate-400 mt-0.5">Yatırım skoru {investmentScore}/100</p>
              ) : null}
            </motion.div>
          )}

          <div className="absolute inset-y-0 start-0 end-0 flex items-center justify-between px-2 sm:px-4 z-10 pointer-events-none">
            <button
              type="button"
              onClick={() => go(-1)}
              className="pointer-events-auto p-2.5 rounded-full bg-black/45 text-white hover:bg-black/65 backdrop-blur-md border border-white/10 transition-colors"
              aria-label="Onceki gorsel"
            >
              <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="pointer-events-auto p-2.5 rounded-full bg-black/45 text-white hover:bg-black/65 backdrop-blur-md border border-white/10 transition-colors"
              aria-label="Sonraki görsel"
            >
              <ChevronRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          </div>

          <motion.div
            className="absolute bottom-4 start-4 end-4 flex items-end justify-between gap-3 z-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === index ? "w-8 bg-blue-400" : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Gorsel ${i + 1}`}
                />
              ))}
            </div>
            <motion.div className="flex gap-2" whileHover={reduced ? undefined : { scale: 1.02 }}>
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="p-2 rounded-full bg-black/45 text-white hover:bg-black/65 backdrop-blur-md border border-white/10"
                aria-label="Tam ekran"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              {hasVirtualTour && onVirtualTour ? (
                <Button
                  size="sm"
                  onClick={onVirtualTour}
                  className="[background:var(--gradient-cta)] text-white gap-1.5 shadow-lg shadow-blue-900/30"
                >
                  <Video className="w-4 h-4" />
                  Sanal tur
                </Button>
              ) : null}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex gap-2 p-3 bg-[#081120]/95 border-t border-white/10 overflow-x-auto scrollbar-thin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {images.map((img, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                i === index ? "border-blue-400 ring-2 ring-blue-500/30" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              whileHover={reduced ? undefined : { scale: 1.04 }}
              whileTap={reduced ? undefined : { scale: 0.98 }}
            >
              <ListingCoverImage src={img} alt="" className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {zoomOpen ? (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Görsel büyütme"
          >
            <button
              type="button"
              className="absolute top-4 end-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => setZoomOpen(false)}
              aria-label="Kapat"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={luxurySpring}
              className="max-w-6xl w-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <ListingCoverImage src={images[index]} alt={title} className="w-full h-full max-h-[85vh] object-contain rounded-lg" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
