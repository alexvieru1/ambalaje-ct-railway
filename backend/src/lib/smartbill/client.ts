import {
  SMARTBILL_CIF,
  SMARTBILL_TOKEN,
  SMARTBILL_USERNAME,
} from 'lib/constants'

import type { SmartBillStockEntry, SmartBillStockResponse } from './types'

const SMARTBILL_API_BASE = 'https://ws.smartbill.ro/SBORO/api'

/** SmartBill has been observed taking >20s on the full stock listing. */
const DEFAULT_TIMEOUT_MS = 60_000

export class SmartBillError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
    this.name = 'SmartBillError'
  }
}

export type SmartBillClientOptions = {
  username?: string
  token?: string
  cif?: string
  timeoutMs?: number
}

/**
 * Minimal read-only client for SmartBill Cloud.
 *
 * Stateless — it holds credentials and nothing else — so it is constructed
 * where it is needed rather than registered as a Medusa module.
 */
export class SmartBillClient {
  private readonly username: string
  private readonly token: string
  private readonly cif: string
  private readonly timeoutMs: number

  constructor(options: SmartBillClientOptions = {}) {
    const username = options.username ?? SMARTBILL_USERNAME
    const token = options.token ?? SMARTBILL_TOKEN
    const cif = options.cif ?? SMARTBILL_CIF

    if (!username || !token || !cif) {
      throw new SmartBillError(
        'SmartBill credentials are missing. Set SMARTBILL_USERNAME, SMARTBILL_TOKEN and SMARTBILL_CIF.',
      )
    }

    this.username = username
    this.token = token
    this.cif = cif
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  }

  private get authHeader(): string {
    const encoded = Buffer.from(`${this.username}:${this.token}`).toString('base64')
    return `Basic ${encoded}`
  }

  private async request<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = new URL(`${SMARTBILL_API_BASE}${path}`)
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    let response: Response
    try {
      response = await fetch(url, {
        headers: {
          Authorization: this.authHeader,
          Accept: 'application/json',
        },
        signal: controller.signal,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new SmartBillError(
          `SmartBill request to ${path} timed out after ${this.timeoutMs}ms`,
        )
      }
      throw new SmartBillError(
        `SmartBill request to ${path} failed: ${(error as Error).message}`,
      )
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      // Avoid echoing a whole HTML error page into the logs.
      const body = (await response.text().catch(() => '')).slice(0, 500)
      throw new SmartBillError(
        `SmartBill responded ${response.status} for ${path}: ${body}`,
        response.status,
      )
    }

    return (await response.json()) as T
  }

  /**
   * Fetch stock for every gestiune, or a single one when `warehouseName` is
   * given. SmartBill matches the gestiune name case-sensitively.
   *
   * @param date - Stock snapshot date as `YYYY-MM-DD`. Defaults to today.
   */
  async getStock(
    warehouseName?: string,
    date: string = new Date().toISOString().slice(0, 10),
  ): Promise<SmartBillStockEntry[]> {
    const params: Record<string, string> = { cif: this.cif, date }
    if (warehouseName) {
      params.warehouseName = warehouseName
    }

    const payload = await this.request<SmartBillStockResponse>('/stocks', params)

    // SmartBill signals application errors in the body, not the status code.
    if (payload.errorText) {
      throw new SmartBillError(`SmartBill returned an error: ${payload.errorText}`)
    }

    return payload.list ?? []
  }

  /**
   * Stock for exactly one gestiune. Throws when SmartBill returns no matching
   * gestiune, which almost always means the name is misspelled or miscased.
   */
  async getWarehouseStock(
    warehouseName: string,
    date?: string,
  ): Promise<SmartBillStockEntry> {
    const list = await this.getStock(warehouseName, date)
    const entry = list.find((item) => item.warehouse?.warehouseName === warehouseName)

    if (!entry) {
      const available = list.map((item) => item.warehouse?.warehouseName).join(', ')
      throw new SmartBillError(
        `SmartBill gestiune "${warehouseName}" not found. Available: ${available || 'none'}. ` +
          'The name is case-sensitive.',
      )
    }

    return entry
  }
}
