"use client"

import { cn } from "@lib/lib/utils"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type LogoProps = {
  className?: string
  width?: number
  height?: number
}

export const Logo = ({ className, width, height }: LogoProps) => {
  return (
    <LocalizedClientLink href="/" className={cn("inline-flex items-center", className)}>
      <Image
        src="/images/logo.png"
        alt="Logo"
        width={width || 40} // You can adjust size here
        height={height || 40}
        priority // loads fast
      />
    </LocalizedClientLink>
  )
}
