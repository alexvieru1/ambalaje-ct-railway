import { buildAuditReport } from './audit'
import type { AuditVariant } from './audit'
import type { SmartBillStockProduct } from './types'

const OPTIONS = { warehouse: 'DEPOZIT', location_id: 'sloc_test' }

const product = (
  productCode: string,
  quantity: number,
  productName = `Produs ${productCode}`,
): SmartBillStockProduct => ({
  productCode,
  quantity,
  productName,
  measuringUnit: 'BUC',
})

const variant = (overrides: Partial<AuditVariant> = {}): AuditVariant => ({
  variant_id: 'variant_1',
  product_id: 'prod_1',
  product_title: 'Cutie tort',
  variant_title: '25',
  sku: '1215',
  stocked_quantity: 10,
  ...overrides,
})

describe('buildAuditReport', () => {
  it('omits variants that already agree with SmartBill', () => {
    const report = buildAuditReport(
      [product('1215', 10)],
      [variant({ stocked_quantity: 10 })],
      OPTIONS,
    )

    expect(report.rows).toHaveLength(0)
    expect(report.summary.in_sync).toBe(1)
  })

  it('flags a variant with no SKU', () => {
    const report = buildAuditReport(
      [product('1215', 10)],
      [variant({ sku: null })],
      OPTIONS,
    )

    expect(report.rows[0].kind).toBe('missing_sku')
    expect(report.summary.missing_sku).toBe(1)
  })

  it('treats a blank SKU as missing rather than unmatched', () => {
    const report = buildAuditReport([product('1215', 10)], [variant({ sku: '   ' })], OPTIONS)
    expect(report.rows[0].kind).toBe('missing_sku')
  })

  it('flags a SKU SmartBill has never heard of', () => {
    const report = buildAuditReport(
      [product('1215', 10)],
      [variant({ sku: 'sku-40x40xH40' })],
      OPTIONS,
    )

    expect(report.rows[0].kind).toBe('not_in_smartbill')
    expect(report.summary.not_in_smartbill).toBe(1)
  })

  it('flags a matched variant with no inventory level yet', () => {
    const report = buildAuditReport(
      [product('1215', 41)],
      [variant({ stocked_quantity: null })],
      OPTIONS,
    )

    expect(report.rows[0]).toMatchObject({ kind: 'no_level', smartbill_quantity: 41 })
  })

  it('flags quantity drift and reports both sides', () => {
    const report = buildAuditReport(
      [product('1215', 500)],
      [variant({ stocked_quantity: 12 })],
      OPTIONS,
    )

    expect(report.rows[0]).toMatchObject({
      kind: 'drift',
      stocked_quantity: 12,
      smartbill_quantity: 500,
    })
  })

  it('compares against the floored SmartBill quantity, not the raw decimal', () => {
    const report = buildAuditReport(
      [product('1215', 6.8)],
      [variant({ stocked_quantity: 6 })],
      OPTIONS,
    )

    expect(report.rows).toHaveLength(0)
    expect(report.summary.in_sync).toBe(1)
  })

  it('counts SmartBill products that no variant claims', () => {
    const report = buildAuditReport(
      [product('1215', 10), product('9999', 1), product('8888', 2)],
      [variant({ stocked_quantity: 10 })],
      OPTIONS,
    )

    expect(report.summary.smartbill_products).toBe(3)
    expect(report.summary.smartbill_only).toBe(2)
  })

  it('marks a suggested code that another variant already owns', () => {
    const report = buildAuditReport(
      [product('449', 265, 'CUTIE PATISERIE K2 13X10X8')],
      [
        variant({
          variant_id: 'v_choc',
          sku: '449',
          product_title: 'Cutie prăjituri chocolate',
          variant_title: '13x10xH8 K2',
          stocked_quantity: 265,
        }),
        variant({
          variant_id: 'v_pastry',
          sku: '4499',
          product_title: 'Cutie prăjituri Pastry',
          variant_title: '13x10xH8 K2',
        }),
      ],
      OPTIONS,
    )

    const pastry = report.rows.find((row) => row.variant_id === 'v_pastry')!
    const suggestion = pastry.suggestions.find((s) => s.product_code === '449')!

    expect(suggestion.taken_by).toEqual({
      variant_id: 'v_choc',
      label: 'Cutie prăjituri chocolate — 13x10xH8 K2',
    })
  })

  it('leaves taken_by null for a code no variant uses', () => {
    const report = buildAuditReport(
      [product('449', 265, 'CUTIE PATISERIE K2 13X10X8')],
      [variant({ variant_id: 'v_pastry', sku: '4499', product_title: 'Cutie patiserie K2 13x10x8', variant_title: '' })],
      OPTIONS,
    )

    expect(report.rows[0].suggestions[0].taken_by).toBeNull()
  })

  it('attaches suggestions to unmatched rows and not to drift rows', () => {
    const report = buildAuditReport(
      [product('1212', 5, 'CUTIE TORT 25'), product('1215', 500, 'ALTCEVA')],
      [
        variant({ variant_id: 'v_a', sku: 'necunoscut', product_title: 'Cutie tort', variant_title: '25' }),
        variant({ variant_id: 'v_b', sku: '1215', stocked_quantity: 12 }),
      ],
      OPTIONS,
    )

    const unmatched = report.rows.find((row) => row.variant_id === 'v_a')!
    const drifted = report.rows.find((row) => row.variant_id === 'v_b')!

    expect(unmatched.suggestions[0].product_code).toBe('1212')
    expect(drifted.suggestions).toEqual([])
  })

  it('orders rows by severity: missing SKU first, drift last', () => {
    const report = buildAuditReport(
      [product('1215', 500)],
      [
        variant({ variant_id: 'v_drift', sku: '1215', stocked_quantity: 12 }),
        variant({ variant_id: 'v_nosku', sku: null }),
        variant({ variant_id: 'v_unknown', sku: 'zzz' }),
      ],
      OPTIONS,
    )

    expect(report.rows.map((row) => row.kind)).toEqual([
      'missing_sku',
      'not_in_smartbill',
      'drift',
    ])
  })
})
