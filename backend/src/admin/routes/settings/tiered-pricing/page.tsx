import { defineRouteConfig } from "@medusajs/admin-sdk"
import React, { useState, useEffect, useCallback } from "react"

/* ═══════════════════════════════════════════════════════════════
   Shared helpers & constants
   ═══════════════════════════════════════════════════════════════ */

type Variant = { id: string; title: string }

type ExistingPrice = {
  amount: number
  currency_code: string
  min_quantity: number | null
  max_quantity: number | null
}

type PackagingOption = {
  label: string
  multiplier: number
}

type StandardOption = {
  label: string
  defaultMultiplier: number
  selectValues?: number[]
  enabled: boolean
  multiplier: number
}

const STANDARD_DEFAULTS: {
  label: string
  defaultMultiplier: number
  selectValues?: number[]
}[] = [
  { label: "buc", defaultMultiplier: 1 },
  { label: "set", defaultMultiplier: 10 },
  { label: "bax", defaultMultiplier: 25, selectValues: [25, 50] },
]

/** Disable scroll-to-change on number inputs */
const noScrollNumber = (e: React.WheelEvent<HTMLInputElement>) => {
  ;(e.target as HTMLInputElement).blur()
}

const INPUT =
  "w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
const INPUT_DISABLED = `${INPUT} disabled:bg-gray-100 disabled:cursor-not-allowed`
const BTN_PRIMARY =
  "inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
const BTN_DASHED =
  "inline-flex h-9 items-center justify-center rounded-md border border-dashed border-gray-300 px-4 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"

const StatusMessage = ({ message }: { message: string }) =>
  message ? (
    <p
      className={`text-sm mt-1 ${
        message.includes("succes") || message.includes("actualizat")
          ? "text-green-600"
          : "text-red-600"
      }`}
    >
      {message}
    </p>
  ) : null

/* Shared hook for fetching product + variants */
const useFetchVariants = () => {
  const [productId, setProductId] = useState("")
  const [variants, setVariants] = useState<Variant[]>([])
  const [error, setError] = useState("")

  const fetchVariants = useCallback(
    async (id?: string) => {
      const pid = id ?? productId
      if (!pid) return
      try {
        const res = await fetch(`/admin/products/${pid}`)
        if (!res.ok) throw new Error("ID produs invalid")
        const data = await res.json()
        setVariants(data.product?.variants ?? [])
        setError("")
      } catch (err: any) {
        setVariants([])
        setError(err.message || "Nu s-au putut încărca variantele.")
      }
    },
    [productId]
  )

  return { productId, setProductId, variants, fetchVariants, error }
}

