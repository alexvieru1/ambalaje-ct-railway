import React, { useState } from "react"
import { BTN_GHOST, BTN_PRIMARY, INPUT } from "../product-settings/ui"
import type { AuditRow, Suggestion } from "./types"
import { KIND_META, REASON_LABEL } from "./types"
import type { AssignResult } from "./use-smartbill-audit"

const Badge = ({ kind }: { kind: AuditRow["kind"] }) => (
  <span
    className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${KIND_META[kind].tone}`}
  >
    {KIND_META[kind].label}
  </span>
)

/** A suggestion is only worth one click when we are fairly sure of it. */
const isConfident = (suggestion: Suggestion) => suggestion.score >= 0.9

/**
 * A code held by another variant is shown but not clickable: Medusa enforces
 * unique SKUs, so applying it would only produce an error. Saying who holds it
 * is the useful part — it usually means the two products are the same item.
 */
const SuggestionEntry = ({
  suggestion,
  disabled,
  onPick,
}: {
  suggestion: Suggestion
  disabled: boolean
  onPick: () => void
}) => {
  const taken = suggestion.taken_by
  const body = (
    <span className="min-w-0">
      <span className="font-mono font-medium">{suggestion.product_code}</span>
      <span className="mx-2 text-gray-400">·</span>
      <span className="text-gray-700 dark:text-gray-300">
        {suggestion.product_name}
      </span>
      <span className="mt-0.5 block text-xs text-gray-500">
        stoc SmartBill: {suggestion.quantity} · {REASON_LABEL[suggestion.reason]}
        {!taken && isConfident(suggestion) && " · potrivire foarte probabilă"}
      </span>
      {taken && (
        <span className="mt-1 block text-xs text-orange-700 dark:text-orange-400">
          Cod folosit deja de „{taken.label}”. Două produse nu pot avea acelaşi
          SKU — dacă e acelaşi articol, şterge unul dintre ele; dacă nu, cere un
          cod separat în SmartBill.
        </span>
      )}
    </span>
  )

  if (taken) {
    return (
      <div className="flex w-full items-start justify-between gap-3 rounded-md border border-orange-200 bg-orange-50/40 p-2 text-left text-sm dark:border-orange-900 dark:bg-orange-950/20">
        {body}
        <span className="shrink-0 text-xs text-gray-500">indisponibil</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      className={`flex w-full items-start justify-between gap-3 rounded-md border p-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 ${
        isConfident(suggestion)
          ? "border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {body}
      <span className="shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">
        Folosește →
      </span>
    </button>
  )
}

export const IssueRow = ({
  row,
  result,
  saving,
  onAssign,
}: {
  row: AuditRow
  result?: AssignResult
  saving: boolean
  onAssign: (sku: string) => void
}) => {
  const [manual, setManual] = useState("")
  const [showManual, setShowManual] = useState(false)

  // Quantity problems are fixed by running the sync, not by editing a SKU.
  const fixable = row.kind === "missing_sku" || row.kind === "not_in_smartbill"

  return (
    <li className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {row.product_title}
            {row.variant_title && (
              <span className="text-gray-500"> — {row.variant_title}</span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            SKU:{" "}
            {row.sku ? (
              <span className="font-mono">{row.sku}</span>
            ) : (
              <span className="italic">lipsă</span>
            )}
            {row.smartbill_name && <> · SmartBill: {row.smartbill_name}</>}
            {row.kind === "drift" && (
              <>
                {" "}
                · Medusa:{" "}
                <span className="font-medium">{row.stocked_quantity}</span> ·
                SmartBill:{" "}
                <span className="font-medium">{row.smartbill_quantity}</span>
              </>
            )}
            {row.kind === "no_level" && (
              <> · SmartBill: {row.smartbill_quantity} buc</>
            )}
          </p>
        </div>
        <Badge kind={row.kind} />
      </div>

      {result && (
        <p
          className={`text-xs ${
            result.status === "ok"
              ? "text-green-700 dark:text-green-400"
              : "text-red-700 dark:text-red-400"
          }`}
        >
          {result.message}
        </p>
      )}

      {fixable && !result && (
        <div className="flex flex-col gap-2">
          {row.suggestions.length > 0 ? (
            <>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Coduri SmartBill posibile:
              </p>
              {row.suggestions.map((suggestion) => (
                <SuggestionEntry
                  key={suggestion.product_code}
                  suggestion={suggestion}
                  disabled={saving}
                  onPick={() => onAssign(suggestion.product_code)}
                />
              ))}
            </>
          ) : (
            <p className="text-xs text-gray-500">
              Nicio sugestie automată. Caută codul în SmartBill și scrie-l mai jos.
            </p>
          )}

          {showManual ? (
            <div className="flex items-center gap-2">
              <input
                className={INPUT}
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="Cod SmartBill, ex. 449"
                disabled={saving}
                autoFocus
              />
              <button
                type="button"
                className={BTN_PRIMARY}
                disabled={saving || !manual.trim()}
                onClick={() => onAssign(manual)}
              >
                {saving ? "Se salvează…" : "Salvează"}
              </button>
              <button
                type="button"
                className={BTN_GHOST}
                disabled={saving}
                onClick={() => {
                  setShowManual(false)
                  setManual("")
                }}
              >
                Renunță
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="self-start text-xs font-medium text-blue-600 underline dark:text-blue-400"
              onClick={() => setShowManual(true)}
            >
              Scrie alt cod manual
            </button>
          )}
        </div>
      )}

      {!fixable && (
        <p className="text-xs text-gray-500">{KIND_META[row.kind].explain}</p>
      )}
    </li>
  )
}
