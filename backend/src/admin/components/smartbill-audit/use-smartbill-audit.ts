import { useCallback, useEffect, useState } from "react"
import type { AuditReport, AuditResponse } from "./types"

export type AssignResult = { status: "ok" | "error"; message: string }

export const useSmartBillAudit = () => {
  const [report, setReport] = useState<AuditReport | null>(null)
  const [configured, setConfigured] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  /** Keyed by variant id, so each row can show its own outcome. */
  const [results, setResults] = useState<Record<string, AssignResult>>({})
  const [savingId, setSavingId] = useState("")

  const load = useCallback(async (refresh = false) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(
        `/admin/smartbill-audit${refresh ? "?refresh=1" : ""}`
      )
      const data: AuditResponse = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Verificarea nu a funcționat.")
      }

      setConfigured(data.configured)
      setReport(data.report)
      if (!data.configured && data.message) {
        setError(data.message)
      }
    } catch (err: any) {
      setError(err.message || "Verificarea nu a funcționat.")
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  /**
   * Assign a SmartBill code to a variant, then drop that row from the report
   * locally. Re-fetching the whole report after every fix would cost a full
   * SmartBill round-trip and lose the user's scroll position.
   */
  const assignSku = useCallback(async (variantId: string, sku: string) => {
    const trimmed = sku.trim()
    if (!trimmed) {
      return
    }

    setSavingId(variantId)
    try {
      const res = await fetch("/admin/smartbill-audit/assign-sku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: variantId, sku: trimmed }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Codul nu a putut fi salvat.")
      }

      setResults((prev) => ({
        ...prev,
        [variantId]: {
          status: "ok",
          message: `Salvat: ${trimmed}${
            data.smartbill_name ? ` — ${data.smartbill_name}` : ""
          }`,
        },
      }))
      setReport((prev) =>
        prev
          ? {
              ...prev,
              rows: prev.rows.filter((row) => row.variant_id !== variantId),
            }
          : prev
      )
    } catch (err: any) {
      setResults((prev) => ({
        ...prev,
        [variantId]: {
          status: "error",
          message: err.message || "Codul nu a putut fi salvat.",
        },
      }))
    } finally {
      setSavingId("")
    }
  }, [])

  return {
    report,
    configured,
    loading,
    error,
    results,
    savingId,
    reload: load,
    assignSku,
  }
}
