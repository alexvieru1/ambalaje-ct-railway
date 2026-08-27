import type { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { z } from 'zod'

import {
  SMARTBILL_CONFIGURED,
  SMARTBILL_RESERVATION_MAX_AGE_HOURS,
  SMARTBILL_STOCK_LOCATION_ID,
  SMARTBILL_SYNC_CRON,
  SMARTBILL_SYNC_DRY_RUN,
  SMARTBILL_SYNC_ENABLED,
  SMARTBILL_WAREHOUSE,
} from 'lib/constants'
import { syncSmartBillInventoryWorkflow } from '../../../workflows/sync-smartbill-inventory'
import { SmartBillSyncSchema } from './validators'

type SmartBillSyncInput = z.infer<typeof SmartBillSyncSchema>

/**
 * Report the current SmartBill configuration without touching anything.
 */
export const GET = async (_req: MedusaRequest, res: MedusaResponse) => {
  res.status(200).json({
    configured: SMARTBILL_CONFIGURED,
    scheduled_sync_enabled: SMARTBILL_SYNC_ENABLED,
    schedule: SMARTBILL_SYNC_CRON,
    dry_run: SMARTBILL_SYNC_DRY_RUN,
    warehouse: SMARTBILL_WAREHOUSE ?? null,
    location_id: SMARTBILL_STOCK_LOCATION_ID ?? null,
    reservation_max_age_hours: SMARTBILL_RESERVATION_MAX_AGE_HOURS,
  })
}

/**
 * Run a sync on demand. Honours the environment defaults unless the body
 * overrides them, so `POST` with no body is a safe dry run by default.
 */
export const POST = async (
  req: MedusaRequest<SmartBillSyncInput>,
  res: MedusaResponse,
) => {
  const body = req.validatedBody ?? {}

  const warehouse = body.warehouse ?? SMARTBILL_WAREHOUSE
  const locationId = body.location_id ?? SMARTBILL_STOCK_LOCATION_ID

  if (!warehouse || !locationId) {
    res.status(400).json({
      message:
        'SmartBill is not configured. Set SMARTBILL_WAREHOUSE and SMARTBILL_STOCK_LOCATION_ID, ' +
        'or pass warehouse and location_id in the request body.',
    })
    return
  }

  const { result } = await syncSmartBillInventoryWorkflow(req.scope).run({
    input: {
      warehouse,
      location_id: locationId,
      dry_run: body.dry_run ?? SMARTBILL_SYNC_DRY_RUN,
      reservation_max_age_hours:
        body.reservation_max_age_hours ?? SMARTBILL_RESERVATION_MAX_AGE_HOURS,
      date: body.date,
    },
  })

  res.status(200).json(result)
}
