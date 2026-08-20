import React from "react"
import { BTN_PRIMARY, Callout } from "./ui"
import { buildSavePlan, type SaveStep, type WizardDraft } from "./save-plan"
import type { Variant } from "./use-product-settings"

export type StepResult = { status: "ok" | "error"; message: string }

const describe = (step: SaveStep, variants: Variant[]): string => {
  switch (step.kind) {
    case "prices":
      return "Prețuri pe cantitate"
    case "product-packaging":
      return "Ambalaj pentru tot produsul"
    case "variant-packaging": {
      const variant = variants.find((v) => v.id === step.variantId)
      return `Ambalaj pentru varianta ${variant?.title ?? step.variantId}`
    }
  }
}

const money = (value: number | null) => (value === null ? "—" : `${value} RON`)

/**
 * Step 4 — show only what will change, then write it in one action.
 * Each step reports its own outcome so a partial failure is recoverable
 * without redoing the whole wizard.
 */
export const StepReview = ({
  draft,
  variants,
  results,
  saving,
  onSave,
}: {
  draft: WizardDraft
  variants: Variant[]
  results: Record<string, StepResult>
  saving: boolean
  onSave: (steps: SaveStep[]) => void
}) => {
  const plan = buildSavePlan(draft)
  const failed = plan.filter((s) => results[stepKey(s)]?.status === "error")
  const hasRun = Object.keys(results).length > 0

  if (plan.length === 0) {
    return (
      <Callout tone="info">
        Nu ai modificat nimic, deci nu e nimic de salvat. Folosește „Înapoi” dacă
        vrei să schimbi ceva.
      </Callout>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Se vor salva doar lucrurile de mai jos. Restul rămâne neatins.
      </p>

      <ul className="flex flex-col gap-3">
        {plan.map((step) => {
          const key = stepKey(step)
          const result = results[key]
          return (
            <li
              key={key}
              className="rounded-md border border-gray-200 dark:border-gray-700 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{describe(step, variants)}</p>
                  {step.kind === "prices" && (
                    <p className="text-xs text-gray-500 mt-1">
                      1–9: {money(step.body.price_1_9)} · 10–24:{" "}
                      {money(step.body.price_10_24)} · 25+:{" "}
                      {money(step.body.price_25)}
                    </p>
                  )}
                  {step.kind !== "prices" && (
                    <p className="text-xs text-gray-500 mt-1">
                      {step.body.packaging_options
                        .map((o) => `${o.label} = ${o.multiplier} buc`)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                {result && (
                  <span
                    className={`text-xs font-medium shrink-0 ${
                      result.status === "ok" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {result.status === "ok" ? "✓ salvat" : `✗ ${result.message}`}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {hasRun && failed.length === 0 && (
        <Callout tone="info">Gata! Toate modificările au fost salvate.</Callout>
      )}

      {failed.length > 0 && (
        <Callout tone="error">
          {failed.length === plan.length
            ? "Nu s-a salvat nimic."
            : "O parte s-a salvat, o parte nu."}{" "}
          Apasă „Reîncearcă” ca să retrimiți doar ce a eșuat.
        </Callout>
      )}

      <button
        type="button"
        className={BTN_PRIMARY}
        disabled={saving}
        onClick={() => onSave(failed.length > 0 ? failed : plan)}
      >
        {saving
          ? "Se salvează…"
          : failed.length > 0
            ? "Reîncearcă ce a eșuat"
            : "Salvează tot"}
      </button>
    </div>
  )
}

export const stepKey = (step: SaveStep): string =>
  step.kind === "variant-packaging" ? `${step.kind}:${step.variantId}` : step.kind
