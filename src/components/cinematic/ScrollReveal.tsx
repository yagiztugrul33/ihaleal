import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  parallax?: boolean;
};

export function ScrollReveal({ children, className, delayMs = 0, parallax = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          window.setTimeout(() => setVisible(true), delayMs);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delayMs]);

  useEffect(() => {
    if (!parallax || !visible) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    if (reduced || mobile) return;

    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const shift = Math.max(-24, Math.min(24, (window.innerHeight / 2 - rect.top) * 0.04));
      el.style.setProperty("--reveal-parallax", `${shift}px`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [parallax, visible]);

  return (
    <div
      ref={ref}
      className={cn(
        "scroll-reveal",
        visible && "scroll-reveal--visible",
        parallax && "scroll-reveal--parallax",
        className,
      )}
    >
      {children}
    </div>
  );
}
