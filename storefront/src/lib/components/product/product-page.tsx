"use client"

import { useEffect, useMemo, useState } from "react"
import { HttpTypes, StoreProductCategory } from "@medusajs/types"
import Image from "next/image"
import { toast } from "sonner"
import { IconShoppingCartPlus, IconZoomIn } from "@tabler/icons-react"
import { CategoryBreadcrumb } from "../ui/category-breadcrumb"
import { useParams } from "next/navigation"
import { addToCart } from "@lib/data/cart"
import { Button } from "../ui/button"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"

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
  type: string
  label: string
  multiplier: number
}

export const ProductPage = ({ product, category }: Props) => {
  const [baseQuantity, setBaseQuantity] = useState(1)
  const [showZoom, setShowZoom] = useState(false)
  const params = useParams() as { countryCode: string }
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants?.[0]?.id || ""
  )
  const selectedVariant = ((product.variants as ExtendedVariant[]) ?? []).find(
    (v) => v.id === selectedVariantId
  )

  const sku = selectedVariant?.sku || "—"

  const packagingOptions = useMemo<PackagingOption[]>(() => {
    const raw = product.metadata?.packaging_options
    return typeof raw === "string" ? JSON.parse(raw) : raw || []
  }, [product])

  const [selectedPackaging, setSelectedPackaging] = useState<PackagingOption>(
    packagingOptions[0]
  )

  console.log(product)

  const effectiveQty = baseQuantity * (selectedPackaging?.multiplier || 1)

  const dynamicPrice = useMemo(() => {
    if (!selectedVariant?.prices?.length) {
      return selectedVariant?.calculated_price?.calculated_amount ?? 0
    }

    const priceTiers = selectedVariant.prices
      .filter((p) => p.currency_code === "ron")
      .sort((a, b) => (a.min_quantity ?? 0) - (b.min_quantity ?? 0))

    const match = priceTiers.find((p) => {
      const min = p.min_quantity ?? 1
      const max = p.max_quantity ?? Infinity
      return effectiveQty >= min && effectiveQty <= max
    })

    return (
      match?.amount ?? selectedVariant.calculated_price?.calculated_amount ?? 0
    )
  }, [selectedVariant, effectiveQty])

  const handleAddToCart = async () => {
    try {
      await addToCart({
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
    } catch (err) {
      console.error("Error during addToCart:", err)
      toast.error("A apărut o eroare la adăugarea în coș.")
    }
  }

  useEffect(() => {
    document.body.style.overflow = showZoom ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [showZoom])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 min-h-[80vh] flex flex-col">
      {category && <CategoryBreadcrumb category={category} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative w-full max-w-full md:max-w-[500px]">
          { product.thumbnail && (
                <div className="relative w-full h-96 rounded-lg overflow-hidden">
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
          {product.thumbnail && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setShowZoom(true)}
            >
              <IconZoomIn className="w-4 h-4 mr-2" />
              Zoom imagine
            </Button>
          )}
        </div>

        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="text-gray-600 text-sm">Cod produs: {sku}</p>
          <p className="text-[#44b74a] font-semibold">
            {dynamicPrice} RON / bucată
          </p>

          {packagingOptions.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Ambalaj</p>
              <RadioGroup
                defaultValue={packagingOptions[0]?.type}
                onValueChange={(val) => {
                  const found = packagingOptions.find((opt) => opt.type === val)
                  if (found) {
                    setSelectedPackaging(found)
                    setBaseQuantity(1)
                  }
                }}
                className="flex space-x-4"
              >
                {packagingOptions.map((opt: any) => (
                  <div key={opt.type} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.type} id={opt.type} />
                    <label htmlFor={opt.type} className="text-sm capitalize">
                      {opt.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {product.variants && product.variants?.length > 1 && (
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

          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setBaseQuantity(Math.max(1, baseQuantity - 1))}
            >
              -
            </Button>
            <Input
              type="number"
              value={effectiveQty}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1
                const multiplier = selectedPackaging?.multiplier || 1
                setBaseQuantity(Math.max(1, Math.ceil(val / multiplier)))
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

          {selectedVariant?.inventory_quantity === 0 ? (
            <Button
              className="w-full md:w-1/2 bg-gray-400 cursor-not-allowed"
              disabled
            >
              Stoc epuizat
            </Button>
          ) : (
            <Button
              className="w-full md:w-1/2 bg-green-600"
              onClick={handleAddToCart}
            >
              <IconShoppingCartPlus className="w-4 h-4 mr-2" />
              Adaugă în coș
            </Button>
          )}

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

      {showZoom && (
        <div className="fixed top-[-24px] inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg max-w-4xl w-full p-4 mx-4">
            {product.thumbnail && (
                  <div className="relative w-full h-[60vh] flex items-center justify-center">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
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
