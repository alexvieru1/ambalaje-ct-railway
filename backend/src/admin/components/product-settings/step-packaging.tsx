import React, { useState } from "react"
import { BTN_DASHED, Callout, Hint, INPUT, noScrollNumber } from "./ui"
import type { PackagingDraft } from "./save-plan"
import type { Variant } from "./use-product-settings"

/** "1 bax = 25 bucăți" reads better than "bax × 25" for non-technical staff. */
const explain = (label: string, multiplier: number) =>
  multiplier === 1
    ? `1 ${label} = 1 bucată`
    : `1 ${label} = ${multiplier} bucăți`

const PackagingEditor = ({
  draft,
  onChange,
}: {
  draft: PackagingDraft
  onChange: (next: PackagingDraft) => void
}) => (
  <div className="flex flex-col gap-3">
    {draft.standard.map((option, i) => (
      <div
        key={option.label}
        className={`flex items-center gap-3 ${option.enabled ? "" : "opacity-60"}`}
      >
        <input
          type="checkbox"
          checked={option.enabled}
          onChange={(e) =>
            onChange({
              ...draft,
              standard: draft.standard.map((o, j) =>
                j === i ? { ...o, enabled: e.target.checked } : o
              ),
            })
          }
          className="h-4 w-4 rounded border-gray-300 accent-blue-600"
        />
        <span className="text-sm font-medium w-12 capitalize">{option.label}</span>
        <input
          type="number"
          min={1}
          className="w-24 border rounded-md px-2 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-900 dark:border-gray-700"
          value={option.multiplier}
          disabled={!option.enabled}
          onWheel={noScrollNumber}
          onChange={(e) =>
            onChange({
              ...draft,
              standard: draft.standard.map((o, j) =>
                j === i
                  ? { ...o, multiplier: Number(e.target.value) || o.defaultMultiplier }
                  : o
              ),
            })
          }
        />
        <span className="text-xs text-gray-500">
          {option.enabled ? explain(option.label, option.multiplier) : "neactivat"}
        </span>
      </div>
    ))}

    {draft.custom.map((option, i) => (
      <div key={`custom-${i}`} className="flex items-center gap-3">
        <span className="h-4 w-4" />
        <input
          className="w-28 border rounded-md px-2 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
          value={option.label}
          placeholder="nume ambalaj"
          onChange={(e) =>
            onChange({
              ...draft,
              custom: draft.custom.map((o, j) =>
                j === i ? { ...o, label: e.target.value } : o
              ),
            })
          }
        />
        <input
          type="number"
          min={1}
          className="w-24 border rounded-md px-2 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
          value={option.multiplier}
          onWheel={noScrollNumber}
          onChange={(e) =>
            onChange({
              ...draft,
              custom: draft.custom.map((o, j) =>
                j === i ? { ...o, multiplier: Number(e.target.value) || 0 } : o
              ),
            })
          }
        />
        <span className="text-xs text-gray-500 flex-1">
          {option.label.trim() && option.multiplier > 0
            ? explain(option.label.trim(), option.multiplier)
            : "completează numele și cantitatea"}
        </span>
        <button
          type="button"
          className="text-xs text-red-600 underline"
          onClick={() =>
            onChange({ ...draft, custom: draft.custom.filter((_, j) => j !== i) })
          }
        >
          Șterge
        </button>
      </div>
    ))}

    <button
      type="button"
      className={BTN_DASHED}
      onClick={() =>
        onChange({ ...draft, custom: [...draft.custom, { label: "", multiplier: 1 }] })
      }
    >
      + Adaugă alt tip de ambalaj
    </button>
  </div>
)

/**
 * Step 3 — packaging. Product-level settings are the common case, so
 * per-variant overrides stay collapsed until asked for.
 */
export const StepPackaging = ({
  productPackaging,
  setProductPackaging,
  markProductTouched,
  variants,
  variantPackaging,
  setVariantPackaging,
  markVariantTouched,
}: {
  productPackaging: PackagingDraft
  setProductPackaging: (next: PackagingDraft) => void
  markProductTouched: () => void
  variants: Variant[]
  variantPackaging: Record<string, PackagingDraft>
  setVariantPackaging: (next: Record<string, PackagingDraft>) => void
  markVariantTouched: () => void
}) => {
  const [showOverrides, setShowOverrides] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-medium mb-1">
          Cum se vinde acest produs?
        </h3>
        <Hint>
          Bifează formele în care clientul poate cumpăra și spune câte bucăți
          intră în fiecare. Se aplică tuturor variantelor.
        </Hint>
        <div className="mt-3">
          <PackagingEditor
            draft={productPackaging}
            onChange={(next) => {
              setProductPackaging(next)
              markProductTouched()
            }}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <button
          type="button"
          className="text-sm font-medium text-blue-600 underline"
          onClick={() => setShowOverrides((v) => !v)}
        >
          {showOverrides ? "Ascunde" : "Setări diferite pentru o anumită variantă"}
        </button>
        <Hint>
          Majoritatea produselor nu au nevoie de asta. Folosește doar dacă o
          variantă se ambalează altfel.
        </Hint>

        {showOverrides && (
          <div className="mt-4 flex flex-col gap-5">
            {variants.length === 0 && (
              <Callout tone="info">Acest produs nu are variante.</Callout>
            )}
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="rounded-md border border-gray-200 dark:border-gray-700 p-3"
              >
                <p className="text-sm font-medium mb-2">{variant.title}</p>
                <PackagingEditor
                  draft={
                    variantPackaging[variant.id] ?? {
                      standard: productPackaging.standard.map((o) => ({
                        ...o,
                        enabled: false,
                      })),
                      custom: [],
                    }
                  }
                  onChange={(next) => {
                    setVariantPackaging({ ...variantPackaging, [variant.id]: next })
                    markVariantTouched()
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
