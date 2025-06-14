// src/api/store/carts/[id]/line-items-tiered/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { addCustomTieredToCartWorkflow } from "../../../../../workflows/add-custom-tiered-to-cart"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const item = req.body
  const { result } = await addCustomTieredToCartWorkflow(req.scope).run({
    input: {
      cart_id: id,
      //@ts-ignore
      item,
    },
  })
  res.status(200).json({ cart: result.cart })
}