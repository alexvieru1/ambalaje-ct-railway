import type { ExecArgs } from '@medusajs/framework/types'

import {
  SMARTBILL_CONFIGURED,
  SMARTBILL_RESERVATION_MAX_AGE_HOURS,
  SMARTBILL_STOCK_LOCATION_ID,
  SMARTBILL_SYNC_DRY_RUN,
  SMARTBILL_WAREHOUSE,
} from 'lib/constants'
import { syncSmartBillInventoryWorkflow } from '../workflows/sync-smartbill-inventory'

/**
 * Run the SmartBill inventory sync from the CLI.
 *
 *   npx medusa exec ./src/scripts/smartbill-sync.ts        # honours SMARTBILL_SYNC_DRY_RUN
 *   npx medusa exec ./src/scripts/smartbill-sync.ts apply  # force a real write
 *   npx medusa exec ./src/scripts/smartbill-sync.ts dry    # force a dry run
 *
 * The arguments are bare words on purpose: `medusa exec` parses anything
 * starting with `--` as its own option, so a `--apply` flag never reaches us.
 */
export default async function smartBillSync({ container, args }: ExecArgs) {
  const logger = container.resolve('logger')

  if (!SMARTBILL_CONFIGURED) {
    logger.error(
      '[smartbill] configuration is incomplete — set SMARTBILL_USERNAME, SMARTBILL_TOKEN, ' +
        'SMARTBILL_CIF, SMARTBILL_WAREHOUSE and SMARTBILL_STOCK_LOCATION_ID',
    )
    return
  }

  const normalized = args.map((arg) => arg.replace(/^--/, '').toLowerCase())

  const dryRun = normalized.includes('apply')
    ? false
    : normalized.includes('dry')
      ? true
      : SMARTBILL_SYNC_DRY_RUN

  const { result } = await syncSmartBillInventoryWorkflow(container).run({
    input: {
      warehouse: SMARTBILL_WAREHOUSE!,
      location_id: SMARTBILL_STOCK_LOCATION_ID!,
      dry_run: dryRun,
      reservation_max_age_hours: SMARTBILL_RESERVATION_MAX_AGE_HOURS,
    },
  })

  logger.info(
    `[smartbill] ${dryRun ? 'DRY RUN — nothing written' : 'applied'}: ` +
      `${result.created} created, ${result.updated} updated, ${result.unchanged} unchanged, ` +
      `${result.unmatched_variants.length} variant(s) skipped, ` +
      `${result.reservations_released} reservation(s) released`,
  )
}
