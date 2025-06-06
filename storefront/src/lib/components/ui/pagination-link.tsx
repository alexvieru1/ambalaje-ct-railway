// components/ui/pagination-link.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { buttonVariants } from "./button"
import { cn } from "@lib/lib/utils"

export interface PaginationLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean
  isActive?: boolean
}

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"
    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ variant: isActive ? "default" : "outline", size: "sm" }),
          "px-3 py-1 h-auto",
          className
        )}
        {...props}
      />
    )
  }
)

PaginationLink.displayName = "PaginationLink"

export { PaginationLink }
