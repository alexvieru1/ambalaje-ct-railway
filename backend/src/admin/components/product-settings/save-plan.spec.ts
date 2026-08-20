import {
  resolveTierValue,
  buildPackagingOptions,
  buildSavePlan,
  type PackagingDraft,
  type WizardDraft,
} from "./save-plan"

const draft = (over: Partial<WizardDraft> = {}): WizardDraft => ({
  productId: "prod_1",
  variantId: "var_1",
  currencyCode: "ron",
  tiers: {
    t1_9: { enabled: true, typed: "", existing: "12" },
    t10_24: { enabled: true, typed: "", existing: "11" },
    t25: { enabled: true, typed: "", existing: "9" },
  },
  pricesTouched: false,
  productPackaging: { standard: [], custom: [] },
  productPackagingTouched: false,
  variantPackaging: {},
  variantPackagingTouched: false,
  ...over,
})

const std = (label: string, enabled: boolean, multiplier: number) => ({
  label,
  defaultMultiplier: multiplier,
  enabled,
  multiplier,
})

describe("resolveTierValue", () => {
  it("returns null when the tier is disabled, even if a price exists", () => {
    expect(
      resolveTierValue({ enabled: false, typed: "15", existing: "12" })
    ).toBeNull()
  })

  it("prefers the freshly typed value over the existing one", () => {
    expect(
      resolveTierValue({ enabled: true, typed: "15", existing: "12" })
    ).toBe(15)
  })

  it("falls back to the existing value when nothing was typed", () => {
    expect(resolveTierValue({ enabled: true, typed: "", existing: "12" })).toBe(
      12
    )
  })

  it("returns null when enabled but no value is available anywhere", () => {
    expect(resolveTierValue({ enabled: true, typed: "", existing: "" })).toBeNull()
  })
})

describe("buildPackagingOptions", () => {
  it("keeps only enabled standard options, as label + multiplier", () => {
    const d: PackagingDraft = {
      standard: [std("buc", true, 1), std("set", false, 10), std("bax", true, 25)],
      custom: [],
    }
    expect(buildPackagingOptions(d)).toEqual([
      { label: "buc", multiplier: 1 },
      { label: "bax", multiplier: 25 },
    ])
  })

  it("drops custom options with a blank label or a non-positive multiplier", () => {
    const d: PackagingDraft = {
      standard: [],
      custom: [
        { label: "  ", multiplier: 5 },
        { label: "palet", multiplier: 0 },
        { label: "palet", multiplier: 480 },
      ],
    }
    expect(buildPackagingOptions(d)).toEqual([{ label: "palet", multiplier: 480 }])
  })
})

describe("buildSavePlan", () => {
  it("plans nothing when the user touched no step", () => {
    expect(buildSavePlan(draft())).toEqual([])
  })

  it("plans a price save with the exact legacy payload shape", () => {
    const plan = buildSavePlan(
      draft({
        pricesTouched: true,
        tiers: {
          t1_9: { enabled: true, typed: "15", existing: "12" },
          t10_24: { enabled: true, typed: "", existing: "11" },
          t25: { enabled: false, typed: "", existing: "9" },
        },
      })
    )
    expect(plan).toHaveLength(1)
    expect(plan[0]).toMatchObject({
      kind: "prices",
      endpoint: "/admin/set-tiered-prices",
      body: {
        product_id: "prod_1",
        variant_id: "var_1",
        price_1_9: 15,
        price_10_24: 11,
        price_25: null,
        currency_code: "ron",
      },
    })
  })

  it("skips the price save when every tier resolves to null", () => {
    const plan = buildSavePlan(
      draft({
        pricesTouched: true,
        tiers: {
          t1_9: { enabled: false, typed: "", existing: "12" },
          t10_24: { enabled: false, typed: "", existing: "11" },
          t25: { enabled: false, typed: "", existing: "9" },
        },
      })
    )
    expect(plan).toEqual([])
  })

  it("skips product packaging when it resolves to no options", () => {
    const plan = buildSavePlan(
      draft({
        productPackagingTouched: true,
        productPackaging: { standard: [std("buc", false, 1)], custom: [] },
      })
    )
    expect(plan).toEqual([])
  })

  it("emits one variant-packaging step per variant that has options", () => {
    const plan = buildSavePlan(
      draft({
        variantPackagingTouched: true,
        variantPackaging: {
          var_1: { standard: [std("bax", true, 25)], custom: [] },
          var_2: { standard: [std("bax", false, 25)], custom: [] },
        },
      })
    )
    expect(plan).toHaveLength(1)
    expect(plan[0]).toMatchObject({
      kind: "variant-packaging",
      endpoint: "/admin/set-variant-packaging",
      variantId: "var_1",
      body: { variant_id: "var_1", packaging_options: [{ label: "bax", multiplier: 25 }] },
    })
  })

  it("orders steps prices -> product packaging -> variant packaging", () => {
    const plan = buildSavePlan(
      draft({
        pricesTouched: true,
        productPackagingTouched: true,
        productPackaging: { standard: [std("buc", true, 1)], custom: [] },
        variantPackagingTouched: true,
        variantPackaging: { var_1: { standard: [std("bax", true, 25)], custom: [] } },
      })
    )
    expect(plan.map((s) => s.kind)).toEqual([
      "prices",
      "product-packaging",
      "variant-packaging",
    ])
  })
})
