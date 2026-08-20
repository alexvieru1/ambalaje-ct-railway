/**
 * Pure planning logic for the product-settings wizard.
 *
 * The wizard collects everything across four steps and writes nothing until
 * the final "Salvează tot". This module turns the collected draft into an
 * ordered list of API calls, skipping steps the user never touched and steps
 * that resolve to nothing worth sending.
 *
 * Payload shapes here intentionally mirror the previous three-form page so the
 * existing /admin endpoints keep working unchanged.
 */

export type PackagingOption = {
  label: string
  multiplier: number
}

export type StandardOption = {
  label: string
  defaultMultiplier: number
  enabled: boolean
  multiplier: number
}

export type PackagingDraft = {
  standard: StandardOption[]
  custom: PackagingOption[]
}

export type TierDraft = {
  enabled: boolean
  /** What the user typed in this session; wins when present. */
  typed: string
  /** What is already stored for this variant. */
  existing: string
}

export type WizardDraft = {
  productId: string
  variantId: string
  currencyCode: string
  tiers: {
    t1_9: TierDraft
    t10_24: TierDraft
    t25: TierDraft
  }
  pricesTouched: boolean
  productPackaging: PackagingDraft
  productPackagingTouched: boolean
  variantPackaging: Record<string, PackagingDraft>
  variantPackagingTouched: boolean
}

export type SaveStep =
  | {
      kind: "prices"
      endpoint: "/admin/set-tiered-prices"
      body: {
        product_id: string
        variant_id: string
        price_1_9: number | null
        price_10_24: number | null
        price_25: number | null
        currency_code: string
      }
    }
  | {
      kind: "product-packaging"
      endpoint: "/admin/set-packaging-options"
      body: { product_id: string; packaging_options: PackagingOption[] }
    }
  | {
      kind: "variant-packaging"
      endpoint: "/admin/set-variant-packaging"
      variantId: string
      body: { variant_id: string; packaging_options: PackagingOption[] }
    }

/**
 * A disabled tier resolves to null, which tells the backend to clear it.
 * An enabled tier keeps whatever the user typed, else whatever is already set.
 */
export const resolveTierValue = (tier: TierDraft): number | null => {
  if (!tier.enabled) {
    return null
  }
  const raw = tier.typed || tier.existing
  if (!raw) {
    return null
  }
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

export const buildPackagingOptions = (
  draft: PackagingDraft
): PackagingOption[] => [
  ...draft.standard
    .filter((option) => option.enabled)
    .map((option) => ({ label: option.label, multiplier: option.multiplier })),
  ...draft.custom.filter(
    (option) => option.label.trim() && option.multiplier > 0
  ),
]

export const buildSavePlan = (draft: WizardDraft): SaveStep[] => {
  const steps: SaveStep[] = []

  if (draft.pricesTouched) {
    const price_1_9 = resolveTierValue(draft.tiers.t1_9)
    const price_10_24 = resolveTierValue(draft.tiers.t10_24)
    const price_25 = resolveTierValue(draft.tiers.t25)

    // Nothing to say to the backend if every tier came back empty.
    if (price_1_9 !== null || price_10_24 !== null || price_25 !== null) {
      steps.push({
        kind: "prices",
        endpoint: "/admin/set-tiered-prices",
        body: {
          product_id: draft.productId,
          variant_id: draft.variantId,
          price_1_9,
          price_10_24,
          price_25,
          currency_code: draft.currencyCode,
        },
      })
    }
  }

  if (draft.productPackagingTouched) {
    const packaging_options = buildPackagingOptions(draft.productPackaging)
    if (packaging_options.length > 0) {
      steps.push({
        kind: "product-packaging",
        endpoint: "/admin/set-packaging-options",
        body: { product_id: draft.productId, packaging_options },
      })
    }
  }

  if (draft.variantPackagingTouched) {
    for (const [variantId, packagingDraft] of Object.entries(
      draft.variantPackaging
    )) {
      const packaging_options = buildPackagingOptions(packagingDraft)
      if (packaging_options.length === 0) {
        continue
      }
      steps.push({
        kind: "variant-packaging",
        endpoint: "/admin/set-variant-packaging",
        variantId,
        body: { variant_id: variantId, packaging_options },
      })
    }
  }

  return steps
}
