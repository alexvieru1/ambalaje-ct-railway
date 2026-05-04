"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

type ThumbnailImageProps = {
  src: string
  alt?: string
  sizes?: string
  quality?: number
  priority?: boolean
}

const DEFAULT_SIZES =
  "(min-width: 1280px) 320px, (min-width: 768px) 33vw, 50vw"

export default function ThumbnailImage({
  src,
  alt = "Thumbnail",
  sizes = DEFAULT_SIZES,
  quality = 50,
  priority = false,
}: ThumbnailImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // If the image is already in cache when we hydrate, onLoad may not fire.
  useEffect(() => {
    if (imgRef.current?.complete) setIsLoaded(true)
  }, [])

  return (
    <>
      <div
        aria-hidden
        className={`absolute inset-0 bg-ui-bg-subtle transition-opacity duration-300 ${
          isLoaded ? "opacity-0" : "opacity-100 animate-pulse"
        }`}
      />
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        draggable={false}
        onLoad={() => setIsLoaded(true)}
        className={`absolute inset-0 object-cover object-center transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  )
}
