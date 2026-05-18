import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motionProps } from "@/lib/motion/presets";

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "ul";
};

export function MotionReveal({ children, className, delay = 0, as = "div" }: MotionRevealProps) {
  const reduced = useReducedMotion();
  const mp = motionProps(reduced);
  const Tag = as === "section" ? motion.section : as === "ul" ? motion.ul : motion.div;

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={mp.staggerContainer}
      transition={{ delayChildren: delay }}
    >
      {children}
    </Tag>
  );
}

export function MotionRevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const mp = motionProps(reduced);

  return (
    <motion.div className={className} variants={mp.staggerItem}>
      {children}
    </motion.div>
  );
}
