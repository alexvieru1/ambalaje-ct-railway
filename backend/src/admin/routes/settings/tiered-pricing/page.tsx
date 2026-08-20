import { defineRouteConfig } from "@medusajs/admin-sdk"
import React, { useEffect, useState } from "react"
import { ProductPicker } from "../../../components/product-settings/product-picker"
import { StepPrices } from "../../../components/product-settings/step-prices"
import { StepPackaging } from "../../../components/product-settings/step-packaging"
import {
  StepReview,
  stepKey,
  type StepResult,
} from "../../../components/product-settings/step-review"
import { useProductSettings } from "../../../components/product-settings/use-product-settings"
import type { SaveStep } from "../../../components/product-settings/save-plan"
import { BTN_GHOST, BTN_PRIMARY } from "../../../components/product-settings/ui"

const STEPS = ["Produs", "Prețuri", "Ambalaj", "Verifică"] as const

const ProductSettingsPage = () => {
  const [step, setStep] = useState(0)
  const [results, setResults] = useState<Record<string, StepResult>>({})
  const [saving, setSaving] = useState(false)
  const settings = useProductSettings()

  const {
    product,
    variants,
    variantId,
    loading,
    loadError,
    tiers,
    setTiers,
    setPricesTouched,
    productPackaging,
    setProductPackaging,
    setProductPackagingTouched,
    variantPackaging,
    setVariantPackaging,
    setVariantPackagingTouched,
    selectProduct,
    selectVariant,
    reset,
    draft,
  } = settings

  const hasChanges =
    draft.pricesTouched ||
    draft.productPackagingTouched ||
    draft.variantPackagingTouched

  // Guard against losing edits to an accidental refresh or tab close.
  useEffect(() => {
    if (!hasChanges) {
      return
    }
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [hasChanges])

  const runSave = async (steps: SaveStep[]) => {
    setSaving(true)
    for (const s of steps) {
      try {
        const res = await fetch(s.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(s.body),
        })
        if (!res.ok) {
          throw new Error("nu s-a putut salva")
        }
        setResults((prev) => ({
          ...prev,
          [stepKey(s)]: { status: "ok", message: "" },
        }))
      } catch (err: any) {
        setResults((prev) => ({
          ...prev,
          [stepKey(s)]: {
            status: "error",
            message: err.message || "eroare",
          },
        }))
      }
    }
    setSaving(false)
  }

  const startOver = () => {
    reset()
    setResults({})
    setStep(0)
  }

  const canContinue = step === 0 ? !!product && !loading : true

  return (
    <div className="flex flex-col gap-6 max-w-2xl pb-12">
      <div>
        <h1 className="text-xl font-semibold">Setări Produse</h1>
        <p className="text-sm text-gray-500 mt-1">
          Te ghidez pas cu pas prin prețuri și ambalaj. Nimic nu se salvează
          până la ultimul pas.
        </p>
      </div>

      {/* Progress */}
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2 flex-1">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i < step
                  ? "bg-green-600 text-white"
                  : i === step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span
              className={`text-xs ${i === step ? "font-medium" : "text-gray-500"}`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            )}
          </li>
        ))}
      </ol>

      <div className="rounded-lg bg-white dark:bg-gray-900 shadow-sm p-6">
        <p className="text-xs text-gray-500 mb-4">
          Pasul {step + 1} din {STEPS.length}
        </p>

        {step === 0 && (
          <ProductPicker
            selected={product}
            onSelect={selectProduct}
            onClear={startOver}
            loading={loading}
            loadError={loadError}
          />
        )}

        {step === 1 && (
          <StepPrices
            variants={variants}
            variantId={variantId}
            onSelectVariant={selectVariant}
            tiers={tiers}
            setTiers={setTiers}
            markTouched={() => setPricesTouched(true)}
          />
        )}

        {step === 2 && (
          <StepPackaging
            productPackaging={productPackaging}
            setProductPackaging={setProductPackaging}
            markProductTouched={() => setProductPackagingTouched(true)}
            variants={variants}
            variantPackaging={variantPackaging}
            setVariantPackaging={setVariantPackaging}
            markVariantTouched={() => setVariantPackagingTouched(true)}
          />
        )}

        {step === 3 && (
          <StepReview
            draft={draft}
            variants={variants}
            results={results}
            saving={saving}
            onSave={runSave}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className={BTN_GHOST}
          onClick={() => (step === 0 ? startOver() : setStep((s) => s - 1))}
          disabled={step === 0 && !product}
        >
          {step === 0 ? "Începe din nou" : "← Înapoi"}
        </button>

        <div className="flex items-center gap-2">
          {(step === 1 || step === 2) && (
            <button
              type="button"
              className={BTN_GHOST}
              onClick={() => setStep((s) => s + 1)}
            >
              Sari peste
            </button>
          )}
          {step < STEPS.length - 1 && (
            <button
              type="button"
              className={BTN_PRIMARY}
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue}
            >
              Continuă →
            </button>
          )}
          {step === STEPS.length - 1 && (
            <button type="button" className={BTN_GHOST} onClick={startOver}>
              Configurează alt produs
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Setări Produse",
})

export default ProductSettingsPage
