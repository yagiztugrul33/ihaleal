import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-250 ease-out-expo disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-base",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-xs hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(89,79,244,0.35)] active:translate-y-0",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30",
        outline:
          "border border-white/15 bg-white/[0.06] text-slate-100 backdrop-blur-md shadow-sm hover:bg-white/[0.1] hover:border-primary/35 hover:-translate-y-px",
        secondary:
          "bg-white/[0.08] text-slate-100 border border-white/12 backdrop-blur-md hover:bg-white/[0.12] hover:border-white/20",
        ghost:
          "text-slate-300 hover:text-white hover:bg-white/[0.06]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        tertiary:
          "text-primary font-semibold underline-offset-4 hover:text-white hover:underline px-0 h-auto min-h-0",
        // Accent (cyan CTA) — kontrast 1.12 bug fix: `bg-cyan-500 text-slate-950` className
        // override Button default gradient ile çakışıp arka planı şeffaf bırakıyordu.
        // !important + bg-image:none + bg-cyan-500 üçlüsü garanti opak cyan zemin.
        accent:
          "!bg-cyan-500 !text-slate-950 !bg-none shadow-sm border border-cyan-400/30 hover:!bg-cyan-400 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(34,211,238,0.45)] active:translate-y-0",
      },
      size: {
        default: "h-11 px-6 py-2.5 has-[>svg]:px-5 text-[0.9375rem]",
        sm: "h-9 rounded-full gap-1.5 px-3.5 text-xs has-[>svg]:px-2.5",
        lg: "h-12 min-h-[52px] rounded-full px-9 text-base font-bold has-[>svg]:px-7 shadow-xs",
        xl: "h-14 min-h-[56px] rounded-full px-10 text-lg font-bold has-[>svg]:px-8 shadow-xs",
        icon: "size-10 rounded-full",
        "icon-sm": "size-9 rounded-full",
        "icon-lg": "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
