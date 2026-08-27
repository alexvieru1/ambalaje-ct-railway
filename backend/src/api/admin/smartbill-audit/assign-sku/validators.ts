import { z } from 'zod'

export const AssignSkuSchema = z.object({
  variant_id: z.string().min(1),
  /** Must be an existing SmartBill productCode; the route verifies it. */
  sku: z.string().trim().min(1),
})
