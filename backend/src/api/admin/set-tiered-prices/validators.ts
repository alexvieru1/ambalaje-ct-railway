import { z } from "zod"

export const SetTieredPricesSchema = z.object({
  product_id: z.string(),
  variant_id: z.string(),
  price_1_9: z.number(),
  price_10_24: z.number(),
  price_25: z.number(),
  currency_code: z.string(),
})