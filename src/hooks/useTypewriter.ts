import { useEffect, useState } from "react";

export function useTypewriter(text: string, speedMs = 42, enabled = true) {
  const [out, setOut] = useState("");
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!enabled || reduced) {
      setOut(text);
      return;
    }
    setOut("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speedMs);
    return () => window.clearInterval(id);
  }, [text, speedMs, enabled, reduced]);

  return { text: out, done: out.length >= text.length, reduced };
}
