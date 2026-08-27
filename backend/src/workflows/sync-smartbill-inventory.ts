import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  when,
  WorkflowResponse,
} from '@medusajs/framework/workflows-sdk'
import { batchInventoryItemLevelsWorkflow } from '@medusajs/medusa/core-flows'

import { buildInventorySyncPlan } from 'lib/smartbill/reconcile'
import type { InventorySyncPlan } from 'lib/smartbill/reconcile'
import { fetchSmartBillStockStep } from './steps/fetch-smartbill-stock'
import { loadVariantInventoryStep } from './steps/load-variant-inventory'
import { releaseStaleReservationsStep } from './steps/release-stale-reservations'

export type SyncSmartBillInventoryInput = {
  /** Gestiune name exactly as it appears in SmartBill — case-sensitive. */
  warehouse: string
  /** Medusa stock location the gestiune maps to. */
  location_id: string
  /** When true, the plan is computed and logged but nothing is written. */
  dry_run: boolean
  /** Release orphaned reservations older than this; 0 skips the step. */
  reservation_max_age_hours: number
  /** Snapshot date as `YYYY-MM-DD`; defaults to today. */
  date?: string
}

export type SyncSmartBillInventoryResult = {
  dry_run: boolean
  warehouse: string
  location_id: string
  smartbill_products: number
  created: number
  updated: number
  unchanged: number
  unmatched_variants: { variant_id: string; sku: string | null; title: string }[]
  unmatched_smartbill_codes: number
  changes: InventorySyncPlan['changes']
  warnings: string[]
  reservations_released: number
}

/**
 * Logs the plan in one place so the scheduled job, the admin route and a dry
 * run all produce the same audit trail.
 */
const logSyncPlanStep = createStep(
  'log-smartbill-sync-plan',
  async (
    { plan, dry_run, warehouse }: { plan: InventorySyncPlan; dry_run: boolean; warehouse: string },
    { container },
  ) => {
    const logger = container.resolve('logger')
    const prefix = dry_run ? '[smartbill][dry-run]' : '[smartbill]'

    logger.info(
      `${prefix} gestiune "${warehouse}": ${plan.create.length} level(s) to create, ` +
        `${plan.update.length} to update, ${plan.unchanged} unchanged, ` +
        `${plan.unmatchedVariants.length} variant(s) without a SmartBill code, ` +
        `${plan.unmatchedSmartBillCodes} SmartBill code(s) without a variant`,
    )

    for (const warning of plan.warnings) {
      logger.warn(`${prefix} ${warning}`)
    }

    for (const change of plan.changes) {
      logger.info(
        `${prefix} ${change.sku}: ${change.from ?? 'no level'} → ${change.to} (${change.title})`,
      )
    }

    if (plan.unmatchedVariants.length) {
      const skus = plan.unmatchedVariants
        .map((variant) => variant.sku ?? `<no sku:${variant.variant_id}>`)
        .join(', ')
      logger.warn(
        `${prefix} left untouched (no matching SmartBill product code): ${skus}`,
      )
    }

    return new StepResponse(void 0)
  },
)

/**
 * Pull stock from a SmartBill gestiune and make Medusa match it.
 *
 * SmartBill is the source of truth, so matched variants are set to the
 * SmartBill quantity outright. Variants SmartBill does not know about are
 * reported and left alone rather than zeroed.
 */
export const syncSmartBillInventoryWorkflow = createWorkflow(
  'sync-smartbill-inventory',
  (input: SyncSmartBillInventoryInput) => {
    const stock = fetchSmartBillStockStep({
      warehouse: input.warehouse,
      date: input.date,
    })

    const variants = loadVariantInventoryStep({ location_id: input.location_id })

    const plan = transform({ stock, variants, input }, (data) =>
      buildInventorySyncPlan(data.stock.products, data.variants, data.input.location_id),
    )

    logSyncPlanStep({ plan, dry_run: input.dry_run, warehouse: input.warehouse })

    // `when` keeps the write out of the workflow entirely during a dry run.
    const batchInput = transform({ plan }, (data) => ({
      create: data.plan.create,
      update: data.plan.update,
      delete: [] as string[],
    }))

    const shouldWrite = transform(
      { plan, input },
      (data) =>
        !data.input.dry_run && (data.plan.create.length > 0 || data.plan.update.length > 0),
    )

    when({ shouldWrite }, (data) => data.shouldWrite).then(() => {
      batchInventoryItemLevelsWorkflow.runAsStep({ input: batchInput })
    })

    const reservations = releaseStaleReservationsStep({
      location_id: input.location_id,
      max_age_hours: input.reservation_max_age_hours,
      dry_run: input.dry_run,
    })

    return new WorkflowResponse(
      transform({ plan, stock, input, reservations }, (data): SyncSmartBillInventoryResult => ({
        dry_run: data.input.dry_run,
        warehouse: data.input.warehouse,
        location_id: data.input.location_id,
        smartbill_products: data.stock.products.length,
        created: data.plan.create.length,
        updated: data.plan.update.length,
        unchanged: data.plan.unchanged,
        unmatched_variants: data.plan.unmatchedVariants,
        unmatched_smartbill_codes: data.plan.unmatchedSmartBillCodes,
        changes: data.plan.changes,
        warnings: data.plan.warnings,
        reservations_released: data.reservations.released,
      })),
    )
  },
)