/** Renders a standard packaging option row (used in both product & variant sections) */
const StandardOptionRow = ({
  opt,
  onToggle,
  onMultiplierChange,
}: {
  opt: StandardOption
  onToggle: (enabled: boolean) => void
  onMultiplierChange: (value: number) => void
}) => (
  <div
    className={`flex items-center gap-3 ${!opt.enabled ? "opacity-40" : ""}`}
  >
    <input
      type="checkbox"
      checked={opt.enabled}
      onChange={(e) => onToggle(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300 accent-blue-600"
    />
    <span className="text-sm font-medium w-10 capitalize">{opt.label}</span>
    <span className="text-xs text-gray-500">×</span>

    {opt.selectValues ? (
      <select
        className="w-24 border rounded-md px-2 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        value={opt.multiplier}
        onChange={(e) => onMultiplierChange(Number(e.target.value))}
        disabled={!opt.enabled}
      >
        {opt.selectValues.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    ) : (
      <input
        type="number"
        className="w-24 border rounded-md px-2 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        value={opt.multiplier}
        onChange={(e) =>
          onMultiplierChange(Number(e.target.value) || opt.defaultMultiplier)
        }
        onWheel={noScrollNumber}
        min={1}
        disabled={!opt.enabled}
      />
    )}
  </div>
)

/* ═══════════════════════════════════════════════════════════════
   Step 1 – Tiered Pricing
   ═══════════════════════════════════════════════════════════════ */

const TieredPricingSection = () => {
  const { productId, setProductId, variants, fetchVariants, error } =
    useFetchVariants()

  const [selectedVariant, setSelectedVariant] = useState("")
  const [price1_9, setPrice1_9] = useState("")
  const [price10_24, setPrice10_24] = useState("")
  const [price25, setPrice25] = useState("")
  const [currencyCode] = useState("ron")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const [existingPrices, setExistingPrices] = useState<ExistingPrice[]>([])
  const [loadingPrices, setLoadingPrices] = useState(false)

  const [tier1_9Enabled, setTier1_9Enabled] = useState(true)
  const [tier10_24Enabled, setTier10_24Enabled] = useState(true)
  const [tier25Enabled, setTier25Enabled] = useState(true)

  useEffect(() => {
    if (!selectedVariant) {
      setExistingPrices([])
      return
    }
    const fetchPrices = async () => {
      setLoadingPrices(true)
      try {
        const res = await fetch(
          `/admin/get-variant-prices?variant_id=${selectedVariant}`
        )
        if (!res.ok) throw new Error()
        const data = await res.json()
        setExistingPrices(data.prices ?? [])
      } catch {
        setExistingPrices([])
      } finally {
        setLoadingPrices(false)
      }
    }
    fetchPrices()
  }, [selectedVariant])

  useEffect(() => {
    setPrice1_9("")
    setPrice10_24("")
    setPrice25("")
  }, [selectedVariant])

  const getExistingPrice = (min: number, max?: number): string => {
    const match = existingPrices.find(
      (p) =>
        p.currency_code === currencyCode &&
        p.min_quantity === min &&
        (max === undefined ? p.max_quantity === null : p.max_quantity === max)
    )
    return match ? String(match.amount) : ""
  }

  useEffect(() => {
    if (!selectedVariant) return
    setTier1_9Enabled(!!getExistingPrice(1, 9))
    setTier10_24Enabled(!!getExistingPrice(10, 24))
    setTier25Enabled(!!getExistingPrice(25))
  }, [existingPrices])

  const placeholder1_9 = getExistingPrice(1, 9) || "Preț nesetat"
  const placeholder10_24 = getExistingPrice(10, 24) || "Preț nesetat"
  const placeholder25 = getExistingPrice(25) || "Preț nesetat"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const finalPrice1_9 = tier1_9Enabled
      ? price1_9 || getExistingPrice(1, 9) || null
      : null
    const finalPrice10_24 = tier10_24Enabled
      ? price10_24 || getExistingPrice(10, 24) || null
      : null
    const finalPrice25 = tier25Enabled
      ? price25 || getExistingPrice(25) || null
      : null

    if (!finalPrice1_9 && !finalPrice10_24 && !finalPrice25) {
      setMessage("Setează cel puțin un nivel de preț.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/admin/set-tiered-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          variant_id: selectedVariant,
          price_1_9: finalPrice1_9 !== null ? Number(finalPrice1_9) : null,
          price_10_24:
            finalPrice10_24 !== null ? Number(finalPrice10_24) : null,
          price_25: finalPrice25 !== null ? Number(finalPrice25) : null,
          currency_code: currencyCode,
        }),
      })
      if (!res.ok) throw new Error("Nu s-au putut seta prețurile.")
      setMessage("Prețurile au fost actualizate cu succes!")
      setPrice1_9("")
      setPrice10_24("")
      setPrice25("")
      // Refresh prices
      setTimeout(async () => {
        try {
          const res = await fetch(
            `/admin/get-variant-prices?variant_id=${selectedVariant}`
          )
          if (res.ok) {
            const data = await res.json()
            setExistingPrices(data.prices ?? [])
          }
        } catch {}
      }, 500)
    } catch (err: any) {
      setMessage(err.message || "Ceva nu a funcționat.")
    } finally {
      setLoading(false)
    }
  }

  const tiers = [
    {
      label: "Preț 1–9 buc",
      enabled: tier1_9Enabled,
      setEnabled: setTier1_9Enabled,
      value: price1_9,
      setValue: setPrice1_9,
      placeholder: placeholder1_9,
    },
    {
      label: "Preț 10–24 buc",
      enabled: tier10_24Enabled,
      setEnabled: setTier10_24Enabled,
      value: price10_24,
      setValue: setPrice10_24,
      placeholder: placeholder10_24,
    },
    {
      label: "Preț 25+ buc",
      enabled: tier25Enabled,
      setEnabled: setTier25Enabled,
      value: price25,
      setValue: setPrice25,
      placeholder: placeholder25,
    },
  ]

  return (
    <div className="divide-y bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
          1
        </span>
        <div>
          <h2 className="text-lg font-semibold">Prețuri pe Niveluri</h2>
          <p className="text-sm text-gray-500">
            Selectează produsul, varianta, apoi setează prețurile per cantitate
          </p>
        </div>
      </div>

      <form className="p-6 flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* Row 1: Product ID + Variant side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ID Produs</label>
            <input
              className={INPUT}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              onBlur={() => fetchVariants()}
              placeholder="prod_..."
              required
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Variantă</label>
            <select
              className={INPUT}
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              required
            >
              <option value="" disabled>
                Selectează
              </option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Existing prices info */}
        {loadingPrices && (
          <p className="text-xs text-gray-400">Se încarcă prețurile...</p>
        )}

        {selectedVariant && !loadingPrices && existingPrices.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
              Prețuri existente (RON)
            </p>
            <div className="flex gap-4 text-xs text-blue-600 dark:text-blue-400">
              <span>1-9: {getExistingPrice(1, 9) || "—"}</span>
              <span>10-24: {getExistingPrice(10, 24) || "—"}</span>
              <span>25+: {getExistingPrice(25) || "—"}</span>
            </div>
          </div>
        )}

        {selectedVariant && !loadingPrices && existingPrices.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Niciun preț setat pentru această variantă
            </p>
          </div>
        )}

        {/* Price tier inputs — horizontal row */}
        <div className="grid grid-cols-3 gap-3">
          {tiers.map((tier) => (
            <div
              key={tier.label}
              className={`space-y-1 ${!tier.enabled ? "opacity-40" : ""}`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={tier.enabled}
                  onChange={(e) => {
                    tier.setEnabled(e.target.checked)
                    if (!e.target.checked) tier.setValue("")
                  }}
                  className="h-3.5 w-3.5 rounded border-gray-300 accent-blue-600"
                />
                <label className="text-xs font-medium">{tier.label}</label>
              </div>
              <input
                type="number"
                className={INPUT_DISABLED}
                value={tier.value}
                onChange={(e) => tier.setValue(e.target.value)}
                onWheel={noScrollNumber}
                placeholder={tier.enabled ? tier.placeholder : "Dezactivat"}
                disabled={!tier.enabled}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || !selectedVariant}
          className={BTN_PRIMARY}
        >
          {loading ? "Se salvează..." : "Salvează Prețuri"}
        </button>

        <StatusMessage message={message} />
      </form>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Step 2 – Product-Level Packaging Options
   ═══════════════════════════════════════════════════════════════ */

const PackagingOptionsSection = () => {
  const [productId, setProductId] = useState("")
  const [standardOptions, setStandardOptions] = useState<StandardOption[]>(
    STANDARD_DEFAULTS.map((d) => ({
      ...d,
      enabled: false,
      multiplier: d.defaultMultiplier,
    }))
  )
  const [customOptions, setCustomOptions] = useState<PackagingOption[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [loadingExisting, setLoadingExisting] = useState(false)

  const fetchExistingOptions = async () => {
    if (!productId) return
    setLoadingExisting(true)
    setMessage("")
    try {
      const res = await fetch(`/admin/products/${productId}`)
      if (!res.ok) throw new Error("ID produs invalid")
      const data = await res.json()
      const metadata = data.product?.metadata

      let existing: PackagingOption[] = []
      if (metadata?.packaging_options) {
        if (typeof metadata.packaging_options === "string") {
          existing = JSON.parse(metadata.packaging_options)
        } else {
          existing = metadata.packaging_options
        }
        if (!Array.isArray(existing)) existing = []
      }

      const standardLabels = STANDARD_DEFAULTS.map((d) => d.label)
      setStandardOptions(
        STANDARD_DEFAULTS.map((d) => {
          const match = existing.find((e) => e.label === d.label)
          return {
            ...d,
            enabled: !!match,
            multiplier: match?.multiplier ?? d.defaultMultiplier,
          }
        })
      )
      setCustomOptions(
        existing.filter((e) => !standardLabels.includes(e.label))
      )
    } catch (err: any) {
      setMessage(err.message || "Nu s-a putut încărca produsul.")
    } finally {
      setLoadingExisting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const enabledStandard = standardOptions
      .filter((o) => o.enabled)
      .map((o) => ({ label: o.label, multiplier: o.multiplier }))

    const validCustom = customOptions.filter(
      (o) => o.label.trim() && o.multiplier > 0
    )
    const allOptions = [...enabledStandard, ...validCustom]

    if (allOptions.length === 0) {
      setMessage("Activează cel puțin o opțiune de ambalaj.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/admin/set-packaging-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          packaging_options: allOptions,
        }),
      })
      if (!res.ok) throw new Error("Nu s-au putut salva opțiunile.")
      setMessage("Opțiunile de ambalaj au fost salvate cu succes!")
    } catch (err: any) {
      setMessage(err.message || "Ceva nu a funcționat.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="divide-y bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
          2
        </span>
        <div>
          <h2 className="text-lg font-semibold">Ambalaj Produs (global)</h2>
          <p className="text-sm text-gray-500">
            Se aplică tuturor variantelor care nu au ambalaj propriu
          </p>
        </div>
      </div>

      <form className="p-6 flex flex-col gap-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">ID Produs</label>
          <input
            className={INPUT}
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            onBlur={fetchExistingOptions}
            placeholder="prod_..."
            required
          />
        </div>

        {loadingExisting && (
          <p className="text-xs text-gray-400">Se încarcă...</p>
        )}

        {/* Standard options */}
        <div className="space-y-2">
          {standardOptions.map((opt, i) => (
            <StandardOptionRow
              key={opt.label}
              opt={opt}
              onToggle={(enabled) =>
                setStandardOptions((prev) =>
                  prev.map((o, j) => (j === i ? { ...o, enabled } : o))
                )
              }
              onMultiplierChange={(value) =>
                setStandardOptions((prev) =>
                  prev.map((o, j) =>
                    j === i ? { ...o, multiplier: value } : o
                  )
                )
              }
            />
          ))}
        </div>

        {/* Custom options */}
        {customOptions.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs text-gray-500 font-medium">Personalizate</p>
            {customOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="flex-1 border rounded-md px-2 py-1.5 text-sm"
                  value={opt.label}
                  onChange={(e) =>
                    setCustomOptions((prev) =>
                      prev.map((o, j) =>
                        j === i ? { ...o, label: e.target.value } : o
                      )
                    )
                  }
                  placeholder="etichetă"
                />
                <span className="text-xs text-gray-500">×</span>
                <input
                  type="number"
                  className="w-20 border rounded-md px-2 py-1.5 text-sm"
                  value={opt.multiplier}
                  onChange={(e) =>
                    setCustomOptions((prev) =>
                      prev.map((o, j) =>
                        j === i
                          ? { ...o, multiplier: Number(e.target.value) || 1 }
                          : o
                      )
                    )
                  }
                  onWheel={noScrollNumber}
                  min={1}
                />
                <button
                  type="button"
                  onClick={() =>
                    setCustomOptions((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="text-red-500 text-sm px-1 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setCustomOptions((prev) => [
              ...prev,
              { label: "", multiplier: 1 },
            ])
          }
          className={BTN_DASHED}
        >
          + Adaugă opțiune personalizată
        </button>

        <button type="submit" disabled={loading} className={BTN_PRIMARY}>
          {loading ? "Se salvează..." : "Salvează Ambalaj Produs"}
        </button>

        <StatusMessage message={message} />
      </form>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Step 3 – Variant-Level Packaging Options
   ═══════════════════════════════════════════════════════════════ */

type VariantPackagingState = {
  [variantId: string]: {
    standard: StandardOption[]
    custom: PackagingOption[]
  }
}

const VariantPackagingSection = () => {
  const { productId, setProductId, variants, fetchVariants, error } =
    useFetchVariants()

  const [variantStates, setVariantStates] = useState<VariantPackagingState>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [loadingExisting, setLoadingExisting] = useState(false)

  const fetchExistingVariantPackaging = async () => {
    if (!productId) return
    setLoadingExisting(true)
    setMessage("")
    try {
      const res = await fetch(
        `/admin/products/${productId}?fields=variants.metadata,variants.title`
      )
      if (!res.ok) throw new Error("ID produs invalid")
      const data = await res.json()
      const fetchedVariants = data.product?.variants ?? []

      const standardLabels = STANDARD_DEFAULTS.map((d) => d.label)
      const states: VariantPackagingState = {}

      for (const v of fetchedVariants) {
        let existing: PackagingOption[] = []
        if (v.metadata?.packaging_options) {
          if (typeof v.metadata.packaging_options === "string") {
            try {
              existing = JSON.parse(v.metadata.packaging_options)
            } catch {}
          } else {
            existing = v.metadata.packaging_options
          }
          if (!Array.isArray(existing)) existing = []
        }

        states[v.id] = {
          standard: STANDARD_DEFAULTS.map((d) => {
            const match = existing.find(
              (e: PackagingOption) => e.label === d.label
            )
            return {
              ...d,
              enabled: !!match,
              multiplier: match?.multiplier ?? d.defaultMultiplier,
            }
          }),
          custom: existing.filter(
            (e: PackagingOption) => !standardLabels.includes(e.label)
          ),
        }
      }

      setVariantStates(states)
    } catch (err: any) {
      setMessage(err.message || "Nu s-a putut încărca produsul.")
    } finally {
      setLoadingExisting(false)
    }
  }

  useEffect(() => {
    if (variants.length > 0 && productId) {
      fetchExistingVariantPackaging()
    }
  }, [variants])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    let savedCount = 0
    let errorCount = 0

    for (const variant of variants) {
      const state = variantStates[variant.id]
      if (!state) continue

      const enabledStandard = state.standard
        .filter((o) => o.enabled)
        .map((o) => ({ label: o.label, multiplier: o.multiplier }))

      const validCustom = state.custom.filter(
        (o) => o.label.trim() && o.multiplier > 0
      )

      const allOptions = [...enabledStandard, ...validCustom]
      if (allOptions.length === 0) continue

      try {
        const res = await fetch("/admin/set-variant-packaging", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variant_id: variant.id,
            packaging_options: allOptions,
          }),
        })
        if (!res.ok) throw new Error()
        savedCount++
      } catch {
        errorCount++
      }
    }

    if (errorCount > 0) {
      setMessage(`${savedCount} salvate, ${errorCount} erori.`)
    } else if (savedCount > 0) {
      setMessage(`${savedCount} variante actualizate cu succes!`)
    } else {
      setMessage("Nicio variantă nu are opțiuni de ambalaj activate.")
    }

    setLoading(false)
  }

  return (
    <div className="divide-y bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
          3
        </span>
        <div>
          <h2 className="text-lg font-semibold">Ambalaj pe Variantă</h2>
          <p className="text-sm text-gray-500">
            Suprascrie ambalajul global per variantă (opțional)
          </p>
        </div>
      </div>

      <form className="p-6 flex flex-col gap-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">ID Produs</label>
          <input
            className={INPUT}
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            onBlur={() => fetchVariants()}
            placeholder="prod_..."
            required
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        {loadingExisting && (
          <p className="text-xs text-gray-400">Se încarcă...</p>
        )}

        {/* Per-variant cards */}
        {variants.length > 0 && Object.keys(variantStates).length > 0 && (
          <div className="space-y-4">
            {variants.map((variant) => {
              const state = variantStates[variant.id]
              if (!state) return null

              const hasAnyEnabled =
                state.standard.some((o) => o.enabled) ||
                state.custom.length > 0

              return (
                <div
                  key={variant.id}
                  className={`border rounded-md p-4 space-y-3 transition-colors ${
                    hasAnyEnabled
                      ? "border-blue-300 bg-blue-50/30 dark:bg-blue-950/20"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{variant.title}</p>
                    {!hasAnyEnabled && (
                      <span className="text-xs text-gray-400 italic">
                        moștenește de la produs
                      </span>
                    )}
                  </div>

                  {/* Standard options */}
                  <div className="space-y-2">
                    {state.standard.map((opt, i) => (
                      <StandardOptionRow
                        key={opt.label}
                        opt={opt}
                        onToggle={(enabled) =>
                          setVariantStates((prev) => ({
                            ...prev,
                            [variant.id]: {
                              ...prev[variant.id],
                              standard: prev[variant.id].standard.map((o, j) =>
                                j === i ? { ...o, enabled } : o
                              ),
                            },
                          }))
                        }
                        onMultiplierChange={(value) =>
                          setVariantStates((prev) => ({
                            ...prev,
                            [variant.id]: {
                              ...prev[variant.id],
                              standard: prev[variant.id].standard.map((o, j) =>
                                j === i ? { ...o, multiplier: value } : o
                              ),
                            },
                          }))
                        }
                      />
                    ))}
                  </div>

                  {/* Custom options for this variant */}
                  {state.custom.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      {state.custom.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            className="flex-1 border rounded-md px-2 py-1.5 text-sm"
                            value={opt.label}
                            onChange={(e) =>
                              setVariantStates((prev) => ({
                                ...prev,
                                [variant.id]: {
                                  ...prev[variant.id],
                                  custom: prev[variant.id].custom.map((o, j) =>
                                    j === i
                                      ? { ...o, label: e.target.value }
                                      : o
                                  ),
                                },
                              }))
                            }
                            placeholder="etichetă"
                          />
                          <span className="text-xs text-gray-500">×</span>
                          <input
                            type="number"
                            className="w-20 border rounded-md px-2 py-1.5 text-sm"
                            value={opt.multiplier}
                            onChange={(e) =>
                              setVariantStates((prev) => ({
                                ...prev,
                                [variant.id]: {
                                  ...prev[variant.id],
                                  custom: prev[variant.id].custom.map((o, j) =>
                                    j === i
                                      ? {
                                          ...o,
                                          multiplier:
                                            Number(e.target.value) || 1,
                                        }
                                      : o
                                  ),
                                },
                              }))
                            }
                            onWheel={noScrollNumber}
                            min={1}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setVariantStates((prev) => ({
                                ...prev,
                                [variant.id]: {
                                  ...prev[variant.id],
                                  custom: prev[variant.id].custom.filter(
                                    (_, j) => j !== i
                                  ),
                                },
                              }))
                            }
                            className="text-red-500 text-sm px-1 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setVariantStates((prev) => ({
                        ...prev,
                        [variant.id]: {
                          ...prev[variant.id],
                          custom: [
                            ...prev[variant.id].custom,
                            { label: "", multiplier: 1 },
                          ],
                        },
                      }))
                    }
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    + personalizat
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || variants.length === 0}
          className={BTN_PRIMARY}
        >
          {loading ? "Se salvează..." : "Salvează Ambalaj pe Variantă"}
        </button>

        <StatusMessage message={message} />
      </form>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */

const ProductSettingsPage = () => {
  return (
    <div className="flex flex-col gap-6 max-w-2xl pb-12">
      <div>
        <h1 className="text-xl font-semibold">Setări Produse</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configurează prețurile și ambalajul în ordinea pașilor
        </p>
      </div>
      <TieredPricingSection />
      <PackagingOptionsSection />
      <VariantPackagingSection />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Setări Produse",
})

export default ProductSettingsPage
