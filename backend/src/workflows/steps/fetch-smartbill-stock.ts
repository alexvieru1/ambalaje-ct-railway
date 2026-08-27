import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk'

import { SmartBillClient } from 'lib/smartbill/client'
import type { SmartBillStockProduct } from 'lib/smartbill/types'

export type FetchSmartBillStockStepInput = {
  /** Gestiune name exactly as it appears in SmartBill — case-sensitive. */
  warehouse: string
  /** Snapshot date as `YYYY-MM-DD`; defaults to today inside the client. */
  date?: string
}

export type FetchSmartBillStockStepOutput = {
  warehouse: string
  products: SmartBillStockProduct[]
}

/**
 * Read-only, so there is no compensation function: nothing to undo.
 */
export const fetchSmartBillStockStep = createStep(
  'fetch-smartbill-stock',
  async (
    { warehouse, date }: FetchSmartBillStockStepInput,
    { container },
  ): Promise<StepResponse<FetchSmartBillStockStepOutput>> => {
    const logger = container.resolve('logger')
    const client = new SmartBillClient()

    const entry = await client.getWarehouseStock(warehouse, date)
    const products = entry.products ?? []

    logger.info(
      `[smartbill] fetched ${products.length} products from gestiune "${warehouse}"`,
    )

    return new StepResponse({ warehouse, products })
  },
)
