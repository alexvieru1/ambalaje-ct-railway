import type { SmartBillStockProduct } from './types'

/**
 * One Medusa variant flattened together with the inventory level it owns at
 * the target stock location. `level_id` is null when no level row exists yet.
 */
export type MedusaVariantInventory = {
  variant_id: string
  sku: string | null
  title: string
  inventory_item_id: string
  level_id: string | null
  stocked_quantity: number | null
  reserved_quantity: number | null
}

export type InventoryLevelCreate = {
  inventory_item_id: string
  location_id: string
  stocked_quantity: number
}

export type InventoryLevelUpdate = {
  id: string
  inventory_item_id: string
  location_id: string
  stocked_quantity: number
}

export type InventorySyncChange = {
  sku: string
  title: string
  from: number | null
  to: number
}

export type InventorySyncPlan = {
  create: InventoryLevelCreate[]
  update: InventoryLevelUpdate[]
  /** Human-readable view of everything in `create` + `update`, for logging. */
  changes: InventorySyncChange[]
  unchanged: number
  /** Medusa variants with no matching SmartBill product code — left untouched. */
  unmatchedVariants: { variant_id: string; sku: string | null; title: string }[]
  /** SmartBill product codes with no Medusa variant — ignored. */
  unmatchedSmartBillCodes: number
  warnings: string[]
}

/**
 * SmartBill reports quantities as decimals (e.g. 0.67 BAX, 107.3 KG) while
 * Medusa inventory is a non-negative integer. Rounding down is the safe
 * direction: it can never promise stock that does not exist.
 */
export function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 0
  }
  return Math.max(0, Math.floor(quantity))
}

/** Product codes and SKUs are compared trimmed and case-insensitively. */
function matchKey(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed.toUpperCase() : null
}

/**
 * Reconcile a SmartBill gestiune against Medusa's inventory levels.
 *
 * SmartBill is the source of truth for `stocked_quantity`, so matched variants
 * are set to the SmartBill figure outright rather than adjusted by a delta.
 * Variants SmartBill does not know about are deliberately left alone — zeroing
 * them would silently pull products off the storefront.
 */
export function buildInventorySyncPlan(
  smartBillProducts: SmartBillStockProduct[],
  variants: MedusaVariantInventory[],
  locationId: string,
): InventorySyncPlan {
  const warnings: string[] = []

  const stockByCode = new Map<string, SmartBillStockProduct>()
  for (const product of smartBillProducts) {
    const key = matchKey(product.productCode)
    if (!key) {
      continue
    }
    if (stockByCode.has(key)) {
      warnings.push(
        `SmartBill returned duplicate product code "${product.productCode}"; using the first occurrence.`,
      )
      continue
    }
    stockByCode.set(key, product)
  }

  const plan: InventorySyncPlan = {
    create: [],
    update: [],
    changes: [],
    unchanged: 0,
    unmatchedVariants: [],
    unmatchedSmartBillCodes: 0,
    warnings,
  }

  const matchedCodes = new Set<string>()
  const seenInventoryItems = new Map<string, string>()

  for (const variant of variants) {
    const key = matchKey(variant.sku)
    const product = key ? stockByCode.get(key) : undefined

    if (!product) {
      plan.unmatchedVariants.push({
        variant_id: variant.variant_id,
        sku: variant.sku,
        title: variant.title,
      })
      continue
    }

    matchedCodes.add(key!)

    // Two variants pointing at one inventory item would fight over the level.
    const claimedBy = seenInventoryItems.get(variant.inventory_item_id)
    if (claimedBy) {
      warnings.push(
        `Inventory item ${variant.inventory_item_id} is linked to both SKU ${claimedBy} and ` +
          `SKU ${variant.sku}; skipping the latter to avoid conflicting writes.`,
      )
      continue
    }
    seenInventoryItems.set(variant.inventory_item_id, variant.sku ?? variant.variant_id)

    const target = normalizeQuantity(product.quantity)

    if (variant.level_id === null) {
      plan.create.push({
        inventory_item_id: variant.inventory_item_id,
        location_id: locationId,
        stocked_quantity: target,
      })
      plan.changes.push({
        sku: variant.sku!,
        title: variant.title,
        from: null,
        to: target,
      })
      continue
    }

    if (variant.stocked_quantity === target) {
      plan.unchanged += 1
      continue
    }

    plan.update.push({
      id: variant.level_id,
      inventory_item_id: variant.inventory_item_id,
      location_id: locationId,
      stocked_quantity: target,
    })
    plan.changes.push({
      sku: variant.sku!,
      title: variant.title,
      from: variant.stocked_quantity,
      to: target,
    })
  }

  plan.unmatchedSmartBillCodes = stockByCode.size - matchedCodes.size

  return plan
}
