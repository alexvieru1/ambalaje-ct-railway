import { defineRouteConfig } from "@medusajs/admin-sdk"
import React, { useMemo, useState } from "react"
import { Callout } from "../../../components/product-settings/ui"
import { BTN_GHOST } from "../../../components/product-settings/ui"
import { IssueRow } from "../../../components/smartbill-audit/issue-row"
import { SummaryCards } from "../../../components/smartbill-audit/summary-cards"
import type { IssueKind } from "../../../components/smartbill-audit/types"
import { KIND_META } from "../../../components/smartbill-audit/types"
import { useSmartBillAudit } from "../../../components/smartbill-audit/use-smartbill-audit"

const SmartBillAuditPage = () => {
  const { report, configured, loading, error, results, savingId, reload, assignSku } =
    useSmartBillAudit()
  const [filter, setFilter] = useState<IssueKind | "all">("all")

  const rows = useMemo(() => {
    if (!report) {
      return []
    }
    return filter === "all"
      ? report.rows
      : report.rows.filter((row) => row.kind === filter)
  }, [report, filter])

  return (
    <div className="flex max-w-4xl flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Verificare SmartBill</h1>
          <p className="mt-1 text-sm text-gray-500">
            Produsele din magazin care nu se potrivesc cu SmartBill. Stocul se
            sincronizează doar când codul SKU din Medusa este identic cu codul
            produsului din SmartBill.
          </p>
        </div>
        <button
          type="button"
          className={BTN_GHOST}
          onClick={() => reload(true)}
          disabled={loading}
        >
          {loading ? "Se verifică…" : "Verifică din nou"}
        </button>
      </div>

      {error && <Callout tone="error">{error}</Callout>}

      {loading && !report && (
        <p className="text-sm text-gray-500">
          Se citește catalogul din SmartBill… poate dura câteva secunde.
        </p>
      )}

      {configured && report && (
        <>
          <SummaryCards
            summary={report.summary}
            filter={filter}
            onFilter={setFilter}
          />

          <p className="text-xs text-gray-500">
            Gestiune <span className="font-medium">{report.warehouse}</span> ·{" "}
            {report.summary.smartbill_products} produse în SmartBill, dintre care{" "}
            {report.summary.smartbill_only} nu există în magazin · verificat la{" "}
            {new Date(report.checked_at).toLocaleTimeString("ro-RO")}
          </p>

          {filter !== "all" && (
            <Callout tone="info">{KIND_META[filter].explain}</Callout>
          )}

          {report.rows.length === 0 ? (
            <Callout tone="info">
              Toate cele {report.summary.in_sync} produse din magazin sunt
              corelate corect cu SmartBill. Nu e nimic de reparat.
            </Callout>
          ) : rows.length === 0 ? (
            <Callout tone="info">
              Nicio problemă de acest tip. Alege altă categorie de mai sus.
            </Callout>
          ) : (
            <ul className="divide-y overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              {rows.map((row) => (
                <IssueRow
                  key={row.variant_id}
                  row={row}
                  result={results[row.variant_id]}
                  saving={savingId === row.variant_id}
                  onAssign={(sku) => assignSku(row.variant_id, sku)}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Verificare SmartBill",
})

export default SmartBillAuditPage
