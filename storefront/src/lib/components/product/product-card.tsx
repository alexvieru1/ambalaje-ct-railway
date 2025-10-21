"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { toast } from "sonner"
import { IconShoppingCartPlus } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { addCustomToCart } from "@lib/data/cart"

type ProductCardProps = {
  product: HttpTypes.StoreProduct
  href?: string
}

export const ProductCard = ({ product, href }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1)
  const params = useParams() as { countryCode: string }

  const versionedThumbnail = useMemo(() => {
    if (!product.thumbnail) {
      return null
    }

    try {
      const url = new URL(product.thumbnail)
      if (product.updated_at) {
        url.searchParams.set("v", String(new Date(product.updated_at).getTime()))
      }
      return url.toString()
    } catch {
      return product.thumbnail
    }
  }, [product.thumbnail, product.updated_at])

  const firstVariant = product.variants?.[0]
  const multipleVariants = (product.variants?.length || 0) > 1
  const prices = product.variants
    ?.map((v) => {
      const variantPrice = v?.calculated_price

      if (
        variantPrice &&
        typeof variantPrice === "object" &&
        "calculated_amount" in variantPrice
      ) {
        return typeof variantPrice.calculated_amount === "number"
          ? variantPrice.calculated_amount
          : null
      }

      if (typeof variantPrice === "number") {
        return variantPrice
      }

      return null
    })
    .filter((p): p is number => typeof p === "number")
  const minPrice = prices && prices.length > 0 ? Math.min(...prices) : null

  const sku = useMemo(() => {
    const primarySku = firstVariant?.sku?.trim()
    if (primarySku) {
      return primarySku
    }

    const metadataSku =
      product.metadata && typeof (product.metadata as any).sku === "string"
        ? ((product.metadata as any).sku as string).trim()
        : null
    if (metadataSku) {
      return metadataSku
    }

    if (product.handle) {
      return product.handle
    }

    return "—"
  }, [firstVariant?.sku, product.metadata, product.handle])

  const handleAddToCart = async () => {
    if (!firstVariant?.id) return

    try {
      await addCustomToCart({
        variantId: firstVariant.id,
        quantity,
        countryCode: params.countryCode,
      })

      toast.success(
        <div>
          <span style={{ color: "#166534", fontWeight: "600" }}>
            {product.title}
          </span>
          <div style={{ color: "#15803d", fontWeight: "500" }}>
            {quantity} produs{quantity === 1 ? "" : "e"} ×{" "}
            {firstVariant.calculated_price?.calculated_amount ?? "—"} RON
            adăugat
            {quantity === 1 ? "" : "e"} în coș!
          </div>
        </div>,
        {
          style: { color: "#166534" },
          duration: 4000,
          position: "bottom-right",
        }
      )
    } catch (err) {
      toast.error("A apărut o eroare la adăugarea în coș.")
    }
  }

  return (
    <Card className="relative flex flex-col items-center p-4 shadow-sm hover:shadow-md transition">
      {/* Image */}
      <div className="relative w-full h-48 mb-4">
        {product.thumbnail && (
          <LocalizedClientLink
            href={href || `/produse/${product.handle}`}
            className="absolute inset-0 z-10"
            aria-label={`Vezi detalii pentru ${product.title}`}
          >
            <Image
              src={versionedThumbnail ?? product.thumbnail}
              alt={product.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </LocalizedClientLink>
        )}
      </div>

      {/* Content */}
      <CardContent className="w-full text-center space-y-2 z-10">
        <h3 className="text-sm font-medium">{product.title}</h3>

        <p className="text-xs text-gray-500">Cod produs: {sku}</p>

        <p className="text-sm text-[#44b74a] font-semibold">
          {multipleVariants ? "De la" : "Preț"}: {minPrice ?? "—"} RON
        </p>

        {!multipleVariants && (
          <>
            <div className="flex items-center justify-center space-x-1 mt-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-14 text-center appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={1}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>

            <Button
              type="button"
              className="w-1/2 bg-[#44b74a] mt-2"
              onClick={handleAddToCart}
            >
              <IconShoppingCartPlus className="w-4 h-4 mr-2" />
            </Button>
          </>
        )}

        {multipleVariants && (
          <LocalizedClientLink href={href || `/produse/${product.handle}`}>
            <Button
              type="button"
              className="w-full bg-[#44b74a] mt-2 justify-center"
            >
              Detalii produs
            </Button>
          </LocalizedClientLink>
        )}
      </CardContent>
    </Card>
  )
}
