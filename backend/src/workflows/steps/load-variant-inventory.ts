import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk'

import type { MedusaVariantInventory } from 'lib/smartbill/reconcile'

export type LoadVariantInventoryStepInput = {
  location_id: string
}

/**
 * Flatten every stock-managed variant together with its inventory level at the
 * target location. Variants whose level row does not exist yet come back with
 * `level_id: null` so the reconciler can create one.
 */
export const loadVariantInventoryStep = createStep(
  'load-variant-inventory',
  async (
    { location_id }: LoadVariantInventoryStepInput,
    { container },
  ): Promise<StepResponse<MedusaVariantInventory[]>> => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: variants } = await query.graph({
      entity: 'variant',
      fields: [
        'id',
        'sku',
        'title',
        'manage_inventory',
        'product.title',
        'inventory_items.inventory_item_id',
        'inventory_items.inventory.location_levels.id',
        'inventory_items.inventory.location_levels.location_id',
        'inventory_items.inventory.location_levels.stocked_quantity',
        'inventory_items.inventory.location_levels.reserved_quantity',
      ],
      filters: { manage_inventory: true },
    })

    const rows: MedusaVariantInventory[] = []

    for (const variant of variants ?? []) {
      for (const link of variant.inventory_items ?? []) {
        if (!link?.inventory_item_id) {
          continue
        }

        const level = (link.inventory?.location_levels ?? []).find(
          (candidate) => candidate?.location_id === location_id,
        )

        rows.push({
          variant_id: variant.id,
          sku: variant.sku ?? null,
          title: [variant.product?.title, variant.title].filter(Boolean).join(' — '),
          inventory_item_id: link.inventory_item_id,
          level_id: level?.id ?? null,
          stocked_quantity: level?.stocked_quantity ?? null,
          reserved_quantity: level?.reserved_quantity ?? null,
        })
      }
    }

    return new StepResponse(rows)
  },
)
