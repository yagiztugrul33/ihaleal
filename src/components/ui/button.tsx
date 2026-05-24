import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-[#0071E3] text-white border border-transparent shadow-[0_6px_16px_rgba(0,113,227,0.24)] hover:-translate-y-px hover:bg-[#0062C6] active:translate-y-0",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30",
        outline:
          "border border-[#0071E3]/35 bg-card text-[#0071E3] shadow-sm hover:bg-[#F0F7FF] hover:border-[#0071E3] hover:-translate-y-px",
        secondary:
          "bg-[#ECECF0] text-[#1D1D1F] border border-[#E3E3E8] hover:bg-[#E4E4EA]",
        ghost:
          "text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#ECECF0]",
        link: "text-[#0071E3] underline-offset-4 hover:underline hover:text-[#0062C6]",
        tertiary:
          "text-[#0071E3] font-semibold underline-offset-4 hover:text-[#0062C6] hover:underline px-0 h-auto min-h-0",
      },
      size: {
        default: "h-11 px-6 py-2.5 has-[>svg]:px-5 text-[0.9375rem]",
        sm: "h-9 gap-1.5 px-3.5 text-xs has-[>svg]:px-2.5",
        lg: "h-12 min-h-[52px] px-9 text-base font-bold has-[>svg]:px-7",
        xl: "h-14 min-h-[56px] px-10 text-lg font-bold has-[>svg]:px-8",
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
