import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"

type SetTieredPricesInput = {
  product_id: string
  variant_id: string
  price_1_9: number | null | undefined
  price_10_24: number | null | undefined
  price_25: number | null | undefined
  currency_code: string
}

export const setTieredPricesWorkflow = createWorkflow(
  "set-tiered-prices",
  ({
    product_id,
    variant_id,
    price_1_9,
    price_10_24,
    price_25,
    currency_code,
  }: SetTieredPricesInput) => {
    // Fetch product and its variants
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: ["id", "title", "variants.id", "variants.title"],
      filters: { id: product_id },
    })

    // Build only the price entries for tiers that have a value
    const prices = transform(
      { price_1_9, price_10_24, price_25, currency_code },
      (data) => {
        const entries: {
          amount: number
          currency_code: string
          min_quantity: number
          max_quantity?: number
        }[] = []

        if (data.price_1_9 != null) {
          entries.push({
            amount: data.price_1_9,
            currency_code: data.currency_code,
            min_quantity: 1,
            max_quantity: 9,
          })
        }

        if (data.price_10_24 != null) {
          entries.push({
            amount: data.price_10_24,
            currency_code: data.currency_code,
            min_quantity: 10,
            max_quantity: 24,
          })
        }

        if (data.price_25 != null) {
          entries.push({
            amount: data.price_25,
            currency_code: data.currency_code,
            min_quantity: 25,
          })
        }

        return entries
      }
    )

    // Update the selected variant with tiered prices
    updateProductVariantsWorkflow.runAsStep({
      input: {
        product_variants: [
          {
            id: variant_id,
            prices,
          },
        ],
      },
    })

    return new WorkflowResponse({ success: true })
  }
)
