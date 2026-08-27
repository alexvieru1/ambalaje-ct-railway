import type { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { updateProductVariantsWorkflow } from '@medusajs/medusa/core-flows'
import { z } from 'zod'

import { SMARTBILL_CONFIGURED, SMARTBILL_WAREHOUSE } from 'lib/constants'
import { invalidateAuditCache } from 'lib/smartbill/audit-cache'
import { SmartBillClient, SmartBillError } from 'lib/smartbill/client'
import { AssignSkuSchema } from './validators'

type AssignSkuInput = z.infer<typeof AssignSkuSchema>

/**
 * Point a Medusa variant at a SmartBill product code.
 *
 * The SKU is validated against the live SmartBill catalogue first: assigning a
 * code that does not exist there would leave the variant looking fixed on this
 * page while the sync still silently skips it. Uniqueness is checked too,
 * because two variants sharing a code would fight over one inventory level.
 */
export const POST = async (
  req: MedusaRequest<AssignSkuInput>,
  res: MedusaResponse,
) => {
  if (!SMARTBILL_CONFIGURED) {
    res.status(400).json({ message: 'SmartBill nu este configurat.' })
    return
  }

  const { variant_id, sku } = req.validatedBody
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let exists: { productCode: string; productName: string } | undefined
  try {
    const entry = await new SmartBillClient().getWarehouseStock(SMARTBILL_WAREHOUSE!)
    exists = (entry.products ?? []).find(
      (product) => product.productCode?.trim().toUpperCase() === sku.toUpperCase(),
    )
  } catch (error) {
    const message =
      error instanceof SmartBillError
        ? error.message
        : `Nu s-a putut contacta SmartBill: ${(error as Error).message}`
    res.status(502).json({ message })
    return
  }

  if (!exists) {
    res.status(400).json({
      message: `Codul „${sku}” nu există în gestiunea SmartBill „${SMARTBILL_WAREHOUSE}”.`,
    })
    return
  }

  const { data: clashing } = await query.graph({
    entity: 'variant',
    fields: ['id', 'title', 'product.title'],
    filters: { sku },
  })

  const other = (clashing ?? []).find((variant) => variant.id !== variant_id)
  if (other) {
    res.status(409).json({
      message:
        `Codul „${sku}” este deja folosit de „${other.product?.title ?? ''} ${other.title ?? ''}”.`.trim(),
    })
    return
  }

  await updateProductVariantsWorkflow(req.scope).run({
    input: { product_variants: [{ id: variant_id, sku }] },
  })

  // The cached report still shows this variant as broken.
  invalidateAuditCache()

  res.status(200).json({
    success: true,
    variant_id,
    sku,
    smartbill_name: exists.productName,
  })
}
