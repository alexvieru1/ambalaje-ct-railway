import type { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

import {
  SMARTBILL_CONFIGURED,
  SMARTBILL_STOCK_LOCATION_ID,
  SMARTBILL_WAREHOUSE,
} from 'lib/constants'
import { buildAuditReport } from 'lib/smartbill/audit'
import type { AuditVariant } from 'lib/smartbill/audit'
import { readAuditCache, writeAuditCache } from 'lib/smartbill/audit-cache'
import { SmartBillClient, SmartBillError } from 'lib/smartbill/client'

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!SMARTBILL_CONFIGURED) {
    res.status(200).json({
      configured: false,
      message:
        'SmartBill nu este configurat. Setează SMARTBILL_USERNAME, SMARTBILL_TOKEN, ' +
        'SMARTBILL_CIF, SMARTBILL_WAREHOUSE și SMARTBILL_STOCK_LOCATION_ID.',
      report: null,
    })
    return
  }

  // `?refresh=1` bypasses the short-lived cache.
  const refresh = req.query.refresh === '1' || req.query.refresh === 'true'
  const cached = refresh ? null : readAuditCache()

  if (cached) {
    res.status(200).json({ configured: true, cached: true, report: cached })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let products
  try {
    const entry = await new SmartBillClient().getWarehouseStock(SMARTBILL_WAREHOUSE!)
    products = entry.products ?? []
  } catch (error) {
    const message =
      error instanceof SmartBillError
        ? error.message
        : `Nu s-a putut contacta SmartBill: ${(error as Error).message}`
    res.status(502).json({ configured: true, message, report: null })
    return
  }

  const { data: variants } = await query.graph({
    entity: 'variant',
    fields: [
      'id',
      'sku',
      'title',
      'product.id',
      'product.title',
      'inventory_items.inventory.location_levels.location_id',
      'inventory_items.inventory.location_levels.stocked_quantity',
    ],
  })

  const auditVariants: AuditVariant[] = (variants ?? []).map((variant) => {
    const level = (variant.inventory_items?.[0]?.inventory?.location_levels ?? []).find(
      (candidate) => candidate?.location_id === SMARTBILL_STOCK_LOCATION_ID,
    )

    return {
      variant_id: variant.id,
      product_id: variant.product?.id ?? '',
      product_title: variant.product?.title ?? '',
      variant_title: variant.title ?? '',
      sku: variant.sku ?? null,
      stocked_quantity: level?.stocked_quantity ?? null,
    }
  })

  const report = buildAuditReport(products, auditVariants, {
    warehouse: SMARTBILL_WAREHOUSE!,
    location_id: SMARTBILL_STOCK_LOCATION_ID!,
  })

  writeAuditCache(report)

  res.status(200).json({ configured: true, cached: false, report })
}
