import React, { useEffect, useRef, useState } from "react"
import { Callout, Hint, INPUT } from "./ui"
import type { ProductSummary } from "./use-product-settings"

/**
 * Step 1 — find a product by typing its name.
 * Replaces the old "paste prod_..." field, which required digging the id out
 * of another page's URL.
 */
export const ProductPicker = ({
  selected,
  onSelect,
  onClear,
  loading,
  loadError,
}: {
  selected: ProductSummary | null
  onSelect: (product: ProductSummary) => void
  onClear: () => void
  loading: boolean
  loadError: string
}) => {
  const [term, setTerm] = useState("")
  const [results, setResults] = useState<ProductSummary[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const requestId = useRef(0)

  useEffect(() => {
    const query = term.trim()
    if (selected || query.length < 2) {
      setResults([])
      setSearchError("")
      return
    }

    const id = ++requestId.current
    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/admin/products?q=${encodeURIComponent(query)}&limit=10`
        )
        if (!res.ok) {
          throw new Error("Căutarea nu a funcționat. Încearcă din nou.")
        }
        const data = await res.json()
        // Ignore responses that arrived after a newer keystroke.
        if (id !== requestId.current) {
          return
        }
        setResults(data.products ?? [])
        setSearchError("")
      } catch (err: any) {
        if (id === requestId.current) {
          setSearchError(err.message || "Căutarea nu a funcționat.")
          setResults([])
        }
      } finally {
        if (id === requestId.current) {
          setSearching(false)
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [term, selected])

  if (selected) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-md border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-3">
          {selected.thumbnail ? (
            <img
              src={selected.thumbnail}
              alt=""
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              {selected.title}
            </p>
            <p className="text-xs text-green-700 dark:text-green-400">
              Produs selectat
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setTerm("")
              onClear()
            }}
            className="text-sm font-medium text-green-800 dark:text-green-300 underline"
          >
            Schimbă
          </button>
        </div>
        {loading && (
          <p className="text-sm text-gray-500">Se încarcă setările produsului…</p>
        )}
        {loadError && <Callout tone="error">{loadError}</Callout>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">
          Ce produs vrei să configurezi?
        </label>
        <input
          className={INPUT}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Scrie numele produsului, ex. cutie carton"
          autoFocus
        />
        <Hint>
          Scrie cel puțin 2 litere din numele produsului. Nu ai nevoie de niciun cod.
        </Hint>
      </div>

      {searching && <p className="text-sm text-gray-500">Se caută…</p>}
      {searchError && <Callout tone="error">{searchError}</Callout>}

      {!searching && term.trim().length >= 2 && results.length === 0 && !searchError && (
        <Callout tone="warn">
          Niciun produs găsit pentru „{term.trim()}”. Verifică scrierea sau
          încearcă doar un cuvânt din denumire.
        </Callout>
      )}

      {results.length > 0 && (
        <ul className="divide-y rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          {results.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => onSelect(product)}
                className="flex w-full items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt=""
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700" />
                )}
                <span className="text-sm font-medium">{product.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
