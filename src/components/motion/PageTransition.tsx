import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motionProps } from "@/lib/motion/presets";

const SKIP_PATHS = ["/giris", "/kayit", "/sifremi-unuttum"];

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const reduced = useReducedMotion();
  const mp = motionProps(reduced);
  const skip = SKIP_PATHS.some((p) => location.pathname.startsWith(p));

  if (skip) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={mp.page}
        transition={mp.transition}
        className="flex-1 min-w-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
