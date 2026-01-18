import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-white shadow hover:bg-destructive/80",
        outline: "text-foreground",
        vegetable: "border-transparent bg-green-100 text-green-800",
        protein: "border-transparent bg-red-100 text-red-800",
        grain: "border-transparent bg-amber-100 text-amber-800",
        dairy: "border-transparent bg-blue-100 text-blue-800",
        fruit: "border-transparent bg-purple-100 text-purple-800",
        fat: "border-transparent bg-yellow-100 text-yellow-800",
        condiment: "border-transparent bg-pink-100 text-pink-800",
        other: "border-transparent bg-gray-100 text-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
