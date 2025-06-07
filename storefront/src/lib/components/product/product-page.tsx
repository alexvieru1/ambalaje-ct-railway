"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  IconShoppingCartPlus,
  IconZoomIn,
} from "@tabler/icons-react"

import { addToCart } from "@lib/data/cart"
import {
  HttpTypes,
  StoreProductCategory,
} from "@medusajs/types"

import { Button } from "../ui/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "../ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Input } from "../ui/input"
import { CategoryBreadcrumb } from "../ui/category-breadcrumb"

type Props = {
  product: HttpTypes.StoreProduct
  category?: StoreProductCategory
}

type ExtendedVariant = HttpTypes.StoreProductVariant & {
  prices?: {
    amount: number
    currency_code: string
    min_quantity?: number
    max_quantity?: number
  }[]
}

type PackagingOption = {
  label: string          // e.g. "buc"
  multiplier: number     // e.g. 10
}

export const ProductPage = ({ product, category }: Props) => {
  /* ──────────────────────────────────────── */
  /*   PACKAGING OPTIONS & STATE             */
  /* ──────────────────────────────────────── */
  const packagingOptions = useMemo<PackagingOption[]>(() => {
    const raw = product.metadata?.packaging_options
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw)
      } catch {
        return []
      }
    }
    return Array.isArray(raw) ? raw : []
  }, [product])

  const [selectedPackaging, setSelectedPackaging] = useState<
    PackagingOption | undefined
  >(packagingOptions[0])

  /* quantity expressed in NUMBER OF PACKS */
  const [baseQuantity, setBaseQuantity] = useState(1)

  const effectiveQty =
    baseQuantity * (selectedPackaging?.multiplier ?? 1)

  /* ──────────────────────────────────────── */
  /*   VARIANT SELECTION                     */
  /* ──────────────────────────────────────── */
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants?.[0]?.id ?? ""
  )

  const selectedVariant = (
    (product.variants as ExtendedVariant[]) ?? []
  ).find((v) => v.id === selectedVariantId)

  const sku = selectedVariant?.sku || "—"

  /* ──────────────────────────────────────── */
  /*   PRICE COMPUTATION (per-piece)         */
  /* ──────────────────────────────────────── */
  const dynamicPrice = useMemo(() => {
    if (!selectedVariant?.prices?.length) {
      return selectedVariant?.calculated_price?.calculated_amount ?? 0
    }

    const tiers = selectedVariant.prices
      .filter((p) => p.currency_code === "ron")
      .sort(
        (a, b) => (a.min_quantity ?? 0) - (b.min_quantity ?? 0)
      )

    const match = tiers.find((t) => {
      const min = t.min_quantity ?? 1
      const max = t.max_quantity ?? Infinity
      return effectiveQty >= min && effectiveQty <= max
    })

    return (
      match?.amount ??
      selectedVariant.calculated_price?.calculated_amount ??
      0
    )
  }, [selectedVariant, effectiveQty])

  /* ──────────────────────────────────────── */
  /*   ADD TO CART                           */
  /* ──────────────────────────────────────── */
  const params = useParams() as { countryCode: string }

  const handleAddToCart = async () => {
    try {
      await addToCart({
        variantId: selectedVariantId,
        quantity: effectiveQty,
        countryCode: params.countryCode,
      })

      toast.success(
        <div>
          <span className="text-green-800 font-semibold">
            {product.title}
          </span>
          <div className="text-green-700 font-medium">
            {effectiveQty}{" "}
            {effectiveQty === 1 ? "bucată" : "bucăți"} ×{" "}
            {dynamicPrice} RON adăugat
            {effectiveQty === 1 ? "ă" : "e"} în coș!
          </div>
        </div>,
        { duration: 4000, position: "bottom-right" }
      )
    } catch (e) {
      console.error(e)
      toast.error("A apărut o eroare la adăugarea în coș.")
    }
  }

  /* ──────────────────────────────────────── */
  /*   IMAGE ZOOM                            */
  /* ──────────────────────────────────────── */
  const [showZoom, setShowZoom] = useState(false)
  useEffect(() => {
    document.body.style.overflow = showZoom ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [showZoom])

  /* ──────────────────────────────────────── */
  /*   RENDER                                */
  /* ──────────────────────────────────────── */
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 min-h-[80vh] flex flex-col">
      {category && <CategoryBreadcrumb category={category} />}

      {/* grid: image + details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* image + zoom */}
        <div className="relative w-full max-w-full md:max-w-[500px]">
          {product.thumbnail && (
            <>
              <div className="relative w-full h-96 rounded-lg overflow-hidden">
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  className="object-contain"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setShowZoom(true)}
              >
                <IconZoomIn className="w-4 h-4 mr-2" />
                Zoom imagine
              </Button>
            </>
          )}
        </div>

        {/* details */}
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="text-gray-600 text-sm">Cod produs: {sku}</p>
          <p className="text-[#44b74a] font-semibold">
            {dynamicPrice} RON / bucată
          </p>

          {/* packaging */}
          {packagingOptions.length > 0 && selectedPackaging && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                Ambalaj
              </p>
              <RadioGroup
                value={selectedPackaging.label}
                onValueChange={(val) => {
                  const found = packagingOptions.find(
                    (o) => o.label === val
                  )
                  if (found) {
                    setSelectedPackaging(found)
                    setBaseQuantity(1)
                  }
                }}
                className="flex space-x-4"
              >
                {packagingOptions.map((opt) => (
                  <div
                    key={opt.label}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={opt.label}
                      id={opt.label}
                    />
                    <label
                      htmlFor={opt.label}
                      className="text-sm capitalize"
                    >
                      {opt.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* variant select */}
          {product.variants && product.variants.length > 1 && (
            <Select
              defaultValue={selectedVariantId}
              onValueChange={setSelectedVariantId}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selectează o variantă" />
              </SelectTrigger>
              <SelectContent>
                {product.variants.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* qty controls */}
          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() =>
                setBaseQuantity(Math.max(1, baseQuantity - 1))
              }
            >
              –
            </Button>

            <Input
              type="number"
              value={effectiveQty}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1
                const m = selectedPackaging?.multiplier ?? 1
                setBaseQuantity(Math.max(1, Math.ceil(val / m)))
              }}
              className="w-20 text-center no-spinner"
              min={1}
            />

            <Button
              size="icon"
              variant="outline"
              onClick={() => setBaseQuantity(baseQuantity + 1)}
            >
              +
            </Button>
          </div>

          {/* add to cart */}
          {selectedVariant?.inventory_quantity === 0 ? (
            <Button disabled className="w-full md:w-1/2 bg-gray-400">
              Stoc epuizat
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              className="w-full md:w-1/2 bg-green-600"
            >
              <IconShoppingCartPlus className="w-4 h-4 mr-2" />
              Adaugă în coș
            </Button>
          )}

          {/* description */}
          {product.description && (
            <div className="pt-4 border-t">
              <h2 className="text-sm font-semibold mb-2 text-gray-700">
                Descriere
              </h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* zoom overlay */}
      {showZoom && product.thumbnail && (
        <div className="fixed top-[-24px] inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg max-w-4xl w-full p-4 mx-4">
            <div className="relative w-full h-[60vh] flex items-center justify-center">
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-contain"
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="absolute top-4 right-4 bg-white text-black hover:bg-gray-500"
              onClick={() => setShowZoom(false)}
            >
              X
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
