import { normalizeQuantity } from './reconcile'
import { buildSuggestionIndex, suggestSmartBillMatches } from './suggest'
import type { SmartBillSuggestion } from './suggest'
import type { SmartBillStockProduct } from './types'

/**
 * A suggestion, plus whether another variant already owns that code.
 *
 * Medusa enforces unique SKUs, so a code held elsewhere cannot simply be
 * assigned — two Medusa variants pointing at one SmartBill product is a
 * catalogue decision, not something this page can fix in one click.
 */
export type AuditSuggestion = SmartBillSuggestion & {
  taken_by: { variant_id: string; label: string } | null
}

/** One Medusa variant as seen by the audit, flattened for comparison. */
export type AuditVariant = {
  variant_id: string
  product_id: string
  product_title: string
  variant_title: string
  sku: string | null
  /** Stock at the SmartBill-mapped location; null when no level exists. */
  stocked_quantity: number | null
}

export type AuditIssueKind =
  /** No SKU at all, so it can never be matched. */
  | 'missing_sku'
  /** Has a SKU, but SmartBill has no product with that code. */
  | 'not_in_smartbill'
  /** Matched, but the quantities disagree — the sync has not caught up. */
  | 'drift'
  /** Matched, but no inventory level exists at the mapped location yet. */
  | 'no_level'

export type AuditRow = AuditVariant & {
  kind: AuditIssueKind
  /** SmartBill's quantity, floored. Null when there is no match. */
  smartbill_quantity: number | null
  smartbill_name: string | null
  suggestions: AuditSuggestion[]
}

export type SmartBillAuditReport = {
  warehouse: string
  location_id: string
  checked_at: string
  summary: {
    total_variants: number
    in_sync: number
    missing_sku: number
    not_in_smartbill: number
    drift: number
    no_level: number
    smartbill_products: number
    smartbill_only: number
  }
  rows: AuditRow[]
}

const matchKey = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim()
  return trimmed ? trimmed.toUpperCase() : null
}

/**
 * Compare the Medusa catalogue against a SmartBill gestiune and return only
 * the variants that need a human decision.
 *
 * Rows that are matched and already correct are counted but not listed — the
 * page exists to show what is wrong, not to re-list the whole catalogue.
 */
export function buildAuditReport(
  smartBillProducts: SmartBillStockProduct[],
  variants: AuditVariant[],
  options: { warehouse: string; location_id: string },
): SmartBillAuditReport {
  const stockByCode = new Map<string, SmartBillStockProduct>()
  for (const product of smartBillProducts) {
    const key = matchKey(product.productCode)
    if (key && !stockByCode.has(key)) {
      stockByCode.set(key, product)
    }
  }

  const index = buildSuggestionIndex(smartBillProducts)

  // Which variant, if any, already owns each SKU — used to mark suggestions
  // that would be rejected as duplicates.
  const ownerBySku = new Map<string, { variant_id: string; label: string }>()
  for (const variant of variants) {
    const key = matchKey(variant.sku)
    if (key && !ownerBySku.has(key)) {
      ownerBySku.set(key, {
        variant_id: variant.variant_id,
        label: [variant.product_title, variant.variant_title].filter(Boolean).join(' — '),
      })
    }
  }

  const decorate = (
    suggestions: SmartBillSuggestion[],
    variantId: string,
  ): AuditSuggestion[] =>
    suggestions.map((suggestion) => {
      const owner = ownerBySku.get(matchKey(suggestion.product_code) ?? '')
      return {
        ...suggestion,
        taken_by: owner && owner.variant_id !== variantId ? owner : null,
      }
    })

  const rows: AuditRow[] = []
  const matchedCodes = new Set<string>()

  let inSync = 0

  for (const variant of variants) {
    const key = matchKey(variant.sku)
    const product = key ? stockByCode.get(key) : undefined

    if (!product) {
      // Suggestions are only computed for problem rows, which keeps the
      // fuzzy matching off the hot path for a healthy catalogue.
      const title = [variant.product_title, variant.variant_title]
        .filter(Boolean)
        .join(' ')

      rows.push({
        ...variant,
        kind: key ? 'not_in_smartbill' : 'missing_sku',
        smartbill_quantity: null,
        smartbill_name: null,
        suggestions: decorate(
          suggestSmartBillMatches(title, index, { sku: variant.sku }),
          variant.variant_id,
        ),
      })
      continue
    }

    matchedCodes.add(key!)
    const expected = normalizeQuantity(product.quantity)

    if (variant.stocked_quantity === null) {
      rows.push({
        ...variant,
        kind: 'no_level',
        smartbill_quantity: expected,
        smartbill_name: product.productName,
        suggestions: [],
      })
      continue
    }

    if (variant.stocked_quantity !== expected) {
      rows.push({
        ...variant,
        kind: 'drift',
        smartbill_quantity: expected,
        smartbill_name: product.productName,
        suggestions: [],
      })
      continue
    }

    inSync += 1
  }

  const order: Record<AuditIssueKind, number> = {
    missing_sku: 0,
    not_in_smartbill: 1,
    no_level: 2,
    drift: 3,
  }
  rows.sort(
    (a, b) =>
      order[a.kind] - order[b.kind] ||
      a.product_title.localeCompare(b.product_title, 'ro') ||
      a.variant_title.localeCompare(b.variant_title, 'ro'),
  )

  const count = (kind: AuditIssueKind) => rows.filter((row) => row.kind === kind).length

  return {
    warehouse: options.warehouse,
    location_id: options.location_id,
    checked_at: new Date().toISOString(),
    summary: {
      total_variants: variants.length,
      in_sync: inSync,
      missing_sku: count('missing_sku'),
      not_in_smartbill: count('not_in_smartbill'),
      drift: count('drift'),
      no_level: count('no_level'),
      smartbill_products: stockByCode.size,
      smartbill_only: stockByCode.size - matchedCodes.size,
    },
    rows,
  }
}
