import { buildInventorySyncPlan, normalizeQuantity } from './reconcile'
import type { MedusaVariantInventory } from './reconcile'
import type { SmartBillStockProduct } from './types'

const LOCATION = 'sloc_test'

const product = (
  productCode: string,
  quantity: number,
  productName = `Product ${productCode}`,
): SmartBillStockProduct => ({
  productCode,
  quantity,
  productName,
  measuringUnit: 'BUC',
})

const variant = (
  overrides: Partial<MedusaVariantInventory> & Pick<MedusaVariantInventory, 'sku'>,
): MedusaVariantInventory => ({
  variant_id: `variant_${overrides.sku}`,
  title: `Title ${overrides.sku}`,
  inventory_item_id: `iitem_${overrides.sku}`,
  level_id: `iilev_${overrides.sku}`,
  stocked_quantity: 0,
  reserved_quantity: 0,
  ...overrides,
})

describe('normalizeQuantity', () => {
  it('rounds fractional stock down so it never over-promises', () => {
    expect(normalizeQuantity(6.8)).toBe(6)
    expect(normalizeQuantity(0.67)).toBe(0)
    expect(normalizeQuantity(107.3)).toBe(107)
  })

  it('clamps negatives and non-finite values to zero', () => {
    expect(normalizeQuantity(-5)).toBe(0)
    expect(normalizeQuantity(Number.NaN)).toBe(0)
    expect(normalizeQuantity(Number.POSITIVE_INFINITY)).toBe(0)
  })
})

describe('buildInventorySyncPlan', () => {
  it('updates a level whose quantity drifted from SmartBill', () => {
    const plan = buildInventorySyncPlan(
      [product('1215', 500)],
      [variant({ sku: '1215', stocked_quantity: 12 })],
      LOCATION,
    )

    expect(plan.update).toEqual([
      {
        id: 'iilev_1215',
        inventory_item_id: 'iitem_1215',
        location_id: LOCATION,
        stocked_quantity: 500,
      },
    ])
    expect(plan.create).toHaveLength(0)
    expect(plan.changes).toEqual([
      { sku: '1215', title: 'Title 1215', from: 12, to: 500 },
    ])
  })

  it('creates a level when the variant has none at the location', () => {
    const plan = buildInventorySyncPlan(
      [product('1216', 41)],
      [variant({ sku: '1216', level_id: null, stocked_quantity: null })],
      LOCATION,
    )

    expect(plan.create).toEqual([
      {
        inventory_item_id: 'iitem_1216',
        location_id: LOCATION,
        stocked_quantity: 41,
      },
    ])
    expect(plan.update).toHaveLength(0)
    expect(plan.changes[0]).toMatchObject({ from: null, to: 41 })
  })

  it('counts an already-correct level as unchanged', () => {
    const plan = buildInventorySyncPlan(
      [product('1217', 515)],
      [variant({ sku: '1217', stocked_quantity: 515 })],
      LOCATION,
    )

    expect(plan.unchanged).toBe(1)
    expect(plan.create).toHaveLength(0)
    expect(plan.update).toHaveLength(0)
    expect(plan.changes).toHaveLength(0)
  })

  it('leaves variants without a SmartBill code untouched rather than zeroing them', () => {
    const plan = buildInventorySyncPlan(
      [product('1215', 500)],
      [
        variant({ sku: '1215', stocked_quantity: 500 }),
        variant({ sku: 'sku-14x12xH8 K6', stocked_quantity: 30 }),
        variant({ sku: null, stocked_quantity: 7 }),
      ],
      LOCATION,
    )

    expect(plan.create).toHaveLength(0)
    expect(plan.update).toHaveLength(0)
    expect(plan.unmatchedVariants.map((entry) => entry.sku)).toEqual([
      'sku-14x12xH8 K6',
      null,
    ])
  })

  it('matches SKUs case-insensitively and ignoring surrounding whitespace', () => {
    const plan = buildInventorySyncPlan(
      [product(' ab12 ', 9)],
      [variant({ sku: 'AB12', stocked_quantity: 0 })],
      LOCATION,
    )

    expect(plan.update).toHaveLength(1)
    expect(plan.unmatchedVariants).toHaveLength(0)
  })

  it('floors fractional SmartBill quantities into the plan', () => {
    const plan = buildInventorySyncPlan(
      [product('1266', 6.8)],
      [variant({ sku: '1266', stocked_quantity: 0 })],
      LOCATION,
    )

    expect(plan.update[0].stocked_quantity).toBe(6)
  })

  it('reports SmartBill codes that no variant claims', () => {
    const plan = buildInventorySyncPlan(
      [product('1215', 500), product('9999', 1), product('8888', 2)],
      [variant({ sku: '1215', stocked_quantity: 500 })],
      LOCATION,
    )

    expect(plan.unmatchedSmartBillCodes).toBe(2)
  })

  it('skips a second variant claiming the same inventory item and warns', () => {
    const plan = buildInventorySyncPlan(
      [product('1215', 500), product('1216', 41)],
      [
        variant({ sku: '1215', inventory_item_id: 'iitem_shared', level_id: 'iilev_shared' }),
        variant({ sku: '1216', inventory_item_id: 'iitem_shared', level_id: 'iilev_shared' }),
      ],
      LOCATION,
    )

    expect(plan.update).toHaveLength(1)
    expect(plan.update[0].stocked_quantity).toBe(500)
    expect(plan.warnings).toHaveLength(1)
    expect(plan.warnings[0]).toContain('iitem_shared')
  })

  it('keeps the first of duplicate SmartBill product codes and warns', () => {
    const plan = buildInventorySyncPlan(
      [product('1215', 500), product('1215', 3)],
      [variant({ sku: '1215', stocked_quantity: 0 })],
      LOCATION,
    )

    expect(plan.update[0].stocked_quantity).toBe(500)
    expect(plan.warnings[0]).toContain('duplicate product code')
  })
})
