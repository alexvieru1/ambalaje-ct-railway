import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "404 | Ambalaje Constanța",
  description: "Pagina nu a fost găsită sau a fost mutată.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-64px)] px-6">
      <h1 className="text-5xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Pagina nu a fost găsită</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Ne pare rău, dar pagina pe care o cauți nu există sau a fost mutată.
        Verifică adresa introdusă sau întoarce-te la pagina principală.
      </p>
      <LocalizedClientLink href="/" className="text-white bg-[#44b74a] hover:bg-[#3ca042] px-6 py-3 rounded-md font-medium transition-colors" aria-label="Înapoi la prima pagină">
        Înapoi la prima pagină
      </LocalizedClientLink>
    </div>
  )
}
