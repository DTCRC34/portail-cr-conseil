import { type HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-cr-red text-white",
        secondary: "bg-cr-gray-100 text-cr-gray-600",
        outline: "border border-cr-gray-200 text-cr-gray-600",
        warning: "bg-amber-50 text-amber-700 border border-amber-200",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
