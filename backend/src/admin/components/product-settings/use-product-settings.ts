import { useCallback, useState } from "react"
import type {
  PackagingDraft,
  PackagingOption,
  StandardOption,
  WizardDraft,
} from "./save-plan"

export const STANDARD_DEFAULTS: { label: string; defaultMultiplier: number }[] =
  [
    { label: "buc", defaultMultiplier: 1 },
    { label: "set", defaultMultiplier: 10 },
    { label: "bax", defaultMultiplier: 25 },
  ]

export type ProductSummary = {
  id: string
  title: string
  thumbnail?: string | null
}

export type Variant = { id: string; title: string }

export type ExistingPrice = {
  amount: number
  currency_code: string
  min_quantity: number | null
  max_quantity: number | null
}

const CURRENCY = "ron"

const emptyDraft = (): PackagingDraft => ({
  standard: STANDARD_DEFAULTS.map((d) => ({
    ...d,
    enabled: false,
    multiplier: d.defaultMultiplier,
  })),
  custom: [],
})

/** Turn stored metadata (object or JSON string) into a packaging draft. */
export const draftFromMetadata = (raw: unknown): PackagingDraft => {
  let existing: PackagingOption[] = []
  if (raw) {
    if (typeof raw === "string") {
      try {
        existing = JSON.parse(raw)
      } catch {
        existing = []
      }
    } else {
      existing = raw as PackagingOption[]
    }
    if (!Array.isArray(existing)) {
      existing = []
    }
  }

  const standardLabels = STANDARD_DEFAULTS.map((d) => d.label)
  return {
    standard: STANDARD_DEFAULTS.map((d) => {
      const match = existing.find((e) => e.label === d.label)
      return {
        ...d,
        enabled: !!match,
        multiplier: match?.multiplier ?? d.defaultMultiplier,
      }
    }),
    custom: existing.filter((e) => !standardLabels.includes(e.label)),
  }
}

export const useProductSettings = () => {
  const [product, setProduct] = useState<ProductSummary | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [variantId, setVariantId] = useState("")
  const [existingPrices, setExistingPrices] = useState<ExistingPrice[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState("")

  const [tiers, setTiers] = useState<WizardDraft["tiers"]>({
    t1_9: { enabled: false, typed: "", existing: "" },
    t10_24: { enabled: false, typed: "", existing: "" },
    t25: { enabled: false, typed: "", existing: "" },
  })
  const [pricesTouched, setPricesTouched] = useState(false)

  const [productPackaging, setProductPackaging] = useState<PackagingDraft>(
    emptyDraft()
  )
  const [productPackagingTouched, setProductPackagingTouched] = useState(false)

  const [variantPackaging, setVariantPackaging] = useState<
    Record<string, PackagingDraft>
  >({})
  const [variantPackagingTouched, setVariantPackagingTouched] = useState(false)

  const priceFor = useCallback(
    (prices: ExistingPrice[], min: number, max?: number): string => {
      const match = prices.find(
        (p) =>
          p.currency_code === CURRENCY &&
          p.min_quantity === min &&
          (max === undefined ? p.max_quantity === null : p.max_quantity === max)
      )
      return match ? String(match.amount) : ""
    },
    []
  )

  /** Load everything for a product in one go, so later steps arrive pre-filled. */
  const selectProduct = useCallback(
    async (summary: ProductSummary) => {
      setLoading(true)
      setLoadError("")
      try {
        // Two proven-good queries in parallel: the plain product (title,
        // metadata, variant list) and the variant-metadata projection the
        // previous page used. Avoids guessing at field-expansion syntax.
        const [productRes, variantRes] = await Promise.all([
          fetch(`/admin/products/${summary.id}`),
          fetch(
            `/admin/products/${summary.id}?fields=variants.metadata,variants.title`
          ),
        ])
        if (!productRes.ok) {
          throw new Error("Nu am putut deschide produsul. Încearcă din nou.")
        }
        const data = await productRes.json()
        const loaded = data.product ?? {}
        const loadedVariants: Variant[] = loaded.variants ?? []

        const variantMeta: any[] = variantRes.ok
          ? (await variantRes.json()).product?.variants ?? []
          : []

        setProduct({
          id: summary.id,
          title: loaded.title ?? summary.title,
          thumbnail: loaded.thumbnail ?? summary.thumbnail,
        })
        setVariants(loadedVariants)
        setProductPackaging(draftFromMetadata(loaded.metadata?.packaging_options))

        const perVariant: Record<string, PackagingDraft> = {}
        for (const v of loadedVariants as any[]) {
          const meta = variantMeta.find((m) => m.id === v.id) ?? v
          perVariant[v.id] = draftFromMetadata(meta?.metadata?.packaging_options)
        }
        setVariantPackaging(perVariant)

        setVariantId(loadedVariants.length === 1 ? loadedVariants[0].id : "")
        setExistingPrices([])
        setPricesTouched(false)
        setProductPackagingTouched(false)
        setVariantPackagingTouched(false)
      } catch (err: any) {
        setLoadError(err.message || "Ceva nu a funcționat.")
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /** Prices live per variant, so they load when a variant is chosen. */
  const selectVariant = useCallback(
    async (id: string) => {
      setVariantId(id)
      setPricesTouched(false)
      if (!id) {
        setExistingPrices([])
        return
      }
      try {
        const res = await fetch(`/admin/get-variant-prices?variant_id=${id}`)
        const prices: ExistingPrice[] = res.ok
          ? (await res.json()).prices ?? []
          : []
        setExistingPrices(prices)
        setTiers({
          t1_9: {
            enabled: !!priceFor(prices, 1, 9),
            typed: "",
            existing: priceFor(prices, 1, 9),
          },
          t10_24: {
            enabled: !!priceFor(prices, 10, 24),
            typed: "",
            existing: priceFor(prices, 10, 24),
          },
          t25: {
            enabled: !!priceFor(prices, 25),
            typed: "",
            existing: priceFor(prices, 25),
          },
        })
      } catch {
        setExistingPrices([])
      }
    },
    [priceFor]
  )

  const reset = useCallback(() => {
    setProduct(null)
    setVariants([])
    setVariantId("")
    setExistingPrices([])
    setProductPackaging(emptyDraft())
    setVariantPackaging({})
    setPricesTouched(false)
    setProductPackagingTouched(false)
    setVariantPackagingTouched(false)
    setLoadError("")
  }, [])

  const draft: WizardDraft = {
    productId: product?.id ?? "",
    variantId,
    currencyCode: CURRENCY,
    tiers,
    pricesTouched,
    productPackaging,
    productPackagingTouched,
    variantPackaging,
    variantPackagingTouched,
  }

  return {
    product,
    variants,
    variantId,
    existingPrices,
    loading,
    loadError,
    tiers,
    setTiers,
    setPricesTouched,
    productPackaging,
    setProductPackaging,
    setProductPackagingTouched,
    variantPackaging,
    setVariantPackaging,
    setVariantPackagingTouched,
    selectProduct,
    selectVariant,
    reset,
    draft,
  }
}

export type { PackagingDraft, StandardOption }
