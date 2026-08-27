/**
 * Mirrors the payload of `GET /admin/smartbill-audit`. Kept as a standalone
 * declaration because the admin bundle is compiled separately from the server
 * and cannot import from `src/lib`.
 */

export type SuggestionReason = "code" | "name" | "code+name"

export type Suggestion = {
  product_code: string
  product_name: string
  quantity: number
  score: number
  reason: SuggestionReason
  /**
   * Set when another variant already uses this code. Medusa enforces unique
   * SKUs, so such a suggestion cannot be applied in one click.
   */
  taken_by: { variant_id: string; label: string } | null
}

export type IssueKind = "missing_sku" | "not_in_smartbill" | "drift" | "no_level"

export type AuditRow = {
  variant_id: string
  product_id: string
  product_title: string
  variant_title: string
  sku: string | null
  stocked_quantity: number | null
  kind: IssueKind
  smartbill_quantity: number | null
  smartbill_name: string | null
  suggestions: Suggestion[]
}

export type AuditSummary = {
  total_variants: number
  in_sync: number
  missing_sku: number
  not_in_smartbill: number
  drift: number
  no_level: number
  smartbill_products: number
  smartbill_only: number
}

export type AuditReport = {
  warehouse: string
  location_id: string
  checked_at: string
  summary: AuditSummary
  rows: AuditRow[]
}

export type AuditResponse = {
  configured: boolean
  cached?: boolean
  message?: string
  report: AuditReport | null
}

/** Romanian labels and colour treatment for each issue kind. */
export const KIND_META: Record<
  IssueKind,
  { label: string; short: string; tone: string; explain: string }
> = {
  missing_sku: {
    label: "Fără cod SKU",
    short: "Fără SKU",
    tone: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    explain:
      "Produsul nu are niciun cod SKU, deci nu poate fi corelat cu SmartBill. Stocul lui nu se sincronizează.",
  },
  not_in_smartbill: {
    label: "Codul nu există în SmartBill",
    short: "Lipsă în SmartBill",
    tone: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    explain:
      "Produsul are un SKU, dar niciun produs din SmartBill nu are acest cod. Cel mai des e o greșeală de tastare.",
  },
  no_level: {
    label: "Fără stoc configurat",
    short: "Fără stoc",
    tone: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    explain:
      "Codul este corelat, dar produsul nu are încă o înregistrare de stoc în locația SmartBill. Se rezolvă la următoarea sincronizare.",
  },
  drift: {
    label: "Cantități diferite",
    short: "Diferență stoc",
    tone: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    explain:
      "Codul este corelat, dar cantitatea din Medusa diferă de cea din SmartBill. Se rezolvă la următoarea sincronizare.",
  },
}

export const REASON_LABEL: Record<SuggestionReason, string> = {
  code: "cod asemănător",
  name: "denumire asemănătoare",
  "code+name": "cod și denumire",
}
