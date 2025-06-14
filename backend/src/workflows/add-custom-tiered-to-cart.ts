// src/workflows/add-custom-tiered-to-cart.ts
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { getTieredPriceStep } from "./steps/get-tiered-price"

type AddCustomTieredToCartWorkflowInput = {
  cart_id: string
  item: {
    variant_id: string
    quantity: number
    metadata?: Record<string, unknown>
  }
}

export const addCustomTieredToCartWorkflow = createWorkflow(
  "add-custom-tiered-to-cart",
  ({ cart_id, item }: AddCustomTieredToCartWorkflowInput) => {
    // Retrieve cart details
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      filters: { id: cart_id },
      fields: ["id", "currency_code"],
    })

    // Retrieve variant details (including prices)
    const { data: variants } = useQueryGraphStep({
      entity: "variant",
      fields: ["*", "prices.*"],
      filters: { id: item.variant_id },
      options: { throwIfKeyNotFound: true },
    }).config({ name: "retrieve-variant" })

    // Get the correct price for the quantity
    const price = getTieredPriceStep({
      variant: variants[0],
      currencyCode: carts[0].currency_code,
      quantity: item.quantity,
    })

    // Prepare the item to add
    const itemToAdd = transform({ item, price }, (data) => {
      return [
        {
          ...data.item,
          unit_price: data.price,
        },
      ]
    })

    // Add to cart
    addToCartWorkflow.runAsStep({
      input: {
        items: itemToAdd,
        cart_id,
      },
    })

    // Retrieve and return updated cart
    const { data: updatedCarts } = useQueryGraphStep({
      entity: "cart",
      filters: { id: cart_id },
      fields: ["id", "items.*"],
    }).config({ name: "refetch-cart" })

    return new WorkflowResponse({ cart: updatedCarts[0] })
  }
)