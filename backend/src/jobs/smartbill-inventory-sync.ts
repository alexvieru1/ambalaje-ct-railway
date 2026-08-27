import type { MedusaContainer } from '@medusajs/framework/types'

import {
  SMARTBILL_CONFIGURED,
  SMARTBILL_RESERVATION_MAX_AGE_HOURS,
  SMARTBILL_STOCK_LOCATION_ID,
  SMARTBILL_SYNC_CRON,
  SMARTBILL_SYNC_DRY_RUN,
  SMARTBILL_SYNC_ENABLED,
  SMARTBILL_WAREHOUSE,
} from 'lib/constants'
import { syncSmartBillInventoryWorkflow } from '../workflows/sync-smartbill-inventory'

export default async function smartBillInventorySyncJob(container: MedusaContainer) {
  const logger = container.resolve('logger')

  if (!SMARTBILL_SYNC_ENABLED) {
    return
  }

  if (!SMARTBILL_CONFIGURED) {
    logger.warn(
      '[smartbill] sync is enabled but configuration is incomplete — set SMARTBILL_USERNAME, ' +
        'SMARTBILL_TOKEN, SMARTBILL_CIF, SMARTBILL_WAREHOUSE and SMARTBILL_STOCK_LOCATION_ID',
    )
    return
  }

  try {
    const { result } = await syncSmartBillInventoryWorkflow(container).run({
      input: {
        warehouse: SMARTBILL_WAREHOUSE!,
        location_id: SMARTBILL_STOCK_LOCATION_ID!,
        dry_run: SMARTBILL_SYNC_DRY_RUN,
        reservation_max_age_hours: SMARTBILL_RESERVATION_MAX_AGE_HOURS,
      },
    })

    logger.info(
      `[smartbill] scheduled sync finished: ${result.created} created, ${result.updated} updated, ` +
        `${result.unchanged} unchanged${result.dry_run ? ' (dry run — nothing written)' : ''}`,
    )
  } catch (error) {
    // A failed sync must not take the worker down; the next tick retries.
    logger.error(`[smartbill] scheduled sync failed: ${(error as Error).message}`)
  }
}

export const config = {
  name: 'smartbill-inventory-sync',
  schedule: SMARTBILL_SYNC_CRON,
}
