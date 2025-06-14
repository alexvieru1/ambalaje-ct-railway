// src/workflows/steps/get-tiered-price.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export type GetTieredPriceStepInput = {
  variant: any
  currencyCode: string
  quantity: number
}

export const getTieredPriceStep = createStep(
  "get-tiered-price",
  async ({ variant, currencyCode, quantity }: GetTieredPriceStepInput) => {
    // Find the price entry that matches the currency and quantity
    const price = variant.prices.find((p) => {
      return (
        p.currency_code === currencyCode &&
        (!p.min_quantity || quantity >= p.min_quantity) &&
        (!p.max_quantity || quantity <= p.max_quantity)
      )
    })
    if (!price) {
      throw new Error("No price found for the given quantity and currency")
    }
    return new StepResponse(price.amount)
  }
)