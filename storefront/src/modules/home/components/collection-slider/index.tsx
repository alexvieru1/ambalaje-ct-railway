"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@lib/components/product/product-card"

type CollectionSliderProps = {
  title: string
  products: HttpTypes.StoreProduct[]
  handle: string
}

function useItemsPerPage() {
  const [items, setItems] = useState(4)

  useEffect(() => {
    function update() {
      setItems(window.innerWidth >= 1024 ? 4 : 1)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return items
}

export default function CollectionSlider({
  title,
  products,
  handle,
}: CollectionSliderProps) {
  const [page, setPage] = useState(0)
  const itemsPerPage = useItemsPerPage()
  const totalPages = Math.ceil(products.length / itemsPerPage)

  // Reset page when itemsPerPage changes (resize)
  useEffect(() => {
    setPage(0)
  }, [itemsPerPage])

  const next = useCallback(() => {
    setPage((p) => (p + 1) % totalPages)
  }, [totalPages])

  const prev = useCallback(() => {
    setPage((p) => (p - 1 + totalPages) % totalPages)
  }, [totalPages])

  useEffect(() => {
    if (totalPages <= 1) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [next, totalPages])

  const visibleProducts = products.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  )

  if (products.length === 0) return null

  return (
    <section className="content-container py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-ui-fg-base">{title}</h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
              aria-label="Următor"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${page}-${itemsPerPage}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-4"
        >
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === page ? "bg-[#44b74a]" : "bg-gray-300"
              }`}
              aria-label={`Pagina ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
