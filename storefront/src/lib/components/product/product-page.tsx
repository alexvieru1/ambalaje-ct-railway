"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { IconShoppingCartPlus, IconZoomIn } from "@tabler/icons-react"

import { HttpTypes, StoreProductCategory } from "@medusajs/types"

import { Button } from "../ui/button"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Input } from "../ui/input"
import { CategoryBreadcrumb } from "../ui/category-breadcrumb"
import { addCustomToCart } from "@lib/data/cart"

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
  label: string // e.g. "buc"
  multiplier: number // e.g. 10
}

const PACKAGING_METADATA_KEYS = [
  "packaging_options",
  "packagingOptions",
  "packaging_option",
] as const

const parsePackagingOptions = (raw: unknown): PackagingOption[] => {
  if (raw === null || raw === undefined) {
    return []
  }

  const tryParse = (value: unknown): unknown => {
    if (typeof value === "string") {
      const trimmed = value.trim()
      if (!trimmed) {
        return []
      }
      try {
        return JSON.parse(trimmed)
      } catch {
        return trimmed
      }
    }
    return value
  }

  const toOption = (candidate: any): PackagingOption | null => {
    if (!candidate) {
      return null
    }

    if (typeof candidate === "string") {
      return { label: candidate, multiplier: 1 }
    }

    if (typeof candidate === "object") {
      const labelCandidate =
        "label" in candidate ? (candidate as any).label : undefined
      const multiplierCandidate =
        "multiplier" in candidate ? (candidate as any).multiplier : undefined

      if (labelCandidate !== undefined) {
        const multiplierNumber =
          typeof multiplierCandidate === "number"
            ? multiplierCandidate
            : Number(multiplierCandidate ?? 1)

        if (!Number.isFinite(multiplierNumber) || multiplierNumber <= 0) {
          return null
        }

        return {
          label: String(labelCandidate),
          multiplier: multiplierNumber,
        }
      }
    }

    return null
  }

  const parsed = tryParse(raw)

  if (Array.isArray(parsed)) {
    return parsed
      .map((entry) => toOption(entry))
      .filter((opt): opt is PackagingOption => opt !== null)
  }

  if (parsed && typeof parsed === "object") {
    const direct = toOption(parsed)
    if (direct) {
      return [direct]
    }

    return Object.entries(parsed)
      .map(([label, multiplier]) =>
        toOption({ label, multiplier: multiplier as unknown })
      )
      .filter((opt): opt is PackagingOption => opt !== null)
  }

  if (typeof parsed === "string") {
    return parsed ? [{ label: parsed, multiplier: 1 }] : []
  }

  return []
}

const extractPackagingOptions = (
  metadata: Record<string, unknown> | null | undefined
): PackagingOption[] => {
  if (!metadata) {
    return []
  }

  for (const key of PACKAGING_METADATA_KEYS) {
    if (key in metadata) {
      const options = parsePackagingOptions(
        (metadata as Record<string, unknown>)[key]
      )
      if (options.length > 0) {
        return options
      }
    }
  }

  return []
}

export const ProductPage = ({ product, category }: Props) => {
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

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants?.[0]?.id ?? ""
  )

  const selectedVariant = useMemo(() => {
    return ((product.variants as ExtendedVariant[]) ?? []).find(
      (v) => v.id === selectedVariantId
    )
  }, [product.variants, selectedVariantId])

  useEffect(() => {
    if (!selectedVariant && product.variants?.length) {
      setSelectedVariantId(product.variants[0].id)
    }
  }, [selectedVariant, product.variants])

  /*   PACKAGING OPTIONS & STATE             */
  const productPackagingOptions = useMemo<PackagingOption[]>(() => {
    return extractPackagingOptions(
      product.metadata as Record<string, unknown> | null | undefined
    )
  }, [product.metadata])

  const variantPackagingOptions = useMemo<PackagingOption[]>(() => {
    return extractPackagingOptions(
      selectedVariant?.metadata as Record<string, unknown> | null | undefined
    )
  }, [selectedVariant])

  const fallbackVariantPackaging = useMemo<PackagingOption[]>(() => {
    for (const variant of product.variants || []) {
      const options = extractPackagingOptions(
        variant.metadata as Record<string, unknown> | null | undefined
      )
      if (options.length > 0) {
        return options
      }
    }
    return []
  }, [product.variants])

  const packagingOptions = useMemo<PackagingOption[]>(() => {
    if (variantPackagingOptions.length > 0) {
      return variantPackagingOptions
    }
    if (productPackagingOptions.length > 0) {
      return productPackagingOptions
    }
    return fallbackVariantPackaging
  }, [
    variantPackagingOptions,
    productPackagingOptions,
    fallbackVariantPackaging,
  ])

  const [selectedPackaging, setSelectedPackaging] = useState<
    PackagingOption | undefined
  >(() => packagingOptions[0])

  const [baseQuantity, setBaseQuantity] = useState(1)

  useEffect(() => {
    if (!packagingOptions.length) {
      if (selectedPackaging !== undefined) {
        setSelectedPackaging(undefined)
      }
      if (baseQuantity !== 1) {
        setBaseQuantity(1)
      }
      return
    }

    const matching = selectedPackaging
      ? packagingOptions.find((opt) => opt.label === selectedPackaging.label)
      : undefined

    if (!matching || !selectedPackaging) {
      setSelectedPackaging(packagingOptions[0])
      setBaseQuantity(1)
      return
    }

    if (matching.multiplier !== selectedPackaging.multiplier) {
      setSelectedPackaging(matching)
      setBaseQuantity(1)
    }
  }, [packagingOptions, selectedPackaging, baseQuantity])

  /* quantity expressed in NUMBER OF PACKS */
  const effectiveQty = baseQuantity * (selectedPackaging?.multiplier ?? 1)

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
      .sort((a, b) => (a.min_quantity ?? 0) - (b.min_quantity ?? 0))

    const match = tiers.find((t) => {
      const min = t.min_quantity ?? 1
      const max = t.max_quantity ?? Infinity
      return effectiveQty >= min && effectiveQty <= max
    })

    return (
      match?.amount ?? selectedVariant.calculated_price?.calculated_amount ?? 0
    )
  }, [selectedVariant, effectiveQty])

  /* ──────────────────────────────────────── */
  /*   ADD TO CART                           */
  /* ──────────────────────────────────────── */
  const params = useParams() as { countryCode: string }

  const handleAddToCart = async () => {
    try {
      await addCustomToCart({
        variantId: selectedVariantId,
        quantity: effectiveQty,
        countryCode: params.countryCode,
      })

      toast.success(
        <div>
          <span className="text-green-800 font-semibold">{product.title}</span>
          <div className="text-green-700 font-medium">
            {effectiveQty} {effectiveQty === 1 ? "bucată" : "bucăți"} ×{" "}
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
                  src={versionedThumbnail ?? product.thumbnail}
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
          {packagingOptions.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Ambalaj</p>
              <RadioGroup
                value={
                  selectedPackaging?.label ?? packagingOptions[0]?.label ?? ""
                }
                onValueChange={(val) => {
                  const found = packagingOptions.find((o) => o.label === val)
                  if (found) {
                    setSelectedPackaging(found)
                    setBaseQuantity(1)
                  }
                }}
                className="flex space-x-4"
              >
                {packagingOptions.map((opt) => (
                  <div key={opt.label} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.label} id={opt.label} />
                    <label htmlFor={opt.label} className="text-sm capitalize">
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
              onClick={() => setBaseQuantity(Math.max(1, baseQuantity - 1))}
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
                src={versionedThumbnail ?? product.thumbnail}
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
