// src/admin/routes/settings/tiered-pricing/page.tsx
import { defineRouteConfig } from "@medusajs/admin-sdk"
import React, { useState } from "react"

const TieredPricingPage = () => {
  const [productId, setProductId] = useState("")
  const [variants, setVariants] = useState<{ id: string; title: string }[]>([])
  const [selectedVariant, setSelectedVariant] = useState("")
  const [price1_9, setPrice1_9] = useState("")
  const [price10_24, setPrice10_24] = useState("")
  const [price25, setPrice25] = useState("")
  const [currencyCode, setCurrencyCode] = useState("ron")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  /* ───────────────────────── helpers ───────────────────────── */

  const fetchVariants = async () => {
    if (!productId) return
    try {
      const res = await fetch(`/admin/products/${productId}`)
      if (!res.ok) throw new Error("Invalid Product ID")
      const data = await res.json()
      setVariants(data.product?.variants ?? [])
      setMessage("")
    } catch (err: any) {
      setVariants([])
      setMessage(err.message || "Failed to load variants.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/admin/set-tiered-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          variant_id: selectedVariant,
          price_1_9: Number(price1_9),
          price_10_24: Number(price10_24),
          price_25: Number(price25),
          currency_code: currencyCode,
        }),
      })
      if (!res.ok) throw new Error("Failed to set prices.")
      setMessage("✅ Prices updated successfully.")
    } catch (err: any) {
      setMessage(err.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  /* ───────────────────────── markup ───────────────────────── */

  return (
    <div className="divide-y bg-white dark:bg-gray-900 rounded-md shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-semibold">Tiered Pricing Settings</h1>
      </div>

      <form
        className="p-6 flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        {/* product id */}
        <div>
          <label className="block text-sm font-medium mb-1">Product ID</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            onBlur={fetchVariants}
            required
          />
        </div>

        {/* variant */}
        <div>
          <label className="block text-sm font-medium mb-1">Variant</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            required
          >
            <option value="" disabled>Select a variant</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>
        </div>

        {/* prices */}
        <div>
          <label className="block text-sm font-medium mb-1">Price for 1–9</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm"
            value={price1_9}
            onChange={(e) => setPrice1_9(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price for 10–24</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm"
            value={price10_24}
            onChange={(e) => setPrice10_24(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price for 25+</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm"
            value={price25}
            onChange={(e) => setPrice25(e.target.value)}
            required
          />
        </div>

        {/* currency */}
        <div>
          <label className="block text-sm font-medium mb-1">Currency Code</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value)}
            required
          />
        </div>

        {/* submit */}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Set Tiered Prices"}
        </button>

        {message && (
          <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">{message}</p>
        )}
      </form>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Tiered Pricing",
})

export default TieredPricingPage
