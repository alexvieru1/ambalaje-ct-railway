import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"

type SetTieredPricesInput = {
  product_id: string
  variant_id: string
  price_1_9: number
  price_10_24: number
  price_25: number
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

    // Update the selected variant with tiered prices
    updateProductVariantsWorkflow.runAsStep({
      input: {
        product_variants: [
          {
            id: variant_id,
            prices: [
              { amount: price_1_9, currency_code, min_quantity: 1, max_quantity: 9 },
              { amount: price_10_24, currency_code, min_quantity: 10, max_quantity: 24 },
              { amount: price_25, currency_code, min_quantity: 25 },
            ],
          },
        ],
      },
    })

    return new WorkflowResponse({ success: true })
  }
)