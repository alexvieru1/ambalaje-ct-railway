import { z } from "zod"

export const SetVariantPackagingSchema = z.object({
  variant_id: z.string(),
  packaging_options: z.array(
    z.object({
      label: z.string().min(1),
      multiplier: z.number().positive(),
    })
  ),
})
