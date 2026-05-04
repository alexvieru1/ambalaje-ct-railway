import { Container, clx } from "@medusajs/ui"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"
import ThumbnailImage from "./thumbnail-image"

type ThumbnailProps = {
  thumbnail?: string | null
  // TODO: Fix image typings
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  priority?: boolean
  className?: string
  "data-testid"?: string
}

const SIZE_TO_SIZES: Record<NonNullable<ThumbnailProps["size"]>, string> = {
  small: "180px",
  medium: "290px",
  large: "440px",
  square: "(min-width: 768px) 33vw, 50vw",
  full: "(min-width: 1280px) 320px, (min-width: 768px) 33vw, 50vw",
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  priority = false,
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden p-4 bg-ui-bg-subtle shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150",
        className,
        {
          "aspect-[11/14]": isFeatured,
          "aspect-[9/16]": !isFeatured && size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      {initialImage ? (
        <ThumbnailImage
          src={initialImage}
          sizes={SIZE_TO_SIZES[size]}
          priority={priority}
        />
      ) : (
        <div className="w-full h-full absolute inset-0 flex items-center justify-center">
          <PlaceholderImage size={size === "small" ? 16 : 24} />
        </div>
      )}
    </Container>
  )
}

export default Thumbnail
