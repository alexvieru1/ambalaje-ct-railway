import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { SetPackagingOptionsSchema } from "./validators"
import { z } from "zod"
import { Modules } from "@medusajs/framework/utils"

type SetPackagingOptionsInput = z.infer<typeof SetPackagingOptionsSchema>

export const POST = async (
  req: MedusaRequest<SetPackagingOptionsInput>,
  res: MedusaResponse
) => {
  const { product_id, packaging_options } = req.validatedBody

  const productService = req.scope.resolve(Modules.PRODUCT)

  await productService.updateProducts(product_id, {
    metadata: {
      packaging_options: JSON.stringify(packaging_options),
    },
  })

  res.status(200).json({ success: true, product_id, packaging_options })
}
