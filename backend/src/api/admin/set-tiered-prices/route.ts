import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { SetTieredPricesSchema } from "./validators"
import { z } from "zod"
import { setTieredPricesWorkflow } from "../../../workflows/set-tiered-prices"

type SetTieredPricesInput = z.infer<typeof SetTieredPricesSchema>

export const POST = async (
  req: MedusaRequest<SetTieredPricesInput>,
  res: MedusaResponse
) => {
  const {
    product_id,
    variant_id,
    price_1_9,
    price_10_24,
    price_25,
    currency_code,
  } = req.validatedBody

  await setTieredPricesWorkflow(req.scope).run({
    input: {
      product_id,
      variant_id,
      price_1_9,
      price_10_24,
      price_25,
      currency_code,
    },
  })

  res.status(200).json({ success: true })
}