import type { SmartBillAuditReport } from './audit'

/**
 * The full SmartBill stock listing is ~1900 products and takes a few seconds
 * to fetch, so the audit report is cached briefly. That keeps the admin page
 * responsive while someone works through the list, and lets a SKU fix drop
 * the stale report immediately.
 *
 * Process-local on purpose: it is a UI convenience, not shared state.
 */
const TTL_MS = 60_000

let entry: { report: SmartBillAuditReport; expiresAt: number } | null = null

export const readAuditCache = (): SmartBillAuditReport | null => {
  if (!entry || entry.expiresAt <= Date.now()) {
    return null
  }
  return entry.report
}

export const writeAuditCache = (report: SmartBillAuditReport): void => {
  entry = { report, expiresAt: Date.now() + TTL_MS }
}

export const invalidateAuditCache = (): void => {
  entry = null
}
