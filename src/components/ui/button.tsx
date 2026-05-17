import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-250 ease-out-expo disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-base",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-lux-blue-600 via-lux-blue-500 to-lux-blue-400 text-white shadow-lux border border-white/10 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(37,99,235,0.45)] active:translate-y-0",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30",
        outline:
          "border border-white/15 bg-white/[0.06] text-slate-100 backdrop-blur-md shadow-sm hover:bg-white/[0.1] hover:border-blue-400/35 hover:-translate-y-px",
        secondary:
          "bg-white/[0.08] text-slate-100 border border-white/12 backdrop-blur-md hover:bg-white/[0.12] hover:border-white/20",
        ghost:
          "text-slate-300 hover:text-white hover:bg-white/[0.06]",
        link: "text-lux-blue-400 underline-offset-4 hover:underline hover:text-lux-blue-500",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-md gap-1.5 px-3.5 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-xl px-8 text-base has-[>svg]:px-6",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
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
