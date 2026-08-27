import { z } from 'zod'

/**
 * Every field is optional: with an empty body the route runs exactly what the
 * scheduled job would run, using the environment configuration.
 */
export const SmartBillSyncSchema = z.object({
  warehouse: z.string().min(1).optional(),
  location_id: z.string().min(1).optional(),
  /** Defaults to the SMARTBILL_SYNC_DRY_RUN setting. */
  dry_run: z.boolean().optional(),
  reservation_max_age_hours: z.number().int().min(0).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be formatted as YYYY-MM-DD')
    .optional(),
})
