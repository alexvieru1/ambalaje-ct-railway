import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { SetVariantPackagingSchema } from "./validators"
import { z } from "zod"
import { Modules } from "@medusajs/framework/utils"

type SetVariantPackagingInput = z.infer<typeof SetVariantPackagingSchema>

export const POST = async (
  req: MedusaRequest<SetVariantPackagingInput>,
  res: MedusaResponse
) => {
  const { variant_id, packaging_options } = req.validatedBody

  const productService = req.scope.resolve(Modules.PRODUCT)

  await productService.updateProductVariants(variant_id, {
    metadata: {
      packaging_options: JSON.stringify(packaging_options),
    },
  })

  res.status(200).json({ success: true, variant_id, packaging_options })
}
