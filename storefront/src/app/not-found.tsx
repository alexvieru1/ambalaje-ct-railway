import { Metadata } from "next"
import Link from "next/link"
import { IconArrowRight } from "@tabler/icons-react"

export const metadata: Metadata = {
  title: "404 - Pagina nu a fost găsită",
  description: "Pagina pe care ai încercat să o accesezi nu există.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
      <h1 className="text-2xl font-semibold text-ui-fg-base">
        Pagina nu a fost găsită
      </h1>
      <p className="text-sm text-muted-foreground">
        Pagina pe care ai încercat să o accesezi nu există.
      </p>
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#44b74a] hover:text-[#3a9e3f] transition-colors"
        href="/"
      >
        Mergi la pagina principală
        <IconArrowRight size={16} stroke={2} />
      </Link>
    </div>
  )
}
