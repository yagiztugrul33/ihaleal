import type { Transition, Variants } from "framer-motion";

/** Apple-grade spring — subtle, expensive feel */
export const luxurySpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.85,
};

export const cinematicEase: Transition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1],
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const pageTransitionReduced: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: cinematicEase,
  },
};

export const staggerItemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: cinematicEase },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: luxurySpring },
};

export const gallerySlide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48, scale: 1.02 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48, scale: 0.98 }),
};

export function motionProps(reduced: boolean) {
  return {
    page: reduced ? pageTransitionReduced : pageTransition,
    staggerContainer: reduced ? { hidden: {}, show: {} } : staggerContainer,
    staggerItem: reduced ? staggerItemReduced : staggerItem,
    transition: reduced ? ({ duration: 0.01 } as Transition) : cinematicEase,
  };
}
