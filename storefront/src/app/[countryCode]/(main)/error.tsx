"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
      <h1 className="text-2xl font-semibold text-ui-fg-base">
        A apărut o eroare
      </h1>
      <p className="text-sm text-muted-foreground max-w-md">
        Ne pare rău, ceva nu a funcționat corect. Te rugăm să încerci din nou
        sau să revii la pagina principală.
      </p>
      <div className="flex gap-3 mt-2">
        <button
          onClick={reset}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[#44b74a] text-white hover:bg-[#3a9e3f] transition-colors"
        >
          Încearcă din nou
        </button>
        <LocalizedClientLink
          href="/"
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-ui-fg-base hover:bg-gray-50 transition-colors"
        >
          Pagina principală
        </LocalizedClientLink>
      </div>
    </div>
  )
}
