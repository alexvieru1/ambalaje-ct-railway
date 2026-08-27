import type { SmartBillStockProduct } from './types'

/**
 * Suggest SmartBill products that probably correspond to a Medusa variant.
 *
 * Catalogue names are written by hand on both sides and rarely agree
 * ("Platformă tort rotundă argintie 25" vs "PLANSETA TORT ARGINT D25"), so the
 * comparison is token-based rather than literal, with dimensions and other
 * numbers weighted heavily — in packaging they are the part that actually
 * identifies the item.
 */

const DIACRITICS: Record<string, string> = {
  Ă: 'A', Â: 'A', Î: 'I', Ș: 'S', Ş: 'S', Ț: 'T', Ţ: 'T', À: 'A', É: 'E', È: 'E',
}

/** Words that carry no identifying signal in Romanian packaging names. */
const STOPWORDS = new Set([
  'DE', 'CU', 'PENTRU', 'SI', 'LA', 'DIN', 'UN', 'O', 'SET', 'BUC', 'BAX', 'ROL', 'CUT',
])

export function normalize(value: string): string {
  return value
    .toUpperCase()
    .replace(/[ĂÂÎȘŞȚŢÀÉÈ]/g, (char) => DIACRITICS[char] ?? char)
}

/**
 * Split a name into comparable tokens. Runs of digits are kept as their own
 * tokens so `24X44` contributes `24` and `44` and can match a variant titled
 * "24x44".
 */
export function tokenize(value: string): string[] {
  const normalized = normalize(value)
  const tokens: string[] = []

  for (const raw of normalized.split(/[^A-Z0-9]+/)) {
    if (!raw) {
      continue
    }
    // Split mixed alphanumerics such as "25ST" or "D00" into their parts.
    for (const part of raw.split(/(?<=\D)(?=\d)|(?<=\d)(?=\D)/)) {
      if (part.length < 2 && !/^\d+$/.test(part)) {
        continue
      }
      if (STOPWORDS.has(part)) {
        continue
      }
      tokens.push(part)
    }
  }

  return tokens
}

const isNumeric = (token: string) => /^\d+$/.test(token)

/**
 * Weighted Dice coefficient in [0, 1]. Numeric tokens count double because a
 * shared dimension is far more telling than a shared word like "CUTIE".
 */
export function similarity(left: string[], right: string[]): number {
  if (!left.length || !right.length) {
    return 0
  }

  const weigh = (token: string) => (isNumeric(token) ? 2 : 1)
  const rightCounts = new Map<string, number>()
  for (const token of right) {
    rightCounts.set(token, (rightCounts.get(token) ?? 0) + 1)
  }

  let shared = 0
  for (const token of left) {
    const available = rightCounts.get(token) ?? 0
    if (available > 0) {
      rightCounts.set(token, available - 1)
      shared += weigh(token)
    }
  }

  const total =
    left.reduce((sum, token) => sum + weigh(token), 0) +
    right.reduce((sum, token) => sum + weigh(token), 0)

  return (2 * shared) / total
}

/** Why a product was suggested, so the UI can explain itself. */
export type SuggestionReason = 'code' | 'name' | 'code+name'

export type SmartBillSuggestion = {
  product_code: string
  product_name: string
  quantity: number
  /** Rounded to three decimals so the payload stays readable. */
  score: number
  reason: SuggestionReason
}

/** Levenshtein distance, capped — only tiny distances interest us. */
export function editDistance(left: string, right: string, cap = 2): number {
  if (Math.abs(left.length - right.length) > cap) {
    return cap + 1
  }

  let previous = Array.from({ length: right.length + 1 }, (_, i) => i)

  for (let i = 1; i <= left.length; i++) {
    const current = [i]
    for (let j = 1; j <= right.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      )
    }
    previous = current
  }

  return previous[right.length]
}

/**
 * How close a SmartBill code is to the SKU already on the variant.
 *
 * This catches the dominant real-world failure: a code typed with an extra
 * digit on the end (`4499` for `449`, `10600` for `1060`). A near-miss on the
 * code is much stronger evidence than a near-miss on the name, so it scores
 * higher.
 */
export function codeSimilarity(sku: string, code: string): number {
  const a = sku.trim().toUpperCase()
  const b = code.trim().toUpperCase()

  if (!a || !b || a === b) {
    return 0
  }

  // One is the other with characters appended — the classic typo.
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a]
  if (longer.startsWith(shorter)) {
    const extra = longer.length - shorter.length
    if (extra === 1) return 0.95
    if (extra === 2) return 0.75
    return 0
  }

  return editDistance(a, b) === 1 ? 0.85 : 0
}

export type SuggestionIndex = {
  product: SmartBillStockProduct
  tokens: string[]
}[]

/**
 * Tokenize the SmartBill catalogue once, then reuse it for every variant —
 * the catalogue is ~1900 products and re-tokenizing per variant is wasteful.
 */
export function buildSuggestionIndex(products: SmartBillStockProduct[]): SuggestionIndex {
  return products.map((product) => ({
    product,
    tokens: tokenize(product.productName ?? ''),
  }))
}

/** Below this the "suggestions" are noise and hurt more than they help. */
const MIN_SCORE = 0.3

export type SuggestOptions = {
  /** The SKU currently on the variant, when it has one worth comparing. */
  sku?: string | null
  limit?: number
}

/**
 * Rank SmartBill products against a variant, using both its title and the SKU
 * already recorded on it. A candidate backed by both signals outranks one
 * backed by either alone.
 */
export function suggestSmartBillMatches(
  title: string,
  index: SuggestionIndex,
  options: SuggestOptions = {},
): SmartBillSuggestion[] {
  const { sku = null, limit = 3 } = options
  const tokens = tokenize(title)

  if (!tokens.length && !sku) {
    return []
  }

  const scored: SmartBillSuggestion[] = []

  for (const entry of index) {
    const nameScore = tokens.length ? similarity(tokens, entry.tokens) : 0
    const codeScore = sku ? codeSimilarity(sku, entry.product.productCode ?? '') : 0

    if (nameScore < MIN_SCORE && codeScore === 0) {
      continue
    }

    // Both signals agreeing is the strongest evidence available, so nudge it
    // above anything supported by a single signal. A near-miss code whose name
    // says otherwise is damped instead: in a catalogue of ~1900 sequential
    // codes, plenty of unrelated products sit one digit apart.
    const combined =
      codeScore > 0 && nameScore >= MIN_SCORE
        ? Math.min(1, Math.max(codeScore, nameScore) + 0.1)
        : codeScore > 0
          ? codeScore * 0.7
          : nameScore

    const reason: SuggestionReason =
      codeScore > 0 && nameScore >= MIN_SCORE ? 'code+name' : codeScore > 0 ? 'code' : 'name'

    scored.push({
      product_code: entry.product.productCode,
      product_name: entry.product.productName,
      quantity: entry.product.quantity,
      score: Math.round(combined * 1000) / 1000,
      reason,
    })
  }

  return scored
    .sort((a, b) => b.score - a.score || a.product_code.localeCompare(b.product_code))
    .slice(0, limit)
}
