import * as React from "react"

import { cn } from "@/lib/utils"

function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="eyebrow"
      className={cn(
        "text-xs uppercase tracking-[0.16em] text-[var(--metin-ikincil)]",
        className,
      )}
      {...props}
    />
  )
}

export { Eyebrow }
